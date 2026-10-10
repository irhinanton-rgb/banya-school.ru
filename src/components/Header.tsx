import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Trophy,
  Volume2,
  VolumeX,
  Award,
  BookOpen,
  User as UserIcon,
  Users,
  ChevronDown,
  ChevronRight,
  Flame,
  MessageSquare,
  Lock,
  Menu,
  X,
  CreditCard,
  FileText,
  AlertTriangle,
  Bot,
  Hammer,
} from 'lucide-react';
import { LevelId, UserProgress } from '../types/banya';
import { useAuth } from '../firebase/AuthContext';

export interface HeaderProps {
  progress: UserProgress;
  onToggleSound: () => void;
  onOpenLeaderboard: () => void;
  onOpenCertificate: () => void;
  onNavigateToLevel: (levelId: LevelId) => void;
  onOpenEmergency: () => void;
  onOpenAuth: () => void;
  onOpenProfile: () => void;
  onOpenPricing: () => void;
  onOpenClub: () => void;
  onOpenAssistant?: () => void;
  onOpenLegal?: (tab: 'offer' | 'privacy' | 'requisites') => void;
  onShowInDevelopment?: (featureName: string) => void;
  onRequireLevel3?: (featureName: string) => void;
  activeTab: 'quest' | 'simulators' | 'handbook' | 'forum';
  setActiveTab: (tab: 'quest' | 'simulators' | 'handbook' | 'forum') => void;
  onGoToHome?: () => void;
  onStartLearning?: () => void;
  onOpenQuestMap?: () => void;
  isQuestMapActive?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  progress,
  onToggleSound,
  onOpenLeaderboard,
  onOpenCertificate,
  onOpenEmergency,
  onOpenAuth,
  onOpenProfile,
  onOpenPricing,
  onOpenClub,
  onOpenAssistant,
  onOpenLegal,
  onShowInDevelopment,
  onRequireLevel3,
  activeTab,
  setActiveTab,
  onGoToHome,
  onStartLearning,
  onOpenQuestMap,
  isQuestMapActive,
}) => {
  const { user } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const quickNavScrollRef = useRef<HTMLDivElement>(null);

  const isAdmin = user?.email?.toLowerCase() === 'irhinanton@gmail.com' || Boolean(progress.isAdmin);
  const isMasterPro = isAdmin || progress.isPaid || progress.tariff === 'master_pro';
  const completedCount = progress.completedLevels ? progress.completedLevels.length : 0;
  const isCourseCompleted =
    Boolean(progress.certifiedDate) ||
    Boolean(progress.completedLevels && progress.completedLevels.includes(7)) ||
    completedCount >= 7;
  const displayAvatar = progress.avatarUrl || user?.photoURL;
  const displayName = progress.name || user?.displayName || (isAdmin ? 'Антон Ирхин' : 'Пармастер');

  // Level 3 requirement for Simulators and Handbook
  const isLevel3Unlocked = Boolean(
    isAdmin ||
    progress.activeLevelId >= 3 ||
    (progress.completedLevels && progress.completedLevels.some((l) => l >= 2))
  );

  const handleSimulatorsClick = () => {
    if (!isLevel3Unlocked) {
      if (onRequireLevel3) {
        onRequireLevel3('Тренажеры и Симуляторы');
      }
      return;
    }
    setActiveTab('simulators');
    setDropdownOpen(false);
    setMobileDrawerOpen(false);
  };

  const handleHandbookClick = () => {
    if (!isLevel3Unlocked) {
      if (onRequireLevel3) {
        onRequireLevel3('Банный Справочник');
      }
      return;
    }
    setActiveTab('handbook');
    setDropdownOpen(false);
    setMobileDrawerOpen(false);
  };

  const handleClubClick = () => {
    if (!isAdmin) {
      if (onShowInDevelopment) {
        onShowInDevelopment('Банный Клуб & Эфиры');
      }
      return;
    }
    onOpenClub();
    setDropdownOpen(false);
    setMobileDrawerOpen(false);
  };

  const handleForumClick = () => {
    if (!isAdmin) {
      if (onShowInDevelopment) {
        onShowInDevelopment('Форум Мастеров');
      }
      return;
    }
    setActiveTab('forum');
    setDropdownOpen(false);
    setMobileDrawerOpen(false);
  };

  // Close desktop dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Prevent background scroll when mobile drawer is open
  useEffect(() => {
    if (mobileDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileDrawerOpen]);

  // Handle escape key to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileDrawerOpen(false);
        setDropdownOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleQuestMapAction = () => {
    if (onOpenQuestMap) {
      onOpenQuestMap();
    } else if (onStartLearning) {
      onStartLearning();
    } else {
      setActiveTab('quest');
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-stone-800/80 bg-stone-950/95 backdrop-blur-md">
        {/* Top Header Bar */}
        <div className="mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">
          
          {/* Top Left: Logo */}
          <button
            onClick={() => {
              if (onGoToHome) {
                onGoToHome();
              } else {
                setActiveTab('quest');
              }
            }}
            className="flex items-center gap-2.5 sm:gap-3 text-left transition-opacity hover:opacity-95 group cursor-pointer shrink-0"
          >
            <div className="relative flex h-10 w-10 sm:h-11 sm:w-11 aspect-square items-center justify-center rounded-2xl overflow-hidden bg-stone-900/90 border border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.2)] group-hover:border-amber-400 group-hover:shadow-[0_0_18px_rgba(245,158,11,0.35)] transition-all shrink-0 p-1">
              <img
                src="/images/PQ.png"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  if (!target.src.includes('abm3-icon.png')) {
                    target.src = '/images/abm3-icon.png';
                  }
                }}
                alt="Пармастер Квест — Школа Банного Мастерства"
                className="w-full h-full object-contain block group-hover:scale-105 transition-transform duration-300 drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-sm sm:text-base lg:text-lg font-bold tracking-wide text-stone-100 group-hover:text-amber-200 transition-colors leading-tight whitespace-nowrap">
                Пармастер Квест
              </span>
              <span className="hidden xs:block text-[9px] sm:text-[10px] font-mono tracking-wider uppercase text-amber-400/80 mt-0.5">
                Школа Банного Мастерства
              </span>
            </div>
          </button>

          {/* Desktop Center: Navigation Links */}
          <nav className="hidden md:flex items-center gap-5 lg:gap-8 text-sm font-medium">
            {/* 1. Карта Квеста */}
            <button
              onClick={handleQuestMapAction}
              className={`transition-colors py-1 border-b-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'quest' && isQuestMapActive !== false
                  ? 'border-amber-500 text-amber-300 font-semibold drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]'
                  : 'border-transparent text-stone-400 hover:text-stone-200'
              }`}
            >
              Карта Квеста
            </button>

            {/* 2. Тарифы */}
            <button
              onClick={onOpenPricing}
              className="transition-colors py-1 border-b-2 border-transparent text-stone-300 hover:text-amber-300 flex items-center gap-1.5 whitespace-nowrap cursor-pointer group"
            >
              <span>Тарифы</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono font-bold group-hover:bg-amber-500/25">
                3 390 ₽
              </span>
            </button>

            {/* 3. Dropdown "Ещё..." with hidden sections on PC */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={`flex items-center gap-1 py-1 text-sm font-medium transition-colors cursor-pointer ${
                  dropdownOpen || (activeTab !== 'quest' && isLevel3Unlocked)
                    ? 'text-amber-300'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <span>Ещё...</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    dropdownOpen ? 'rotate-180 text-amber-400' : 'text-stone-400'
                  }`}
                />
              </button>

              {/* Desktop Dropdown Menu Modal */}
              {dropdownOpen && (
                <div className="absolute left-0 mt-2.5 w-64 rounded-2xl bg-stone-900 border border-stone-700/80 shadow-2xl p-2 z-50 animate-fadeIn backdrop-blur-xl">
                  {/* 1. Тренажеры (доступны с 3-го уровня) */}
                  <button
                    onClick={handleSimulatorsClick}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors text-left cursor-pointer ${
                      activeTab === 'simulators'
                        ? 'bg-amber-500/20 text-amber-200'
                        : isLevel3Unlocked
                        ? 'text-stone-300 hover:bg-stone-800 hover:text-white'
                        : 'text-stone-400 hover:bg-stone-800/80'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Flame className={`w-4 h-4 shrink-0 ${isLevel3Unlocked ? 'text-amber-400' : 'text-stone-500'}`} />
                      <div>
                        <div className={`font-semibold ${isLevel3Unlocked ? 'text-stone-100' : 'text-stone-300'}`}>
                          Тренажеры и Симуляторы
                        </div>
                        <div className="text-[10px] text-stone-400">
                          {isLevel3Unlocked ? 'Ритмика, веники и ЧП в парной' : 'Откроются на 3-й станции'}
                        </div>
                      </div>
                    </div>
                    {!isLevel3Unlocked && (
                      <span className="flex items-center gap-1 text-[9px] font-mono text-amber-400/90 bg-stone-950 px-1.5 py-0.5 rounded border border-stone-800">
                        <Lock className="w-2.5 h-2.5" />
                        <span>3 ур.</span>
                      </span>
                    )}
                  </button>

                  {/* 2. Справочник (доступен с 3-го уровня) */}
                  <button
                    onClick={handleHandbookClick}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors text-left cursor-pointer ${
                      activeTab === 'handbook'
                        ? 'bg-amber-500/20 text-amber-200'
                        : isLevel3Unlocked
                        ? 'text-stone-300 hover:bg-stone-800 hover:text-white'
                        : 'text-stone-400 hover:bg-stone-800/80'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <BookOpen className={`w-4 h-4 shrink-0 ${isLevel3Unlocked ? 'text-amber-400' : 'text-stone-500'}`} />
                      <div>
                        <div className={`font-semibold ${isLevel3Unlocked ? 'text-stone-100' : 'text-stone-300'}`}>
                          Банный Справочник
                        </div>
                        <div className="text-[10px] text-stone-400">
                          {isLevel3Unlocked ? 'Атлас 6 веников, травы, техкарты' : 'Откроется на 3-й станции'}
                        </div>
                      </div>
                    </div>
                    {!isLevel3Unlocked && (
                      <span className="flex items-center gap-1 text-[9px] font-mono text-amber-400/90 bg-stone-950 px-1.5 py-0.5 rounded border border-stone-800">
                        <Lock className="w-2.5 h-2.5" />
                        <span>3 ур.</span>
                      </span>
                    )}
                  </button>

                  {/* 3. Банный Клуб (не активен для обычных пользователей) */}
                  <button
                    onClick={handleClubClick}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors text-left cursor-pointer ${
                      isAdmin
                        ? 'text-emerald-300 hover:bg-emerald-950/40 hover:text-emerald-200'
                        : 'text-stone-400 hover:bg-stone-800/70'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Users className={`w-4 h-4 shrink-0 ${isAdmin ? 'text-emerald-400' : 'text-stone-500'}`} />
                      <div>
                        <div className={`font-semibold ${isAdmin ? 'text-emerald-200' : 'text-stone-300'}`}>
                          Банный Клуб & Эфиры
                        </div>
                        <div className="text-[10px] text-stone-400">
                          {isAdmin ? 'Чат мастеров и проверка ДЗ' : 'Закрытый клуб мастеров'}
                        </div>
                      </div>
                    </div>
                    {!isAdmin ? (
                      <span className="flex items-center gap-1 text-[9px] font-mono text-stone-400 bg-stone-950 px-1.5 py-0.5 rounded border border-stone-800">
                        <Hammer className="w-2.5 h-2.5 text-amber-400" />
                        <span>В разработке</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-emerald-400">Live</span>
                    )}
                  </button>

                  {/* 4. Форум Мастеров (не активен для обычных пользователей) */}
                  <button
                    onClick={handleForumClick}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors text-left cursor-pointer ${
                      activeTab === 'forum' && isAdmin
                        ? 'bg-amber-500/20 text-amber-200'
                        : isAdmin
                        ? 'text-stone-300 hover:bg-stone-800 hover:text-white'
                        : 'text-stone-400 hover:bg-stone-800/70'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <MessageSquare className={`w-4 h-4 shrink-0 ${isAdmin ? 'text-amber-400' : 'text-stone-500'}`} />
                      <div>
                        <div className={`font-semibold ${isAdmin ? 'text-stone-100' : 'text-stone-300'}`}>
                          Форум Мастеров
                        </div>
                        <div className="text-[10px] text-stone-400">
                          {isAdmin ? 'Вопросы наставнику и темы' : 'Обсуждения и вопросы'}
                        </div>
                      </div>
                    </div>
                    {!isAdmin && (
                      <span className="flex items-center gap-1 text-[9px] font-mono text-stone-400 bg-stone-950 px-1.5 py-0.5 rounded border border-stone-800">
                        <Hammer className="w-2.5 h-2.5 text-amber-400" />
                        <span>В разработке</span>
                      </span>
                    )}
                  </button>

                  <div className="my-1.5 border-t border-stone-800" />

                  <button
                    onClick={() => {
                      onOpenLeaderboard();
                      setDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-stone-400 hover:bg-stone-800 hover:text-stone-200 transition-colors text-left cursor-pointer"
                  >
                    <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Таблица рекордов XP</span>
                  </button>

                  <button
                    onClick={() => {
                      onOpenCertificate();
                      setDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors text-left cursor-pointer ${
                      isCourseCompleted
                        ? 'text-amber-300 hover:bg-stone-800'
                        : 'text-stone-400 hover:bg-stone-800 hover:text-stone-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Award className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Именной Сертификат</span>
                    </div>
                    {!isCourseCompleted ? (
                      <span className="flex items-center gap-1 text-[10px] font-mono text-stone-400 bg-stone-950 px-2 py-0.5 rounded border border-stone-800">
                        <Lock className="w-2.5 h-2.5 text-amber-400/80" />
                        <span>После 7 уровней</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                        Доступен 👑
                      </span>
                    )}
                  </button>
                </div>
              )}
            </div>
          </nav>

          {/* Top Right Action Cluster: XP Badge, Sound, Personal Cabinet, & Mobile Menu Trigger */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            
            {/* XP Balance Badge (Clickable: Opens Leaderboard on mobile & desktop) */}
            <button
              onClick={onOpenLeaderboard}
              title={`Ваш опыт: ${progress.xp} XP. Нажмите, чтобы открыть таблицу рекордов`}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 py-1.5 rounded-xl bg-stone-900/95 border border-amber-500/30 text-xs font-mono text-amber-300 shadow-inner hover:border-amber-400/70 hover:bg-stone-850 active:scale-95 transition-all cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-400 shrink-0" />
              <span className="font-bold tabular-nums text-xs">{progress.xp}</span>
              <span className="text-stone-500 text-[10px] font-semibold hidden xxs:inline">XP</span>
            </button>

            {/* Sound toggle button */}
            <button
              onClick={onToggleSound}
              title={progress.soundEnabled ? 'Выключить звук парной' : 'Включить атмосферный звук пара'}
              className="hidden sm:flex p-2 rounded-xl bg-stone-900/80 border border-stone-800 text-stone-400 hover:text-amber-200 hover:border-stone-700 transition-colors cursor-pointer"
              aria-label="Переключить звук"
            >
              {progress.soundEnabled ? (
                <Volume2 className="h-4 w-4 text-amber-400/90" />
              ) : (
                <VolumeX className="h-4 w-4 text-stone-600" />
              )}
            </button>

            {/* Prominent "Личный Кабинет" Button */}
            <button
              onClick={user ? onOpenProfile : onOpenAuth}
              title={user ? `Личный Кабинет (${displayName})` : 'Войти в Личный Кабинет'}
              className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-bold text-xs sm:text-sm transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:shadow-[0_0_22px_rgba(245,158,11,0.5)] cursor-pointer active:scale-95 border border-amber-300/40"
            >
              {user && displayAvatar ? (
                <img
                  src={displayAvatar}
                  alt={displayName}
                  className="h-4.5 w-4.5 sm:h-5 sm:w-5 rounded-lg object-cover border border-stone-950/40"
                />
              ) : (
                <UserIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-stone-950" />
              )}
              <span className="whitespace-nowrap">
                {user ? (displayName ? displayName.split(' ')[0] : 'Кабинет') : 'Кабинет'}
              </span>
            </button>

            {/* Mobile Menu Button (Hamburger) — Opens full slide-over menu with ALL PC sections */}
            <button
              onClick={() => setMobileDrawerOpen(true)}
              aria-label="Открыть полное меню"
              className="md:hidden flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-stone-900 border border-stone-700/80 hover:border-amber-500/60 text-stone-200 hover:text-amber-300 text-xs font-semibold active:scale-95 transition-all shadow-sm cursor-pointer"
            >
              <Menu className="w-4 h-4 text-amber-400" />
              <span className="hidden xxs:inline text-[11px] text-stone-300 font-medium">
                Меню
              </span>
            </button>

          </div>
        </div>

        {/* Mobile Horizontal Quick-Nav Scroll Strip (Provides 1-tap direct access to everything on mobile like on PC) */}
        <div className="md:hidden border-t border-stone-800/60 bg-stone-950/90 backdrop-blur-md px-2.5 py-1.5">
          <div
            ref={quickNavScrollRef}
            className="flex items-center gap-1.5 overflow-x-auto scrollbar-none scroll-smooth pb-0.5 text-xs font-medium"
          >
            {/* 1. Карта */}
            <button
              onClick={handleQuestMapAction}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full whitespace-nowrap transition-all cursor-pointer text-xs ${
                activeTab === 'quest' && isQuestMapActive !== false
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                  : 'bg-stone-900/90 text-stone-300 border border-stone-800 hover:border-amber-500/40'
              }`}
            >
              <span>🗺️</span>
              <span>Карта</span>
            </button>

            {/* 2. Тарифы */}
            <button
              onClick={onOpenPricing}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full whitespace-nowrap bg-stone-900/90 text-amber-300 border border-amber-500/30 hover:border-amber-400/60 transition-all cursor-pointer text-xs font-semibold shadow-sm"
            >
              <span>⚡</span>
              <span>Тарифы</span>
              <span className="text-[10px] font-mono opacity-90 ml-0.5 bg-amber-500/20 px-1.5 py-0.2 rounded-full">
                3 390 ₽
              </span>
            </button>

            {/* 3. Тренажеры (только с 3 уровня) */}
            <button
              onClick={handleSimulatorsClick}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full whitespace-nowrap transition-all cursor-pointer text-xs ${
                activeTab === 'simulators' && isLevel3Unlocked
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                  : isLevel3Unlocked
                  ? 'bg-stone-900/90 text-stone-300 border border-stone-800 hover:border-amber-500/40'
                  : 'bg-stone-900/60 text-stone-400 border border-stone-850'
              }`}
            >
              {isLevel3Unlocked ? (
                <Flame className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <Lock className="w-3 h-3 text-amber-400/80" />
              )}
              <span>Тренажеры</span>
              {!isLevel3Unlocked && (
                <span className="text-[9px] font-mono text-amber-400/90 ml-0.5">3 ур.</span>
              )}
            </button>

            {/* 4. Справочник (только с 3 уровня) */}
            <button
              onClick={handleHandbookClick}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full whitespace-nowrap transition-all cursor-pointer text-xs ${
                activeTab === 'handbook' && isLevel3Unlocked
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                  : isLevel3Unlocked
                  ? 'bg-stone-900/90 text-stone-300 border border-stone-800 hover:border-amber-500/40'
                  : 'bg-stone-900/60 text-stone-400 border border-stone-850'
              }`}
            >
              {isLevel3Unlocked ? (
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <Lock className="w-3 h-3 text-amber-400/80" />
              )}
              <span>Справочник</span>
              {!isLevel3Unlocked && (
                <span className="text-[9px] font-mono text-amber-400/90 ml-0.5">3 ур.</span>
              )}
            </button>

            {/* 5. Клуб (не активен для обычных пользователей) */}
            <button
              onClick={handleClubClick}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full whitespace-nowrap transition-all cursor-pointer text-xs ${
                isAdmin
                  ? 'bg-stone-900/90 text-emerald-300 border border-emerald-500/30 hover:border-emerald-400/60 font-medium'
                  : 'bg-stone-900/50 text-stone-400 border border-stone-800/80'
              }`}
            >
              <Users className={`w-3.5 h-3.5 ${isAdmin ? 'text-emerald-400' : 'text-stone-500'}`} />
              <span>Банный Клуб</span>
              {!isAdmin && (
                <span className="text-[9px] font-mono text-stone-400 ml-0.5">🛠️</span>
              )}
            </button>

            {/* 6. Форум (не активен для обычных пользователей) */}
            <button
              onClick={handleForumClick}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full whitespace-nowrap transition-all cursor-pointer text-xs ${
                isAdmin && activeTab === 'forum'
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                  : isAdmin
                  ? 'bg-stone-900/90 text-stone-300 border border-stone-800 hover:border-amber-500/40'
                  : 'bg-stone-900/50 text-stone-400 border border-stone-800/80'
              }`}
            >
              <MessageSquare className={`w-3.5 h-3.5 ${isAdmin ? 'text-amber-400' : 'text-stone-500'}`} />
              <span>Форум</span>
              {!isAdmin && (
                <span className="text-[9px] font-mono text-stone-400 ml-0.5">🛠️</span>
              )}
            </button>

            {/* 7. Рекорды */}
            <button
              onClick={onOpenLeaderboard}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full whitespace-nowrap bg-stone-900/90 text-stone-300 border border-stone-800 hover:border-amber-500/40 transition-all cursor-pointer text-xs font-medium"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Рекорды XP</span>
            </button>

            {/* 8. Сертификат */}
            <button
              onClick={onOpenCertificate}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full whitespace-nowrap transition-all cursor-pointer text-xs font-medium ${
                isCourseCompleted
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40'
                  : 'bg-stone-900/90 text-stone-400 border border-stone-800'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>Сертификат</span>
              {isCourseCompleted ? (
                <span className="text-[10px]">👑</span>
              ) : (
                <Lock className="w-2.5 h-2.5 text-stone-500" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* FULL-FEATURED MOBILE NAVIGATION DRAWER (Slide-over with all PC options) */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex justify-end">
          {/* Backdrop */}
          <div
            onClick={() => setMobileDrawerOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-fadeIn"
          />

          {/* Drawer Panel */}
          <div className="relative w-full max-w-[340px] sm:max-w-sm h-full bg-gradient-to-b from-stone-900 via-stone-950 to-stone-900 border-l border-stone-800 shadow-2xl flex flex-col z-10 animate-slideInRight overflow-hidden">
            
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-4 border-b border-stone-800 bg-stone-950/90">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-stone-900 border border-amber-500/40 flex items-center justify-center p-0.5 shadow-md">
                  <img
                    src="/images/PQ.png"
                    alt="PQ"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h2 className="font-serif text-sm font-bold text-stone-100 leading-tight">
                    Меню Академии
                  </h2>
                  <span className="text-[10px] font-mono text-amber-400/80">
                    Пармастер Квест
                  </span>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="p-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-stone-100 border border-stone-800 transition-colors cursor-pointer"
                aria-label="Закрыть меню"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-thin scrollbar-thumb-stone-800">
              
              {/* User Account Card */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-stone-900 via-stone-950 to-stone-900 border border-amber-500/30 shadow-lg space-y-3">
                <div className="flex items-center gap-3">
                  {user && displayAvatar ? (
                    <img
                      src={displayAvatar}
                      alt={displayName}
                      className="w-12 h-12 rounded-xl object-cover border-2 border-amber-500/50 shadow-md"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-stone-900 border border-amber-500/40 flex items-center justify-center text-amber-400 text-xl shadow-inner">
                      👤
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-serif font-bold text-sm text-stone-100 truncate">
                        {displayName}
                      </span>
                      {isAdmin && (
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-mono font-bold">
                          👑
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-stone-400 font-mono truncate">
                      {isMasterPro ? 'Мастер Пара PRO' : 'Студент курса'}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-amber-300 font-semibold bg-stone-900/90 px-2 py-0.5 rounded-lg border border-amber-500/25">
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        {progress.xp} XP
                      </span>
                      <span className="text-[11px] font-mono text-stone-400">
                        Сдано: <strong className="text-stone-200">{completedCount}/7</strong>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-stone-800/80">
                  <button
                    onClick={() => {
                      setMobileDrawerOpen(false);
                      if (user) {
                        onOpenProfile();
                      } else {
                        onOpenAuth();
                      }
                    }}
                    className="w-full py-2 px-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold transition-all shadow-md cursor-pointer text-center"
                  >
                    {user ? 'Личный Кабинет' : 'Войти в аккаунт'}
                  </button>

                  <button
                    onClick={() => {
                      setMobileDrawerOpen(false);
                      onOpenLeaderboard();
                    }}
                    className="w-full py-2 px-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-amber-300 border border-stone-800 text-xs font-medium transition-colors cursor-pointer text-center flex items-center justify-center gap-1"
                  >
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                    <span>Рекорды XP</span>
                  </button>
                </div>
              </div>

              {/* Section 1: Квест и Программа */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400/90 px-1">
                  Обучение и Квест
                </span>

                {/* 1. Карта Квеста */}
                <button
                  onClick={() => {
                    setMobileDrawerOpen(false);
                    handleQuestMapAction();
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    activeTab === 'quest' && isQuestMapActive !== false
                      ? 'bg-amber-500/15 border-amber-500/50 text-amber-200'
                      : 'bg-stone-900/60 border-stone-800/80 hover:bg-stone-900 text-stone-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-stone-900 border border-amber-500/30 flex items-center justify-center text-base shrink-0">
                      🗺️
                    </div>
                    <div>
                      <div className="font-semibold text-xs text-stone-100">Карта Квеста</div>
                      <div className="text-[10px] text-stone-400">7 станций банного пути</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-stone-950 border border-stone-800 text-amber-300">
                    {completedCount}/7
                  </span>
                </button>

                {/* 2. Тарифы & Оплата */}
                <button
                  onClick={() => {
                    setMobileDrawerOpen(false);
                    onOpenPricing();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-stone-900/90 to-stone-900/40 border border-amber-500/40 hover:border-amber-400 text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-xs text-amber-200 group-hover:text-amber-100">
                        Тарифы и Доступ
                      </div>
                      <div className="text-[10px] text-stone-400">
                        Полный доступ к курсу и чату
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    3 390 ₽
                  </span>
                </button>

                {/* 3. Тренажеры & Симуляторы (с 3-го уровня) */}
                <button
                  onClick={handleSimulatorsClick}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    activeTab === 'simulators' && isLevel3Unlocked
                      ? 'bg-amber-500/15 border-amber-500/50 text-amber-200'
                      : isLevel3Unlocked
                      ? 'bg-stone-900/60 border-stone-800/80 hover:bg-stone-900 text-stone-200'
                      : 'bg-stone-900/40 border-stone-850 text-stone-400'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-stone-900 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                      {isLevel3Unlocked ? (
                        <Flame className="w-4 h-4" />
                      ) : (
                        <Lock className="w-4 h-4 text-amber-400/80" />
                      )}
                    </div>
                    <div>
                      <div className={`font-semibold text-xs ${isLevel3Unlocked ? 'text-stone-100' : 'text-stone-300'}`}>
                        Тренажеры & Симуляторы
                      </div>
                      <div className="text-[10px] text-stone-400">
                        {isLevel3Unlocked ? 'Ритмика, веники и ЧП в парной' : 'Доступно с 3-го уровня'}
                      </div>
                    </div>
                  </div>
                  {!isLevel3Unlocked ? (
                    <span className="flex items-center gap-1 text-[10px] font-mono text-amber-400/90 bg-stone-950 px-2 py-0.5 rounded-full border border-stone-800">
                      <Lock className="w-2.5 h-2.5" />
                      <span>3 ур.</span>
                    </span>
                  ) : (
                    <ChevronRight className="w-4 h-4 text-stone-500" />
                  )}
                </button>

                {/* 4. Банный Справочник (с 3-го уровня) */}
                <button
                  onClick={handleHandbookClick}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    activeTab === 'handbook' && isLevel3Unlocked
                      ? 'bg-amber-500/15 border-amber-500/50 text-amber-200'
                      : isLevel3Unlocked
                      ? 'bg-stone-900/60 border-stone-800/80 hover:bg-stone-900 text-stone-200'
                      : 'bg-stone-900/40 border-stone-850 text-stone-400'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-stone-900 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                      {isLevel3Unlocked ? (
                        <BookOpen className="w-4 h-4" />
                      ) : (
                        <Lock className="w-4 h-4 text-amber-400/80" />
                      )}
                    </div>
                    <div>
                      <div className={`font-semibold text-xs ${isLevel3Unlocked ? 'text-stone-100' : 'text-stone-300'}`}>
                        Банный Справочник
                      </div>
                      <div className="text-[10px] text-stone-400">
                        {isLevel3Unlocked ? 'Атлас 6 веников, травы, техкарты' : 'Доступно с 3-го уровня'}
                      </div>
                    </div>
                  </div>
                  {!isLevel3Unlocked ? (
                    <span className="flex items-center gap-1 text-[10px] font-mono text-amber-400/90 bg-stone-950 px-2 py-0.5 rounded-full border border-stone-800">
                      <Lock className="w-2.5 h-2.5" />
                      <span>3 ур.</span>
                    </span>
                  ) : (
                    <ChevronRight className="w-4 h-4 text-stone-500" />
                  )}
                </button>
              </div>

              {/* Section 2: Сообщество и Наставник */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400/90 px-1">
                  Сообщество и Сертификация
                </span>

                {/* 5. Банный Клуб (не активен для обычных пользователей) */}
                <button
                  onClick={handleClubClick}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    isAdmin
                      ? 'bg-emerald-950/20 border-emerald-500/30 hover:border-emerald-500/60'
                      : 'bg-stone-900/40 border-stone-800/70 hover:bg-stone-900/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${
                      isAdmin
                        ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400'
                        : 'bg-stone-900 border-stone-800 text-stone-500'
                    }`}>
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <div className={`font-semibold text-xs ${isAdmin ? 'text-emerald-200' : 'text-stone-300'}`}>
                        Банный Клуб & Эфиры
                      </div>
                      <div className="text-[10px] text-stone-400">
                        {isAdmin ? 'Чат мастеров и субботние разборы' : 'В разработке для учеников'}
                      </div>
                    </div>
                  </div>
                  {!isAdmin ? (
                    <span className="flex items-center gap-1 text-[10px] font-mono text-stone-400 bg-stone-950 px-2 py-0.5 rounded-full border border-stone-800">
                      <Hammer className="w-2.5 h-2.5 text-amber-400" />
                      <span>В разработке</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                      Live
                    </span>
                  )}
                </button>

                {/* 6. Форум Мастеров (не активен для обычных пользователей) */}
                <button
                  onClick={handleForumClick}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    isAdmin && activeTab === 'forum'
                      ? 'bg-amber-500/15 border-amber-500/50 text-amber-200'
                      : isAdmin
                      ? 'bg-stone-900/60 border-stone-800/80 hover:bg-stone-900 text-stone-200'
                      : 'bg-stone-900/40 border-stone-800/70 hover:bg-stone-900/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${
                      isAdmin
                        ? 'bg-stone-900 border-amber-500/30 text-amber-400'
                        : 'bg-stone-900 border-stone-800 text-stone-500'
                    }`}>
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <div className={`font-semibold text-xs ${isAdmin ? 'text-stone-100' : 'text-stone-300'}`}>
                        Форум Мастеров
                      </div>
                      <div className="text-[10px] text-stone-400">
                        {isAdmin ? 'Вопросы наставнику и темы' : 'В разработке для учеников'}
                      </div>
                    </div>
                  </div>
                  {!isAdmin ? (
                    <span className="flex items-center gap-1 text-[10px] font-mono text-stone-400 bg-stone-950 px-2 py-0.5 rounded-full border border-stone-800">
                      <Hammer className="w-2.5 h-2.5 text-amber-400" />
                      <span>В разработке</span>
                    </span>
                  ) : (
                    <ChevronRight className="w-4 h-4 text-stone-500" />
                  )}
                </button>

                {/* 7. Именной Сертификат */}
                <button
                  onClick={() => {
                    setMobileDrawerOpen(false);
                    onOpenCertificate();
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    isCourseCompleted
                      ? 'bg-amber-500/15 border-amber-500/50 text-amber-200'
                      : 'bg-stone-900/60 border-stone-800/80 hover:bg-stone-900 text-stone-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-stone-900 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                      <Award className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-xs text-stone-100">
                        Именной Сертификат
                      </div>
                      <div className="text-[10px] text-stone-400">
                        {isCourseCompleted ? 'Готов к скачиванию' : 'После сдачи 7 станций'}
                      </div>
                    </div>
                  </div>
                  {isCourseCompleted ? (
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">👑 Доступен</span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-mono text-stone-400 bg-stone-950 px-2 py-0.5 rounded border border-stone-800">
                      <Lock className="w-2.5 h-2.5 text-amber-400/80" />
                      <span>7 этапов</span>
                    </span>
                  )}
                </button>
              </div>

              {/* Section 3: Инструменты и Помощь */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400/90 px-1">
                  Удобства и Помощь
                </span>

                {/* 8. Звук парной (переключатель прямо в меню) */}
                <button
                  onClick={onToggleSound}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-stone-900/60 border border-stone-800/80 hover:bg-stone-900 text-left transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-stone-900 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                      {progress.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-stone-500" />}
                    </div>
                    <div>
                      <div className="font-semibold text-xs text-stone-100">
                        Атмосферный Звук Парной
                      </div>
                      <div className="text-[10px] text-stone-400">
                        Шипение камней и треск поленьев
                      </div>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                      progress.soundEnabled
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold'
                        : 'bg-stone-950 text-stone-500 border-stone-800'
                    }`}
                  >
                    {progress.soundEnabled ? 'ВКЛ 🔊' : 'ВЫКЛ 🔇'}
                  </span>
                </button>

                {/* 9. Экстренная аптечка (ЧП в парной) */}
                <button
                  onClick={() => {
                    setMobileDrawerOpen(false);
                    onOpenEmergency();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-rose-950/20 border border-rose-500/30 hover:border-rose-500/60 text-left transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-rose-950/40 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-xs text-rose-200">
                        Экстренная Помощь (ЧП)
                      </div>
                      <div className="text-[10px] text-rose-300/70">
                        Протоколы первой помощи в парной
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-rose-300">SOS</span>
                </button>

                {/* 10. Сова PQ (ИИ-помощник) */}
                {onOpenAssistant && (
                  <button
                    onClick={() => {
                      setMobileDrawerOpen(false);
                      onOpenAssistant();
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-stone-900/60 border border-stone-800/80 hover:bg-stone-900 text-left transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-stone-900 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-xs text-stone-100">
                          Помощник Сова PQ
                        </div>
                        <div className="text-[10px] text-stone-400">
                          ИИ-ответы, вопросы наставнику, баги
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-amber-400">🦉</span>
                  </button>
                )}

                {/* 11. Оферта и реквизиты */}
                {onOpenLegal && (
                  <button
                    onClick={() => {
                      setMobileDrawerOpen(false);
                      onOpenLegal('requisites');
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-stone-900/40 border border-stone-800/60 hover:bg-stone-900 text-left transition-all cursor-pointer text-stone-400 hover:text-stone-300"
                  >
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-stone-500" />
                      <span className="text-xs">Официальные реквизиты и Оферта</span>
                    </div>
                    <span className="text-[10px] font-mono">152-ФЗ</span>
                  </button>
                )}
              </div>

              {/* Bottom Info Stamp */}
              <div className="pt-3 border-t border-stone-800/80 text-center space-y-1 text-[11px] font-mono text-stone-500">
                <div>Наставник: <strong className="text-stone-300">Антон Ирхин</strong></div>
                <div>Школа банного мастерства · г. Ростов-на-Дону</div>
              </div>

            </div>

            {/* Bottom Safe Area Padding */}
            <div className="p-3 bg-stone-950 border-t border-stone-800/80 pb-[max(0.75rem,env(safe-area-inset-bottom))] text-center">
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 text-xs font-semibold transition-colors cursor-pointer"
              >
                Закрыть меню
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
