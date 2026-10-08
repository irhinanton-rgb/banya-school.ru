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
  Flame,
  FileText,
  MessageSquare,
  Lock,
} from 'lucide-react';
import { LevelId, UserProgress } from '../types/banya';
import { useAuth } from '../firebase/AuthContext';

interface HeaderProps {
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
  activeTab: 'quest' | 'simulators' | 'handbook' | 'forum';
  setActiveTab: (tab: 'quest' | 'simulators' | 'handbook' | 'forum') => void;
  onGoToHome?: () => void;
  onStartLearning?: () => void;
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
  activeTab,
  setActiveTab,
  onGoToHome,
  onStartLearning,
}) => {
  const { user } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isAdmin = user?.email?.toLowerCase() === 'irhinanton@gmail.com' || Boolean(progress.isAdmin);
  const isMasterPro = isAdmin || progress.isPaid || progress.tariff === 'master_pro';
  const isCourseCompleted =
    Boolean(progress.certifiedDate) ||
    Boolean(progress.completedLevels && progress.completedLevels.includes(7)) ||
    Boolean(progress.completedLevels && progress.completedLevels.length >= 7);
  const displayAvatar = progress.avatarUrl || user?.photoURL;
  const displayName = progress.name || user?.displayName || (isAdmin ? 'Антон Ирхин' : 'Пармастер');

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-stone-800/80 bg-stone-950/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Top left: Logo */}
        <button
          onClick={() => {
            if (onGoToHome) {
              onGoToHome();
            } else {
              setActiveTab('quest');
            }
          }}
          className="flex items-center gap-3 text-left transition-opacity hover:opacity-95 group cursor-pointer"
        >
          <div className="relative flex h-12 w-12 sm:h-14 sm:w-14 aspect-square items-center justify-center rounded-xl overflow-hidden bg-black border border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.25)] group-hover:border-amber-400 group-hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all shrink-0">
            <img
              src="/images/abm3-icon.png"
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                if (!target.src.includes('abm3-logo.png')) {
                  target.src = '/images/abm3-logo.png';
                } else if (!target.src.includes('%D0%90%D0%91%D0%9C3.png')) {
                  target.src = '/images/%D0%90%D0%91%D0%9C3.png';
                }
              }}
              alt="АБМ — Академия Банного Мастерства"
              className="w-full h-full object-contain block group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-base sm:text-lg font-bold tracking-wide text-stone-100 group-hover:text-amber-200 transition-colors leading-tight">
              Квест Пармастера
            </span>
            <span className="text-[10px] font-mono tracking-wider uppercase text-amber-400/80 mt-0.5">
              Академия Банного Мастерства
            </span>
          </div>
        </button>

        {/* Center: Simplified Clean Navigation */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium">
          {/* 1. Карта Квеста */}
          <button
            onClick={() => {
              if (onStartLearning) {
                onStartLearning();
              } else {
                setActiveTab('quest');
              }
              setTimeout(() => {
                const el = document.getElementById('quest-roadmap-section') || document.getElementById('level-station-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }, 50);
            }}
            className={`transition-colors py-1 border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'quest'
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

          {/* 3. Dropdown "Ещё..." with hidden sections */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className={`flex items-center gap-1 py-1 text-sm font-medium transition-colors cursor-pointer ${
                dropdownOpen || activeTab !== 'quest'
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

            {/* Dropdown Menu Modal */}
            {dropdownOpen && (
              <div className="absolute left-0 mt-2.5 w-64 rounded-2xl bg-stone-900 border border-stone-700/80 shadow-2xl p-2 z-50 animate-fadeIn backdrop-blur-xl">
                <button
                  onClick={() => {
                    setActiveTab('simulators');
                    setDropdownOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors text-left cursor-pointer ${
                    activeTab === 'simulators'
                      ? 'bg-amber-500/20 text-amber-200'
                      : 'text-stone-300 hover:bg-stone-800 hover:text-white'
                  }`}
                >
                  <Flame className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <div className="font-semibold text-stone-100">Тренажеры и Симуляторы</div>
                    <div className="text-[10px] text-stone-400">Ритмика, веники и ЧП в парной</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('handbook');
                    setDropdownOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors text-left cursor-pointer ${
                    activeTab === 'handbook'
                      ? 'bg-amber-500/20 text-amber-200'
                      : 'text-stone-300 hover:bg-stone-800 hover:text-white'
                  }`}
                >
                  <BookOpen className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <div className="font-semibold text-stone-100">Банный Справочник</div>
                    <div className="text-[10px] text-stone-400">Атлас 6 веников, травы, техкарты</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    onOpenClub();
                    setDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-emerald-300 hover:bg-emerald-950/40 hover:text-emerald-200 transition-colors text-left cursor-pointer"
                >
                  <Users className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <div className="font-semibold text-emerald-200">Банный Клуб & Эфиры</div>
                    <div className="text-[10px] text-emerald-400/80">Чат мастеров и проверка ДЗ</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('forum');
                    setDropdownOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors text-left cursor-pointer ${
                    activeTab === 'forum'
                      ? 'bg-amber-500/20 text-amber-200'
                      : 'text-stone-300 hover:bg-stone-800 hover:text-white'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <div className="font-semibold text-stone-100">Форум Мастеров</div>
                    <div className="text-[10px] text-stone-400">Вопросы наставнику и обсуждения</div>
                  </div>
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

        {/* Top right: XP balance icon & Prominent "Личный Кабинет" button */}
        <div className="flex items-center gap-3">
          
          {/* XP Balance Icon */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900/90 border border-amber-500/25 text-xs font-mono text-amber-300 shadow-inner">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span className="font-bold tabular-nums">{progress.xp}</span>
            <span className="text-stone-500 text-[10px]">XP</span>
          </div>

          {/* Sound toggle button */}
          <button
            onClick={onToggleSound}
            title={progress.soundEnabled ? 'Выключить звук' : 'Включить атмосферный звук пара'}
            className="hidden sm:flex p-2 rounded-xl bg-stone-900/80 border border-stone-800 text-stone-400 hover:text-amber-200 hover:border-stone-700 transition-colors cursor-pointer"
            aria-label="Переключить звук"
          >
            {progress.soundEnabled ? (
              <Volume2 className="h-4 w-4 text-amber-400/90" />
            ) : (
              <VolumeX className="h-4 w-4 text-stone-600" />
            )}
          </button>

          {/* Prominent "Личный Кабинет" Button (Glows & Catches Attention) */}
          <button
            onClick={user ? onOpenProfile : onOpenAuth}
            title={user ? `Личный Кабинет (${displayName})` : 'Войти в Личный Кабинет'}
            className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-bold text-xs sm:text-sm transition-all shadow-[0_0_20px_rgba(245,158,11,0.35)] hover:shadow-[0_0_25px_rgba(245,158,11,0.55)] cursor-pointer active:scale-95 border border-amber-300/40"
          >
            {user && displayAvatar ? (
              <img
                src={displayAvatar}
                alt={displayName}
                className="h-5 w-5 rounded-lg object-cover border border-stone-950/40"
              />
            ) : (
              <UserIcon className="h-4 w-4 text-stone-950" />
            )}
            <span className="whitespace-nowrap">
              {user ? (displayName ? displayName.split(' ')[0] : 'Кабинет') : 'Личный Кабинет'}
            </span>
          </button>

        </div>
      </div>
    </header>
  );
};
