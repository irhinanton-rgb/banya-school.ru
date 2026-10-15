import React, { useState } from 'react';
import { GUEST_CASES } from '../../data/courseData';
import { GuestCase } from '../../types/banya';
import { playSuccessChime, playSteamSound, playWoodTap } from '../../utils/audio';
import confetti from 'canvas-confetti';
import {
  ShieldAlert,
  Heart,
  CheckCircle2,
  XCircle,
  ArrowRight,
  AlertTriangle,
  Zap,
  Flame,
  Droplet,
  Coffee,
  Sparkles,
  User,
  Activity,
  Bed,
  Scale,
  Ban,
  Clock,
  ThumbsUp,
  Ruler,
  Wind,
  Footprints,
  ShieldCheck,
  RotateCcw,
  Check,
  Key,
  Lock,
  Unlock,
  Sun,
  Thermometer,
} from 'lucide-react';
import { SecretChestModal } from '../inventory/SecretChestModal';

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
  const [activeTab, setActiveTab] = useState<'master' | 'guest' | 'ergonomics'>('master');

  // --- Master Safety State ---
  const [isSecretChestOpen, setIsSecretChestOpen] = useState<boolean>(false);
  const hasGoldenKey = unlockedBadges.includes('golden_key') || localStorage.getItem('banya_golden_key_awarded') === 'true';
  const [boostIngredients, setBoostIngredients] = useState<{
    salt: boolean;
    lemon: boolean;
    honey: boolean;
    water: boolean;
  }>({
    salt: true,
    lemon: true,
    honey: true,
    water: true,
  });
  const [isBoostPrepared, setIsBoostPrepared] = useState<boolean>(false);
  const [masterChecklist, setMasterChecklist] = useState<{
    sleep: boolean;
    nutrition: boolean;
    cap: boolean;
    limit: boolean;
  }>({
    sleep: false,
    nutrition: false,
    cap: false,
    limit: false,
  });

  // --- Ergonomics State ---
  const [masterHeight, setMasterHeight] = useState<number>(180);
  const [benchHeight, setBenchHeight] = useState<number>(79);
  const [ergoChecklist, setErgoChecklist] = useState<{
    benchGeom: boolean;
    biomechanics: boolean;
    stoveSafety: boolean;
    antiSlip: boolean;
    ventilation: boolean;
    broomCheck: boolean;
  }>({
    benchGeom: false,
    biomechanics: false,
    stoveSafety: false,
    antiSlip: false,
    ventilation: false,
    broomCheck: false,
  });
  const [isErgoAuditPassed, setIsErgoAuditPassed] = useState<boolean>(false);

  // --- Guest Safety State ---
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [selectedDecision, setSelectedDecision] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [solvedCount, setSolvedCount] = useState<number>(0);

  const currentCase: GuestCase = GUEST_CASES[currentIdx] || GUEST_CASES[0];

  const handleSelectDecision = (decision: string) => {
    if (hasSubmitted) return;
    setSelectedDecision(decision);
    playWoodTap(soundEnabled);
  };

  const handleSubmitDecision = () => {
    if (!selectedDecision || hasSubmitted) return;
    setHasSubmitted(true);

    const isCorrect = selectedDecision === currentCase.correctDecision;
    if (isCorrect) {
      playSuccessChime(soundEnabled);
      setSolvedCount((prev) => prev + 1);
      if (onGrantXp) onGrantXp(30);
      if (onSuccess) onSuccess();
      if (onGuestSafetyCompleted) onGuestSafetyCompleted();
      
      // Award the Golden Key to open the Secret Chest of Master Recipes!
      localStorage.setItem('banya_golden_key_awarded', 'true');
      if (onUnlockBadge) {
        onUnlockBadge('golden_key', 50);
      }
      
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.7 },
        });
      } catch {
        // ignore
      }
    }
  };

  const handleNextGuest = () => {
    setSelectedDecision(null);
    setHasSubmitted(false);
    setCurrentIdx((prev) => (prev + 1) % GUEST_CASES.length);
    playWoodTap(soundEnabled);
  };

  const isCurrentCorrect = selectedDecision === currentCase.correctDecision;

  // Master Electrolyte Boost Handler
  const handlePrepareBoost = () => {
    setIsBoostPrepared(true);
    playSteamSound(soundEnabled);
    playSuccessChime(soundEnabled);
    if (onGrantXp) onGrantXp(30);
    if (onSuccess) onSuccess();
    if (onMasterSafetyCompleted) onMasterSafetyCompleted();
    try {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }
  };

  // Checklist toggles
  const handleToggleChecklist = (key: keyof typeof masterChecklist) => {
    playWoodTap(soundEnabled);
    const updated = { ...masterChecklist, [key]: !masterChecklist[key] };
    setMasterChecklist(updated);
    
    // If all 4 checked, give feedback and trigger master safety task completion
    if (Object.values(updated).filter(Boolean).length === 4) {
      playSuccessChime(soundEnabled);
      if (onGrantXp) onGrantXp(20);
      if (onMasterSafetyCompleted) onMasterSafetyCompleted();
    }
  };



  // Ergonomics calculations
  const optimalBenchHeight = Math.round(masterHeight * 0.44);
  const benchDiff = benchHeight - optimalBenchHeight;

  const getBenchEvaluation = () => {
    if (benchDiff < -5) {
      return {
        level: 'danger',
        badge: `ПОЯСНИЧНЫЙ СГИБ (${benchDiff} см)`,
        color: 'text-rose-400',
        bg: 'bg-rose-950/40 border-rose-500/50',
        title: 'ОПАСНОСТЬ: Травмирующий наклон корпуса и перегрузка L4-L5',
        desc: `Полок занижен на ${Math.abs(benchDiff)} см относительно костяшек кулака мастера. При наклоне рычаг компрессионного давления на межпозвонковые диски поясницы превышает 200–250 кг! Это прямой путь к протрузиям, защемлению седалищного нерва и выгоранию. Решение: использовать подиум/трап под ноги мастера или поднять полок.`,
      };
    }
    if (benchDiff > 5) {
      return {
        level: 'warning',
        badge: `ЗАВЫШЕННЫЙ ПОЛОК (+${benchDiff} см)`,
        color: 'text-amber-400',
        bg: 'bg-amber-950/40 border-amber-500/50',
        title: 'ВНИМАНИЕ: Перегрузка плеч и риск ожога рук в паровом пироге',
        desc: `Полок завышен на ${benchDiff} см. Мастер вынужден задирать локти и предплечья. Руки попадают в зону перегретого верхнего пара (>75-80°C). Перенапрягаются трапециевидные и дельтовидные мышцы, пережимаются сосуды шеи, мастер быстро задыхается и устает.`,
      };
    }
    return {
      level: 'optimal',
      badge: 'ЗОЛОТОЙ СТАНДАРТ ЭРГОНОМИКИ',
      color: 'text-emerald-400',
      bg: 'bg-emerald-950/40 border-emerald-500/50',
      title: 'ИДЕАЛЬНАЯ БИОМЕХАНИКА («БАННОЕ ТАЙЧИ»)',
      desc: `Высота полка (${benchHeight} см) строго соответствует уровню костяшек опущенного кулака при росте ${masterHeight} см. Спина прямая, лопатки сведены. Работа идет исключительно от пружинящих коленей и центра тяжести (таза). Нулевая усталость спины даже при 4–5 парениях!`,
    };
  };

  const benchEval = getBenchEvaluation();

  const handleToggleErgoItem = (key: keyof typeof ergoChecklist) => {
    playWoodTap(soundEnabled);
    setErgoChecklist((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      const allDone = Object.values(next).every(Boolean);
      if (allDone && !isErgoAuditPassed) {
        setIsErgoAuditPassed(true);
        playSuccessChime(soundEnabled);
        if (onGrantXp) onGrantXp(30);
        if (onSuccess) onSuccess();
        if (onErgonomicsSafetyCompleted) onErgonomicsSafetyCompleted();
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
      return next;
    });
  };

  const handleCompleteErgoAudit = () => {
    setIsErgoAuditPassed(true);
    setErgoChecklist({
      benchGeom: true,
      biomechanics: true,
      stoveSafety: true,
      antiSlip: true,
      ventilation: true,
      broomCheck: true,
    });
    playSteamSound(soundEnabled);
    playSuccessChime(soundEnabled);
    if (onGrantXp) onGrantXp(30);
    if (onSuccess) onSuccess();
    if (onErgonomicsSafetyCompleted) onErgonomicsSafetyCompleted();
    try {
      confetti({
        particleCount: 60,
        spread: 80,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }
  };

  return (
    <div className="rounded-2xl border border-stone-800 bg-stone-900/90 p-5 sm:p-7 space-y-6">
      
      {/* Header & 3 Main Visual Blocks Switcher */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-stone-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
            <span>🛡️</span>
            <span>Глава 4 · Три столпа безопасности</span>
          </div>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-100 mt-1">
            Безопасность в парной: Мастер, Гость & Эргономика
          </h3>
          <p className="text-xs text-stone-400 mt-1 max-w-2xl leading-relaxed">
            Фундаментальный стандарт профессии: ресурс пармастера, строгий триаж гостя и грамотно организованное пространство парной.
          </p>
        </div>

        {/* Tab Buttons for 3 Sections */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-stone-950 rounded-xl border border-stone-800 shrink-0">
          <button
            onClick={() => {
              setActiveTab('master');
              playWoodTap(soundEnabled);
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'master'
                ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>1. Безопасность мастера</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('guest');
              playWoodTap(soundEnabled);
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'guest'
                ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>2. Безопасность гостя</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('ergonomics');
              playWoodTap(soundEnabled);
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'ergonomics'
                ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>3. Безопасность в парной: эргономика</span>
          </button>
        </div>
      </div>

      {/* Visual Navigation Cards - 3 Pillars Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <button
          onClick={() => {
            setActiveTab('master');
            playWoodTap(soundEnabled);
          }}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
            activeTab === 'master'
              ? 'bg-amber-500/10 border-amber-500/60 ring-1 ring-amber-500/40'
              : 'bg-stone-950/60 border-stone-850 hover:border-stone-700'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-mono font-bold uppercase text-amber-400 flex items-center gap-1.5">
              <span>👑</span> Раздел 1
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-900 border border-stone-800 text-stone-400 font-mono">
              {Object.values(masterChecklist).filter(Boolean).length}/4 чек
            </span>
          </div>
          <div className="font-serif font-bold text-sm text-stone-100">Безопасность пармастера</div>
          <p className="text-[11px] text-stone-400 mt-1 line-clamp-1">
            Сон ≥8ч, еда, перегрев, вред 5-15 купелей, буст
          </p>
        </button>

        <button
          onClick={() => {
            setActiveTab('guest');
            playWoodTap(soundEnabled);
          }}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
            activeTab === 'guest'
              ? 'bg-rose-500/10 border-rose-500/60 ring-1 ring-rose-500/40'
              : 'bg-stone-950/60 border-stone-850 hover:border-stone-700'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-mono font-bold uppercase text-rose-400 flex items-center gap-1.5">
              <span>⚖️</span> Раздел 2
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-900 border border-stone-800 text-stone-400 font-mono">
              {solvedCount} решено
            </span>
          </div>
          <div className="font-serif font-bold text-sm text-stone-100">Безопасность гостя</div>
          <p className="text-[11px] text-stone-400 mt-1 line-clamp-1">
            Табу на медпомощь без диплома, триаж, вызов 112
          </p>
        </button>

        <button
          onClick={() => {
            setActiveTab('ergonomics');
            playWoodTap(soundEnabled);
          }}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
            activeTab === 'ergonomics'
              ? 'bg-emerald-500/10 border-emerald-500/60 ring-1 ring-emerald-500/40'
              : 'bg-stone-950/60 border-stone-850 hover:border-stone-700'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-mono font-bold uppercase text-emerald-400 flex items-center gap-1.5">
              <span>📐</span> Раздел 3
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-900 border border-stone-800 text-stone-400 font-mono">
              {Object.values(ergoChecklist).filter(Boolean).length}/6 аудит
            </span>
          </div>
          <div className="font-serif font-bold text-sm text-stone-100">Безопасность в парной: эргономика</div>
          <p className="text-[11px] text-stone-400 mt-1 line-clamp-1">
            Высота полка (75-85 см), Банное тайчи, зона печи, пол
          </p>
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: MASTER SAFETY & PHYSIOLOGICAL RESILIENCE */}
      {/* ========================================================= */}
      {activeTab === 'master' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Priority Notice Banner */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs leading-relaxed">
            <span className="text-2xl shrink-0">👑</span>
            <div className="text-stone-200">
              <strong className="text-amber-300 font-bold block mb-0.5 text-sm">
                Главная аксиома профессии: Забота о себе — на первом месте
              </strong>
              Если мастер истощен, не выспался, голоден или перегрет — он теряет концентрацию, координацию и физически не способен обеспечить безопасность гостя. Профессионал выходит в парную только в ресурсном состоянии!
            </div>
          </div>

          {/* Subsection 1: Electrolytes and Microelements Balance (Critical loss during sessions) */}
          <div className="rounded-2xl border border-amber-500/30 bg-stone-950/90 p-5 sm:p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider font-mono">
                  <Activity className="w-4 h-4 text-amber-400" />
                  <span>Биохимия мастера в парной:</span>
                </div>
                <h4 className="font-serif text-lg font-bold text-stone-100 mt-1">
                  Колоссальная потеря электролитов и микроэлементов
                </h4>
              </div>
              <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono font-semibold self-start sm:self-auto">
                ⚡ До 2.5 л пота за смену
              </span>
            </div>

            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Работая у горячей каменки с тяжелыми вениками, мастер теряет в разы больше жидкости и солей, чем гость на полке. 
              <strong> Главная опасность — пить простую дистиллированную или фильтрованную воду:</strong> она не восполняет электролиты, а лишь разбавляет остаточную плазму крови (осмотический шок). Без микроэлементов прекращается передача нервных импульсов к мышцам.
            </p>

            {/* 4 Crucial Electrolytes Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-stone-900 border border-stone-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <strong className="text-amber-300 font-mono text-sm">Na+ (Натрий)</strong>
                  <span className="text-[10px] font-mono bg-stone-800 px-1.5 py-0.5 rounded text-stone-400">Потеря №1</span>
                </div>
                <div className="text-xs text-stone-200 font-semibold">Объём плазмы и тонус</div>
                <p className="text-[11px] text-stone-400 leading-snug">
                  При дефиците натрия резко падает давление, кружится голова, возникают судороги икр и кистей.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-900 border border-stone-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <strong className="text-rose-300 font-mono text-sm">K+ (Калий)</strong>
                  <span className="text-[10px] font-mono bg-stone-800 px-1.5 py-0.5 rounded text-stone-400">Ритм сердца</span>
                </div>
                <div className="text-xs text-stone-200 font-semibold">Проводимость миокарда</div>
                <p className="text-[11px] text-stone-400 leading-snug">
                  Уход калия с потом провоцирует экстрасистолы, сердечную аритмию и мышечную вялость в руках.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-900 border border-stone-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <strong className="text-emerald-300 font-mono text-sm">Mg2+ (Магний)</strong>
                  <span className="text-[10px] font-mono bg-stone-800 px-1.5 py-0.5 rounded text-stone-400">Антиспазм</span>
                </div>
                <div className="text-xs text-stone-200 font-semibold">Расслабление мышечных волокон</div>
                <p className="text-[11px] text-stone-400 leading-snug">
                  Недостаток магния вызывает неконтролируемый тремор пальцев, спазм предплечий и раздражительность.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-900 border border-stone-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <strong className="text-sky-300 font-mono text-sm">Cl- & Ca2+</strong>
                  <span className="text-[10px] font-mono bg-stone-800 px-1.5 py-0.5 rounded text-stone-400">Баланс кислот</span>
                </div>
                <div className="text-xs text-stone-200 font-semibold">Кислотно-щелочной гомеостаз</div>
                <p className="text-[11px] text-stone-400 leading-snug">
                  Хлор удерживает водный баланс клеток, а кальций регулирует силу сокращения мышц при работе с вениками.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/20 text-xs text-stone-300 leading-relaxed flex items-start gap-2.5">
              <span className="text-amber-400 text-base">🥤</span>
              <div>
                <strong className="text-amber-300 font-semibold">Золотое правило питьевого режима мастера:</strong> пить малыми глотками каждые 15–20 минут минеральную гидрокарбонатную воду без газа, изотонические растворы, домашние ягодные морсы с щепоткой соли или отвары из кураги и изюма.
              </div>
            </div>

            {/* SECRET CHEST OF MASTER RECIPES (Unlocks via Golden Key from Guest Triage) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-stone-900 to-amber-950/30 border-2 border-amber-500/40 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 border shadow-inner ${
                  hasGoldenKey 
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)]' 
                    : 'bg-stone-900 border-stone-700 text-stone-500'
                }`}>
                  {hasGoldenKey ? '🗝️' : '🔒'}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h5 className="font-serif font-bold text-stone-100 text-sm sm:text-base">
                      Сундук с тайными рецептами пармастера
                    </h5>
                    {hasGoldenKey ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold">
                        КЛЮЧ ЕСТЬ ✓
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-stone-800 text-stone-400 border border-stone-700 text-[10px] font-mono">
                        ЗАКРЫТ НА ЗАМОК
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-400 mt-0.5 leading-snug">
                    {hasGoldenKey 
                      ? 'Золотой Ключ у вас в руках! Откройте сундук и изучите секретный свиток «Фирменный лайфхак пармастера: Экстренный электролитный буст (Соль + Лимон + Мёд + Вода)» и другие закрытые формулы школы.' 
                      : 'Чтобы получить Золотой Ключ от сундука — перейдите во вкладку «Безопасность гостя» и успешно пройдите «Интерактивный тренажер входного триажа гостей»!'}
                  </p>
                </div>
              </div>

              <div className="shrink-0 w-full sm:w-auto">
                {hasGoldenKey ? (
                  <button
                    onClick={() => {
                      setIsSecretChestOpen(true);
                      playWoodTap(soundEnabled);
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-amber-500/30 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Unlock className="w-4 h-4 text-stone-950" />
                    <span>Открыть тайный сундук</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setActiveTab('guest');
                      playWoodTap(soundEnabled);
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Key className="w-4 h-4 text-amber-400" />
                    <span>Пройти триаж гостей за ключом →</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Subsection 2: Physiological Truth: Harm of Cold Plunge & The Vital Need for Gradual Open-Air Cooling */}
          <div className="rounded-2xl border border-rose-500/40 bg-stone-950/90 p-5 sm:p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-rose-400 uppercase tracking-wider font-mono">
                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                  <span>Физиологический разбор опасности:</span>
                </div>
                <h4 className="font-serif text-lg font-bold text-stone-100 mt-1">
                  Вред купели для пармастера: почему нельзя окунаться в процессе парения
                </h4>
              </div>
              <span className="px-3 py-1 rounded-full bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs font-mono font-semibold self-start sm:self-auto">
                ФИЗИОЛОГИЯ СЕРДЦА
              </span>
            </div>

            <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/30 text-xs sm:text-sm text-stone-200 leading-relaxed space-y-2">
              <p>
                Некоторые начинающие пармастера совершают грубую ошибку: <strong>за одно 15-минутное парение выскакивают в ледяную купель больше 7 раз</strong>, думая: <em>«Сбил жар — и полон сил»</em>. Это опаснейший самообман!
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-stone-900 border border-rose-500/20 space-y-1">
                  <div className="text-rose-400 font-bold text-xs flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5" />
                    <span>1. Запирание кипящего жара в ядре тела</span>
                  </div>
                  <p className="text-[11px] text-stone-400 leading-snug">
                    Ледяная вода вызывает мгновенный спазм капилляров кожи. Потоотделение блокируется, и всё внутреннее тепло оказывается наглухо запертым внутри. Температура жизненно важных органов продолжает расти — возникает скрытый тепловой удар ядра тела при обманчивом ощущении холодной кожи.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-stone-900 border border-rose-500/20 space-y-1">
                  <div className="text-rose-400 font-bold text-xs flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5" />
                    <span>2. Сосудистый криз и износ миокарда</span>
                  </div>
                  <p className="text-[11px] text-stone-400 leading-snug">
                    Смена температур каждые две минуты (+65°C / +10°C) вызывает скачки давления до 180–200 мм рт. ст. и мощнейший выброс адреналина. Сердечная мышца работает на износ, надпочечники истощаются, а риск аритмии взлетает в разы.
                  </p>
                </div>
              </div>
            </div>

            {/* Vital Recommendation: Gradual Open-Air Cooling */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-stone-900 to-stone-950 border border-emerald-500/40 space-y-3">
              <div className="flex items-center gap-2.5 text-emerald-300 font-bold text-sm font-serif">
                <Wind className="w-5 h-5 text-emerald-400" />
                <span>Золотой стандарт мастера: Постепенное остывание на открытом воздухе</span>
              </div>
              <p className="text-xs text-stone-300 leading-relaxed">
                В отличие от гостя, который приходит получить контраст и расслабиться, <strong>мастер находится под непрерывной физической нагрузкой</strong>. Его терморегуляция должна снижаться плавно и физиологично.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                <div className="p-3.5 rounded-xl bg-stone-900 border border-emerald-500/20 space-y-1.5">
                  <strong className="text-emerald-300 block">🍃 Плавное дыхание</strong>
                  <p className="text-stone-400 text-[11px] leading-snug">
                    Выйдите на открытый воздух или террасу. Медленный вдох носом и глубокий выдох ртом восстанавливают сердечный ритм без сосудистого спазма.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-stone-900 border border-emerald-500/20 space-y-1.5">
                  <strong className="text-emerald-300 block">💧 Мягкое умывание</strong>
                  <p className="text-stone-400 text-[11px] leading-snug">
                    Ополосните прохладной водой лицо, шею и кисти рук. Это стимулирует рецепторы блуждающего нерва (n. vagus), мягко снижая пульс.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-stone-900 border border-emerald-500/20 space-y-1.5">
                  <strong className="text-emerald-300 block">🧖 Теплое укутывание</strong>
                  <p className="text-stone-400 text-[11px] leading-snug">
                    Накиньте сухой вафельный халат или льняную простыню. Организм отдаст лишнее тепло в атмосферу мягко, сохранив здоровье сосудов на десятилетия.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Subsection 3: Master Emergency Fuel Lifehack */}
          

        </div>
      )}

    </div>
  );
};
