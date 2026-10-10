import { broadcastToAdmins, escapeHtml } from './telegram-notifier.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    console.log('[YooKassa Webhook Event]:', body?.event, body?.object?.id);

    if (body?.event === 'payment.succeeded') {
      const payment = body.object;
      const amountVal = payment?.amount?.value || '3390.00';
      const currency = payment?.amount?.currency || 'RUB';
      const metadata = payment?.metadata || {};

      console.log(`[Payment Succeeded]: id=${payment?.id}, amount=${amountVal}, userId=${metadata?.userId}, email=${metadata?.userEmail}`);

      // Send Instant Telegram Notification to Anton
      broadcastToAdmins(
        [
          `🎉 <b>[ЮKassa] ОПЛАТА КУРСА ПОДТВЕРЖДЕНА!</b>`,
          ``,
          `💰 <b>Сумма:</b> ${amountVal} ${currency}`,
          `🎓 <b>Тариф:</b> «Мастер Пара PRO»`,
          metadata?.userName ? `👤 <b>Ученик:</b> ${escapeHtml(metadata.userName)}` : null,
          metadata?.userEmail ? `📧 <b>Email:</b> ${escapeHtml(metadata.userEmail)}` : null,
          `🧾 <b>ID платежа ЮKassa:</b> <code>${payment?.id}</code>`,
          payment?.description ? `📝 <b>Назначение:</b> ${escapeHtml(payment.description)}` : null,
          `🕒 <b>Время:</b> ${new Date().toLocaleString('ru-RU')}`,
          ``,
          `👑 <i>Оплата успешно зачислена, доступ к курсу открыт на сайте!</i>`,
        ].filter(Boolean).join('\n')
      ).catch((e) => console.warn('TG webhook notify warning:', e));

      return res.status(200).json({ status: 'ok' });
    }

    if (body?.event === 'payment.canceled') {
      console.log('[Payment Canceled]: id=', body?.object?.id);
      return res.status(200).json({ status: 'ok' });
    }

    return res.status(200).json({ status: 'received' });
  } catch (error) {
    console.error('[YooKassa Webhook Error]:', error);
    return res.status(200).json({ status: 'error_handled' });
  }
}
