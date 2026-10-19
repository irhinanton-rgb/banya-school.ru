import https from 'https';
import { broadcastToAdmins, escapeHtml } from './telegram-notifier.js';

const YOOKASSA_SHOP_ID = process.env.YOOKASSA_SHOP_ID || '1485718';
const YOOKASSA_SECRET_KEY = process.env.YOOKASSA_SECRET_KEY || 'live_pko1h4rfqyVG9Un0_S8qJAHmitTEhR6u2od3psGUd5s';

/**
 * Verify payment status directly from YooKassa API so spoofed webhook POST requests are rejected.
 */
function fetchVerifiedPayment(paymentId) {
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

      const amountVal = verifiedPayment?.amount?.value || '3390.00';
      const currency = verifiedPayment?.amount?.currency || 'RUB';
      const metadata = verifiedPayment?.metadata || {};

      broadcastToAdmins(
        [
          `🎉 <b>[ЮKassa] ОПЛАТА КУРСА ПОДТВЕРЖДЕНА!</b>`,
          ``,
          `💰 <b>Сумма:</b> ${escapeHtml(amountVal)} ${escapeHtml(currency)}`,
          `🎓 <b>Тариф:</b> «Мастер Пара PRO»`,
          metadata?.userName ? `👤 <b>Ученик:</b> ${escapeHtml(metadata.userName)}` : null,
          metadata?.userEmail ? `📧 <b>Email:</b> ${escapeHtml(metadata.userEmail)}` : null,
          `🧾 <b>ID платежа ЮKassa:</b> <code>${escapeHtml(verifiedPayment.id)}</code>`,
          verifiedPayment?.description ? `📝 <b>Назначение:</b> ${escapeHtml(verifiedPayment.description)}` : null,
          `🕒 <b>Время:</b> ${new Date().toLocaleString('ru-RU')}`,
          ``,
          `👑 <i>Оплата успешно зачислена, доступ к курсу открыт на сайте!</i>`,
        ].filter(Boolean).join('\n')
      ).catch((e) => console.warn('TG webhook notify warning:', e));

      return res.status(200).json({ status: 'ok' });
    }

    if (body?.event === 'payment.canceled') {
      return res.status(200).json({ status: 'ok' });
    }

    return res.status(200).json({ status: 'received' });
  } catch (error) {
    console.error('[YooKassa Webhook Error]:', error);
    return res.status(200).json({ status: 'error_handled' });
  }
}
