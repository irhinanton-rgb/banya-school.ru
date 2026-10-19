import React, { useState } from 'react';
import {
  ShieldCheck,
  Heart,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Flame,
  Droplet,
  Sparkles,
  Activity,
  Ruler,
  Wind,
  Footprints,
  RotateCcw,
  Check,
  Shirt,
  Utensils,
  Ban,
  Clock,
  Thermometer,
  ArrowRight,
  ArrowLeft,
  Key,
  Lock,
  Unlock,
  Scale,
  User,
  ShieldAlert,
} from 'lucide-react';
import { GUEST_CASES } from '../../data/courseData';
import { GuestCase } from '../../types/banya';
import { MasterRecipeChestModal } from '../inventory/MasterRecipeChestModal';
import { playSuccessChime, playSteamSound, playWoodTap } from '../../utils/audio';
import confetti from 'canvas-confetti';

interface GuestTriageSimulatorProps {
  soundEnabled: boolean;
  onGrantXp?: (amount: number) => void;
  onSuccess?: () => void;
  onMasterSafetyCompleted?: () => void;
  onGuestSafetyCompleted?: () => void;
  onErgonomicsSafetyCompleted?: () => void;
  unlockedBadges?: string[];
  onUnlockBadge?: (badgeId: any, xp: number) => void;
}

export const GuestTriageSimulator: React.FC<GuestTriageSimulatorProps> = ({
  soundEnabled,
  onGrantXp,
  onSuccess,
  onMasterSafetyCompleted,
  onGuestSafetyCompleted,
  onErgonomicsSafetyCompleted,
  unlockedBadges = [],
  onUnlockBadge,
}) => {
  // Current active sequential section: 1 | 2 | 3
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);

  // Completed steps tracking for progress
  const [completedSteps, setCompletedSteps] = useState<{
    step1: boolean;
    step2: boolean;
    step3: boolean;
  }>({
    step1: false,
    step2: false,
    step3: false,
  });

  // --- Golden Key & Secret Chest State ---
  const [hasGoldenKey, setHasGoldenKey] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return (
        localStorage.getItem('banya_golden_key_awarded') === 'true' ||
        unlockedBadges.includes('golden_key')
      );
    }
    return false;
  });
  const [isSecretChestOpen, setIsSecretChestOpen] = useState<boolean>(false);

  // --- Interactive Guest Triage State ---
  const [currentGuestIdx, setCurrentGuestIdx] = useState<number>(0);
  const [selectedDecision, setSelectedDecision] = useState<string | null>(null);
  const [guestVerdicts, setGuestVerdicts] = useState<
    Record<string, { decision: string; isCorrect: boolean }>
  >({});
  const [solvedGuests, setSolvedGuests] = useState<Record<string, boolean>>(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('banya_golden_key_awarded') === 'true') {
      const allDone: Record<string, boolean> = { case_1: true, case_2: true, case_3: true };
      return allDone;
    }
    const empty: Record<string, boolean> = {};
    return empty;
  });

  // --- Bench Height Calibration ---
  const [masterHeight, setMasterHeight] = useState<number>(180);
  const [benchHeight, setBenchHeight] = useState<number>(79);

  // Optimal bench height formula: master height * 0.44 (knuckles of clenched fist: ~75-85 cm)
  const optimalBenchHeight = Math.round(masterHeight * 0.44);
  const benchDiff = benchHeight - optimalBenchHeight;

  const getBenchEvaluation = () => {
    if (benchDiff === 0) {
      return {
        badge: 'Идеальная эргономика (0 см)',
        color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/20',
        title: 'Эталонное положение: костяшки кулака касаются настила',
        desc: `Высота полка (${benchHeight} см) идеально соответствует уровню костяшек опущенного кулака при росте ${masterHeight} см. Спина строго прямая, наклон только в тазобедренных суставах. Импульс идет от стоп и пружинящих коленей. Нагрузка на поясничные диски L4-L5 минимальна — спина не устает даже за 5–6 сеансов!`,
      };
    }
    if (benchDiff < -5) {
      return {
        badge: `Полок занижен на ${Math.abs(benchDiff)} см`,
        color: 'text-rose-400 border-rose-500/40 bg-rose-950/20',
        title: 'Критическая перегрузка поясницы (диски L4–L5)',
        desc: `Полок слишком низкий (${benchHeight} см). Мастер вынужден горбиться и наклоняться согнутой спиной. Давление на поясничный отдел превышает 200–250 кг! Это прямой путь к протрузиям, грыжам и мышечным спазмам в первый же сезон. Решение: использовать подставной деревянный трап под ноги.`,
      };
    }
    if (benchDiff < 0) {
      return {
        badge: `Полок чуть занижен (${benchDiff} см)`,
        color: 'text-amber-400 border-amber-500/40 bg-amber-950/20',
        title: 'Умеренный наклон вперед',
        desc: `Полок немного ниже эталона. Спина испытывает повышенное напряжение при длительном парении. Старайтесь шире расставлять ноги и сгибать колени, удерживая позвоночник ровным.`,
      };
    }
    if (benchDiff > 5) {
      return {
        badge: `Полок завышен на +${benchDiff} см`,
        color: 'text-rose-400 border-rose-500/40 bg-rose-950/20',
        title: 'Зажим плечевого пояса и риск ожога рук',
        desc: `Полок слишком высокий (${benchHeight} см). Чтобы парить гостя, мастер вынужден высоко задирать локти и плечи прямо в зону перегретого парового пирога (+75...+85°C). Возникает спазм трапециевидных мышц, затекают руки и возрастает риск ожога предплечий. Решение: работать в широкой низкой стойке лучника.`,
      };
    }
    return {
      badge: `Полок чуть завышен (+${benchDiff} см)`,
      color: 'text-amber-400 border-amber-500/40 bg-amber-950/20',
      title: 'Небольшой подъем плеч',
      desc: `Полок немного выше идеала. Следите за тем, чтобы не зажимать шею и опускать плечи вниз, работая мягкой кистью.`,
    };
  };

  const benchEval = getBenchEvaluation();

  // --- Guest Triage Handlers & State Variables ---
  const currentGuest: GuestCase = GUEST_CASES[currentGuestIdx] || GUEST_CASES[0];
  const currentVerdict = guestVerdicts[currentGuest.id];
  const isCurrentSolved = !!solvedGuests[currentGuest.id];
  const solvedCount = Object.keys(solvedGuests).length;
  const allCasesSolved = solvedCount >= GUEST_CASES.length;

  const handleSelectDecision = (decision: string) => {
    if (currentVerdict && currentVerdict.isCorrect) return;
    setSelectedDecision(decision);
    playWoodTap(soundEnabled);
  };

  const handleSubmitDecision = () => {
    if (!selectedDecision) return;
    const isCorrect = selectedDecision === currentGuest.correctDecision;
    const updatedVerdicts = {
      ...guestVerdicts,
      [currentGuest.id]: { decision: selectedDecision, isCorrect },
    };
    setGuestVerdicts(updatedVerdicts);

    if (isCorrect) {
      playSuccessChime(soundEnabled);
      const updatedSolved = { ...solvedGuests, [currentGuest.id]: true };
      setSolvedGuests(updatedSolved);

      const count = Object.keys(updatedSolved).length;
      if (onGrantXp) onGrantXp(25);

      if (count >= GUEST_CASES.length) {
        setHasGoldenKey(true);
        if (typeof window !== 'undefined') {
          localStorage.setItem('banya_golden_key_awarded', 'true');
        }
        if (onUnlockBadge) {
          onUnlockBadge('golden_key', 50);
        }
        if (onGuestSafetyCompleted) {
          onGuestSafetyCompleted();
        }
        setCompletedSteps((prev) => ({ ...prev, step2: true }));
        try {
          confetti({
            particleCount: 75,
            spread: 80,
            origin: { y: 0.6 },
          });
        } catch {
          // ignore
        }
      }
    } else {
      playWoodTap(soundEnabled);
    }
  };

  const handleRetryGuest = () => {
    setSelectedDecision(null);
    setGuestVerdicts((prev) => {
      const copy = { ...prev };
      delete copy[currentGuest.id];
      return copy;
    });
    playWoodTap(soundEnabled);
  };

  const handleSwitchGuest = (idx: number) => {
    setCurrentGuestIdx(idx);
    const guest = GUEST_CASES[idx];
    const existing = guestVerdicts[guest.id];
    setSelectedDecision(existing ? existing.decision : null);
    playWoodTap(soundEnabled);
  };

  const handleNextGuest = () => {
    const nextIdx = (currentGuestIdx + 1) % GUEST_CASES.length;
    handleSwitchGuest(nextIdx);
  };

  // Navigation handlers
  const handleNextFromStep1 = () => {
    playWoodTap(soundEnabled);
    if (!completedSteps.step1) {
      setCompletedSteps((prev) => ({ ...prev, step1: true }));
      if (onGrantXp) onGrantXp(30);
      if (onMasterSafetyCompleted) onMasterSafetyCompleted();
    }
    setActiveStep(2);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleNextFromStep2 = () => {
    playWoodTap(soundEnabled);
    if (!completedSteps.step2) {
      setCompletedSteps((prev) => ({ ...prev, step2: true }));
      if (onGrantXp) onGrantXp(30);
      if (onGuestSafetyCompleted) onGuestSafetyCompleted();
    }
    setActiveStep(3);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleFinishStep3 = () => {
    playSuccessChime(soundEnabled);
    if (!completedSteps.step3) {
      setCompletedSteps((prev) => ({ ...prev, step3: true }));
      if (onGrantXp) onGrantXp(40);
      if (onErgonomicsSafetyCompleted) onErgonomicsSafetyCompleted();
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
  };

  return (
    <div className="space-y-6">

      {/* ========================================================= */}
      {/* SECTION NAVIGATION: 3 CLEAN SEQUENTIAL STEPS */}
      {/* ========================================================= */}
      <div className="rounded-2xl border border-stone-800 bg-stone-900/90 p-3 sm:p-4 shadow-lg">
        <div className="text-[11px] font-mono uppercase tracking-wider text-stone-400 font-bold mb-3 px-1">
          Последовательное изучение 3 разделов безопасности:
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          
          {/* Step 1 Button */}
          <button
            type="button"
            onClick={() => {
              setActiveStep(1);
              playWoodTap(soundEnabled);
            }}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              activeStep === 1
                ? 'bg-amber-500/15 border-amber-400 text-amber-200 ring-1 ring-amber-400/40'
                : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:border-stone-700'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-mono mb-1">
              <span className="font-bold flex items-center gap-1.5">
                <span>👑</span> Раздел 1
              </span>
              {hasGoldenKey ? (
                <span className="text-amber-400 font-bold flex items-center gap-1 text-[10px]">
                  <Key className="w-3 h-3" /> Сундук 🗝️
                </span>
              ) : completedSteps.step1 ? (
                <span className="text-emerald-400 font-bold flex items-center gap-1 text-[10px]">
                  <Check className="w-3 h-3" /> Освоен
                </span>
              ) : null}
            </div>
            <div className="font-serif font-bold text-sm text-stone-100">
              Безопасность мастера
            </div>
            <div className="text-[11px] text-stone-400 mt-0.5 line-clamp-1">
              Экипировка, рацион, аптечка, сундук
            </div>
          </button>

          {/* Step 2 Button */}
          <button
            type="button"
            onClick={() => {
              setActiveStep(2);
              playWoodTap(soundEnabled);
            }}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              activeStep === 2
                ? 'bg-rose-500/15 border-rose-400 text-rose-200 ring-1 ring-rose-400/40'
                : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:border-stone-700'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-mono mb-1">
              <span className="font-bold flex items-center gap-1.5">
                <span>⚖️</span> Раздел 2
              </span>
              {allCasesSolved ? (
                <span className="text-amber-400 font-bold flex items-center gap-1 text-[10px]">
                  <Key className="w-3 h-3 text-amber-400" /> Триаж 3/3 ✓
                </span>
              ) : solvedCount > 0 ? (
                <span className="text-emerald-400 font-bold text-[10px]">
                  {solvedCount}/3 решено
                </span>
              ) : completedSteps.step2 ? (
                <span className="text-emerald-400 font-bold flex items-center gap-1 text-[10px]">
                  <Check className="w-3 h-3" /> Освоен
                </span>
              ) : null}
            </div>
            <div className="font-serif font-bold text-sm text-stone-100">
              Безопасность гостя
            </div>
            <div className="text-[11px] text-stone-400 mt-0.5 line-clamp-1">
              Табу на лекарства, триаж 3 гостей
            </div>
          </button>

          {/* Step 3 Button */}
          <button
            type="button"
            onClick={() => {
              setActiveStep(3);
              playWoodTap(soundEnabled);
            }}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              activeStep === 3
                ? 'bg-emerald-500/15 border-emerald-400 text-emerald-200 ring-1 ring-emerald-400/40'
                : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:border-stone-700'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-mono mb-1">
              <span className="font-bold flex items-center gap-1.5">
                <span>📐</span> Раздел 3
              </span>
              {completedSteps.step3 && (
                <span className="text-emerald-400 font-bold flex items-center gap-1 text-[10px]">
                  <Check className="w-3 h-3" /> Освоен
                </span>
              )}
            </div>
            <div className="font-serif font-bold text-sm text-stone-100">
              Эргономика парной
            </div>
            <div className="text-[11px] text-stone-400 mt-0.5 line-clamp-1">
              Подготовка инвентаря & Высота полка
            </div>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SECTION 1: MASTER SAFETY & RESILIENCE */}
      {/* ========================================================= */}
      {activeStep === 1 && (
        <div className="space-y-5 animate-fadeIn">

          {/* Banner: Priority on Self-Care */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs leading-relaxed">
            <span className="text-2xl shrink-0">👑</span>
            <div className="text-stone-200">
              <strong className="text-amber-300 font-bold block mb-0.5 text-sm">
                Главная аксиома профессии: Забота о себе — на первом месте
              </strong>
              Если мастер истощен, не выспался, голоден или перегрет — он теряет концентрацию, координацию и физически не способен обеспечить безопасность гостя. Профессионал выходит в парную только в ресурсном состоянии!
            </div>
          </div>

          {/* Block 1: Full Gear */}
          <div className="rounded-2xl border border-stone-800 bg-stone-900/70 p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-wider font-mono border-b border-stone-800 pb-3">
              <Shirt className="w-4 h-4 text-sky-400" />
              <span>1. Экипировка пармастера на смену</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-stone-300">
              <div className="p-3.5 rounded-xl bg-stone-950/80 border border-stone-800 space-y-1.5">
                <strong className="text-sky-300 text-sm block">👟 Закрытая обувь (типа кроксов/клогов)</strong>
                <p className="text-stone-400 leading-relaxed">
                  Обязателен <strong>закрытый плотный мысок</strong>: защищает пальцы ног от ударов о края деревянных трапов и случайных брызг крутого кипятка при поддаче пара. 
                  Подошва с <strong>глубоким нескользящим протектором</strong>: мокрый распаренный дубовый лист на кафеле скользит опаснее льда! Открытые шлёпанцы запрещены.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-950/80 border border-stone-800 space-y-1.5">
                <strong className="text-sky-300 text-sm block">👕 Рашгард или термобельё (термомост)</strong>
                <p className="text-stone-400 leading-relaxed">
                  Плотная синтетическая компрессионная ткань создает <strong>воздушный термомост (буфер)</strong> между раскаленным паром (+75...+85°C) и телом мастера. Влага пота тонким слоем распределяется по ткани и быстро испаряется, спасая от прямого ожога кожи («пар не ошпаривает мокрую голую кожу»).
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-950/80 border border-stone-800 space-y-1.5">
                <strong className="text-sky-300 text-sm block">👒 Плотная войлочная или фетровая шапка (5–8 мм)</strong>
                <p className="text-stone-400 leading-relaxed">
                  В подпотолочной зоне парной температура достигает +80...+90°C. Плотный натуральный войлок надежно экранирует поверхностные сосуды черепа и головной мозг от перегрева. Тонкие хлопковые шапочки бесполезны и не держат термический удар.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-950/80 border border-stone-800 space-y-1.5">
                <strong className="text-sky-300 text-sm block">🧦 Защита стоп (валенки, шерсть или дайвинг)</strong>
                <p className="text-stone-400 leading-relaxed">
                  По полу парной постоянно стелется сквозняк холодного приточного воздуха (+20...+25°C). <strong>Толстые шерстяные носки</strong> (их можно проливать горячей водой для согревающего эффекта) или <strong>неопреновые носки для дайвинга (2–3 мм)</strong> надежно удерживают тепло стоп.
                </p>
              </div>
            </div>

            {/* Law of Health */}
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-stone-200 flex items-start gap-2.5">
              <span className="text-xl shrink-0">📜</span>
              <div>
                <strong className="text-amber-300 block mb-0.5">
                  Закон здоровья мастера: «Голова должна оставаться в прохладе, а ноги — в тепле!»
                </strong>
                Если во время смены ноги перемерзли — их нельзя оставлять холодными! Сразу после сеанса прогрейте стопы: либо опустите в тазик с комфортно горячей водой (+40...+42°C) с морской солью на 10–15 минут, либо погрейте на теплом полке в парной.
              </div>
            </div>
          </div>

          {/* Block 2: Nutrition & Electrolytes */}
          <div className="rounded-2xl border border-stone-800 bg-stone-900/70 p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono border-b border-stone-800 pb-3">
              <Utensils className="w-4 h-4 text-emerald-400" />
              <span>2. Рацион питания и электролиты: добор минералов из еды</span>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200">
              <strong>Ключевой принцип:</strong> Изотоники и аптечные препараты — это <u>ЛИШЬ ДОПОЛНЕНИЕ</u>! Основную часть (90%) всех микроэлементов и электролитов мастер обязан добирать из базового сбалансированного рациона питания.
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-stone-950/80 border border-stone-800 space-y-1">
                <strong className="text-emerald-300 block">Калий (K+) и Магний (Mg2+)</strong>
                <p className="text-stone-400 text-[11px] leading-snug">
                  Печеный картофель в кожуре (чемпион по калию), бананы, курага, изюм, гречка, тыквенные семечки (чемпион по магнию). Защищают от судорог и аритмии.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-stone-950/80 border border-stone-800 space-y-1">
                <strong className="text-amber-300 block">Натрий (Na+) и Хлор (Cl-)</strong>
                <p className="text-stone-400 text-[11px] leading-snug">
                  Квашеная капуста (электролитный ферментированный суперфуд с рассолом и пробиотиками), слабосоленая рыба, подсоленные бульоны. Удерживают объем плазмы и тонус.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-stone-950/80 border border-stone-800 space-y-1">
                <strong className="text-sky-300 block">Кальций (Ca2+) и Белок</strong>
                <p className="text-stone-400 text-[11px] leading-snug">
                  Творог 5%, твердый сыр, перепелиные и куриные яйца, филе индейки. Восстанавливают мышечные волокна и передачу нервно-мышечных импульсов.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-stone-950/80 border border-stone-800 space-y-1">
                <strong className="text-rose-300 block">Сложные углеводы</strong>
                <p className="text-stone-400 text-[11px] leading-snug">
                  Овсянка долгой варки, бурый рис, киноа. Дают медленное высвобождение глюкозы и стабильный мышечный гликоген на 4–6 часов физической работы.
                </p>
              </div>
            </div>

            {/* Compatibility Rules */}
            <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-stone-300 space-y-1.5">
              <strong className="text-amber-300 block">Правила совместимости продуктов (чтобы не конфликтовали):</strong>
              <ul className="space-y-1 pl-4 list-disc text-stone-400 text-[11px] leading-relaxed">
                <li><strong>Конфликт Кальция (Ca) с Железом (Fe) и Магнием (Mg):</strong> кальций блокирует всасывание железа и магния. Разделяйте творог/сыр и мясо/гречку минимум на 2–3 часа!</li>
                <li><strong>Прием пищи — за 1.5–2 часа до смены:</strong> легкий белок + сложные углеводы. Избегать тяжелых животных жиров (сало, фастфуд), которые вызывают отток крови к желудку и слабость в парной.</li>
                <li><strong>Окно после смены (в первые 40 минут):</strong> печеный картофель с солью + квашеная капуста + стакан теплого клюквенного морса.</li>
              </ul>
            </div>
          </div>

          {/* Block 3: First Aid & Foot Hygiene */}
          <div className="rounded-2xl border border-stone-800 bg-stone-900/70 p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-rose-400 uppercase tracking-wider font-mono border-b border-stone-800 pb-3">
              <ShieldCheck className="w-4 h-4 text-rose-400" />
              <span>3. Аптечка мастера и гигиена стоп</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-stone-300">
              <div className="p-3.5 rounded-xl bg-stone-950/80 border border-stone-800 space-y-1.5">
                <strong className="text-rose-300 text-sm block">🔥 Противоожоговые средства</strong>
                <p className="text-stone-400 leading-relaxed">
                  Гидрогелевые салфетки и повязки («Лиоксазин», «ОжоговНет») и спрей с декспантенолом (Пантенол-спрей). Стерильный гидрогель моментально охлаждает ткань и снимает боль.
                </p>
                <div className="p-2 rounded-lg bg-rose-950/30 border border-rose-500/30 text-rose-300 text-[11px]">
                  <strong>Строжайшее табу на масла и жиры!</strong> Категорически запрещено мазать ожоги растительным маслом или жиром — масляная пленка запирает жар внутри кожи и ведет к глубокому некрозу.
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-950/80 border border-stone-800 space-y-1.5">
                <strong className="text-sky-300 text-sm block">🦶 Профилактика грибка стоп (зона риска)</strong>
                <p className="text-stone-400 leading-relaxed">
                  Баня — зона повышенной влажности и тепла, где стопы уязвимы к микозам. 
                  <strong>Паста Теймурова</strong> — легендарное проверенное средство (борная и салициловая кислоты, цинк): нормализует потоотделение, подсушивает и подавляет грибок.
                </p>
                <div className="p-2 rounded-lg bg-sky-950/30 border border-sky-500/30 text-sky-300 text-[11px]">
                  <strong>Протокол гигиены:</strong> нанесение пасты Теймурова на чистые сухие стопы до смены, мытье дегтярным мылом после смены и дезинфекция кроксов изнутри антисептиком.
                </div>
              </div>
            </div>

            {/* Harm of Cold Plunge during session */}
            <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-stone-300 space-y-1">
              <strong className="text-rose-400 block">Вред частых окунаний в ледяную купель во время парения:</strong>
              <p className="text-stone-400 text-[11px] leading-relaxed">
                Выскакивать в ледяную купель по 5–7 раз за одно 15-минутное парение — грубейшая ошибка. Резкий холод спазмирует капилляры кожи, и всё внутреннее тепло оказывается «запертым» в ядре тела («эффект термоса»). Температура внутренних органов продолжает расти к тепловому удару, а давление подскакивает до 180–200 мм рт. ст. Охлаждаться мастеру следует только мягко: умывание лица, влажное полотенце на шею (+22...+24°C) и спокойное дыхание свежим воздухом.
              </p>
            </div>
          </div>

          {/* Block 4: Secret Recipe Chest of Master (Quick Recovery: Lemon + Salt + Honey + Water) */}
          <div className={`p-5 sm:p-6 rounded-2xl border-2 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-5 transition-all ${
            hasGoldenKey
              ? 'bg-gradient-to-r from-amber-950/60 via-stone-900 to-amber-950/40 border-amber-400/60 shadow-[0_0_25px_rgba(245,158,11,0.25)] ring-1 ring-amber-400/30'
              : 'bg-stone-900/80 border-stone-800'
          }`}>
            <div className="flex items-center gap-4 min-w-0">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0 border shadow-inner ${
                hasGoldenKey
                  ? 'bg-amber-500/25 border-amber-400 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                  : 'bg-stone-950 border-stone-800 text-stone-500'
              }`}>
                {hasGoldenKey ? '🗝️' : '🔒'}
              </div>
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-mono uppercase font-bold text-amber-400 tracking-wider">
                    Секретное знание пармастера
                  </span>
                  {hasGoldenKey ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold">
                      ЗОЛОТОЙ КЛЮЧ АКТИВИРОВАН ✓
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-stone-800 text-stone-400 border border-stone-700 text-[10px] font-mono">
                      ЗАКРЫТ НА ЗАМОК
                    </span>
                  )}
                </div>
                <h4 className="font-serif font-bold text-stone-100 text-base sm:text-lg">
                  Сундук с рецептом быстрого восстановления сил пармастера
                </h4>
                <p className="text-xs text-stone-300 leading-relaxed">
                  {hasGoldenKey
                    ? 'Золотой Ключ открывает древний свиток с выверенной формулой скорой помощи силам: Лимон + Соль + Мёд + Тёплая вода. Нажмите кнопку, чтобы прочитать свиток!'
                    : 'Внутри хранится секретная формула экстренного восстановления сил (лимон, соль, мёд, вода). Пройдите интерактивный тренажер приемки 3 гостей в Разделе 2, чтобы получить Золотой Ключ!'}
                </p>
              </div>
            </div>
            <div className="shrink-0 w-full sm:w-auto">
              {hasGoldenKey ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsSecretChestOpen(true);
                    playWoodTap(soundEnabled);
                  }}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/30 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Unlock className="w-4 h-4 text-stone-950" />
                  <span>Открыть тайный сундук</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setActiveStep(2);
                    playWoodTap(soundEnabled);
                    window.scrollTo({ top: 300, behavior: 'smooth' });
                  }}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Key className="w-4 h-4 text-amber-400" />
                  <span>Пройти триаж гостей за ключом →</span>
                </button>
              )}
            </div>
          </div>

          {/* Sequential Next Button */}
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={handleNextFromStep1}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-amber-500/20 flex items-center gap-2"
            >
              <span>Ознакомлен с Разделом 1: Перейти к Разделу 2 →</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION 2: GUEST SAFETY & LEGAL BOUNDARIES */}
      {/* ========================================================= */}
      {activeStep === 2 && (
        <div className="space-y-5 animate-fadeIn">

          {/* Golden Key Quest Banner */}
          <div className={`p-4 sm:p-5 rounded-2xl border-2 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 transition-all ${
            hasGoldenKey
              ? 'bg-gradient-to-r from-emerald-950/50 via-stone-900 to-amber-950/40 border-emerald-500/50'
              : 'bg-gradient-to-r from-amber-950/50 via-stone-900 to-stone-950 border-amber-500/40'
          }`}>
            <div className="flex items-center gap-3.5 min-w-0">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 border ${
                hasGoldenKey
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                  : 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
              }`}>
                🗝️
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase font-bold text-amber-400 tracking-wider">
                    {hasGoldenKey ? 'Награда получена' : 'Квест Раздела 2: Входной триаж'}
                  </span>
                  {hasGoldenKey ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono font-bold">
                      ЗОЛОТОЙ КЛЮЧ ПОЛУЧЕН ✓
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-mono font-semibold">
                      Решено: {solvedCount} из {GUEST_CASES.length}
                    </span>
                  )}
                </div>
                <h4 className="font-serif font-bold text-stone-100 text-sm sm:text-base mt-0.5">
                  {hasGoldenKey
                    ? 'Золотой Ключ открыл сундук с секретным рецептом мастера!'
                    : 'Пройдите интерактивный тренажер приемки 3 гостей за Золотым Ключом'}
                </h4>
                <p className="text-xs text-stone-300 mt-0.5 leading-snug">
                  {hasGoldenKey
                    ? 'Вы успешно решили все 3 кейса триажа гостей! Сундук с рецептом быстрого восстановления сил (лимон, соль, мёд, вода) в Разделе 1 готов к открытию.'
                    : 'Внимательно изучите анамнез каждого гостя в интерактивном тренажере ниже и вынесите верное решение. За безошибочный триаж выдается Золотой Ключ!'}
                </p>
              </div>
            </div>
            {hasGoldenKey && (
              <button
                type="button"
                onClick={() => {
                  setActiveStep(1);
                  setIsSecretChestOpen(true);
                  playWoodTap(soundEnabled);
                  window.scrollTo({ top: 300, behavior: 'smooth' });
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md shrink-0 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Unlock className="w-4 h-4 text-stone-950" />
                <span>Открыть Сундук в Разделе 1 →</span>
              </button>
            )}
          </div>

          {/* Strict Law Banner */}
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-xs leading-relaxed">
            <span className="text-2xl shrink-0">⚖️</span>
            <div className="text-stone-200">
              <strong className="text-rose-300 font-bold block mb-0.5 text-sm">
                Жесткий закон: Запрет оказания медпомощи без медобразования
              </strong>
              Пармастер — специалист оздоровительных банных процедур, а не врач. Строго запрещено ставить диагнозы и давать любые медикаменты гостям (таблетки от давления, сердечные капли, обезболивающие). Самодеятельность смертельно опасна и уголовно наказуема!
            </div>
          </div>

          {/* Block 1: Allowed vs Prohibited */}
          <div className="rounded-2xl border border-stone-800 bg-stone-900/70 p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-rose-400 uppercase tracking-wider font-mono border-b border-stone-800 pb-3">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>1. Границы полномочий мастера</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-2">
                <strong className="text-rose-300 font-bold text-sm flex items-center gap-1.5">
                  <Ban className="w-4 h-4 text-rose-400" /> Категорически ЗАПРЕЩЕНО:
                </strong>
                <ul className="space-y-1.5 pl-4 list-disc text-stone-300 text-[11px] leading-relaxed">
                  <li>Давать любые лекарственные препараты (даже если гость просит «таблетку от сердца»).</li>
                  <li>Ставить медицинские диагнозы («у вас инсульт/инфаркт/криз»).</li>
                  <li>Делать инъекции или вправлять вывихи и суставы.</li>
                  <li>Удерживать гостя в парной, если он просит выйти («потерпи ещё минутку»).</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
                <strong className="text-emerald-300 font-bold text-sm flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-400" /> Разрешена ТОЛЬКО доврачебная помощь:
                </strong>
                <ul className="space-y-1.5 pl-4 list-disc text-stone-300 text-[11px] leading-relaxed">
                  <li>Немедленно прекратить парение и вывести гостя из парной в прохладу.</li>
                  <li>Уложить строго горизонтально на кушетку, приподнять ноги выше уровня головы (приток крови к мозгу).</li>
                  <li>Смочить виски прохладной водой, расстегнуть воротник, дать доступ свежему воздуху.</li>
                  <li>При отсутствии улучшения в течение 3–5 минут — НЕМЕДЛЕННО ВЫЗВАТЬ СКОРУЮ ПОМОЩЬ (112)!</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Block 2: Guest Triage and Contraindications */}
          <div className="rounded-2xl border border-stone-800 bg-stone-900/70 p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider font-mono border-b border-stone-800 pb-3">
              <Heart className="w-4 h-4 text-amber-400" />
              <span>2. Входная диагностика и противопоказания гостя</span>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed">
              Перед первым заходом пармастер обязан провести краткий опрос гостя о самочувствии, давлении и перенесенных операциях.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-stone-950/80 border border-stone-800 space-y-1.5">
                <strong className="text-rose-400 text-sm block">🛑 Абсолютные противопоказания (Вход запрещен):</strong>
                <ul className="space-y-1 pl-4 list-disc text-stone-300 text-[11px] leading-relaxed">
                  <li><strong>Температура тела выше 37°C:</strong> баня при простуде с лихорадкой вызывает предынфарктную перегрузку сердца и риск коллапса!</li>
                  <li><strong>Алкогольное или наркотическое опьянение:</strong> несовместимо с жаром парной.</li>
                  <li>Онкологические заболевания в активной фазе.</li>
                  <li>Тяжелая гипертония 3 степени, острый постинфарктный период.</li>
                  <li>Эпилепсия и судорожные синдромы.</li>
                </ul>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-950/80 border border-stone-800 space-y-1.5">
                <strong className="text-amber-300 text-sm block">⚠️ Относительные противопоказания (Адаптация):</strong>
                <ul className="space-y-1 pl-4 list-disc text-stone-300 text-[11px] leading-relaxed">
                  <li><strong>Варикозное расширение вен:</strong> парить ноги вениками категорически запрещено! Прогревается только верхняя часть тела мягким паром.</li>
                  <li><strong>Беременность:</strong> только мягкий арома-релакс на нижнем полке без контрастов и хлестких ударов.</li>
                  <li>Недавние травмы и свежие операционные рубцы.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Block 3: Interactive Guest Triage Simulator (3 Real Guest Cases) */}
          <div className="rounded-2xl border-2 border-amber-500/40 bg-stone-950/95 p-5 sm:p-6 space-y-5 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-850 pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider font-mono">
                  <Scale className="w-4 h-4 text-amber-400" />
                  <span>3. Интерактивный тренажер по приемке гостя</span>
                </div>
                <h4 className="font-serif text-base sm:text-lg font-bold text-stone-100 mt-1">
                  Входной триаж: Диагностика, анамнез и вердикт пармастера
                </h4>
              </div>
              
              {/* Progress counter & solved count */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-900 border border-stone-800 text-xs font-mono">
                <span className="text-stone-400">Верно решено:</span>
                <span className="font-bold text-emerald-400">{solvedCount} из {GUEST_CASES.length}</span>
                {allCasesSolved && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              </div>
            </div>

            {/* 3 Guest Selector Tabs with Status Indicators */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-mono text-stone-400 uppercase tracking-wider font-semibold">
                Выберите гостя для приемки и вынесения вердикта:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {GUEST_CASES.map((g, idx) => {
                  const isSolved = !!solvedGuests[g.id];
                  const isCurrent = currentGuestIdx === idx;
                  const attempt = guestVerdicts[g.id];
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => handleSwitchGuest(idx)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
                        isCurrent
                          ? 'bg-amber-500/15 border-amber-400 text-amber-200 ring-1 ring-amber-400/40'
                          : isSolved
                          ? 'bg-emerald-950/30 border-emerald-500/40 text-stone-300 hover:border-emerald-500/60'
                          : attempt && !attempt.isCorrect
                          ? 'bg-rose-950/30 border-rose-500/40 text-stone-300 hover:border-rose-500/60'
                          : 'bg-stone-900/60 border-stone-800 text-stone-400 hover:border-stone-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                          isCurrent
                            ? 'bg-amber-500 text-stone-950'
                            : isSolved
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-stone-800 text-stone-300 border border-stone-700'
                        }`}>
                          {idx + 1}
                        </div>
                        <div className="min-w-0">
                          <div className="font-serif font-bold text-xs text-stone-100 truncate">
                            {g.guestName.split(',')[0]}
                          </div>
                          <div className="text-[10px] text-stone-400 font-mono">
                            {g.age} лет · {g.bloodPressure.split(' ')[0]}
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {isSolved ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-mono font-bold flex items-center gap-1">
                            <Check className="w-3 h-3" /> Принят
                          </span>
                        ) : attempt && !attempt.isCorrect ? (
                          <span className="px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[10px] font-mono font-bold flex items-center gap-1">
                            <XCircle className="w-3 h-3" /> Ошибка
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-stone-800 text-stone-400 border border-stone-700 text-[10px] font-mono">
                            Ожидает
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Current Guest Dossier Card */}
            <div className="rounded-xl border border-stone-800 bg-stone-900/70 p-4 sm:p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800/80 pb-3">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center font-bold text-amber-300 text-sm shrink-0 shadow-inner">
                    {currentGuest.avatarText}
                  </div>
                  <div>
                    <h5 className="font-serif text-base sm:text-lg font-bold text-stone-100">
                      {currentGuest.guestName}
                    </h5>
                    <p className="text-xs text-stone-400 font-mono">
                      Давление в покое: <strong className="text-stone-200">{currentGuest.bloodPressure}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="px-3 py-1 rounded-xl bg-stone-950 border border-stone-800 text-xs font-mono text-stone-300">
                    Возраст: {currentGuest.age} лет
                  </span>
                  {currentGuest.age >= 60 && (
                    <span className="px-2.5 py-1 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-300 text-[11px] font-mono">
                      Старшая группа
                    </span>
                  )}
                  {currentGuest.symptoms.some(s => s.toLowerCase().includes('температура')) && (
                    <span className="px-2.5 py-1 rounded-xl bg-rose-950/50 border border-rose-500/50 text-rose-300 text-[11px] font-mono font-bold animate-pulse">
                      🔥 Лихорадка &gt; 37°C
                    </span>
                  )}
                </div>
              </div>

              {/* Direct Quote Request */}
              <div className="space-y-1">
                <div className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-semibold">
                  Слова и пожелания гостя при входе:
                </div>
                <div className="rounded-xl bg-stone-950/90 border-l-4 border-amber-500 p-3.5 sm:p-4 text-xs sm:text-sm text-stone-200 italic leading-relaxed shadow-inner">
                  {currentGuest.request}
                </div>
              </div>

              {/* Anamnesis & Medical Factors */}
              <div className="space-y-2">
                <div className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-semibold">
                  Выявленные симптомы и анамнез:
                </div>
                <div className="flex flex-wrap gap-2">
                  {currentGuest.symptoms.map((sym, i) => {
                    const isFever = sym.toLowerCase().includes('температура') || sym.toLowerCase().includes('воспал');
                    const isHeart = sym.toLowerCase().includes('сердеч') || sym.toLowerCase().includes('стентир');
                    return (
                      <span
                        key={i}
                        className={`px-2.5 py-1 rounded-lg text-xs flex items-center gap-1.5 font-medium ${
                          isFever
                            ? 'bg-rose-950/60 border border-rose-500/50 text-rose-300'
                            : isHeart
                            ? 'bg-amber-950/60 border border-amber-500/50 text-amber-300'
                            : 'bg-stone-950 border border-stone-800 text-stone-300'
                        }`}
                      >
                        <span>{isFever ? '🛑' : isHeart ? '⚠️' : 'ℹ️'}</span>
                        <span>{sym}</span>
                      </span>
                    );
                  })}
                  {currentGuest.medicalConditions.map((med, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-stone-950 border border-stone-800 text-stone-400 text-xs"
                    >
                      {med}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* 3 Decision Choice Options */}
            <div className="space-y-2.5">
              <div className="text-xs font-semibold text-stone-200 font-mono flex items-center justify-between">
                <span>Решение пармастера: какой вердикт вы выносите гостю?</span>
                {isCurrentSolved && (
                  <span className="text-emerald-400 text-[11px] font-mono font-bold">
                    Кейс успешно решен ✓
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Option 1: Standard Program */}
                <button
                  type="button"
                  onClick={() => handleSelectDecision('allow_standard')}
                  disabled={isCurrentSolved}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedDecision === 'allow_standard'
                      ? 'border-emerald-400 bg-emerald-950/40 text-emerald-200 ring-2 ring-emerald-400/50 shadow-md shadow-emerald-500/20'
                      : 'border-stone-800 bg-stone-900/80 text-stone-300 hover:border-stone-700'
                  } ${isCurrentSolved ? 'cursor-default opacity-85' : ''}`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-lg">🟢</span>
                    <strong className="font-bold text-stone-100 text-xs sm:text-sm">Стандартная программа</strong>
                  </div>
                  <p className="text-[11px] text-stone-400 leading-snug">
                    Полный классический цикл парения, 60–65°C, прогрев вениками, умеренный контраст по желанию.
                  </p>
                </button>

                {/* Option 2: Gentle Adapted Mode */}
                <button
                  type="button"
                  onClick={() => handleSelectDecision('allow_gentle_adapted')}
                  disabled={isCurrentSolved}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedDecision === 'allow_gentle_adapted'
                      ? 'border-amber-400 bg-amber-950/40 text-amber-200 ring-2 ring-amber-400/50 shadow-md shadow-amber-500/20'
                      : 'border-stone-800 bg-stone-900/80 text-stone-300 hover:border-stone-700'
                  } ${isCurrentSolved ? 'cursor-default opacity-85' : ''}`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-lg">🟡</span>
                    <strong className="font-bold text-stone-100 text-xs sm:text-sm">Щадящий спецрежим</strong>
                  </div>
                  <p className="text-[11px] text-stone-400 leading-snug">
                    Мягкий прогрев до 50–55°C, нижний полок, бесконтактное опахивание. СТРОГО БЕЗ холодной купели!
                  </p>
                </button>

                {/* Option 3: Strictly Prohibited */}
                <button
                  type="button"
                  onClick={() => handleSelectDecision('strictly_prohibited')}
                  disabled={isCurrentSolved}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedDecision === 'strictly_prohibited'
                      ? 'border-rose-400 bg-rose-950/40 text-rose-200 ring-2 ring-rose-400/50 shadow-md shadow-rose-500/20'
                      : 'border-stone-800 bg-stone-900/80 text-stone-300 hover:border-stone-700'
                  } ${isCurrentSolved ? 'cursor-default opacity-85' : ''}`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-lg">🔴</span>
                    <strong className="font-bold text-stone-100 text-xs sm:text-sm">Парение ЗАПРЕЩЕНО</strong>
                  </div>
                  <p className="text-[11px] text-stone-400 leading-snug">
                    Категорический отказ в пару по медицинским показаниям (температура / криз), перенос, врач.
                  </p>
                </button>
              </div>
            </div>

            {/* Verdict Action & Next Guest */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
              {!currentVerdict?.isCorrect ? (
                <button
                  type="button"
                  onClick={handleSubmitDecision}
                  disabled={!selectedDecision}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md disabled:cursor-not-allowed"
                >
                  Утвердить вердикт пармастера
                </button>
              ) : (
                <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Вердикт утвержден профессионально!</span>
                </div>
              )}

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                {currentVerdict && !currentVerdict.isCorrect && (
                  <button
                    type="button"
                    onClick={handleRetryGuest}
                    className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Выбрать другое решение</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleNextGuest}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-100 text-xs font-bold transition-all cursor-pointer border border-stone-700"
                >
                  <span>Следующий гость ({((currentGuestIdx + 1) % GUEST_CASES.length) + 1}/{GUEST_CASES.length})</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Diagnostic Medical Analysis Feedback */}
            {currentVerdict && (
              <div
                className={`rounded-xl p-4 sm:p-5 text-xs leading-relaxed border animate-fadeIn space-y-2 ${
                  currentVerdict.isCorrect
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                    : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-sm">
                  {currentVerdict.isCorrect ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                      <span className="text-emerald-300 font-serif">
                        Верно! Безупречное решение профессионала (+25 XP)
                      </span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-rose-400 shrink-0" />
                      <span className="text-rose-300 font-serif">
                        Опасная ошибка! Нарушение протокола безопасности гостя
                      </span>
                    </>
                  )}
                </div>
                <p className="opacity-95 text-stone-200 leading-relaxed font-sans">
                  {currentVerdict.isCorrect
                    ? currentGuest.reasoning
                    : `Выбранный вердикт противоречит медицинским показаниям для этого гостя. ${currentGuest.reasoning}`}
                </p>
              </div>
            )}

            {/* All Cases Solved Celebration Banner */}
            {allCasesSolved && (
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-950/50 via-stone-900 to-emerald-950/40 border-2 border-amber-400/60 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-fadeIn">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/25 border border-amber-400 flex items-center justify-center text-2xl shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.35)]">
                    🗝️
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase font-bold text-amber-400 tracking-wider">
                        Триаж успешно пройден!
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono font-bold">
                        ЗОЛОТОЙ КЛЮЧ РАЗБЛОКИРОВАН ✓
                      </span>
                    </div>
                    <h5 className="font-serif font-bold text-stone-100 text-sm sm:text-base mt-0.5">
                      Все 3 гостя приняты по эталонному стандарту банной безопасности!
                    </h5>
                    <p className="text-xs text-stone-300 mt-0.5 leading-snug">
                      Вы получили Золотой Ключ от сундука в Разделе 1 с рецептом быстрого восстановления сил пармастера (лимон, соль, мёд, вода).
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setActiveStep(1);
                    setIsSecretChestOpen(true);
                    playWoodTap(soundEnabled);
                    window.scrollTo({ top: 300, behavior: 'smooth' });
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md shrink-0 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <Unlock className="w-4 h-4 text-stone-950" />
                  <span>Перейти в Раздел 1 и открыть Сундук →</span>
                </button>
              </div>
            )}
          </div>

          {/* Sequential Navigation Buttons */}
          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setActiveStep(1);
                playWoodTap(soundEnabled);
              }}
              className="px-5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold text-xs transition-all cursor-pointer flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>← Назад к Разделу 1</span>
            </button>

            <button
              type="button"
              onClick={handleNextFromStep2}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-rose-400 hover:from-rose-400 hover:to-rose-300 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-rose-500/20 flex items-center gap-2"
            >
              <span>Ознакомлен с Разделом 2: Перейти к Разделу 3 →</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION 3: ERGONOMICS & THE ONLY INTERACTIVE (BENCH HEIGHT) */}
      {/* ========================================================= */}
      {activeStep === 3 && (
        <div className="space-y-5 animate-fadeIn">

          {/* Banner: Space Logistics & Energy Conservation */}
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3 text-xs leading-relaxed">
            <span className="text-2xl shrink-0">📐</span>
            <div className="text-stone-200">
              <strong className="text-emerald-300 font-bold block mb-0.5 text-sm">
                Эргономика парной: Подготовка пространства и логистика инвентаря
              </strong>
              В горячем пару силы и выносливость мастера расходуются в 3–4 раза быстрее. Каждый лишний шаг, наклон или поиск инвентаря накапливает усталость, которая к концу смены приводит к тремору и мышечному истощению. До церемонии всё должно быть расставлено по сценарию!
            </div>
          </div>

          {/* Block 1: Space Prep & Logistics */}
          <div className="rounded-2xl border border-stone-800 bg-stone-900/70 p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider font-mono border-b border-stone-800 pb-3">
              <Activity className="w-4 h-4 text-amber-400" />
              <span>1. Расстановка инвентаря по программе церемонии (0 лишних шагов)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-stone-950/80 border border-stone-800 space-y-1">
                <strong className="text-amber-300 block">Печной сектор (0 шагов)</strong>
                <p className="text-stone-400 text-[11px] leading-relaxed">
                  Запарники с горячей водой для каменки, травяные настои и длинный черпак (рукоять 50–70 см) стоят на удобной полке на расстоянии вытянутой руки. Никаких наклонов к полу за ковшом!
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-950/80 border border-stone-800 space-y-1">
                <strong className="text-sky-300 block">Порядок программы парения</strong>
                <p className="text-stone-400 text-[11px] leading-relaxed">
                  Инвентарь разложен строго по этапам: сначала веер/опахало для бесконтактного прогрева, затем дубовые веники у бедра мастера, холодная пихта — у изголовья полока.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-950/80 border border-stone-800 space-y-1">
                <strong className="text-emerald-300 block">Свободный чистый коридор</strong>
                <p className="text-stone-400 text-[11px] leading-relaxed">
                  Проход вдоль полока свободен от шлангов, забытых тазиков и ведер под ногами. Распаренные дубовые листья обязательно смываются струей воды в трап (мокрый лист скользит опаснее льда!).
                </p>
              </div>
            </div>
          </div>

          {/* Block 2: THE ONLY INTERACTIVE ON LEVEL 4: Bench Height Calibration */}
          <div className="rounded-2xl border-2 border-emerald-500/50 bg-stone-950/90 p-5 sm:p-6 space-y-5 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono">
                  <Ruler className="w-4 h-4 text-emerald-400" />
                  <span>Интерактивный тренажер: Калибровка высоты полка под рост</span>
                </div>
                <h4 className="font-serif text-base sm:text-lg font-bold text-stone-100 mt-1">
                  Тест высоты полка: расчёт нагрузки на поясничные диски L4–L5
                </h4>
              </div>

              <button
                type="button"
                onClick={() => {
                  setBenchHeight(optimalBenchHeight);
                  playSteamSound(soundEnabled);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 text-xs font-mono flex items-center gap-2 transition-all cursor-pointer self-start sm:self-auto"
                title="Сбросить высоту полка в эталон"
              >
                <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
                <span>Выставить эталон ({optimalBenchHeight} см)</span>
              </button>
            </div>

            {/* Sliders */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Slider 1: Master Height */}
              <div className="space-y-2 p-4 rounded-xl bg-stone-900/60 border border-stone-800">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-stone-300 font-medium">Рост пармастера:</span>
                  <span className="font-mono font-bold text-amber-400 text-sm">{masterHeight} см</span>
                </div>
                <input
                  type="range"
                  min="155"
                  max="205"
                  step="1"
                  value={masterHeight}
                  onChange={(e) => setMasterHeight(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-stone-500 font-mono">
                  <span>155 см</span>
                  <span>180 см</span>
                  <span>205 см</span>
                </div>
                <div className="text-[11px] text-stone-400 pt-1 leading-snug">
                  Расчетная высота костяшек кулака: <strong className="text-emerald-300">{optimalBenchHeight} см</strong> от пола.
                </div>
              </div>

              {/* Slider 2: Actual Bench Height */}
              <div className="space-y-2 p-4 rounded-xl bg-stone-900/60 border border-stone-800">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-stone-300 font-medium">Текущая высота полка в парной:</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">{benchHeight} см</span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="105"
                  step="1"
                  value={benchHeight}
                  onChange={(e) => {
                    setBenchHeight(Number(e.target.value));
                    playWoodTap(soundEnabled);
                  }}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-stone-500 font-mono">
                  <span>60 см (низкий)</span>
                  <span>{optimalBenchHeight} см (эталон)</span>
                  <span>105 см (высокий)</span>
                </div>
                <div className="text-[11px] text-stone-400 pt-1 leading-snug flex items-center justify-between">
                  <span>Разница с эталоном:</span>
                  <span className={`font-mono font-bold ${benchDiff === 0 ? 'text-emerald-400' : Math.abs(benchDiff) <= 5 ? 'text-amber-400' : 'text-rose-400'}`}>
                    {benchDiff > 0 ? `+${benchDiff} см` : `${benchDiff} см`}
                  </span>
                </div>
              </div>

            </div>

            {/* Diagnostic Box */}
            <div className={`p-4 rounded-xl border text-xs leading-relaxed space-y-1.5 transition-all ${benchEval.color}`}>
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono font-bold uppercase tracking-wider text-[11px]">
                  {benchEval.badge}
                </span>
                <span className="text-[11px] opacity-75 font-mono">
                  Биомеханика позвоночника
                </span>
              </div>
              <strong className="block text-sm font-semibold">
                {benchEval.title}
              </strong>
              <p className="opacity-90 text-xs leading-relaxed">
                {benchEval.desc}
              </p>
            </div>
          </div>

          {/* Block 3: Biomechanics & Steam Safety Standards */}
          <div className="rounded-2xl border border-stone-800 bg-stone-900/70 p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono border-b border-stone-800 pb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>3. Стандарты безопасности движений и пространства</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-stone-950/80 border border-stone-800 space-y-1.5">
                <strong className="text-emerald-300 text-sm block">🥋 Биомеханика «Банного тайчи»</strong>
                <p className="text-stone-400 leading-relaxed">
                  Спина всегда прямая! Импульс зарождается в перекате стоп и пружинящих коленях. Наклон осуществляется только в тазобедренных суставах. Хлест веником выполняется расслабленной кистью за счет веса лиственной подушки, без зажима плеч.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-950/80 border border-stone-800 space-y-1.5">
                <strong className="text-sky-300 text-sm block">💨 Вентиляция и «Второе дыхание»</strong>
                <p className="text-stone-400 leading-relaxed">
                  Обязательно залповое проветривание (окно и дверь настежь на 1.5–2 минуты) между заходами для удаления углекислого газа CO2. Система «Второе дыхание» подает прохладный уличный кислород прямо к лицу лежащего гостя, предотвращая гипоксию.
                </p>
              </div>
            </div>
          </div>

          {/* Navigation & Finalize Button */}
          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setActiveStep(2);
                playWoodTap(soundEnabled);
              }}
              className="px-5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold text-xs transition-all cursor-pointer flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>← Назад к Разделу 2</span>
            </button>

            <button
              type="button"
              onClick={handleFinishStep3}
              className={`px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg flex items-center gap-2 ${
                completedSteps.step3
                  ? 'bg-emerald-950 border border-emerald-500/50 text-emerald-300'
                  : 'bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-stone-950 shadow-emerald-500/20 active:scale-95'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{completedSteps.step3 ? 'Разделы безопасности пройдены (✓)' : 'Завершить изучение безопасности (+40 XP)'}</span>
            </button>
          </div>

        </div>
      )}

      {/* Master Recipe Chest Modal (Formula: Lemon + Salt + Honey + Water) */}
      <MasterRecipeChestModal
        isOpen={isSecretChestOpen}
        onClose={() => setIsSecretChestOpen(false)}
        hasKey={hasGoldenKey}
        soundEnabled={soundEnabled}
        onGoToTriage={() => {
          setIsSecretChestOpen(false);
          setActiveStep(2);
          window.scrollTo({ top: 400, behavior: 'smooth' });
        }}
      />

    </div>
  );
};
