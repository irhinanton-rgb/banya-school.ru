import React, { useState, useEffect } from 'react';
import {
  Flame,
  Droplets,
  Wind,
  Info,
  Sparkles,
  Layers,
  Radio,
  X,
  CheckCircle2,
  ChevronRight,
  ShieldAlert,
  Zap,
  HelpCircle,
  Sliders,
  Play,
  RotateCcw,
  Gauge,
  Thermometer,
  Eye,
  Check,
  AlertTriangle
} from 'lucide-react';
import {
  playExplosiveSteamSound,
  playSteamSound,
  playWoodTap,
  playSuccessChime,
  playFireCrackle,
  playMetalLeverSound
} from '../../utils/audio';

interface StoveEducationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplySteam: (type: 'closed' | 'open', humidityBoost: number, tempBoost: number) => void;
  soundEnabled: boolean;
}

// Preset firing modes
export type FiringMode = 'fast_burn' | 'smoldering' | 'heat_up' | 'steaming' | 'custom';

// Interactive missions
export type MissionId = 'mission_ignite' | 'mission_heat_up' | 'mission_steaming' | 'mission_smoldering';

export interface MissionStep {
  text: string;
  isCompleted: boolean;
}

export interface StoveMission {
  id: MissionId;
  title: string;
  badge: string;
  goal: string;
  reward: string;
  explanation: string;
}

export const StoveEducationModal: React.FC<StoveEducationModalProps> = ({
  isOpen,
  onClose,
  onApplySteam,
  soundEnabled,
}) => {
  const [activeTab, setActiveTab] = useState<'blueprint' | 'missions' | 'steamTypes' | 'ceremonies' | 'infrared' | 'quiz'>('blueprint');
  const [selectedPart, setSelectedPart] = useState<string>('closed_chamber');
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);

  // Physics simulation state
  const [damperPos, setDamperPos] = useState<number>(100); // 0 (closed) to 100 (open)
  const [ashPitPos, setAshPitPos] = useState<number>(80);  // 0 (closed) to 100 (open)
  const [convectionOpen, setConvectionOpen] = useState<boolean>(true); // true = open, false = closed

  // Active mission state
  const [activeMission, setActiveMission] = useState<MissionId | null>('mission_ignite');
  const [missionToast, setMissionToast] = useState<string | null>(null);

  // Intro dialog state (shown when opened with inactive background)
  const [showIntroPopup, setShowIntroPopup] = useState<boolean>(true);

  // Visual effects
  const [steamAnimation, setSteamAnimation] = useState<'closed' | 'open' | 'herbal' | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  // Derived physics
  // Draft depends on damper (шибер) and ash pit (поддувало)
  const draftPercent = Math.round((damperPos * 0.6) + (ashPitPos * 0.4));
  // Flame power depends mostly on ash pit (O2 supply) capped by damper draft
  const effectiveAir = (ashPitPos / 100) * (damperPos > 15 ? 1 : damperPos / 15);
  const flameIntensity = Math.min(100, Math.max(5, Math.round(effectiveAir * 100)));

  // Temperatures based on simulation
  const fireboxTemp = Math.round(300 + (flameIntensity * 7.5)); // 300°C to 1050°C
  const coreTemp = Math.round(280 + (flameIntensity * 3.4));     // 280°C to 620°C
  const openStonesTemp = Math.round(140 + (flameIntensity * 1.1)); // 140°C to 250°C
  const chimneyTemp = Math.round(160 + (draftPercent * 2.8));   // 160°C to 440°C
  const sarcophagusTemp = Math.round(50 + (flameIntensity * 0.35)); // 50°C to 85°C

  // Determine current operation mode
  const currentMode: FiringMode = 
    flameIntensity > 75 && damperPos >= 80 && convectionOpen
      ? 'fast_burn'
      : flameIntensity < 30 && damperPos <= 45 && ashPitPos <= 25
      ? 'smoldering'
      : convectionOpen && flameIntensity >= 50
      ? 'heat_up'
      : !convectionOpen && coreTemp >= 480
      ? 'steaming'
      : 'custom';

  // Mission step verification
  const checkMissionStatus = (missionId: MissionId): { steps: MissionStep[]; completed: boolean } => {
    switch (missionId) {
      case 'mission_ignite':
        return {
          steps: [
            { text: 'Открыть шибер на 100% для максимальной тяги в дымоходе', isCompleted: damperPos >= 90 },
            { text: 'Открыть поддувало на 70-100% для притока кислорода', isCompleted: ashPitPos >= 70 },
            { text: 'Открыть конвекционные заслонки для быстрого прогрева', isCompleted: convectionOpen },
          ],
          completed: damperPos >= 90 && ashPitPos >= 70 && convectionOpen,
        };
      case 'mission_heat_up':
        return {
          steps: [
            { text: 'Поддерживать тягу шибера (70-100%)', isCompleted: damperPos >= 70 },
            { text: 'Открыть заслонки конвекции для теплообмена полка с полом', isCompleted: convectionOpen },
            { text: 'Разогнать пламя выше 60% для интенсивного жара', isCompleted: flameIntensity >= 60 },
          ],
          completed: damperPos >= 70 && convectionOpen && flameIntensity >= 60,
        };
      case 'mission_steaming':
        return {
          steps: [
            { text: 'Закрыть конвекционные заслонки (убить конвекцию, беречь пирог пара!)', isCompleted: !convectionOpen },
            { text: 'Прикрыть поддувало до 20-50% (умеренный ровный огонь)', isCompleted: ashPitPos <= 50 && ashPitPos >= 15 },
            { text: 'Прогреть ядро каменки свыше 450°C', isCompleted: coreTemp >= 450 },
          ],
          completed: !convectionOpen && ashPitPos <= 50 && ashPitPos >= 15 && coreTemp >= 450,
        };
      case 'mission_smoldering':
        return {
          steps: [
            { text: 'Прикрыть шибер дымохода до 20-40% (сохранить тепло)', isCompleted: damperPos <= 40 && damperPos >= 15 },
            { text: 'Почти перекрыть поддувало до 5-25% (ограничить O₂)', isCompleted: ashPitPos <= 25 && ashPitPos >= 5 },
            { text: 'Перевести горение в мягкий тлеющий режим (пламя < 30%)', isCompleted: flameIntensity <= 30 },
          ],
          completed: damperPos <= 40 && damperPos >= 15 && ashPitPos <= 25 && ashPitPos >= 5 && flameIntensity <= 30,
        };
    }
  };

  const currentMissionStatus = activeMission ? checkMissionStatus(activeMission) : null;

  // Sound feedback on preset selection
  const applyPresetMode = (mode: FiringMode) => {
    playMetalLeverSound(soundEnabled);
    if (mode === 'fast_burn') {
      setDamperPos(100);
      setAshPitPos(100);
      setConvectionOpen(true);
      playFireCrackle(soundEnabled);
      setFeedbackMessage('🔥 Включен режим быстрого горения: Шибер 100%, Поддувало 100%, Конвекция открыта. Максимальный разгон пламени!');
    } else if (mode === 'smoldering') {
      setDamperPos(30);
      setAshPitPos(15);
      setConvectionOpen(false);
      setFeedbackMessage('🪵 Включен режим тления: Шибер 30%, Поддувало 15%. Дрова мягко отдают тепло часами без расхода кислорода.');
    } else if (mode === 'heat_up') {
      setDamperPos(90);
      setAshPitPos(75);
      setConvectionOpen(true);
      setFeedbackMessage('♨️ Подготовка к прогреву парной: Конвекционные дверцы открыты! Холодный воздух с пола втягивается в печь и выходит раскаленным.');
    } else if (mode === 'steaming') {
      setDamperPos(60);
      setAshPitPos(35);
      setConvectionOpen(false);
      setFeedbackMessage('✨ Подготовка к парению: Конвекция перекрыта! Пирог пара не сдувается сквозняками, ядро держит 550°C.');
    }
  };

  if (!isOpen) return null;

  const handleStovePour = (type: 'closed' | 'open' | 'herbal') => {
    playWoodTap(soundEnabled);
    setSteamAnimation(type);

    if (type === 'closed') {
      playExplosiveSteamSound(soundEnabled);
      setFeedbackMessage(
        `💥 Пушечный выстрел! Вода взорвалась на камнях t=${coreTemp}°C в глубине ядра. Родился легчайший сухой мелкодисперсный пар!`
      );
      onApplySteam('closed', 8, 2);
    } else if (type === 'open') {
      playSteamSound(soundEnabled);
      setFeedbackMessage(
        `♨️ Мягкое шипение! Верхние камни t=${openStonesTemp}°C дали влажный плотный пар для создания контраста или шапки.`
      );
      onApplySteam('open', 5, 1);
    } else {
      playSteamSound(soundEnabled);
      setFeedbackMessage(
        `🌿 Травяной отвар подан на умеренно прогретый камень (t=${Math.min(openStonesTemp, 200)}°C). Фитонциды раскрылись целебным ароматом без гари!`
      );
      onApplySteam('open', 6, 1);
    }

    setTimeout(() => {
      setSteamAnimation(null);
    }, 2500);
  };

  const missionsList: StoveMission[] = [
    {
      id: 'mission_ignite',
      title: '1. Растопить печь (Первичный розжиг)',
      badge: 'Розжиг',
      goal: 'Создать мощную начальную тягу в холодном дымоходе и быстро разжечь сухую березовую щепу.',
      reward: '+15 Очков Мастера',
      explanation: 'В холодном дымоходе стоит столб тяжелого сырого воздуха. Если не открыть шибер и поддувало на полную — печь начнет дымить в парную!',
    },
    {
      id: 'mission_heat_up',
      title: '2. Подготовить печь к прогреву парной',
      badge: 'Прогрев',
      goal: 'Быстро прогреть массив стен и полок русской бани через мощный конвекционный теплообмен.',
      reward: '+20 Очков Мастера',
      explanation: 'Открытые конвекционные дверцы превращают печь в мощный воздушный насос: холодный воздух с пола втягивается снизу, нагревается и взмывает к потолку.',
    },
    {
      id: 'mission_steaming',
      title: '3. Подготовить печь к парению (Режим пармастера)',
      badge: 'Парение',
      goal: 'Убить конвекцию, стабилизировать мягкое длинноволновое ИК-излучение и сохранить паровой пирог.',
      reward: '+30 Очков Мастера',
      explanation: 'Главный закон кондиций русской бани: во время парения конвекция должна быть заглушена! Иначе сквозняк размоет паровой пирог и пересушит кожу гостей.',
    },
    {
      id: 'mission_smoldering',
      title: '4. Режим тления (Поддержание тепла без перегрева)',
      badge: 'Тление',
      goal: 'Перевести печь на экономичное подовое дожигание для банного чаепития или отдыха между заходами.',
      reward: '+25 Очков Мастера',
      explanation: 'При перекрытом поддувале и прикрытом шибере дрова тлеют до 4–6 часов. Температура камней сохраняется, а парная не перегревается.',
    },
  ];

  const stoveParts = [
    {
      id: 'closed_chamber',
      name: 'Закрытая каменка (Ядро печи)',
      temp: `${coreTemp}°C`,
      icon: '🔒',
      desc: 'Сердце русской бани. Чугунный или жаропрочный короб внутри пламени. Камни раскалены докрасна, но не перегревают воздух в парной.',
      role: 'Рождает сухой перегретый («мелкодисперсный») пар без видимого тумана. Вода подается через специальную паровую пушку на самое дно.',
      proTip: 'Заливать ядро холодной водой нельзя — только крутой кипяток малыми порциями (по 100-200 мл), чтобы не залить каменку.',
    },
    {
      id: 'steam_cannon',
      name: 'Паровая пушка / Воронка подачи',
      temp: 'До 500°C',
      icon: '🚿',
      desc: 'Канал из нержавеющей стали с перфорированными лучами на дне закрытой каменки.',
      role: 'Доставляет воду в самый раскаленный нижний слой камней. Вода превращается в пар в замкнутом объеме под давлением, вылетая в парную перегретой струей.',
      proTip: 'Благодаря пушке пар проходит снизу вверх через всю толщу раскаленных камней, дробясь до молекулярного состояния.',
    },
    {
      id: 'open_stones',
      name: 'Открытая каменка (Верхний ярус)',
      temp: `${openStonesTemp}°C`,
      icon: '🪨',
      desc: 'Камни, лежащие на внешней поверхности печи, непосредственно контактирующие с воздухом парной.',
      role: 'Идеальны для подачи травяных отваров, эфирных запарок и доиспарения. Не дают травам сгореть.',
      proTip: 'Если лить только сюда — пар будет тяжелым, крупнодисперсным, а камни быстро остынут и «зальются».',
    },
    {
      id: 'sarcophagus',
      name: 'Облицовка / Саркофаг (Талькомагнезит/Кирпич)',
      temp: `${sarcophagusTemp}°C`,
      icon: '🛡️',
      desc: 'Толстостенный кожух из натурального камня (талькохлорит, змеевик, пироксенит) или шамотного кирпича.',
      role: 'Блокирует жесткое коротковолновое инфракрасное излучение от металла печи и трансформирует его в целебное длинноволновое ИК-тепло.',
      proTip: 'Саркофаг стабилизирует кондиции русской бани: 60°C на полке без пересушивания воздуха конвекцией.',
    },
    {
      id: 'firebox',
      name: 'Топочная камера и пламя',
      temp: `${fireboxTemp}°C`,
      icon: '🔥',
      desc: 'Пространство сгорания дров с колосником, зольником и каналами вторичного дожига газов.',
      role: 'Энергетический генератор бани. В правильной печи огонь обтекает каменку со всех пяти сторон для максимального прогрева закладки.',
      proTip: 'Поддувало снизу регулирует подачу O₂: чем шире открыто, тем яростнее факел пламени и выше температура ядра.',
    },
    {
      id: 'convection_doors',
      name: 'Конвекционные дверцы / Заслонки',
      temp: convectionOpen ? 'ОТКРЫТЫ (Циркуляция)' : 'ЗАКРЫТЫ (Покой)',
      icon: '🚪',
      desc: 'Вентиляционные отверстия в нижней и верхней части каменного саркофага печи.',
      role: 'При открытых заслонках холодный воздух с пола втягивается вниз, омывает раскаленный металл печи и выходит сверху горячим потоком. При закрытых — конвекция замирает.',
      proTip: '«Убить конвекцию во время парения» — главный закон русской бани, иначе пар с полка сдует конвекционным вихрем.',
    },
    {
      id: 'chimney_economizer',
      name: 'Дымоход с шибером и сеткой-экономайзером',
      temp: `${chimneyTemp}°C`,
      icon: '💨',
      desc: 'Труба отвода дымовых газов. Шибер регулирует тягу от топки, отсекая лишнее улетучивание тепла в небо.',
      role: 'Шибер контролирует скорость движения дымовых газов. Сетка с камнями экранирует раскаленный металл трубы от жесткого коротковолнового ИК.',
      proTip: 'Прикрывая шибер после набора жара, мы удерживаем горячие газы внутри топки, заставляя их нагревать каменку, а не улицу.',
    },
    {
      id: 'ash_pit',
      name: 'Поддувало и зольник',
      temp: 'Приток O₂',
      icon: '🌬️',
      desc: 'Нижняя заслонка, регулирующая подачу свежего первичного воздуха под колосниковую решетку.',
      role: 'Главный орган управления интенсивностью пламени. Закрытие поддувала душит пламя и переводит печь в режим медленного тления.',
      proTip: 'При растопке поддувало открывают широко. Для длительного поддержания кондиций — оставляют тонкую щель в пару миллиметров.',
    },
  ];

  const currentPartData = stoveParts.find((p) => p.id === selectedPart) || stoveParts[0];

  const quizQuestions = [
    {
      q: 'Где в правильной банной печи рождается легкий мелкодисперсный пар?',
      options: [
        'На трубе дымохода при максимальной тяге',
        'В закрытой каменке при температуре камней свыше 450–500°C',
        'На открытых камнях, если плеснуть сразу 2 литра холодной воды',
        'В зольнике под колосниковой решеткой',
      ],
      correct: 1,
      explain: 'Именно в изолированной закрытой каменке камни раскаляются до 500-600°C. Капли воды взрываются в пар субмикронного размера.',
    },
    {
      q: 'Какое инфракрасное излучение считается целебным для человеческого организма в парной?',
      options: [
        'Коротковолновое от раскаленного железа (длина волны < 2 мкм)',
        'Рентгеновское и ультрафиолетовое излучение от углей',
        'Мягкое длинноволновое от камня саркофага (длина волны 8–14 мкм, биорезонанс)',
        'Чем горячее и жестче печет кожу — тем полезнее',
      ],
      correct: 2,
      explain: 'Тепловое излучение камня при 60-80°C по спектру (8-14 мкм) идентично теплу человеческого тела. Оно прогревает ткани на глубину до 4 см без ожога кожи.',
    },
    {
      q: 'Почему перед началом парения вениками обязательно закрывают конвекционные дверцы печи?',
      options: [
        'Чтобы в печи не погас огонь от сырости',
        'Чтобы остановить конвекционный сквозняк, который сдувает и размывает паровой пирог',
        'Чтобы камни в открытой каменке не остыли за 1 минуту',
        'Дверцы закрывать не нужно, конвекция полезна всегда',
      ],
      correct: 1,
      explain: 'Конвекционный вихрь перемешивает воздух, сдувая устойчивый пирог пара из-под потолка на пол, делая атмосферу в парной сырой и душной.',
    },
  ];

  const handleAnswer = (qIdx: number, optIdx: number) => {
    if (quizSubmitted) return;
    setQuizAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
  };

  const handleCheckQuiz = () => {
    setQuizSubmitted(true);
    playSuccessChime(soundEnabled);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto bg-black/90 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-6xl rounded-3xl border border-amber-600/40 bg-stone-950 text-stone-100 shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        
        {/* Top Header */}
        <div className="relative bg-gradient-to-r from-amber-950/85 via-stone-900 to-rose-950/85 border-b border-stone-800 p-4 sm:p-5">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-stone-900/80 hover:bg-stone-800 text-stone-400 hover:text-stone-100 transition-colors border border-stone-700/60"
            title="Закрыть макет"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xl shrink-0 shadow-inner">
              🪵
            </div>

            <div className="pr-10">
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono uppercase tracking-wider">
                <span className="text-amber-400 font-bold">🔥 Анатомия банной печи в разрезе</span>
                <span className="text-stone-500">•</span>
                <span className="text-stone-300">Физика огня, тяги и пара</span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-4 mt-3 border-t border-stone-800/80 scrollbar-none">
            <button
              onClick={() => setActiveTab('blueprint')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'blueprint'
                  ? 'bg-amber-500 text-stone-950 shadow-md font-bold'
                  : 'bg-stone-900/80 text-stone-400 hover:text-stone-200 hover:bg-stone-800'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Интерактивный макет и симуляция</span>
            </button>

            <button
              onClick={() => setActiveTab('missions')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'missions'
                  ? 'bg-amber-500 text-stone-950 shadow-md font-bold'
                  : 'bg-stone-900/80 text-stone-400 hover:text-stone-200 hover:bg-stone-800'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Задания пармастера (Квесты печи)</span>
            </button>

            <button
              onClick={() => setActiveTab('steamTypes')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'steamTypes'
                  ? 'bg-amber-500 text-stone-950 shadow-md font-bold'
                  : 'bg-stone-900/80 text-stone-400 hover:text-stone-200 hover:bg-stone-800'
              }`}
            >
              <Droplets className="w-3.5 h-3.5" />
              <span>Мелкодисперсный vs Крупный пар</span>
            </button>

            <button
              onClick={() => setActiveTab('infrared')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'infrared'
                  ? 'bg-amber-500 text-stone-950 shadow-md font-bold'
                  : 'bg-stone-900/80 text-stone-400 hover:text-stone-200 hover:bg-stone-800'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>ИК-волны (Короткие vs Длинные)</span>
            </button>

            <button
              onClick={() => setActiveTab('ceremonies')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'ceremonies'
                  ? 'bg-amber-500 text-stone-950 shadow-md font-bold'
                  : 'bg-stone-900/80 text-stone-400 hover:text-stone-200 hover:bg-stone-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Паровой пирог и церемонии</span>
            </button>

            <button
              onClick={() => setActiveTab('quiz')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'quiz'
                  ? 'bg-amber-500 text-stone-950 shadow-md font-bold'
                  : 'bg-stone-900/80 text-stone-400 hover:text-stone-200 hover:bg-stone-800'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Экзамен пармастера</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className={`flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 transition-all duration-300 ${
          showIntroPopup ? 'filter blur-[2px] opacity-40 pointer-events-none select-none' : ''
        }`}>

          {/* TAB 1: INTERACTIVE BLUEPRINT */}
          {activeTab === 'blueprint' && (
            <div className="space-y-5">
              
              {/* Presets and Status Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-stone-900/90 border border-stone-800">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-stone-400 flex items-center gap-1.5">
                    <Gauge className="w-3.5 h-3.5 text-amber-400" />
                    <span>Быстрые режимы:</span>
                  </span>
                  
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      onClick={() => applyPresetMode('fast_burn')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        currentMode === 'fast_burn'
                          ? 'bg-rose-500 text-white shadow-md'
                          : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                      }`}
                      title="Максимальный огонь: Шибер 100%, Поддувало 100%"
                    >
                      🔥 Быстрое горение
                    </button>

                    <button
                      onClick={() => applyPresetMode('smoldering')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        currentMode === 'smoldering'
                          ? 'bg-amber-600 text-white shadow-md'
                          : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                      }`}
                      title="Экономичное тление: Шибер 30%, Поддувало 15%"
                    >
                      🪵 Режим тления
                    </button>

                    <button
                      onClick={() => applyPresetMode('heat_up')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        currentMode === 'heat_up'
                          ? 'bg-cyan-600 text-white shadow-md'
                          : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                      }`}
                      title="Прогрев стен: Конвекция открыта, тяга высокая"
                    >
                      ♨️ Прогрев парной
                    </button>

                    <button
                      onClick={() => applyPresetMode('steaming')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        currentMode === 'steaming'
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                      }`}
                      title="Парение вениками: Конвекция перекрыта, ядро 550°C"
                    >
                      ✨ Режим парения
                    </button>
                  </div>
                </div>

                {/* Steam Ladle Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleStovePour('closed')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs uppercase tracking-wide transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    <span>💥 Ковш в ядро ({coreTemp}°C)</span>
                  </button>

                  <button
                    onClick={() => handleStovePour('open')}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-xs transition-all border border-stone-700 active:scale-95 cursor-pointer"
                  >
                    <span>♨️ На открытые камни</span>
                  </button>
                </div>
              </div>

              {/* Toast Feedback */}
              {feedbackMessage && (
                <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-xs text-amber-200 animate-fade-in flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>{feedbackMessage}</span>
                  </div>
                  <button
                    onClick={() => setFeedbackMessage(null)}
                    className="text-stone-400 hover:text-stone-200 text-xs ml-2 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Main Blueprint Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* SVG Visual Stage */}
                <div className="lg:col-span-7 rounded-2xl bg-stone-900/95 border border-stone-800 p-4 sm:p-5 relative overflow-hidden shadow-2xl flex flex-col items-center">
                  
                  {/* Floating Steam particles */}
                  {steamAnimation && (
                    <div className="absolute inset-0 pointer-events-none z-30 flex flex-col items-center justify-start pt-6 overflow-hidden">
                      <div
                        className={`w-3/4 rounded-full blur-2xl transition-all duration-1000 ${
                          steamAnimation === 'closed'
                            ? 'h-32 bg-amber-400/25 animate-pulse'
                            : steamAnimation === 'herbal'
                            ? 'h-40 bg-emerald-400/30 animate-pulse'
                            : 'h-48 bg-stone-200/40 animate-pulse'
                        }`}
                      />
                      <div className="text-xs font-mono font-bold tracking-wider px-3 py-1 rounded-full bg-stone-950/90 border border-amber-500/50 text-amber-300 mt-2 shadow-lg">
                        {steamAnimation === 'closed'
                          ? '💨 ВЗРЫВ СУХОГО МЕЛКОДИСПЕРСНОГО ПАРА (СУБМИКРОН)!'
                          : steamAnimation === 'herbal'
                          ? '🌿 ЦЕЛЕБНОЕ ОБЛАКО ФИТОНЦИДОВ БЕЗ ГАРИ!'
                          : '🌫️ КЛУБЫ ПЛОТНОГО КРУПНОДИСПЕРСНОГО ПАРА!'}
                      </div>
                    </div>
                  )}

                  {/* Stage Top Legend */}
                  <div className="w-full flex items-center justify-between pb-3 border-b border-stone-800/80 text-xs">
                    <span className="font-mono text-stone-300 font-semibold flex items-center gap-2">
                      <span>🪵</span>
                      <span>ИНТЕРАКТИВНЫЙ РАЗРЕЗ ПЕЧИ (НАВЕДЕНИЕ И КЛИК)</span>
                    </span>
                    <span className={`font-mono font-bold text-xs ${
                      convectionOpen ? 'text-cyan-400' : 'text-amber-400'
                    }`}>
                      {convectionOpen ? '● КОНВЕКЦИЯ: АКТИВНА' : '● КОНВЕКЦИЯ: ПЕРЕКРЫТА (ПОКОЙ)'}
                    </span>
                  </div>

                  {/* Dynamic Hover Indicator */}
                  <div className="w-full py-1.5 px-3 my-1 rounded-lg bg-stone-950/80 border border-stone-800 text-[11px] font-mono flex items-center justify-between text-stone-300">
                    <span>
                      {hoveredElement === 'core' && '🔍 Наведено на ЯДРО: Мелкое жесткое коротковолновое ИК-излучение (λ < 2 мкм), запертое внутри!'}
                      {hoveredElement === 'sarcophagus' && '🔍 Наведено на САРКОФАГ: Мягкое биорезонансное длинноволновое ИК-тепло (λ = 8–14 мкм)!'}
                      {hoveredElement === 'chimney' && `🔍 Наведено на ДЫМОХОД: Дым из топки уходит через шибер (тяга ${draftPercent}%).`}
                      {hoveredElement === 'convection' && (convectionOpen ? '🔍 Заслонки конвекции ОТКРЫТЫ: Холодный воздух с пола прогревается и взмывает вверх!' : '🔍 Заслонки конвекции ЗАКРЫТЫ: Циркуляция остановлена, паровой пирог в безопасности!')}
                      {hoveredElement === 'firebox' && `🔍 Наведено на ТОПКУ: Пламя ${flameIntensity}%, приток O₂ регулируется поддувалом!`}
                      {!hoveredElement && 'Наведите на ядро, саркофаг, трубу или заслонки для просмотра физики'}
                    </span>
                    <span className="text-amber-400 font-bold shrink-0 ml-2">
                      Пламя: {flameIntensity}%
                    </span>
                  </div>

                  {/* SVG Cutaway Graphic */}
                  <div className="w-full max-w-[480px] aspect-[4/5] relative my-2">
                    <svg viewBox="0 0 440 560" className="w-full h-full select-none">
                      <defs>
                        {/* Dynamic Flame Gradient depending on intensity */}
                        <linearGradient id="fireGradDynamic" x1="0" y1="1" x2="0" y2="0">
                          <stop offset="0%" stopColor="#991b1b" />
                          <stop offset={`${Math.min(40, flameIntensity * 0.4)}%`} stopColor="#dc2626" />
                          <stop offset={`${Math.min(70, flameIntensity * 0.7)}%`} stopColor="#f59e0b" />
                          <stop offset={`${Math.min(95, flameIntensity * 0.95)}%`} stopColor="#fef08a" />
                          <stop offset="100%" stopColor="#ffffff" />
                        </linearGradient>

                        {/* Soapstone Sarcophagus */}
                        <linearGradient id="soapstoneGrad2" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#1c1917" />
                          <stop offset="20%" stopColor="#292524" />
                          <stop offset="50%" stopColor="#44403c" />
                          <stop offset="80%" stopColor="#292524" />
                          <stop offset="100%" stopColor="#1c1917" />
                        </linearGradient>

                        {/* Superheated Core Radiance */}
                        <radialGradient id="hotCoreRadial2" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor="#fef08a" stopOpacity="1" />
                          <stop offset="35%" stopColor="#f59e0b" stopOpacity="0.9" />
                          <stop offset="70%" stopColor="#dc2626" stopOpacity="0.8" />
                          <stop offset="100%" stopColor="#7f1d1d" stopOpacity="0.75" />
                        </radialGradient>

                        {/* Metallic Stainless Steel */}
                        <linearGradient id="steelPipeGrad2" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#44403c" />
                          <stop offset="40%" stopColor="#a8a29e" />
                          <stop offset="70%" stopColor="#e7e5e4" />
                          <stop offset="100%" stopColor="#44403c" />
                        </linearGradient>

                        {/* Markers for Arrows */}
                        <marker id="arrowUpCyan" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                          <polygon points="0 6, 3 0, 6 6" fill="#38bdf8" />
                        </marker>
                        <marker id="arrowUpOrange" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                          <polygon points="0 6, 3 0, 6 6" fill="#fb923c" />
                        </marker>
                      </defs>

                      {/* --- LONG-WAVE INFRARED WAVES (from Sarcophagus) --- */}
                      {/* Radiates outside only when hovering or selected */}
                      {(hoveredElement === 'sarcophagus' || selectedPart === 'sarcophagus') && (
                        <g className="animate-ir-long pointer-events-none">
                          <circle cx="220" cy="310" r="215" fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="10 8" opacity="0.6" />
                          <circle cx="220" cy="310" r="190" fill="none" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="8 6" opacity="0.75" />
                          <circle cx="220" cy="310" r="165" fill="none" stroke="#fef08a" strokeWidth="1" strokeDasharray="6 4" opacity="0.9" />
                          <text x="70" y="115" fill="#f59e0b" fontSize="11" fontWeight="bold" fontFamily="monospace">
                            ДЛИННОВОЛНОВОЕ МЯГКОЕ ИК (λ = 8–14 мкм)
                          </text>
                        </g>
                      )}

                      {/* --- 1. CHIMNEY WITH DAMPER (ШИБЕР) & ECONOMIZER --- */}
                      <g
                        className="cursor-pointer transition-all"
                        onMouseEnter={() => setHoveredElement('chimney')}
                        onMouseLeave={() => setHoveredElement(null)}
                        onClick={() => {
                          playWoodTap(soundEnabled);
                          setSelectedPart('chimney_economizer');
                        }}
                      >
                        {/* Chimney Pipe */}
                        <rect
                          x="192"
                          y="15"
                          width="56"
                          height="125"
                          rx="4"
                          fill="url(#steelPipeGrad2)"
                          stroke={selectedPart === 'chimney_economizer' ? '#f59e0b' : '#78716c'}
                          strokeWidth={selectedPart === 'chimney_economizer' ? 2.5 : 1.5}
                        />

                        {/* Dynamic Smoke Rising Flow inside Chimney */}
                        <g className="animate-smoke-flow pointer-events-none">
                          <path
                            d="M 205,135 Q 215,90 210,50 Q 220,30 212,15"
                            fill="none"
                            stroke="#e2e8f0"
                            strokeWidth={Math.max(2, (draftPercent / 100) * 8)}
                            strokeDasharray="12 8"
                            opacity={Math.max(0.2, (draftPercent / 100) * 0.85)}
                            strokeLinecap="round"
                          />
                          <path
                            d="M 230,135 Q 222,95 230,55 Q 224,30 228,15"
                            fill="none"
                            stroke="#94a3b8"
                            strokeWidth={Math.max(1.5, (draftPercent / 100) * 6)}
                            strokeDasharray="10 6"
                            opacity={Math.max(0.2, (draftPercent / 100) * 0.75)}
                            strokeLinecap="round"
                          />
                        </g>

                        {/* Interactive Damper (Шибер) Rod & Plate */}
                        <g
                          className="cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            playMetalLeverSound(soundEnabled);
                            setDamperPos((prev) => (prev >= 90 ? 25 : prev <= 30 ? 100 : 90));
                          }}
                        >
                          {/* Damper blade angle responds to damperPos */}
                          <line
                            x1="182"
                            y1="55"
                            x2={192 + (damperPos / 100) * 56}
                            y2={55 + (1 - damperPos / 100) * 20}
                            stroke="#f59e0b"
                            strokeWidth="4"
                            strokeLinecap="round"
                          />
                          {/* Exterior Handle */}
                          <line x1="248" y1="55" x2="275" y2="55" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
                          <circle cx="275" cy="55" r="7" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
                          <text x="286" y="58" fill="#f59e0b" fontSize="9" fontWeight="bold" fontFamily="monospace">
                            Шибер ({damperPos}%)
                          </text>
                        </g>

                        {/* Economizer Rock Cage */}
                        <rect
                          x="175"
                          y="65"
                          width="90"
                          height="68"
                          rx="8"
                          fill="#141211"
                          stroke={selectedPart === 'chimney_economizer' ? '#f59e0b' : '#a8a29e'}
                          strokeWidth={selectedPart === 'chimney_economizer' ? 2 : 1.5}
                          strokeDasharray="4 2"
                        />

                        {/* Economizer Stones */}
                        <circle cx="192" cy="82" r="8" fill="#78716c" />
                        <circle cx="214" cy="78" r="9" fill="#57534e" />
                        <circle cx="238" cy="84" r="8" fill="#78716c" />
                        <circle cx="198" cy="106" r="10" fill="#44403c" />
                        <circle cx="222" cy="112" r="9" fill="#78716c" />
                        <circle cx="244" cy="104" r="9" fill="#57534e" />
                      </g>

                      {/* --- 2. OUTER STONE SARCOPHAGUS (ТАЛЬКОХЛОРИТ) --- */}
                      <g
                        className="cursor-pointer transition-all hover:opacity-95"
                        onMouseEnter={() => setHoveredElement('sarcophagus')}
                        onMouseLeave={() => setHoveredElement(null)}
                        onClick={() => {
                          playWoodTap(soundEnabled);
                          setSelectedPart('sarcophagus');
                        }}
                      >
                        <rect
                          x="75"
                          y="135"
                          width="290"
                          height="390"
                          rx="14"
                          fill="url(#soapstoneGrad2)"
                          stroke={selectedPart === 'sarcophagus' ? '#f59e0b' : '#78716c'}
                          strokeWidth={selectedPart === 'sarcophagus' ? 3 : 2}
                        />

                        {/* Stone Masonry Seams */}
                        <line x1="75" y1="220" x2="365" y2="220" stroke="#0c0a09" strokeWidth="2.5" />
                        <line x1="75" y1="305" x2="365" y2="305" stroke="#0c0a09" strokeWidth="2.5" />
                        <line x1="75" y1="395" x2="365" y2="395" stroke="#0c0a09" strokeWidth="2.5" />
                        <line x1="75" y1="480" x2="365" y2="480" stroke="#0c0a09" strokeWidth="2.5" />
                        
                        <line x1="175" y1="135" x2="175" y2="220" stroke="#0c0a09" strokeWidth="2" />
                        <line x1="265" y1="220" x2="265" y2="305" stroke="#0c0a09" strokeWidth="2" />
                        <line x1="165" y1="305" x2="165" y2="395" stroke="#0c0a09" strokeWidth="2" />
                        <line x1="275" y1="395" x2="275" y2="480" stroke="#0c0a09" strokeWidth="2" />
                      </g>

                      {/* --- 3. CONVECTION DAMPERS (ЗАСЛОНКИ КОНВЕКЦИИ) --- */}
                      <g
                        className="cursor-pointer transition-all"
                        onMouseEnter={() => setHoveredElement('convection')}
                        onMouseLeave={() => setHoveredElement(null)}
                        onClick={() => {
                          playMetalLeverSound(soundEnabled);
                          setConvectionOpen((prev) => !prev);
                          setSelectedPart('convection_doors');
                        }}
                      >
                        {/* Top Louvers (Hot Air Outlet) */}
                        <rect
                          x="82"
                          y="148"
                          width="46"
                          height="24"
                          rx="4"
                          fill="#0c0a09"
                          stroke={convectionOpen ? '#38bdf8' : '#e11d48'}
                          strokeWidth="2"
                        />
                        <text x="88" y="164" fill={convectionOpen ? '#38bdf8' : '#e11d48'} fontSize="9" fontWeight="bold" fontFamily="sans-serif">
                          {convectionOpen ? 'ОТКР' : 'ЗАКР'}
                        </text>

                        <rect
                          x="312"
                          y="148"
                          width="46"
                          height="24"
                          rx="4"
                          fill="#0c0a09"
                          stroke={convectionOpen ? '#38bdf8' : '#e11d48'}
                          strokeWidth="2"
                        />
                        <text x="318" y="164" fill={convectionOpen ? '#38bdf8' : '#e11d48'} fontSize="9" fontWeight="bold" fontFamily="sans-serif">
                          {convectionOpen ? 'ОТКР' : 'ЗАКР'}
                        </text>

                        {/* Bottom Air Intakes (Cool floor air) */}
                        <rect
                          x="82"
                          y="488"
                          width="46"
                          height="24"
                          rx="4"
                          fill="#0c0a09"
                          stroke={convectionOpen ? '#38bdf8' : '#78716c'}
                          strokeWidth="2"
                        />
                        <text x="88" y="504" fill={convectionOpen ? '#38bdf8' : '#78716c'} fontSize="9" fontWeight="bold" fontFamily="sans-serif">
                          {convectionOpen ? 'ОТКР' : 'ЗАКР'}
                        </text>

                        <rect
                          x="312"
                          y="488"
                          width="46"
                          height="24"
                          rx="4"
                          fill="#0c0a09"
                          stroke={convectionOpen ? '#38bdf8' : '#78716c'}
                          strokeWidth="2"
                        />
                        <text x="318" y="504" fill={convectionOpen ? '#38bdf8' : '#78716c'} fontSize="9" fontWeight="bold" fontFamily="sans-serif">
                          {convectionOpen ? 'ОТКР' : 'ЗАКР'}
                        </text>

                        {/* Dynamic Airflow circulation paths when Convection is Open */}
                        {convectionOpen && (
                          <g className="animate-air-flow pointer-events-none">
                            {/* Left upward air stream: cool floor air (cyan) heats to warm (orange) */}
                            <path
                              d="M 105,530 L 105,488 Q 105,320 105,172 L 105,120"
                              fill="none"
                              stroke="#38bdf8"
                              strokeWidth="3"
                              strokeDasharray="8 6"
                              markerEnd="url(#arrowUpCyan)"
                            />
                            {/* Right upward air stream */}
                            <path
                              d="M 335,530 L 335,488 Q 335,320 335,172 L 335,120"
                              fill="none"
                              stroke="#fb923c"
                              strokeWidth="3"
                              strokeDasharray="8 6"
                              markerEnd="url(#arrowUpOrange)"
                            />
                            <text x="45" y="542" fill="#38bdf8" fontSize="9" fontWeight="bold">Холодный с пола ↓</text>
                            <text x="45" y="112" fill="#fb923c" fontSize="9" fontWeight="bold">Горячий к потолку ↑</text>
                          </g>
                        )}
                      </g>

                      {/* --- 4. OPEN STONES TRAY (ОТКРЫТАЯ КАМЕНКА) --- */}
                      <g
                        className="cursor-pointer"
                        onClick={() => {
                          playWoodTap(soundEnabled);
                          setSelectedPart('open_stones');
                        }}
                      >
                        <rect
                          x="135"
                          y="140"
                          width="170"
                          height="40"
                          rx="7"
                          fill="#1c1917"
                          stroke={selectedPart === 'open_stones' ? '#f43f5e' : '#e11d48'}
                          strokeWidth={selectedPart === 'open_stones' ? 2.5 : 1.5}
                        />

                        {/* Stones with warm tints */}
                        <ellipse cx="158" cy="155" rx="12" ry="8" fill="#78716c" />
                        <ellipse cx="186" cy="151" rx="14" ry="9" fill="#a8a29e" />
                        <ellipse cx="220" cy="155" rx="16" ry="10" fill="#78716c" />
                        <ellipse cx="254" cy="151" rx="14" ry="9" fill="#a8a29e" />
                        <ellipse cx="282" cy="155" rx="12" ry="8" fill="#78716c" />
                        <text x="175" y="171" fill="#fda4af" fontSize="10" fontWeight="bold">
                          {openStonesTemp}°C Открытая
                        </text>
                      </g>

                      {/* --- 5. STEAM CANNON (ПАРОВАЯ ПУШКА) --- */}
                      <g
                        className="cursor-pointer"
                        onClick={() => {
                          playWoodTap(soundEnabled);
                          setSelectedPart('steam_cannon');
                        }}
                      >
                        <polygon
                          points="210,120 230,120 224,180 216,180"
                          fill="#38bdf8"
                          stroke={selectedPart === 'steam_cannon' ? '#ffffff' : '#0284c7'}
                          strokeWidth="2"
                        />
                        <line x1="220" y1="180" x2="220" y2="280" stroke="#38bdf8" strokeWidth="4" />
                        <line x1="160" y1="280" x2="280" y2="280" stroke="#38bdf8" strokeWidth="3" strokeDasharray="5 3" />
                        <circle cx="220" cy="132" r="5" fill="#38bdf8" className="animate-pulse" />
                      </g>

                      {/* --- 6. CLOSED STONE CORE (ЗАКРЫТАЯ КАМЕНКА / ЯДРО) --- */}
                      <g
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredElement('core')}
                        onMouseLeave={() => setHoveredElement(null)}
                        onClick={() => {
                          playWoodTap(soundEnabled);
                          setSelectedPart('closed_chamber');
                        }}
                      >
                        <rect
                          x="130"
                          y="185"
                          width="180"
                          height="115"
                          rx="10"
                          fill="url(#hotCoreRadial2)"
                          stroke={selectedPart === 'closed_chamber' ? '#ffffff' : '#f59e0b'}
                          strokeWidth={selectedPart === 'closed_chamber' ? 3.5 : 2}
                        />

                        {/* SHORT-WAVE INFRARED RADIATION (Visible when hovered on Core) */}
                        {(hoveredElement === 'core' || selectedPart === 'closed_chamber') && (
                          <g className="animate-ir-short pointer-events-none">
                            {/* Sharp, fast, tight jagged waves depicting short-wavelength IR (λ < 2 µm) */}
                            <rect x="120" y="175" width="200" height="135" rx="14" fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 3" opacity="0.9" />
                            <rect x="110" y="165" width="220" height="155" rx="18" fill="none" stroke="#fca5a5" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.7" />
                            <text x="145" y="175" fill="#ef4444" fontSize="9" fontWeight="bold" fontFamily="monospace">
                              КОРОТКОВОЛНОВОЕ ЖЕСТКОЕ ИК (λ &lt; 2 мкм)
                            </text>
                          </g>
                        )}

                        {/* Glowing Red-Hot Rocks & Cast Iron Core */}
                        <circle cx="158" cy="214" r="14" fill="#991b1b" stroke="#fca5a5" strokeWidth="1" />
                        <circle cx="192" cy="208" r="15" fill="#b91c1c" stroke="#fef08a" strokeWidth="1.5" />
                        <circle cx="228" cy="212" r="16" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
                        <circle cx="262" cy="210" r="15" fill="#b91c1c" stroke="#fef08a" strokeWidth="1.5" />
                        <circle cx="288" cy="220" r="12" fill="#991b1b" stroke="#fca5a5" strokeWidth="1" />

                        <circle cx="150" cy="248" r="15" fill="#b91c1c" stroke="#fef08a" strokeWidth="1.5" />
                        <circle cx="184" cy="254" r="17" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
                        <circle cx="220" cy="248" r="18" fill="#f59e0b" stroke="#ffffff" strokeWidth="2.5" className="animate-pulse" />
                        <circle cx="256" cy="255" r="17" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
                        <circle cx="290" cy="246" r="14" fill="#b91c1c" stroke="#fef08a" strokeWidth="1.5" />

                        {/* Core Temperature Banner */}
                        <rect x="140" y="274" width="160" height="20" rx="5" fill="#000000" opacity="0.9" />
                        <text x="148" y="288" fill="#fde047" fontSize="11" fontWeight="bold" fontFamily="monospace">
                          ЯДРО: {coreTemp}°C (Закрытая)
                        </text>
                      </g>

                      {/* --- 7. FIREBOX & COMBUSTION (ТОПКА И ОГОНЬ) --- */}
                      <g
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredElement('firebox')}
                        onMouseLeave={() => setHoveredElement(null)}
                        onClick={() => {
                          playFireCrackle(soundEnabled);
                          setSelectedPart('firebox');
                        }}
                      >
                        {/* Firebox Chamber */}
                        <rect
                          x="120"
                          y="310"
                          width="200"
                          height="130"
                          rx="8"
                          fill="#14110f"
                          stroke={selectedPart === 'firebox' ? '#ef4444' : '#b45309'}
                          strokeWidth={selectedPart === 'firebox' ? 3 : 2}
                        />

                        {/* Dynamic Flame Flutter SVG */}
                        <g className="animate-flame">
                          <path
                            d={`M 135,420 Q 155,${380 - flameIntensity * 0.75} 170,410 Q 190,${370 - flameIntensity * 0.85} 205,405 Q 220,${360 - flameIntensity * 0.95} 235,410 Q 255,${375 - flameIntensity * 0.8} 270,415 Q 290,${390 - flameIntensity * 0.5} 305,420 Z`}
                            fill="url(#fireGradDynamic)"
                            opacity={Math.min(1, Math.max(0.4, flameIntensity / 80))}
                          />
                        </g>

                        {/* Firewood Logs */}
                        <line x1="145" y1="418" x2="295" y2="418" stroke="#78350f" strokeWidth="10" strokeLinecap="round" />
                        <line x1="155" y1="408" x2="285" y2="408" stroke="#451a03" strokeWidth="8" strokeLinecap="round" />
                        
                        <text x="170" y="340" fill="#fca5a5" fontSize="11" fontWeight="bold">
                          ТОПКА ({fireboxTemp}°C)
                        </text>
                      </g>

                      {/* --- 8. ASH PAN & PRIMARY AIR (ПОДДУВАЛО И ЗОЛЬНИК) --- */}
                      <g
                        className="cursor-pointer"
                        onClick={() => {
                          playMetalLeverSound(soundEnabled);
                          setSelectedPart('ash_pit');
                          setAshPitPos((prev) => (prev >= 80 ? 20 : prev <= 25 ? 85 : 95));
                        }}
                      >
                        <rect x="140" y="450" width="160" height="45" rx="5" fill="#292524" stroke="#57534e" strokeWidth="1.5" />
                        
                        {/* Adjustable Grate Slots */}
                        <line x1="160" y1="468" x2={160 + (ashPitPos / 100) * 35} y2="468" stroke="#a8a29e" strokeWidth="3" />
                        <line x1="205" y1="468" x2={205 + (ashPitPos / 100) * 35} y2="468" stroke="#a8a29e" strokeWidth="3" />
                        <line x1="250" y1="468" x2={250 + (ashPitPos / 100) * 35} y2="468" stroke="#a8a29e" strokeWidth="3" />
                        
                        <text x="165" y="485" fill="#a8a29e" fontSize="10">
                          Поддувало: {ashPitPos}% O₂
                        </text>
                      </g>
                    </svg>
                  </div>

                  {/* Interactive Sliders Under Schema */}
                  <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-stone-800 text-xs">
                    
                    {/* Damper Slider */}
                    <div className="p-2.5 rounded-xl bg-stone-950/80 border border-stone-800/80 space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-[11px] font-mono text-stone-300">Шибер трубы (Тяга)</label>
                        <span className="font-mono text-amber-400 font-bold">{damperPos}%</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        value={damperPos}
                        onChange={(e) => {
                          setDamperPos(Number(e.target.value));
                          playMetalLeverSound(soundEnabled);
                        }}
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                    </div>

                    {/* Ash Pit Slider */}
                    <div className="p-2.5 rounded-xl bg-stone-950/80 border border-stone-800/80 space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-[11px] font-mono text-stone-300">Поддувало (Приток O₂)</label>
                        <span className="font-mono text-rose-400 font-bold">{ashPitPos}%</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="100"
                        value={ashPitPos}
                        onChange={(e) => {
                          setAshPitPos(Number(e.target.value));
                          playMetalLeverSound(soundEnabled);
                        }}
                        className="w-full accent-rose-500 cursor-pointer"
                      />
                    </div>

                    {/* Convection Toggle */}
                    <div className="p-2.5 rounded-xl bg-stone-950/80 border border-stone-800/80 flex flex-col justify-between">
                      <span className="text-[11px] font-mono text-stone-300">Заслонки конвекции:</span>
                      <button
                        onClick={() => {
                          playMetalLeverSound(soundEnabled);
                          setConvectionOpen((prev) => !prev);
                        }}
                        className={`w-full py-1.5 rounded-lg text-xs font-bold transition-all ${
                          convectionOpen
                            ? 'bg-cyan-500/20 border border-cyan-500 text-cyan-200'
                            : 'bg-amber-500/20 border border-amber-500 text-amber-200'
                        }`}
                      >
                        {convectionOpen ? '🚪 ОТКРЫТЫ (Греет)' : '🔒 ЗАКРЫТЫ (Покой)'}
                      </button>
                    </div>

                  </div>
                </div>

                {/* Selected Node Detailed Inspection */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="rounded-2xl bg-stone-900 border border-stone-800 p-5 space-y-4 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{currentPartData.icon}</span>
                        <div>
                          <h4 className="font-serif font-bold text-lg text-amber-300">
                            {currentPartData.name}
                          </h4>
                          <span className="text-xs font-mono text-rose-400 font-semibold">
                            Рабочая температура: {currentPartData.temp}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-stone-300 leading-relaxed">
                      {currentPartData.desc}
                    </p>

                    <div className="rounded-xl bg-stone-950 p-3.5 border border-stone-800 space-y-2 text-xs">
                      <div className="font-semibold text-amber-400 flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5" />
                        <span>Роль в образовании пара и микроклимата:</span>
                      </div>
                      <p className="text-stone-300 leading-relaxed">
                        {currentPartData.role}
                      </p>
                    </div>

                    <div className="rounded-xl bg-amber-950/30 p-3.5 border border-amber-600/30 space-y-1.5 text-xs">
                      <div className="font-semibold text-amber-300 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Секрет и совет мастера (Pro Tip):</span>
                      </div>
                      <p className="text-amber-100/90 leading-relaxed">
                        {currentPartData.proTip}
                      </p>
                    </div>
                  </div>

                  {/* Quick Select Buttons for All Parts */}
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-mono text-stone-400 uppercase tracking-wider">
                      Все узлы банной печи:
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {stoveParts.map((part) => (
                        <button
                          key={part.id}
                          onClick={() => {
                            playWoodTap(soundEnabled);
                            setSelectedPart(part.id);
                          }}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-left transition-all border cursor-pointer ${
                            selectedPart === part.id
                              ? 'bg-amber-500/20 border-amber-500 text-amber-200 font-bold'
                              : 'bg-stone-900/60 border-stone-800 text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                          }`}
                        >
                          <span>{part.icon}</span>
                          <span className="truncate">{part.name.split(' (')[0]}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: MISSIONS / QUESTS (ЗАДАНИЯ ПАРМАСТЕРА) */}
          {activeTab === 'missions' && (
            <div className="space-y-6">
              <div className="rounded-2xl bg-amber-950/20 border border-amber-500/20 p-4 text-xs sm:text-sm text-stone-300 leading-relaxed flex items-center justify-between">
                <div>
                  <h3 className="font-serif font-bold text-base text-amber-300">
                    Практические квесты по управлению печью
                  </h3>
                  <p className="text-xs text-stone-400 mt-1">
                    Выбери задание и выставь органы управления печи (шибер, поддувало, конвекцию) в нужное положение.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-amber-400 font-bold px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30">
                    4 интерактивных задания
                  </span>
                </div>
              </div>

              {/* Current Active Mission Card */}
              {activeMission && (
                <div className="rounded-2xl bg-stone-900 border-2 border-amber-500/60 p-5 space-y-4 shadow-2xl">
                  {(() => {
                    const mission = missionsList.find((m) => m.id === activeMission)!;
                    const status = checkMissionStatus(activeMission);

                    return (
                      <>
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-stone-800">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-stone-950 text-[10px] font-bold uppercase tracking-wider">
                              {mission.badge}
                            </span>
                            <h4 className="font-serif font-bold text-lg text-amber-200">
                              {mission.title}
                            </h4>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-xs font-mono text-amber-400 font-bold">
                              {mission.reward}
                            </span>
                            {status.completed ? (
                              <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500 text-emerald-300 font-mono text-xs font-bold flex items-center gap-1.5 animate-pulse">
                                <Check className="w-3.5 h-3.5" />
                                <span>ЗАДАНИЕ ВЫПОЛНЕНО!</span>
                              </span>
                            ) : (
                              <span className="px-3 py-1 rounded-full bg-stone-800 text-stone-400 font-mono text-xs font-semibold">
                                В процессе настройки
                              </span>
                            )}
                          </div>
                        </div>

                        <p className="text-xs text-stone-300 leading-relaxed">
                          <strong>Цель:</strong> {mission.goal}
                        </p>

                        <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800 space-y-2">
                          <span className="text-xs font-mono text-stone-400 uppercase tracking-wider block">
                            Необходимые действия с печью:
                          </span>
                          <div className="space-y-2">
                            {status.steps.map((step, idx) => (
                              <div key={idx} className="flex items-center gap-2.5 text-xs">
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold ${
                                  step.isCompleted
                                    ? 'bg-emerald-500 text-stone-950'
                                    : 'bg-stone-800 text-stone-400 border border-stone-700'
                                }`}>
                                  {step.isCompleted ? '✓' : idx + 1}
                                </div>
                                <span className={step.isCompleted ? 'text-emerald-300 font-semibold' : 'text-stone-300'}>
                                  {step.text}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-600/30 text-xs text-amber-200 leading-relaxed">
                          💡 <strong>Почему это так устроено:</strong> {mission.explanation}
                        </div>

                        {/* Interactive Quick Action inside Mission */}
                        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-stone-800">
                          <button
                            onClick={() => setActiveTab('blueprint')}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wide transition-all shadow-md cursor-pointer"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                            <span>Перейти к рычагам на макете</span>
                          </button>

                          {status.completed && (
                            <button
                              onClick={() => {
                                playSuccessChime(soundEnabled);
                                setMissionToast(`🎉 Задание «${mission.title}» успешно сдано!`);
                                setTimeout(() => setMissionToast(null), 4000);
                              }}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wide transition-all shadow-md cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Подтвердить сдачу квеста</span>
                            </button>
                          )}
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}

              {/* Toast for Completed Mission */}
              {missionToast && (
                <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500 text-xs text-emerald-200 animate-fade-in flex items-center justify-between">
                  <span>{missionToast}</span>
                  <span className="font-mono text-[10px] text-emerald-400">+Очки Мастера начислены</span>
                </div>
              )}

              {/* Other Missions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {missionsList.map((m) => {
                  const isCur = activeMission === m.id;
                  const stat = checkMissionStatus(m.id);

                  return (
                    <div
                      key={m.id}
                      onClick={() => {
                        playWoodTap(soundEnabled);
                        setActiveMission(m.id);
                      }}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2.5 ${
                        isCur
                          ? 'bg-stone-900 border-amber-500/80 shadow-lg'
                          : 'bg-stone-950 border-stone-800/80 hover:border-stone-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-amber-400">
                          {m.badge}
                        </span>
                        {stat.completed && (
                          <span className="text-[11px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            <span>Готово</span>
                          </span>
                        )}
                      </div>

                      <h4 className="font-serif font-bold text-sm text-stone-100">
                        {m.title}
                      </h4>

                      <p className="text-xs text-stone-400 leading-relaxed">
                        {m.goal}
                      </p>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* TAB 3: STEAM TYPES */}
          {activeTab === 'steamTypes' && (
            <div className="space-y-6">
              <div className="rounded-2xl bg-amber-950/20 border border-amber-500/20 p-4 text-xs sm:text-sm text-stone-300 leading-relaxed">
                <span className="font-bold text-amber-400">«С легким паром!»</span> — это не просто тост, а физическое состояние воды в воздухе.
                Пар бывает принципиально разным по размеру водяных капель, температуре и влиянию на легкие.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Light Microdispersed Steam */}
                <div className="rounded-2xl bg-stone-900 border-2 border-emerald-500/50 p-5 space-y-4 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 px-3 py-1 bg-emerald-500 text-stone-950 text-[10px] font-bold uppercase tracking-wider rounded-bl-xl">
                    Золотой эталон русской бани
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-xl">
                      ✨
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-lg text-emerald-300">
                        Мелкодисперсный («Легкий») пар
                      </h3>
                      <div className="text-xs font-mono text-emerald-400">Размер частиц: менее 0.5 — 1 микрона</div>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-stone-300 leading-relaxed">
                    <p>
                      <strong>Как рождается:</strong> Вода подается через паровую пушку в самую глубину раскаленного ядра закрытой каменки при t=500°C–650°C.
                    </p>
                    <p>
                      <strong>Внешний вид:</strong> Практически <strong className="text-emerald-400">невидим глазу</strong>. Воздух в парной остается прозрачным, лишь слегка дрожит от тепловых преломлений.
                    </p>
                    <p>
                      <strong>Ощущения на теле:</strong> Мягкое обволакивающее тепло, глубокий прогрев мышц без ожога носоглотки и кожи. Дышится легко и свободно!
                    </p>
                  </div>
                </div>

                {/* Heavy Coarse Steam */}
                <div className="rounded-2xl bg-stone-900 border border-rose-500/40 p-5 space-y-4 shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-rose-500/20 flex items-center justify-center text-xl">
                      🌫️
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-lg text-rose-300">
                        Крупнодисперсный («Сырой / Тяжелый») пар
                      </h3>
                      <div className="text-xs font-mono text-rose-400">Размер частиц: более 5 — 15 микрон</div>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-stone-300 leading-relaxed">
                    <p>
                      <strong>Как рождается:</strong> Воду льют на остывшие внешние камни (t &lt; 200°C) или заливают открытую каменку избыточным объемом воды.
                    </p>
                    <p>
                      <strong>Внешний вид:</strong> Белый густой туман, взвесь крупных капель в воздухе.
                    </p>
                    <p>
                      <strong>Ощущения на теле:</strong> Обжигает уши и нос, давит на грудь, затрудняет дыхание. Капли оседают на коже горячей водяной пленкой («вареное тело»).
                    </p>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 4: INFRARED */}
          {activeTab === 'infrared' && (
            <div className="space-y-6">
              <div className="rounded-2xl bg-amber-950/20 border border-amber-500/20 p-4 text-xs sm:text-sm text-stone-300 leading-relaxed">
                Почему в одной бане голова звенит и тяжело дышать, а в другой ты словно перерождаешься? 
                Ответ в <strong className="text-amber-400">спектре инфракрасного излучения</strong> от печи!
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Short-wave IR */}
                <div className="rounded-2xl bg-stone-900 border border-rose-600/40 p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-rose-500/20 flex items-center justify-center text-xl">
                      🔴
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-base text-rose-300">
                        Коротковолновое жесткое ИК (λ &lt; 2.5 мкм)
                      </h4>
                      <div className="text-xs text-rose-400 font-mono">Источник: раскаленный металл (&gt; 250°C)</div>
                    </div>
                  </div>

                  <div className="space-y-2.5 text-xs text-stone-300 leading-relaxed">
                    <p>
                      <strong>Физика:</strong> Голая металлическая печь или неизолированная труба дымохода испускают короткие высокоэнергетические волны.
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-stone-300">
                      <li>Жжет верхний слой эпидермиса (эффект раскаленной сковороды).</li>
                      <li>Спазмирует капилляры вместо их плавного расширения.</li>
                      <li>Вызывает перегрев костей черепа, тяжесть в затылке и головную боль.</li>
                      <li>Выжигает кислород и подгорает пыль в воздухе.</li>
                    </ul>
                  </div>

                  <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-200">
                    ⚠️ Признак плохой печи: к ней невозможно подойти ближе метра — «жарит нестерпимо», а у полка при этом холодно.
                  </div>
                </div>

                {/* Long-wave IR */}
                <div className="rounded-2xl bg-stone-900 border border-amber-500/50 p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-xl">
                      🟡
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-base text-amber-300">
                        Длинноволновое мягкое ИК (λ = 8 — 14 мкм)
                      </h4>
                      <div className="text-xs text-amber-400 font-mono">Источник: камень и кирпич (55°C — 85°C)</div>
                    </div>
                  </div>

                  <div className="space-y-2.5 text-xs text-stone-300 leading-relaxed">
                    <p>
                      <strong>Физика:</strong> Тепло от массивного каменного саркофага (талькохлорит, жадеит, змеевик) или кирпичной кладки.
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-stone-300">
                      <li>Спектр волн точно совпадает с тепловым излучением самого человека (9.4 мкм, биорезонанс).</li>
                      <li>Проникает на глубину до 4–5 см прямо в мышечный корсет и суставы.</li>
                      <li>Снимает спазмы фасций, ускоряет лимфодренаж и расслабляет нервную систему.</li>
                      <li>Кожа не «горит», а равномерно потеет целебной росой.</li>
                    </ul>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/60 text-xs text-amber-200">
                    ✨ Золотое правило пармастера: «Металл греет камни внутри, камни делают легкий пар, а саркофаг греет парную мягким длинным ИК!»
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 5: CEREMONIES */}
          {activeTab === 'ceremonies' && (
            <div className="space-y-6">
              <div className="rounded-2xl bg-amber-950/20 border border-amber-500/20 p-4 text-xs sm:text-sm text-stone-300 leading-relaxed">
                <span className="font-bold text-amber-400">Паровой пирог (купол пара)</span> формируется под потолком, когда в парной нет конвекционных сквозняков. Пармастер черпает пар вениками сверху и укладывает его на гостя.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-stone-900 border border-stone-800 space-y-2">
                  <span className="font-bold text-amber-400">1. Зарождение под потолком</span>
                  <p className="text-stone-300 leading-relaxed">
                    Горячий перегретый пар легче воздуха. При подаче в пушку он мгновенно взмывает вверх и образует устойчивый слой жара толщиной 30–50 см под потолком.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-stone-900 border border-stone-800 space-y-2">
                  <span className="font-bold text-amber-400">2. Запрет на «мельницу»</span>
                  <p className="text-stone-300 leading-relaxed">
                    Грубая ошибка новичка — махать вениками как лопастями вертолета. Это разрушает пирог, перемешивает пар и делает воздух тяжелым. Пирог берегут!
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-stone-900 border border-stone-800 space-y-2">
                  <span className="font-bold text-amber-400">3. Черпание веником</span>
                  <p className="text-stone-300 leading-relaxed">
                    Мастер поднимает кончики веников в пирог, захватывает порцию горячего пара и легким волнообразным движением опускает её прямо на тело гостя.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: QUIZ */}
          {activeTab === 'quiz' && (
            <div className="space-y-6">
              <div className="rounded-2xl bg-amber-950/20 border border-amber-500/20 p-4 text-xs sm:text-sm text-stone-300 leading-relaxed flex items-center justify-between">
                <div>
                  <h3 className="font-serif font-bold text-amber-300 text-base">
                    Экзамен на знание физики печи и пара
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Ответь на 3 вопроса, чтобы закрепить понимание устройства печи и легкого пара!
                  </p>
                </div>
                {quizSubmitted && (
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-mono text-xs font-bold">
                    Проверено!
                  </span>
                )}
              </div>

              <div className="space-y-4">
                {quizQuestions.map((item, qIdx) => {
                  const userAnswer = quizAnswers[qIdx];
                  const isCorrect = userAnswer === item.correct;

                  return (
                    <div
                      key={qIdx}
                      className="rounded-2xl bg-stone-900 border border-stone-800 p-5 space-y-3"
                    >
                      <div className="font-serif font-bold text-sm text-stone-100 flex items-start gap-2">
                        <span className="text-amber-400 font-mono">0{qIdx + 1}.</span>
                        <span>{item.q}</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {item.options.map((opt, optIdx) => {
                          const isSelected = userAnswer === optIdx;
                          let btnStyle = 'bg-stone-950 border-stone-800 text-stone-300 hover:border-stone-700';

                          if (quizSubmitted) {
                            if (optIdx === item.correct) {
                              btnStyle = 'bg-emerald-950/60 border-emerald-500 text-emerald-200 font-semibold';
                            } else if (isSelected && !isCorrect) {
                              btnStyle = 'bg-rose-950/60 border-rose-500 text-rose-200';
                            } else {
                              btnStyle = 'bg-stone-950/40 border-stone-900 text-stone-500 opacity-60';
                            }
                          } else if (isSelected) {
                            btnStyle = 'bg-amber-500/20 border-amber-500 text-amber-200 font-semibold';
                          }

                          return (
                            <button
                              key={optIdx}
                              onClick={() => handleAnswer(qIdx, optIdx)}
                              className={`p-3 rounded-xl border text-xs text-left transition-all cursor-pointer ${btnStyle}`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>

                      {quizSubmitted && (
                        <div className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                          isCorrect ? 'bg-emerald-950/30 text-emerald-200 border border-emerald-800/40' : 'bg-rose-950/30 text-rose-200 border border-rose-800/40'
                        }`}>
                          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                          <span>{item.explain}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                {!quizSubmitted ? (
                  <button
                    onClick={handleCheckQuiz}
                    disabled={Object.keys(quizAnswers).length < quizQuestions.length}
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-stone-950 font-bold text-xs uppercase tracking-wide transition-all shadow-md cursor-pointer"
                  >
                    Проверить ответы
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setQuizSubmitted(false);
                      setQuizAnswers({});
                    }}
                    className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition-all border border-stone-700 cursor-pointer"
                  >
                    Пройти заново
                  </button>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Modal Bottom Footer */}
        <div className={`bg-stone-900/95 border-t border-stone-800 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 transition-all duration-300 ${
          showIntroPopup ? 'filter blur-[1px] opacity-40 pointer-events-none select-none' : ''
        }`}>
          <div className="flex items-center gap-2 text-xs text-stone-400">
            <span>💡 Поддувало управляет огнем, шибер регулирует тягу дымохода, заслонки конвекции греют парную.</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                handleStovePour('closed');
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
            >
              <Droplets className="w-4 h-4" />
              <span>Подать легкий пар в парную (+8%)</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium transition-all border border-stone-700 cursor-pointer"
            >
              Понятно, вернуться в парную
            </button>
          </div>
        </div>

        {/* INFORMATIVE INTRO MODAL OVER INACTIVE STOVE BLUEPRINT */}
        {showIntroPopup && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
            <div className="relative w-full max-w-lg rounded-3xl border-2 border-amber-500/70 bg-stone-950 p-6 sm:p-7 shadow-2xl text-center space-y-5 animate-scale-up">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-3xl shadow-inner">
                🪵
              </div>

              <div className="space-y-3">
                <div className="inline-block px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-[11px] font-bold uppercase tracking-wider">
                  Сердце русской бани
                </div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-amber-100 leading-snug">
                  В парной кнопок нет. Давай разберемся с устройством печи!
                </h3>
                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed text-balance">
                  «Наводи курсор на узлы печи для визуализации коротковолнового и длинноволнового ИК-излучения, дымовой тяги и циркуляции воздуха. Регулируй шибер, поддувало и конвекцию своими руками!»
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setShowIntroPopup(false)}
                  className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-95 text-stone-950 font-bold text-sm uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  Понятно
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
