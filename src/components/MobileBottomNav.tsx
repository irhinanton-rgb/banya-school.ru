import React from 'react';
import { BookOpen, Compass, BookMarked, MessageSquare, User } from 'lucide-react';
import { UserProgress } from '../types/banya';

interface MobileBottomNavProps {
  activeTab: 'quest' | 'simulators' | 'handbook' | 'forum';
  setActiveTab: (tab: 'quest' | 'simulators' | 'handbook' | 'forum') => void;
  onOpenClub: () => void;
  onOpenProfile: () => void;
  onScrollToMap: () => void;
  progress: UserProgress;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenClub,
  onOpenProfile,
  onScrollToMap,
  progress,
}) => {
  const isQuestActive = activeTab === 'quest';
  const isHandbookActive = activeTab === 'handbook';
  const isForumActive = activeTab === 'forum';
  const isAdmin = Boolean(progress.isAdmin);

  return (
    <nav
      aria-label="Мобильная навигация"
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-stone-950/95 backdrop-blur-xl border-t border-stone-800/90 shadow-[0_-8px_30px_rgba(0,0,0,0.7)] px-2 pt-1.5 pb-[max(0.6rem,env(safe-area-inset-bottom))] print:hidden transition-transform"
    >
      <div className="grid grid-cols-5 items-center gap-1 max-w-md mx-auto">
        {/* Tab 1: Обучение */}
        <button
          onClick={() => {
            setActiveTab('quest');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer ${
            isQuestActive
              ? 'text-amber-400 font-bold scale-105'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <div className="relative">
            <BookOpen className={`w-5 h-5 ${isQuestActive ? 'text-amber-400' : 'text-stone-400'}`} />
            {isQuestActive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-amber-400" />
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight leading-none truncate max-w-full">
            Урок
          </span>
        </button>

        {/* Tab 2: Карта квеста */}
        <button
          onClick={onScrollToMap}
          className="flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-stone-400 hover:text-stone-200 transition-all cursor-pointer active:scale-95"
        >
          <div className="relative">
            <Compass className="w-5 h-5 text-stone-400" />
            <span className="absolute -top-1 -right-1 text-[9px] font-mono text-amber-300 font-bold">
              {progress.completedLevels.length}/7
            </span>
          </div>
          <span className="text-[10px] mt-1 tracking-tight leading-none truncate max-w-full">
            Карта
          </span>
        </button>

        {/* Tab 3: Справочник */}
        <button
          onClick={() => setActiveTab('handbook')}
          className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer ${
            isHandbookActive
              ? 'text-amber-400 font-bold scale-105'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <div className="relative">
            <BookMarked className={`w-5 h-5 ${isHandbookActive ? 'text-amber-400' : 'text-stone-400'}`} />
            {isHandbookActive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-amber-400" />
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight leading-none truncate max-w-full">
            Справка
          </span>
        </button>

        {/* Tab 4: Форум & Программы */}
        <button
          onClick={() => setActiveTab('forum')}
          className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer ${
            isForumActive
              ? 'text-amber-400 font-bold scale-105'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <div className="relative">
            <MessageSquare className={`w-5 h-5 ${isForumActive ? 'text-amber-400' : 'text-stone-400'}`} />
            {isForumActive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-amber-400" />
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight leading-none truncate max-w-full">
            Форум
          </span>
        </button>

        {/* Tab 5: Кабинет */}
        <button
          onClick={onOpenProfile}
          className="flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-stone-400 hover:text-amber-300 transition-all cursor-pointer active:scale-95"
        >
          <div className="relative">
            {progress.avatarUrl ? (
              <img
                src={progress.avatarUrl}
                alt="Профиль"
                className="w-5 h-5 rounded-full object-cover border border-amber-500/60"
              />
            ) : (
              <User className="w-5 h-5 text-stone-300" />
            )}
            {isAdmin && (
              <span className="absolute -top-1.5 -right-1 text-[10px]" title="Админ">
                👑
              </span>
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight leading-none truncate max-w-full">
            Кабинет
          </span>
        </button>
      </div>
    </nav>
  );
};
