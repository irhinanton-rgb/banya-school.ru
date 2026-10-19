import React, { useState } from 'react';
import { Flame, Droplets, Wind, CheckCircle2, Sparkles } from 'lucide-react';
import { StoveEducationModal } from './StoveEducationModal';
import { VentilationEducationModal } from './VentilationEducationModal';
import { BadgeId } from '../../types/banya';
import { playSuccessChime, playWoodTap } from '../../utils/audio';

interface MicroclimateSimulatorProps {
  soundEnabled: boolean;
  onSuccessTask?: () => void;
  onGrantReward?: (xp: number, badgeId?: BadgeId) => void;
  unlockedBadges?: BadgeId[];
}

export const MicroclimateSimulator: React.FC<MicroclimateSimulatorProps> = ({
  soundEnabled,
  onSuccessTask,
  onGrantReward,
  unlockedBadges = [],
}) => {
  const [temperature, setTemperature] = useState<number>(65);
  const [humidity, setHumidity] = useState<number>(60);
  const [isSteaming, setIsSteaming] = useState<boolean>(false);
  const [steamLadles, setSteamLadles] = useState<number>(0);
  const [ventilationOpen, setVentilationOpen] = useState<boolean>(false);
  const [isStoveModalOpen, setIsStoveModalOpen] = useState<boolean>(false);
  const [isVentilationModalOpen, setIsVentilationModalOpen] = useState<boolean>(false);

  // Sequential reading progress for the 3 steps of Level 1
  const [readSteps, setReadSteps] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('banya_level1_read_steps');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleToggleStep = (stepNum: number) => {
    if (!readSteps.includes(stepNum)) {
      const next = [...readSteps, stepNum];
      setReadSteps(next);
      try {
        localStorage.setItem('banya_level1_read_steps', JSON.stringify(next));
      } catch {
        // ignore
      }
      playSuccessChime(soundEnabled);
      if (onSuccessTask) onSuccessTask();
    } else {
      playWoodTap(soundEnabled);
    }
  };

  // Dew point approximation
  const dewPoint = Math.round(temperature - (100 - humidity) / 5);

  const getRegime = () => {
    if (temperature >= 55 && temperature <= 80 && humidity >= 50 && humidity <= 75) {
      return {
        name: 'Русская Паровая Баня (Золотой стандарт)',
        color: 'text-emerald-400',
        icon: '🌿',
        desc: 'Мягкий обволакивающий пар, лёгкий вдох и глубокий прогрев без теплового шока. Сумма температуры и влажности около 120 (60°C + 60%).',
      };
    }
    if (temperature > 85 && humidity > 55) {
      return {
        name: 'ОПАСНЫЙ РЕЖИМ: Обжигающий пар и точка росы!',
        color: 'text-rose-400',
        icon: '⚠️',
        desc: 'Слишком высокая температура при высокой влажности: пар мгновенно конденсируется на коже в кипяток. Нужно срочно проветрить парную!',
      };
    }
    if (temperature >= 80 && humidity <= 20) {
      return {
        name: 'Сухая Финская Сауна',
        color: 'text-amber-400',
        icon: '🔥',
        desc: 'Высокая температура при сухом воздухе. Пот испаряется мгновенно, но слизистые дыхательных путей и лист веника быстро пересыхают.',
      };
    }
    if (temperature <= 50 && humidity >= 80) {
      return {
        name: 'Турецкий Хаммам / Влажная паровая',
        color: 'text-cyan-400',
        icon: '💧',
        desc: 'Невысокая температура при 80–100% влажности. Подходит для мягкого распаривания кожи и мыльных процедур, но не для венечного парения.',
      };
    }
    return {
      name: 'Переходный режим парной',
      color: 'text-stone-300',
      icon: '🌫️',
      desc: 'Настройте ползунки или выберите режим «Русская баня (60/60)», чтобы выйти на комфортный баланс тепла и пара.',
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
    playWoodTap(soundEnabled);
  };

  return (
    <div className="space-y-6">
      {/* =================================================================== */}
      {/* ЧАСТЬ 1. ПОСЛЕДОВАТЕЛЬНАЯ ТЕОРИЯ БЕЗ ЛИШНИХ РАМОК И ПЕРЕГРУЗА (3 ШАГА) */}
      {/* =================================================================== */}
      <div className="rounded-3xl border border-stone-800 bg-stone-900/95 p-6 sm:p-8 space-y-7 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">
              📖 Шаг за шагом · Основы Первого Уровня
            </span>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-100 mt-1">
              Как устроен правильный вход в баню: 3 главных закона
            </h3>
            <p className="text-xs sm:text-sm text-stone-400 mt-0.5">
              Прочитайте три коротких этапа по порядку — здесь собрана вся суть первого захода без лишней воды.
            </p>
          </div>
          <div className="shrink-0 self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-stone-950 border border-stone-800 text-xs font-mono text-stone-300">
            Прочитано: <span className="text-amber-400 font-bold">{readSteps.length} / 3</span>
          </div>
        </div>

        {/* ШАГ 1 */}
        <div className="space-y-3 pb-6 border-b border-stone-800/80">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-serif text-lg sm:text-xl font-bold text-amber-300">
              1. Церемония первого пара и правило сухой кожи
            </h4>
            {readSteps.includes(1) && (
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1 shrink-0">
                <CheckCircle2 className="w-4 h-4" /> Усвоено
              </span>
            )}
          </div>

          <div className="space-y-2.5 text-sm sm:text-base text-stone-200 leading-relaxed">
            <p>
              <strong>Мягкий бесконтактный старт (55–60°C):</strong> Баня начинается не с хлестания вениками и не с экстремального жара. Первый заход длится 10–12 минут при мягкой температуре до 60°C без касания вениками. Если сразу дать 90°C на холодное тело — сосуды сожмутся в защитный спазм («броню»), пульс и гормон стресса кортизол взлетят вверх. А мягкое тепло снижает кортизол на 40% и плавно раскрывает капилляры.
            </p>
            <p>
              <strong>Гигиенический душ ДО парной — и вход СТРОГО сухим:</strong> Перед первым заходом гость принимает тёплый душ (смыть пыль и косметику), но <u>обязательно насухо вытирается полотенцем</u>. Если войти в парную мокрым, капли прохладной воды на коже притянут горячий пар (сработает <strong>эффект «точки росы»</strong>) — пар мгновенно сконденсируется в обжигающий кипяток, обжигая кожу и блокируя потоотделение.
            </p>
            <p>
              <strong>Тёплый душ ПОСЛЕ первого пара (табу на ледяную купель):</strong> После первого прогрева поры только приоткрылись и начали выводить токсины. Прыгать в ледяную купель после первого захода <u>строго запрещено</u> — резкий холод вызовет спазм пор с эффектом вакуумного всасывания шлаков обратно в кожу. Поэтому после первого пара — только тёплый душ, халат и 15 минут спокойного отдыха с травяным чаем.
            </p>
          </div>

          <div className="pt-1">
            <button
              type="button"
              onClick={() => handleToggleStep(1)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                readSteps.includes(1)
                  ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-500/40'
                  : 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-md'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{readSteps.includes(1) ? 'Шаг 1 изучен ✓' : 'Понятно, отметить Шаг 1'}</span>
            </button>
          </div>
        </div>

        {/* ШАГ 2 */}
        <div className="space-y-3 pb-6 border-b border-stone-800/80">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-serif text-lg sm:text-xl font-bold text-cyan-300">
              2. Дыхание парной: почему болит голова и как проветривать
            </h4>
            {readSteps.includes(2) && (
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1 shrink-0">
                <CheckCircle2 className="w-4 h-4" /> Усвоено
              </span>
            )}
          </div>

          <div className="space-y-2.5 text-sm sm:text-base text-stone-200 leading-relaxed">
            <p>
              <strong>Главный враг в парной — не температура, а гипоксия:</strong> Когда у гостя на 8-й минуте появляется тяжесть в затылке, вялость или пульсация в висках — причина почти всегда в нехватке кислорода (O₂) и скоплении углекислого газа (CO₂).
            </p>
            <p>
              <strong>Три момента залпового проветривания:</strong> Парная должна дышать. Окно и дверь открывают настежь на 1–2 минуты: <strong>1) ДО захода гостя</strong> (впустить свежий воздух 21% O₂), <strong>2) ВО ВРЕМЯ долгого парения</strong> (если нет постоянной приточно-вытяжной вентиляции — пустить свежую струю воздуха в середине сеанса) и <strong>3) ПОСЛЕ выхода гостей</strong> (сбросить тяжёлый отработанный пар и высушить дерево).
            </p>
          </div>

          <div className="pt-1">
            <button
              type="button"
              onClick={() => handleToggleStep(2)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                readSteps.includes(2)
                  ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-500/40'
                  : 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-md'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{readSteps.includes(2) ? 'Шаг 2 изучен ✓' : 'Понятно, отметить Шаг 2'}</span>
            </button>
          </div>
        </div>

        {/* ШАГ 3 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-serif text-lg sm:text-xl font-bold text-emerald-300">
              3. Сердце бани: закрытая каменка и секрет «лёгкого пара»
            </h4>
            {readSteps.includes(3) && (
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1 shrink-0">
                <CheckCircle2 className="w-4 h-4" /> Усвоено
              </span>
            )}
          </div>

          <div className="space-y-2.5 text-sm sm:text-base text-stone-200 leading-relaxed">
            <p>
              <strong>Как получить «лёгкий» мелкодисперсный пар:</strong> Если плеснуть полный ковш холодной воды на открытые камни (200°C), получится тяжёлый, сырой и обжигающий туман. Настоящий «лёгкий пар» рождается внутри <strong>закрытой каменки</strong>, где камни раскалены до <strong>400–550°C</strong>. Воду подают <u>горячей и малыми порциями по 100–200 мл</u> с небольшими паузами — тогда вода взрывается в мельчайший невидимый пар, которым легко дышать.
            </p>
            <p>
              <strong>Каменный саркофаг и покой конвекции:</strong> Облицовка печи натуральным камнем (талькомагнезит, нефрит, кирпич) преобразует жёсткое излучение раскалённого металла в мягкое глубокое тепло. А перед парением вениками конвекционные заслонки печи обязательно закрывают, чтобы восходящий поток не сдувал и не размывал «паровой пирог» под потолком.
            </p>
          </div>

          <div className="pt-1">
            <button
              type="button"
              onClick={() => handleToggleStep(3)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                readSteps.includes(3)
                  ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-500/40'
                  : 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-md'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{readSteps.includes(3) ? 'Шаг 3 изучен ✓' : 'Понятно, отметить Шаг 3'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* ЧАСТЬ 2. НАГЛЯДНЫЙ ПУЛЬТ ПАРНОЙ И ПЕЧИ (БЕЗ ЛИШНИХ ТЕКСТОВЫХ РАМОК) */}
      {/* =================================================================== */}
      <div className="rounded-2xl border border-stone-800 bg-stone-900/90 p-5 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Интерактивная практика</span>
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-100 mt-0.5">
              Пульт Микроклимата и Устройство Печи
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">
              Проверьте, как меняется режим парной, или нажмите «Поддать пар», чтобы заглянуть внутрь банной печи.
            </p>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleSetPreset(65, 60)}
              className="px-3 py-1.5 text-xs rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-200 font-semibold transition-colors cursor-pointer"
            >
              🌿 Русская баня (65°C / 60%)
            </button>
            <button
              type="button"
              onClick={() => handleSetPreset(95, 12)}
              className="px-3 py-1.5 text-xs rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors cursor-pointer"
            >
              🔥 Финская сауна (95°C / 12%)
            </button>
            <button
              type="button"
              onClick={() => handleSetPreset(45, 95)}
              className="px-3 py-1.5 text-xs rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors cursor-pointer"
            >
              💧 Хаммам (45°C / 95%)
            </button>
          </div>
        </div>

        {/* Visual Bath Canvas */}
        <div className="relative overflow-hidden rounded-xl border border-stone-800 bg-gradient-to-b from-stone-950 via-stone-900 to-amber-950/20 p-5 sm:p-6 flex flex-col justify-between gap-4">
          <div
            className={`pointer-events-none absolute inset-0 transition-opacity duration-1000 ${
              isSteaming ? 'opacity-85' : 'opacity-25'
            }`}
            style={{
              backgroundImage:
                'radial-gradient(ellipse at 50% 100%, rgba(245, 158, 11, 0.15), rgba(255, 255, 255, 0.12) 40%, transparent 75%)',
            }}
          />

          {/* Current State Header */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{regime.icon}</span>
              <div>
                <div className="text-[11px] text-stone-400 font-mono uppercase">Текущий режим парной</div>
                <div className={`font-serif text-lg font-bold ${regime.color}`}>{regime.name}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono">
              <div className="rounded-lg bg-stone-950/80 border border-stone-800 px-3 py-1.5 text-stone-300">
                Точка росы: <span className="text-amber-400 font-bold">{dewPoint}°C</span>
              </div>
              <div className="rounded-lg bg-stone-950/80 border border-stone-800 px-3 py-1.5 text-stone-300">
                Подано ковшей: <span className="text-amber-400 font-bold">{steamLadles}</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 rounded-lg bg-stone-950/80 p-3.5 border border-stone-800/80 text-xs sm:text-sm text-stone-300 leading-relaxed">
            {regime.desc}
          </div>

          {/* 2 Main Interactive Buttons */}
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setIsStoveModalOpen(true)}
              className="w-full flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-500 active:scale-[0.98] text-stone-950 font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-xl transition-all cursor-pointer border border-amber-300/50"
            >
              <Droplets className="h-5 w-5 text-stone-950 fill-stone-950 shrink-0" />
              <span>Поддать пар (Открыть макет печи)</span>
            </button>

            <button
              type="button"
              onClick={() => setIsVentilationModalOpen(true)}
              className="w-full flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-600 via-cyan-700 to-cyan-800 hover:from-cyan-500 hover:to-cyan-600 active:scale-[0.98] text-cyan-50 font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-xl transition-all cursor-pointer border border-cyan-400/50"
            >
              <Wind className="h-5 w-5 text-cyan-200 shrink-0" />
              <span>Залповое проветривание</span>
            </button>
          </div>
        </div>

        {/* Sliders Control Deck */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 rounded-xl bg-stone-950/60 border border-stone-800 p-4">
            <div className="flex items-center justify-between">
              <label htmlFor="temp-slider" className="flex items-center gap-2 text-xs sm:text-sm font-medium text-stone-200">
                <Flame className="h-4 w-4 text-rose-500" />
                <span>Температура в парной</span>
              </label>
              <span className="font-mono text-base font-bold text-rose-400 tabular-nums">
                {temperature} °C
              </span>
            </div>
            <input
              id="temp-slider"
              type="range"
              min={40}
              max={110}
              step={1}
              value={temperature}
              onChange={(e) => setTemperature(Number(e.target.value))}
              className="w-full accent-rose-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-stone-500 font-mono">
              <span>40°C (Хаммам)</span>
              <span>60°C (1-й пар / Русская)</span>
              <span>100°C (Сухая сауна)</span>
            </div>
          </div>

          <div className="space-y-2 rounded-xl bg-stone-950/60 border border-stone-800 p-4">
            <div className="flex items-center justify-between">
              <label htmlFor="humidity-slider" className="flex items-center gap-2 text-xs sm:text-sm font-medium text-stone-200">
                <Droplets className="h-4 w-4 text-cyan-400" />
                <span>Относительная влажность</span>
              </label>
              <span className="font-mono text-base font-bold text-cyan-400 tabular-nums">
                {humidity} %
              </span>
            </div>
            <input
              id="humidity-slider"
              type="range"
              min={10}
              max={100}
              step={1}
              value={humidity}
              onChange={(e) => setHumidity(Number(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-stone-500 font-mono">
              <span>10% (Сухо)</span>
              <span>60% (Мягкий пар)</span>
              <span>100% (Туман)</span>
            </div>
          </div>
        </div>

        <StoveEducationModal
          isOpen={isStoveModalOpen}
          onClose={() => setIsStoveModalOpen(false)}
          onApplySteam={handleApplySteamFromStove}
          soundEnabled={soundEnabled}
          onGrantReward={onGrantReward}
          unlockedBadges={unlockedBadges}
        />

        <VentilationEducationModal
          isOpen={isVentilationModalOpen}
          onClose={() => setIsVentilationModalOpen(false)}
          onVentilate={handleVentilate}
          isVentilating={ventilationOpen}
          soundEnabled={soundEnabled}
        />
      </div>
    </div>
  );
};
