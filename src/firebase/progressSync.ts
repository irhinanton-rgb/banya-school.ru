import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './config';
import { UserProgress, LevelId, BadgeId } from '../types/banya';
import { User } from 'firebase/auth';

export interface CloudUserData {
  uid: string;
  displayName: string;
  email?: string;
  photoURL?: string;
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

// Save user profile and current progress to Firestore
export async function syncProgressToCloud(user: User, progress: UserProgress): Promise<void> {
  if (!user) return;

  const userPath = `users/${user.uid}`;
  const progressPath = `users/${user.uid}/progress/current`;

  try {
    // 1. Save or update user profile
    const profilePayload = {
      uid: user.uid,
      displayName: user.displayName || progress.name || 'Пармастер',
      email: user.email || '',
      photoURL: user.photoURL || '',
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
      name: progress.name || user.displayName || 'Пармастер',
      xp: Number(progress.xp) || 0,
      completedLevels: Array.isArray(progress.completedLevels) ? progress.completedLevels : [],
      unlockedBadges: Array.isArray(progress.unlockedBadges) ? progress.unlockedBadges : [],
      activeLevelId: Number(progress.activeLevelId) || 1,
      examScore: progress.examScore !== undefined ? Number(progress.examScore) : 0,
      certifiedDate: progress.certifiedDate || '',
      updatedAt: new Date().toISOString(),
    };

    await setDoc(doc(db, 'users', user.uid, 'progress', 'current'), progressPayload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, progressPath);
  }
}

// Load progress from Firestore
export async function fetchProgressFromCloud(user: User): Promise<Partial<UserProgress> | null> {
  if (!user) return null;

  const progressPath = `users/${user.uid}/progress/current`;

  try {
    const snap = await getDoc(doc(db, 'users', user.uid, 'progress', 'current'));
    if (!snap.exists()) return null;

    const data = snap.data();
    return {
      name: data.name || user.displayName || 'Пармастер',
      xp: typeof data.xp === 'number' ? data.xp : 0,
      completedLevels: Array.isArray(data.completedLevels) ? (data.completedLevels as LevelId[]) : [],
      unlockedBadges: Array.isArray(data.unlockedBadges) ? (data.unlockedBadges as BadgeId[]) : [],
      activeLevelId: (typeof data.activeLevelId === 'number' && data.activeLevelId >= 1 && data.activeLevelId <= 7)
        ? (data.activeLevelId as LevelId)
        : 1,
      examScore: typeof data.examScore === 'number' ? data.examScore : undefined,
      certifiedDate: typeof data.certifiedDate === 'string' && data.certifiedDate ? data.certifiedDate : undefined,
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, progressPath);
    return null;
  }
}

// Merge local and cloud progress (keep maximum achievements)
export function mergeUserProgress(local: UserProgress, remote: Partial<UserProgress>): UserProgress {
  const mergedCompleted = Array.from(
    new Set([...(local.completedLevels || []), ...(remote.completedLevels || [])])
  ) as LevelId[];

  const mergedBadges = Array.from(
    new Set([...(local.unlockedBadges || []), ...(remote.unlockedBadges || [])])
  ) as BadgeId[];

  const mergedXp = Math.max(local.xp || 0, remote.xp || 0);
  const highestLevel = Math.max(local.activeLevelId || 1, remote.activeLevelId || 1) as LevelId;

  return {
    ...local,
    name: remote.name || local.name,
    xp: mergedXp,
    completedLevels: mergedCompleted,
    unlockedBadges: mergedBadges,
    activeLevelId: highestLevel,
    examScore: remote.examScore !== undefined ? Math.max(local.examScore || 0, remote.examScore) : local.examScore,
    certifiedDate: remote.certifiedDate || local.certifiedDate,
  };
}
