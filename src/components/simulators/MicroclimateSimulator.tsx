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
  const [showVentilationTooltip, setShowVentilationTooltip] = useState<boolean>(false);

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
        <div className="relative z-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
          {/* Stretched and enlarged button: Поддать пар */}
          <button
            onClick={handlePourWater}
            className="flex-1 flex items-center justify-center gap-2.5 px-6 py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-500 active:scale-[0.98] text-stone-950 font-extrabold text-sm sm:text-base uppercase tracking-wider shadow-xl shadow-amber-950/60 transition-all cursor-pointer border-2 border-amber-300/50 select-none group"
            title="Поддать ковш горячей воды на каменку для увеличения влажности (+8%)"
          >
            <Droplets className="h-5 w-5 text-stone-950 fill-stone-950 shrink-0 group-hover:scale-110 transition-transform" />
            <span>Поддать пар (+8% влажности)</span>
          </button>

          {/* Ventilation button with hover information card */}
          <div
            className="relative"
            onMouseEnter={() => setShowVentilationTooltip(true)}
            onMouseLeave={() => setShowVentilationTooltip(false)}
          >
            <button
              onClick={handleVentilate}
              disabled={ventilationOpen}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3.5 sm:py-4 rounded-2xl bg-stone-900/95 hover:bg-stone-800 active:scale-95 text-stone-100 text-xs sm:text-sm font-semibold transition-all border border-cyan-500/40 hover:border-cyan-400 cursor-pointer disabled:opacity-50 select-none shadow-lg"
            >
              <Wind className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-400 shrink-0 animate-pulse" />
              <span>{ventilationOpen ? 'Проветривание...' : 'Залповое проветривание'}</span>
              <Info className="h-3.5 w-3.5 text-cyan-300/80 ml-0.5 shrink-0" />
            </button>

            {/* Hover Floating Information Popup */}
            {showVentilationTooltip && (
              <div className="absolute right-0 bottom-full mb-3 w-[300px] sm:w-[380px] p-4 rounded-2xl bg-stone-950/95 backdrop-blur-md border border-cyan-500/50 shadow-2xl text-stone-100 text-xs space-y-3 z-50 animate-fade-in pointer-events-none sm:pointer-events-auto">
                <div className="flex items-center gap-2 pb-2 border-b border-stone-800">
                  <Wind className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span className="font-serif font-bold text-sm text-cyan-300">
                    Важность проветривания парной
                  </span>
                </div>

                <div className="space-y-2.5 leading-relaxed text-stone-300">
                  <div className="p-2.5 rounded-xl bg-stone-900/80 border border-stone-800/80 space-y-1">
                    <span className="font-bold text-amber-300 flex items-center gap-1.5 text-[11px] uppercase tracking-wide">
                      🚪 1. До процедур (Перед парением):
                    </span>
                    <p className="text-[11px] text-stone-300 leading-normal">
                      Насытить парную свежим кислородом (O₂) и вытеснить застоявшийся угарный воздух. Парение без свежего воздуха провоцирует спазм сосудов и головную боль.
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-stone-900/80 border border-stone-800/80 space-y-1">
                    <span className="font-bold text-cyan-300 flex items-center gap-1.5 text-[11px] uppercase tracking-wide">
                      🌿 2. Во время процедур (В процессе):
                    </span>
                    <p className="text-[11px] text-stone-300 leading-normal">
                      Микроприток («второе дыхание» или форточка под полком). Гость вдыхает уличный свежий воздух, пока тело прогревается вениками — голова ясная, пульс стабильный.
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-stone-900/80 border border-stone-800/80 space-y-1">
                    <span className="font-bold text-emerald-300 flex items-center gap-1.5 text-[11px] uppercase tracking-wide">
                      💨 3. После процедур (Залповый сброс):
                    </span>
                    <p className="text-[11px] text-stone-300 leading-normal">
                      Открыть дверь и окно настежь на 2–3 минуты. Сбросить отработанный пар, CO₂ и запах пота. Затем закрыть — печь досушит дерево до звона, защищая от плесени.
                    </p>
                  </div>
                </div>

                <div className="pt-1 text-[10px] text-amber-400/90 font-mono italic border-t border-stone-800">
                  💡 Главный враг гостя в парной — не температура, а гипоксия (нехватка кислорода)!
                </div>
              </div>
            )}
          </div>
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
