import React, { useState, useEffect } from 'react';
import { BROOM_TECHNIQUES } from '../../data/courseData';
import { BroomTechnique } from '../../types/banya';
import { playWoodTap, playSteamSound } from '../../utils/audio';
import { Play, Sparkles, Activity, CheckCircle2, RotateCcw } from 'lucide-react';

interface BroomTechniquesSimulatorProps {
  soundEnabled: boolean;
  onGrantXp?: (amount: number) => void;
}

export const BroomTechniquesSimulator: React.FC<BroomTechniquesSimulatorProps> = ({
  soundEnabled,
  onGrantXp,
}) => {
  const [selectedTech, setSelectedTech] = useState<BroomTechnique>(BROOM_TECHNIQUES[0]);
  const [isAnimating, setIsAnimating] = useState<boolean>(true);
  const [tapCount, setTapCount] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [feedbackMsg, setFeedbackMsg] = useState<string>('Нажимайте кнопку удара в ритм техники!');

  // Wood tap mechanic
  const handleTap = () => {
    playWoodTap(soundEnabled);
    setTapCount((prev) => prev + 1);
    setCombo((prev) => {
      const next = prev + 1;
      if (next % 6 === 0) {
        setFeedbackMsg(`🔥 Идеальный ритм! Техника «${selectedTech.name}» закреплена (+10 XP)`);
        if (onGrantXp) onGrantXp(10);
      } else {
        setFeedbackMsg(`Удар ${next}: мягкая подушка листьев, спина прямая!`);
      }
      return next;
    });
  };

  const handleSelectTech = (tech: BroomTechnique) => {
    setSelectedTech(tech);
    setCombo(0);
    setFeedbackMsg(`Выбрана техника: ${tech.name}. Держите мягкий хват!`);
    playSteamSound(soundEnabled);
  };

  return (
    <div className="rounded-2xl border border-stone-800 bg-stone-900/90 p-5 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
            <span>🌿</span>
            <span>Интерактивный Венечный Тренажер</span>
          </div>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-100 mt-1">
            8 Приёмов Венечного Массажа & Ритм-Тренажёр
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-stone-950 border border-stone-800 px-3 py-1.5 text-xs font-mono text-amber-300">
            Серия ударов: <span className="font-bold tabular-nums">{tapCount}</span>
          </div>
        </div>
      </div>

      {/* Technique Selector Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
        {BROOM_TECHNIQUES.map((tech) => {
          const isSelected = selectedTech.id === tech.id;
          return (
            <button
              key={tech.id}
              onClick={() => handleSelectTech(tech)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                isSelected
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                  : 'bg-stone-950 hover:bg-stone-800 text-stone-300 border border-stone-800'
              }`}
            >
              {tech.name}
            </button>
          );
        })}
      </div>

      {/* Main Interactive Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Dynamic Visual Broom Stage */}
        <div className="lg:col-span-7 rounded-xl border border-stone-800 bg-stone-950 p-6 flex flex-col justify-between relative overflow-hidden">
          {/* Ambient Wood Glow */}
          <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full bg-amber-600/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full bg-emerald-600/10 blur-3xl pointer-events-none" />

          {/* SVG Animated Brooms Demonstration */}
          <div className="relative h-48 w-full flex items-center justify-center my-2">
            <svg
              className="w-full h-full max-w-md"
              viewBox="0 0 400 200"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Bath shelf / body line */}
              <rect x="50" y="150" width="300" height="20" rx="4" fill="#292524" stroke="#44403c" strokeWidth="2" />
              <text x="200" y="164" textAnchor="middle" fill="#78716c" fontSize="10" fontFamily="sans-serif">
                Поверхность тела гостя (зона: {selectedTech.zone})
              </text>

              {/* Steam waves */}
              <path
                d="M 120 70 Q 140 50, 160 70 T 200 70"
                stroke="rgba(245, 158, 11, 0.3)"
                strokeWidth="2"
                strokeDasharray="4 4"
                className="animate-pulse"
              />
              <path
                d="M 220 60 Q 240 40, 260 60 T 300 60"
                stroke="rgba(245, 158, 11, 0.3)"
                strokeWidth="2"
                strokeDasharray="4 4"
                className="animate-pulse"
              />

              {/* Left Broom Graphic */}
              <g
                className="transition-transform duration-300 origin-[140px_40px]"
                style={{
                  transform:
                    selectedTech.id === 'opakhivanie'
                      ? 'translateY(-15px) rotate(-15deg)'
                      : selectedTech.id === 'priparka'
                      ? 'translateY(40px) scale(1.05)'
                      : selectedTech.id === 'dvoika_perekhlyost'
                      ? 'translateX(30px) rotate(25deg)'
                      : 'translateY(10px) rotate(-8deg)',
                }}
              >
                {/* Handle */}
                <rect x="135" y="20" width="8" height="50" rx="2" fill="#78350f" stroke="#92400e" strokeWidth="1" />
                {/* Leaves fan */}
                <path
                  d="M 110 70 Q 140 55, 170 70 C 185 100, 175 125, 140 135 C 105 125, 95 100, 110 70 Z"
                  fill="#15803d"
                  stroke="#16a34a"
                  strokeWidth="2"
                  opacity="0.9"
                />
                <circle cx="140" cy="100" r="14" fill="#22c55e" opacity="0.4" />
              </g>

              {/* Right Broom Graphic */}
              <g
                className="transition-transform duration-300 origin-[260px_40px]"
                style={{
                  transform:
                    selectedTech.id === 'opakhivanie'
                      ? 'translateY(-15px) rotate(15deg)'
                      : selectedTech.id === 'priparka'
                      ? 'translateY(40px) scale(1.05)'
                      : selectedTech.id === 'dvoika_perekhlyost'
                      ? 'translateX(-30px) rotate(-25deg)'
                      : 'translateY(10px) rotate(8deg)',
                }}
              >
                {/* Handle */}
                <rect x="255" y="20" width="8" height="50" rx="2" fill="#78350f" stroke="#92400e" strokeWidth="1" />
                {/* Leaves fan */}
                <path
                  d="M 230 70 Q 260 55, 290 70 C 305 100, 295 125, 260 135 C 225 125, 215 100, 230 70 Z"
                  fill="#15803d"
                  stroke="#16a34a"
                  strokeWidth="2"
                  opacity="0.9"
                />
                <circle cx="260" cy="100" r="14" fill="#22c55e" opacity="0.4" />
              </g>
            </svg>
          </div>

          {/* Rhythm Tapper Button */}
          <div className="rounded-xl bg-stone-900/90 border border-stone-800 p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-stone-400 font-medium">Ритмический тренажер руки:</span>
              <span className="text-amber-400 font-mono font-semibold">
                Темп: {selectedTech.tempo} ({selectedTech.frequency} уд/мин)
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={handleTap}
                className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-stone-950 font-bold text-sm tracking-wide transition-all shadow-lg cursor-pointer select-none"
              >
                <span>🍃</span>
                <span>Сделать удар веником (Тап в ритм)</span>
              </button>

              <button
                onClick={() => setCombo(0)}
                title="Сбросить счетчик"
                className="p-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-stone-200 transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-amber-200/80 font-mono text-center sm:text-left">
              {feedbackMsg}
            </p>
          </div>
        </div>

        {/* Right: Technique Anatomy & Instructions */}
        <div className="lg:col-span-5 rounded-xl border border-stone-800 bg-stone-950/70 p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-amber-400">КАРТОЧКА ПРИЁМА</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-stone-800 text-stone-300 font-mono">
                {selectedTech.tempo}
              </span>
            </div>

            <h4 className="font-serif text-xl font-bold text-stone-100">
              {selectedTech.name}
            </h4>

            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              {selectedTech.description}
            </p>

            <div className="border-t border-stone-800 pt-3 space-y-2 text-xs">
              <div>
                <strong className="text-stone-200 block mb-0.5">Механика выполнения:</strong>
                <p className="text-stone-400 leading-relaxed">{selectedTech.execution}</p>
              </div>

              <div>
                <strong className="text-stone-200 block mb-0.5">Физиологический эффект:</strong>
                <p className="text-emerald-400/90 leading-relaxed">{selectedTech.purpose}</p>
              </div>

              <div>
                <strong className="text-stone-200 block mb-0.5">Рабочая зона тела:</strong>
                <p className="text-amber-300/90 font-mono">{selectedTech.zone}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-stone-900 p-3 border border-stone-800/80 text-[11px] text-stone-400 leading-relaxed">
            <span className="text-amber-400 font-semibold block mb-0.5">Совет наставника:</span>
            Никогда не бейте по телу деревянной ручкой веника. Работает только мягкая упругая лиственная шапка, которая бережно захватывает пар из воздуха.
          </div>
        </div>
      </div>
    </div>
  );
};
