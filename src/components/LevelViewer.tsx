import React, { useState, useRef, useEffect } from 'react';
import { LevelData, UserProgress, LevelId, BadgeId } from '../types/banya';
import { BADGES } from '../data/courseData';
import { MicroclimateSimulator } from './simulators/MicroclimateSimulator';
import { BroomTechniquesSimulator } from './simulators/BroomTechniquesSimulator';
import { HerbalBlenderSimulator } from './simulators/HerbalBlenderSimulator';
import { GuestTriageSimulator } from './simulators/GuestTriageSimulator';
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
  const [showFailModal, setShowFailModal] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const currentLevelIdRef = useRef<number>(level.id);

  useEffect(() => {
    // Only reset state if user navigated to a different level station
    if (currentLevelIdRef.current !== level.id) {
      currentLevelIdRef.current = level.id;
      setSelectedAnswers({});
      setShowFailModal(false);
      setShowSuccessModal(false);
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
    setShowSuccessModal(true);
    playSuccessChime(soundEnabled);
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }
    onCompleteLevel(level.id, level.rewardXp);
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
              {onNavigateToMap && (
                <button
                  onClick={onNavigateToMap}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-950/90 hover:bg-stone-900 border border-amber-500/30 hover:border-amber-400 text-stone-300 hover:text-amber-300 text-[11px] font-mono transition-all cursor-pointer shadow-sm"
                  title="Перейти к Карте Квеста"
                >
                  <span>🗺️ Карта Квеста</span>
                </button>
              )}
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
            <p className="text-sm text-stone-300 leading-relaxed">
              {level.summary}
            </p>
          </div>

          <div className="md:col-span-4 rounded-xl bg-stone-950/80 border border-amber-500/20 p-4 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
              <Lightbulb className="h-4 w-4" />
              <span>Интересный факт:</span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed italic">
              «{level.interestingFact}»
            </p>
          </div>
        </div>

        {/* Pro-Tip Bar */}
        <div className="rounded-xl bg-amber-950/20 border border-amber-500/30 p-3.5 text-xs text-amber-200/90 flex items-start gap-2.5">
          <ShieldCheck className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong>Совет наставника:</strong> {level.proTip}
          </div>
        </div>

        {/* Pro Level Access Banner */}
        {level.id > 2 && !progress.isPaid && progress.tariff !== 'master_pro' && !progress.isAdmin && (
          <div className="rounded-2xl bg-gradient-to-r from-amber-950/60 via-stone-900 to-amber-950/60 border border-amber-500/50 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center text-lg shrink-0">
                👑
              </div>
              <div>
                <div className="text-xs font-bold text-amber-100">
                  Уровень курса «Мастер Пара PRO»
                </div>
                <div className="text-[11px] text-stone-300">
                  Вы можете бесплатно изучать теорию. Для сдачи аттестации и получения именного сертификата активируйте полный доступ.
                </div>
              </div>
            </div>
            {onOpenPricing && (
              <button
                onClick={onOpenPricing}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shrink-0 cursor-pointer shadow-md transition-all whitespace-nowrap"
              >
                Открыть тарифы (3 390 ₽)
              </button>
            )}
          </div>
        )}
      </div>

      {/* Core Learning Cards (Burger King Microlearning Station Format) */}
      <div className="space-y-4">
        <h3 className="font-serif text-xl font-bold text-stone-100 flex items-center gap-2">
          <span>📖</span>
          <span>Ключевые Знания Станции</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {level.learningPoints.map((point, idx) => (
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
      </div>

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

        {level.interactiveType === 'broom_techniques' && (
          <BroomTechniquesSimulator
            soundEnabled={soundEnabled}
            onGrantXp={onGrantXp}
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
            onGrantXp={onGrantXp}
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
                  onClick={handleCheckQuiz}
                  disabled={Object.keys(selectedAnswers).length < level.quiz.length}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 disabled:opacity-40 disabled:cursor-not-allowed text-stone-950 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-amber-500/20 active:scale-95"
                >
                  <span>Проверить ответы (+{level.rewardXp} XP)</span>
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
                  {onNavigateToMap && (
                    <button
                      onClick={onNavigateToMap}
                      className="px-3.5 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-850 border border-amber-500/30 text-amber-300 text-xs font-mono transition-colors cursor-pointer"
                    >
                      Карта Квеста →
                    </button>
                  )}
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

      {/* Success Modal: Поздравления, заработанные очки, награды */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative max-w-lg w-full rounded-3xl bg-gradient-to-b from-stone-900 via-stone-950 to-stone-900 border border-amber-500/60 p-6 sm:p-8 shadow-2xl text-center space-y-6">
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

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              {onNavigateToMap && (
                <button
                  onClick={() => {
                    setShowSuccessModal(false);
                    onNavigateToMap();
                  }}
                  className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-amber-300 border border-amber-500/40 font-semibold text-xs transition-colors cursor-pointer text-center"
                >
                  🗺️ Карта Квеста
                </button>
              )}

              {level.id < 7 && onSelectLevel ? (
                <button
                  onClick={() => {
                    setShowSuccessModal(false);
                    onSelectLevel((level.id + 1) as LevelId);
                  }}
                  className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/25 cursor-pointer text-center"
                >
                  🌿 Перейти к уровню {level.id + 1} →
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
    </div>
  );
};
