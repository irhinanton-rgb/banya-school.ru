import { 
  doc, 
  setDoc, 
} from 'firebase/firestore';
import { db } from './config';

export type AdminMessageType = 'question' | 'bug' | 'feedback' | 'payment' | 'registration' | 'payment_intent';

export interface AdminMessagePayload {
  type: AdminMessageType;
  message: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  phoneNumber?: string;
  authMethod?: string;
  referralSource?: string;
  orderId?: string;
  amount?: string | number;
  answer?: string;
  currentLevel?: number;
}

export interface AdminMessageRecord extends AdminMessagePayload {
  id: string;
  createdAt: string;
  status: 'new' | 'reviewed' | 'resolved';
}

export const PARMASTER_BOT_TOKEN = '8683515876:AAHzMeka0nuQG0Hc1lTJCNuPZRogpg-Lw_0';
export const ADMIN_CHAT_ID = '471147423';

function escapeTgHtml(str: string): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Directly dispatch notification to Anton Irkhin's Telegram via Telegram Bot API.
 * Telegram Bot API officially supports CORS (Access-Control-Allow-Origin: *),
 * which guarantees instant delivery from any client browser without relying on backend servers!
 */
export async function sendDirectTelegram(payload: AdminMessagePayload): Promise<boolean> {
  const time = new Date().toLocaleString('ru-RU');
  const userName = escapeTgHtml(payload.userName || 'Гость курса');
  const userEmail = payload.userEmail ? escapeTgHtml(payload.userEmail) : '';
  const phone = payload.phoneNumber ? escapeTgHtml(payload.phoneNumber) : '';
  const message = escapeTgHtml(payload.message || '');
  const amount = payload.amount ? (typeof payload.amount === 'number' ? `${payload.amount} ₽` : `${payload.amount}`) : '3 390 ₽';

  let lines: string[] = [];

  if (payload.type === 'registration') {
    const method = payload.authMethod === 'google' 
      ? 'Google 🌐' 
      : payload.authMethod === 'phone' 
        ? 'Телефон 📱' 
        : 'Email / Пароль ✉️';
    lines = [
      `🌱 <b>[РЕГИСТРАЦИЯ] Новый банный ученик на PQ!</b>`,
      ``,
      `👤 <b>Имя:</b> ${userName}`,
      userEmail ? `📧 <b>Email:</b> <code>${userEmail}</code>` : '',
      phone ? `📱 <b>Телефон:</b> <code>${phone}</code>` : '',
      `🔑 <b>Способ:</b> ${method}`,
      payload.referralSource ? `🔍 <b>Источник:</b> ${escapeTgHtml(payload.referralSource)}` : '',
      `🕒 <b>Время:</b> ${time}`,
      ``,
      `🌿 <i>Ученик начал путь в онлайн-школе «Пармастер Квест».</i>`,
    ];
  } else if (payload.type === 'payment') {
    lines = [
      `🎉 <b>[ОПЛАТА КУРСА] Новый студент «Мастер Пара PRO»!</b>`,
      ``,
      `🎓 <b>Тариф:</b> «Мастер Пара PRO» (Полный курс)`,
      `💰 <b>Сумма оплаты:</b> ${amount}`,
      `👤 <b>Ученик:</b> ${userName}`,
      userEmail ? `📧 <b>Email:</b> <code>${userEmail}</code>` : '',
      payload.orderId ? `🧾 <b>Заказ:</b> <code>${escapeTgHtml(payload.orderId)}</code>` : '',
      `🕒 <b>Время:</b> ${time}`,
      ``,
      `👑 <i>Доступ ко всем станциям и симуляторам активирован на banya-school.ru!</i>`,
    ];
  } else if (payload.type === 'payment_intent') {
    lines = [
      `🛒 <b>[ЗАЯВКА НА ОПЛАТУ КУРСА] Ученик открыл окно оплаты</b>`,
      ``,
      `🎓 <b>Тариф:</b> «Мастер Пара PRO» (${amount})`,
      `👤 <b>Ученик:</b> ${userName}`,
      userEmail ? `📧 <b>Контакт:</b> <code>${userEmail}</code>` : '',
      phone ? `📱 <b>Телефон:</b> <code>${phone}</code>` : '',
      `🕒 <b>Время:</b> ${time}`,
      ``,
      `💬 <b>Детали:</b> ${message}`,
    ];
  } else if (payload.type === 'bug') {
    lines = [
      `🐞 <b>[Баг-репорт] Сообщение об ошибке</b>`,
      ``,
      `👤 <b>От:</b> ${userName}`,
      userEmail ? `📧 <b>Контакт:</b> <code>${userEmail}</code>` : '',
      `🕒 <b>Время:</b> ${time}`,
      ``,
      `💬 <b>Описание неполадки:</b>`,
      message,
    ];
  } else if (payload.type === 'feedback') {
    lines = [
      `💬 <b>[Отзыв] Впечатления ученика о курсе</b>`,
      ``,
      `👤 <b>Ученик:</b> ${userName}`,
      userEmail ? `📧 <b>Контакт:</b> <code>${userEmail}</code>` : '',
      payload.referralSource ? `🔍 <b>Откуда узнал:</b> ${escapeTgHtml(payload.referralSource)}` : '',
      `🕒 <b>Время:</b> ${time}`,
      ``,
      `⭐ <b>Отзыв:</b>`,
      message,
    ];
  } else {
    // Default: question to Owl PQ
    lines = [
      `🦉 <b>[Сова PQ] Вопрос ученика по квесту</b>`,
      ``,
      `👤 <b>Ученик:</b> ${userName}${payload.currentLevel ? ` (Станция ${payload.currentLevel})` : ''}`,
      userEmail ? `📧 <b>Контакт:</b> <code>${userEmail}</code>` : '',
      payload.referralSource ? `🔍 <b>Источник:</b> ${escapeTgHtml(payload.referralSource)}` : '',
      `🕒 <b>Время:</b> ${time}`,
      ``,
      `❓ <b>Вопрос ученика:</b>`,
      message,
    ];
    if (payload.answer) {
      lines.push(``, `💡 <b>Ответ Совы PQ:</b>`, escapeTgHtml(payload.answer));
    }
  }

  const text = lines.filter(Boolean).join('\n');

  try {
    const res = await fetch(`https://api.telegram.org/bot${PARMASTER_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: ADMIN_CHAT_ID,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });
    const data = await res.json();
    return !!data?.ok;
  } catch (err) {
    console.warn('Direct Telegram Bot API call error:', err);
    return false;
  }
}

/**
 * Send inquiry, bug report, feedback, registration, or payment notification directly to Telegram bot & Firestore
 */
export async function sendAdminMessage(payload: AdminMessagePayload): Promise<boolean> {
  const messageId = 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
  const nowIso = new Date().toISOString();

  // 1. Save to Firestore admin_messages collection
  try {
    const docRef = doc(db, 'admin_messages', messageId);
    await setDoc(docRef, {
      id: messageId,
      type: payload.type,
      message: (payload.message || '').trim(),
      userId: payload.userId || 'guest',
      userName: payload.userName || 'Гость курса',
      userEmail: payload.userEmail || '',
      referralSource: payload.referralSource || '',
      orderId: payload.orderId || null,
      amount: payload.amount || null,
      answer: payload.answer || null,
      currentLevel: payload.currentLevel || null,
      status: 'new',
      createdAt: nowIso,
    });
  } catch (err) {
    console.warn('Could not save message to firestore (will still deliver Telegram notification):', err);
  }

  // 2. Direct send to Telegram Bot API (100% reliable in browser with CORS)
  const tgSuccess = await sendDirectTelegram(payload);

  // 3. Optional background server hook backup
  try {
    fetch('/api/admin-notification.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: messageId,
        type: payload.type,
        message: payload.message,
        userName: payload.userName,
        userEmail: payload.userEmail,
        phoneNumber: payload.phoneNumber,
        authMethod: payload.authMethod,
        referralSource: payload.referralSource,
        orderId: payload.orderId,
        amount: payload.amount,
        answer: payload.answer,
        currentLevel: payload.currentLevel,
        createdAt: new Date().toLocaleString('ru-RU'),
      }),
    }).catch(() => {});
  } catch (_) {}

  return tgSuccess;
}

/**
 * Send Course Purchase Notification to Telegram Bot
 */
export async function sendCoursePurchaseNotification(params: {
  orderId: string;
  amount?: string | number;
  userName?: string;
  userEmail?: string;
}): Promise<boolean> {
  return sendAdminMessage({
    type: 'payment',
    message: `Оплата курса успешно подтверждена (Заказ #${params.orderId})`,
    orderId: params.orderId,
    amount: params.amount || '3390.00',
    userName: params.userName || 'Ученик',
    userEmail: params.userEmail || '',
  });
}

/**
 * Send New User Registration Notification to Telegram Bot (ParmasterQuest)
 */
export async function sendUserRegistrationNotification(params: {
  userId?: string;
  userName?: string;
  userEmail?: string;
  phoneNumber?: string;
  authMethod?: string;
  referralSource?: string;
}): Promise<boolean> {
  const methodLabel = params.authMethod === 'google' 
    ? 'Google' 
    : params.authMethod === 'phone' 
      ? 'Телефон' 
      : 'Email';

  return sendAdminMessage({
    type: 'registration',
    message: `Новый ученик зарегистрировался через ${methodLabel}`,
    userId: params.userId,
    userName: params.userName || 'Новый ученик',
    userEmail: params.userEmail || '',
    phoneNumber: params.phoneNumber || '',
    authMethod: params.authMethod || 'password',
    referralSource: params.referralSource || '',
  });
}
