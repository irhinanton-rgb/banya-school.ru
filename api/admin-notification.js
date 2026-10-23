import { broadcastToAdmins, escapeHtml } from './telegram-notifier.js';
import { verifyFirebaseIdToken } from '../server/firebase-admin-rest.js';

export default async function handler(req, res) {
  const requestOrigin = req.headers.origin;
  const allowedOrigins = new Set(['https://banya-school.ru', 'https://www.banya-school.ru', 'http://localhost:3000', 'http://127.0.0.1:3000']);
  if (requestOrigin && allowedOrigins.has(requestOrigin)) {
    res.setHeader('Access-Control-Allow-Origin', requestOrigin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }

  if (req.method === 'OPTIONS') {
    if (requestOrigin && !allowedOrigins.has(requestOrigin)) return res.status(403).end();
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const authorization = String(req.headers.authorization || '');
  const idToken = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
  const firebaseUser = await verifyFirebaseIdToken(idToken, process.env.FIREBASE_WEB_API_KEY);
  if (!firebaseUser) return res.status(401).json({ error: 'Authentication required' });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const type = String(body.type || 'question').slice(0, 32);
    const message = String(body.message || '').trim().slice(0, 2000);
    const userName = String(body.userName || 'Гость курса').trim().slice(0, 100);
    const userEmail = String(body.userEmail || '').trim().slice(0, 150);
    const phoneNumber = String(body.phoneNumber || '').trim().slice(0, 40);
    const referralSource = String(body.referralSource || '').trim().slice(0, 120);
    const createdAt = String(body.createdAt || new Date().toLocaleString('ru-RU')).slice(0, 64);
    const orderId = String(body.orderId || '').trim().slice(0, 80);
    const amount = body.amount;
    const answer = String(body.answer || '').trim().slice(0, 1500);
    const currentLevel = body.currentLevel;

    let textLines = [];

    if (type === 'registration') {
      const methodLabel = body.authMethod === 'google' 
        ? 'Google 🌐' 
        : body.authMethod === 'phone' 
          ? 'Телефон (SMS) 📱' 
          : 'Email + Пароль ✉️';
      
      textLines = [
        `🌱 <b>[РЕГИСТРАЦИЯ] Новый банный ученик на PQ!</b>`,
        ``,
        `👤 <b>Имя:</b> ${escapeHtml(userName || 'Новый ученик')}`,
        userEmail ? `📧 <b>Email:</b> <code>${escapeHtml(userEmail)}</code>` : null,
        phoneNumber ? `📱 <b>Телефон:</b> <code>${escapeHtml(phoneNumber)}</code>` : null,
        `🔑 <b>Способ входа:</b> ${escapeHtml(methodLabel)}`,
        referralSource ? `🔍 <b>Источник:</b> ${escapeHtml(referralSource)}` : null,
        `🕒 <b>Время:</b> ${escapeHtml(createdAt)}`,
        ``,
        `🌿 <i>Ученик начал путь в школе «Пармастер Квест».</i>`,
      ];
    } else if (type === 'payment') {
      const displayAmount = amount ? (typeof amount === 'number' ? `${amount} ₽` : `${escapeHtml(String(amount).slice(0, 32))}`) : '3 390 ₽';
      textLines = [
        `🎉 <b>[ОПЛАТА КУРСА] Новый студент «Мастер Пара PRO»!</b>`,
        ``,
        `🎓 <b>Тариф:</b> «Мастер Пара PRO» (Полный доступ к курсу)`,
        `💰 <b>Сумма оплаты:</b> ${displayAmount}`,
        `👤 <b>Ученик:</b> ${escapeHtml(userName || 'Ученик')}`,
        userEmail ? `📧 <b>Email:</b> <code>${escapeHtml(userEmail)}</code>` : null,
        orderId ? `🧾 <b>Номер заказа:</b> <code>${escapeHtml(orderId)}</code>` : null,
        `🕒 <b>Время:</b> ${escapeHtml(createdAt)}`,
        ``,
        `👑 <i>Доступ ко всем 7 станциям квеста, симуляторам и аттестации успешно активирован на banya-school.ru!</i>`,
      ];
    } else if (type === 'payment_intent') {
      const displayAmount = amount ? (typeof amount === 'number' ? `${amount} ₽` : `${escapeHtml(String(amount).slice(0, 32))}`) : '3 390 ₽';
      textLines = [
        `🛒 <b>[ЗАЯВКА НА ОПЛАТУ КУРСА] Ученик открыл окно оплаты</b>`,
        ``,
        `🎓 <b>Тариф:</b> «Мастер Пара PRO» (${displayAmount})`,
        `👤 <b>Ученик:</b> ${escapeHtml(userName || 'Ученик')}`,
        userEmail ? `📧 <b>Контакт:</b> <code>${escapeHtml(userEmail)}</code>` : null,
        phoneNumber ? `📱 <b>Телефон:</b> <code>${escapeHtml(phoneNumber)}</code>` : null,
        `🕒 <b>Время:</b> ${escapeHtml(createdAt)}`,
        ``,
        `💬 <b>Детали:</b> ${escapeHtml(message)}`,
      ];
    } else if (type === 'question') {
      textLines = [
        `🦉 <b>[Сова PQ] Вопрос ученика по квесту</b>`,
        ``,
        `👤 <b>Ученик:</b> ${escapeHtml(userName)}${currentLevel ? ` (Станция ${escapeHtml(String(currentLevel).slice(0, 10))})` : ''}`,
        userEmail ? `📧 <b>Контакт:</b> <code>${escapeHtml(userEmail)}</code>` : null,
        referralSource ? `🔍 <b>Источник:</b> ${escapeHtml(referralSource)}` : null,
        `🕒 <b>Время:</b> ${escapeHtml(createdAt)}`,
        ``,
        `❓ <b>Вопрос ученика:</b>`,
        escapeHtml(message),
      ];

      if (answer) {
        textLines.push(``, `💡 <b>Ответ Совы PQ:</b>`, escapeHtml(answer));
      }
    } else if (type === 'bug') {
      textLines = [
        `🐞 <b>[Баг-репорт] Сообщение об ошибке</b>`,
        ``,
        `👤 <b>От кого:</b> ${escapeHtml(userName)}`,
        userEmail ? `📧 <b>Контакт:</b> <code>${escapeHtml(userEmail)}</code>` : null,
        `🕒 <b>Время:</b> ${escapeHtml(createdAt)}`,
        ``,
        `💬 <b>Описание ошибки / неполадки:</b>`,
        escapeHtml(message),
      ];
    } else if (type === 'feedback') {
      textLines = [
        `⭐ <b>[Отзыв] Впечатления ученика о квесте</b>`,
        ``,
        `👤 <b>От кого:</b> ${escapeHtml(userName)}`,
        userEmail ? `📧 <b>Контакт:</b> <code>${escapeHtml(userEmail)}</code>` : null,
        referralSource ? `🔍 <b>Откуда узнали о нас:</b> ${escapeHtml(referralSource)}` : null,
        `🕒 <b>Время:</b> ${escapeHtml(createdAt)}`,
        ``,
        `💬 <b>Впечатления:</b>`,
        escapeHtml(message),
      ];
    } else {
      textLines = [
        `📩 <b>Новое обращение с сайта banya-school.ru</b>`,
        ``,
        `👤 <b>От кого:</b> ${escapeHtml(userName)}`,
        userEmail ? `📧 <b>Контакт:</b> <code>${escapeHtml(userEmail)}</code>` : null,
        referralSource ? `🔍 <b>Источник:</b> ${escapeHtml(referralSource)}` : null,
        `🕒 <b>Время:</b> ${escapeHtml(createdAt)}`,
        ``,
        `💬 <b>Сообщение:</b>`,
        escapeHtml(message),
      ];
    }

    const fullMessage = textLines.filter(Boolean).join('\n');
    const tgResults = await broadcastToAdmins(fullMessage);

    return res.status(200).json({ success: true, telegram: tgResults });
  } catch (err) {
    console.error('Error in /api/admin-notification:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
