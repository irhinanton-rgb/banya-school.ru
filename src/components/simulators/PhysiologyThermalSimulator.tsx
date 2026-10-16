import React, { useState } from 'react';
import { playSuccessChime, playWoodTap, playSteamSound } from '../../utils/audio';
import confetti from 'canvas-confetti';
import {
  Thermometer,
  Heart,
  Droplet,
  Zap,
  Activity,
  CheckCircle2,
  Sparkles,
  ShieldAlert,
  Wind,
} from 'lucide-react';

interface PhysiologyThermalSimulatorProps {
  soundEnabled: boolean;
  onGrantXp?: (amount: number) => void;
  onSuccess?: () => void;
}

export const PhysiologyThermalSimulator: React.FC<PhysiologyThermalSimulatorProps> = ({
  soundEnabled,
  onGrantXp,
  onSuccess,
}) => {
  const [activeStage, setActiveStage] = useState<'heat' | 'cold' | 'hormones'>('heat');
  const [exploredStages, setExploredStages] = useState<{
    heat: boolean;
    cold: boolean;
    hormones: boolean;
  }>({
    heat: false,
    cold: false,
    hormones: false,
  });

  const handleExplore = (stage: 'heat' | 'cold' | 'hormones') => {
    playWoodTap(soundEnabled);
    if (!exploredStages[stage]) {
      const updated = { ...exploredStages, [stage]: true };
      setExploredStages(updated);
      if (onGrantXp) onGrantXp(25);

      if (Object.values(updated).filter(Boolean).length === 3) {
        playSuccessChime(soundEnabled);
        if (onSuccess) onSuccess();
        try {
          confetti({
            particleCount: 50,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {
          // ignore
        }
      }
    }
  };

  return (
    <div className="rounded-2xl border border-stone-800 bg-stone-900/90 p-5 sm:p-7 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
            <span>🧬</span>
            <span>Интерактивная Анатомия Банной Физиологии</span>
          </div>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-100 mt-1">
            Физиология процессов: действие тепла, контраста и гормонов
          </h3>
          <p className="text-xs text-stone-400 mt-0.5">
            Поймите клеточную биохимию: вазодилатацию, сосудистую помпу, шоковые белки HSP70 и баланс эндорфинов.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto bg-stone-950 px-3 py-1.5 rounded-xl border border-stone-800">
          <span className="text-[11px] font-mono text-stone-400">Изучено фаз:</span>
          <span className="text-xs font-mono font-bold text-emerald-400">
            {Object.values(exploredStages).filter(Boolean).length} / 3
          </span>
        </div>
      </div>

      {/* 3 Interactive Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <button
          onClick={() => {
            setActiveStage('heat');
            playWoodTap(soundEnabled);
          }}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
            activeStage === 'heat'
              ? 'bg-amber-500/15 border-amber-500/60 ring-1 ring-amber-500/40 text-amber-200'
              : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:text-stone-200 hover:border-stone-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold font-mono">1. Тепловая фаза (+60°C)</span>
            {exploredStages.heat && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          </div>
          <span className="text-[11px] text-stone-400 block mt-1">Вазодилатация и разгрузка органов</span>
        </button>

        <button
          onClick={() => {
            setActiveStage('cold');
            playWoodTap(soundEnabled);
          }}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
            activeStage === 'cold'
              ? 'bg-amber-500/15 border-amber-500/60 ring-1 ring-amber-500/40 text-amber-200'
              : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:text-stone-200 hover:border-stone-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold font-mono">2. Фаза холода и контраста</span>
            {exploredStages.cold && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          </div>
          <span className="text-[11px] text-stone-400 block mt-1">Сосудистая гимнастика без шока</span>
        </button>

        <button
          onClick={() => {
            setActiveStage('hormones');
            playWoodTap(soundEnabled);
          }}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
            activeStage === 'hormones'
              ? 'bg-amber-500/15 border-amber-500/60 ring-1 ring-amber-500/40 text-amber-200'
              : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:text-stone-200 hover:border-stone-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold font-mono">3. Гормональный коктейль</span>
            {exploredStages.hormones && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          </div>
          <span className="text-[11px] text-stone-400 block mt-1">Эндорфины, окситоцин и фасции</span>
        </button>
      </div>

      {/* Stage Detail Box */}
      <div className="p-5 sm:p-6 rounded-2xl bg-stone-950/90 border border-stone-800 space-y-4">
        {activeStage === 'heat' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider font-mono">
              <Thermometer className="w-4 h-4 text-amber-400" />
              <span>Анатомический отклик на тепло:</span>
            </div>
            <h4 className="font-serif text-lg font-bold text-stone-100">
              Вазодилатация: расширение капиллярного русла и разгрузка сердца
            </h4>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              При мягком прогреве капилляры кожи расширяются в 3–5 раз. До 15–20% всей циркулирующей крови устремляется от внутренних органов к коже. Внутренние органы разгружаются, а кровяное давление мягко снижается.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-3.5 rounded-xl bg-stone-900 border border-stone-800 space-y-1">
                <strong className="text-amber-300 block">Белки теплового шока (HSP70)</strong>
                <p className="text-[11px] text-stone-400 leading-snug">
                  При нагреве клетки синтезируют белки HSP70, восстанавливающие поврежденные молекулы белков и обновляющие ткани.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-900 border border-stone-800 space-y-1">
                <strong className="text-rose-300 block">Разгрузка почек</strong>
                <p className="text-[11px] text-stone-400 leading-snug">
                  Потовые железы берут на себя до 30% выделительной функции, разгружая почечные клубочки от мочевины и солей.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-900 border border-stone-800 space-y-1">
                <strong className="text-emerald-300 block">Мышечный тонус</strong>
                <p className="text-[11px] text-stone-400 leading-snug">
                  Фасции становятся эластичными, как разогретый воск, снимая застарелые триггерные спазмы воротниковой зоны.
                </p>
              </div>
            </div>

            <button
              onClick={() => handleExplore('heat')}
              className="mt-3 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{exploredStages.heat ? 'Изучено (✓)' : 'Освоить фазу вазодилатации (+25 XP)'}</span>
            </button>
          </div>
        )}

        {activeStage === 'cold' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-wider font-mono">
              <Droplet className="w-4 h-4 text-sky-400" />
              <span>Физиология охлаждения:</span>
            </div>
            <h4 className="font-serif text-lg font-bold text-stone-100">
              «Сосудистая помпа»: почему контраст должен быть мягким
            </h4>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Контраст запускает резкое сжатие капилляров (вазоконстрикцию), выталкивая кровь обратно к магистральным сосудам. Однако если охладить гостя слишком резко или бросить в лед без подготовки, произойдет спазм и запирание жара внутри органов.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-3.5 rounded-xl bg-stone-900 border border-sky-500/30 space-y-1">
                <strong className="text-sky-300 block">Правильный контраст гостя</strong>
                <p className="text-[11px] text-stone-400 leading-snug">
                  Прохладный душ или обливание теплой водой (+28...+32°C), затем на воздух. Только после глубокого второго прогрева — купель на 5–15 секунд с головой!
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-900 border border-rose-500/30 space-y-1">
                <strong className="text-rose-300 block">Опасность гиперконтраста</strong>
                <p className="text-[11px] text-stone-400 leading-snug">
                  Лед при первом заходе вызывает спазм сонных артерий и резкий скачок давления. Контраст должен расти плавно от захода к заходу.
                </p>
              </div>
            </div>

            <button
              onClick={() => handleExplore('cold')}
              className="mt-3 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{exploredStages.cold ? 'Изучено (✓)' : 'Освоить фазу контраста (+25 XP)'}</span>
            </button>
          </div>
        )}

        {activeStage === 'hormones' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>Нейрохимия бани:</span>
            </div>
            <h4 className="font-serif text-lg font-bold text-stone-100">
              Эндорфиновый каскад: как рождается «банное перерождение»
            </h4>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Ощущение легкости и эйфории после качественного парения («как заново родился») — это точный биохимический процесс выброса эндогенных опиоидов:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-3.5 rounded-xl bg-stone-900 border border-stone-800 space-y-1">
                <strong className="text-emerald-300 block">Бета-эндорфины</strong>
                <p className="text-[11px] text-stone-400 leading-snug">
                  Природные анальгетики мозга: блокируют мышечные боли, снимают усталость и дарят состояние покоя.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-900 border border-stone-800 space-y-1">
                <strong className="text-amber-300 block">Окситоцин и забота</strong>
                <p className="text-[11px] text-stone-400 leading-snug">
                  Бережные прикосновения веников и теплое укутывание активируют окситоцин — гормон доверия и защищенности.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-900 border border-stone-800 space-y-1">
                <strong className="text-sky-300 block">Падение кортизола</strong>
                <p className="text-[11px] text-stone-400 leading-snug">
                  Уровень гормона хронического стресса падает на 40%, восстанавливая здоровый глубокий сон на несколько дней вперед.
                </p>
              </div>
            </div>

            <button
              onClick={() => handleExplore('hormones')}
              className="mt-3 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{exploredStages.hormones ? 'Изучено (✓)' : 'Освоить нейрохимию бани (+25 XP)'}</span>
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
