import React from 'react';
import { Sparkles, Trophy, Volume2, VolumeX, Award, BookOpen } from 'lucide-react';
import { LevelId, UserProgress } from '../types/banya';

interface HeaderProps {
  progress: UserProgress;
  onToggleSound: () => void;
  onOpenLeaderboard: () => void;
  onOpenCertificate: () => void;
  onNavigateToLevel: (levelId: LevelId) => void;
  onOpenEmergency: () => void;
  activeTab: 'quest' | 'simulators' | 'handbook';
  setActiveTab: (tab: 'quest' | 'simulators' | 'handbook') => void;
}

export const Header: React.FC<HeaderProps> = ({
  progress,
  onToggleSound,
  onOpenLeaderboard,
  onOpenCertificate,
  onOpenEmergency,
  activeTab,
  setActiveTab,
}) => {
  const completed = progress?.completedLevels ?? [];
  const badges = progress?.unlockedBadges ?? [];
  const hasCertificate = completed.includes(7) || badges.includes('master_crown');

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
            className={`transition-colors py-1 border-b-2 whitespace-nowrap ${
              activeTab === 'quest'
                ? 'border-amber-500 text-amber-200'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            Карта Квеста
          </button>
          <button
            onClick={() => setActiveTab('simulators')}
            className={`transition-colors py-1 border-b-2 whitespace-nowrap ${
              activeTab === 'simulators'
                ? 'border-amber-500 text-amber-200'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            Тренажеры и Симуляторы
          </button>
          <button
            onClick={() => setActiveTab('handbook')}
            className={`transition-colors py-1 border-b-2 whitespace-nowrap ${
              activeTab === 'handbook'
                ? 'border-amber-500 text-amber-200'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            Банный Справочник
          </button>
          <button
            onClick={onOpenEmergency}
            className="text-stone-400 hover:text-amber-300 transition-colors whitespace-nowrap flex items-center gap-1.5"
          >
            <span>🚨</span>
            <span>ЧП в парной</span>
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-3">
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

          {/* Leaderboard */}
          <button
            onClick={onOpenLeaderboard}
            title="Таблица рекордов"
            className="p-2 rounded-lg bg-stone-900 border border-stone-800 text-stone-400 hover:text-amber-200 hover:border-stone-700 transition-colors"
            aria-label="Таблица рекордов"
          >
            <Trophy className="h-4 w-4" />
          </button>

          {/* Certificate or Quick Action */}
          <button
            onClick={onOpenCertificate}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors shadow-sm ${
              hasCertificate
                ? 'bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold'
                : 'bg-stone-800 hover:bg-stone-700 text-amber-200 border border-amber-500/30'
            }`}
          >
            <Award className="h-3.5 w-3.5" />
            <span>{hasCertificate ? 'Сертификат 👑' : 'Аттестация'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
