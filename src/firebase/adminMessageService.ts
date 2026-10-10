import { 
  collection, 
  doc, 
  setDoc, 
  serverTimestamp, 
  getDocs, 
  query, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './config';

export type AdminMessageType = 'question' | 'bug' | 'feedback';

export interface AdminMessagePayload {
  type: AdminMessageType;
  message: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  referralSource?: string;
}

export interface AdminMessageRecord extends AdminMessagePayload {
  id: string;
  createdAt: string;
  status: 'new' | 'reviewed' | 'resolved';
}

/**
 * Send inquiry, bug report, or feedback directly to admin (Firestore + Telegram notification)
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
      message: payload.message.trim(),
      userId: payload.userId || 'guest',
      userName: payload.userName || 'Гость курса',
      userEmail: payload.userEmail || '',
      referralSource: payload.referralSource || '',
      status: 'new',
      createdAt: nowIso,
    });
  } catch (err) {
    console.warn('Could not save message to firestore (will still try Telegram notification):', err);
  }

  // 2. Also send real-time notification to admin via API endpoint (which pushes to Telegram)
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
        createdAt: nowIso,
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
