import React, { useState } from 'react';
import { MicroclimateSimulator } from './simulators/MicroclimateSimulator';
import { BroomTechniquesSimulator } from './simulators/BroomTechniquesSimulator';
import { HerbalBlenderSimulator } from './simulators/HerbalBlenderSimulator';
import { GuestTriageSimulator } from './simulators/GuestTriageSimulator';
import { Thermometer, Activity, Sparkles, ShieldCheck } from 'lucide-react';

interface SimulatorsHubProps {
  soundEnabled: boolean;
  onGrantXp: (amount: number) => void;
}

export const SimulatorsHub: React.FC<SimulatorsHubProps> = ({
  soundEnabled,
  onGrantXp,
}) => {
  const [activeSim, setActiveSim] = useState<'climate' | 'brooms' | 'herbs' | 'triage'>('climate');

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Hub Header */}
      <div className="rounded-2xl border border-stone-800 bg-stone-900/90 p-6 space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
          <Activity className="h-4 w-4" />
          <span>Практический Полигон Пармастера</span>
        </div>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-100">
          Интерактивные Тренажеры & Симуляторы
        </h2>
        <p className="text-xs sm:text-sm text-stone-300 max-w-2xl leading-relaxed">
          Отрабатывайте ключевые навыки парения в свободной форме: настраивайте кондиции пара, стучите в ритм техник, составляйте целебные сборы и выявляйте противопоказания гостей.
        </p>

        {/* Tab switchers */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-stone-800">
          <button
            onClick={() => setActiveSim('climate')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeSim === 'climate'
                ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                : 'bg-stone-950 text-stone-300 hover:bg-stone-800 border border-stone-800'
            }`}
          >
            <Thermometer className="h-4 w-4" />
            <span>Микроклимат & Точка Росы</span>
          </button>

          <button
            onClick={() => setActiveSim('brooms')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeSim === 'brooms'
                ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                : 'bg-stone-950 text-stone-300 hover:bg-stone-800 border border-stone-800'
            }`}
          >
            <span>🍃</span>
            <span>8 Приёмов Веника (Ритм)</span>
          </button>

          <button
            onClick={() => setActiveSim('herbs')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeSim === 'herbs'
                ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                : 'bg-stone-950 text-stone-300 hover:bg-stone-800 border border-stone-800'
            }`}
          >
            <Sparkles className="h-4 w-4" />
            <span>Аромабар & Травы</span>
          </button>

          <button
            onClick={() => setActiveSim('triage')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeSim === 'triage'
                ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                : 'bg-stone-950 text-stone-300 hover:bg-stone-800 border border-stone-800'
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Диагностика Гостя</span>
          </button>
        </div>
      </div>

      {/* Simulator Display */}
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
    </div>
  );
};
