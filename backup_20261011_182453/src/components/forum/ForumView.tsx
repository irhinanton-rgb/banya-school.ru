import React, { useState, useEffect, useMemo } from 'react';
import {
  ForumPost,
  ForumComment,
  ForumCategory,
  PostType,
  CATEGORY_LABELS,
  fetchForumPosts,
  createForumPost,
  toggleLikePost,
  fetchPostComments,
  addPostComment,
} from '../../firebase/forumService';
import { UserProgress } from '../../types/banya';
import { useAuth } from '../../firebase/AuthContext';
import {
  MessageSquare,
  Search,
  PlusCircle,
  ThumbsUp,
  Tag,
  Clock,
  Send,
  User,
  MapPin,
  ExternalLink,
  Sparkles,
  BookOpen,
  Filter,
  CheckCircle2,
  X,
  Share2,
  Award,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface ForumViewProps {
  progress: UserProgress;
  onOpenPricing?: () => void;
  onOpenAuth?: () => void;
}

export const ForumView: React.FC<ForumViewProps> = ({ progress, onOpenAuth }) => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ForumCategory | 'all'>('all');
  const [filterType, setFilterType] = useState<PostType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [activePost, setActivePost] = useState<ForumPost | null>(null);
  const [activeComments, setActiveComments] = useState<ForumComment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // New post form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<ForumCategory>('courses');
  const [newPostType, setNewPostType] = useState<PostType>('course');
  const [newSummary, setNewSummary] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newTelegram, setNewTelegram] = useState('');
  const [newPrice, setNewPrice] = useState('Бесплатно для сообщества');
  const [newTags, setNewTags] = useState('курс, парение, практика');
  const [hasSteps, setHasSteps] = useState(false);
  const [steps, setSteps] = useState([
    { title: 'Шаг 1. Знакомство и ароматерапия', duration: '10 мин', description: 'Бесконтактный прогрев и ингаляция травами.' },
    { title: 'Шаг 2. Основной венечный прогрев', duration: '20 мин', description: 'Ритмическая проработка спины, икр и стоп.' },
  ]);

  const currentUserId = user?.uid || (progress.name ? `local_${progress.name}` : 'guest_master');
  const currentUserName = user?.displayName || progress.name || 'Мастер Парения';
  const isAnton = progress.name?.toLowerCase().includes('ирхин') || Boolean(progress.isAdmin);

  useEffect(() => {
    fetchForumPosts().then(setPosts);
  }, []);

  // Fetch comments when viewing a post
  useEffect(() => {
    if (activePost) {
      fetchPostComments(activePost.id).then(setActiveComments);
    }
  }, [activePost]);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesCat = selectedCategory === 'all' || post.category === selectedCategory;
      const matchesType = filterType === 'all' || post.postType === filterType;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        post.title.toLowerCase().includes(q) ||
        post.summary.toLowerCase().includes(q) ||
        post.authorName.toLowerCase().includes(q) ||
        (post.authorCity && post.authorCity.toLowerCase().includes(q)) ||
        post.tags.some((t) => t.toLowerCase().includes(q));

      return matchesCat && matchesType && matchesSearch;
    });
  }, [posts, selectedCategory, filterType, searchQuery]);

  const handleLike = async (post: ForumPost, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = await toggleLikePost(post.id, currentUserId);
    if (updated) {
      setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      if (activePost && activePost.id === updated.id) {
        setActivePost(updated);
      }
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePost || !commentText.trim()) return;

    setIsSubmittingComment(true);
    try {
      const newComment = await addPostComment(
        activePost.id,
        currentUserId,
        currentUserName,
        isAnton ? 'Главный Наставник 👑' : progress.completedLevels.length >= 4 ? 'Опытный Пармейстер' : 'Мастер',
        commentText
      );
      setActiveComments((prev) => [...prev, newComment]);
      setCommentText('');
      setPosts((prev) =>
        prev.map((p) => (p.id === activePost.id ? { ...p, commentsCount: p.commentsCount + 1 } : p))
      );
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleCreatePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const parsedTags = newTags
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    const created = await createForumPost({
      title: newTitle.trim(),
      category: newCategory,
      categoryTitle: CATEGORY_LABELS[newCategory].label,
      postType: newPostType,
      summary: newSummary.trim() || newContent.trim().slice(0, 150) + '...',
      content: newContent.trim(),
      authorId: currentUserId,
      authorName: currentUserName,
      authorRole: isAnton ? 'mentor' : progress.completedLevels.length >= 4 ? 'master' : 'pro',
      authorCity: newCity.trim() || undefined,
      authorTelegram: newTelegram.trim() || undefined,
      price: newPrice.trim() || undefined,
      programSteps: hasSteps ? steps : undefined,
      tags: parsedTags.length > 0 ? parsedTags : ['баня', 'опыт'],
      isPinned: isAnton,
    });

    setPosts((prev) => [created, ...prev]);
    setIsCreatingPost(false);
    // Reset form
    setNewTitle('');
    setNewSummary('');
    setNewContent('');
    setActivePost(created);
  };

  const handleAddStep = () => {
    setSteps((prev) => [
      ...prev,
      { title: `Шаг ${prev.length + 1}`, duration: '15 мин', description: 'Описание действия...' },
    ]);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Forum Hero Header */}
      <div className="rounded-3xl border border-stone-800 bg-gradient-to-br from-stone-900/95 via-stone-900/80 to-stone-950 p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-800 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber-400">
              <Sparkles className="h-4 w-4" />
              <span>Сообщество & База Опыта Мастеров</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-stone-100">
              Гильдия Пармастеров & Форум Программ
            </h1>
            <p className="text-xs sm:text-sm text-stone-400 max-w-3xl leading-relaxed">
              Открытая площадка, объединяющая пармастеров России и мира: публикуйте свои авторские курсы,
              демонстрируйте программы парения, делитесь секретами печей и находите единомышленников.
            </p>
          </div>

          <button
            onClick={() => setIsCreatingPost(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg cursor-pointer transform hover:scale-102 shrink-0 self-start md:self-auto"
          >
            <PlusCircle className="w-4 h-4 stroke-[2.5]" />
            <span>Опубликовать курс / программу</span>
          </button>
        </div>

        {/* Search & Quick Filter Pills */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по курсам, авторам, городам, техникам (например: донник, пихта, 4 руки, Москва, закрытая каменка)..."
              className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-stone-950/90 border border-stone-700/80 text-stone-100 placeholder-stone-500 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200 cursor-pointer p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                  : 'bg-stone-950 text-stone-300 hover:bg-stone-800 border border-stone-800'
              }`}
            >
              🌟 Все темы ({posts.length})
            </button>
            {(Object.keys(CATEGORY_LABELS) as ForumCategory[]).map((cat) => {
              const info = CATEGORY_LABELS[cat];
              const count = posts.filter((p) => p.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                      : 'bg-stone-950 text-stone-300 hover:bg-stone-800 border border-stone-800'
                  }`}
                >
                  <span>{info.icon}</span>
                  <span>
                    {info.label} ({count})
                  </span>
                </button>
              );
            })}
          </div>

          {/* Type Filter Pills */}
          <div className="flex items-center gap-2 pt-1 text-xs text-stone-400 font-mono">
            <span className="flex items-center gap-1">
              <Filter className="w-3 h-3 text-amber-400" /> Тип:
            </span>
            {[
              { id: 'all', label: 'Все' },
              { id: 'course', label: '🎓 Авторские курсы' },
              { id: 'program', label: '📋 Техкарты парения' },
              { id: 'article', label: '📝 Статьи & Опыт' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setFilterType(t.id as PostType | 'all')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  filterType === t.id
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                    : 'bg-stone-900/60 hover:text-stone-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Posts Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filteredPosts.map((post) => {
          const hasLiked = post.likedBy.includes(currentUserId);
          const isCourse = post.postType === 'course';
          const isProgram = post.postType === 'program';

          return (
            <div
              key={post.id}
              onClick={() => setActivePost(post)}
              className="rounded-3xl border border-stone-800 bg-stone-900/90 hover:border-amber-500/40 p-6 space-y-4 shadow-xl transition-all cursor-pointer flex flex-col justify-between group hover:-translate-y-0.5"
            >
              <div className="space-y-3.5">
                {/* Header line: badges */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {post.isPinned && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 text-[10px] font-mono font-bold uppercase flex items-center gap-1">
                        📌 Закреплено Наставником
                      </span>
                    )}
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                        isCourse
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                          : isProgram
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-stone-800 text-stone-300'
                      }`}
                    >
                      {isCourse ? '🎓 КУРС' : isProgram ? '📋 ПРОГРАММА' : '📝 ОПЫТ'}
                    </span>
                    <span className="text-[11px] font-mono text-stone-400">
                      {CATEGORY_LABELS[post.category]?.icon} {CATEGORY_LABELS[post.category]?.label}
                    </span>
                  </div>

                  {post.price && (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-semibold whitespace-nowrap">
                      {post.price}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-100 group-hover:text-amber-200 transition-colors leading-snug">
                  {post.title}
                </h3>

                {/* Summary */}
                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed line-clamp-3">
                  {post.summary}
                </p>

                {/* Program steps preview if available */}
                {post.programSteps && post.programSteps.length > 0 && (
                  <div className="p-3 rounded-2xl bg-stone-950/80 border border-stone-800/80 space-y-1.5">
                    <div className="text-[10px] font-mono uppercase text-amber-400 font-semibold flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      <span>Пошаговый регламент ({post.programSteps.length} этапа):</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {post.programSteps.slice(0, 2).map((s, idx) => (
                        <div key={idx} className="p-2 rounded-xl bg-stone-900 border border-stone-800">
                          <strong className="text-stone-200 block text-[11px] font-semibold">{s.title}</strong>
                          <span className="text-amber-400 text-[10px] font-mono">{s.duration}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Author line & Stats */}
              <div className="pt-4 border-t border-stone-800/80 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-stone-950 font-bold font-serif text-xs shrink-0">
                    {post.authorName[0]}
                  </div>
                  <div>
                    <div className="font-semibold text-stone-200 flex items-center gap-1.5">
                      <span>{post.authorName}</span>
                      {post.authorRole === 'mentor' && (
                        <span className="text-[9px] px-1 rounded bg-amber-500/20 text-amber-300 font-mono">
                          👑
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-stone-400 flex items-center gap-1">
                      {post.authorCity && (
                        <>
                          <MapPin className="w-2.5 h-2.5" />
                          <span>{post.authorCity} ·</span>
                        </>
                      )}
                      <span>{post.createdAt}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => handleLike(post, e)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                      hasLiked
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                        : 'bg-stone-950 text-stone-400 hover:text-stone-200 border border-stone-800'
                    }`}
                  >
                    <ThumbsUp className={`w-3.5 h-3.5 ${hasLiked ? 'fill-amber-400' : ''}`} />
                    <span className="font-mono text-xs tabular-nums">{post.likesCount}</span>
                  </button>

                  <div className="flex items-center gap-1 text-stone-400 font-mono text-xs">
                    <MessageSquare className="w-3.5 h-3.5 text-stone-500" />
                    <span>{post.commentsCount}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredPosts.length === 0 && (
        <div className="rounded-3xl border border-stone-800 bg-stone-900/50 p-12 text-center space-y-4">
          <div className="text-4xl">🌾</div>
          <h4 className="font-serif text-xl font-bold text-stone-200">
            В этой категории пока нет опубликованных программ
          </h4>
          <p className="text-xs text-stone-400 max-w-md mx-auto">
            Будьте первым мастером, который поделится своим авторским опытом или предложит программу парения!
          </p>
          <button
            onClick={() => setIsCreatingPost(true)}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition-colors cursor-pointer"
          >
            Создать первую публикацию
          </button>
        </div>
      )}

      {/* MODAL 1: VIEW FULL POST & COMMENTS */}
      {activePost && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-5 overflow-y-auto bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-3xl rounded-t-3xl sm:rounded-3xl border-t sm:border border-amber-500/30 bg-stone-950 text-stone-100 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Header */}
            <div className="relative bg-gradient-to-r from-stone-900 via-stone-950 to-stone-900 border-b border-stone-800 p-5 sm:p-6 shrink-0 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono uppercase text-amber-400">
                    {CATEGORY_LABELS[activePost.category]?.icon} {CATEGORY_LABELS[activePost.category]?.label}
                  </span>
                  {activePost.price && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-mono">
                      {activePost.price}
                    </span>
                  )}
                </div>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-100">
                  {activePost.title}
                </h2>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleShare}
                  title="Поделиться ссылкой"
                  className="p-2 rounded-full bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-stone-100 transition-colors border border-stone-800 cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActivePost(null)}
                  className="p-2 rounded-full bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-stone-100 transition-colors border border-stone-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Body Scroll */}
            <div className="p-5 sm:p-6 space-y-6 overflow-y-auto">
              {copiedLink && (
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs text-center font-mono">
                  Ссылка скопирована в буфер обмена!
                </div>
              )}

              {/* Author Badge & Contacts */}
              <div className="p-4 rounded-2xl bg-stone-900/90 border border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-stone-950 font-bold font-serif text-base shrink-0 shadow-md">
                    {activePost.authorName[0]}
                  </div>
                  <div>
                    <div className="font-bold text-stone-100 flex items-center gap-1.5">
                      <span>{activePost.authorName}</span>
                      {activePost.authorRole === 'mentor' && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-semibold">
                          Основатель & Главный Наставник 👑
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-stone-400">
                      {activePost.authorCity ? `${activePost.authorCity} · ` : ''} Опубликовано: {activePost.createdAt}
                    </div>
                  </div>
                </div>

                {activePost.authorTelegram && (
                  <a
                    href={`https://t.me/${activePost.authorTelegram.replace('@', '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-semibold transition-colors cursor-pointer self-start sm:self-auto"
                  >
                    <span>Связаться с автором: {activePost.authorTelegram}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              {/* Full Content */}
              <div className="prose prose-invert max-w-none text-xs sm:text-sm text-stone-200 leading-relaxed whitespace-pre-line bg-stone-900/40 p-5 rounded-2xl border border-stone-800/80">
                {activePost.content}
              </div>

              {/* Program Steps Detailed View */}
              {activePost.programSteps && activePost.programSteps.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-serif font-bold text-base text-amber-300 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    <span>Пошаговый протокол программы парения:</span>
                  </h4>
                  <div className="space-y-2.5">
                    {activePost.programSteps.map((step, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-2xl bg-stone-900/80 border border-stone-800 space-y-1"
                      >
                        <div className="flex items-center justify-between text-amber-400 font-mono text-xs">
                          <strong className="text-stone-100 font-serif text-sm">{step.title}</strong>
                          <span className="px-2 py-0.5 rounded bg-stone-950 border border-stone-800">
                            ⏱️ {step.duration}
                          </span>
                        </div>
                        <p className="text-xs text-stone-300 leading-relaxed">{step.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags & Like Bar */}
              <div className="flex items-center justify-between gap-3 pt-3 border-t border-stone-800">
                <div className="flex flex-wrap gap-1.5">
                  {activePost.tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-stone-900 border border-stone-800 text-[10px] font-mono text-stone-400"
                    >
                      #{t}
                    </span>
                  ))}
                </div>

                <button
                  onClick={(e) => handleLike(activePost, e)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all cursor-pointer ${
                    activePost.likedBy.includes(currentUserId)
                      ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                      : 'bg-stone-900 text-stone-300 hover:bg-stone-800 border border-stone-800'
                  }`}
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span className="text-xs font-mono font-semibold">
                    {activePost.likesCount} {activePost.likesCount === 1 ? 'Одобрение' : 'Одобрений'}
                  </span>
                </button>
              </div>

              {/* Comments Section */}
              <div className="space-y-4 pt-4 border-t border-stone-800">
                <h4 className="font-serif font-bold text-base text-stone-100 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-amber-400" />
                  <span>Обсуждение мастеров ({activeComments.length}):</span>
                </h4>

                {/* Comments list */}
                <div className="space-y-3">
                  {activeComments.map((comm) => (
                    <div
                      key={comm.id}
                      className="p-3.5 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <strong className="text-stone-200">{comm.authorName}</strong>
                          <span className="text-[10px] font-mono text-amber-400/90 px-1.5 py-0.5 rounded bg-stone-950 border border-stone-800">
                            {comm.authorRole}
                          </span>
                        </div>
                        <span className="text-[10px] text-stone-500 font-mono">{comm.createdAt}</span>
                      </div>
                      <p className="text-xs text-stone-300 leading-relaxed whitespace-pre-wrap">
                        {comm.text}
                      </p>
                    </div>
                  ))}

                  {activeComments.length === 0 && (
                    <div className="text-xs text-stone-500 text-center py-4 italic">
                      Пока нет комментариев. Напишите своё мнение первым!
                    </div>
                  )}
                </div>

                {/* Add Comment Input Form */}
                <form onSubmit={handleAddComment} className="flex gap-2 pt-2">
                  <input
                    type="text"
                    required
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Напишите вопрос автору или свой отзыв о программе..."
                    className="flex-1 px-4 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-stone-100 placeholder-stone-500 text-xs focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="submit"
                    disabled={isSubmittingComment || !commentText.trim()}
                    className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shrink-0"
                  >
                    <span>{isSubmittingComment ? '...' : 'Ответить'}</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: CREATE NEW POST / COURSE / PROGRAM */}
      {isCreatingPost && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-5 overflow-y-auto bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-2xl rounded-t-3xl sm:rounded-3xl border-t sm:border border-amber-500/40 bg-stone-950 text-stone-100 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Header */}
            <div className="relative bg-gradient-to-r from-stone-900 via-stone-950 to-stone-900 border-b border-stone-800 p-5 sm:p-6 shrink-0 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-amber-400">
                  Публикация в сообществе
                </span>
                <h3 className="font-serif text-xl font-bold text-stone-100">
                  Добавить свой курс, программу или опыт
                </h3>
              </div>
              <button
                onClick={() => setIsCreatingPost(false)}
                className="p-2 rounded-full bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-stone-100 transition-colors border border-stone-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreatePostSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto text-xs">
              {/* Type and Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-stone-400 mb-1">
                    Тип публикации:
                  </label>
                  <select
                    value={newPostType}
                    onChange={(e) => setNewPostType(e.target.value as PostType)}
                    className="w-full px-3 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-stone-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="course">🎓 Авторский курс / Обучение</option>
                    <option value="program">📋 Программа парения (Техкарта)</option>
                    <option value="article">📝 Практическая статья / Опыт</option>
                    <option value="discussion">💬 Обсуждение / Вопрос к гильдии</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-stone-400 mb-1">
                    Категория форума:
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as ForumCategory)}
                    className="w-full px-3 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-stone-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="courses">Авторские курсы & Программы</option>
                    <option value="techniques">Венечные техники & Связки</option>
                    <option value="stove_building">Печи, Каменки & Срубы</option>
                    <option value="herbs">Фитотерапия & Запарки</option>
                    <option value="business">Бизнес, Заказы & Сервис</option>
                    <option value="qa">Вопросы & Совет наставника</option>
                  </select>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-[11px] font-mono text-stone-400 mb-1">
                  Название темы / программы:
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Например: Авторская программа «Сибирский пар в 4 руки» (40 мин)"
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-stone-100 focus:outline-none focus:border-amber-500 text-xs"
                />
              </div>

              {/* Summary */}
              <div>
                <label className="block text-[11px] font-mono text-stone-400 mb-1">
                  Краткое описание (1-2 предложения для карточки):
                </label>
                <input
                  type="text"
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  placeholder="Краткая суть: для кого подходит, ключевые особенности и результаты..."
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-stone-100 focus:outline-none focus:border-amber-500 text-xs"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-[11px] font-mono text-stone-400 mb-1">
                  Полное описание, методика или текст темы:
                </label>
                <textarea
                  required
                  rows={6}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Подробно опишите вашу программу, приёмы, используемые веники, температурный режим и советы коллегам..."
                  className="w-full px-4 py-3 rounded-xl bg-stone-900 border border-stone-800 text-stone-100 focus:outline-none focus:border-amber-500 text-xs leading-relaxed"
                />
              </div>

              {/* Program steps toggle */}
              <div className="p-3.5 rounded-2xl bg-stone-900 border border-stone-800 space-y-3">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-stone-200">
                  <input
                    type="checkbox"
                    checked={hasSteps}
                    onChange={(e) => setHasSteps(e.target.checked)}
                    className="rounded border-stone-700 bg-stone-950 text-amber-500 focus:ring-0"
                  />
                  <span>Добавить пошаговые этапы парения с таймингом</span>
                </label>

                {hasSteps && (
                  <div className="space-y-2.5 pt-1">
                    {steps.map((st, sIdx) => (
                      <div key={sIdx} className="grid grid-cols-12 gap-2 bg-stone-950 p-2.5 rounded-xl border border-stone-800">
                        <div className="col-span-8">
                          <input
                            type="text"
                            value={st.title}
                            onChange={(e) => {
                              const copy = [...steps];
                              copy[sIdx].title = e.target.value;
                              setSteps(copy);
                            }}
                            placeholder="Название этапа"
                            className="w-full bg-stone-900 p-1.5 rounded border border-stone-800 text-stone-200 text-xs"
                          />
                        </div>
                        <div className="col-span-4">
                          <input
                            type="text"
                            value={st.duration}
                            onChange={(e) => {
                              const copy = [...steps];
                              copy[sIdx].duration = e.target.value;
                              setSteps(copy);
                            }}
                            placeholder="Время (напр. 15 мин)"
                            className="w-full bg-stone-900 p-1.5 rounded border border-stone-800 text-amber-300 text-xs font-mono"
                          />
                        </div>
                        <div className="col-span-12">
                          <input
                            type="text"
                            value={st.description}
                            onChange={(e) => {
                              const copy = [...steps];
                              copy[sIdx].description = e.target.value;
                              setSteps(copy);
                            }}
                            placeholder="Что делаем: веники, температура, приёмы"
                            className="w-full bg-stone-900 p-1.5 rounded border border-stone-800 text-stone-300 text-xs"
                          />
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={handleAddStep}
                      className="text-amber-400 hover:text-amber-300 font-mono text-[11px] cursor-pointer"
                    >
                      + Добавить ещё шаг
                    </button>
                  </div>
                )}
              </div>

              {/* Extra metadata: Price, City, Telegram */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-stone-400 mb-1">
                    Условия / Стоимость:
                  </label>
                  <input
                    type="text"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    placeholder="Бесплатно / 3 000 ₽"
                    className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-100 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-stone-400 mb-1">
                    Город / Регион:
                  </label>
                  <input
                    type="text"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    placeholder="Москва / СПб / Казань"
                    className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-100 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-stone-400 mb-1">
                    Telegram для связи:
                  </label>
                  <input
                    type="text"
                    value={newTelegram}
                    onChange={(e) => setNewTelegram(e.target.value)}
                    placeholder="@username"
                    className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-100 text-xs"
                  />
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-[11px] font-mono text-stone-400 mb-1">
                  Теги (через запятую):
                </label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="дуб, пар, авторский курс, здоровье"
                  className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-100 text-xs"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreatingPost(false)}
                  className="px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 font-semibold cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
                >
                  Опубликовать в сообществе
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
