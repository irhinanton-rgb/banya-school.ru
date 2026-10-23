import { 
  doc, 
  setDoc, 
} from 'firebase/firestore';
import { auth, db } from './config';

export type AdminMessageType =
  | 'question'
  | 'bug'
  | 'feedback'
  | 'payment'
  | 'registration'
  | 'payment_intent'
  | 'ad_inquiry'
  | 'b2b_inquiry';

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

// Telegram credentials are server-only; never expose bot tokens in browser bundles.

// In-memory deduplication cache to prevent duplicate broadcasts within 15 seconds
const recentDispatches = new Map<string, number>();

function isDuplicate(key: string): boolean {
  const now = Date.now();
  const lastTime = recentDispatches.get(key);
  if (lastTime && now - lastTime < 15000) {
    return true;
  }
  recentDispatches.set(key, now);
  if (recentDispatches.size > 100) {
    for (const [k, t] of recentDispatches.entries()) {
      if (now - t > 30000) recentDispatches.delete(k);
    }
  }
  return false;
}

function escapeTgHtml(str: string): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function formatTelegramMessageHtml(payload: AdminMessagePayload): string {
  const time = new Date().toLocaleString('ru-RU');
  const userName = escapeTgHtml(payload.userName || 'Гость курса');
  const userEmail = payload.userEmail ? escapeTgHtml(payload.userEmail) : '';
  const phone = payload.phoneNumber ? escapeTgHtml(payload.phoneNumber) : '';
  const message = escapeTgHtml(payload.message || '');
  const amount = payload.amount
    ? typeof payload.amount === 'number'
      ? `${payload.amount} ₽`
      : escapeTgHtml(String(payload.amount))
    : '3 390 ₽';

  let lines: string[] = [];

  if (payload.type === 'registration') {
    const method =
      payload.authMethod === 'google'
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
      `🐞 <b>[Баг-репорт] Сообщение об ошибке с сайта</b>`,
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
      `⭐ <b>[Отзыв] Впечатления ученика о курсе</b>`,
      ``,
      `👤 <b>Ученик:</b> ${userName}`,
      userEmail ? `📧 <b>Контакт:</b> <code>${userEmail}</code>` : '',
      payload.referralSource ? `🔍 <b>Откуда узнал:</b> ${escapeTgHtml(payload.referralSource)}` : '',
      `🕒 <b>Время:</b> ${time}`,
      ``,
      `💬 <b>Отзыв:</b>`,
      message,
    ];
  } else if (payload.type === 'ad_inquiry' || payload.type === 'b2b_inquiry') {
    lines = [
      `🤝 <b>[СОТРУДНИЧЕСТВО / РЕКЛАМА] Заявка от партнёра на banya-school.ru</b>`,
      ``,
      `🏢 <b>Имя / Компания:</b> ${userName}`,
      userEmail ? `📱 <b>Контакт:</b> <code>${userEmail}</code>` : '',
      payload.referralSource ? `📌 <b>Направление:</b> ${escapeTgHtml(payload.referralSource)}` : '',
      `🕒 <b>Время:</b> ${time}`,
      ``,
      `💬 <b>Предложение / Детали:</b>`,
      message,
    ];
  } else {
    lines = [
      `🦉 <b>[Сова PQ] Вопрос ученика на сайте banya-school.ru</b>`,
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

  return lines.filter(Boolean).join('\n');
}

/**
 * Deliver notifications through the server-side API only.
 */
export async function sendServerTelegramNotification(payload: AdminMessagePayload): Promise<boolean> {
  // Node serverless endpoint first; secure PHP endpoint is the fallback for FTP/PHP hosting.
  const candidateEndpoints = ['/api/admin-notification', '/api/admin-notification.php'];
  const currentUser = auth.currentUser;
  const idToken = currentUser ? await currentUser.getIdToken() : null;

  const bodyStr = JSON.stringify({
    ...payload,
    createdAt: new Date().toLocaleString('ru-RU'),
  });

  for (const endpoint of candidateEndpoints) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
        },
        body: bodyStr,
        signal: controller.signal,
      });
      clearTimeout(timer);

      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (data?.success === true || (data?.ok === true && data?.response?.ok !== false)) {
          return true;
        }
      }
    } catch {
      // try next candidate endpoint
    }
  }

  return false;
}

/**
 * Send inquiry, bug report, feedback, registration, or payment notification to @ParmasterQuest_bot & Firestore.
 * IMPORTANT: Telegram delivery runs FIRST so slow/blocked Firestore connections never block notifications.
 */
export async function sendAdminMessage(payload: AdminMessagePayload): Promise<boolean> {
  const cleanMessage = String(payload.message || '').trim().slice(0, 2000);
  if (!cleanMessage) return false;

  const dedupeKey = `${payload.type}_${payload.orderId || ''}_${cleanMessage}`;
  if (isDuplicate(dedupeKey)) {
    return true;
  }

  const normalizedPayload: AdminMessagePayload = {
    ...payload,
    message: cleanMessage,
  };

  const messageId = 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
  const nowIso = new Date().toISOString();

  // 1. Fire Firestore save asynchronously in background (never block Telegram delivery!)
  try {
    const docRef = doc(db, 'admin_messages', messageId);
    setDoc(docRef, {
      id: messageId,
      type: normalizedPayload.type,
      message: cleanMessage,
      userId: String(normalizedPayload.userId || 'guest').slice(0, 128),
      userName: String(normalizedPayload.userName || 'Гость курса').slice(0, 100),
      userEmail: String(normalizedPayload.userEmail || '').slice(0, 150),
      referralSource: String(normalizedPayload.referralSource || '').slice(0, 100),
      status: 'new',
      createdAt: nowIso,
    }).catch((err) => {
      console.warn('Firestore background log skipped:', err);
    });
  } catch (err) {
    console.warn('Could not initiate Firestore log:', err);
  }

  // Telegram delivery must stay server-side so credentials never enter the browser bundle.
  return sendServerTelegramNotification(normalizedPayload);
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
  const methodLabel =
    params.authMethod === 'google'
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
