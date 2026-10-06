import React from 'react';
import { LevelId, UserProgress } from '../types/banya';
import { COURSE_LEVELS } from '../data/courseData';
import { Check, Lock } from 'lucide-react';

interface MobileLevelQuickNavProps {
  activeLevelId: LevelId;
  onSelectLevel: (levelId: LevelId) => void;
  progress: UserProgress;
}

export const MobileLevelQuickNav: React.FC<MobileLevelQuickNavProps> = ({
  activeLevelId,
  onSelectLevel,
  progress,
}) => {
  const completed = progress?.completedLevels ?? [];

  return (
    <div className="md:hidden sticky top-16 z-30 -mx-4 px-4 py-2 bg-stone-950/95 backdrop-blur-md border-b border-stone-800/80 shadow-sm">
      <div className="flex items-center justify-between mb-1.5 px-0.5">
        <span className="text-[11px] font-mono text-amber-400 font-semibold uppercase tracking-wider">
          Станции курса (7 этапов):
        </span>
        <span className="text-[11px] font-mono text-stone-400">
          Сдано: <strong className="text-amber-300">{completed.length}/7</strong>
        </span>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none scroll-smooth">
        {COURSE_LEVELS.map((lvl) => {
          const isActive = lvl.id === activeLevelId;
          const isDone = completed.includes(lvl.id);
          const isPro = lvl.id > 2 && !progress.isPaid && progress.tariff !== 'master_pro' && !progress.isAdmin;

          return (
            <button
              key={lvl.id}
              onClick={() => {
                onSelectLevel(lvl.id as LevelId);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs whitespace-nowrap transition-all shrink-0 cursor-pointer border ${
                isActive
                  ? 'bg-amber-500 text-stone-950 font-bold border-amber-400 shadow-md scale-102'
                  : isDone
                  ? 'bg-stone-900/90 text-emerald-300 border-emerald-500/30'
                  : 'bg-stone-900/60 text-stone-300 border-stone-800 hover:border-stone-700'
              }`}
            >
              <span className="font-mono text-[10px] opacity-80">#{lvl.id}</span>
              <span className="truncate max-w-[120px]">{lvl.questName.split(':')[1]?.trim() || lvl.title}</span>
              {isDone ? (
                <Check className={`w-3 h-3 ${isActive ? 'text-stone-950 stroke-[3]' : 'text-emerald-400'}`} />
              ) : isPro ? (
                <Lock className={`w-2.5 h-2.5 ${isActive ? 'text-stone-950' : 'text-amber-400/80'}`} />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
};
