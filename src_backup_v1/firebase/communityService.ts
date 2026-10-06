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

const STORAGE_CHAT_KEY = 'banya_community_chat_v2';
const STORAGE_HOMEWORK_KEY = 'banya_homework_submissions_v2';

// MQTT Topics for universal cross-device synchronization (PC <-> Phone <-> Tablet)
const MQTT_BROKER_URL = 'wss://broker.emqx.io:8084/mqtt';
const TOPIC_HISTORY = 'banya-school-ru/community/history-v2';
const TOPIC_STREAM = 'banya-school-ru/community/stream-v2';

export const INITIAL_MESSAGES: CommunityMessage[] = [
  {
    id: 'msg_seed_1',
    authorId: 'mentor_anton',
    authorName: 'Антон Ирхин',
    authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
    authorRole: 'mentor',
    text: 'Приветствую участников Академии Банного Мастерства! Этот чат открыт для живого общения, вопросов по технике парения, ароматерапии и разбора банных ситуаций. Задавайте вопросы — отвечу лично.',
    createdAt: 'Официальное обращение',
    levelBadge: 'Основатель & Наставник',
  },
];

export const INITIAL_HOMEWORKS: HomeworkSubmission[] = [];

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
        // Filter out any legacy fake messages
        const clean = parsed.filter(
          (m) =>
            m.authorId !== 'user_mikhail' &&
            m.authorId !== 'user_elena' &&
            m.authorId !== 'user_dmitry'
        );
        return clean.length > 0 ? clean : INITIAL_MESSAGES;
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
    statusText: 'Наставник курса',
    favoriteBrooms: ['Дуб кавказский', 'Пихта сибирская', 'Эвкалипт узколистный'],
    city: 'Москва / Санкт-Петербург',
    bio: '15 лет банной практики. Основатель школы правильного пара. Автор методики бережного бесконтактного прогрева и работы парой веников.',
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
        return parsed.filter(
          (hw) => hw.studentId !== 'user_mikhail' && hw.studentId !== 'user_elena'
        );
      }
    }
  } catch {
    // ignore
  }
  return [];
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

// Admin message deletion
export function deleteCommunityMessage(messageId: string): void {
  try {
    const current = getCachedMessages();
    const updated = current.filter((m) => m.id !== messageId);
    saveCachedMessages(updated);
    notifyAllListeners(updated);

    const client = getOrCreateMqttClient();
    if (client) {
      client.publish(TOPIC_HISTORY, JSON.stringify(updated.slice(-50)), { qos: 0, retain: true });
    }
  } catch (err) {
    console.warn('Failed to delete message:', err);
  }
}

// Admin homework review
export function reviewHomework(
  hwId: string,
  status: 'approved' | 'needs_work',
  mentorFeedback: string,
  xpAwarded: number = 50
): HomeworkSubmission[] {
  const current = loadHomeworkSubmissions();
  const updated = current.map((hw) => {
    if (hw.id === hwId) {
      return {
        ...hw,
        status,
        mentorFeedback,
        xpAwarded,
      };
    }
    return hw;
  });

  try {
    localStorage.setItem(STORAGE_HOMEWORK_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }

  return updated;
}

// Admin banned users list
const STORAGE_BANNED_KEY = 'banya_banned_users';

export function getBannedUsers(): string[] {
  try {
    const saved = localStorage.getItem(STORAGE_BANNED_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function banUser(userId: string): string[] {
  const current = getBannedUsers();
  if (!current.includes(userId)) {
    const updated = [...current, userId];
    try {
      localStorage.setItem(STORAGE_BANNED_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
    return updated;
  }
  return current;
}

export function unbanUser(userId: string): string[] {
  const current = getBannedUsers();
  const updated = current.filter((id) => id !== userId);
  try {
    localStorage.setItem(STORAGE_BANNED_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
  return updated;
}
