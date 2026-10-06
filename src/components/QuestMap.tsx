import React from 'react';
import { COURSE_LEVELS, BADGES } from '../data/courseData';
import { LevelId, UserProgress } from '../types/banya';
import { CheckCircle2, Lock, ArrowRight, Sparkles, Award } from 'lucide-react';

interface QuestMapProps {
  progress: UserProgress;
  onSelectLevel: (levelId: LevelId) => void;
  activeLevelId: LevelId;
}

export const QuestMap: React.FC<QuestMapProps> = ({
  progress,
  onSelectLevel,
  activeLevelId,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-800 pb-3">
        <div>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-100">
            Карта Квеста: Путь к Мастерству
          </h3>
          <p className="text-xs text-stone-400">
            Пройдите все станции от новичка до обладателя Короны Пармастера
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-stone-400">
          <span>Разблокировано наград:</span>
          <span className="font-bold text-amber-400">
            {progress.unlockedBadges.length} / {BADGES.length}
          </span>
        </div>
      </div>

      {/* Quest Steps Linear Roadmap */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {COURSE_LEVELS.map((lvl) => {
          const isCompleted = progress.completedLevels.includes(lvl.id);
          const isActive = activeLevelId === lvl.id;
          // Unlocked if admin, previous is completed or it is level 1
          const isUnlocked = progress.isAdmin || lvl.id === 1 || progress.completedLevels.includes((lvl.id - 1) as LevelId) || isCompleted;
          const badge = BADGES.find((b) => b.id === lvl.rewardBadge);
          const isFinalExam = lvl.id === 7;

          return (
            <div
              key={lvl.id}
              onClick={() => {
                if (isUnlocked) onSelectLevel(lvl.id);
              }}
              className={`rounded-2xl border p-5 transition-all relative flex flex-col justify-between ${
                isUnlocked ? 'cursor-pointer hover:border-amber-500/60 hover:-translate-y-1 shadow-lg' : 'opacity-60 cursor-not-allowed'
              } ${
                isFinalExam
                  ? 'md:col-span-2 lg:col-span-3 border-amber-500/40 bg-gradient-to-r from-amber-950/30 via-stone-900 to-amber-950/30'
                  : isActive
                  ? 'border-amber-500 bg-amber-950/20 ring-1 ring-amber-500/50'
                  : isCompleted
                  ? 'border-emerald-500/40 bg-stone-900/90'
                  : 'border-stone-800 bg-stone-950/70'
              }`}
            >
              {/* Card Header */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-7 w-7 rounded-lg flex items-center justify-center text-xs font-mono font-bold ${
                        isCompleted
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : isActive
                          ? 'bg-amber-500 text-stone-950'
                          : 'bg-stone-800 text-stone-400'
                      }`}
                    >
                      {lvl.id}
                    </span>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-stone-400">
                      Уровень {lvl.id}
                    </span>
                  </div>

                  <div>
                    {isCompleted ? (
                      <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Пройден</span>
                      </span>
                    ) : isUnlocked ? (
                      <span className="text-[11px] text-amber-400 font-mono">
                        Доступен
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] text-stone-500 font-mono">
                        <Lock className="h-3.5 w-3.5" />
                        <span>Закрыт</span>
                      </span>
                    )}
                  </div>
                </div>

                <h4 className="font-serif text-lg font-bold text-stone-100 group-hover:text-amber-200 transition-colors">
                  {lvl.title.replace(`Уровень ${lvl.id}: `, '')}
                </h4>

                <p className="text-xs text-stone-400 line-clamp-2 leading-relaxed">
                  {lvl.questName}
                </p>
              </div>

              {/* Reward Snapshot */}
              <div className="mt-5 pt-3 border-t border-stone-800/80 flex items-center justify-between">
                {badge && (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-xl">{badge.icon}</span>
                    <div className="text-[11px]">
                      <span className="text-stone-300 font-medium block">{badge.name}</span>
                      <span className="text-amber-400/90 font-mono">+{lvl.rewardXp} XP</span>
                    </div>
                  </div>
                )}

                {isUnlocked && (
                  <button
                    className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                      isActive
                        ? 'bg-amber-500 text-stone-950 font-bold'
                        : 'bg-stone-800 text-stone-300 hover:text-white'
                    }`}
                  >
                    <span>{isCompleted ? 'Повторить' : 'Войти'}</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
