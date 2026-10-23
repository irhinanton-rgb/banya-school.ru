import { broadcastToAdmins, escapeHtml } from './telegram-notifier.js';
import { verifyFirebaseIdToken } from '../server/firebase-admin-rest.js';

// Best-effort per-instance throttling for unauthenticated public contact forms.
const guestRequests = new Map();
const GUEST_ALLOWED_TYPES = new Set(['question', 'bug', 'feedback']);
const AUTHENTICATED_ALLOWED_TYPES = new Set(['question', 'bug', 'feedback', 'registration', 'payment_intent', 'ad_inquiry', 'b2b_inquiry']);

function isGuestRateLimited(ip) {
  const now = Date.now();
  const recent = (guestRequests.get(ip) || []).filter((timestamp) => now - timestamp < 10 * 60 * 1000);
  if (recent.length >= 5) {
    guestRequests.set(ip, recent);
    return true;
  }
  recent.push(now);
  guestRequests.set(ip, recent);
  if (guestRequests.size > 2000) {
    for (const [key, timestamps] of guestRequests) {
      if (!timestamps.some((timestamp) => now - timestamp < 10 * 60 * 1000)) guestRequests.delete(key);
    }
  }
  return false;
}

export default async function handler(req, res) {
  const requestOrigin = req.headers.origin;
  const allowedOrigins = new Set(['https://banya-school.ru', 'https://www.banya-school.ru', 'http://localhost:3000', 'http://127.0.0.1:3000']);
  if (requestOrigin && !allowedOrigins.has(requestOrigin)) return res.status(403).json({ error: 'Origin not allowed' });
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

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const type = String(body.type || 'question').slice(0, 32);
    const message = String(body.message || '').trim().slice(0, 2000);
    if (!message) return res.status(400).json({ error: 'Message is required' });

    const authorization = String(req.headers.authorization || '');
    const idToken = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
    let firebaseUser = null;
    if (idToken) {
      try {
        firebaseUser = await verifyFirebaseIdToken(idToken, process.env.FIREBASE_WEB_API_KEY);
      } catch (error) {
        console.error('[Admin notification]: Authentication service unavailable:', error);
        return res.status(503).json({ error: 'Authentication temporarily unavailable' });
      }
      if (!firebaseUser) return res.status(401).json({ error: 'Invalid authentication token' });
      if (!AUTHENTICATED_ALLOWED_TYPES.has(type)) return res.status(400).json({ error: 'Unsupported notification type' });
    } else {
      if (!GUEST_ALLOWED_TYPES.has(type)) return res.status(401).json({ error: 'Authentication required for this notification type' });
      const forwardedFor = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
      const ip = forwardedFor || String(req.socket?.remoteAddress || 'unknown');
      if (isGuestRateLimited(ip)) return res.status(429).json({ error: 'Too many messages. Please try again later.' });
    }
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
    const delivered = tgResults.length > 0 && tgResults.every((result) => result?.ok === true);
    if (!delivered) {
      console.error('[Admin notification]: Telegram delivery failed or is not configured.');
      return res.status(503).json({ error: 'Notification delivery temporarily unavailable' });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Error in /api/admin-notification:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
