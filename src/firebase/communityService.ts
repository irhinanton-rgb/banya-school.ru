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

// Subscribe to real-time chat messages
export function subscribeToCommunityMessages(
  onMessages: (messages: CommunityMessage[]) => void
): () => void {
  // If Firestore is available, try to subscribe
  if (db) {
    try {
      const q = query(
        collection(db, 'community_messages'),
        orderBy('createdAt', 'asc'),
        limit(50)
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const msgs: CommunityMessage[] = [];
            snapshot.forEach((docSnap) => {
              msgs.push(docSnap.data() as CommunityMessage);
            });
            onMessages(msgs);
            return;
          }
          // If empty in cloud, fallback to local
          loadLocalMessages(onMessages);
        },
        () => {
          loadLocalMessages(onMessages);
        }
      );

      return unsubscribe;
    } catch {
      loadLocalMessages(onMessages);
    }
  } else {
    loadLocalMessages(onMessages);
  }

  return () => {};
}

function loadLocalMessages(onMessages: (messages: CommunityMessage[]) => void) {
  try {
    const saved = localStorage.getItem(STORAGE_CHAT_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        onMessages(parsed);
        return;
      }
    }
  } catch {
    // ignore
  }
  onMessages(INITIAL_MESSAGES);
}

// Send a new message
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

  // 1. Save to local storage for instant feedback
  try {
    const saved = localStorage.getItem(STORAGE_CHAT_KEY);
    const existing: CommunityMessage[] = saved ? JSON.parse(saved) : [...INITIAL_MESSAGES];
    const updated = [...existing, newMsg];
    localStorage.setItem(STORAGE_CHAT_KEY, JSON.stringify(updated.slice(-100)));
  } catch {
    // ignore
  }

  // 2. Try pushing to Firestore
  if (db) {
    try {
      await setDoc(doc(db, 'community_messages', newMsg.id), newMsg);
    } catch (err) {
      console.warn('Firestore message sync fallback to local', err);
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
