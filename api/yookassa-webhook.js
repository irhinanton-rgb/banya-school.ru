import https from 'https';
import { broadcastToAdmins, escapeHtml } from './telegram-notifier.js';
import { getOrder, updateOrder, grantPaidEntitlement } from '../server/firebase-admin-rest.js';

const YOOKASSA_SHOP_ID = process.env.YOOKASSA_SHOP_ID;
const YOOKASSA_SECRET_KEY = process.env.YOOKASSA_SECRET_KEY;

/**
 * Verify payment status directly from YooKassa API so spoofed webhook POST requests are rejected.
 */
function fetchVerifiedPayment(paymentId) {
  if (!YOOKASSA_SHOP_ID || !YOOKASSA_SECRET_KEY) {
    console.error('YooKassa credentials are not configured.');
    return Promise.resolve(null);
  }
  return new Promise((resolve) => {
    if (!paymentId || typeof paymentId !== 'string' || !/^[a-zA-Z0-9_-]{10,64}$/.test(paymentId)) {
      return resolve(null);
    }
    const authHeader = 'Basic ' + Buffer.from(`${YOOKASSA_SHOP_ID}:${YOOKASSA_SECRET_KEY}`).toString('base64');
    const request = https.request(
      {
        hostname: 'api.yookassa.ru',
        path: `/v3/payments/${encodeURIComponent(paymentId)}`,
        method: 'GET',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
      },
      (resp) => {
        let data = '';
        resp.on('data', (c) => { data += c; });
        resp.on('end', () => {
          try {
            if (resp.statusCode >= 200 && resp.statusCode < 300) {
              resolve(JSON.parse(data));
            } else {
              resolve(null);
            }
          } catch {
            resolve(null);
          }
        });
      }
    );
    request.on('error', () => resolve(null));
    request.end();
  });
}

async function notifySuccessfulPayment(order, payment, metadata) {
  if (order.telegramNotifiedAt) return true;
  const amountVal = payment?.amount?.value || order.amount;
  const currency = payment?.amount?.currency || order.currency;
  const message = [
    `🎉 <b>[ЮKassa] ОПЛАТА КУРСА ПОДТВЕРЖДЕНА!</b>`,
    ` `,
    `💰 <b>Сумма:</b> ${escapeHtml(amountVal)} ${escapeHtml(currency)}`,
    `🎓 <b>Тариф:</b> «Мастер Пара PRO»`,
    metadata?.userName ? `👤 <b>Ученик:</b> ${escapeHtml(metadata.userName)}` : null,
    (metadata?.userEmail || order.userEmail) ? `📧 <b>Email:</b> ${escapeHtml(metadata?.userEmail || order.userEmail)}` : null,
    `🧾 <b>Номер заказа:</b> <code>${escapeHtml(order.orderId)}</code>`,
    `🧾 <b>ID платежа ЮKassa:</b> <code>${escapeHtml(payment.id)}</code>`,
    payment?.description ? `📝 <b>Назначение:</b> ${escapeHtml(payment.description)}` : null,
    `🕒 <b>Время:</b> ${new Date().toLocaleString('ru-RU')}`,
    ` `,
    `✅ <i>Платёж сверён с заказом; доступ к курсу выдан.</i>`,
  ].filter(Boolean).join('\\n');
  const results = await broadcastToAdmins(message);
  const delivered = results.length > 0 && results.every((result) => result?.ok === true);
  if (!delivered) return false;
  await updateOrder(order.orderId, { telegramNotifiedAt: new Date().toISOString() });
  order.telegramNotifiedAt = new Date().toISOString();
  return true;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const incomingPayment = body?.object;

    if (body?.event === 'payment.succeeded' && incomingPayment?.id) {
      // Cryptographically/authoritatively verify the payment status with YooKassa API
      const verifiedPayment = await fetchVerifiedPayment(incomingPayment.id);
      if (!verifiedPayment || verifiedPayment.status !== 'succeeded') {
        console.warn('[YooKassa Webhook]: Unverified or non-succeeded payment rejected:', incomingPayment.id);
        return res.status(403).json({ error: 'Payment verification failed' });
      }

      const amountVal = verifiedPayment?.amount?.value;
      const currency = verifiedPayment?.amount?.currency;
      const metadata = verifiedPayment?.metadata || {};

      // Never treat arbitrary successful payments (including 10 RUB tests) as course purchases.
      if (currency !== 'RUB' || amountVal !== '3390.00' || metadata?.isTest === true || typeof metadata?.orderId !== 'string' || !metadata.orderId) {
        console.warn('[YooKassa Webhook]: Payment does not match a full course order:', incomingPayment.id);
        return res.status(400).json({ error: 'Payment does not match a course order' });
      }

      // Match the verified gateway payment to a server-created order before granting access.
      let order;
      try {
        order = await getOrder(metadata.orderId);
      } catch (error) {
        console.error('[YooKassa Webhook]: Could not read payment order:', error);
        return res.status(503).json({ error: 'Order verification temporarily unavailable' });
      }
      if (
        !order ||
        order.orderId !== metadata.orderId ||
        (order.paymentId && order.paymentId !== verifiedPayment.id) ||
        order.userId !== metadata.userId ||
        order.amount !== amountVal ||
        order.currency !== currency ||
        order.tariff !== 'master_pro'
      ) {
        console.warn('[YooKassa Webhook]: Payment does not match a stored order:', verifiedPayment.id);
        return res.status(400).json({ error: 'Payment does not match a stored order' });
      }

      if (order.status === 'succeeded') {
        try {
          const notified = await notifySuccessfulPayment(order, verifiedPayment, metadata);
          if (!notified) return res.status(503).json({ error: 'Payment is processed; Telegram notification will be retried' });
        } catch (error) {
          console.error('[YooKassa Webhook]: Telegram notification failed:', error);
          return res.status(503).json({ error: 'Payment is processed; notification retry required' });
        }
        return res.status(200).json({ status: 'already_processed' });
      }

      try {
        await grantPaidEntitlement(order.userId, order.orderId, verifiedPayment.created_at || new Date().toISOString());
        await updateOrder(order.orderId, {
          status: 'succeeded',
          paidAt: new Date().toISOString(),
          paymentId: verifiedPayment.id,
          verifiedPaymentId: verifiedPayment.id,
        });
      } catch (error) {
        console.error('[YooKassa Webhook]: Could not grant course entitlement:', error);
        return res.status(503).json({ error: 'Payment verified; entitlement processing will retry' });
      }

      try {
        const notified = await notifySuccessfulPayment({ ...order, status: 'succeeded' }, verifiedPayment, metadata);
        if (!notified) return res.status(503).json({ error: 'Payment is processed; Telegram notification will be retried' });
      } catch (error) {
        console.error('[YooKassa Webhook]: Telegram notification failed:', error);
        return res.status(503).json({ error: 'Payment is processed; notification retry required' });
      }

      return res.status(200).json({ status: 'ok' });
    }

    if (body?.event === 'payment.canceled') {
      return res.status(200).json({ status: 'ok' });
    }

    return res.status(200).json({ status: 'received' });
  } catch (error) {
    console.error('[YooKassa Webhook Error]:', error);
    return res.status(500).json({ error: 'Temporary webhook processing failure' });
  }
}
