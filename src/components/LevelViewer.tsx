import React, { useState, useRef, useEffect } from 'react';
import { LevelData, UserProgress, LevelId, BadgeId } from '../types/banya';
import { BADGES } from '../data/courseData';
import { MicroclimateSimulator } from './simulators/MicroclimateSimulator';
import { HerbsEncyclopedia } from './herbs/HerbsEncyclopedia';
import { BookOpen } from 'lucide-react';
import { BroomTechniquesSimulator } from './simulators/BroomTechniquesSimulator';
import { HerbalBlenderSimulator } from './simulators/HerbalBlenderSimulator';
import { GuestTriageSimulator } from './simulators/GuestTriageSimulator';
import { BiomechanicsSteamSimulator } from './simulators/BiomechanicsSteamSimulator';
import { PhysiologyThermalSimulator } from './simulators/PhysiologyThermalSimulator';
import { GuestServiceSimulator } from './simulators/GuestServiceSimulator';
import { playSuccessChime } from '../utils/audio';
import confetti from '../utils/confetti';
import {
  Sparkles,
  Award,
  Lightbulb,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ShieldCheck,
  Compass,
  Zap,
  Info,
  Lock,
  Flame,
  Check,
  CreditCard,
  QrCode,
  X,
} from 'lucide-react';

interface LevelViewerProps {
  level: LevelData;
  progress: UserProgress;
  onCompleteLevel: (levelId: LevelId, xp: number) => void;
  onStartExam: () => void;
  soundEnabled: boolean;
  onGrantXp: (amount: number) => void;
  onUnlockBadge?: (badgeId: BadgeId, xp: number) => void;
  onOpenPricing?: () => void;
  onNavigateToMap?: () => void;
  onSelectLevel?: (levelId: LevelId) => void;
}

export const LevelViewer: React.FC<LevelViewerProps> = ({
  level,
  progress,
  onCompleteLevel,
  onStartExam,
  soundEnabled,
  onGrantXp,
  onUnlockBadge,
  onOpenPricing,
  onNavigateToMap,
  onSelectLevel,
}) => {
  const isCompleted = (progress?.completedLevels ?? []).includes(level.id);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [hasCompletedQuiz, setHasCompletedQuiz] = useState<boolean>(isCompleted);
  const [localCompletedTasks, setLocalCompletedTasks] = useState<string[]>([]);
  const [showFailModal, setShowFailModal] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [showLevel2PromoModal, setShowLevel2PromoModal] = useState<boolean>(false);

  const markTaskCompleted = (taskId: string) => {
    setLocalCompletedTasks((prev) => (prev.includes(taskId) ? prev : [...prev, taskId]));
  };

  const isPaidMaster = Boolean(progress?.isAdmin || progress?.isPaid || progress?.tariff === 'master_pro');
  const isLevelLocked = level.id >= 3 && !isPaidMaster;
  const currentLevelIdRef = useRef<number>(level.id);

  useEffect(() => {
    // Only reset state if user navigated to a different level station
    if (currentLevelIdRef.current !== level.id) {
      currentLevelIdRef.current = level.id;
      setSelectedAnswers({});
      setShowFailModal(false);
      setShowSuccessModal(false);
      setShowLevel2PromoModal(false);
    }
    const completed = (progress?.completedLevels ?? []).includes(level.id);
    setHasCompletedQuiz(completed);
  }, [level.id, progress?.completedLevels]);

  const badge = BADGES.find((b) => b.id === level.rewardBadge);

  const handleSelectAnswer = (qIdx: number, optIdx: number) => {
    // Cannot change answers while quiz is marked completed unless retaking
    if (hasCompletedQuiz && isCompleted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [qIdx]: optIdx,
    }));
  };

  const handleCheckQuiz = () => {
    // Check all questions answered
    const totalQ = level.quiz.length;
    if (Object.keys(selectedAnswers).length < totalQ) return;

    let allCorrect = true;
    level.quiz.forEach((q, idx) => {
      if (selectedAnswers[idx] !== q.correctIndex) {
        allCorrect = false;
      }
    });

    if (!allCorrect) {
      // If even ONE answer is incorrect: reset answers and return to beginning of quest with fail popup
      setSelectedAnswers({});
      setShowFailModal(true);
      return;
    }

    // ALL answers are correct:
    setHasCompletedQuiz(true);
    playSuccessChime(soundEnabled);
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }
    onCompleteLevel(level.id, level.rewardXp);

    if (level.id === 2 && !isPaidMaster) {
      setShowLevel2PromoModal(true);
    } else {
      setShowSuccessModal(true);
    }
  };

  return (
    <div id="level-station-section" className="space-y-8 max-w-6xl mx-auto scroll-mt-24">
      {/* Level Header / Quest Briefing */}
      <div className="rounded-2xl border border-stone-800 bg-stone-900/90 p-6 sm:p-8 space-y-6 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber-400">
                <Compass className="h-4 w-4" />
                <span>{level.questName}</span>
              </div>
              
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-100">
              {level.title}
            </h2>
          </div>

          {/* Reward preview badge with interactive hover tooltip */}
          {badge && (
            <div
              className="relative group/reward cursor-pointer"
              title={
                level.id === 1
                  ? 'Во втором уровне понадобится два веника для отработки движений'
                  : badge.description
              }
            >
              <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-stone-950 border border-amber-500/40 hover:border-amber-400 hover:bg-stone-900 transition-all shadow-md">
                <span className="text-3xl filter drop-shadow">{badge.icon}</span>
                <div className="text-left">
                  <div className="text-[10px] text-stone-400 font-mono uppercase flex items-center gap-1.5">
                    <span>Награда за квест:</span>
                    <Info className="w-3 h-3 text-amber-400/90 animate-pulse" />
                  </div>
                  <div className="text-xs font-bold text-amber-200 group-hover/reward:text-amber-300 transition-colors">
                    {badge.name}
                  </div>
                  <div className="text-[11px] text-amber-400 font-mono font-bold">
                    +{level.rewardXp} XP
                  </div>
                </div>
              </div>

              {/* Hover popup message */}
              <div className="absolute right-0 top-full mt-2 z-40 w-72 sm:w-80 p-3.5 rounded-2xl bg-stone-900/98 border border-amber-500/60 shadow-2xl backdrop-blur-md opacity-0 pointer-events-none group-hover/reward:opacity-100 group-hover/reward:pointer-events-auto transition-all duration-200 transform translate-y-1 group-hover/reward:translate-y-0 text-left">
                <div className="flex items-start gap-2.5">
                  <span className="text-2xl shrink-0">🌿</span>
                  <div className="space-y-1.5">
                    <div className="text-xs font-bold text-amber-300 flex items-center justify-between gap-2">
                      <span>{badge.name}</span>
                      <span className="text-[10px] text-emerald-400 font-mono">+{level.rewardXp} XP</span>
                    </div>
                    <p className="text-xs text-stone-200 leading-relaxed font-sans">
                      {level.id === 1
                        ? 'Во втором уровне понадобится два веника для отработки движений.'
                        : badge.description}
                    </p>
                    {level.id === 1 && (
                      <div className="p-2 rounded-lg bg-stone-950/80 border border-stone-800 text-[11px] text-stone-400 leading-snug">
                        💡 Подготовьте любые 2 веника (дубовые, берёзовые или тренировочные) для практики на следующем шаге.
                      </div>
                    )}
                  </div>
                </div>
                {/* Pointer arrow */}
                <div className="absolute -top-1.5 right-6 w-3 h-3 bg-stone-900 border-t border-l border-amber-500/60 transform rotate-45" />
              </div>
            </div>
          )}
        </div>

        {/* Task Title & Summary */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-8 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-stone-300">
              <Zap className="h-4 w-4 text-amber-400" />
              <span>Задание: {level.taskTitle}</span>
            </div>

            {level.tasks && level.tasks.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {level.tasks.map((task) => {
                  const isDone = isCompleted || hasCompletedQuiz || localCompletedTasks.includes(task.id);
                  return (
                    <div
                      key={task.id}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-mono transition-all ${
                        isDone
                          ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                          : 'bg-stone-950/60 border-stone-800 text-stone-400'
                      }`}
                    >
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                        isDone ? 'bg-emerald-500 text-stone-950' : 'bg-stone-850 text-stone-500 border border-stone-700'
                      }`}>
                        {isDone ? '✓' : '○'}
                      </span>
                      <span className="truncate">{task.title}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {level.id === 3 ? (
            /* BIG PROMINENT HERBS LIBRARY BUTTON FOR LEVEL 3 INSTEAD OF FACT */
            <div className="md:col-span-4 rounded-2xl bg-gradient-to-br from-emerald-950/50 via-stone-950 to-amber-950/40 border-2 border-emerald-500/60 p-4 sm:p-5 flex flex-col justify-between shadow-xl ring-1 ring-emerald-500/30 space-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="space-y-1 relative z-10">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono uppercase font-bold tracking-wider">
                    🌿 База Знаний Станции 3
                  </span>
                  <span className="text-xs font-mono text-emerald-400 font-semibold">22 растения</span>
                </div>
                <h4 className="font-serif font-bold text-base text-stone-100">
                  Энциклопедия & Атлас Банных Трав
                </h4>
                <p className="text-xs text-stone-300 leading-snug">
                  Свойства, рецепты запарки, народные приметы и фото 22 растений.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsHerbsLibraryOpen(true)}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:from-emerald-400 hover:to-teal-300 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/25 active:scale-95 cursor-pointer flex items-center justify-center gap-2 relative z-10"
              >
                <BookOpen className="w-4 h-4" />
                <span>Открыть Библиотеку Трав (22) →</span>
              </button>
            </div>
          ) : (
            <div className="md:col-span-4 rounded-xl bg-stone-950/80 border border-amber-500/20 p-4 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                <Lightbulb className="h-4 w-4" />
                <span>Интересный факт:</span>
              </div>
              <p className="text-xs text-stone-400 leading-relaxed italic">
                «{level.interestingFact}»
              </p>
            </div>
          )}
        </div>

        {/* Pro-Tip Bar */}
        {level.proTip && !level.proTip.startsWith('Совет наставника:') && (
          <div className="rounded-xl bg-amber-950/20 border border-amber-500/30 p-3.5 text-xs text-amber-200/90 flex items-start gap-2.5">
            <ShieldCheck className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong>Совет наставника:</strong> {level.proTip}
            </div>
          </div>
        )}
        {level.proTip && level.proTip.startsWith('Совет наставника:') && (
          <div className="rounded-xl bg-amber-950/20 border border-amber-500/30 p-3.5 text-xs text-amber-200/90 flex items-start gap-2.5">
            <ShieldCheck className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              {level.proTip}
            </div>
          </div>
        )}

        {/* Pro Level Access Gate / Banner */}
        {isLevelLocked && (
          <div className="rounded-2xl bg-gradient-to-r from-amber-950/80 via-stone-900 to-amber-950/80 border-2 border-amber-500/60 p-5 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xl relative overflow-hidden">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center text-2xl shrink-0 shadow-inner">
                🔒
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold uppercase tracking-wider">
                    Тариф «Мастер PRO»
                  </span>
                  <span className="text-xs text-rose-400 font-mono">Уровень закрыт для бесплатного тарифа</span>
                </div>
                <h4 className="font-serif text-base sm:text-lg font-bold text-amber-100">
                  Станция {level.id} доступна только после оплаты полного курса
                </h4>
                <p className="text-xs text-stone-300 max-w-xl leading-relaxed">
                  Чтобы изучить практику фито- и ароматерапии, физиологию пара, работу с ЧП и сдать аттестацию на официальный именной сертификат, перейдите на тариф «Мастер Пара PRO».
                </p>
              </div>
            </div>
            {onOpenPricing && (
              <button
                onClick={onOpenPricing}
                className="w-full md:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all cursor-pointer whitespace-nowrap active:scale-95 text-center shrink-0"
              >
                Разблокировать доступ (3 390 ₽) →
              </button>
            )}
          </div>
        )}
      </div>

      {/* Core Learning Cards */}
      {level.id !== 4 && level.learningPoints && level.learningPoints.length > 0 && (
      <div className="space-y-6">
        <h3 className="font-serif text-xl font-bold text-stone-100 flex items-center gap-2">
          <span>📖</span>
          <span>Ключевые Знания Станции</span>
        </h3>

        {/* Regular cards (1-4) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {level.learningPoints
            .filter((p) => !p.isSpecialSafetyBlock && !p.isBroomPrepBlock)
            .map((point, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-stone-800 bg-stone-900/80 p-5 space-y-2.5 flex flex-col justify-between hover:border-stone-700 transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
                    <span>0{idx + 1}.</span>
                    <span className="font-semibold text-stone-200">{point.title}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                    {point.description}
                  </p>
                </div>

                {point.highlight && (
                  <div className="pt-2 text-xs text-amber-300/90 font-mono bg-stone-950/60 p-2.5 rounded-lg border border-stone-800">
                    💡 {point.highlight}
                  </div>
                )}
              </div>
            ))}
        </div>

        {/* SPECIAL BIG HERO SAFETY BLOCK: Блок 5 во 2-м уровне */}
        {level.learningPoints.some((p) => p.isSpecialSafetyBlock) && (
          <div className="rounded-3xl border-2 border-emerald-500/70 bg-gradient-to-br from-stone-950 via-emerald-950/25 to-stone-950 p-6 sm:p-8 shadow-[0_0_40px_rgba(16,185,129,0.18)] space-y-6 relative overflow-hidden ring-1 ring-emerald-500/30">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header of Block 5 */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-500/30 pb-4 relative z-10">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono uppercase font-bold tracking-wider">
                    🛡️ БЛОК 05 · КЛЮЧЕВОЙ РУБЕЖ
                  </span>
                  <span className="text-xs font-mono text-emerald-400 font-semibold">
                    Обязательно к изучению
                  </span>
                </div>
                <h4 className="font-serif text-xl sm:text-2xl font-bold text-stone-100 flex items-center gap-2">
                  <span>Минимальная Базовая Безопасность</span>
                </h4>
                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed max-w-3xl">
                  Обязательный свод правил для парения близких людей, жены и друзей <strong>дома, на даче или в арендованной бане</strong>. Простые и емкие правила, чтобы не навредить ни гостю, ни себе.
                </p>
              </div>

              <div className="shrink-0 bg-stone-900/90 px-4 py-2.5 rounded-2xl border border-emerald-500/40 text-left">
                <span className="text-[10px] font-mono text-stone-400 block uppercase">Формат парения</span>
                <span className="text-xs font-bold text-emerald-300">Дом / Дача / Аренда</span>
              </div>
            </div>

            {/* 3 STRUCTURED COLUMNS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
              
              {/* PART 1: БЕЗОПАСНОСТЬ ГОСТЯ */}
              <div className="rounded-2xl bg-stone-900/90 border border-emerald-500/30 p-5 space-y-3.5 shadow-md flex flex-col justify-between">
                <div className="space-y-2.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-xl shrink-0">
                    🧑‍🤝‍🧑
                  </div>
                  <h5 className="font-serif text-base font-bold text-emerald-200">
                    1. Безопасность Гостя (Близкого)
                  </h5>
                  <p className="text-xs text-stone-300 leading-relaxed">
                    Ваш близкий человек вам доверяет. Защитите его от скрытых рисков:
                  </p>
                  <ul className="text-xs text-stone-300 space-y-3 pt-1 list-none">
                    <li className="flex items-start gap-2">
                      <span className="text-rose-400 font-bold shrink-0 mt-0.5">✕</span>
                      <span><strong>Вред алкоголя (Табу):</strong> Алкоголь + жар = смертельный удар по миокарду. Этанол расширяет сосуды, а пар сгущает кровь. Возникает скачок давления, аритмия и риск сосудистой катастрофы. При опьянении или t&gt;37°C парение строго запрещено!</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold shrink-0 mt-0.5">✓</span>
                      <span><strong>Прохладная, но СУХАЯ шапка:</strong> На голове всегда прохладная, но <u>сухая</u> шапка (шерсть/войлок)! Сухая шапка держит воздушную подушку. Мокрая шапка моментально нагревается и превращается в кипящую кастрюлю, перегревая кору мозга.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-400 font-bold shrink-0 mt-0.5">⚠️</span>
                      <span><strong>Почему не стоит резко вставать:</strong> В парной кровь активно приливает к согретой коже. Если подняться слишком быстро — может легко закружиться голова. Правило комфорта: после парения дать человеку спокойно полежать 1-2 минуты, затем плавно сесть, сделать глоток воды, и только потом вставать.</span>
                    </li>
                  </ul>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-[11px] text-emerald-300 font-mono">
                  💡 1-2 минуты спокойного отдыха на полке после парения — залог ясной головы и мягкого самочувствия.
                </div>
              </div>

              {/* PART 2: БЕЗОПАСНОСТЬ ПРОСТРАНСТВА */}
              <div className="rounded-2xl bg-stone-900/90 border border-amber-500/30 p-5 space-y-3.5 shadow-md flex flex-col justify-between">
                <div className="space-y-2.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xl shrink-0">
                    🧖‍♂️
                  </div>
                  <h5 className="font-serif text-base font-bold text-amber-200">
                    2. Безопасность Пространства
                  </h5>
                  <p className="text-xs text-stone-300 leading-relaxed">
                    В арендованной бане или на даче много скрытых физических угроз:
                  </p>
                  <ul className="text-xs text-stone-300 space-y-3 pt-1 list-none">
                    <li className="flex items-start gap-2">
                      <span className="text-amber-400 font-bold shrink-0 mt-0.5">⚠️</span>
                      <span><strong>Чистота пола:</strong> Опавший распаренный лист на мокрой плитке или дереве становится очень скользким. Между заходами рекомендуется смывать опавшие листья и убирать лишнюю воду во избежание травмоопасных ситуаций.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-400 font-bold shrink-0 mt-0.5">⚠️</span>
                      <span><strong>Траектория печи:</strong> Поддавая воду в каменку, стоять сбоку от пушки или открытой дверцы. Никогда не наклонять лицо над камнями — выброс пара происходит со скоростью пушечного выстрела.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold shrink-0 mt-0.5">✓</span>
                      <span><strong>Залповое проветривание:</strong> Открыть окно и дверь между заходами на 1-2 минуты. В бане опасен не пар, а гипоксия — свежий кислород важнее жара.</span>
                    </li>
                  </ul>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-[11px] text-amber-300 font-mono">
                  💡 Между заходами рекомендуется убирать опавшие листья и лишнюю воду во избежание травмоопасных ситуаций.
                </div>
              </div>

              {/* PART 3: БЕЗОПАСНОСТЬ СЕБЯ (МАСТЕРА) */}
              <div className="rounded-2xl bg-stone-900/90 border border-sky-500/30 p-5 space-y-3.5 shadow-md flex flex-col justify-between">
                <div className="space-y-2.5">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-xl shrink-0">
                    🥋
                  </div>
                  <h5 className="font-serif text-base font-bold text-sky-200">
                    3. Безопасность Себя (Мастера)
                  </h5>
                  <p className="text-xs text-stone-300 leading-relaxed">
                    Если мастер сорвет спину или обессилит — сеанс закончится травмой:
                  </p>
                  <ul className="text-xs text-stone-300 space-y-3 pt-1 list-none">
                    <li className="flex items-start gap-2">
                      <span className="text-sky-400 font-bold shrink-0 mt-0.5">✓</span>
                      <span><strong>Подстройка под высоту полка:</strong>
                        <br />• <u>Если полок слишком низкий</u>: положите гостя на дополнительный матрас (сенный, гречишный) либо расставьте ноги пошире в полуприседе (трапик под ноги ставить нельзя, иначе полок станет еще ниже!).
                        <br />• <u>Если полок слишком высокий</u>: встаньте на деревянный трапик или наденьте обувь на высокой подошве. Спину колесом не гнуть!
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-sky-400 font-bold shrink-0 mt-0.5">✓</span>
                      <span><strong>«Банное тайчи»:</strong> Движение зарождается в перекате стоп и пружине коленей, проходя через расслабленный таз. Веник лишь продолжает этот волновой танец.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-sky-400 font-bold shrink-0 mt-0.5">✓</span>
                      <span><strong>Водно-солевой баланс:</strong> И мастер, и гость с потом теряют жизненно важные электролиты. Не забывайте регулярно восполнять водно-солевой баланс качественной минеральной водой (или водой с лимоном и щепоткой соли) каждые 15 минут.</span>
                    </li>
                  </ul>
                </div>
                <div className="p-2.5 rounded-xl bg-sky-950/40 border border-sky-500/30 text-[11px] text-sky-300 font-mono">
                  💡 На низком полке — шире ноги или доп. матрас. Трапик нужен только на высоком полке!
                </div>
              </div>

            </div>

            {/* Footer Highlight */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-stone-900 to-amber-950/50 border border-emerald-500/40 flex items-center gap-3.5 text-xs sm:text-sm text-emerald-200 relative z-10 shadow-lg">
              <span className="text-2xl shrink-0">🌟</span>
              <span className="leading-relaxed font-medium">
                <strong className="text-amber-300 font-bold text-sm block sm:inline mr-1">Главное правило:</strong>
                лучше чуть-чуть недогреть, чем перегреть!
              </span>
            </div>
          </div>
        )}
      </div>
      )}

      {/* Embedded Level Simulator */}
      <div className="space-y-4">
        <h3 className="font-serif text-xl font-bold text-stone-100 flex items-center gap-2">
          <span>🎮</span>
          <span>Практический Интерактив</span>
        </h3>

        {level.interactiveType === 'first_steam' && (
          <MicroclimateSimulator
            soundEnabled={soundEnabled}
            onSuccessTask={() => onGrantXp(15)}
            unlockedBadges={progress.unlockedBadges}
            onGrantReward={(xp, badgeId) => {
              if (badgeId && onUnlockBadge) {
                onUnlockBadge(badgeId, xp);
              } else {
                onGrantXp(xp);
              }
            }}
          />
        )}

        {/* DEDICATED PRE-PRACTICUM BLOCK: Выбор и подготовка главного инструмента мастера */}
        {level.interactiveType === 'broom_techniques' && (
          <div className="rounded-3xl border-2 border-amber-500/70 bg-gradient-to-br from-stone-950 via-amber-950/25 to-stone-950 p-6 sm:p-8 shadow-[0_0_40px_rgba(245,158,11,0.15)] space-y-5 relative overflow-hidden ring-1 ring-amber-500/30">
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-500/30 pb-4 relative z-10">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono uppercase font-bold tracking-wider">
                    🌿 ПЕРЕД ПРАКТИКУМОМ С ВЕНИКАМИ
                  </span>
                  <span className="text-xs font-mono text-amber-400 font-semibold">
                    Шаг подготовки инструмента
                  </span>
                </div>
                <h4 className="font-serif text-xl sm:text-2xl font-bold text-stone-100 flex items-center gap-2">
                  <span>Выбор и Подготовка Главного Инструмента Мастера</span>
                </h4>
                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed max-w-3xl">
                  Прежде чем переходить к отработке 8 приёмов по видео, важно правильно взять веник в руки и довести его лист до шелковистого состояния без осыпания.
                </p>
              </div>

              <div className="shrink-0 bg-stone-900/90 px-4 py-2 rounded-2xl border border-amber-500/40 text-left">
                <span className="text-[10px] font-mono text-stone-400 block uppercase">Инструмент</span>
                <span className="text-xs font-bold text-amber-300">Дуб / Берёза</span>
              </div>
            </div>

            {/* 2-Part Structured Layout: Хват & Алгоритм запарки */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
              
              {/* Part 1: Хват веника */}
              <div className="rounded-2xl bg-stone-900/90 border border-amber-500/30 p-5 space-y-3 shadow-md flex flex-col justify-between">
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-lg shrink-0">
                      🕊️
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase text-amber-400 font-bold tracking-wider block">
                        Биомеханика руки
                      </span>
                      <h5 className="font-serif text-base font-bold text-amber-100">
                        Правильный Хват Рукояти
                      </h5>
                    </div>
                  </div>

                  <p className="text-xs text-stone-300 leading-relaxed">
                    Держите рукоять мягкой, расслабленной кистью — <strong className="text-amber-300">«как живую птицу: не задушить сильным сжатием, но и не дать выпорхнуть»</strong>.
                  </p>

                  <ul className="text-xs text-stone-300 space-y-2 pt-1 list-none">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold shrink-0">✓</span>
                      <span><strong>Свободное запястье:</strong> Рукоять лежит в пальцах, а не зажата намертво в кулаке. Запястье и локоть мягко пружинят.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold shrink-0">✓</span>
                      <span><strong>Защита от усталости:</strong> При зажатом кулаке предплечье каменеет через 5 минут. Мягкий хват позволяет парить часами без боли.</span>
                    </li>
                  </ul>
                </div>

                <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-[11px] text-amber-300 font-mono">
                  💡 Движение венику задает импульс тела, а пальцы лишь мягко направляют крону.
                </div>
              </div>

              {/* Part 2: Четкий алгоритм запарки */}
              <div className="rounded-2xl bg-stone-900/90 border border-amber-500/30 p-5 space-y-3 shadow-md flex flex-col justify-between">
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-lg shrink-0">
                      💧
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold tracking-wider block">
                        Подготовка листа и веток
                      </span>
                      <h5 className="font-serif text-base font-bold text-emerald-100">
                        Алгоритм Запарки Веника
                      </h5>
                    </div>
                  </div>

                  <div className="text-xs text-stone-300 space-y-2 pt-1">
                    <div className="p-2.5 rounded-xl bg-stone-950/60 border border-stone-800 space-y-1">
                      <strong className="text-amber-300 block text-[11px]">1. Смываем пыль и оставляем влагу:</strong>
                      <span className="text-[11px] text-stone-300 leading-snug block">
                        Окунаем веник в воду — смываем пыль и оставляем на листьях капли влаги для дальнейшего перехода в пар в пакете/под полотенцем.
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-stone-950/60 border border-stone-800 space-y-1">
                      <strong className="text-sky-300 block text-[11px]">2. Ручки в воде (капиллярное питание):</strong>
                      <span className="text-[11px] text-stone-300 leading-snug block">
                        Ставим веник ручками в воду и накрываем пакетом/полотенцем (чтобы не пересыхал): капилляры веток впитывают воду, делая веник упругим и эластичным.
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-stone-950/60 border border-stone-800 space-y-1">
                      <strong className="text-emerald-300 block text-[11px]">3. Молодой vs Старый лист:</strong>
                      <span className="text-[11px] text-stone-300 leading-snug block">
                        • <u>Молодой веник</u>: дойдет до рабочей кондиции прямо в процессе парения.
                        <br />• <u>Старый грубый лист</u>: требует больше времени и тепла. Перед парением подержите над паром каменки (аккуратно — пар обжигает руки!).
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-[11px] text-emerald-300 font-mono">
                  💡 Чем старше лист — тем дольше и горячее запарка.
                </div>
              </div>

            </div>

            {/* Совет мастера по весу веников */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/60 via-stone-900 to-amber-950/50 border border-amber-500/40 flex items-center gap-3 text-xs sm:text-sm text-amber-200 relative z-10 shadow-lg">
              <span className="text-xl shrink-0">💡</span>
              <span className="leading-relaxed font-medium">
                <strong className="text-amber-300 font-bold block sm:inline mr-1">Совет мастера:</strong>
                для отработки первых приёмов рекомендую брать тяжёлые веники, а для непосредственного парения — брать удобные и лёгкие веники.
              </span>
            </div>
          </div>
        )}

        {level.interactiveType === 'broom_techniques' && (
          <BroomTechniquesSimulator
            soundEnabled={soundEnabled}
            onGrantXp={onGrantXp}
            unlockedBadges={progress.unlockedBadges}
            onUnlockBadge={(badgeId, xp) => {
              if (onUnlockBadge) onUnlockBadge(badgeId, xp);
            }}
            onNavigateToLevel={(lvlId) => {
              if (onSelectLevel) onSelectLevel(lvlId);
            }}
          />
        )}

        {level.interactiveType === 'herbal_bar' && (
          <HerbalBlenderSimulator
            soundEnabled={soundEnabled}
            onGrantXp={onGrantXp}
          />
        )}

        {level.interactiveType === 'safety_triage' && (
          <GuestTriageSimulator
            soundEnabled={soundEnabled}
            unlockedBadges={progress.unlockedBadges}
            onUnlockBadge={(badgeId, xp) => {
              if (onUnlockBadge) onUnlockBadge(badgeId, xp);
            }}
            onGrantXp={(xp) => {
              onGrantXp(xp);
              markTaskCompleted('interactive');
            }}
            onSuccess={() => {
              markTaskCompleted('interactive');
              markTaskCompleted('guest_safety');
            }}
            onMasterSafetyCompleted={() => {
              markTaskCompleted('master_safety');
            }}
            onGuestSafetyCompleted={() => {
              markTaskCompleted('guest_safety');
            }}
            onErgonomicsSafetyCompleted={() => {
              markTaskCompleted('ergonomics_safety');
            }}
          />
        )}
        {level.interactiveType === 'biomechanics_steam' && (
          <BiomechanicsSteamSimulator
            soundEnabled={soundEnabled}
            onGrantXp={(xp) => {
              onGrantXp(xp);
              markTaskCompleted('interactive');
            }}
            onSuccess={() => markTaskCompleted('interactive')}
          />
        )}
        {level.interactiveType === 'physiology_thermal' && (
          <PhysiologyThermalSimulator
            soundEnabled={soundEnabled}
            onGrantXp={(xp) => {
              onGrantXp(xp);
              markTaskCompleted('interactive');
            }}
            onSuccess={() => markTaskCompleted('interactive')}
          />
        )}
        {level.interactiveType === 'guest_service' && (
          <GuestServiceSimulator
            soundEnabled={soundEnabled}
            onGrantXp={(xp) => {
              onGrantXp(xp);
              markTaskCompleted('interactive');
            }}
            onSuccess={() => markTaskCompleted('interactive')}
          />
        )}

        {level.interactiveType === 'emergency_cases' && (
          <div className="rounded-2xl border border-stone-800 bg-stone-900/90 p-6 space-y-4">
            <h4 className="font-serif text-lg font-bold text-stone-100">
              Командная Работа и Алгоритмы в Парной
            </h4>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Отработайте взаимодействие с напарником при парении в четыре руки и протокол безопасной эвакуации гостя при симптомах гипертермии.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="rounded-xl bg-stone-950 p-4 border border-stone-800 text-xs text-stone-300 space-y-1.5">
                <strong className="text-amber-400 block font-semibold">Тандем в 4 руки:</strong>
                <p>Ведущий мастер задает темп и держит паровой пирог над корпусом, ведомый мастер синхронно прорабатывает стопы и икры гостя.</p>
              </div>
              <div className="rounded-xl bg-stone-950 p-4 border border-stone-800 text-xs text-stone-300 space-y-1.5">
                <strong className="text-rose-400 block font-semibold">Экстренная помощь:</strong>
                <p>При слабости — горизонтальное положение, приподнять ноги на валик, холодный компресс на лоб и виски, теплое питье малыми глотками.</p>
              </div>
            </div>
          </div>
        )}

        {level.interactiveType === 'master_growth' && (
          <div className="rounded-2xl border border-stone-800 bg-stone-900/90 p-6 space-y-4">
            <h4 className="font-serif text-lg font-bold text-stone-100">
              Индивидуальный План Профессионального Роста
            </h4>
            <div className="space-y-3 text-xs text-stone-300">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-stone-950 border border-stone-800">
                <span className="text-xl">📚</span>
                <div>
                  <strong className="text-stone-100 block">3+ семинара в год:</strong>
                  <span>Изучение закрытых каменок, мягкого мелкодисперсного пара и анатомических техник.</span>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-stone-950 border border-stone-800">
                <span className="text-xl">🌿</span>
                <div>
                  <strong className="text-stone-100 block">Фито-экспедиции:</strong>
                  <span>Самостоятельный сбор и правильная сушка дикорастущих трав (полынь, донник, душица).</span>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-stone-950 border border-stone-800">
                <span className="text-xl">🏆</span>
                <div>
                  <strong className="text-stone-100 block">Участие в чемпионатах:</strong>
                  <span>Выход на арену профессионального банного сообщества и оттачивание чистоты движений.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {level.interactiveType === 'final_exam' && (
          <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-950/30 to-stone-900 p-8 text-center space-y-5">
            <div className="text-5xl">👑</div>
            <h4 className="font-serif text-2xl font-bold text-amber-200">
              Финальный Босс: Квалификационный Экзамен
            </h4>
            <p className="text-xs sm:text-sm text-stone-300 max-w-md mx-auto leading-relaxed">
              Вы прошли все уровни теоретической и практической подготовки! Сдайте комплексный тест из 10 вопросов, чтобы получить официальный Сертификат и Корону Пармастера.
            </p>
            <button
              onClick={onStartExam}
              className="px-8 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg cursor-pointer transform hover:scale-105"
            >
              Начать Финальный Экзамен 👑
            </button>
          </div>
        )}
      </div>

      {/* Mini-Quiz (Unless Final Exam) */}
      {level.quiz.length > 0 && (
        <div className="rounded-2xl border border-stone-800 bg-stone-900/90 p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <div>
              <div className="text-xs font-mono uppercase text-amber-400">
                Проверка знаний уровня
              </div>
              <h4 className="font-serif text-xl font-bold text-stone-100 mt-0.5">
                Мини-Тест: Закрепление Знаний
              </h4>
            </div>

            {isCompleted && (
              <span className="px-3 py-1 rounded-md bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Уровень сдан!</span>
              </span>
            )}
          </div>

          <div className="space-y-6">
            {level.quiz.map((q, qIdx) => {
              const selectedOpt = selectedAnswers[qIdx];
              const isTestPassed = isCompleted && hasCompletedQuiz;

              return (
                <div key={q.id} className="rounded-xl bg-stone-950/70 border border-stone-800 p-5 space-y-3">
                  <div className="flex items-start gap-2.5">
                    <span className="font-mono text-xs text-amber-400 font-bold mt-0.5">
                      {qIdx + 1}.
                    </span>
                    <h5 className="font-medium text-xs sm:text-sm text-stone-200">
                      {q.question}
                    </h5>
                  </div>

                  {/* Options */}
                  <div className="space-y-2 pt-1 pl-4">
                    {q.options.map((opt, optIdx) => {
                      const isChosen = selectedOpt === optIdx;
                      let optClass = 'border-stone-800 bg-stone-900/80 hover:bg-stone-850 hover:border-stone-700 text-stone-300';

                      if (isTestPassed) {
                        if (optIdx === q.correctIndex) {
                          optClass = 'border-emerald-500 bg-emerald-950/40 text-emerald-200';
                        } else if (isChosen && optIdx !== q.correctIndex) {
                          optClass = 'border-rose-500 bg-rose-950/40 text-rose-200';
                        } else {
                          optClass = 'border-stone-800 bg-stone-950/30 text-stone-500 opacity-60';
                        }
                      } else {
                        if (isChosen) {
                          optClass = 'border-amber-400 bg-amber-500/15 text-amber-200 ring-1 ring-amber-400/40 shadow-sm';
                        }
                      }

                      return (
                        <button
                          key={optIdx}
                          onClick={() => handleSelectAnswer(qIdx, optIdx)}
                          disabled={isTestPassed}
                          className={`w-full p-3.5 rounded-xl border text-left text-xs sm:text-sm transition-all cursor-pointer ${optClass}`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                                isChosen
                                  ? 'border-amber-400 bg-amber-400 text-stone-950'
                                  : 'border-stone-600 bg-stone-900'
                              }`}
                            >
                              {isChosen && <div className="w-1.5 h-1.5 rounded-full bg-stone-950" />}
                            </div>
                            <span className="font-mono text-xs opacity-60 shrink-0">
                              {String.fromCharCode(65 + optIdx)})
                            </span>
                            <span className="leading-relaxed">{opt}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Immediate feedback & rationale ONLY after test has been passed */}
                  {isTestPassed && (
                    <div className="text-xs p-3.5 rounded-xl mt-2 bg-emerald-950/30 text-emerald-300 border border-emerald-500/30 leading-relaxed space-y-1">
                      <strong className="block text-emerald-200">
                        ✓ Пояснение мастера:
                      </strong>
                      <p>{q.explanation}</p>
                      {q.proTip && (
                        <p className="text-amber-300/90 font-mono text-[11px] pt-1">
                          💡 {q.proTip}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Action button */}
          <div className="pt-3">
            {!isCompleted || !hasCompletedQuiz ? (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="text-xs font-mono text-stone-400">
                  {Object.keys(selectedAnswers).length < level.quiz.length ? (
                    <span>
                      Ответьте на все вопросы: <strong className="text-amber-400">{Object.keys(selectedAnswers).length}</strong> из {level.quiz.length} выбрано
                    </span>
                  ) : (
                    <span className="text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Все вопросы отмечены — нажмите «Проверить ответы»</span>
                    </span>
                  )}
                </div>
                <button
                  onClick={isLevelLocked ? onOpenPricing : handleCheckQuiz}
                  disabled={!isLevelLocked && Object.keys(selectedAnswers).length < level.quiz.length}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 disabled:opacity-40 disabled:cursor-not-allowed text-stone-950 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-amber-500/20 active:scale-95"
                >
                  <span>{isLevelLocked ? 'Сдать тест (Требуется PRO)' : 'Проверить ответы (+' + level.rewardXp + ' XP)'}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full p-4 rounded-xl bg-stone-950/90 border border-emerald-500/30">
                <div className="text-xs font-mono text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
                  <span className="font-semibold text-sm">
                    Тест успешно сдан! Награда: +{level.rewardXp} XP · {badge ? badge.name : 'Трофей'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedAnswers({});
                      setHasCompletedQuiz(false);
                    }}
                    className="text-[11px] font-mono text-stone-400 hover:text-amber-300 underline cursor-pointer"
                  >
                    Пройти повторно
                  </button>
                  
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Fail Modal: "Материал не усвоен, давай попробуем снова!" */}
      {showFailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative max-w-md w-full rounded-3xl bg-gradient-to-b from-stone-900 via-stone-950 to-stone-900 border border-rose-500/50 p-6 sm:p-8 shadow-2xl text-center space-y-5">
            <div className="w-16 h-16 rounded-3xl bg-rose-500/20 border border-rose-500/40 text-rose-400 mx-auto flex items-center justify-center text-3xl shadow-inner">
              ❌
            </div>
            
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-wider text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/30">
                Тест не сдан · Есть ошибки
              </span>
              <h3 className="text-2xl font-serif font-bold text-stone-100">
                Материал не усвоен!
              </h3>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                В ответах допущена ошибка. Чтобы стать настоящим мастером пара и не навредить здоровью гостя, все правила первого пара должны быть усвоены на 100%.
              </p>
              <p className="text-xs text-amber-300/90 font-medium">
                Давай попробуем снова! Внимательно повторите материал станции и ответьте на все вопросы заново.
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  setShowFailModal(false);
                  const el = document.getElementById('level-station-section');
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/25 cursor-pointer active:scale-95"
              >
                Повторить материал (В начало квеста) ↺
              </button>
            </div>
          </div>
        </div>
      )}

      
      {/* Modal for Level 2 Completion Promo / Paywall: Полный переход на 3-й уровень и разбор преимуществ оплаты */}
      {showLevel2PromoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="relative max-w-2xl w-full rounded-3xl bg-gradient-to-b from-stone-900 via-stone-950 to-stone-900 border-2 border-amber-500/80 p-5 sm:p-7 shadow-2xl text-left space-y-5 my-auto max-h-[95vh] overflow-y-auto">
            {/* Ambient glows */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="flex items-start justify-between gap-3 border-b border-stone-800 pb-4 relative z-10">
              <div className="flex items-center gap-3.5">
                <div className="relative flex items-center justify-center">
                  <div className="absolute inset-0 rounded-2xl bg-amber-500/30 blur-lg animate-pulse" />
                  <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-stone-950 flex items-center justify-center text-3xl shadow-xl ring-2 ring-amber-300/60">
                    🏆
                  </div>
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-mono uppercase font-bold tracking-wider mb-1">
                    <Check className="w-3 h-3 text-emerald-400 stroke-[3]" />
                    <span>Уровень 2 Успешно Завершён!</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-serif font-bold text-stone-100 flex items-center gap-2">
                    <span>Вы освоили базовую технику веников!</span>
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setShowLevel2PromoModal(false)}
                className="p-1.5 rounded-xl bg-stone-800 text-stone-400 hover:text-stone-100 hover:bg-stone-700 transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Earned Points Snapshot */}
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-stone-950/80 border border-amber-500/30 relative z-10">
              <div>
                <span className="text-[10px] font-mono uppercase text-stone-400 block">Начислено за практику:</span>
                <span className="text-lg font-serif font-bold text-amber-300">+{level.rewardXp} XP</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono uppercase text-stone-400 block">Трофей уровня:</span>
                <span className="text-xs font-serif font-bold text-amber-200">{badge?.name || 'Пармастер 2-го уровня'} 🌿</span>
              </div>
            </div>

            {/* What awaits in Level 3 */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/50 via-stone-900 to-amber-950/40 border border-amber-500/50 space-y-2 relative z-10">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Что ждёт вас на следующем 3-м уровне:</span>
              </div>
              <h4 className="font-serif text-base sm:text-lg font-bold text-stone-100">
                «Уровень 3: Фито- и Ароматерапия в парной»
              </h4>
              <p className="text-xs text-stone-300 leading-relaxed font-sans">
                На 3-м уровне мы переходим от механики движений к магии ароматов и целебных трав. Вы освоите:
              </p>
              <ul className="text-xs text-stone-200 space-y-1.5 pl-4 list-disc font-sans leading-relaxed">
                <li><strong>Интерактивный симулятор «Фито-Бар»:</strong> растирание целебных трав в каменной ступе пестиком без окисления и создание авторских банных купажей.</li>
                <li><strong>Большую энциклопедию 22 банных растений:</strong> от таёжной хвои (пихта, кедр, можжевельник) до луговых дикоросов (донник, полынь, таволга, чабрец).</li>
                <li><strong>Технику «Холодное дыхание»:</strong> как парить гостя в плотном жаре 65°C с морозным веником и свежей мятой на лице без гипоксии.</li>
                <li><strong>Безопасность эфирных масел:</strong> правила защиты слизистых оболочек от микроожогов и запрет подачи масел прямо на раскаленные камни.</li>
                <li><strong>Награда 3-го уровня:</strong> Кованый печной черпак с удлинённой рукоятью («печной жезл»).</li>
              </ul>
            </div>

            {/* What unlocks after paying for the course */}
            <div className="p-4 rounded-2xl bg-stone-950/90 border border-amber-500/40 space-y-3 relative z-10">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold">
                <Award className="w-4 h-4 text-emerald-400" />
                <span>Что открывается после оплаты полного курса:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-stone-200 font-sans">
                <div className="p-2.5 rounded-xl bg-stone-900/90 border border-stone-800 flex items-start gap-2">
                  <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>Полный доступ ко всем уровням (3–7):</strong> Фитотерапия, Физиология пара, Тандем в 4 руки, Разбор ЧП и Аттестация.</span>
                </div>
                <div className="p-2.5 rounded-xl bg-stone-900/90 border border-stone-800 flex items-start gap-2">
                  <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>Именной верифицированный Сертификат:</strong> официальный электронный документ с уникальным номером и печатью Школы.</span>
                </div>
                <div className="p-2.5 rounded-xl bg-stone-900/90 border border-stone-800 flex items-start gap-2">
                  <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>Все профессиональные симуляторы:</strong> тренажер фито-бара, симулятор скорой помощи при ЧП в парной и разбор сложных гостей.</span>
                </div>
                <div className="p-2.5 rounded-xl bg-stone-900/90 border border-stone-800 flex items-start gap-2">
                  <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>Банный Клуб & Чат Сообщества:</strong> доступ к закрытому чату мастеров, вебинарам с Антоном Ирхиным и сдаче видео-заданий.</span>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/20 text-[11px] text-amber-300 font-mono">
                👑 Бессрочный доступ к материалам, методичкам и будущим обновлениям курса без скрытых подписок.
              </div>
            </div>

            {/* Price & CTA Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-stone-800 relative z-10">
              <div className="text-center sm:text-left">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-serif font-bold text-amber-300">3 390 ₽</span>
                  <span className="text-xs text-stone-500 line-through">6 990 ₽</span>
                  <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">-52%</span>
                </div>
                <span className="text-[11px] text-stone-400 font-mono">Единоразовая оплата через СБП или банковскую карту</span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
                <button
                  onClick={() => {
                    setShowLevel2PromoModal(false);
                    if (onOpenPricing) onOpenPricing();
                  }}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all shadow-xl shadow-amber-500/25 cursor-pointer text-center flex items-center justify-center gap-2 active:scale-95"
                >
                  <Lock className="w-3.5 h-3.5 text-stone-950" />
                  <span>Оплатить курс и открыть Уровень 3 →</span>
                </button>
                <button
                  onClick={() => {
                    setShowLevel2PromoModal(false);
                    if (onNavigateToMap) onNavigateToMap();
                  }}
                  className="w-full sm:w-auto px-4 py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-stone-200 border border-stone-800 text-xs font-semibold transition-colors cursor-pointer text-center"
                >
                  Позже
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal: Поздравления, заработанные очки, награды */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="relative max-w-lg w-full my-auto max-h-[92vh] flex flex-col rounded-3xl bg-gradient-to-b from-stone-900 via-stone-950 to-stone-900 border border-amber-500/60 p-5 sm:p-7 shadow-2xl text-center overflow-hidden">
            <div className="overflow-y-auto flex-1 pr-1 space-y-4 sm:space-y-5">
            <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
              <div className="absolute inset-0 rounded-3xl bg-amber-500/30 blur-xl animate-pulse" />
              <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-stone-950 flex items-center justify-center text-4xl shadow-xl ring-2 ring-amber-300/50">
                🏆
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-wider text-amber-300 bg-amber-500/15 px-3 py-1 rounded-full border border-amber-500/30">
                Уровень успешно пройден!
              </span>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-stone-100">
                {level.id === 1
                  ? 'Поздравляем с прохождением 1-го уровня!'
                  : `Поздравляем с прохождением ${level.id}-го уровня!`}
              </h3>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed max-w-md mx-auto">
                Вы блестяще ответили на все вопросы проверочного мини-теста и доказали глубокое понимание темы «{level.title}»!
              </p>
            </div>

            {/* Earned Points & Reward Badge */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
              <div className="p-4 rounded-2xl bg-stone-950/90 border border-amber-500/40 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase text-stone-400">Заработано очков</span>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-serif font-bold text-amber-300">
                  +{level.rewardXp} XP
                </div>
                <div className="text-[11px] text-stone-400 font-mono">
                  Общий опыт: <span className="text-amber-200 font-semibold">{progress.xp + level.rewardXp} XP</span>
                </div>
              </div>

              {badge && (
                <div className="p-4 rounded-2xl bg-stone-950/90 border border-amber-500/40 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase text-stone-400">Награда получена</span>
                    <Award className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl filter drop-shadow">{badge.icon}</span>
                    <div className="text-xs font-serif font-bold text-amber-200 leading-tight">
                      {badge.name}
                    </div>
                  </div>
                  <div className="text-[10px] text-stone-400 line-clamp-2">
                    {badge.description}
                  </div>
                </div>
              )}
            </div>

            {/* Level 1 specific tip for level 2 */}
            {level.id === 1 && (
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-950/60 via-stone-900 to-amber-950/60 border-2 border-amber-500/60 text-left space-y-2 shadow-xl ring-1 ring-amber-500/20">
                <div className="flex items-center gap-2 text-xs sm:text-sm font-serif font-bold text-amber-300">
                  <span className="text-base sm:text-lg">🌿</span>
                  <span>Подготовка ко 2-му уровню:</span>
                </div>
                <p className="text-xs sm:text-sm text-stone-100 font-semibold leading-relaxed">
                  Во втором уровне понадобится <span className="text-amber-300 underline decoration-amber-400 font-extrabold">два веника для отработки движений</span>!
                </p>
                <div className="text-[11px] text-stone-400 font-mono flex items-center gap-1.5 pt-0.5">
                  <span>💡</span>
                  <span>Подготовьте любые два банных веника (дубовые, берёзовые или тренировочные) для практики 8 фундаментальных приёмов.</span>
                </div>
              </div>
            )}

            {/* SPECIAL LEVEL 2 GRADUATION MESSAGE: Transition from Home Master to PRO Master */}
            {level.id === 2 && (
              <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-amber-950/70 via-stone-950 to-amber-900/40 border-2 border-amber-400/80 text-left space-y-3 shadow-2xl relative overflow-hidden ring-2 ring-amber-400/20">
                <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-xl shrink-0">
                    👑
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase font-bold text-amber-400 tracking-wider block">
                      Напутствие мастера · Итоги базового курса
                    </span>
                    <h4 className="font-serif font-bold text-stone-100 text-sm sm:text-base">
                      Базовый рубеж успешно пройден!
                    </h4>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-stone-900/90 border border-amber-500/30 space-y-2.5 relative z-10">
                  <p className="text-xs sm:text-sm text-amber-100 leading-relaxed">
                    «Вы освоили базу для дома и семьи. Ваши близкие теперь в надежных и заботливых руках! Но если вы чувствуете, что баня зовет вас дальше — парить людей профессионально, зарабатывать на этом и не выгорать на смене — добро пожаловать в закрытый клуб мастеров PRO на Уровнях 3–7. Ваш Золотой Ключ уже ждет свой сундук!»
                  </p>
                  
                  <div className="flex items-center gap-2 text-[11px] font-mono text-amber-300/90 pt-1 border-t border-stone-800">
                    <span>🗝️</span>
                    <span>Сундук Тайных Знаний ждет вас на 3-м уровне в разделе фитотерапии!</span>
                  </div>
                </div>
              </div>
            )}

            </div>

            {/* Action buttons (Sticky at bottom) */}
            <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-3 border-t border-stone-800/80 shrink-0">
              

              {level.id < 7 && onSelectLevel ? (
                <button
                  onClick={() => {
                    setShowSuccessModal(false);
                    if (level.id === 2 && !isPaidMaster) {
                      if (onOpenPricing) onOpenPricing();
                    } else {
                      onSelectLevel((level.id + 1) as LevelId);
                    }
                  }}
                  className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/25 cursor-pointer text-center"
                >
                  {level.id === 2 && !isPaidMaster ? '👑 Открыть Уровень 3 (Тариф PRO) →' : '🌿 Перейти к уровню ' + (level.id + 1) + ' →'}
                </button>
              ) : (
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/25 cursor-pointer text-center"
                >
                  Отлично, продолжить
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Fullscreen Modal: Библиотека Трав (22 растения) */}
      {isHerbsLibraryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-5xl my-auto max-h-[95vh] flex flex-col rounded-3xl bg-stone-950 border border-emerald-500/50 shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-950/90 via-stone-900 to-stone-950 border-b border-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-xl shrink-0">
                  🌿
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase font-bold text-emerald-400 tracking-wider block">
                    Полный Справочник Пармастера
                  </span>
                  <h3 className="font-serif font-bold text-base sm:text-xl text-stone-100">
                    Библиотека Банных Растений (22 Вида)
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsHerbsLibraryOpen(false)}
                className="p-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-stone-100 transition-colors border border-stone-700 cursor-pointer"
                title="Закрыть энциклопедию"
              >
                ✕
              </button>
            </div>

            {/* Modal Body with HerbsEncyclopedia */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1">
              <HerbsEncyclopedia
                soundEnabled={soundEnabled}
                onGrantXp={onGrantXp}
                onSelectForBrew={() => {
                  setIsHerbsLibraryOpen(false);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
