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

/**
 * Dispatch notification to the server-side /api/admin-notification proxy
 * so Telegram Bot tokens remain strictly server-side and are never exposed in client bundles.
 */
export async function sendServerTelegramNotification(payload: AdminMessagePayload): Promise<boolean> {
  try {
    const res = await fetch('/api/admin-notification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        createdAt: new Date().toLocaleString('ru-RU'),
      }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    return Boolean(data?.success);
  } catch (err) {
    console.warn('Server Telegram notification error:', err);
    return false;
  }
}

/**
 * Send inquiry, bug report, feedback, registration, or payment notification to Firestore & Server Telegram Proxy
 */
export async function sendAdminMessage(payload: AdminMessagePayload): Promise<boolean> {
  const cleanMessage = String(payload.message || '').trim().slice(0, 2000);
  if (!cleanMessage) return false;

  // Deduplicate identical triggers (e.g. from React strict-mode re-renders or rapid clicks)
  const dedupeKey = `${payload.type}_${payload.orderId || ''}_${cleanMessage}`;
  if (isDuplicate(dedupeKey)) {
    return true;
  }

  const messageId = 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
  const nowIso = new Date().toISOString();

  // 1. Save to Firestore admin_messages collection (conforming strictly to security rules)
  try {
    const docRef = doc(db, 'admin_messages', messageId);
    await setDoc(docRef, {
      id: messageId,
      type: payload.type,
      message: cleanMessage,
      userId: String(payload.userId || 'guest').slice(0, 128),
      userName: String(payload.userName || 'Гость курса').slice(0, 100),
      userEmail: String(payload.userEmail || '').slice(0, 150),
      referralSource: String(payload.referralSource || '').slice(0, 100),
      status: 'new',
      createdAt: nowIso,
    });
  } catch (err) {
    console.warn('Could not save message to firestore (will still deliver Telegram notification):', err);
  }

  // 2. Send Telegram notification via secure backend route
  await sendServerTelegramNotification({
    ...payload,
    message: cleanMessage,
  });

  return true;
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
