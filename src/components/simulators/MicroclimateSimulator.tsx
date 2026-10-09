import React, { useState } from 'react';
import { Flame, Droplets, AlertTriangle, Wind, Info, Sparkles, BookOpen } from 'lucide-react';
import { playSteamSound, playExplosiveSteamSound } from '../../utils/audio';
import { StoveEducationModal } from './StoveEducationModal';

interface MicroclimateSimulatorProps {
  soundEnabled: boolean;
  onSuccessTask?: () => void;
}

export const MicroclimateSimulator: React.FC<MicroclimateSimulatorProps> = ({
  soundEnabled,
  onSuccessTask,
}) => {
  const [temperature, setTemperature] = useState<number>(65);
  const [humidity, setHumidity] = useState<number>(60);
  const [isSteaming, setIsSteaming] = useState<boolean>(false);
  const [steamLadles, setSteamLadles] = useState<number>(0);
  const [ventilationOpen, setVentilationOpen] = useState<boolean>(false);
  const [isStoveModalOpen, setIsStoveModalOpen] = useState<boolean>(false);

  // Dew point approximation (Magnus formula approximation)
  // Td = T - ((100 - RH)/5)
  const dewPoint = Math.round(temperature - (100 - humidity) / 5);

  // Determine climate regime
  const getRegime = () => {
    if (temperature >= 55 && temperature <= 80 && humidity >= 50 && humidity <= 75) {
      return {
        name: 'Русская Паровая Баня (Идеальный микроклимат)',
        color: 'text-emerald-400',
        bg: 'bg-emerald-950/40 border-emerald-500/40',
        icon: '🌿',
        desc: 'Мягкий обволакивающий пар, приятный легкий вдох, глубокий и безопасный прогрев тканей. Организм плавно включает потоотделение без теплового шока.',
        status: 'optimal',
      };
    }
    if (temperature > 85 && humidity > 55) {
      return {
        name: 'ОПАСНАЯ ЗОНА: Риск термического ожога и точки росы!',
        color: 'text-rose-400',
        bg: 'bg-rose-950/50 border-rose-500/50',
        icon: '⚠️',
        desc: 'При такой температуре влажный пар мгновенно конденсируется на коже с выделением скрытой теплоты парообразования. Опасность ожога дыхательных путей и теплового удара!',
        status: 'danger',
      };
    }
    if (temperature >= 80 && humidity <= 20) {
      return {
        name: 'Сухая Финская Сауна',
        color: 'text-amber-400',
        bg: 'bg-amber-950/40 border-amber-500/40',
        icon: '🔥',
        desc: 'Высокая температура при минимальной влажности. Пот испаряется мгновенно, охлаждая кожу, но слизистые дыхательных путей пересыхают.',
        status: 'sauna',
      };
    }
    if (temperature <= 50 && humidity >= 80) {
      return {
        name: 'Турецкий Хаммам / Паровая кабина',
        color: 'text-cyan-400',
        bg: 'bg-cyan-950/40 border-cyan-500/40',
        icon: '💧',
        desc: 'Мягкое невысокое тепло с максимальным насыщением воздуха паром. Идеально для пилингов и неторопливого прогрева.',
        status: 'hammam',
      };
    }
    return {
      name: 'Смешанный / Переходный режим',
      color: 'text-stone-300',
      bg: 'bg-stone-900 border-stone-800',
      icon: '🌫️',
      desc: 'Подрегулируйте поддачу воды или вентиляцию, чтобы выйти на золотой стандарт Русской бани: 60-70°C и 60-70% влажности.',
      status: 'neutral',
    };
  };

  const regime = getRegime();

  const handleApplySteamFromStove = (
    type: 'closed' | 'open',
    humidityBoost = 8,
    tempBoost = 2
  ) => {
    setIsSteaming(true);
    setSteamLadles((prev) => prev + 1);
    setHumidity((prev) => Math.min(95, prev + humidityBoost));
    setTemperature((prev) => Math.min(115, prev + tempBoost));

    setTimeout(() => {
      setIsSteaming(false);
    }, 1400);

    if (onSuccessTask) onSuccessTask();
  };

  const handlePourWater = () => {
    // Open the educational stove modal as requested:
    // "в парной кнопок нет) поэтому давай разберемся с сердцем бани а именно с печкой"
    setIsStoveModalOpen(true);
  };

  const handleVentilate = () => {
    setVentilationOpen(true);
    setHumidity((prev) => Math.max(25, prev - 15));
    setTemperature((prev) => Math.max(50, prev - 8));
    setTimeout(() => {
      setVentilationOpen(false);
    }, 1500);
  };

  const handleSetPreset = (temp: number, hum: number) => {
    setTemperature(temp);
    setHumidity(hum);
  };

  return (
    <div className="rounded-2xl border border-stone-800 bg-stone-900/90 p-5 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-4">
        <div>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-100 mt-1">
            Парная: Температура, Влажность и Точка Росы
          </h3>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleSetPreset(65, 65)}
            className="px-2.5 py-1 text-xs rounded-md bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
          >
            Русская баня (65/65)
          </button>
          <button
            onClick={() => handleSetPreset(95, 12)}
            className="px-2.5 py-1 text-xs rounded-md bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
          >
            Финская сауна (95/12)
          </button>
          <button
            onClick={() => handleSetPreset(45, 95)}
            className="px-2.5 py-1 text-xs rounded-md bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
          >
            Хаммам (45/95)
          </button>
        </div>
      </div>

      {/* Visual Bath Canvas */}
      <div className="relative overflow-hidden rounded-xl border border-stone-800 bg-gradient-to-b from-stone-950 via-stone-900 to-amber-950/20 p-6 min-h-[220px] flex flex-col justify-between">
        {/* Steam effect overlay */}
        <div
          className={`pointer-events-none absolute inset-0 transition-opacity duration-1000 ${
            isSteaming ? 'opacity-85' : 'opacity-25'
          }`}
          style={{
            backgroundImage:
              'radial-gradient(ellipse at 50% 100%, rgba(245, 158, 11, 0.15), rgba(255, 255, 255, 0.12) 40%, transparent 75%)',
          }}
        />

        {/* Floating Steam Particles */}
        <div className="absolute inset-0 pointer-events-none flex items-end justify-around overflow-hidden">
          <div className={`h-40 w-32 rounded-full bg-white/5 blur-2xl animate-steam transition-all duration-700 ${isSteaming ? 'scale-150 opacity-40' : 'opacity-15'}`} />
          <div className={`h-48 w-40 rounded-full bg-amber-500/10 blur-2xl animate-steam transition-all duration-700 delay-300 ${isSteaming ? 'scale-175 opacity-50' : 'opacity-20'}`} />
          <div className={`h-36 w-36 rounded-full bg-white/5 blur-2xl animate-steam transition-all duration-700 delay-500 ${isSteaming ? 'scale-150 opacity-40' : 'opacity-15'}`} />
        </div>

        {/* Current State Header */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{regime.icon}</span>
            <div>
              <div className="text-xs text-stone-400 font-mono">ТЕКУЩИЙ РЕЖИМ ПАРНОЙ</div>
              <div className={`font-serif text-lg font-bold ${regime.color}`}>{regime.name}</div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="rounded-lg bg-stone-950/70 border border-stone-800 px-3 py-1.5 text-stone-300">
              Точка росы: <span className="text-amber-400 font-bold">{dewPoint}°C</span>
            </div>
            <div className="rounded-lg bg-stone-950/70 border border-stone-800 px-3 py-1.5 text-stone-300">
              Подано ковшей: <span className="text-amber-400 font-bold">{steamLadles}</span>
            </div>
          </div>
        </div>

        {/* Dynamic description of climate */}
        <div className="relative z-10 my-4 rounded-lg bg-stone-950/80 p-3.5 border border-stone-800/80 text-sm text-stone-300">
          <p>{regime.desc}</p>
        </div>

        {/* Action Controls Inside Canvas */}
        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <button
            onClick={handlePourWater}
            disabled={isSteaming}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-95 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer disabled:opacity-50"
            title="Подать ковшик на камни"
          >
            <Droplets className="h-4 w-4" />
            <span>{isSteaming ? 'Шипение пара...' : 'Подать ковшик на камни'}</span>
          </button>

          <button
            onClick={() => setIsStoveModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-stone-900/90 hover:bg-stone-800 text-amber-300 text-xs font-semibold transition-all border border-amber-600/40 cursor-pointer active:scale-95"
            title="Интерактивный макет устройства печи, физика пара и ИК-волны"
          >
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span>Макет печи в разрезе 🪵</span>
          </button>

          <button
            onClick={handleVentilate}
            disabled={ventilationOpen}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-stone-800/90 hover:bg-stone-700 active:scale-95 text-stone-200 text-xs font-medium transition-all border border-stone-700 cursor-pointer disabled:opacity-50 ml-auto"
          >
            <Wind className="h-4 w-4 text-cyan-400" />
            <span>{ventilationOpen ? 'Проветривание...' : 'Залповое проветривание'}</span>
          </button>
        </div>
      </div>

      {/* Sliders Control Deck */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* Temperature Slider */}
        <div className="space-y-2 rounded-xl bg-stone-950/60 border border-stone-800 p-4">
          <div className="flex items-center justify-between">
            <label htmlFor="temp-slider" className="flex items-center gap-2 text-sm font-medium text-stone-200">
              <Flame className="h-4 w-4 text-rose-500" />
              <span>Температура в парной</span>
            </label>
            <span className="font-mono text-lg font-bold text-rose-400 tabular-nums">
              {temperature} °C
            </span>
          </div>
          <input
            id="temp-slider"
            type="range"
            min={40}
            max={120}
            step={1}
            value={temperature}
            onChange={(e) => setTemperature(Number(e.target.value))}
            className="w-full accent-rose-500 cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-stone-500 font-mono">
            <span>40°C (Хаммам)</span>
            <span>60-70°C (Русская баня)</span>
            <span>100-120°C (Сауна)</span>
          </div>
        </div>

        {/* Humidity Slider */}
        <div className="space-y-2 rounded-xl bg-stone-950/60 border border-stone-800 p-4">
          <div className="flex items-center justify-between">
            <label htmlFor="humidity-slider" className="flex items-center gap-2 text-sm font-medium text-stone-200">
              <Droplets className="h-4 w-4 text-cyan-400" />
              <span>Относительная влажность</span>
            </label>
            <span className="font-mono text-lg font-bold text-cyan-400 tabular-nums">
              {humidity} %
            </span>
          </div>
          <input
            id="humidity-slider"
            type="range"
            min={5}
            max={100}
            step={1}
            value={humidity}
            onChange={(e) => setHumidity(Number(e.target.value))}
            className="w-full accent-cyan-500 cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-stone-500 font-mono">
            <span>5-15% (Сухая сауна)</span>
            <span>60-70% (Паровой пирог)</span>
            <span>100% (Хаммам)</span>
          </div>
        </div>
      </div>

      {/* Critical Pedagogical Callout */}
      <div className="rounded-xl border border-amber-500/20 bg-amber-950/20 p-4 text-xs text-amber-200/90 leading-relaxed flex gap-3">
        <Info className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-amber-300 font-semibold block mb-1">
            Физиологический закон точки росы для пармастера:
          </strong>
          Если тело гостя холодное или покрыто каплями воды от душа перед входом в парную, горячий пар не прогревает его мягко, а мгновенно конденсируется на этих каплях, вызывая жгучую боль и ожог. Именно поэтому перед первым паром тело вытирают насухо!
        </div>
      </div>

      {/* Interactive Stove Educational Modal & Blueprint */}
      <StoveEducationModal
        isOpen={isStoveModalOpen}
        onClose={() => setIsStoveModalOpen(false)}
        onApplySteam={handleApplySteamFromStove}
        soundEnabled={soundEnabled}
      />
    </div>
  );
};
