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
  Share2,
  Send,
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
  const [isHerbsLibraryOpen, setIsHerbsLibraryOpen] = useState<boolean>(false);

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

        {/* Clean compact mentor bar across all Levels 1-7 */}
        {level.proTip && (
          <div className="rounded-xl bg-amber-950/20 border border-amber-500/30 p-3.5 text-xs sm:text-sm text-amber-200/90 flex items-start gap-2.5">
            <ShieldCheck className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              {level.proTip.startsWith('Совет наставника:') ? (
                level.proTip
              ) : (
                <>
                  <strong>Совет наставника:</strong> {level.proTip}
                </>
              )}
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

      {/* Embedded Level Simulator / Sequential Content */}
      <div className="space-y-4">
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
            onOpenHerbsLibrary={() => setIsHerbsLibraryOpen(true)}
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
            unlockedBadges={progress.unlockedBadges}
            onUnlockBadge={(badgeId, xp) => {
              if (onUnlockBadge) onUnlockBadge(badgeId, xp);
            }}
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
            onSubTaskComplete={(subTaskId) => {
              markTaskCompleted(subTaskId);
              onGrantXp(30);
            }}
            onComplete={() => {
              markTaskCompleted('interactive');
              onGrantXp(60);
            }}
          />
        )}
        {level.interactiveType === 'guest_service' && (
          <GuestServiceSimulator
            soundEnabled={soundEnabled}
            onSubTaskComplete={(subTaskId) => {
              markTaskCompleted(subTaskId);
              onGrantXp(30);
            }}
            onComplete={() => {
              markTaskCompleted('interactive');
              onGrantXp(60);
            }}
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

      {/* Final Exam Block on Level 7 (Crown of Course) */}
      {level.id === 7 && (
        <div className="rounded-2xl border-2 border-amber-500/50 bg-gradient-to-br from-amber-950/40 via-stone-900 to-stone-950 p-6 sm:p-8 text-center space-y-4 shadow-2xl">
          <div className="text-4xl sm:text-5xl">👑</div>
          <div className="space-y-1.5">
            <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-bold">
              Финальный рубеж курса · 7 уровней пройдено
            </span>
            <h4 className="font-serif text-xl sm:text-2xl font-bold text-stone-100">
              Итоговый Экзамен на Именной Сертификат и Корону Пармастера
            </h4>
            <p className="text-xs sm:text-sm text-stone-300 max-w-lg mx-auto leading-relaxed">
              Сдайте итоговый квалификационный тест из 10 вопросов по всем темам курса, чтобы получить официальный именной Сертификат и Корону Пармастера.
            </p>
          </div>
          <button
            onClick={onStartExam}
            className="px-7 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg cursor-pointer active:scale-95"
          >
            Начать Финальный Экзамен 👑
          </button>
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
                «Уровень 3: Биомеханика, Звук Веника и Управление Паром»
              </h4>
              <p className="text-xs text-stone-300 leading-relaxed font-sans">
                Вы изучили 8 базовых приёмов, а на 3-м уровне переходите к профессиональной постановке тела и управления паром в 3 специальных видеотеках:
              </p>
              <ul className="text-xs text-stone-200 space-y-1.5 pl-4 list-disc font-sans leading-relaxed">
                <li><strong>Видеотека 1 «Банное тай-чи»:</strong> стойка лучника, волновой импульс от стоп и защита поясницы мастера от перегрузок.</li>
                <li><strong>Видеотека 2 «Звук веников и ритмичные удары»:</strong> как добиться мягкого бархатного звука лиственной подушки без ударов ветками.</li>
                <li><strong>Видеотека 3 «Управление паром»:</strong> забор пара из-под потолка «лодочкой» и бережное опускание тепла на гостя.</li>
                <li><strong>Кованый Сундук Тайных Знаний:</strong> именно на 3-м уровне вы сможете открыть сундук найденным Золотым Ключом!</li>
                <li><strong>Награда 3-го уровня:</strong> Экипировка Мастера (колпак и рашгард) для перехода к Уровню 4 «Безопасность мастера и гостя».</li>
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
                  <span><strong>Логическая цепочка PRO (Уровни 3–7):</strong> Биомеханика и пар → Безопасность и триаж → Физиология тела → Фитотерапия (22 травы) → Сервис и психология.</span>
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

            {/* XP Discount Conversion Banner right at Level 2 Completion */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-stone-900 to-amber-950/50 border border-emerald-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
              <div className="text-xs text-stone-200 space-y-0.5">
                {progress.xp >= 600 ? (
                  <>
                    <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                      <span>🔥 Вы собрали {progress.xp} XP (100% за 2 уровня)!</span>
                    </div>
                    <p className="text-[11px] text-stone-300">
                      В «Банке Опыта» вам доступен максимальный <strong>Бонус №2: скидка -500 ₽</strong> — заберите полный курс за <strong>2 890 ₽</strong> вместо 3 390 ₽!
                    </p>
                  </>
                ) : (
                  <>
                    <div className="font-bold text-amber-300 flex items-center gap-1.5">
                      <span>🎟️ Ваш баланс: {progress.xp} XP — открыт Бонус №1 (скидка -250 ₽)!</span>
                    </div>
                    <p className="text-[11px] text-stone-300">
                      Вы уже можете забрать курс за <strong>3 140 ₽</strong> (или добрать ещё {Math.max(0, 600 - progress.xp)} XP за секреты 1–2 уровня для максимальной скидки <strong>-500 ₽ → 2 890 ₽</strong>).
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Price & CTA Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-stone-800 relative z-10">
              <div className="text-center sm:text-left">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-serif font-bold text-amber-300">
                    {progress.xp >= 600 ? '2 890 ₽' : '3 140 ₽'}
                  </span>
                  <span className="text-xs text-stone-500 line-through">3 390 ₽</span>
                  <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    {progress.xp >= 600 ? 'Скидка -500 ₽ за XP' : 'Скидка -250 ₽ за XP'}
                  </span>
                </div>
                <span className="text-[11px] text-stone-400 font-mono">
                  Активируйте купон за XP в Банке Опыта перед оплатой
                </span>
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
                  <span>Забрать со скидкой и открыть Уровень 3 →</span>
                </button>
                <button
                  onClick={() => {
                    setShowLevel2PromoModal(false);
                    if (onNavigateToMap) onNavigateToMap();
                  }}
                  className="w-full sm:w-auto px-4 py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-stone-200 border border-stone-800 text-xs font-semibold transition-colors cursor-pointer text-center"
                >
                  Добрать XP
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
                    <span>Сундук Тайных Знаний ждет вас на 3-м уровне (Биомеханика и управление паром)!</span>
                  </div>
                </div>
              </div>
            )}

            {/* Viral Share Result Block (Telegram & VK) */}
            <div className="p-3.5 rounded-2xl bg-stone-950/80 border border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
              <div className="text-xs text-stone-300">
                <strong className="text-amber-300 block">Поделиться успехом с друзьями:</strong>
                <span className="text-[11px] text-stone-400">Пригласите близких пройти банный квест</span>
              </div>
              <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    const shareText = `🏆 Я прошёл ${level.id}-й уровень «${level.title}» в интерактивной школе банного мастерства и заработал +${level.rewardXp} XP! Попробуй свои силы в парной:`;
                    window.open(
                      `https://t.me/share/url?url=${encodeURIComponent('https://banya-school.ru')}&text=${encodeURIComponent(shareText)}`,
                      '_blank',
                      'noopener,noreferrer'
                    );
                  }}
                  className="flex-1 sm:flex-initial px-3 py-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>В Telegram</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const shareText = `🏆 Я прошёл ${level.id}-й уровень «${level.title}» в интерактивной школе банного мастерства! Попробуй бесплатно:`;
                    window.open(
                      `https://vk.com/share.php?url=${encodeURIComponent('https://banya-school.ru')}&title=${encodeURIComponent(shareText)}`,
                      '_blank',
                      'noopener,noreferrer'
                    );
                  }}
                  className="flex-1 sm:flex-initial px-3 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>ВКонтакте</span>
                </button>
              </div>
            </div>

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
                  onClick={() => {
                    setShowSuccessModal(false);
                    if (onStartExam) onStartExam();
                  }}
                  className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/25 cursor-pointer text-center"
                >
                  👑 Начать Финальный Экзамен на Сертификат →
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
