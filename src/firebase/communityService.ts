import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  setDoc,
  doc,
} from 'firebase/firestore';
import { db } from './config';

export interface CommunityMessage {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  authorRole: 'mentor' | 'student' | 'admin';
  text: string;
  createdAt: string;
  levelBadge?: string;
}

export interface HomeworkSubmission {
  id: string;
  studentId: string;
  studentName: string;
  techniqueId: string;
  techniqueName: string;
  videoUrl: string;
  comment?: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'needs_work';
  mentorFeedback?: string;
  xpAwarded?: number;
}

const STORAGE_CHAT_KEY = 'banya_community_chat_v1';
const STORAGE_HOMEWORK_KEY = 'banya_homework_submissions_v1';

export const INITIAL_MESSAGES: CommunityMessage[] = [
  {
    id: 'msg_seed_1',
    authorId: 'mentor_anton',
    authorName: 'Антон Ирхин',
    authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
    authorRole: 'mentor',
    text: 'Приветствую всех участников Академии Банного Мастерства! Рад видеть новые лица. В этом общем чате мы делимся опытом, разбираем ошибки и помогаем друг другу на пути к званию Мастера Пара.',
    createdAt: 'Сегодня в 10:15',
    levelBadge: 'Основатель & Наставник',
  },
  {
    id: 'msg_seed_2',
    authorId: 'user_mikhail',
    authorName: 'Михаил Ковалёв',
    authorRole: 'student',
    text: 'Здравствуйте! Попробовал сегодня омахивание по видео из 2-й главы — совсем другие ощущения у гостя, чем когда просто лупишь веником. Пар ложится мягко, без ожогов.',
    createdAt: 'Сегодня в 11:40',
    levelBadge: 'Уровень 2: Подмастерье',
  },
  {
    id: 'msg_seed_3',
    authorId: 'mentor_anton',
    authorName: 'Антон Ирхин',
    authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
    authorRole: 'mentor',
    text: 'Именно так, Михаил! Веник — это в первую очередь инструмент нагнетания и распределения пара, а не оружие. В эту субботу в 18:00 проведем эфир в видеокомнате и разберем этот приём подробнее.',
    createdAt: 'Сегодня в 12:05',
    levelBadge: 'Основатель & Наставник',
  },
  {
    id: 'msg_seed_4',
    authorId: 'user_elena',
    authorName: 'Елена Смирнова',
    authorRole: 'student',
    text: 'Подскажите, а если дубовый веник немного пересох, сколько минут его лучше держать в теплой воде перед парением?',
    createdAt: 'Сегодня в 13:20',
    levelBadge: 'Уровень 1: Новичок',
  },
  {
    id: 'msg_seed_5',
    authorId: 'mentor_anton',
    authorName: 'Антон Ирхин',
    authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
    authorRole: 'mentor',
    text: 'Елена, ни в коем случае не опускайте сухой веник в крутой кипяток — лист сварится и облетит за 3 минуты. Достаточно 10–15 минут в теплой воде (45–50°C), а затем завернуть в полиэтиленовый пакет или влажное полотенце и положить на полку в теплой парной на 10 минут. Лист станет шелковым!',
    createdAt: 'Сегодня в 13:35',
    levelBadge: 'Основатель & Наставник',
  },
];

export const INITIAL_HOMEWORKS: HomeworkSubmission[] = [
  {
    id: 'hw_1',
    studentId: 'user_mikhail',
    studentName: 'Михаил Ковалёв',
    techniqueId: 'omakhivanie',
    techniqueName: 'Омахивание',
    videoUrl: 'https://vk.com/video-example-1',
    comment: 'Записал видео отработки омахивания. Обратите внимание на положение кисти во время обратного маха.',
    submittedAt: 'Вчера, 16:30',
    status: 'approved',
    mentorFeedback: 'Отличная амплитуда! Кисть расслаблена, плечо не зажимаете. В следующем подходе попробуйте чуть плавнее опускать горячий пар на стопы гостя. Зачёт!',
    xpAwarded: 50,
  },
  {
    id: 'hw_2',
    studentId: 'user_elena',
    studentName: 'Елена Смирнова',
    techniqueId: 'priparka',
    techniqueName: 'Припарка',
    videoUrl: 'https://disk.yandex.ru/i/example-2',
    comment: 'Припарка на поясничную зону. Пар захватываю сверху, но кажется, что остывает быстрее, чем прижимаю.',
    submittedAt: 'Сегодня, 11:15',
    status: 'needs_work',
    mentorFeedback: 'Хороший старт, но перехват веника делайте быстрее — не держите его долго на воздухе, иначе температура теряется. Попробуйте накрывать вторым веником сверху сразу при касании.',
    xpAwarded: 25,
  },
];

// Active listeners for instantaneous live chat updates across components and tabs
const activeChatListeners = new Set<(messages: CommunityMessage[]) => void>();

function notifyAllListeners(msgs: CommunityMessage[]) {
  activeChatListeners.forEach((listener) => {
    try {
      listener(msgs);
    } catch {
      // ignore
    }
  });
}

// Subscribe to real-time chat messages
export function subscribeToCommunityMessages(
  onMessages: (messages: CommunityMessage[]) => void
): () => void {
  activeChatListeners.add(onMessages);

  // Send current cached/local state immediately to prevent blank screen
  const current = getCachedMessages();
  onMessages(current);

  // If Firestore is available, try to subscribe in background
  let unsubscribeFirestore = () => {};

  if (db) {
    try {
      const q = query(
        collection(db, 'community_messages'),
        limit(50)
      );

      unsubscribeFirestore = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const cloudMsgs: CommunityMessage[] = [];
            snapshot.forEach((docSnap) => {
              cloudMsgs.push(docSnap.data() as CommunityMessage);
            });
            // Merge with local messages to ensure nothing is lost
            const local = getCachedMessages();
            const mergedMap = new Map<string, CommunityMessage>();
            INITIAL_MESSAGES.forEach((m) => mergedMap.set(m.id, m));
            local.forEach((m) => mergedMap.set(m.id, m));
            cloudMsgs.forEach((m) => mergedMap.set(m.id, m));
            const merged = Array.from(mergedMap.values());
            saveCachedMessages(merged);
            notifyAllListeners(merged);
          }
        },
        () => {
          // Cloud permission or network fallback
          onMessages(getCachedMessages());
        }
      );
    } catch {
      onMessages(getCachedMessages());
    }
  }

  return () => {
    activeChatListeners.delete(onMessages);
    unsubscribeFirestore();
  };
}

function getCachedMessages(): CommunityMessage[] {
  try {
    const saved = localStorage.getItem(STORAGE_CHAT_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return INITIAL_MESSAGES;
}

function saveCachedMessages(msgs: CommunityMessage[]) {
  try {
    localStorage.setItem(STORAGE_CHAT_KEY, JSON.stringify(msgs.slice(-100)));
  } catch {
    // ignore
  }
}

// Send a new message with 0ms optimistic delivery
export async function sendCommunityMessage(
  msg: Omit<CommunityMessage, 'id' | 'createdAt'>
): Promise<CommunityMessage> {
  const newMsg: CommunityMessage = {
    ...msg,
    id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    createdAt: new Date().toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    }),
  };

  // 1. Instant local persistence & in-memory broadcast (0ms delay)
  const current = getCachedMessages();
  const updated = [...current, newMsg];
  saveCachedMessages(updated);
  notifyAllListeners(updated);

  // 2. Background push to Firestore (if authenticated & online)
  if (db) {
    try {
      await setDoc(doc(db, 'community_messages', newMsg.id), newMsg);
    } catch (err) {
      // Gracefully continue using local sync if Firestore rules require auth
      console.info('Message stored locally in Community Chat');
    }
  }

  return newMsg;
}

// Homework submissions management
export function loadHomeworkSubmissions(): HomeworkSubmission[] {
  try {
    const saved = localStorage.getItem(STORAGE_HOMEWORK_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return INITIAL_HOMEWORKS;
}

export function submitHomework(
  submission: Omit<HomeworkSubmission, 'id' | 'submittedAt' | 'status'>
): HomeworkSubmission {
  const newHw: HomeworkSubmission = {
    ...submission,
    id: `hw_${Date.now()}`,
    submittedAt: `Сегодня, ${new Date().toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    })}`,
    status: 'pending',
  };

  try {
    const current = loadHomeworkSubmissions();
    const updated = [newHw, ...current];
    localStorage.setItem(STORAGE_HOMEWORK_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }

  return newHw;
}
