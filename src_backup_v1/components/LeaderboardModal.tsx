import React from 'react';
import { LEADERBOARD_CREW } from '../data/courseData';
import { UserProgress } from '../types/banya';
import { Trophy, Award, X, Sparkles } from 'lucide-react';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  progress: UserProgress;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  progress,
}) => {
  if (!isOpen) return null;

  // Factual leaderboard: real mentor Anton Irkhin and current user
  const isCurrentUserAnton = progress.name?.toLowerCase().includes('ирхин') || Boolean(progress.isAdmin);

  const combined = isCurrentUserAnton
    ? [
        {
          rank: 1,
          name: 'Антон Ирхин',
          title: 'Основатель & Главный Наставник 👑',
          xp: Math.max(2500, progress.xp),
          badges: 7,
          isUser: true,
        },
      ]
    : [
        ...LEADERBOARD_CREW,
        {
          rank: 0,
          name: progress.name || 'Вы (Студент Академии)',
          title: progress.completedLevels.includes(7)
            ? 'Легендарный Пармастер 👑'
            : progress.completedLevels.length >= 4
            ? 'Опытный Пармейстер'
            : 'Подмастерье Банного Дела',
          xp: progress.xp,
          badges: progress.unlockedBadges.length,
          isUser: true,
        },
      ].sort((a, b) => b.xp - a.xp);

  combined.forEach((entry, idx) => {
    entry.rank = idx + 1;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl border border-stone-800 bg-stone-900 p-6 sm:p-7 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-stone-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-300">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-amber-400">
                Командный рейтинг · Рейтинг Мастеров
              </div>
              <h3 className="font-serif text-xl font-bold text-stone-100">
                Таблица Лидеров Пармейстеров
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User Current Quick Snapshot */}
        <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🌾</span>
            <div>
              <div className="text-xs font-mono text-stone-400 uppercase">Ваша позиция:</div>
              <div className="font-bold text-sm text-stone-100">
                {userEntry.name} · <span className="text-amber-400">{userEntry.title}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-mono text-base font-bold text-amber-300 tabular-nums">
              {progress.xp} XP
            </div>
            <div className="text-xs text-stone-500 font-mono">
              Трофеев: {progress.unlockedBadges.length} / 7
            </div>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="space-y-2">
          <div className="grid grid-cols-12 text-[11px] font-mono uppercase text-stone-500 px-3 pb-1">
            <span className="col-span-2">Ранг</span>
            <span className="col-span-6">Мастер / Звание</span>
            <span className="col-span-2 text-center">Награды</span>
            <span className="col-span-2 text-right">Очки XP</span>
          </div>

          <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1 scrollbar-thin">
            {combined.map((entry) => {
              const isCurrentUser = (entry as { isUser?: boolean }).isUser;
              return (
                <div
                  key={entry.name}
                  className={`grid grid-cols-12 items-center px-3 py-2.5 rounded-xl border text-xs transition-colors ${
                    isCurrentUser
                      ? 'border-amber-500/60 bg-amber-950/40 text-stone-100 font-medium'
                      : 'border-stone-800/80 bg-stone-950/70 text-stone-300'
                  }`}
                >
                  <div className="col-span-2 flex items-center gap-1.5 font-mono font-bold">
                    {entry.rank === 1 && <span className="text-amber-400">🥇</span>}
                    {entry.rank === 2 && <span className="text-stone-300">🥈</span>}
                    {entry.rank === 3 && <span className="text-amber-600">🥉</span>}
                    {entry.rank > 3 && <span className="text-stone-500">#{entry.rank}</span>}
                  </div>

                  <div className="col-span-6">
                    <div className="font-semibold text-stone-100 truncate">{entry.name}</div>
                    <div className="text-[10px] text-stone-400 truncate">{entry.title}</div>
                  </div>

                  <div className="col-span-2 text-center font-mono text-amber-300">
                    {entry.badges} 🏆
                  </div>

                  <div className="col-span-2 text-right font-mono font-bold text-amber-400 tabular-nums">
                    {entry.xp}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pt-2 text-xs text-stone-400 text-center">
          Баллы XP начисляются за прохождение уровней, симуляторы и верные ответы в тестах.
        </div>
      </div>
    </div>
  );
};
