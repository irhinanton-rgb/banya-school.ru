import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
} from 'firebase/firestore';
import {
  db,
  handleFirestoreError,
  OperationType,
  ADMIN_EMAIL,
  isAdminEmail,
  isTestAccountEmail,
} from './config';
import { UserProgress, LevelId, BadgeId } from '../types/banya';
import { User } from 'firebase/auth';

export interface CloudUserData {
  uid: string;
  displayName: string;
  email?: string;
  photoURL?: string;
  role?: 'admin' | 'student';
  createdAt: string;
}

export interface CloudProgressData {
  userId: string;
  name: string;
  xp: number;
  completedLevels: number[];
  unlockedBadges: string[];
  activeLevelId?: number;
  examScore?: number;
  certifiedDate?: string;
  updatedAt: string;
}

let lastSyncTimestamp = 0;
const MIN_SYNC_INTERVAL_MS = 800; // Rate-limiting guard against request flooding / DDoS

// Save user profile and current progress to Firestore
export async function syncProgressToCloud(user: User, progress: UserProgress): Promise<void> {
  if (!user || !user.uid) return;

  // Test accounts are excluded from cloud sync, but sign-in must never delete stored data.
  if (isTestAccountEmail(user.email)) return;

  const now = Date.now();
  if (now - lastSyncTimestamp < MIN_SYNC_INTERVAL_MS) {
    return; // Throttle excessive concurrent writes
  }
  lastSyncTimestamp = now;

  const isOwnerAdmin = isAdminEmail(user.email);
  const userPath = `users/${user.uid}`;
  const progressPath = `users/${user.uid}/progress/current`;

  // Defensive sanitization: adhere strictly to blueprint constraints
  const sanitizedName = String(
    progress.name || user.displayName || (isOwnerAdmin ? 'Антон Ирхин' : 'Пармастер')
  )
    .trim()
    .slice(0, 100);
  const sanitizedXp = Math.max(0, Math.min(1000000, Number(progress.xp) || 0));
  const sanitizedLevels = Array.isArray(progress.completedLevels)
    ? progress.completedLevels.filter((lvl) => typeof lvl === 'number' && lvl >= 1 && lvl <= 7).slice(0, 50)
    : [];
  const sanitizedBadges = Array.isArray(progress.unlockedBadges)
    ? progress.unlockedBadges.filter((b) => typeof b === 'string').slice(0, 50)
    : [];
  const sanitizedBrooms = Array.isArray(progress.favoriteBrooms)
    ? progress.favoriteBrooms
        .filter((b) => typeof b === 'string')
        .map((b) => b.slice(0, 64))
        .slice(0, 20)
    : [];

  try {
    // 1. Save or update user profile
    const profilePayload = {
      uid: user.uid,
      displayName: sanitizedName,
      email: String(user.email || '').slice(0, 150),
      photoURL: String(user.photoURL || '').slice(0, 500),
      createdAt: new Date().toISOString(),
    };

    await setDoc(doc(db, 'users', user.uid), profilePayload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, userPath);
  }

  try {
    // 2. Save quest progress
    const progressPayload = {
      userId: user.uid,
      name: sanitizedName,
      xp: isOwnerAdmin ? Math.max(2500, sanitizedXp) : sanitizedXp,
      completedLevels: isOwnerAdmin ? [1, 2, 3, 4, 5, 6, 7] : sanitizedLevels,
      unlockedBadges: sanitizedBadges,
      activeLevelId: Math.max(1, Math.min(7, Number(progress.activeLevelId) || 1)),
      examScore:
        progress.examScore !== undefined
          ? Math.max(0, Math.min(100, Number(progress.examScore)))
          : isOwnerAdmin
          ? 100
          : 0,
      certifiedDate: String(progress.certifiedDate || '').slice(0, 64),
      // Entitlement fields are written only by the trusted payment backend.
      bio: String(progress.bio || '').slice(0, 500),
      banyaStatus: String(progress.banyaStatus || '').slice(0, 100),
      city: String(progress.city || '').slice(0, 100),
      favoriteBrooms: sanitizedBrooms,
      updatedAt: new Date().toISOString(),
    };

    await setDoc(doc(db, 'users', user.uid, 'progress', 'current'), progressPayload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, progressPath);
  }
}

// Delete a user and their progress from Firestore
export async function deleteUserFromDatabase(uid: string): Promise<boolean> {
  if (!uid) return false;
  try {
    await deleteDoc(doc(db, 'users', uid, 'progress', 'current')).catch(() => {});
    await deleteDoc(doc(db, 'users', uid)).catch(() => {});
    return true;
  } catch {
    return false;
  }
}

/**
 * Legacy destructive maintenance helper.
 *
 * Intentionally disabled: never bulk-delete user profiles based on email.
 * If test data needs cleanup, use an explicit allowlist of verified test UIDs,
 * preview the target list, and require a separate confirmation outside sign-in.
 */
export async function purgeTestAccountsFromDatabase(): Promise<{
  removedCount: number;
  keptAdminEmail: string;
}> {
  console.warn('Bulk account purge is disabled; no user data was changed.');
  return { removedCount: 0, keptAdminEmail: ADMIN_EMAIL };
}

// Load progress from Firestore
export async function fetchProgressFromCloud(user: User): Promise<Partial<UserProgress> | null> {
  if (!user || !user.uid) return null;

  // Do not load test-account progress, but never delete records automatically during sign-in.
  if (isTestAccountEmail(user.email)) return null;

  const progressPath = `users/${user.uid}/progress/current`;
  const isOwnerAdmin = isAdminEmail(user.email);

  try {
    const snap = await getDoc(doc(db, 'users', user.uid, 'progress', 'current'));
    if (!snap.exists()) {
      if (isOwnerAdmin) {
        return {
          name: 'Антон Ирхин',
          xp: 2500,
          completedLevels: [1, 2, 3, 4, 5, 6, 7],
          activeLevelId: 1,
          tariff: 'master_pro',
          isPaid: true,
          isAdmin: true,
        };
      }
      return null;
    }

    const data = snap.data();
    return {
      name: data.name || user.displayName || (isOwnerAdmin ? 'Антон Ирхин' : 'Пармастер'),
      xp: typeof data.xp === 'number' ? data.xp : isOwnerAdmin ? 2500 : 0,
      completedLevels: Array.isArray(data.completedLevels)
        ? (data.completedLevels as LevelId[])
        : isOwnerAdmin
        ? [1, 2, 3, 4, 5, 6, 7]
        : [],
      unlockedBadges: Array.isArray(data.unlockedBadges) ? (data.unlockedBadges as BadgeId[]) : [],
      activeLevelId:
        typeof data.activeLevelId === 'number' && data.activeLevelId >= 1 && data.activeLevelId <= 7
          ? (data.activeLevelId as LevelId)
          : 1,
      examScore: typeof data.examScore === 'number' ? data.examScore : undefined,
      certifiedDate:
        typeof data.certifiedDate === 'string' && data.certifiedDate ? data.certifiedDate : undefined,
      tariff: isOwnerAdmin || data.tariff === 'master_pro' ? 'master_pro' : 'free',
      isPaid: Boolean(isOwnerAdmin || data.isPaid),
      isAdmin: isOwnerAdmin,
      paidAt: typeof data.paidAt === 'string' ? data.paidAt : undefined,
      orderId: typeof data.orderId === 'string' ? data.orderId : undefined,
      bio: typeof data.bio === 'string' && data.bio ? data.bio : undefined,
      banyaStatus:
        typeof data.banyaStatus === 'string' && data.banyaStatus ? data.banyaStatus : undefined,
      city: typeof data.city === 'string' && data.city ? data.city : undefined,
      favoriteBrooms: Array.isArray(data.favoriteBrooms) ? data.favoriteBrooms : undefined,
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, progressPath);
    return null;
  }
}

// Merge local and cloud progress (keep maximum achievements)
export function mergeUserProgress(
  local: UserProgress,
  remote: Partial<UserProgress>
): UserProgress {
  const mergedCompleted = Array.from(
    new Set([...(local.completedLevels || []), ...(remote.completedLevels || [])])
  ) as LevelId[];

  const mergedBadges = Array.from(
    new Set([...(local.unlockedBadges || []), ...(remote.unlockedBadges || [])])
  ) as BadgeId[];

  const mergedXp = Math.max(local.xp || 0, remote.xp || 0);
  const highestLevel = Math.max(local.activeLevelId || 1, remote.activeLevelId || 1) as LevelId;
  // Paid entitlements are server-authoritative. Never preserve localStorage/client claims.
  const isPaid = Boolean(remote.isPaid || remote.isAdmin);
  const tariff = isPaid && remote.tariff === 'master_pro' ? 'master_pro' : 'free';

  return {
    ...local,
    name: remote.name || local.name,
    xp: mergedXp,
    completedLevels: mergedCompleted,
    unlockedBadges: mergedBadges,
    activeLevelId: highestLevel,
    examScore:
      remote.examScore !== undefined
        ? Math.max(local.examScore || 0, remote.examScore)
        : local.examScore,
    certifiedDate: remote.certifiedDate || local.certifiedDate,
    tariff,
    isPaid,
    isAdmin: Boolean(remote.isAdmin),
    paidAt: remote.paidAt || local.paidAt,
    orderId: remote.orderId || local.orderId,
    bio: remote.bio || local.bio,
    banyaStatus: remote.banyaStatus || local.banyaStatus,
    city: remote.city || local.city,
    favoriteBrooms: remote.favoriteBrooms?.length ? remote.favoriteBrooms : local.favoriteBrooms,
  };
}
