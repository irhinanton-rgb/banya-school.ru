import { broadcastToAdmins, escapeHtml } from './telegram-notifier.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { 
      type, 
      message, 
      userName, 
      userEmail, 
      referralSource, 
      createdAt, 
      orderId, 
      amount, 
      answer, 
      currentLevel 
    } = body;

    let textLines = [];

    if (type === 'payment') {
      // Course Purchase Celebration Notification
      const displayAmount = amount ? (typeof amount === 'number' ? `${amount} ₽` : `${amount}`) : '3 390 ₽';
      textLines = [
        `🎉 <b>[ОПЛАТА КУРСА] Новый студент «Мастер Пара PRO»!</b>`,
        ``,
        `🎓 <b>Тариф:</b> «Мастер Пара PRO» (Полный доступ к курсу)`,
        `💰 <b>Сумма оплаты:</b> ${displayAmount}`,
        `👤 <b>Ученик:</b> ${escapeHtml(userName || 'Ученик')}`,
        userEmail ? `📧 <b>Email:</b> ${escapeHtml(userEmail)}` : null,
        orderId ? `🧾 <b>Номер заказа:</b> <code>${escapeHtml(orderId)}</code>` : null,
        `🕒 <b>Время:</b> ${escapeHtml(createdAt || new Date().toLocaleString('ru-RU'))}`,
        ``,
        `👑 <i>Доступ ко всем 7 станциям квеста, симуляторам и аттестации успешно активирован на banya-school.ru!</i>`,
      ];
    } else if (type === 'question') {
      // Student Question to Owl PQ / Mentor
      textLines = [
        `🦉 <b>[Сова PQ] Вопрос ученика по квесту</b>`,
        ``,
        `👤 <b>Ученик:</b> ${escapeHtml(userName || 'Гость курса')}${currentLevel ? ` (Станция ${currentLevel})` : ''}`,
        userEmail ? `📧 <b>Контакт:</b> ${escapeHtml(userEmail)}` : null,
        referralSource ? `🔍 <b>Источник:</b> ${escapeHtml(referralSource)}` : null,
        `🕒 <b>Время:</b> ${escapeHtml(createdAt || new Date().toLocaleString('ru-RU'))}`,
        ``,
        `❓ <b>Вопрос ученика:</b>`,
        escapeHtml(message || ''),
      ];

      if (answer) {
        textLines.push(``, `💡 <b>Ответ Совы PQ:</b>`, escapeHtml(answer));
      }
    } else if (type === 'bug') {
      // Bug Report
      textLines = [
        `🐞 <b>[Баг-репорт] Сообщение об ошибке</b>`,
        ``,
        `👤 <b>От кого:</b> ${escapeHtml(userName || 'Гость курса')}`,
        userEmail ? `📧 <b>Контакт:</b> ${escapeHtml(userEmail)}` : null,
        `🕒 <b>Время:</b> ${escapeHtml(createdAt || new Date().toLocaleString('ru-RU'))}`,
        ``,
        `💬 <b>Описание ошибки / неполадки:</b>`,
        escapeHtml(message || ''),
      ];
    } else if (type === 'feedback') {
      // Review & Feedback
      textLines = [
        `⭐ <b>[Отзыв] Впечатления ученика о квесте</b>`,
        ``,
        `👤 <b>От кого:</b> ${escapeHtml(userName || 'Гость курса')}`,
        userEmail ? `📧 <b>Контакт:</b> ${escapeHtml(userEmail)}` : null,
        referralSource ? `🔍 <b>Откуда узнали о нас:</b> ${escapeHtml(referralSource)}` : null,
        `🕒 <b>Время:</b> ${escapeHtml(createdAt || new Date().toLocaleString('ru-RU'))}`,
        ``,
        `💬 <b>Впечатления:</b>`,
        escapeHtml(message || ''),
      ];
    } else {
      // General Inquiry
      textLines = [
        `📩 <b>Новое обращение с сайта banya-school.ru</b>`,
        ``,
        `👤 <b>От кого:</b> ${escapeHtml(userName || 'Гость курса')}`,
        userEmail ? `📧 <b>Контакт:</b> ${escapeHtml(userEmail)}` : null,
        referralSource ? `🔍 <b>Источник:</b> ${escapeHtml(referralSource)}` : null,
        `🕒 <b>Время:</b> ${escapeHtml(createdAt || new Date().toLocaleString('ru-RU'))}`,
        ``,
        `💬 <b>Сообщение:</b>`,
        escapeHtml(message || ''),
      ];
    }

    const fullMessage = textLines.filter(Boolean).join('\n');
    const tgResults = await broadcastToAdmins(fullMessage);

    return res.status(200).json({ success: true, telegram: tgResults });
  } catch (err) {
    console.error('Error in /api/admin-notification:', err);
    return res.status(500).json({ error: err.message || 'Server error' });
  }
}
