import React from 'react';
import { BADGES } from '../data/courseData';
import { BadgeId } from '../types/banya';
import { Award, Lock, Sparkles } from 'lucide-react';

interface BadgesShowcaseProps {
  unlockedBadges: BadgeId[];
}

export const BadgesShowcase: React.FC<BadgesShowcaseProps> = ({ unlockedBadges }) => {
  return (
    <div className="rounded-2xl border border-stone-800 bg-stone-900/90 p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-800 pb-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber-400">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Инвентарь Мастера</span>
          </div>
          <h3 className="font-serif text-xl font-bold text-stone-100 mt-0.5">
            Полученные Реликвии и Трофеи
          </h3>
        </div>

        <div className="text-xs text-stone-400 font-mono">
          Собрано: <span className="text-amber-400 font-bold">{unlockedBadges.length}</span> из {BADGES.length}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        {BADGES.map((b) => {
          const isUnlocked = unlockedBadges.includes(b.id);
          return (
            <div
              key={b.id}
              className={`p-3.5 rounded-xl border text-center flex flex-col items-center justify-between transition-all ${
                isUnlocked
                  ? 'border-amber-500/50 bg-stone-950 shadow-md ring-1 ring-amber-500/20'
                  : 'border-stone-800/80 bg-stone-950/40 opacity-45'
              }`}
            >
              <div className="text-3xl my-1 relative">
                {b.icon}
                {!isUnlocked && (
                  <span className="absolute -top-1 -right-1 text-xs bg-stone-900 rounded-full p-0.5 border border-stone-700">
                    🔒
                  </span>
                )}
              </div>

              <div className="mt-1 space-y-1">
                <div className="font-semibold text-xs text-stone-100 truncate w-full">
                  {b.name}
                </div>
                <div className="text-[10px] text-stone-400 font-mono">
                  {isUnlocked ? 'Уровень ' + b.unlockedAtLevel : 'Уровень ' + b.unlockedAtLevel}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
