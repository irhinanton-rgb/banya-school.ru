import React, { useState } from 'react';
import { MicroclimateSimulator } from './simulators/MicroclimateSimulator';
import { BroomTechniquesSimulator } from './simulators/BroomTechniquesSimulator';
import { HerbalBlenderSimulator } from './simulators/HerbalBlenderSimulator';
import { GuestTriageSimulator } from './simulators/GuestTriageSimulator';
import { Thermometer, Activity, Sparkles, ShieldCheck, Lock, CheckCircle2, ArrowRight } from 'lucide-react';
import { UserProgress, LevelId } from '../types/banya';
import { COURSE_LEVELS } from '../data/courseData';

interface SimulatorsHubProps {
  soundEnabled: boolean;
  onGrantXp: (amount: number) => void;
  progress: UserProgress;
  onNavigateToLevel: (levelId: LevelId) => void;
  onOpenPricing?: () => void;
}

export const SimulatorsHub: React.FC<SimulatorsHubProps> = ({
  soundEnabled,
  onGrantXp,
  progress,
  onNavigateToLevel,
  onOpenPricing,
}) => {
  const [activeSim, setActiveSim] = useState<'climate' | 'brooms' | 'herbs' | 'triage'>('climate');

  const completed = progress?.completedLevels ?? [];
  const isMasterPro = Boolean(progress.isAdmin || progress.isPaid || progress.tariff === 'master_pro');

  // Simulator unlock criteria: strictly tied to course completion!
  const SIM_CONFIG = {
    climate: {
      requiredLevel: 1 as LevelId,
      title: 'Микроклимат & Точка Росы',
      levelName: 'Уровень 1: Рождение Пара & Микроклимат',
      icon: <Thermometer className="h-4 w-4" />,
      isUnlocked: isMasterPro || completed.includes(1),
    },
    brooms: {
      requiredLevel: 2 as LevelId,
      title: '8 Приёмов Веника (Ритм)',
      levelName: 'Уровень 2: Венечные Техники & Хваты',
      icon: <span>🍃</span>,
      isUnlocked: isMasterPro || completed.includes(2),
    },
    herbs: {
      requiredLevel: 3 as LevelId,
      title: 'Аромабар & Травы',
      levelName: 'Уровень 3: Фитотерапия & Запарки',
      icon: <Sparkles className="h-4 w-4" />,
      isUnlocked: isMasterPro || completed.includes(3),
    },
    triage: {
      requiredLevel: 4 as LevelId,
      title: 'Диагностика Гостя & Безопасность',
      levelName: 'Уровень 4: Физиология & Безопасность Гостя',
      icon: <ShieldCheck className="h-4 w-4" />,
      isUnlocked: isMasterPro || completed.includes(4),
    },
  };

  const currentSimConfig = SIM_CONFIG[activeSim];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Hub Header */}
      <div className="rounded-3xl border border-stone-800 bg-gradient-to-br from-stone-900/95 via-stone-900/80 to-stone-950 p-6 sm:p-8 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
            <Activity className="h-4 w-4" />
            <span>Практический Полигон Пармастера</span>
          </div>
          <div className="text-xs font-mono text-stone-400">
            Доступно тренажеров:{' '}
            <strong className="text-amber-300">
              {Object.values(SIM_CONFIG).filter((s) => s.isUnlocked).length} / 4
            </strong>
          </div>
        </div>

        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-100">
          Интерактивные Тренажеры & Симуляторы
        </h2>
        <p className="text-xs sm:text-sm text-stone-300 max-w-3xl leading-relaxed">
          Практическая лаборатория навыков. Доступ к каждому тренажёру открывается по мере сдачи соответствующих уровней основного обучающего квеста.
        </p>

        {/* Tab switchers with Lock badges */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-stone-800">
          {(Object.keys(SIM_CONFIG) as (keyof typeof SIM_CONFIG)[]).map((simKey) => {
            const item = SIM_CONFIG[simKey];
            const isActive = activeSim === simKey;

            return (
              <button
                key={simKey}
                onClick={() => setActiveSim(simKey)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-amber-500 text-stone-950 font-bold border-amber-400 shadow-md scale-102'
                    : item.isUnlocked
                    ? 'bg-stone-950 text-stone-200 hover:bg-stone-800 border-stone-800'
                    : 'bg-stone-950/60 text-stone-400 hover:text-stone-300 border-stone-800/80 opacity-75'
                }`}
              >
                {item.icon}
                <span>{item.title}</span>
                {item.isUnlocked ? (
                  <CheckCircle2
                    className={`w-3.5 h-3.5 ${isActive ? 'text-stone-950 stroke-[2.5]' : 'text-emerald-400'}`}
                  />
                ) : (
                  <span className="flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-stone-900 border border-stone-700/60 text-amber-400">
                    <Lock className="w-2.5 h-2.5" />
                    <span>Ур.{item.requiredLevel}</span>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Simulator Display or Strict Locked Notice */}
      {currentSimConfig.isUnlocked ? (
        <>
          {activeSim === 'climate' && (
            <MicroclimateSimulator
              soundEnabled={soundEnabled}
              onSuccessTask={() => onGrantXp(20)}
            />
          )}

          {activeSim === 'brooms' && (
            <BroomTechniquesSimulator
              soundEnabled={soundEnabled}
              onGrantXp={onGrantXp}
            />
          )}

          {activeSim === 'herbs' && (
            <HerbalBlenderSimulator
              soundEnabled={soundEnabled}
              onGrantXp={onGrantXp}
            />
          )}

          {activeSim === 'triage' && (
            <GuestTriageSimulator
              soundEnabled={soundEnabled}
              onGrantXp={onGrantXp}
            />
          )}
        </>
      ) : (
        <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-br from-stone-900 via-stone-950 to-stone-900 p-8 sm:p-12 text-center space-y-6 shadow-2xl">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-3xl">
            🔒
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
              Доступ заблокирован
            </span>
            <h3 className="font-serif text-2xl font-bold text-stone-100 pt-2">
              Тренажёр откроется после прохождения курса
            </h3>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Чтобы получить неограниченный доступ к свободному тренажёру{' '}
              <strong className="text-amber-200">«{currentSimConfig.title}»</strong>, сначала изучите теорию и успешно сдайте тестовую станцию:
            </p>
            <div className="p-3 rounded-xl bg-stone-900 border border-stone-800 text-xs text-amber-300 font-mono">
              📖 {currentSimConfig.levelName}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onNavigateToLevel(currentSimConfig.requiredLevel)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg cursor-pointer transform hover:scale-102"
            >
              <span>Пройти Уровень {currentSimConfig.requiredLevel} в квесте</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {onOpenPricing && !isMasterPro && (
              <button
                onClick={onOpenPricing}
                className="px-5 py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                Открыть доступ ко всем тренажёрам PRO 👑
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
