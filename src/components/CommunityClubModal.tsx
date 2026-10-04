import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  MessageSquare,
  Video,
  Award,
  Send,
  Users,
  Radio,
  ExternalLink,
  PlusCircle,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Mic,
  Camera,
  Maximize2,
  Calendar,
} from 'lucide-react';
import { UserProgress } from '../types/banya';
import { useAuth } from '../firebase/AuthContext';
import {
  CommunityMessage,
  HomeworkSubmission,
  subscribeToCommunityMessages,
  sendCommunityMessage,
  loadHomeworkSubmissions,
  submitHomework,
} from '../firebase/communityService';
import { BROOM_TECHNIQUES } from '../data/courseData';
import { playWoodTap, playSuccessChime } from '../utils/audio';

interface CommunityClubModalProps {
  isOpen: boolean;
  onClose: () => void;
  progress: UserProgress;
  onGrantXp?: (amount: number) => void;
  initialTab?: 'chat' | 'webinar' | 'homework';
}

export const CommunityClubModal: React.FC<CommunityClubModalProps> = ({
  isOpen,
  onClose,
  progress,
  onGrantXp,
  initialTab = 'chat',
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'chat' | 'webinar' | 'homework'>(initialTab);

  // Chat State
  const [messages, setMessages] = useState<CommunityMessage[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Video Conference State
  const [isRoomActive, setIsRoomActive] = useState<boolean>(false);
  const [roomName, setRoomName] = useState<string>('BanyaSchoolAcademyRoom');

  // Homework State
  const [homeworks, setHomeworks] = useState<HomeworkSubmission[]>([]);
  const [showHwForm, setShowHwForm] = useState<boolean>(false);
  const [selectedTechId, setSelectedTechId] = useState<string>(BROOM_TECHNIQUES[1].id); // default omakhivanie
  const [hwVideoUrl, setHwVideoUrl] = useState<string>('');
  const [hwComment, setHwComment] = useState<string>('');

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (!isOpen) return;

    // Subscribe to chat messages
    const unsubscribe = subscribeToCommunityMessages((newMsgs) => {
      setMessages(newMsgs);
    });

    // Load homework submissions
    setHomeworks(loadHomeworkSubmissions());

    return () => {
      unsubscribe();
    };
  }, [isOpen]);

  useEffect(() => {
    if (activeTab === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab]);

  if (!isOpen) return null;

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || isSending) return;

    setIsSending(true);
    playWoodTap(progress.soundEnabled);

    const authorName = user?.displayName || progress.name || 'Ученик Академии';
    const authorRole = user?.email?.includes('irhinanton') ? 'mentor' : 'student';

    const newMsg = await sendCommunityMessage({
      authorId: user?.uid || 'guest_user',
      authorName,
      authorAvatar: user?.photoURL || undefined,
      authorRole,
      text: inputMessage.trim(),
      levelBadge: authorRole === 'mentor' ? 'Основатель & Наставник' : `Уровень: ${progress.xp} XP`,
    });

    // Immediate 0ms local state update so user never needs to reload page
    setMessages((prev) => {
      if (prev.some((m) => m.id === newMsg.id)) return prev;
      return [...prev, newMsg];
    });

    setInputMessage('');
    setIsSending(false);
  };

  const handleSubmitHomework = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hwVideoUrl.trim()) return;

    const tech = BROOM_TECHNIQUES.find((t) => t.id === selectedTechId) || BROOM_TECHNIQUES[0];
    const newSubmission = submitHomework({
      studentId: user?.uid || 'guest_user',
      studentName: user?.displayName || progress.name || 'Ученик Академии',
      techniqueId: tech.id,
      techniqueName: tech.name,
      videoUrl: hwVideoUrl.trim(),
      comment: hwComment.trim() || undefined,
    });

    setHomeworks([newSubmission, ...homeworks]);
    setHwVideoUrl('');
    setHwComment('');
    setShowHwForm(false);
    playSuccessChime(progress.soundEnabled);
    if (onGrantXp) onGrantXp(25);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-5xl h-[90vh] max-h-[800px] flex flex-col rounded-2xl bg-stone-950 border border-stone-800 shadow-2xl overflow-hidden">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-800/80 bg-stone-900/90">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-stone-950 shadow-md">
              <Users className="w-5 h-5 text-stone-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-100">
                  Банный Клуб & Онлайн-Эфиры
                </h3>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-semibold">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  18 онлайн
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Единое пространство: общение учеников, видеоконференции с наставником и разбор техники
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors cursor-pointer"
            aria-label="Закрыть окно клуба"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-2 px-5 py-2.5 bg-stone-900/50 border-b border-stone-800/80 overflow-x-auto scrollbar-thin">
          <button
            onClick={() => {
              setActiveTab('chat');
              playWoodTap(progress.soundEnabled);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'chat'
                ? 'bg-amber-500 text-stone-950 shadow-md'
                : 'bg-stone-900/80 text-stone-300 hover:bg-stone-800 border border-stone-800'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Общий Чат Сообщества</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${activeTab === 'chat' ? 'bg-stone-950/20 text-stone-950' : 'bg-amber-500/20 text-amber-300'}`}>
              {messages.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('webinar');
              playWoodTap(progress.soundEnabled);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'webinar'
                ? 'bg-amber-500 text-stone-950 shadow-md'
                : 'bg-stone-900/80 text-stone-300 hover:bg-stone-800 border border-stone-800'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>Видеоконференции & Эфиры</span>
            <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400 font-bold border border-red-500/30">
              <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-ping" />
              Live
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('homework');
              playWoodTap(progress.soundEnabled);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'homework'
                ? 'bg-amber-500 text-stone-950 shadow-md'
                : 'bg-stone-900/80 text-stone-300 hover:bg-stone-800 border border-stone-800'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Проверка Видео-Заданий</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${activeTab === 'homework' ? 'bg-stone-950/20 text-stone-950' : 'bg-stone-800 text-stone-400'}`}>
              {homeworks.length}
            </span>
          </button>
        </div>

        {/* Tab 1: Community Chat */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col overflow-hidden bg-gradient-to-b from-stone-950 to-stone-900">
            {/* Pinned Announcement */}
            <div className="px-5 py-2.5 bg-amber-500/10 border-b border-amber-500/20 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-amber-200">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  <strong>Субботний разбор:</strong> Задавайте вопросы по технике парения и веникам, наставник отвечает в чате и на созвонах!
                </span>
              </div>
              <button
                onClick={() => setActiveTab('webinar')}
                className="text-[11px] text-amber-300 hover:underline font-semibold shrink-0 cursor-pointer"
              >
                Расписание эфиров →
              </button>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {messages.map((msg) => {
                const isMentor = msg.authorRole === 'mentor';
                const isCurrentUser = user && msg.authorId === user.uid;

                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 max-w-2xl ${
                      isCurrentUser ? 'ml-auto flex-row-reverse' : ''
                    }`}
                  >
                    {/* Avatar */}
                    {msg.authorAvatar ? (
                      <img
                        src={msg.authorAvatar}
                        alt={msg.authorName}
                        className="h-9 w-9 rounded-xl object-cover border border-stone-700 shrink-0 mt-0.5"
                      />
                    ) : (
                      <div
                        className={`h-9 w-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                          isMentor
                            ? 'bg-amber-500 text-stone-950 border border-amber-400'
                            : 'bg-stone-800 text-stone-300 border border-stone-700'
                        }`}
                      >
                        {msg.authorName.slice(0, 1).toUpperCase()}
                      </div>
                    )}

                    {/* Message Bubble */}
                    <div
                      className={`rounded-2xl p-3.5 space-y-1 ${
                        isCurrentUser
                          ? 'bg-amber-500 text-stone-950 shadow-md'
                          : isMentor
                          ? 'bg-stone-900 border border-amber-500/40 text-stone-200 shadow-lg'
                          : 'bg-stone-900/90 border border-stone-800 text-stone-200 shadow-sm'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-bold ${
                            isCurrentUser
                              ? 'text-stone-950'
                              : isMentor
                              ? 'text-amber-300'
                              : 'text-stone-200'
                          }`}
                        >
                          {msg.authorName}
                        </span>

                        {isMentor && (
                          <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-medium">
                            👑 Наставник
                          </span>
                        )}

                        {msg.levelBadge && !isMentor && (
                          <span
                            className={`text-[10px] ${
                              isCurrentUser ? 'text-stone-800' : 'text-stone-400'
                            }`}
                          >
                            {msg.levelBadge}
                          </span>
                        )}

                        <span
                          className={`text-[10px] ml-auto ${
                            isCurrentUser ? 'text-stone-800' : 'text-stone-500'
                          }`}
                        >
                          {msg.createdAt}
                        </span>
                      </div>

                      <p
                        className={`text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                          isCurrentUser ? 'text-stone-950 font-medium' : 'text-stone-300'
                        }`}
                      >
                        {msg.text}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Question Chips */}
            <div className="px-4 py-2 bg-stone-950/80 border-t border-stone-800/80 flex items-center gap-2 overflow-x-auto scrollbar-thin">
              <span className="text-[11px] text-stone-500 shrink-0">Частые вопросы:</span>
              {[
                'Как правильно запарить дубовый веник?',
                'Какая температура идеальна для первого захода?',
                'Как не обжечь руки паром при припарке?',
              ].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setInputMessage(chip)}
                  className="px-2.5 py-1 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-amber-300 text-[11px] whitespace-nowrap border border-stone-800 transition-colors cursor-pointer"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Chat Input Bar */}
            <form
              onSubmit={handleSendMessage}
              className="p-3 sm:p-4 bg-stone-900 border-t border-stone-800 flex items-center gap-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Напишите вопрос по технике, веникам или поделитесь опытом..."
                className="flex-1 bg-stone-950 border border-stone-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isSending}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-stone-950 font-bold text-xs sm:text-sm transition-all shadow-md cursor-pointer active:scale-95"
              >
                <span>Отправить</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* Tab 2: Video Conferences & Webinars */}
        {activeTab === 'webinar' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-stone-950 space-y-6">
            
            {/* Live WebRTC Meeting Room - Mobile Optimized */}
            <div className="rounded-2xl border border-stone-800 bg-stone-900/90 p-5 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
                    <Radio className="w-4 h-4 text-red-400 animate-pulse" />
                    <span>Онлайн-комната разборов в реальном времени</span>
                  </div>
                  <h4 className="font-serif text-lg sm:text-xl font-bold text-stone-100 mt-1">
                    Интерактивная Видеокомната Академии
                  </h4>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Подключение в 1 клик со смартфона (iOS/Android) или компьютера без VPN и без регистрации
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    Комната открыта
                  </span>
                </div>
              </div>

              {/* Mobile-Friendly Main Action Card */}
              <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 border border-amber-500/30 text-center space-y-4 shadow-xl">
                <div className="h-16 w-16 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
                  <Video className="w-8 h-8" />
                </div>

                <div className="max-w-md mx-auto space-y-1.5">
                  <h5 className="font-serif text-lg sm:text-xl font-bold text-stone-100">
                    Прямой эфир и видеосозвоны с мастером
                  </h5>
                  <p className="text-xs text-stone-400 leading-relaxed">
                    Для смартфонов (iPhone и Android) видеокомната открывается в полноэкранном режиме с чистым доступом к микрофону и камере без сбоев.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <a
                    href={`https://meet.jit.si/${roomName}#config.prejoinPageEnabled=false&config.startWithAudioMuted=true`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-stone-950 font-bold text-sm shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Video className="w-5 h-5 text-stone-950" />
                    <span>Войти в видеокомнату (Прямой эфир) ⚡</span>
                    <ExternalLink className="w-4 h-4 text-stone-900" />
                  </a>

                  <button
                    type="button"
                    onClick={() => setIsRoomActive(!isRoomActive)}
                    className="w-full sm:w-auto px-4 py-3.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold border border-stone-700 transition-colors cursor-pointer"
                  >
                    {isRoomActive ? 'Скрыть встроенное видео' : 'Встроить видео на страницу (для ПК)'}
                  </button>
                </div>

                {/* Mobile note */}
                <p className="text-[11px] text-stone-400 flex items-center justify-center gap-1.5 pt-1">
                  <span>📱</span>
                  <span>На телефоне нажмите <strong>«Войти в видеокомнату»</strong> — браузер сразу запросит доступ к микрофону</span>
                </p>
              </div>

              {/* Embedded Video (Optional for Desktop / Tablet) */}
              {isRoomActive && (
                <div className="w-full relative aspect-video rounded-xl overflow-hidden bg-stone-950 border border-stone-800 animate-fade-in shadow-2xl">
                  <iframe
                    src={`https://meet.jit.si/${roomName}#config.prejoinPageEnabled=false&config.startWithAudioMuted=true&config.startWithVideoMuted=false`}
                    title="Видеоконференция Академии Банного Мастерства"
                    className="w-full h-full border-0"
                    allow="camera *; microphone *; display-capture *; autoplay *; clipboard-write *; fullscreen *"
                  />
                </div>
              )}

              {/* Reliable Russian Meeting Alternatives */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-stone-300">
                  Резервные российские каналы связи (100% стабильность без VPN):
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <a
                    href="https://telemost.yandex.ru"
                    target="_blank"
                    rel="noreferrer"
                    className="p-3.5 rounded-xl bg-stone-950 hover:bg-stone-800/80 border border-stone-800 hover:border-amber-500/40 transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm">
                        ЯТ
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-stone-200 text-xs group-hover:text-amber-300">
                          Яндекс Телемост
                        </div>
                        <div className="text-[11px] text-stone-400">
                          Без ограничений по времени, работает в РФ
                        </div>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-stone-500 group-hover:text-amber-300" />
                  </a>

                  <a
                    href="https://vk.com/calls"
                    target="_blank"
                    rel="noreferrer"
                    className="p-3.5 rounded-xl bg-stone-950 hover:bg-stone-800/80 border border-stone-800 hover:border-blue-500/40 transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm">
                        VK
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-stone-200 text-xs group-hover:text-blue-300">
                          VK Звонки
                        </div>
                        <div className="text-[11px] text-stone-400">
                          Удобно через приложение ВКонтакте на телефоне
                        </div>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-stone-500 group-hover:text-blue-300" />
                  </a>
                </div>
              </div>
            </div>

            {/* Upcoming Live Sessions Schedule */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-stone-200 font-bold text-sm">
                <Calendar className="w-4 h-4 text-amber-400" />
                <span>Расписание живых мастер-классов и созвонов</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-stone-900 border border-stone-800 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-semibold">
                      Суббота, 18:00 МСК
                    </span>
                    <span className="text-stone-400">Длительность: 1.5 часа</span>
                  </div>
                  <h5 className="font-bold text-stone-100 text-sm">
                    Разбор техники работы вениками: Опахивание, Двойка и Припарка
                  </h5>
                  <p className="text-xs text-stone-400 leading-relaxed">
                    Наставник покажет правильную траекторию кисти на живом полке, разберет ошибки из домашних заданий и ответит на вопросы учеников.
                  </p>
                  <div className="pt-2 flex items-center justify-between border-t border-stone-800 text-xs">
                    <span className="text-amber-400 font-medium">Спикер: Антон Ирхин</span>
                    <a
                      href={`https://meet.jit.si/${roomName}#config.prejoinPageEnabled=false&config.startWithAudioMuted=true`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-300 hover:underline font-semibold flex items-center gap-1"
                    >
                      <span>Подключиться к эфиру</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-stone-900 border border-stone-800 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-semibold">
                      Среда, 19:30 МСК
                    </span>
                    <span className="text-stone-400">Длительность: 1 час</span>
                  </div>
                  <h5 className="font-bold text-stone-100 text-sm">
                    Секреты банной кондиции 60/60 и создание парового пирога
                  </h5>
                  <p className="text-xs text-stone-400 leading-relaxed">
                    Теория и практика управления влажностью и жаром в парной. Как не обжечь гостя и получить легкий, бархатный пар.
                  </p>
                  <div className="pt-2 flex items-center justify-between border-t border-stone-800 text-xs">
                    <span className="text-emerald-400 font-medium">Спикер: Ведущий пармейстер</span>
                    <span className="text-stone-500 text-[11px]">Запись будет в клубе</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Tab 3: Homework Submissions */}
        {activeTab === 'homework' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-stone-950 space-y-6">
            
            {/* Header with Submit Action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-stone-900 border border-stone-800">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
                  <Award className="w-4 h-4" />
                  <span>Аттестация и обратная связь</span>
                </div>
                <h4 className="font-serif text-lg sm:text-xl font-bold text-stone-100 mt-1">
                  Проверка Видео-Заданий Мастером
                </h4>
                <p className="text-xs text-stone-400 mt-1 max-w-xl leading-relaxed">
                  Запишите короткое видео (15–45 секунд) отработки любого приёма с веником. Наставник лично отсмотрит видео, даст рекомендации по постановке рук и начислит +50 XP.
                </p>
              </div>

              <button
                onClick={() => setShowHwForm(!showHwForm)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm transition-all shadow-md shrink-0 cursor-pointer active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{showHwForm ? 'Скрыть форму' : 'Сдать видео на проверку'}</span>
              </button>
            </div>

            {/* Submission Form (Collapsible) */}
            {showHwForm && (
              <form
                onSubmit={handleSubmitHomework}
                className="p-5 rounded-2xl bg-stone-900 border border-amber-500/40 space-y-4 animate-fade-in"
              >
                <h5 className="font-bold text-amber-200 text-sm">
                  Отправка видео на рецензию пармейстеру:
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1.5">
                      Приём из курса:
                    </label>
                    <select
                      value={selectedTechId}
                      onChange={(e) => setSelectedTechId(e.target.value)}
                      className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
                    >
                      {BROOM_TECHNIQUES.map((tech) => (
                        <option key={tech.id} value={tech.id}>
                          {tech.name} ({tech.tempo})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1.5">
                      Ссылка на видео (VK / Яндекс Диск / Rutube / Telegram / Облако):
                    </label>
                    <input
                      type="text"
                      required
                      value={hwVideoUrl}
                      onChange={(e) => setHwVideoUrl(e.target.value)}
                      placeholder="https://vk.com/video... или ссылка на диск"
                      className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1.5">
                    Комментарий для наставника (на что обратить внимание):
                  </label>
                  <textarea
                    rows={2}
                    value={hwComment}
                    onChange={(e) => setHwComment(e.target.value)}
                    placeholder="Например: Посмотрите, пожалуйста, правильно ли сгибается локоть при нагнетании тепла..."
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowHwForm(false)}
                    className="px-4 py-2 rounded-xl text-xs text-stone-400 hover:text-stone-200 cursor-pointer"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition-colors cursor-pointer"
                  >
                    Отправить на проверку (+25 XP)
                  </button>
                </div>
              </form>
            )}

            {/* List of Submissions */}
            <div className="space-y-4">
              <h5 className="font-bold text-stone-200 text-sm">
                История сданных работ и рецензии:
              </h5>

              <div className="space-y-3">
                {homeworks.map((hw) => {
                  return (
                    <div
                      key={hw.id}
                      className="p-4 rounded-xl bg-stone-900 border border-stone-800 space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-stone-100 text-sm">
                            Приём: «{hw.techniqueName}»
                          </span>
                          <span className="text-xs text-stone-400">
                            • {hw.studentName}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {hw.status === 'approved' && (
                            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Принято (+{hw.xpAwarded || 50} XP)</span>
                            </span>
                          )}
                          {hw.status === 'needs_work' && (
                            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30">
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>Требует доработки (+{hw.xpAwarded || 25} XP)</span>
                            </span>
                          )}
                          {hw.status === 'pending' && (
                            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-stone-800 text-stone-300 text-xs font-semibold border border-stone-700">
                              <Clock className="w-3.5 h-3.5 text-amber-400" />
                              <span>На проверке у куратора</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Video Link & Comment */}
                      <div className="text-xs space-y-1">
                        <div className="flex items-center gap-2 text-stone-400">
                          <span>Видеозапись:</span>
                          <a
                            href={hw.videoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-amber-400 hover:underline flex items-center gap-1 font-mono"
                          >
                            <span>{hw.videoUrl}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                        {hw.comment && (
                          <p className="text-stone-300 italic bg-stone-950/60 p-2.5 rounded-lg border border-stone-800/80">
                            «{hw.comment}»
                          </p>
                        )}
                      </div>

                      {/* Mentor Feedback Box */}
                      {hw.mentorFeedback && (
                        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 space-y-1 text-xs">
                          <div className="flex items-center gap-1.5 font-bold text-amber-300">
                            <span>👑 Рецензия наставника (Антон Ирхин):</span>
                          </div>
                          <p className="text-stone-200 leading-relaxed">
                            {hw.mentorFeedback}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
