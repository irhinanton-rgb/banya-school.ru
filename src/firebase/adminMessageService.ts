import { 
  doc, 
  setDoc, 
} from 'firebase/firestore';
import { db } from './config';

export type AdminMessageType = 'question' | 'bug' | 'feedback' | 'payment';

export interface AdminMessagePayload {
  type: AdminMessageType;
  message: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
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

/**
 * Send inquiry, bug report, feedback, or payment notification directly to Telegram bot & Firestore
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

  // 2. Also send real-time notification to Telegram bot
  try {
    const res = await fetch('/api/admin-notification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: messageId,
        type: payload.type,
        message: payload.message,
        userName: payload.userName,
        userEmail: payload.userEmail,
        referralSource: payload.referralSource,
        orderId: payload.orderId,
        amount: payload.amount,
        answer: payload.answer,
        currentLevel: payload.currentLevel,
        createdAt: new Date().toLocaleString('ru-RU'),
      }),
    });
    if (!res.ok) {
      console.warn('Admin telegram notification status:', res.status);
    }
  } catch (e) {
    console.warn('Failed to call /api/admin-notification:', e);
  }

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
