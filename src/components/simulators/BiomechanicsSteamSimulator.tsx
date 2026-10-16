import React, { useState } from 'react';
import { playSuccessChime, playSteamSound, playWoodTap } from '../../utils/audio';
import confetti from 'canvas-confetti';
import {
  Wind,
  Footprints,
  Activity,
  Volume2,
  Sparkles,
  CheckCircle2,
  Layers,
  ArrowRight,
  ShieldCheck,
  Video,
} from 'lucide-react';

interface BiomechanicsSteamSimulatorProps {
  soundEnabled: boolean;
  onGrantXp?: (amount: number) => void;
  onSuccess?: () => void;
}

export const BiomechanicsSteamSimulator: React.FC<BiomechanicsSteamSimulatorProps> = ({
  soundEnabled,
  onGrantXp,
  onSuccess,
}) => {
  const [activeStep, setActiveStep] = useState<'tai_chi' | 'sound' | 'steam_dome'>('tai_chi');
  const [completedSteps, setCompletedSteps] = useState<{
    tai_chi: boolean;
    sound: boolean;
    steam_dome: boolean;
  }>({
    tai_chi: false,
    sound: false,
    steam_dome: false,
  });

  const handleStepComplete = (step: 'tai_chi' | 'sound' | 'steam_dome') => {
    playWoodTap(soundEnabled);
    if (!completedSteps[step]) {
      const updated = { ...completedSteps, [step]: true };
      setCompletedSteps(updated);
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
            <span>🥋</span>
            <span>Тренажёр Биомеханики и Парового Пирога</span>
          </div>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-100 mt-1">
            Постановка тела, акустика веника и управление паром
          </h3>
          <p className="text-xs text-stone-400 mt-0.5">
            Освойте фундамент долголетия мастера: волновой импульс от стоп, правильный звук лиственной подушки и филигранную работу с паром.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto bg-stone-950 px-3 py-1.5 rounded-xl border border-stone-800">
          <span className="text-[11px] font-mono text-stone-400">Прогресс отработки:</span>
          <span className="text-xs font-mono font-bold text-amber-300">
            {Object.values(completedSteps).filter(Boolean).length} / 3
          </span>
        </div>
      </div>

      {/* 3 Step Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <button
          onClick={() => {
            setActiveStep('tai_chi');
            playWoodTap(soundEnabled);
          }}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
            activeStep === 'tai_chi'
              ? 'bg-amber-500/15 border-amber-500/60 ring-1 ring-amber-500/40 text-amber-200'
              : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:text-stone-200 hover:border-stone-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold font-mono">1. Банное тай-чи</span>
            {completedSteps.tai_chi && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          </div>
          <span className="text-[11px] text-stone-400 block mt-1">Волна от стоп и прямая спина</span>
        </button>

        <button
          onClick={() => {
            setActiveStep('sound');
            playWoodTap(soundEnabled);
          }}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
            activeStep === 'sound'
              ? 'bg-amber-500/15 border-amber-500/60 ring-1 ring-amber-500/40 text-amber-200'
              : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:text-stone-200 hover:border-stone-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold font-mono">2. Слух и звук веника</span>
            {completedSteps.sound && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          </div>
          <span className="text-[11px] text-stone-400 block mt-1">Шёпот, шелест и плотный хлопок</span>
        </button>

        <button
          onClick={() => {
            setActiveStep('steam_dome');
            playWoodTap(soundEnabled);
          }}
          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
            activeStep === 'steam_dome'
              ? 'bg-amber-500/15 border-amber-500/60 ring-1 ring-amber-500/40 text-amber-200'
              : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:text-stone-200 hover:border-stone-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold font-mono">3. Управление паром</span>
            {completedSteps.steam_dome && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          </div>
          <span className="text-[11px] text-stone-400 block mt-1">Купол, пирог и адресация тепла</span>
        </button>
      </div>

      {/* Step Content */}
      <div className="p-5 sm:p-6 rounded-2xl bg-stone-950/90 border border-stone-800 space-y-4">
        
        {activeStep === 'tai_chi' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider font-mono">
              <Footprints className="w-4 h-4 text-amber-400" />
              <span>Основа движения мастера:</span>
            </div>
            <h4 className="font-serif text-lg font-bold text-stone-100">
              Биомеханика «Банного тай-чи»: работа ногами и центром тяжести
            </h4>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Новичок машет руками и гнет поясницу — поэтому через 15 минут у него раскалывается спина и забиваются плечи. Профессиональный пармастер работает как мастер восточных единоборств:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-3.5 rounded-xl bg-stone-900 border border-stone-800 space-y-1">
                <strong className="text-amber-300 block">1. Стопы и пружина коленей</strong>
                <p className="text-[11px] text-stone-400 leading-snug">
                  Ноги на ширине плеч, колени слегка согнуты. Импульс каждого взмаха рождается в перекате стоп и сгибании коленей.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-900 border border-stone-800 space-y-1">
                <strong className="text-amber-300 block">2. Неподвижная ровная поясница</strong>
                <p className="text-[11px] text-stone-400 leading-snug">
                  Корпус наклоняется не в поясничном отделе L4-L5, а за счет сгибания тазобедренных суставов. Спина всегда ровная!
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-900 border border-stone-800 space-y-1">
                <strong className="text-amber-300 block">3. Мягкие кисти без зажима</strong>
                <p className="text-[11px] text-stone-400 leading-snug">
                  Хват веника свободный. Рукоять лежит в пальцах, как живая птица. Локти опущены вниз к ребрам.
                </p>
              </div>
            </div>

            <button
              onClick={() => handleStepComplete('tai_chi')}
              className="mt-3 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{completedSteps.tai_chi ? 'Принцип освоен (✓)' : 'Отработать импульс от стоп (+25 XP)'}</span>
            </button>
          </div>
        )}

        {activeStep === 'sound' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider font-mono">
              <Volume2 className="w-4 h-4 text-amber-400" />
              <span>Акустический контакт в парной:</span>
            </div>
            <h4 className="font-serif text-lg font-bold text-stone-100">
              Слух пармастера: 3 звука идеального веника
            </h4>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              В бане гость часто закрывает глаза, и звук веника становится его главным ориентиром безопасности. По звуку мастер мгновенно понимает качество своего касания:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-3.5 rounded-xl bg-stone-900 border border-stone-800 space-y-1">
                <strong className="text-sky-300 block">🍃 «Шёпот ветра» (Омахивание)</strong>
                <p className="text-[11px] text-stone-400 leading-snug">
                  Мягкий шелест кроны в воздухе. Никаких ударов. Звук ласковый и глубокий, погружающий гостя в трансовое расслабление.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-900 border border-stone-800 space-y-1">
                <strong className="text-emerald-300 block">🌿 «Шёлковый контакт» (Массаж)</strong>
                <p className="text-[11px] text-stone-400 leading-snug">
                  Звук скольжения влажного распаренного листа по коже. Нет хлесткого звука прутьев! Если слышен стук веток — контакт поставлен неверно.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-900 border border-stone-800 space-y-1">
                <strong className="text-amber-300 block">💨 «Глухой компресс» (Припарка)</strong>
                <p className="text-[11px] text-stone-400 leading-snug">
                  Глухой, бархатный звук схлопывания паровой подушки на теле без боли и резких шлепков.
                </p>
              </div>
            </div>

            <button
              onClick={() => handleStepComplete('sound')}
              className="mt-3 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{completedSteps.sound ? 'Акустика освоена (✓)' : 'Настроить слух на мягкий звук (+25 XP)'}</span>
            </button>
          </div>
        )}

        {activeStep === 'steam_dome' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider font-mono">
              <Wind className="w-4 h-4 text-amber-400" />
              <span>Физика и пирог пара:</span>
            </div>
            <h4 className="font-serif text-lg font-bold text-stone-100">
              Умение работать с паром: забор из пирога и адресная подача
            </h4>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Пар собирается под потолком в плотный пирог (температура до 75–85°C). Задача мастера — не размахивать вениками хаотично, а филигранно черпать нужные порции:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-3.5 rounded-xl bg-stone-900 border border-stone-800 space-y-1">
                <strong className="text-amber-300 block">1. Забор пара «лодочкой»</strong>
                <p className="text-[11px] text-stone-400 leading-snug">
                  Веник поднимается в верхнюю треть парной, разворачивается лиственной чашей к потолку и плавным полукругом зачерпывает тепловой пирог.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-900 border border-stone-800 space-y-1">
                <strong className="text-emerald-300 block">2. Адресное опускание на тело</strong>
                <p className="text-[11px] text-stone-400 leading-snug">
                  Пар не сбрасывается на лицо гостя! Порция тепла аккуратно опускается на выносливые стопы, икры или в зону поясницы и лопаток.
                </p>
              </div>
            </div>

            <button
              onClick={() => handleStepComplete('steam_dome')}
              className="mt-3 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{completedSteps.steam_dome ? 'Управление паром освоено (✓)' : 'Отработать забор пара (+25 XP)'}</span>
            </button>
          </div>
        )}

      </div>

    </div>
  );
};
