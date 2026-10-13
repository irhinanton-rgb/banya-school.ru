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
import { COMBUSTION_MODES_INFO, CombustionModeDetails } from '../../data/combustionModesData';
import { BadgeId } from '../../types/banya';
import confetti from '../../utils/confetti';

interface StoveEducationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplySteam: (type: 'closed' | 'open', humidityBoost: number, tempBoost: number) => void;
  soundEnabled: boolean;
  onGrantReward?: (xp: number, badgeId?: BadgeId) => void;
  unlockedBadges?: BadgeId[];
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
  onGrantReward,
  unlockedBadges = [],
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

  // Combustion Mode Info Popup State
  const [activeModePopup, setActiveModePopup] = useState<CombustionModeDetails | null>(null);

  // Reset intro popup whenever modal is opened
  useEffect(() => {
    if (isOpen) {
      setShowIntroPopup(true);
      setActiveModePopup(null);
    }
  }, [isOpen]);

  // Visual effects
  const [steamAnimation, setSteamAnimation] = useState<'closed' | 'open' | 'herbal' | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [rewardClaimed, setRewardClaimed] = useState<boolean>(false);

  // Steam Type Simulator State (Мелкодисперсный vs Крупный пар)
  const [steamSimMode, setSteamSimMode] = useState<'closed' | 'open'>('closed');
  const [steamSimPoured, setSteamSimPoured] = useState<boolean>(false);

  // Infrared Simulator State (Короткие vs Длинные ИК-волны)
  const [irSimMode, setIrSimMode] = useState<'sarcophagus' | 'bare_metal'>('sarcophagus');

  // Track interactions across all 3 stove simulations (blueprint, steamTypes, infrared)
  const [interactedSims, setInteractedSims] = useState<{
    blueprint: boolean;
    steamTypes: boolean;
    infrared: boolean;
  }>({
    blueprint: false,
    steamTypes: false,
    infrared: false,
  });

  const markSimInteracted = (sim: 'blueprint' | 'steamTypes' | 'infrared') => {
    setInteractedSims((prev) => (prev[sim] ? prev : { ...prev, [sim]: true }));
  };

  const completedSimsCount =
    (interactedSims.blueprint ? 1 : 0) +
    (interactedSims.steamTypes ? 1 : 0) +
    (interactedSims.infrared ? 1 : 0);
  const isExamUnlocked = completedSimsCount === 3;

  const handleTestSteamPour = (target: 'closed' | 'open') => {
    markSimInteracted('steamTypes');
    setSteamSimMode(target);
    setSteamSimPoured(true);
    if (target === 'closed') {
      playExplosiveSteamSound(soundEnabled);
    } else {
      playSteamSound(soundEnabled);
    }
    setTimeout(() => setSteamSimPoured(false), 3200);
  };

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
    markSimInteracted('blueprint');
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

  const handleSelectCombustionMode = (mode: FiringMode) => {
    markSimInteracted('blueprint');
    applyPresetMode(mode);
    if (COMBUSTION_MODES_INFO[mode]) {
      setActiveModePopup(COMBUSTION_MODES_INFO[mode]);
    }
  };

  if (!isOpen) return null;

  const handleStovePour = (type: 'closed' | 'open' | 'herbal') => {
    markSimInteracted('blueprint');
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
    let allCorrect = true;
    quizQuestions.forEach((q, idx) => {
      if (quizAnswers[idx] !== q.correct) {
        allCorrect = false;
      }
    });

    if (allCorrect) {
      playSuccessChime(soundEnabled);
      try {
        confetti({
          particleCount: 90,
          spread: 75,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }
      if (!rewardClaimed) {
        setRewardClaimed(true);
        onGrantReward?.(150, 'stove_master_artifact');
      }
    } else {
      playWoodTap(soundEnabled);
    }
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

            {/* Mission tab button hidden per user request; mechanics and handler kept in code */}
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

            {/* Кнопка парового пирога скрыта из интерфейса по запросу пользователя, но сохранена в коде */}
            <button
              onClick={() => setActiveTab('ceremonies')}
              className="hidden"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Паровой пирог и церемонии</span>
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
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-wider font-mono">
                    Режимы работы печи:
                  </span>
                  
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      onClick={() => handleSelectCombustionMode('fast_burn')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                        currentMode === 'fast_burn'
                          ? 'bg-rose-500 text-white shadow-md'
                          : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                      }`}
                      title="Нажмите для включения и просмотра подробной информации о режиме"
                    >
                      <span>🔥 Быстрое горение</span>
                      <Info className="w-3 h-3 text-rose-300/80 hover:text-white shrink-0" />
                    </button>

                    <button
                      onClick={() => handleSelectCombustionMode('smoldering')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                        currentMode === 'smoldering'
                          ? 'bg-amber-600 text-white shadow-md'
                          : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                      }`}
                      title="Нажмите для включения и просмотра подробной информации о режиме"
                    >
                      <span>🪵 Режим тления</span>
                      <Info className="w-3 h-3 text-amber-300/80 hover:text-white shrink-0" />
                    </button>

                    <button
                      onClick={() => handleSelectCombustionMode('heat_up')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                        currentMode === 'heat_up'
                          ? 'bg-cyan-600 text-white shadow-md'
                          : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                      }`}
                      title="Нажмите для включения и просмотра подробной информации о режиме"
                    >
                      <span>♨️ Прогрев парной</span>
                      <Info className="w-3 h-3 text-cyan-300/80 hover:text-white shrink-0" />
                    </button>

                    <button
                      onClick={() => handleSelectCombustionMode('steaming')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                        currentMode === 'steaming'
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                      }`}
                      title="Нажмите для включения и просмотра подробной информации о режиме"
                    >
                      <span>✨ Режим парения</span>
                      <Info className="w-3 h-3 text-emerald-300/80 hover:text-white shrink-0" />
                    </button>
                  </div>
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
                      {hoveredElement === 'core' && '🔍 Наведено на ЯДРО: Закрытая каменка с раскаленными камнями (450–600°C) для легкого пара!'}
                      {hoveredElement === 'sarcophagus' && '🔍 Наведено на САРКОФАГ: Каменная облицовка для защиты парной от перегрева и накопления тепла!'}
                      {hoveredElement === 'chimney' && `🔍 Наведено на ДЫМОХОД: Дым из топки уходит через шибер (тяга ${draftPercent}%).`}
                      {hoveredElement === 'convection' && (convectionOpen ? '🔍 Заслонки конвекции ОТКРЫТЫ: Холодный воздух с пола прогревается и взмывает вверх!' : '🔍 Заслонки конвекции ЗАКРЫТЫ: Циркуляция остановлена, паровой пирог в безопасности!')}
                      {hoveredElement === 'firebox' && `🔍 Наведено на ТОПКУ: Пламя ${flameIntensity}%, приток O₂ регулируется поддувалом!`}
                      {!hoveredElement && 'Наведите на ядро, саркофаг, трубу или заслонки для просмотра физики печи'}
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
                          markSimInteracted('blueprint');
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
                          markSimInteracted('blueprint');
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
                          markSimInteracted('blueprint');
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
                      <div>
                        <h4 className="font-serif font-bold text-lg text-amber-300">
                          {currentPartData.name}
                        </h4>
                        <span className="text-xs font-mono text-rose-400 font-semibold">
                          Рабочая температура: {currentPartData.temp}
                        </span>
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
                      Узлы банной печи:
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {stoveParts.map((part) => (
                        <button
                          key={part.id}
                          onClick={() => {
                            playWoodTap(soundEnabled);
                            setSelectedPart(part.id);
                            markSimInteracted('blueprint');
                          }}
                          className={`flex items-center px-3 py-2 rounded-xl text-xs text-left transition-all border cursor-pointer ${
                            selectedPart === part.id
                              ? 'bg-amber-500/20 border-amber-500 text-amber-200 font-bold'
                              : 'bg-stone-900/60 border-stone-800 text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                          }`}
                        >
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

                      <div className="flex items-center justify-between pt-2 border-t border-stone-800/80">
                        {(() => {
                          const modeKey = m.id === 'mission_ignite' ? 'fast_burn' : m.id.replace('mission_', '');
                          const modeInfo = COMBUSTION_MODES_INFO[modeKey];
                          if (!modeInfo) return null;
                          return (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                playWoodTap(soundEnabled);
                                setActiveModePopup(modeInfo);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-stone-900 hover:bg-stone-800 text-amber-300 text-[11px] font-mono flex items-center gap-1.5 transition-all border border-amber-500/30 cursor-pointer shadow-sm"
                            >
                              <Info className="w-3.5 h-3.5 text-amber-400" />
                              <span>Подробнее о режиме</span>
                            </button>
                          );
                        })()}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* TAB 3: STEAM TYPES */}
          {activeTab === 'steamTypes' && (
            <div className="space-y-6">
              <div className="rounded-2xl bg-amber-950/20 border border-amber-500/20 p-4 text-xs sm:text-sm text-stone-300 leading-relaxed flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="font-bold text-amber-400 font-serif text-base block mb-0.5">«С легким паром!» — Физика дисперсности пара</span>
                  <span>Пар бывает принципиально разным по размеру водяных капель, температуре и влиянию на организм. Проверьте поведение пара на интерактивном макете печи:</span>
                </div>
              </div>

              {/* INTERACTIVE STOVE STEAM SIMULATOR MOCKUP */}
              <div className="rounded-3xl bg-stone-950 border border-stone-800 p-5 space-y-5 shadow-2xl">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-800">
                  <div className="flex items-center gap-2">
                    <Droplets className="w-5 h-5 text-cyan-400" />
                    <span className="font-serif font-bold text-base text-stone-100">
                      Интерактивный макет печи: Симуляция рождения пара
                    </span>
                  </div>

                  {/* Mode Toggles */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => handleTestSteamPour('closed')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 border ${
                        steamSimMode === 'closed'
                          ? 'bg-emerald-500 text-stone-950 border-emerald-400 shadow-md font-bold'
                          : 'bg-stone-900 text-stone-300 border-stone-800 hover:bg-stone-800'
                      }`}
                    >
                      <span>💥 Закрытая каменка (550°C)</span>
                      <span className="text-[10px] opacity-80">Легкий пар</span>
                    </button>

                    <button
                      onClick={() => handleTestSteamPour('open')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 border ${
                        steamSimMode === 'open'
                          ? 'bg-rose-500 text-white border-rose-400 shadow-md font-bold'
                          : 'bg-stone-900 text-stone-300 border-stone-800 hover:bg-stone-800'
                      }`}
                    >
                      <span>♨️ Открытые камни (180°C)</span>
                      <span className="text-[10px] opacity-80">Сырой пар</span>
                    </button>
                  </div>
                </div>

                {/* Simulator Display Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                  
                  {/* Simplified Stove SVG Graphic */}
                  <div className="lg:col-span-6 flex flex-col items-center">
                    <div className="w-full max-w-[360px] aspect-[4/5] relative bg-stone-900/60 rounded-2xl border border-stone-800 p-4 flex flex-col items-center justify-between overflow-hidden shadow-inner">
                      
                      {/* Ceiling / Steam Zone Tag */}
                      <div className="w-full py-1 px-3 rounded-lg bg-stone-950/80 border border-stone-800/80 flex items-center justify-between text-[11px] font-mono z-10">
                        <span className="text-stone-400">Зона под потолком (Купол):</span>
                        <span className={`font-bold ${steamSimMode === 'closed' ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {steamSimMode === 'closed' ? 'Паровой пирог (чистый купол)' : 'Сырой оседающий туман'}
                        </span>
                      </div>

                      {/* SVG Canvas */}
                      <svg viewBox="0 0 320 360" className="w-full h-full my-auto select-none overflow-visible">
                        <defs>
                          <radialGradient id="simCoreRadial" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="#fef08a" />
                            <stop offset="40%" stopColor="#f59e0b" />
                            <stop offset="80%" stopColor="#dc2626" />
                            <stop offset="100%" stopColor="#7f1d1d" />
                          </radialGradient>

                          <linearGradient id="simSarcophagusGrad" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#292524" />
                            <stop offset="50%" stopColor="#44403c" />
                            <stop offset="100%" stopColor="#292524" />
                          </linearGradient>

                          <linearGradient id="simOpenStonesGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#78716c" />
                            <stop offset="100%" stopColor="#57534e" />
                          </linearGradient>
                        </defs>

                        {/* Ceiling Line */}
                        <line x1="20" y1="25" x2="300" y2="25" stroke="#44403c" strokeWidth="2" strokeDasharray="4 4" />
                        <text x="30" y="20" fill="#78716c" fontSize="9" fontFamily="monospace">ПОТОЛОК ПАРНОЙ</text>

                        {/* --- DYNAMIC STEAM CLOUD SIMULATION --- */}
                        {steamSimMode === 'closed' ? (
                          /* Microdispersed Fine Steam (Invisible, rising rapidly to ceiling, slight shimmers) */
                          <g className={steamSimPoured ? 'animate-pulse' : ''}>
                            {/* Fine Shimmer Vapor Cushion under ceiling */}
                            <ellipse cx="160" cy="55" rx="130" ry="24" fill="#10b981" fillOpacity={steamSimPoured ? '0.25' : '0.12'} />
                            <ellipse cx="160" cy="52" rx="100" ry="16" fill="#34d399" fillOpacity={steamSimPoured ? '0.35' : '0.18'} />

                            {/* Rising vapor particles streams from closed core nozzle */}
                            <path
                              d="M160 135 Q145 90 120 60"
                              fill="none"
                              stroke="#6ee7b7"
                              strokeWidth="2"
                              strokeDasharray="4 3"
                              strokeOpacity={steamSimPoured ? '0.9' : '0.6'}
                            />
                            <path
                              d="M160 135 Q160 85 160 55"
                              fill="none"
                              stroke="#a7f3d0"
                              strokeWidth="2.5"
                              strokeDasharray="6 4"
                              strokeOpacity={steamSimPoured ? '1' : '0.7'}
                            />
                            <path
                              d="M160 135 Q175 90 200 60"
                              fill="none"
                              stroke="#6ee7b7"
                              strokeWidth="2"
                              strokeDasharray="4 3"
                              strokeOpacity={steamSimPoured ? '0.9' : '0.6'}
                            />

                            {/* Sparkle micro-droplets */}
                            <circle cx="130" cy="52" r="2" fill="#ecfdf5" opacity="0.9" />
                            <circle cx="160" cy="46" r="2.5" fill="#ffffff" opacity="1" />
                            <circle cx="190" cy="54" r="2" fill="#ecfdf5" opacity="0.9" />
                            <circle cx="230" cy="50" r="1.5" fill="#a7f3d0" opacity="0.8" />
                            <circle cx="90" cy="52" r="1.5" fill="#a7f3d0" opacity="0.8" />

                            <text x="160" y="55" textAnchor="middle" fill="#34d399" fontSize="10" fontWeight="bold" fontFamily="monospace">
                              ЛЕГКИЙ КУПОЛ (ПИРОГ ПАРА)
                            </text>
                          </g>
                        ) : (
                          /* Coarse Heavy Wet Steam (Dense white thick fog cloud, dropping down) */
                          <g className={steamSimPoured ? 'animate-bounce' : ''}>
                            {/* Heavy foggy cloud over open stones */}
                            <ellipse cx="160" cy="115" rx="110" ry="35" fill="#f87171" fillOpacity={steamSimPoured ? '0.45' : '0.25'} />
                            <ellipse cx="160" cy="120" rx="90" ry="28" fill="#ffffff" fillOpacity={steamSimPoured ? '0.75' : '0.5'} />
                            <ellipse cx="120" cy="135" rx="55" ry="25" fill="#fca5a5" fillOpacity="0.4" />
                            <ellipse cx="200" cy="135" rx="55" ry="25" fill="#fca5a5" fillOpacity="0.4" />

                            {/* Heavy Droplet Circles */}
                            <circle cx="115" cy="130" r="4.5" fill="#ffffff" stroke="#ef4444" strokeWidth="1" />
                            <circle cx="140" cy="122" r="5" fill="#ffffff" stroke="#ef4444" strokeWidth="1" />
                            <circle cx="170" cy="124" r="6" fill="#ffffff" stroke="#ef4444" strokeWidth="1.5" />
                            <circle cx="195" cy="132" r="4" fill="#ffffff" stroke="#ef4444" strokeWidth="1" />
                            <circle cx="160" cy="142" r="5" fill="#ffffff" stroke="#ef4444" strokeWidth="1" />

                            <text x="160" y="122" textAnchor="middle" fill="#991b1b" fontSize="10" fontWeight="bold" fontFamily="monospace">
                              СЫРОЙ БЕЛЫЙ ТУМАН (ОСЕДАЕТ ВНИЗ)
                            </text>
                          </g>
                        )}

                        {/* --- STOVE STRUCTURE --- */}
                        {/* Chimney Pipe */}
                        <rect x="145" y="45" width="30" height="95" fill="#57534e" stroke="#78716c" strokeWidth="1.5" rx="3" />

                        {/* Outer Stone Sarcophagus Casing */}
                        <rect x="70" y="140" width="180" height="190" rx="16" fill="url(#simSarcophagusGrad)" stroke="#57534e" strokeWidth="2" />

                        {/* Open Top Stone Tray (Открытая каменка) */}
                        <g
                          className="cursor-pointer"
                          onClick={() => handleTestSteamPour('open')}
                        >
                          <rect
                            x="85"
                            y="148"
                            width="150"
                            height="34"
                            rx="8"
                            fill={steamSimMode === 'open' ? '#451a03' : 'url(#simOpenStonesGrad)'}
                            stroke={steamSimMode === 'open' ? '#f87171' : '#78716c'}
                            strokeWidth={steamSimMode === 'open' ? 2 : 1}
                          />
                          {/* Open Stones representation */}
                          <circle cx="105" cy="165" r="9" fill="#78716c" stroke="#57534e" />
                          <circle cx="125" cy="163" r="10" fill="#a8a29e" stroke="#57534e" />
                          <circle cx="145" cy="166" r="8" fill="#78716c" stroke="#57534e" />
                          <circle cx="165" cy="162" r="11" fill="#a8a29e" stroke="#57534e" />
                          <circle cx="185" cy="165" r="9" fill="#78716c" stroke="#57534e" />
                          <circle cx="205" cy="163" r="10" fill="#a8a29e" stroke="#57534e" />
                          <text x="160" y="158" textAnchor="middle" fill="#fed7aa" fontSize="8" fontWeight="bold" fontFamily="monospace">
                            ОТКРЫТЫЕ КАМНИ (180°C)
                          </text>
                        </g>

                        {/* Steam Funnel / Gun into Core */}
                        <path d="M152 140 L168 140 L163 195 L157 195 Z" fill="#94a3b8" stroke="#cbd5e1" strokeWidth="1" />
                        <ellipse cx="160" cy="140" rx="8" ry="3" fill="#cbd5e1" />

                        {/* Closed Superheated Core (Закрытая каменка) */}
                        <g
                          className="cursor-pointer"
                          onClick={() => handleTestSteamPour('closed')}
                        >
                          <rect
                            x="95"
                            y="190"
                            width="130"
                            height="85"
                            rx="12"
                            fill="url(#simCoreRadial)"
                            stroke={steamSimMode === 'closed' ? '#34d399' : '#f59e0b'}
                            strokeWidth={steamSimMode === 'closed' ? 3 : 1.5}
                            className={steamSimMode === 'closed' ? 'filter drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]' : ''}
                          />

                          {/* Glowing rocks inside core */}
                          <circle cx="120" cy="225" r="12" fill="#b91c1c" stroke="#fef08a" strokeWidth="1.5" />
                          <circle cx="145" cy="220" r="14" fill="#ea580c" stroke="#fef08a" strokeWidth="1.5" />
                          <circle cx="175" cy="223" r="13" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
                          <circle cx="200" cy="226" r="11" fill="#dc2626" stroke="#fef08a" strokeWidth="1" />
                          <circle cx="135" cy="250" r="13" fill="#ea580c" stroke="#fef08a" strokeWidth="1.5" />
                          <circle cx="165" cy="252" r="15" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
                          <circle cx="190" cy="248" r="12" fill="#b91c1c" stroke="#fef08a" strokeWidth="1.5" />

                          <text x="160" y="210" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold" fontFamily="monospace">
                            ЗАКРЫТОЕ ЯДРО (550°C)
                          </text>
                        </g>

                        {/* Firebox below */}
                        <rect x="105" y="285" width="110" height="35" rx="6" fill="#1c1917" stroke="#44403c" strokeWidth="1.5" />
                        <text x="160" y="306" textAnchor="middle" fill="#f87171" fontSize="9" fontWeight="bold">
                          ТОПКА (ДРОВА)
                        </text>

                        {/* Water Ladle Splash Action Indicator */}
                        {steamSimPoured && (
                          <g className="animate-fade-in">
                            <text
                              x="160"
                              y={steamSimMode === 'closed' ? 185 : 145}
                              textAnchor="middle"
                              fill="#38bdf8"
                              fontSize="12"
                              fontWeight="bold"
                            >
                              💧 ПОДАЧА ВОДЫ!
                            </text>
                          </g>
                        )}
                      </svg>

                      {/* Interactive Test Button */}
                      <button
                        onClick={() => handleTestSteamPour(steamSimMode)}
                        disabled={steamSimPoured}
                        className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                          steamSimMode === 'closed'
                            ? 'bg-emerald-500 hover:bg-emerald-400 text-stone-950 active:scale-95'
                            : 'bg-rose-500 hover:bg-rose-400 text-white active:scale-95'
                        } disabled:opacity-50`}
                      >
                        <Droplets className="w-4 h-4" />
                        <span>
                          {steamSimPoured ? 'Испарение воды...' : `Подать ковш (${steamSimMode === 'closed' ? 'В закрытое ядро' : 'На открытые камни'})`}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Physics & Telemetry Dashboard */}
                  <div className="lg:col-span-6 space-y-3.5">
                    <div className="grid grid-cols-2 gap-3">
                      {/* Stat 1: Droplet size */}
                      <div className={`p-3.5 rounded-2xl border transition-all ${
                        steamSimMode === 'closed'
                          ? 'bg-emerald-950/30 border-emerald-500/40'
                          : 'bg-rose-950/30 border-rose-500/40'
                      }`}>
                        <div className="text-[10px] font-mono text-stone-400 uppercase">Размер микрокапли:</div>
                        <div className={`text-xl font-bold font-mono mt-0.5 ${
                          steamSimMode === 'closed' ? 'text-emerald-300' : 'text-rose-400'
                        }`}>
                          {steamSimMode === 'closed' ? '< 0.5 — 1 мкм' : '15 — 30+ мкм'}
                        </div>
                        <div className="text-[11px] text-stone-300 mt-1">
                          {steamSimMode === 'closed' ? 'Невидимый газообразный пар' : 'Крупная взвесь капель тумана'}
                        </div>
                      </div>

                      {/* Stat 2: Core Temp */}
                      <div className={`p-3.5 rounded-2xl border transition-all ${
                        steamSimMode === 'closed'
                          ? 'bg-emerald-950/30 border-emerald-500/40'
                          : 'bg-rose-950/30 border-rose-500/40'
                      }`}>
                        <div className="text-[10px] font-mono text-stone-400 uppercase">Температура камней:</div>
                        <div className={`text-xl font-bold font-mono mt-0.5 ${
                          steamSimMode === 'closed' ? 'text-emerald-300' : 'text-rose-400'
                        }`}>
                          {steamSimMode === 'closed' ? '500°C — 600°C' : '160°C — 200°C'}
                        </div>
                        <div className="text-[11px] text-stone-300 mt-1">
                          {steamSimMode === 'closed' ? 'Раскаленное ядро закрытой каменки' : 'Остывшие наружные камни'}
                        </div>
                      </div>
                    </div>

                    {/* Behavior Description */}
                    <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 space-y-2 text-xs">
                      <div className="font-semibold text-amber-300 flex items-center gap-1.5 text-xs">
                        <span>🔬 Физика поведения в парной:</span>
                      </div>
                      <p className="text-stone-300 leading-relaxed">
                        {steamSimMode === 'closed' ? (
                          <span>
                            Вода мгновенно взрывается в раскаленном ядре и выходит наружу в виде перегретого ультрамелкого пара. 
                            Он стрелой взмывает к потолку и формирует плотный, сухой <strong className="text-emerald-400">паровой купол (пирог)</strong>. Внизу у полка атмосфера остается прозрачной и свежей, дышать легко.
                          </span>
                        ) : (
                          <span>
                            Вода медленно шипит на остывших камнях, кипит крупными брызгами и выбрасывает тяжелый <strong className="text-rose-400">сырой туман</strong>. 
                            Крупные капли не могут подняться в купол и оседают на коже обжигающей мокрой пленкой, затрудняя потоотделение и обжигая носоглотку.
                          </span>
                        )}
                      </p>
                    </div>

                    {/* Sensory effect on human body */}
                    <div className={`p-3.5 rounded-2xl border text-xs leading-relaxed ${
                      steamSimMode === 'closed'
                        ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                        : 'bg-rose-950/20 border-rose-500/30 text-rose-200'
                    }`}>
                      <span className="font-bold block mb-1">
                        {steamSimMode === 'closed' ? '✅ Ощущения гостя: Абсолютное блаженство' : '⚠️ Ощущения гостя: Обжигающий дискомфорт'}
                      </span>
                      {steamSimMode === 'closed' ? (
                        <span>Шелковистое бархатное тепло. Веник захватывает пар из-под потолка и опускает на тело мягкой целебной волной без жжения.</span>
                      ) : (
                        <span>Эффект «мокрой бани» или «вареного рака»: горячо ушам, тяжело легким, хочется немедленно упасть на пол или выбежать.</span>
                      )}
                    </div>
                  </div>

                </div>
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
                      <div className="text-xs font-mono text-rose-400">Размер частиц: более 15 — 30 микрон</div>
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
              <div className="rounded-2xl bg-amber-950/20 border border-amber-500/20 p-4 text-xs sm:text-sm text-stone-300 leading-relaxed flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="font-bold text-amber-400 font-serif text-base block mb-0.5">Спектр ИК-излучения печи</span>
                  <span>Почему в одной бане голова звенит и тяжело дышать, а в другой ты словно перерождаешься? Исследуйте разницу между голой металлической печью и каменным саркофагом на интерактивном макете:</span>
                </div>
              </div>

              {/* INTERACTIVE STOVE INFRARED SIMULATOR MOCKUP */}
              <div className="rounded-3xl bg-stone-950 border border-stone-800 p-5 space-y-5 shadow-2xl">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-800">
                  <div className="flex items-center gap-2">
                    <Radio className="w-5 h-5 text-amber-400" />
                    <span className="font-serif font-bold text-base text-stone-100">
                      Интерактивный макет печи: Симуляция ИК-излучения
                    </span>
                  </div>

                  {/* Mode Toggles */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => {
                        setIrSimMode('sarcophagus');
                        markSimInteracted('infrared');
                      }}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 border ${
                        irSimMode === 'sarcophagus'
                          ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-md font-bold'
                          : 'bg-stone-900 text-stone-300 border-stone-800 hover:bg-stone-800'
                      }`}
                    >
                      <span>🟡 Каменный саркофаг (65°C)</span>
                      <span className="text-[10px] opacity-80">Мягкое ИК</span>
                    </button>

                    <button
                      onClick={() => {
                        setIrSimMode('bare_metal');
                        markSimInteracted('infrared');
                      }}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 border ${
                        irSimMode === 'bare_metal'
                          ? 'bg-rose-500 text-white border-rose-400 shadow-md font-bold'
                          : 'bg-stone-900 text-stone-300 border-stone-800 hover:bg-stone-800'
                      }`}
                    >
                      <span>🔴 Голый металл (320°C)</span>
                      <span className="text-[10px] opacity-80">Жесткое ИК</span>
                    </button>
                  </div>
                </div>

                {/* Simulator Display Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                  
                  {/* Simplified Stove SVG Graphic with IR wave propagation */}
                  <div className="lg:col-span-6 flex flex-col items-center">
                    <div className="w-full max-w-[360px] aspect-[4/5] relative bg-stone-900/60 rounded-2xl border border-stone-800 p-4 flex flex-col items-center justify-between overflow-hidden shadow-inner">
                      
                      {/* Radiation Status Tag */}
                      <div className="w-full py-1 px-3 rounded-lg bg-stone-950/80 border border-stone-800/80 flex items-center justify-between text-[11px] font-mono z-10">
                        <span className="text-stone-400">Характер излучения:</span>
                        <span className={`font-bold ${irSimMode === 'sarcophagus' ? 'text-amber-400' : 'text-rose-400'}`}>
                          {irSimMode === 'sarcophagus' ? 'Длинноволновое (λ = 8–14 мкм)' : 'Коротковолновое (λ < 2.5 мкм)'}
                        </span>
                      </div>

                      {/* SVG Canvas */}
                      <svg viewBox="0 0 320 360" className="w-full h-full my-auto select-none overflow-visible">
                        <defs>
                          <radialGradient id="irGlowHot" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
                            <stop offset="70%" stopColor="#b91c1c" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#7f1d1d" stopOpacity="0" />
                          </radialGradient>

                          <radialGradient id="irGlowSoft" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.6" />
                            <stop offset="60%" stopColor="#d97706" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#78350f" stopOpacity="0" />
                          </radialGradient>
                        </defs>

                        {/* --- DYNAMIC IR WAVE ANIMATION --- */}
                        {irSimMode === 'sarcophagus' ? (
                          /* Soft Long-wave IR: Broad, harmonic golden undulating arcs enveloping the space */
                          <g className="animate-pulse">
                            <circle cx="160" cy="220" r="145" fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="10 8" opacity="0.5" />
                            <circle cx="160" cy="220" r="120" fill="none" stroke="#fbbf24" strokeWidth="2.5" strokeDasharray="8 6" opacity="0.7" />
                            <circle cx="160" cy="220" r="95" fill="none" stroke="#fef08a" strokeWidth="2" strokeDasharray="6 4" opacity="0.85" />
                            
                            {/* Gentle radiation aura */}
                            <circle cx="160" cy="220" r="110" fill="url(#irGlowSoft)" />

                            {/* Wavelength wave diagram */}
                            <path
                              d="M210 200 Q235 185 260 200 T310 200"
                              fill="none"
                              stroke="#fbbf24"
                              strokeWidth="2.5"
                            />
                            <text x="260" y="180" textAnchor="middle" fill="#fde68a" fontSize="8" fontWeight="bold" fontFamily="monospace">
                              λ = 9.4 мкм (Биорезонанс)
                            </text>
                          </g>
                        ) : (
                          /* Harsh Short-wave IR: Sharp, fast jagged red spikes striking outward violently */
                          <g className="animate-pulse">
                            {/* Fast sharp jagged wave rectangles */}
                            <rect x="50" y="125" width="220" height="190" rx="14" fill="none" stroke="#ef4444" strokeWidth="3" strokeDasharray="5 3" opacity="0.9" />
                            <rect x="35" y="110" width="250" height="220" rx="20" fill="none" stroke="#dc2626" strokeWidth="2" strokeDasharray="4 4" opacity="0.75" />
                            <rect x="20" y="95" width="280" height="250" rx="26" fill="none" stroke="#f87171" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />

                            {/* Aggressive heat aura */}
                            <circle cx="160" cy="220" r="115" fill="url(#irGlowHot)" />

                            {/* Jagged high-frequency spike wave diagram */}
                            <path
                              d="M210 200 L220 185 L230 215 L240 185 L250 215 L260 185 L270 200"
                              fill="none"
                              stroke="#ef4444"
                              strokeWidth="2"
                            />
                            <text x="260" y="175" textAnchor="middle" fill="#fca5a5" fontSize="8" fontWeight="bold" fontFamily="monospace">
                              λ &lt; 2.5 мкм (Жгучее ИК)
                            </text>
                          </g>
                        )}

                        {/* --- STOVE GRAPHIC BODY --- */}
                        {/* Chimney Pipe */}
                        <rect x="145" y="45" width="30" height="95" fill={irSimMode === 'bare_metal' ? '#b91c1c' : '#57534e'} stroke={irSimMode === 'bare_metal' ? '#ef4444' : '#78716c'} strokeWidth="1.5" rx="3" />
                        {irSimMode === 'bare_metal' && (
                          <text x="160" y="95" textAnchor="middle" fill="#ffffff" fontSize="7" fontWeight="bold">
                            РАСКАЛЕНАЯ ТРУБА (400°C)
                          </text>
                        )}

                        {irSimMode === 'sarcophagus' ? (
                          /* Stone Sarcophagus cladding */
                          <g>
                            <rect x="75" y="140" width="170" height="175" rx="14" fill="#292524" stroke="#d97706" strokeWidth="3" />
                            {/* Stone Tile Texture lines */}
                            <line x1="75" y1="195" x2="245" y2="195" stroke="#44403c" strokeWidth="1.5" />
                            <line x1="75" y1="250" x2="245" y2="250" stroke="#44403c" strokeWidth="1.5" />
                            <line x1="160" y1="140" x2="160" y2="195" stroke="#44403c" strokeWidth="1.5" />
                            <line x1="120" y1="195" x2="120" y2="250" stroke="#44403c" strokeWidth="1.5" />
                            <line x1="200" y1="195" x2="200" y2="250" stroke="#44403c" strokeWidth="1.5" />
                            
                            <text x="160" y="170" textAnchor="middle" fill="#fbbf24" fontSize="10" fontWeight="bold" fontFamily="monospace">
                              КАМЕННЫЙ САРКОФАГ
                            </text>
                            <text x="160" y="225" textAnchor="middle" fill="#d6d3d1" fontSize="9">
                              Талькохлорит / Жадеит
                            </text>
                            <text x="160" y="280" textAnchor="middle" fill="#fbbf24" fontSize="10" fontWeight="bold">
                              Температура стенки: 65°C
                            </text>
                          </g>
                        ) : (
                          /* Bare Metal Stove casing (Red-hot thin sheet metal) */
                          <g>
                            <rect x="80" y="140" width="160" height="175" rx="6" fill="#991b1b" stroke="#ef4444" strokeWidth="3" />
                            <rect x="90" y="150" width="140" height="155" rx="4" fill="#7f1d1d" stroke="#f87171" strokeWidth="1" strokeDasharray="3 3" />
                            
                            <text x="160" y="175" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold" fontFamily="monospace">
                              ГОЛЫЙ СТАЛЬНОЙ КОРПУС
                            </text>
                            <text x="160" y="225" textAnchor="middle" fill="#fca5a5" fontSize="9">
                              Без каменной защиты
                            </text>
                            <text x="160" y="280" textAnchor="middle" fill="#fef08a" fontSize="10" fontWeight="bold">
                              Температура стенки: 320°C!
                            </text>
                          </g>
                        )}
                      </svg>

                      {/* Mode Switch Button */}
                      <button
                        onClick={() => {
                          setIrSimMode(irSimMode === 'sarcophagus' ? 'bare_metal' : 'sarcophagus');
                          markSimInteracted('infrared');
                        }}
                        className="w-full py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 active:scale-95"
                      >
                        <Radio className="w-4 h-4 text-amber-400" />
                        <span>
                          {irSimMode === 'sarcophagus' ? 'Переключить на голую сталь (320°C)' : 'Одеть печь в каменный саркофаг'}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Physics & Medical Telemetry Dashboard */}
                  <div className="lg:col-span-6 space-y-3.5">
                    <div className="grid grid-cols-2 gap-3">
                      {/* Metric 1: Wavelength */}
                      <div className={`p-3.5 rounded-2xl border transition-all ${
                        irSimMode === 'sarcophagus'
                          ? 'bg-amber-950/30 border-amber-500/40'
                          : 'bg-rose-950/30 border-rose-500/40'
                      }`}>
                        <div className="text-[10px] font-mono text-stone-400 uppercase">Длина волны излучения (λ):</div>
                        <div className={`text-xl font-bold font-mono mt-0.5 ${
                          irSimMode === 'sarcophagus' ? 'text-amber-300' : 'text-rose-400'
                        }`}>
                          {irSimMode === 'sarcophagus' ? '8 — 14 мкм' : '< 2.5 мкм'}
                        </div>
                        <div className="text-[11px] text-stone-300 mt-1">
                          {irSimMode === 'sarcophagus' ? 'Длинноволновый биорезонанс' : 'Коротковолновый жесткий спектр'}
                        </div>
                      </div>

                      {/* Metric 2: Penetration Depth */}
                      <div className={`p-3.5 rounded-2xl border transition-all ${
                        irSimMode === 'sarcophagus'
                          ? 'bg-amber-950/30 border-amber-500/40'
                          : 'bg-rose-950/30 border-rose-500/40'
                      }`}>
                        <div className="text-[10px] font-mono text-stone-400 uppercase">Глубина прогрева тканей:</div>
                        <div className={`text-xl font-bold font-mono mt-0.5 ${
                          irSimMode === 'sarcophagus' ? 'text-amber-300' : 'text-rose-400'
                        }`}>
                          {irSimMode === 'sarcophagus' ? '30 — 45 мм' : 'менее 1 мм'}
                        </div>
                        <div className="text-[11px] text-stone-300 mt-1">
                          {irSimMode === 'sarcophagus' ? 'Прямо в мышцы, фасции и связки' : 'Ожог только рогового слоя кожи'}
                        </div>
                      </div>
                    </div>

                    {/* Physics explanation */}
                    <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 space-y-2 text-xs">
                      <div className="font-semibold text-amber-300 flex items-center gap-1.5 text-xs">
                        <span>🔬 Закон смещения Вина и физика тепла:</span>
                      </div>
                      <p className="text-stone-300 leading-relaxed">
                        {irSimMode === 'sarcophagus' ? (
                          <span>
                            Стенки из талькохлорита или жадеита нагреты всего до 60–75°C. Чем ниже температура излучателя, тем <strong className="text-amber-300">длиннее волна</strong>. 
                            Длина 9.4 мкм совпадает с собственной тепловой волной человека. Организм принимает это тепло без защитного стресса: капилляры расширяются, давление плавно нормализуется.
                          </span>
                        ) : (
                          <span>
                            Раскаленный до 300°C+ металл испускает высокоэнергетические короткие волны. 
                            Они не проникают вглубь, а бомбардируют болевые терморецепторы кожи (эффект сковороды). В ответ организм спазмирует сосуды, поднимается пульс, начинает болеть затылок.
                          </span>
                        )}
                      </p>
                    </div>

                    {/* Impact on Guest */}
                    <div className={`p-3.5 rounded-2xl border text-xs leading-relaxed ${
                      irSimMode === 'sarcophagus'
                        ? 'bg-amber-950/20 border-amber-500/30 text-amber-200'
                        : 'bg-rose-950/20 border-rose-500/30 text-rose-200'
                    }`}>
                      <span className="font-bold block mb-1">
                        {irSimMode === 'sarcophagus' ? '💛 Физиология: Полная релаксация и оздоровление' : '🚫 Физиология: Тепловой шок и спазм'}
                      </span>
                      {irSimMode === 'sarcophagus' ? (
                        <span>Возле печи тепло, мягко и уютно. Гость может спокойно лежать на полке 15–20 минут, наслаждаясь глубоким прогревом и обильным целебным потоотделением.</span>
                      ) : (
                        <span>К печи страшно подойти ближе 1 метра. У полка воздух обжигает лицо, пересыхают губы, а внизу у пола остается холодно из-за паразитной конвекции.</span>
                      )}
                    </div>
                  </div>

                </div>
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

              {/* Celebratory Reward Card for Quest Completion */}
              {quizSubmitted && (() => {
                const correctCount = quizQuestions.filter((item, idx) => quizAnswers[idx] === item.correct).length;
                const isAllCorrect = correctCount === quizQuestions.length;

                if (isAllCorrect) {
                  return (
                    <div className="rounded-2xl border-2 border-amber-500 bg-gradient-to-br from-amber-950/70 via-stone-900 to-stone-950 p-5 sm:p-6 text-stone-100 shadow-2xl space-y-4 animate-fade-in">
                      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-stone-950 flex items-center justify-center text-3xl shadow-xl ring-2 ring-amber-300 shrink-0">
                          💎
                        </div>
                        <div className="space-y-1 text-center sm:text-left flex-1">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold uppercase tracking-wider">
                            <span>🎉 Квест исследования печи успешно пройден!</span>
                          </div>
                          <h4 className="text-lg sm:text-xl font-serif font-bold text-amber-200">
                            Награда получена: +150 XP и Таинственный Артефакт!
                          </h4>
                          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                            Вы безупречно ответили на все вопросы экзамена по физике печи, режимам горения и кондициям легкого пара.
                          </p>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-stone-950/90 border border-amber-500/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">💎</span>
                          <div>
                            <div className="text-sm font-bold text-amber-300 font-serif flex items-center gap-2">
                              <span>Закалённый Нефрит Каменки</span>
                              <span className="text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                                В инвентаре
                              </span>
                            </div>
                            <div className="text-xs text-stone-300 mt-0.5">
                              Полудрагоценный камень для закрытой каменки с колоссальной теплоемкостью. <span className="text-amber-200 font-semibold underline decoration-amber-400">Обязательно пригодится вам на дальнейших этапах парения!</span>
                            </div>
                          </div>
                        </div>
                        <div className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-mono font-black text-xs uppercase tracking-wider shadow-md shrink-0">
                          +150 XP
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/50 text-rose-200 text-xs flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">⚠️</span>
                      <span>Правильных ответов: <strong>{correctCount} из {quizQuestions.length}</strong>. Изучите пояснения выше и попробуйте снова, чтобы заработать опыт и таинственный артефакт!</span>
                    </div>
                  </div>
                );
              })()}

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

        {/* Modal Bottom Footer: Экзамен пармастера вместо кнопки "Понятно, вернуться в парную" */}
        <div className={`bg-stone-900/95 border-t border-stone-800 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 transition-all duration-300 ${
          showIntroPopup ? 'filter blur-[1px] opacity-40 pointer-events-none select-none' : ''
        }`}>
          {activeTab !== 'quiz' ? (
            <>
              {/* Telemetry info / interaction progress */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs text-stone-400 w-full sm:w-auto">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${isExamUnlocked ? 'bg-emerald-400 shadow-lg shadow-emerald-400/50 animate-pulse' : 'bg-amber-400'}`} />
                  <span className="font-mono text-stone-300 font-medium">Готовность к экзамену:</span>
                  <span className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-bold ${
                    isExamUnlocked 
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                      : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                  }`}>
                    {completedSimsCount}/3 симуляций
                  </span>
                </div>
                {!isExamUnlocked && (
                  <span className="text-[11px] text-stone-500 font-sans hidden lg:inline">
                    (Опробуйте: {!interactedSims.blueprint ? 'Макет печи' : !interactedSims.steamTypes ? 'Типы пара' : 'ИК-волны'})
                  </span>
                )}
              </div>

              {/* Long, prominent Exam button */}
              <div className="w-full sm:flex-1 max-w-xl">
                <button
                  onClick={() => {
                    if (isExamUnlocked) {
                      setActiveTab('quiz');
                    }
                  }}
                  disabled={!isExamUnlocked}
                  className={`w-full py-3.5 px-6 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-3 transition-all select-none shadow-xl ${
                    isExamUnlocked
                      ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 active:scale-[0.98] text-stone-950 border-2 border-amber-300 shadow-amber-500/30 cursor-pointer animate-pulse'
                      : 'bg-stone-950/80 text-stone-500 border-2 border-stone-800 cursor-not-allowed opacity-60'
                  }`}
                  title={
                    isExamUnlocked
                      ? 'Все симуляции исследованы! Начать экзамен пармастера'
                      : 'Экзамен заблокирован. Опробуйте интерактивный макет печи, симуляцию пара и ИК-излучения'
                  }
                >
                  {isExamUnlocked ? (
                    <>
                      <Sparkles className="w-5 h-5 text-stone-950 shrink-0" />
                      <span>🎓 Сдать Экзамен Пармастера (Доступ открыт — Начать!)</span>
                    </>
                  ) : (
                    <>
                      <HelpCircle className="w-4 h-4 text-stone-600 shrink-0" />
                      <span>🔒 Экзамен пармастера (Опробуйте симуляции: {completedSimsCount}/3)</span>
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="w-full flex items-center justify-between gap-3">
              <button
                onClick={() => setActiveTab('blueprint')}
                className="px-5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition-all border border-stone-700 cursor-pointer flex items-center gap-2"
              >
                <span>←</span>
                <span>Вернуться к макету печи</span>
              </button>
              <div className="text-xs font-mono text-amber-300 font-bold flex items-center gap-2">
                <span>👑</span>
                <span>Квалификационный экзамен пармастера в процессе</span>
              </div>
            </div>
          )}
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

        {/* COMBUSTION MODE DETAILS POPUP MODAL */}
        {activeModePopup && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[70] flex items-center justify-center p-3 sm:p-5 animate-fade-in">
            <div className={`max-w-2xl w-full bg-stone-900 border-2 ${activeModePopup.colorScheme.borderColor} rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]`}>
              
              {/* Header */}
              <div className={`p-5 bg-gradient-to-r ${activeModePopup.colorScheme.bgGradient} border-b border-stone-800 relative flex items-start justify-between gap-4`}>
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-stone-950/80 border border-stone-700 flex items-center justify-center text-2xl shrink-0 shadow-inner">
                    {activeModePopup.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border ${activeModePopup.colorScheme.badgeClass}`}>
                        {activeModePopup.badge}
                      </span>
                    </div>
                    <h3 className="font-serif font-bold text-xl sm:text-2xl text-stone-100">
                      {activeModePopup.title}
                    </h3>
                    <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                      {activeModePopup.summary}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveModePopup(null)}
                  className="p-2 rounded-xl bg-stone-950/60 hover:bg-stone-950 text-stone-400 hover:text-stone-100 border border-stone-800 transition-all cursor-pointer shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
                
                {/* HOW TO ACHIEVE THIS MODE */}
                <div className="rounded-2xl bg-stone-950 border border-stone-800 p-4 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                    <span className="font-serif font-bold text-sm text-amber-300 flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-amber-400" />
                      <span>⚙️ КАК ЭТОГО ДОСТИЧЬ (НАСТРОЙКИ ПЕЧИ)</span>
                    </span>
                    <span className="font-mono text-[10px] text-stone-400">Параметры рычагов</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* Damper */}
                    <div className="p-3 rounded-xl bg-stone-900/90 border border-stone-800 space-y-1">
                      <div className="text-[11px] font-mono text-stone-400">Шибер дымохода (Тяга):</div>
                      <div className="font-bold text-amber-400 text-xs">
                        {activeModePopup.howToAchieve.damper}
                      </div>
                    </div>

                    {/* Ash Pit */}
                    <div className="p-3 rounded-xl bg-stone-900/90 border border-stone-800 space-y-1">
                      <div className="text-[11px] font-mono text-stone-400">Поддувало / Приток O₂:</div>
                      <div className="font-bold text-rose-400 text-xs">
                        {activeModePopup.howToAchieve.ashPit}
                      </div>
                    </div>

                    {/* Convection */}
                    <div className="p-3 rounded-xl bg-stone-900/90 border border-stone-800 space-y-1">
                      <div className="text-[11px] font-mono text-stone-400">Конвекционные дверцы:</div>
                      <div className="font-bold text-cyan-300 text-xs">
                        {activeModePopup.howToAchieve.convection}
                      </div>
                    </div>

                    {/* Temps */}
                    <div className="p-3 rounded-xl bg-stone-900/90 border border-stone-800 space-y-1">
                      <div className="text-[11px] font-mono text-stone-400">Температурный режим:</div>
                      <div className="font-bold text-emerald-300 text-xs">
                        {activeModePopup.howToAchieve.temperatures}
                      </div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-stone-900/60 border border-stone-800/80 text-stone-300 text-[11px] flex items-center gap-2">
                    <Flame className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span><strong>Характер пламени:</strong> {activeModePopup.howToAchieve.flameDescription}</span>
                  </div>
                </div>

                {/* WHY IT IS NEEDED */}
                <div className="rounded-2xl bg-stone-950 border border-stone-800 p-4 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                    <span className="font-serif font-bold text-sm text-amber-300 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-400" />
                      <span>🎯 ДЛЯ ЧЕГО ОН НУЖЕН (НАЗНАЧЕНИЕ И ФИЗИКА)</span>
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    <div className="p-3 rounded-xl bg-stone-900/80 border border-stone-800/80">
                      <span className="font-semibold text-amber-400 block mb-1">Главная цель режима:</span>
                      <p className="text-stone-200 leading-relaxed">{activeModePopup.whyNeeded.mainGoal}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-stone-900/80 border border-stone-800/80">
                      <span className="font-semibold text-cyan-400 block mb-1">Физика процесса в печи и парной:</span>
                      <p className="text-stone-300 leading-relaxed">{activeModePopup.whyNeeded.physicsProcess}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-stone-900/80 border border-stone-800/80 space-y-1.5">
                      <span className="font-semibold text-emerald-400 block">Плюсы и результаты использования:</span>
                      <ul className="space-y-1">
                        {activeModePopup.whyNeeded.benefits.map((b, i) => (
                          <li key={i} className="flex items-start gap-2 text-stone-300">
                            <span className="text-emerald-400 font-bold shrink-0">✓</span>
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 space-y-1">
                      <span className="font-bold text-amber-300 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                        💡 Совет и секрет Пармастера:
                      </span>
                      <p className="text-stone-200 leading-relaxed">{activeModePopup.whyNeeded.proTip}</p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Footer */}
              <div className="p-4 bg-stone-950 border-t border-stone-800 flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={() => {
                    applyPresetMode(activeModePopup.id);
                    setActiveModePopup(null);
                  }}
                  className="flex-1 min-w-[200px] py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs uppercase tracking-wide transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Применить настройки печи</span>
                </button>

                <button
                  onClick={() => setActiveModePopup(null)}
                  className="py-2.5 px-5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-xs transition-all border border-stone-700 cursor-pointer"
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
