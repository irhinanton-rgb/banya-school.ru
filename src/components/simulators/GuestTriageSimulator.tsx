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
import { MasterRecipeChestModal } from '../inventory/MasterRecipeChestModal';

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
  const [showKeyTooltip, setShowKeyTooltip] = useState<boolean>(false);
  const hasGoldenKey = unlockedBadges.includes('golden_key') || (typeof window !== 'undefined' && localStorage.getItem('banya_golden_key_awarded') === 'true');
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
                      ? 'Золотой Ключ у вас в руках! Откройте сундук и изучите секретные рецепты восстановления и банных эликсиров.' 
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
          <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-br from-stone-950 via-stone-900 to-amber-950/20 p-5 sm:p-6 space-y-5">
            <div className="flex items-start justify-between gap-4 border-b border-stone-800 pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider font-mono">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Фирменный лайфхак пармастера:</span>
                </div>
                <h4 className="font-serif text-lg font-bold text-stone-100 mt-1">
                  Экстренный электролитный буст: Соль + Лимон + Мёд + Вода
                </h4>
              </div>
              <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono font-semibold shrink-0">
                ⚡ Скорая помощь силам
              </span>
            </div>

            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Бывает ситуация: смена затянулась, сил уже нет, мышцы начинают подрагивать от нехватки солей, но <strong>гостя необходимо допарить на высочайшем уровне</strong>. Кофеин и энергетики под запретом (они добьют сердце). Используем древний физиологический эликсир:
            </p>

            {/* Visual Recipe Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-stone-900 border border-stone-800 text-center space-y-1">
                <span className="text-2xl block">🧂</span>
                <strong className="block text-stone-100 text-xs">1/3 ч. л. соли</strong>
                <span className="text-[10px] text-stone-400 block leading-tight">
                  Натрий и хлор: моментально снимает спазмы и держит объем плазмы крови
                </span>
              </div>

              <div className="p-3 rounded-xl bg-stone-900 border border-stone-800 text-center space-y-1">
                <span className="text-2xl block">🍋</span>
                <strong className="block text-stone-100 text-xs">Сок лимона</strong>
                <span className="text-[10px] text-stone-400 block leading-tight">
                  Органический калий и витамин C: тонизирует капилляры и щелочной баланс
                </span>
              </div>

              <div className="p-3 rounded-xl bg-stone-900 border border-stone-800 text-center space-y-1">
                <span className="text-2xl block">🍯</span>
                <strong className="block text-stone-100 text-xs">1 ч. л. мёда</strong>
                <span className="text-[10px] text-stone-400 block leading-tight">
                  Быстрые углеводы: питание нейронов и мышечный гликоген
                </span>
              </div>

              <div className="p-3 rounded-xl bg-stone-900 border border-stone-800 text-center space-y-1">
                <span className="text-2xl block">💧</span>
                <strong className="block text-stone-100 text-xs">Стакан тёплой воды</strong>
                <span className="text-[10px] text-stone-400 block leading-tight">
                  250 мл: моментальное всасывание в русло крови
                </span>
              </div>
            </div>

            {/* Action button to prepare boost */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <div className="text-xs text-stone-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  Смешать в кружке, выпить медленными глотками за 3 минуты до финала парения.
                </span>
              </div>

              <button
                onClick={handlePrepareBoost}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-amber-500/20 active:scale-95 shrink-0 flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 fill-stone-950" />
                <span>{isBoostPrepared ? 'Буст приготовлен (+30 XP)' : 'Приготовить электролитный буст (+30 XP)'}</span>
              </button>
            </div>

            {/* Warning Callout */}
            <div className="rounded-xl bg-rose-950/40 border border-rose-500/40 p-4 text-xs text-rose-200 leading-relaxed flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-rose-300 font-bold block mb-0.5">
                  КРИТИЧЕСКОЕ ПРЕДОСТЕРЕЖЕНИЕ НАСТАВНИКА:
                </strong>
                Этот напиток — <strong>лишь временный буст</strong>, чтобы мобилизовать последние резервы и допарить гостя! Это «аварийный кредит у организма», а не постоянная система. Перед новой затяжной сменой и сразу после нее обязателен полноценный 8-часовой сон, качественная еда и глубокое восстановление.
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: GUEST SAFETY & LEGAL BOUNDARIES */}
      {/* ========================================================= */}
      {activeTab === 'guest' && (
        <div className="space-y-6 animate-fadeIn">

          {/* KEY REWARD BANNER FOR MASTER RECIPE CHEST */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-950/60 via-stone-900 to-amber-950/50 border-2 border-amber-500/50 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-2xl shrink-0 shadow-[0_0_20px_rgba(245,158,11,0.35)]">
                🗝️
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase font-bold text-amber-400 tracking-wider">
                    Награда за Интерактив
                  </span>
                  {hasGoldenKey && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono font-bold">
                      ПОЛУЧЕН ✓
                    </span>
                  )}
                </div>
                <h4 className="font-serif font-bold text-stone-100 text-sm sm:text-base mt-0.5">
                  Золотой Ключ от Сундука с секретным рецептом мастера
                </h4>
                <p className="text-xs text-stone-300 mt-0.5 leading-snug">
                  {hasGoldenKey
                    ? 'Поздравляем! Вы успешно прошли триаж и получили Золотой Ключ. Теперь вы можете открыть сундук в Разделе 1 (Безопасность мастера)!'
                    : 'Пройдите интерактивный тренажер входного триажа гостей ниже — за верное решение кейсов вам будет выдан Золотой Ключ от сундука с тайным рецептом в Разделе 1!'}
                </p>
              </div>
            </div>

            {hasGoldenKey && (
              <button
                type="button"
                onClick={() => {
                  setActiveTab('master');
                  setIsSecretChestOpen(true);
                  playWoodTap(soundEnabled);
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md shrink-0 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Unlock className="w-4 h-4 text-stone-950" />
                <span>Открыть Сундук с рецептом →</span>
              </button>
            )}
          </div>
          
          {/* Strict Legal Prohibition Banner */}
          <div className="rounded-2xl border-2 border-rose-500/80 bg-gradient-to-r from-rose-950/90 via-stone-950 to-rose-950/80 p-5 sm:p-6 space-y-3 shadow-xl relative overflow-hidden">
            <div className="flex items-start gap-3.5">
              <div className="h-10 w-10 rounded-xl bg-rose-500/20 border border-rose-500/50 flex items-center justify-center text-rose-400 shrink-0 text-xl font-bold">
                <Ban className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-mono font-bold uppercase tracking-wider">
                    Юридический закон & Этика мастера
                  </span>
                  <span className="text-xs text-rose-400 font-mono font-semibold">
                    СТРОГО ОБЯЗАТЕЛЬНО К СОБЛЮДЕНИЮ
                  </span>
                </div>
                <h4 className="font-serif text-base sm:text-lg font-bold text-rose-200">
                  Пармастер НЕ ИМЕЕТ ПРАВА оказывать медицинскую помощь без медицинского образования!
                </h4>
                <p className="text-xs text-stone-300 leading-relaxed pt-1">
                  Пармастер — специалист традиционного оздоровления и банной культуры, а <strong>не врач</strong>. Категорически запрещено:
                </p>
                <ul className="text-xs text-stone-300 space-y-1 list-disc list-inside pt-0.5 font-sans">
                  <li>Ставить любые медицинские диагнозы («у вас хондроз», «у вас сосудистый криз»);</li>
                  <li><strong>Назначать или давать лекарственные препараты</strong> (любые таблетки от давления, сердца, аспирин, обезболивающие из своей аптечки);</li>
                  <li>Вправлять вывихи, хрустеть позвоночником или проводить медицинские манипуляции.</li>
                </ul>
                <div className="p-3 rounded-xl bg-stone-950/90 border border-rose-500/30 text-xs text-rose-200 font-mono mt-2 flex items-center gap-2">
                  <span>🚑</span>
                  <span>
                    <strong>Единственно верный протокол при ЧП:</strong> доврачебная поддержка (вывести из жара, горизонталь, ноги вверх, свежий воздух, вода) и <strong>НЕМЕДЛЕННЫЙ ВЫЗОВ СКОРОЙ ПОМОЩИ (112 / 103)</strong>!
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Visual Reference: Absolute Taboos vs Safe First Aid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-rose-500/30 bg-rose-950/20 p-5 space-y-3">
              <div className="flex items-center gap-2 text-rose-400 text-xs font-bold font-mono uppercase">
                <ShieldAlert className="w-4 h-4" />
                <span>Абсолютные табу гостя (Парение ЗАПРЕЩЕНО)</span>
              </div>
              <ul className="text-xs text-stone-300 space-y-2 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-rose-400">⛔</span>
                  <span><strong>Температура тела выше 37.0°C:</strong> нагрузка на сердце вырастает в разы, смертельный риск миокардита!</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400">⛔</span>
                  <span><strong>Алкогольное опьянение:</strong> сосудистый паралич, риск мгновенного инсульта или потери сознания.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400">⛔</span>
                  <span><strong>Тяжелая гипертония 3 степени / криз:</strong> давление выше 160/100 мм рт. ст. — полный запрет.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400">⛔</span>
                  <span><strong>Онкология, эпилепсия, свежие послеоперационные рубцы.</strong></span>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-5 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold font-mono uppercase">
                <CheckCircle2 className="w-4 h-4" />
                <span>Безопасный доврачебный алгоритм при ЧП</span>
              </div>
              <ul className="text-xs text-stone-300 space-y-2 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400">1.</span>
                  <span><strong>Немедленная эвакуация:</strong> плавно вывести гостя из парной в прохладную зону отдыха.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400">2.</span>
                  <span><strong>Горизонтальное положение:</strong> уложить на топчан, ноги приподнять на валик для притока крови к мозгу.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400">3.</span>
                  <span><strong>Охлаждение головы:</strong> влажное прохладное полотенце на лоб и виски, расстегнуть воротник, приток воздуха.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400">4.</span>
                  <span><strong>Звонок 112:</strong> при малейшей потере сознания, боли за грудиной или судорогах — немедленно вызывать медиков!</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Interactive Guest Triage Simulator */}
          <div className="rounded-2xl border border-stone-800 bg-stone-950/90 p-5 sm:p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-850 pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider font-mono">
                  <Scale className="w-4 h-4 text-amber-400" />
                  <span>Интерактивный тренажер входного триажа гостей</span>
                </div>
                <h4 className="font-serif text-base sm:text-lg font-bold text-stone-100 mt-1">
                  Приемка Гостя: Диагностика, анамнез и юридический вердикт
                </h4>
              </div>

              <div className="flex items-center gap-3 text-xs font-mono text-stone-400 shrink-0">
                <span>Гость {currentIdx + 1} из {GUEST_CASES.length}</span>
                <span className="text-stone-700">·</span>
                <span>Верно: <strong className="text-emerald-400">{solvedCount}</strong></span>
              </div>
            </div>

            {/* Current Guest Dossier Card */}
            <div className="rounded-xl border border-stone-800 bg-stone-900/60 p-5 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center font-bold text-amber-300 text-sm">
                    {currentCase.avatarText}
                  </div>
                  <div>
                    <h4 className="font-serif text-lg font-bold text-stone-100">{currentCase.guestName}</h4>
                    <p className="text-xs text-stone-400 font-mono">Давление: {currentCase.bloodPressure}</p>
                  </div>
                </div>

                <div className="px-3 py-1 rounded-xl bg-stone-950 border border-stone-800 text-xs font-mono text-stone-300">
                  Возраст: {currentCase.age} лет
                </div>
              </div>

              {/* Guest Request Quote */}
              <div className="rounded-xl bg-stone-950/80 border-l-4 border-amber-500 p-4 text-xs sm:text-sm text-stone-200 italic leading-relaxed">
                {currentCase.request}
              </div>

              {/* Symptoms / Medical Conditions */}
              <div className="space-y-1.5">
                <div className="text-[11px] text-stone-400 font-mono uppercase tracking-wider">
                  Анамнез и выявленные факторы:
                </div>
                <div className="flex flex-wrap gap-2">
                  {currentCase.symptoms.map((sym, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-1.5"
                    >
                      <span>⚠️</span>
                      <span>{sym}</span>
                    </span>
                  ))}
                  {currentCase.medicalConditions.map((med, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-stone-950 border border-stone-700 text-stone-300 text-xs"
                    >
                      {med}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Decision Buttons */}
            <div className="space-y-3">
              <div className="text-xs font-semibold text-stone-300 font-mono">
                Решение пармастера: какой вердикт вы выносите гостю?
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  onClick={() => handleSelectDecision('allow_standard')}
                  disabled={hasSubmitted}
                  className={`p-4 rounded-xl border text-left text-xs font-medium transition-all cursor-pointer ${
                    selectedDecision === 'allow_standard'
                      ? 'border-emerald-500 bg-emerald-950/40 text-emerald-200 ring-1 ring-emerald-500'
                      : 'border-stone-800 bg-stone-900 text-stone-300 hover:border-stone-700'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-base">🟢</span>
                    <strong className="font-bold text-stone-100">Стандартная программа</strong>
                  </div>
                  <p className="text-[11px] text-stone-400 leading-snug">
                    Полный цикл парения, 60–70°C, контраст по желанию гостя.
                  </p>
                </button>

                <button
                  onClick={() => handleSelectDecision('allow_gentle_adapted')}
                  disabled={hasSubmitted}
                  className={`p-4 rounded-xl border text-left text-xs font-medium transition-all cursor-pointer ${
                    selectedDecision === 'allow_gentle_adapted'
                      ? 'border-amber-500 bg-amber-950/40 text-amber-200 ring-1 ring-amber-500'
                      : 'border-stone-800 bg-stone-900 text-stone-300 hover:border-stone-700'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-base">🟡</span>
                    <strong className="font-bold text-stone-100">Щадящий спецрежим</strong>
                  </div>
                  <p className="text-[11px] text-stone-400 leading-snug">
                    Мягкий прогрев до 50–55°C, нижний полок, СТРОГО без ледяной купели.
                  </p>
                </button>

                <button
                  onClick={() => handleSelectDecision('strictly_prohibited')}
                  disabled={hasSubmitted}
                  className={`p-4 rounded-xl border text-left text-xs font-medium transition-all cursor-pointer ${
                    selectedDecision === 'strictly_prohibited'
                      ? 'border-rose-500 bg-rose-950/40 text-rose-200 ring-1 ring-rose-500'
                      : 'border-stone-800 bg-stone-900 text-stone-300 hover:border-stone-700'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-base">🔴</span>
                    <strong className="font-bold text-stone-100">Парение ЗАПРЕЩЕНО</strong>
                  </div>
                  <p className="text-[11px] text-stone-400 leading-snug">
                    Отказ в процедуре по медицинским показаниям, консультация врача.
                  </p>
                </button>
              </div>
            </div>

            {/* Submit & Next Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              {!hasSubmitted ? (
                <button
                  onClick={handleSubmitDecision}
                  disabled={!selectedDecision}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md"
                >
                  Утвердить вердикт
                </button>
              ) : (
                <button
                  onClick={handleNextGuest}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-100 text-xs font-bold transition-all cursor-pointer border border-stone-700"
                >
                  <span>Следующий гость ({currentIdx + 1}/{GUEST_CASES.length})</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Diagnostic Feedback Block */}
            {hasSubmitted && (
              <div
                className={`rounded-xl p-4 text-xs leading-relaxed border animate-fadeIn ${
                  isCurrentCorrect
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                    : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
                }`}
              >
                <div className="flex items-center gap-2 font-bold mb-1.5 text-sm">
                  {isCurrentCorrect ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      <span className="text-emerald-300">Верно! Решение профессионала (+30 XP)</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-rose-400" />
                      <span className="text-rose-300">Неверное решение! Разбор ошибки:</span>
                    </>
                  )}
                </div>
                <p>{currentCase.reasoning}</p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: STEAM ROOM SAFETY & WORKSPACE ERGONOMICS */}
      {/* ========================================================= */}
      {activeTab === 'ergonomics' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Priority Notice Banner */}
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3 text-xs leading-relaxed">
            <span className="text-2xl shrink-0">📐</span>
            <div className="text-stone-200">
              <strong className="text-emerald-300 font-bold block mb-0.5 text-sm">
                Безопасность в парной — это в первую очередь эргономика пространства и движений
              </strong>
              Парная — экстремальная среда (высокая температура, влажность до 70%, раскаленный металл и скользкие полы). Правильная геометрия полка защищает позвоночник мастера от грыж и протрузий на годы вперед, а дисциплина настилов и зоны печи предотвращает ожоги и падения.
            </div>
          </div>

          {/* Interactive Tool 1: Bench Height Calculator & Spinal Biomechanics */}
          <div className="rounded-2xl border border-stone-800 bg-stone-950/80 p-5 sm:p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-850 pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono">
                  <Ruler className="w-4 h-4 text-emerald-400" />
                  <span>Интерактивный тренажер: Расчет высоты полка & Биомеханика</span>
                </div>
                <h4 className="font-serif text-base sm:text-lg font-bold text-stone-100 mt-1">
                  Калибровка полка под рост мастера: тест на поясничную нагрузку L4–L5
                </h4>
              </div>

              <button
                onClick={() => {
                  setBenchHeight(optimalBenchHeight);
                  playSteamSound(soundEnabled);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 text-xs font-mono flex items-center gap-2 transition-all cursor-pointer self-start sm:self-auto"
                title="Сбросить высоту полка в идеальный расчетный уровень"
              >
                <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
                <span>Выставить в идеал ({optimalBenchHeight} см)</span>
              </button>
            </div>

            {/* Sliders Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Slider 1: Master Height */}
              <div className="space-y-2 p-4 rounded-xl bg-stone-900/60 border border-stone-850">
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
                  onChange={(e) => {
                    const h = Number(e.target.value);
                    setMasterHeight(h);
                  }}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-stone-500 font-mono">
                  <span>155 см (компактный)</span>
                  <span>180 см (средний)</span>
                  <span>205 см (высокий)</span>
                </div>
                <div className="text-[11px] text-stone-400 pt-1 leading-snug">
                  Расчетная высота костяшек опущенного кулака: <strong className="text-emerald-300">{optimalBenchHeight} см</strong> от пола.
                </div>
              </div>

              {/* Slider 2: Actual Bench Height */}
              <div className="space-y-2 p-4 rounded-xl bg-stone-900/60 border border-stone-850">
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

            {/* Diagnostic Evaluation Box */}
            <div className={`p-4 rounded-xl border text-xs leading-relaxed space-y-2 transition-all ${benchEval.bg}`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className={`font-mono font-bold uppercase tracking-wider text-[11px] px-2.5 py-0.5 rounded-full bg-stone-950/80 border border-stone-800 ${benchEval.color}`}>
                  {benchEval.badge}
                </span>
                <span className="text-[11px] text-stone-400 font-mono">
                  Биомеханический вердикт
                </span>
              </div>
              <strong className={`block text-sm font-semibold ${benchEval.color}`}>
                {benchEval.title}
              </strong>
              <p className="text-stone-300 text-xs leading-relaxed">
                {benchEval.desc}
              </p>
            </div>
          </div>

          {/* 4 Pillars of Steam Room Ergonomics Grid */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-stone-300 uppercase tracking-wider font-mono">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>4 краеугольных правила безопасности пространства:</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Card 1: Biomechanics "Banya Tai Chi" */}
              <div className="p-4 sm:p-5 rounded-2xl bg-stone-950/80 border border-stone-800 space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-sm font-bold">
                    🥋
                  </div>
                  <h5 className="font-serif text-sm font-bold text-stone-100">
                    1. Биомеханика движений: «Банное тайчи»
                  </h5>
                </div>
                <ul className="text-xs text-stone-300 space-y-1.5 list-disc list-inside leading-relaxed">
                  <li>
                    <strong>Импульс от стоп и коленей:</strong> работайте в стойке лучника (одна нога чуть впереди), перекатывая вес тела с пятки на носок. Спина всегда строго прямая!
                  </li>
                  <li>
                    <strong>Хлест веником за счет веса веника:</strong> расслабленная мягкая кисть без мертвой хватки (профилактика запястного туннельного синдрома).
                  </li>
                  <li>
                    <strong>Поворот всем корпусом:</strong> при распределении пара разворачивайте таз и плечи целиком, исключая опасные диагональные скручивания поясницы под нагрузкой.
                  </li>
                </ul>
              </div>

              {/* Card 2: Stove Area & Steam Safety */}
              <div className="p-4 sm:p-5 rounded-2xl bg-stone-950/80 border border-stone-800 space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 text-sm font-bold">
                    🔥
                  </div>
                  <h5 className="font-serif text-sm font-bold text-stone-100">
                    2. Зона печи: защита от ожогов и парового удара
                  </h5>
                </div>
                <ul className="text-xs text-stone-300 space-y-1.5 list-disc list-inside leading-relaxed">
                  <li>
                    <strong>Длина ручки черпака от 50–70 см:</strong> только длинная ненагревающаяся деревянная рукоять для подачи воды без ожогов.
                  </li>
                  <li>
                    <strong>Позиция сбоку от устья:</strong> никогда не нависайте лицом и предплечьями над каменкой при поддаче («паровой взрыв» выбрасывает пар температурой до 100°C+).
                  </li>
                  <li>
                    <strong>Защитный экран и поручень:</strong> деревянное термоизолирующее ограждение вокруг печи на расстоянии 10–15 см исключает случайное касание гостем или мастером.
                  </li>
                </ul>
              </div>

              {/* Card 3: Anti-Slip & Floor Gratings */}
              <div className="p-4 sm:p-5 rounded-2xl bg-stone-950/80 border border-stone-800 space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-sm font-bold">
                    🦶
                  </div>
                  <h5 className="font-serif text-sm font-bold text-stone-100">
                    3. Покрытие пола: «Мокрый дубовый лист = лёд!»
                  </h5>
                </div>
                <ul className="text-xs text-stone-300 space-y-1.5 list-disc list-inside leading-relaxed">
                  <li>
                    <strong>Смертельная ловушка скольжения:</strong> распаренный мокрый дубовый или березовый лист на мокрой плитке имеет коэффициент трения ниже льда.
                  </li>
                  <li>
                    <strong>Регулярный клининг между заходами:</strong> обязательный смыв всех опавших листьев в сливной трап из шланга перед новым заходом гостя.
                  </li>
                  <li>
                    <strong>Деревянные съемные трапы:</strong> устойчивые настилы с нескользящими резиновыми демпферами + закрытые банные тапочки с глубоким цепким протектором.
                  </li>
                </ul>
              </div>

              {/* Card 4: Ventilation & Fresh Breathing */}
              <div className="p-4 sm:p-5 rounded-2xl bg-stone-950/80 border border-stone-800 space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-sm font-bold">
                    💨
                  </div>
                  <h5 className="font-serif text-sm font-bold text-stone-100">
                    4. Вентиляция & «Второе дыхание»
                  </h5>
                </div>
                <ul className="text-xs text-stone-300 space-y-1.5 list-disc list-inside leading-relaxed">
                  <li>
                    <strong>Залповое проветривание:</strong> открытие окна и двери настежь на 1.5–2 минуты между парениями для полного удаления скопившегося CO2 и насыщения кислородом O2.
                  </li>
                  <li>
                    <strong>Система «Второе дыхание»:</strong> приточный клапан с прохладным уличным воздухом прямо под лицо лежащего гостя. Устраняет гипоксию и головокружение.
                  </li>
                  <li>
                    <strong>Свежий приток для мастера:</strong> дыхание носом в нижнем прохладном слое воздуха у полока для сохранения ясной головы на протяжении всей смены.
                  </li>
                </ul>
              </div>

            </div>
          </div>

          {/* Interactive Tool 2: Ergonomic Space Audit Checklist */}
          <div className="rounded-2xl border border-stone-800 bg-stone-950/80 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-850 pb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-300 uppercase tracking-wider font-mono">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Чек-лист аудита эргономики & Безопасности парной:</span>
              </div>
              <span className="text-[11px] font-mono text-stone-400">
                Проверено: {Object.values(ergoChecklist).filter(Boolean).length} / 6
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              
              <label
                onClick={() => handleToggleErgoItem('benchGeom')}
                className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                  ergoChecklist.benchGeom
                    ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                    : 'bg-stone-900 border-stone-800 text-stone-300 hover:border-stone-700'
                }`}
              >
                <input
                  type="checkbox"
                  checked={ergoChecklist.benchGeom}
                  readOnly
                  className="mt-0.5 accent-emerald-500"
                />
                <div>
                  <strong className="block text-stone-100 font-semibold mb-0.5">
                    1. Геометрия полока (75–85 см)
                  </strong>
                  <span className="text-[11px] text-stone-400 leading-snug block">
                    Высота под опущенный кулак мастера, ширина от 90 см, длина от 220 см.
                  </span>
                </div>
              </label>

              <label
                onClick={() => handleToggleErgoItem('biomechanics')}
                className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                  ergoChecklist.biomechanics
                    ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                    : 'bg-stone-900 border-stone-800 text-stone-300 hover:border-stone-700'
                }`}
              >
                <input
                  type="checkbox"
                  checked={ergoChecklist.biomechanics}
                  readOnly
                  className="mt-0.5 accent-emerald-500"
                />
                <div>
                  <strong className="block text-stone-100 font-semibold mb-0.5">
                    2. Биомеханика «Банное тайчи»
                  </strong>
                  <span className="text-[11px] text-stone-400 leading-snug block">
                    Импульс от коленей и бедер, прямая спина, мягкий кистевой хлест.
                  </span>
                </div>
              </label>

              <label
                onClick={() => handleToggleErgoItem('stoveSafety')}
                className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                  ergoChecklist.stoveSafety
                    ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                    : 'bg-stone-900 border-stone-800 text-stone-300 hover:border-stone-700'
                }`}
              >
                <input
                  type="checkbox"
                  checked={ergoChecklist.stoveSafety}
                  readOnly
                  className="mt-0.5 accent-emerald-500"
                />
                <div>
                  <strong className="block text-stone-100 font-semibold mb-0.5">
                    3. Защитный периметр печи
                  </strong>
                  <span className="text-[11px] text-stone-400 leading-snug block">
                    Деревянный поручень вокруг печи + черпак с ручкой от 50–70 см.
                  </span>
                </div>
              </label>

              <label
                onClick={() => handleToggleErgoItem('antiSlip')}
                className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                  ergoChecklist.antiSlip
                    ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                    : 'bg-stone-900 border-stone-800 text-stone-300 hover:border-stone-700'
                }`}
              >
                <input
                  type="checkbox"
                  checked={ergoChecklist.antiSlip}
                  readOnly
                  className="mt-0.5 accent-emerald-500"
                />
                <div>
                  <strong className="block text-stone-100 font-semibold mb-0.5">
                    4. Ликвидация скольжения
                  </strong>
                  <span className="text-[11px] text-stone-400 leading-snug block">
                    Листья смыты в трап, нескользкие настилы и закрытая обувь мастера.
                  </span>
                </div>
              </label>

              <label
                onClick={() => handleToggleErgoItem('ventilation')}
                className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                  ergoChecklist.ventilation
                    ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                    : 'bg-stone-900 border-stone-800 text-stone-300 hover:border-stone-700'
                }`}
              >
                <input
                  type="checkbox"
                  checked={ergoChecklist.ventilation}
                  readOnly
                  className="mt-0.5 accent-emerald-500"
                />
                <div>
                  <strong className="block text-stone-100 font-semibold mb-0.5">
                    5. Приток кислорода и проветривание
                  </strong>
                  <span className="text-[11px] text-stone-400 leading-snug block">
                    Залповое проветривание проведено, «Второе дыхание» готово к работе.
                  </span>
                </div>
              </label>

              <label
                onClick={() => handleToggleErgoItem('broomCheck')}
                className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                  ergoChecklist.broomCheck
                    ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                    : 'bg-stone-900 border-stone-800 text-stone-300 hover:border-stone-700'
                }`}
              >
                <input
                  type="checkbox"
                  checked={ergoChecklist.broomCheck}
                  readOnly
                  className="mt-0.5 accent-emerald-500"
                />
                <div>
                  <strong className="block text-stone-100 font-semibold mb-0.5">
                    6. Инспекция веников
                  </strong>
                  <span className="text-[11px] text-stone-400 leading-snug block">
                    Удалены острые сучки и жесткая проволока на рукоятках (защита кожи).
                  </span>
                </div>
              </label>

            </div>

            {/* Audit Completion Button */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <div className="text-xs text-stone-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Завершите проверку перед заходом гостя, чтобы гарантировать безопасное парение.
                </span>
              </div>

              <button
                onClick={handleCompleteErgoAudit}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500 hover:from-emerald-400 hover:to-emerald-300 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-emerald-500/20 active:scale-95 shrink-0 flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-stone-950" />
                <span>{isErgoAuditPassed ? 'Аудит эргономики утвержден (✓)' : 'Утвердить аудит эргономики (+30 XP)'}</span>
              </button>
            </div>
          </div>

        </div>
      )}

      {/* Dedicated Master Recipe Chest Modal (Only contains the recipe scroll) */}
      <MasterRecipeChestModal
        isOpen={isSecretChestOpen}
        onClose={() => setIsSecretChestOpen(false)}
        hasKey={hasGoldenKey}
        soundEnabled={soundEnabled}
        onGoToTriage={() => {
          setIsSecretChestOpen(false);
          setActiveTab('guest');
        }}
      />
    </div>
  );
};
