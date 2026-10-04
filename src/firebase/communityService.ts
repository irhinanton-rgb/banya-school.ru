import mqtt, { MqttClient } from 'mqtt';

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

// MQTT Topics for universal cross-device synchronization (PC <-> Phone <-> Tablet)
const MQTT_BROKER_URL = 'wss://broker.emqx.io:8084/mqtt';
const TOPIC_HISTORY = 'banya-school-ru/community/history-v1';
const TOPIC_STREAM = 'banya-school-ru/community/stream-v1';

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

// In-memory active listeners
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

// Global singleton MQTT client
let globalMqttClient: MqttClient | null = null;
let isMqttConnecting = false;

function getOrCreateMqttClient(): MqttClient | null {
  if (typeof window === 'undefined') return null;

  if (!globalMqttClient && !isMqttConnecting) {
    isMqttConnecting = true;
    try {
      const clientId = `banya_client_${Math.random().toString(36).substring(2, 9)}`;
      const client = mqtt.connect(MQTT_BROKER_URL, {
        clientId,
        clean: false,
        reconnectPeriod: 3000,
        connectTimeout: 5000,
      });

      client.on('connect', () => {
        isMqttConnecting = false;
        // Subscribe to live stream and retained history
        client.subscribe([TOPIC_HISTORY, TOPIC_STREAM], { qos: 0 });
      });

      client.on('message', (topic, payload) => {
        try {
          const raw = payload.toString();
          if (!raw) return;
          const parsed = JSON.parse(raw);

          if (topic === TOPIC_HISTORY && Array.isArray(parsed)) {
            // Received cloud retained history from another device (PC or Phone)
            const local = getCachedMessages();
            const mergedMap = new Map<string, CommunityMessage>();
            INITIAL_MESSAGES.forEach((m) => mergedMap.set(m.id, m));
            local.forEach((m) => mergedMap.set(m.id, m));
            parsed.forEach((m) => mergedMap.set(m.id, m));
            const merged = Array.from(mergedMap.values());
            saveCachedMessages(merged);
            notifyAllListeners(merged);
          } else if (topic === TOPIC_STREAM && parsed && typeof parsed === 'object' && parsed.id) {
            // Received live single message from another device
            const current = getCachedMessages();
            if (!current.some((m) => m.id === parsed.id)) {
              const updated = [...current, parsed as CommunityMessage];
              saveCachedMessages(updated);
              notifyAllListeners(updated);
            }
          }
        } catch {
          // ignore malformed packets
        }
      });

      client.on('error', () => {
        isMqttConnecting = false;
      });

      client.on('close', () => {
        isMqttConnecting = false;
      });

      globalMqttClient = client;
    } catch {
      isMqttConnecting = false;
    }
  }

  return globalMqttClient;
}

// Subscribe to real-time chat messages
export function subscribeToCommunityMessages(
  onMessages: (messages: CommunityMessage[]) => void
): () => void {
  activeChatListeners.add(onMessages);

  // Send current cached/local state immediately to prevent blank screen
  const current = getCachedMessages();
  onMessages(current);

  // Initialize and connect MQTT in background for cross-device sync
  getOrCreateMqttClient();

  return () => {
    activeChatListeners.delete(onMessages);
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

// Send a new message: updates local state + broadcasts instantly to PC / Phone via MQTT
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

  // 1. Instant local persistence & in-memory notification (0ms response)
  const current = getCachedMessages();
  const updated = [...current, newMsg];
  saveCachedMessages(updated);
  notifyAllListeners(updated);

  // 2. Real-time cross-device broadcast via MQTT (PC <-> Mobile)
  try {
    const client = getOrCreateMqttClient();
    if (client) {
      // Broadcast live to all connected devices
      client.publish(TOPIC_STREAM, JSON.stringify(newMsg), { qos: 0 });

      // Retain the updated history so any device connecting later gets all messages
      const historyToRetain = updated.slice(-50);
      client.publish(TOPIC_HISTORY, JSON.stringify(historyToRetain), { qos: 0, retain: true });
    }
  } catch (err) {
    console.warn('MQTT sync warning', err);
  }

  return newMsg;
}

export interface ClubMember {
  id: string;
  name: string;
  role: 'mentor' | 'master' | 'student';
  roleTitle: string;
  avatar?: string;
  xp: number;
  levelTitle: string;
  status: 'online' | 'in_banya' | 'idle';
  statusText: string;
  favoriteBrooms: string[];
  city?: string;
  bio?: string;
}

export interface DirectMessage {
  id: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  text: string;
  createdAt: string;
}

export const CLUB_MEMBERS: ClubMember[] = [
  {
    id: 'mentor_anton',
    name: 'Антон Ирхин',
    role: 'mentor',
    roleTitle: 'Основатель & Главный Наставник',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
    xp: 2500,
    levelTitle: 'Гранд-Мастер Пара',
    status: 'online',
    statusText: 'В сети · Отвечает на вопросы',
    favoriteBrooms: ['Дуб кавказский', 'Пихта сибирская', 'Эвкалипт'],
    city: 'Москва / Санкт-Петербург',
    bio: '15 лет банной практики. Основатель школы правильного пара. Автор методики бережного бесконтактного прогрева и работы парой веников.',
  },
  {
    id: 'user_mikhail',
    name: 'Михаил Ковалёв',
    role: 'student',
    roleTitle: 'Подмастерье',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    xp: 320,
    levelTitle: 'Уровень 2: Подмастерье',
    status: 'online',
    statusText: 'В сети · Изучает 3-й уровень',
    favoriteBrooms: ['Берёза кудрявая', 'Дуб'],
    city: 'Екатеринбург',
    bio: 'Обучаюсь для домашней семейной бани. Отрабатываю омахивание и компрессы на стопы.',
  },
  {
    id: 'user_elena',
    name: 'Елена Смирнова',
    role: 'student',
    roleTitle: 'Ученица Академии',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    xp: 150,
    levelTitle: 'Уровень 1: Новичок',
    status: 'online',
    statusText: 'В сети · Сдаёт видео-ДЗ',
    favoriteBrooms: ['Липа медовая', 'Берёза'],
    city: 'Казань',
    bio: 'Люблю мягкий травяной пар и ароматерапию. Учусь правильно греть стопы без перегрева головы.',
  },
  {
    id: 'user_dmitry',
    name: 'Дмитрий Волков',
    role: 'master',
    roleTitle: 'Мастер Пара',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
    xp: 890,
    levelTitle: 'Уровень 5: Старший Пармастер',
    status: 'in_banya',
    statusText: 'В парной 🔥 · Парит гостей',
    favoriteBrooms: ['Красный дуб', 'Можжевельник', 'Полынь'],
    city: 'Новосибирск',
    bio: 'Профессиональный банщик в загородном банном комплексе. Повышаю квалификацию по технике двух веников.',
  },
];

// Direct messages storage key prefix
const STORAGE_DM_KEY_PREFIX = 'banya_dm_';

export function getConversationKey(userId1: string, userId2: string): string {
  return [userId1, userId2].sort().join('_');
}

export function loadDirectMessages(userId1: string, userId2: string): DirectMessage[] {
  const convKey = getConversationKey(userId1, userId2);
  try {
    const saved = localStorage.getItem(`${STORAGE_DM_KEY_PREFIX}${convKey}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }

  // If conversation is with the mentor Anton Irkhin, provide an initial welcome direct message
  if (userId1 === 'mentor_anton' || userId2 === 'mentor_anton') {
    return [
      {
        id: `dm_welcome_${convKey}`,
        senderId: 'mentor_anton',
        senderName: 'Антон Ирхин',
        recipientId: userId1 === 'mentor_anton' ? userId2 : userId1,
        text: 'Здравствуйте! Это ваш персональный диалог со мной. Задавайте любые вопросы по технике парения, присылайте видео на разбор или консультируйтесь по подготовке вашей парной.',
        createdAt: 'Сегодня в 10:00',
      },
    ];
  }

  return [];
}

export function saveDirectMessages(userId1: string, userId2: string, msgs: DirectMessage[]) {
  const convKey = getConversationKey(userId1, userId2);
  try {
    localStorage.setItem(`${STORAGE_DM_KEY_PREFIX}${convKey}`, JSON.stringify(msgs.slice(-100)));
  } catch {
    // ignore
  }
}

// Active listeners for direct messages
const activeDmListeners = new Map<string, Set<(msgs: DirectMessage[]) => void>>();

export function subscribeToDirectMessages(
  userId1: string,
  userId2: string,
  onMessages: (msgs: DirectMessage[]) => void
): () => void {
  const convKey = getConversationKey(userId1, userId2);

  if (!activeDmListeners.has(convKey)) {
    activeDmListeners.set(convKey, new Set());
  }
  activeDmListeners.get(convKey)!.add(onMessages);

  // Send current cached messages immediately
  const initial = loadDirectMessages(userId1, userId2);
  onMessages(initial);

  // Subscribe to MQTT topic for this conversation
  const client = getOrCreateMqttClient();
  const topic = `banya-school-ru/dm/${convKey}`;
  if (client) {
    client.subscribe(topic, { qos: 0 });

    const handleMessage = (incomingTopic: string, payload: Buffer) => {
      if (incomingTopic === topic) {
        try {
          const parsed = JSON.parse(payload.toString());
          if (parsed && typeof parsed === 'object' && parsed.id) {
            const current = loadDirectMessages(userId1, userId2);
            if (!current.some((m) => m.id === parsed.id)) {
              const updated = [...current, parsed as DirectMessage];
              saveDirectMessages(userId1, userId2, updated);
              activeDmListeners.get(convKey)?.forEach((listener) => {
                try {
                  listener(updated);
                } catch {
                  // ignore
                }
              });
            }
          }
        } catch {
          // ignore
        }
      }
    };

    client.on('message', handleMessage);

    return () => {
      activeDmListeners.get(convKey)?.delete(onMessages);
      client.off('message', handleMessage);
    };
  }

  return () => {
    activeDmListeners.get(convKey)?.delete(onMessages);
  };
}

export async function sendDirectMessage(
  senderId: string,
  senderName: string,
  recipientId: string,
  text: string
): Promise<DirectMessage> {
  const convKey = getConversationKey(senderId, recipientId);
  const newMsg: DirectMessage = {
    id: `dm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    senderId,
    senderName,
    recipientId,
    text,
    createdAt: new Date().toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    }),
  };

  // 1. Instant local persistence & in-memory notify
  const current = loadDirectMessages(senderId, recipientId);
  const updated = [...current, newMsg];
  saveDirectMessages(senderId, recipientId, updated);

  activeDmListeners.get(convKey)?.forEach((listener) => {
    try {
      listener(updated);
    } catch {
      // ignore
    }
  });

  // 2. Real-time cross-device broadcast via MQTT
  try {
    const client = getOrCreateMqttClient();
    if (client) {
      const topic = `banya-school-ru/dm/${convKey}`;
      client.publish(topic, JSON.stringify(newMsg), { qos: 0 });
    }
  } catch (err) {
    console.warn('DM MQTT sync warning', err);
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
