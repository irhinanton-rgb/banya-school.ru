import React, { useState } from 'react';
import { HERBS_DATA } from '../../data/courseData';
import { HerbInfo } from '../../types/banya';
import { playSteamSound } from '../../utils/audio';
import { Sparkles, AlertCircle, Check, Info, Flame, Droplet } from 'lucide-react';

interface HerbalBlenderSimulatorProps {
  soundEnabled: boolean;
  onGrantXp?: (amount: number) => void;
}

export const HerbalBlenderSimulator: React.FC<HerbalBlenderSimulatorProps> = ({
  soundEnabled,
  onGrantXp,
}) => {
  const [selectedHerbs, setSelectedHerbs] = useState<HerbInfo[]>([HERBS_DATA[0], HERBS_DATA[1]]);
  const [isBrewing, setIsBrewing] = useState<boolean>(false);
  const [brewResult, setBrewResult] = useState<string | null>(null);

  const toggleHerb = (herb: HerbInfo) => {
    setBrewResult(null);
    if (selectedHerbs.some((h) => h.id === herb.id)) {
      setSelectedHerbs(selectedHerbs.filter((h) => h.id !== herb.id));
    } else {
      if (selectedHerbs.length >= 3) {
        // limit to 3 for balanced aromatherapy synergy
        return;
      }
      setSelectedHerbs([...selectedHerbs, herb]);
    }
  };

  const handleBrew = () => {
    if (selectedHerbs.length === 0) return;
    setIsBrewing(true);
    playSteamSound(soundEnabled);

    setTimeout(() => {
      setIsBrewing(false);
      // Generate synergy summary
      const names = selectedHerbs.map((h) => h.name).join(' + ');
      let effect = 'Гармонизирующий банный сбор: мягкое прогревание и релаксация всего тела.';
      if (selectedHerbs.some((h) => h.id === 'oregano') && selectedHerbs.some((h) => h.id === 'chamomile')) {
        effect = 'Сбор «Глубокий сон и восстановление ЦНС»: снимает спазмы сосудов и мышечные зажимы.';
      } else if (selectedHerbs.some((h) => h.id === 'sage') && selectedHerbs.some((h) => h.id === 'lemon_mint')) {
        effect = 'Сбор «Легкое чистое дыхание»: открывает бронхи, дезинфицирует парную и дарит свежесть.';
      } else if (selectedHerbs.some((h) => h.id === 'wormwood') || selectedHerbs.some((h) => h.id === 'nettle')) {
        effect = 'Сбор «Интенсивный детокс и капилляротерапия»: мощный приток крови, бодрость и очищение.';
      }

      setBrewResult(`✨ Сбор запарен: ${names}. Эффект: ${effect}`);
      if (onGrantXp) onGrantXp(25);
    }, 1200);
  };

  const hasPregnancyWarning = selectedHerbs.some((h) => h.contraindicatedFor);

  return (
    <div className="rounded-2xl border border-stone-800 bg-stone-900/90 p-5 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
            <span>🌿</span>
            <span>Интерактивный Фито-Конструктор</span>
          </div>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-100 mt-1">
            Аромабар & Травяная Аптека Пармастера
          </h3>
        </div>

        <div className="text-xs text-stone-400 font-mono">
          Выбрано трав: <span className="text-amber-400 font-bold">{selectedHerbs.length} / 3</span>
        </div>
      </div>

      {/* Grid of 8 Herbs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {HERBS_DATA.map((herb) => {
          const isSelected = selectedHerbs.some((h) => h.id === herb.id);
          return (
            <button
              key={herb.id}
              onClick={() => toggleHerb(herb)}
              className={`p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                isSelected
                  ? 'border-amber-500/80 bg-amber-950/30 shadow-md ring-1 ring-amber-500/40'
                  : 'border-stone-800 bg-stone-950/70 hover:border-stone-700 hover:bg-stone-900'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-2xl">{herb.icon}</span>
                <span
                  className={`h-5 w-5 rounded-full flex items-center justify-center text-xs ${
                    isSelected ? 'bg-amber-500 text-stone-950 font-bold' : 'border border-stone-700 text-transparent'
                  }`}
                >
                  ✓
                </span>
              </div>

              <div className="mt-2 space-y-1">
                <h4 className="font-semibold text-xs text-stone-100">{herb.name}</h4>
                <p className="text-[10px] text-stone-500 italic">{herb.botanicalName}</p>
                <p className="text-[11px] text-stone-400 line-clamp-2 mt-1 leading-snug">
                  {herb.properties}
                </p>
              </div>

              {herb.contraindicatedFor && (
                <div className="mt-2 text-[10px] text-rose-400 font-mono flex items-center gap-1">
                  <span>⚠️</span>
                  <span>{herb.contraindicatedFor}</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Steaming Cauldron / Basin Visual Stage */}
      <div className="rounded-xl border border-stone-800 bg-stone-950 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <div className="text-xs text-stone-400 font-mono uppercase tracking-wider">
              Травяной чан для запаривания:
            </div>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              {selectedHerbs.length === 0 ? (
                <span className="text-stone-500 text-xs italic">Выберите от 1 до 3 трав выше</span>
              ) : (
                selectedHerbs.map((h) => (
                  <span
                    key={h.id}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-stone-800 border border-stone-700 text-xs text-amber-200"
                  >
                    <span>{h.icon}</span>
                    <span>{h.name}</span>
                  </span>
                ))
              )}
            </div>
          </div>

          <button
            onClick={handleBrew}
            disabled={selectedHerbs.length === 0 || isBrewing}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 disabled:opacity-50 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
          >
            <Sparkles className="h-4 w-4" />
            <span>{isBrewing ? 'Запаривание сбора...' : 'Запарить сбор в шайке'}</span>
          </button>
        </div>

        {/* Cautions and Feedback */}
        {hasPregnancyWarning && (
          <div className="rounded-lg bg-rose-950/40 border border-rose-500/40 p-3 text-xs text-rose-300 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <strong>Внимание мастера:</strong> В составе присутствует душица! Всегда уточняйте у гостей женского пола отсутствие беременности перед подачей пара с душицей.
            </div>
          </div>
        )}

        {brewResult && (
          <div className="rounded-lg bg-emerald-950/40 border border-emerald-500/40 p-3.5 text-xs text-emerald-200 animate-fadeIn">
            <div className="font-semibold text-emerald-300 mb-1">Готовая запарка готова к подаче:</div>
            <p>{brewResult}</p>
          </div>
        )}
      </div>

      {/* Pro-Tips Callout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-stone-300">
        <div className="rounded-lg bg-stone-950/60 border border-stone-800 p-3">
          <strong className="text-amber-400 block mb-1">1. Настои и запарки:</strong>
          Заваривайте травы горячей водой (не кипятком), настаивайте 15-20 минут и поливайте стены парной для тонкого фонового аромата.
        </div>
        <div className="rounded-lg bg-stone-950/60 border border-stone-800 p-3">
          <strong className="text-amber-400 block mb-1">2. Вплетение в веник:</strong>
          Вплетайте веточки полыни или шалфея в центр дубового веника — аромат высвобождается постепенно с каждым взмахом.
        </div>
        <div className="rounded-lg bg-stone-950/60 border border-stone-800 p-3">
          <strong className="text-amber-400 block mb-1">3. «Холодное дыхание»:</strong>
          Положите пучок свежей мяты в таз с ледяной водой и держите его у лица гостя во время интенсивного прогрева спины.
        </div>
      </div>
    </div>
  );
};
