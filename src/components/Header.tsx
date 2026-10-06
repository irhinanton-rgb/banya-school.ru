import React from 'react';
import { Sparkles, Trophy, Volume2, VolumeX, Award, BookOpen, Cloud, User as UserIcon, Users } from 'lucide-react';
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
  activeTab: 'quest' | 'simulators' | 'handbook';
  setActiveTab: (tab: 'quest' | 'simulators' | 'handbook') => void;
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
}) => {
  const { user } = useAuth();
  const isAdmin = user?.email?.toLowerCase() === 'irhinanton@gmail.com' || Boolean(progress.isAdmin);
  const completed = progress?.completedLevels ?? [];
  const badges = progress?.unlockedBadges ?? [];
  const hasCertificate = completed.includes(7) || badges.includes('master_crown');
  const isMasterPro = isAdmin || progress.isPaid || progress.tariff === 'master_pro';
  const displayAvatar = progress.avatarUrl || user?.photoURL;
  const displayName = progress.name || user?.displayName || (isAdmin ? 'Антон Ирхин' : 'Пармастер');

  return (
    <header className="sticky top-0 z-40 w-full border-b border-stone-800 bg-stone-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Single text element wordmark */}
        <button 
          onClick={() => setActiveTab('quest')}
          className="flex items-center gap-2.5 text-left transition-opacity hover:opacity-80"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20 text-lg">
            🌾
          </span>
          <div>
            <span className="font-serif text-lg font-semibold tracking-wide text-amber-100 sm:text-xl">
              Квест Пармастера
            </span>
          </div>
        </button>

        {/* Zone 2: Clean text navigation links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <button
            onClick={() => setActiveTab('quest')}
            className={`transition-colors py-1 border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'quest'
                ? 'border-amber-500 text-amber-200'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            Карта Квеста
          </button>
          <button
            onClick={() => setActiveTab('simulators')}
            className={`transition-colors py-1 border-b-2 whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'simulators'
                ? 'border-amber-500 text-amber-200'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <span>Тренажеры и Симуляторы</span>
            {completed.length === 0 && !isMasterPro && (
              <span className="text-[10px] text-amber-400 font-mono">🔒</span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('handbook')}
            className={`transition-colors py-1 border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'handbook'
                ? 'border-amber-500 text-amber-200'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            Банный Справочник
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Single Community Club & Live Hub Button */}
          <button
            onClick={onOpenClub}
            title="Банный Клуб: Чат сообщества, Видеоэфиры и Проверка ДЗ"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-semibold whitespace-nowrap transition-all shadow-sm cursor-pointer active:scale-95"
          >
            <Users className="h-3.5 w-3.5 text-emerald-400" />
            <span>Банный Клуб & Эфиры</span>
          </button>

          {/* XP counter */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-800 text-xs font-mono text-amber-300">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span className="font-semibold tabular-nums">{progress.xp}</span>
            <span className="text-stone-500">XP</span>
          </div>

          {/* Sound toggle */}
          <button
            onClick={onToggleSound}
            title={progress.soundEnabled ? 'Выключить звук' : 'Включить звук пара и веников'}
            className="p-2 rounded-lg bg-stone-900 border border-stone-800 text-stone-400 hover:text-amber-200 hover:border-stone-700 transition-colors"
            aria-label="Переключить звук"
          >
            {progress.soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4 text-stone-600" />}
          </button>

          {/* Leaderboard (hidden on mobile, accessible via desk) */}
          <button
            onClick={onOpenLeaderboard}
            title="Таблица рекордов"
            className="hidden sm:flex p-2 rounded-lg bg-stone-900 border border-stone-800 text-stone-400 hover:text-amber-200 hover:border-stone-700 transition-colors"
            aria-label="Таблица рекордов"
          >
            <Trophy className="h-4 w-4" />
          </button>

          {/* Tariffs / Access Button */}
          <button
            onClick={onOpenPricing}
            title={isMasterPro ? 'Полный доступ активен' : 'Открыть полный курс'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors shadow-sm cursor-pointer ${
              isMasterPro
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold'
            }`}
          >
            <span>{isMasterPro ? '👑 VIP' : '⭐ Тарифы'}</span>
          </button>

          {/* Certificate or Quick Action */}
          <button
            onClick={onOpenCertificate}
            className={`hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors shadow-sm ${
              hasCertificate
                ? 'bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold'
                : 'bg-stone-800 hover:bg-stone-700 text-amber-200 border border-amber-500/30'
            }`}
          >
            <Award className="h-3.5 w-3.5" />
            <span>{hasCertificate ? 'Сертификат 👑' : 'Аттестация'}</span>
          </button>

          {/* User Auth / Cloud Profile Button */}
          {user ? (
            <button
              onClick={onOpenProfile}
              title={`Личный кабинет: ${displayName} ${isAdmin ? '(Администратор)' : ''}`}
              className={`flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-xl text-stone-200 text-xs font-medium transition-all shadow-sm group cursor-pointer ${
                isAdmin
                  ? 'bg-amber-950/40 hover:bg-amber-900/60 border border-amber-500/50 text-amber-200'
                  : 'bg-stone-900 hover:bg-stone-800 border border-emerald-500/40'
              }`}
            >
              {displayAvatar ? (
                <img
                  src={displayAvatar}
                  alt={displayName}
                  className={`h-6 w-6 rounded-lg object-cover ${isAdmin ? 'border border-amber-400' : 'border border-emerald-400/60'}`}
                />
              ) : (
                <div className={`h-6 w-6 rounded-lg font-bold flex items-center justify-center text-[11px] ${
                  isAdmin ? 'bg-amber-500 text-stone-950' : 'bg-emerald-500/20 text-emerald-300'
                }`}>
                  {isAdmin ? '👑' : displayName.slice(0, 1).toUpperCase()}
                </div>
              )}
              <span className="hidden sm:inline max-w-[100px] truncate text-stone-200 group-hover:text-amber-300">
                {isAdmin ? '👑 Антон И.' : displayName.split(' ')[0]}
              </span>
              <span className={`h-2 w-2 rounded-full ${isAdmin ? 'bg-amber-400' : 'bg-emerald-400'}`} />
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={onOpenProfile}
                title="Личный кабинет банщика"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-300 text-xs font-medium transition-all cursor-pointer"
              >
                <UserIcon className="h-3.5 w-3.5 text-stone-400" />
                <span>Кабинет</span>
              </button>
              <button
                onClick={onOpenAuth}
                title="Войти или зарегистрироваться для сохранения прогресса"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-medium transition-all shadow-sm cursor-pointer active:scale-95"
              >
                <Cloud className="h-3.5 w-3.5 text-amber-400" />
                <span>Войти</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
