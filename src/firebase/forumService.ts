import { db } from './config';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  addDoc,
  query,
  orderBy,
  limit,
  onSnapshot
} from 'firebase/firestore';

export type ForumCategory =
  | 'courses'
  | 'techniques'
  | 'stove_building'
  | 'herbs'
  | 'business'
  | 'qa';

export type PostType = 'course' | 'program' | 'article' | 'discussion' | 'question';

export interface ForumProgramStep {
  title: string;
  duration: string;
  description: string;
}

export interface ForumPost {
  id: string;
  title: string;
  category: ForumCategory;
  categoryTitle?: string;
  categoryLabel?: string;
  postType: PostType;
  summary: string;
  content: string;
  authorId: string;
  authorName: string;
  authorRole: 'mentor' | 'master' | 'student' | 'pro';
  authorCity?: string;
  authorTelegram?: string;
  price?: string;
  programSteps?: ForumProgramStep[];
  tags: string[];
  likesCount: number;
  likedBy: string[];
  commentsCount: number;
  createdAt: string;
  isPinned?: boolean;
}

export interface ForumComment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  text: string;
  createdAt: string;
}

const STORAGE_POSTS_KEY = 'banya_school_forum_posts_v1';
const STORAGE_COMMENTS_KEY = 'banya_school_forum_comments_v1';

export const CATEGORY_LABELS: Record<ForumCategory, { label: string; icon: string }> = {
  courses: { label: 'Авторские курсы & Программы', icon: '🎓' },
  techniques: { label: 'Венечные техники & Связки', icon: '🍃' },
  stove_building: { label: 'Печи, Каменки & Срубы', icon: '🪵' },
  herbs: { label: 'Фитотерапия & Запарки', icon: '🌿' },
  business: { label: 'Бизнес, Заказы & Сервис', icon: '💼' },
  qa: { label: 'Вопросы & Совет наставника', icon: '❓' },
};

export const INITIAL_FORUM_POSTS: ForumPost[] = [
  {
    id: 'post_seed_1',
    title: 'Методика преподавания: Базовый курс постановки рук пармастера (15 лет опыта)',
    category: 'courses',
    categoryLabel: 'Авторские курсы & Программы',
    postType: 'course',
    summary: 'Полная авторская программа обучения новичков и подмастерьев: от эргономики стойки до спаренных техник без усталости спины.',
    content: `Коллеги и ученики! За 15 лет непрерывной практики в парных я вывел ключевое правило: пармастер устаёт не от пара, а от некорректной биомеханики.

В этой программе собрана база, которую я передаю каждому ученику:
1. Правильная стойка: колени пружинят, таз подкручен, спина прямая. Никаких наклонов к полку на пояснице!
2. Хват веника: держим ручку как птицу — не сжимаем до белых костяшек, а даём венику дышать.
3. Удар идёт от стопы и переноса веса тела через корпус, а не силой плеча.

Делюсь методичкой и готов ответить на вопросы по подготовке веников и эргономике работы в 4 руки.`,
    authorId: 'mentor_anton',
    authorName: 'Антон Ирхин',
    authorRole: 'mentor',
    authorCity: 'Россия',
    authorTelegram: '@irhinanton',
    price: 'Бесплатно для сообщества',
    programSteps: [
      { title: 'Модуль 1', duration: '2 часа', description: 'Биомеханика стойки, постановка кистевого хвата и дыхание в парной.' },
      { title: 'Модуль 2', duration: '3 часа', description: 'Отработка 8 классических приёмов веника под метроном.' },
      { title: 'Модуль 3', duration: '3 часа', description: 'Контрастные процедуры, второе дыхание и безопасность гостя.' }
    ],
    tags: ['обучение', 'постановка рук', 'эргономика', 'авторский курс'],
    likesCount: 38,
    likedBy: [],
    commentsCount: 3,
    createdAt: 'Октябрь 2026',
    isPinned: true
  },
  {
    id: 'post_seed_2',
    title: 'Техкарта парения «Таёжный Антистресс» с донником и пихтовым шатром (45 мин)',
    category: 'courses',
    categoryLabel: 'Авторские курсы & Программы',
    postType: 'program',
    summary: 'Готовая коммерческая программа мягкого сенсорного парения: пошаговый тайминг, раскладка трав и температурный коридор 55–60°C.',
    content: `Друзья, делюсь своей самой востребованной гостевой программой для людей с высоким уровнем стресса и бессонницей.

Особенности программы:
• Никаких резких обжигающих ударов — работа только широким опахиванием и липовыми вениками.
• Обязательно укладываем гостя на матрас из свежего донника (кумарин мягко снижает вязкость крови и успокаивает нервную систему).
• На лицо — прохладный веер из сибирской пихты.

Используйте в своей практике и адаптируйте под свои парные!`,
    authorId: 'master_vitaly',
    authorName: 'Виталий Смирнов',
    authorRole: 'master',
    authorCity: 'Санкт-Петербург',
    price: 'Открытый опыт',
    programSteps: [
      { title: '1. Аромазнакомство', duration: '8 мин', description: 'Мягкий бесконтактный прогрев, подача настоя таволги, ингаляция пихтой.' },
      { title: '2. Венечный лад', duration: '15 мин', description: 'Волновое прогревание липовыми и дубовыми вениками, припарки на стопы.' },
      { title: '3. Тёплая проливка', duration: '7 мин', description: 'Обливание тёплой водой через веники, мягкий выход и укутывание в кокон.' }
    ],
    tags: ['программа парения', 'донник', 'пихта', 'релакс', 'техкарта'],
    likesCount: 24,
    likedBy: [],
    commentsCount: 2,
    createdAt: 'Октябрь 2026',
    isPinned: false
  },
  {
    id: 'post_seed_3',
    title: 'Камни для закрытой каменки: почему жадеит и нефрит окупаются за 3 месяца',
    category: 'stove_building',
    categoryLabel: 'Печи, Каменки & Срубы',
    postType: 'article',
    summary: 'Практический опыт замены речного базальта на колотый жадеит и нефрит: разница в теплоёмкости, отсутствие пыли и лёгкий пар 500°C.',
    content: `Многие экономят на закладке и засыпают в каменку дешевый габбро-диабаз, а потом жалуются, что камни трескаются за пару месяцев и пылят серой пылью в легкие.

Я перевёл свои коммерческие печи на колотый жадеит (в ядро) и сортовой нефрит (наверх).
Результаты за год:
1. Жадеит держит 550°C без разрушения и не дает ни грамма песка.
2. Теплоёмкость на 20% выше: печь требует меньше дров для поддержания ядреного пара.
3. Пар получается ультрамелким и прозрачным — гости в восторге.

Делитесь в комментариях, у кого какие камни лежат в печи!`,
    authorId: 'master_sergey',
    authorName: 'Сергей Дронов',
    authorRole: 'pro',
    authorCity: 'Екатеринбург',
    tags: ['печь', 'камни', 'жадеит', 'нефрит', 'закрытая каменка'],
    likesCount: 19,
    likedBy: [],
    commentsCount: 4,
    createdAt: 'Октябрь 2026',
    isPinned: false
  }
];

export const INITIAL_FORUM_COMMENTS: Record<string, ForumComment[]> = {
  post_seed_1: [
    {
      id: 'comm_1',
      postId: 'post_seed_1',
      authorId: 'student_1',
      authorName: 'Дмитрий Волков',
      authorRole: 'Мастер-стажёр',
      text: 'Антон, спасибо за акцент на работу ног! Раньше после 3 гостей поясница отваливалась, а как начал переносить вес тела — могу парить весь день без усталости.',
      createdAt: '2 дня назад'
    },
    {
      id: 'comm_2',
      postId: 'post_seed_1',
      authorId: 'mentor_anton',
      authorName: 'Антон Ирхин',
      authorRole: 'Наставник',
      text: 'Дмитрий, именно в этом суть банного мастерства! Сохраняем собственное здоровье, чтобы дарить силу гостям.',
      createdAt: 'Вчера'
    }
  ],
  post_seed_2: [
    {
      id: 'comm_3',
      postId: 'post_seed_2',
      authorId: 'master_elena',
      authorName: 'Елена Румянцева',
      authorRole: 'Пармейстер',
      text: 'Шикарная программа! Мы добавили в финал ещё проливку головы отваром ромашки — клиенты просто спят на кушетке.',
      createdAt: '1 день назад'
    }
  ]
};

// --- Storage & Sync Helpers ---

function getStoredPosts(): ForumPost[] {
  try {
    const raw = localStorage.getItem(STORAGE_POSTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore
  }
  return INITIAL_FORUM_POSTS;
}

function saveStoredPosts(posts: ForumPost[]) {
  try {
    localStorage.setItem(STORAGE_POSTS_KEY, JSON.stringify(posts));
  } catch {
    // ignore
  }
}

function getStoredComments(postId: string): ForumComment[] {
  try {
    const raw = localStorage.getItem(`${STORAGE_COMMENTS_KEY}_${postId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore
  }
  return INITIAL_FORUM_COMMENTS[postId] || [];
}

function saveStoredComments(postId: string, comments: ForumComment[]) {
  try {
    localStorage.setItem(`${STORAGE_COMMENTS_KEY}_${postId}`, JSON.stringify(comments));
  } catch {
    // ignore
  }
}

// --- Public Service Functions ---

export async function fetchForumPosts(): Promise<ForumPost[]> {
  const local = getStoredPosts();
  try {
    const colRef = collection(db, 'forum_posts');
    const q = query(colRef, limit(40));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const remotePosts: ForumPost[] = [];
      snap.forEach((docSnap) => {
        const data = docSnap.data() as ForumPost;
        remotePosts.push({ ...data, id: docSnap.id });
      });

      // Merge remote with local ensuring seed items remain
      const mergedMap = new Map<string, ForumPost>();
      local.forEach((p) => mergedMap.set(p.id, p));
      remotePosts.forEach((p) => mergedMap.set(p.id, p));
      const res = Array.from(mergedMap.values());
      saveStoredPosts(res);
      return res;
    }
  } catch (err) {
    console.warn('Firestore forum read fallback to local cache:', err);
  }
  return local;
}

export async function createForumPost(newPost: Omit<ForumPost, 'id' | 'likesCount' | 'likedBy' | 'commentsCount' | 'createdAt'>): Promise<ForumPost> {
  const post: ForumPost = {
    ...newPost,
    id: `post_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    likesCount: 0,
    likedBy: [],
    commentsCount: 0,
    createdAt: 'Только что'
  };

  // 1. Save locally
  const current = getStoredPosts();
  const updated = [post, ...current];
  saveStoredPosts(updated);

  // 2. Sync to Firestore
  try {
    const docRef = doc(db, 'forum_posts', post.id);
    await setDoc(docRef, post);
  } catch (err) {
    console.warn('Firestore forum post sync failed (saved locally):', err);
  }

  return post;
}

export async function toggleLikePost(postId: string, userId: string): Promise<ForumPost | null> {
  const current = getStoredPosts();
  const idx = current.findIndex((p) => p.id === postId);
  if (idx === -1) return null;

  const post = current[idx];
  const hasLiked = post.likedBy.includes(userId);
  const updatedLikedBy = hasLiked
    ? post.likedBy.filter((id) => id !== userId)
    : [...post.likedBy, userId];
  const updatedLikesCount = Math.max(0, post.likesCount + (hasLiked ? -1 : 1));

  const updatedPost: ForumPost = {
    ...post,
    likedBy: updatedLikedBy,
    likesCount: updatedLikesCount
  };

  current[idx] = updatedPost;
  saveStoredPosts(current);

  try {
    const docRef = doc(db, 'forum_posts', postId);
    await updateDoc(docRef, {
      likedBy: updatedLikedBy,
      likesCount: updatedLikesCount
    });
  } catch (err) {
    console.warn('Firestore like sync failed:', err);
  }

  return updatedPost;
}

export async function fetchPostComments(postId: string): Promise<ForumComment[]> {
  const local = getStoredComments(postId);
  try {
    const colRef = collection(db, 'forum_posts', postId, 'comments');
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      const remote: ForumComment[] = [];
      snap.forEach((d) => remote.push({ ...(d.data() as ForumComment), id: d.id }));
      saveStoredComments(postId, remote);
      return remote;
    }
  } catch (err) {
    console.warn('Firestore comments read fallback:', err);
  }
  return local;
}

export async function addPostComment(
  postId: string,
  authorId: string,
  authorName: string,
  authorRole: string,
  text: string
): Promise<ForumComment> {
  const comment: ForumComment = {
    id: `comm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    postId,
    authorId,
    authorName,
    authorRole,
    text: text.trim(),
    createdAt: 'Только что'
  };

  // Local update
  const local = getStoredComments(postId);
  const updatedComments = [...local, comment];
  saveStoredComments(postId, updatedComments);

  // Update post comment count
  const posts = getStoredPosts();
  const pIdx = posts.findIndex((p) => p.id === postId);
  if (pIdx !== -1) {
    posts[pIdx].commentsCount = (posts[pIdx].commentsCount || 0) + 1;
    saveStoredPosts(posts);
  }

  // Firestore update
  try {
    const docRef = doc(db, 'forum_posts', postId, 'comments', comment.id);
    await setDoc(docRef, comment);

    const postDocRef = doc(db, 'forum_posts', postId);
    await updateDoc(postDocRef, {
      commentsCount: updatedComments.length
    });
  } catch (err) {
    console.warn('Firestore comment sync failed:', err);
  }

  return comment;
}
