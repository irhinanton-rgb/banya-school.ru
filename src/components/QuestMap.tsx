import React from 'react';
import { COURSE_LEVELS, BADGES } from '../data/courseData';
import { LevelId, UserProgress } from '../types/banya';
import {
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  Award,
  BookOpen,
  Target,
  Zap,
} from 'lucide-react';

interface QuestMapProps {
  progress: UserProgress;
  onSelectLevel: (levelId: LevelId) => void;
  activeLevelId: LevelId;
  onOpenPricing?: () => void;
}

export const QuestMap: React.FC<QuestMapProps> = ({
  progress,
  onSelectLevel,
  activeLevelId,
  onOpenPricing,
}) => {
  const isMasterPro =
    Boolean(progress?.isAdmin) ||
    Boolean(progress?.isPaid) ||
    progress?.tariff === 'master_pro';

  const completed = progress?.completedLevels || [];
  const level1 = COURSE_LEVELS[0];
  const level1Completed = completed.includes(1);
  const remainingLevels = COURSE_LEVELS.slice(1);

  return (
    <div className="space-y-8">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Интерактивная Программа Обучения</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-100 mt-1">
            Карта Квеста: Путь к Мастерству
          </h2>
          <p className="text-xs sm:text-sm text-stone-400 mt-0.5">
            Пройдите все станции от новичка до обладателя диплома и Короны Пармастера
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-stone-900 border border-stone-800 text-xs font-mono text-stone-300">
            <span>Пройдено уровней: </span>
            <strong className="text-amber-300 font-bold">
              {completed.length} / {COURSE_LEVELS.length}
            </strong>
          </div>
        </div>
      </div>

      {/* 1. BRIGHTLY LIT FEATURED CARD: "Уровень 1: Вход в Банное Дело" */}
      <div className="relative group">
        {/* Warm golden backlight bloom */}
        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-amber-500/20 via-amber-400/30 to-amber-600/20 blur-xl opacity-80 group-hover:opacity-100 transition-opacity pointer-events-none" />

        <div className="relative rounded-3xl border-2 border-amber-500/80 bg-gradient-to-br from-stone-900/95 via-amber-950/20 to-stone-900/95 p-6 sm:p-8 shadow-[0_15px_40px_-10px_rgba(245,158,11,0.3)] backdrop-blur-xl space-y-6">
          
          {/* Card Top: Number, Status & Category */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 text-stone-950 font-serif text-2xl font-bold shadow-lg ring-2 ring-amber-300/40">
                1
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-amber-300 font-semibold">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{level1Completed ? 'Уровень пройден' : 'Активный уровень · Доступен бесплатно'}</span>
                </div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-white drop-shadow">
                  {level1.title}
                </h3>
              </div>
            </div>

            {/* Badge & Reward Snapshot */}
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-stone-950/80 border border-amber-500/40 shadow-inner">
              <span className="text-2xl filter drop-shadow">🌾</span>
              <div className="text-right">
                <span className="text-[10px] font-mono text-stone-400 uppercase block">Награда</span>
                <span className="text-xs font-serif font-bold text-amber-300">
                  Золотой веник +350 XP
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm sm:text-base text-stone-200 leading-relaxed font-sans max-w-4xl">
            {level1.questName}. На этом уровне вы освоите физиологию согревания организма, правила залпового проветривания, гипоксический баланс и священную церемонию первого пара без термического шока.
          </p>

          {/* Clear "Задание" Block as requested in prompt */}
          <div className="rounded-2xl bg-stone-950/85 border border-amber-500/30 p-4 sm:p-5 space-y-2 shadow-inner">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">
              <Target className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Задание Уровня:</span>
            </div>
            <p className="text-xs sm:text-sm text-stone-200 leading-relaxed pl-6">
              {level1.taskTitle}. Изучить 4 фундаментальных правила банного микроклимата и пройти интерактивную симуляцию церемонии первого пара.
            </p>
          </div>

          {/* Bottom Action Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-stone-800">
            <div className="flex items-center gap-4 text-xs font-mono text-stone-400">
              <span className="flex items-center gap-1.5 text-amber-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                4 обучающих модуля
              </span>
              <span>•</span>
              <span>Интерактивный тест</span>
              <span>•</span>
              <span className="text-emerald-400">100% Практика</span>
            </div>

            <button
              onClick={() => onSelectLevel(1)}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:shadow-[0_0_30px_rgba(245,158,11,0.6)] cursor-pointer flex items-center justify-center gap-2 active:scale-95"
            >
              <span>{level1Completed ? 'Повторить Уровень 1' : 'ВОЙТИ В ПЕРВЫЙ УРОК →'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* 2. LOCKED LEVELS 2 TO 7 ("FOG OF WAR" EFFECT) */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-200">
              Следующие уровни Академии (2–7)
            </h3>
            <p className="text-xs text-stone-400">
              Программа глубокого погружения в профессию пармастера
            </p>
          </div>
          {!isMasterPro && (
            <button
              onClick={onOpenPricing}
              className="text-xs font-mono text-amber-400 hover:text-amber-300 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Открыть все в тарифе PRO</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {remainingLevels.map((lvl) => {
            const isCompleted = completed.includes(lvl.id);
            const isActive = activeLevelId === lvl.id;
            // Accessible if PRO/admin, or if previous level completed
            const isAccessible =
              isMasterPro ||
              completed.includes((lvl.id - 1) as LevelId) ||
              isCompleted;

            const badge = BADGES.find((b) => b.id === lvl.rewardBadge);
            const isFinalExam = lvl.id === 7;

            return (
              <div
                key={lvl.id}
                onClick={() => {
                  if (isAccessible) {
                    onSelectLevel(lvl.id);
                  } else if (onOpenPricing) {
                    onOpenPricing();
                  }
                }}
                className={`group rounded-2xl border p-5 transition-all relative flex flex-col justify-between ${
                  isAccessible
                    ? 'border-stone-800 bg-stone-900/90 hover:border-amber-500/60 hover:-translate-y-1 shadow-lg cursor-pointer'
                    : 'border-stone-800/80 bg-stone-950/70 backdrop-blur-md opacity-60 hover:opacity-85 cursor-pointer shadow-inner'
                } ${
                  isActive
                    ? 'border-amber-500 bg-amber-950/20 ring-1 ring-amber-500/50'
                    : isCompleted
                    ? 'border-emerald-500/40 bg-stone-900/90'
                    : ''
                }`}
              >
                {/* Fog of war overlay for locked cards */}
                {!isAccessible && (
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-stone-950/40 via-stone-950/60 to-stone-950/80 pointer-events-none rounded-2xl" />
                )}

                <div className="relative space-y-3 z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-7 w-7 rounded-lg flex items-center justify-center text-xs font-mono font-bold ${
                          isCompleted
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : isAccessible
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
                      ) : isAccessible ? (
                        <span className="text-[11px] text-amber-400 font-mono">
                          Доступен
                        </span>
                      ) : (
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-[10px] font-mono text-amber-300 font-semibold shadow-sm">
                          <Lock className="h-3 w-3 text-amber-400" />
                          <span>PRO · Откроется после Уровня {lvl.id - 1}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <h4 className="font-serif text-base sm:text-lg font-bold text-stone-100 group-hover:text-amber-200 transition-colors">
                    {lvl.title.replace(`Уровень ${lvl.id}: `, '')}
                  </h4>

                  <p className="text-xs text-stone-400 line-clamp-2 leading-relaxed">
                    {lvl.questName}
                  </p>
                </div>

                {/* Reward Snapshot */}
                <div className="relative mt-5 pt-3 border-t border-stone-800/80 flex items-center justify-between z-10">
                  {badge && (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-xl">{badge.icon}</span>
                      <div className="text-[11px]">
                        <span className="text-stone-300 font-medium block">{badge.name}</span>
                        <span className="text-amber-400/90 font-mono">+{lvl.rewardXp} XP</span>
                      </div>
                    </div>
                  )}

                  {isAccessible ? (
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
                  ) : (
                    <span className="text-[11px] text-amber-400/80 font-mono group-hover:text-amber-300 flex items-center gap-1">
                      <span>Подробнее</span>
                      <ArrowRight className="h-3 w-3" />
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
