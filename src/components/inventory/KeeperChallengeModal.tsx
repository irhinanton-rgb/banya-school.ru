import React, { useState } from 'react';
import { KEEPER_CHALLENGE_QUESTIONS } from '../../data/secretKnowledgeData';
import { BadgeId } from '../../types/banya';
import { playSuccessChime, playWoodTap } from '../../utils/audio';
import confetti from 'canvas-confetti';
import {
  X,
  Sparkles,
  Key,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

interface KeeperChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnlockKey: (badgeId: BadgeId, xp: number) => void;
  soundEnabled: boolean;
}

export const KeeperChallengeModal: React.FC<KeeperChallengeModalProps> = ({
  isOpen,
  onClose,
  onUnlockKey,
  soundEnabled,
}) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [hasWon, setHasWon] = useState<boolean>(false);

  if (!isOpen) return null;

  const totalQuestions = KEEPER_CHALLENGE_QUESTIONS.length;
  const answeredCount = Object.keys(selectedAnswers).length;

  const handleSelect = (qIdx: number, optIdx: number) => {
    if (submitted && hasWon) return;
    setSelectedAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
    playWoodTap(soundEnabled);
  };

  const handleCheck = () => {
    if (answeredCount < totalQuestions) return;

    let allCorrect = true;
    KEEPER_CHALLENGE_QUESTIONS.forEach((q, idx) => {
      if (selectedAnswers[idx] !== q.correctIndex) {
        allCorrect = false;
      }
    });

    setSubmitted(true);

    if (allCorrect) {
      setHasWon(true);
      playSuccessChime(soundEnabled);
      confetti({
        particleCount: 80,
        spread: 90,
        origin: { y: 0.6 },
      });
      onUnlockKey('golden_key', 150);
    }
  };

  const handleRetry = () => {
    setSelectedAnswers({});
    setSubmitted(false);
    setHasWon(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-stone-900 border border-amber-500/50 rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl relative animate-scale-up">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="p-5 border-b border-stone-800 flex items-center justify-between shrink-0 bg-stone-950/40 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl shrink-0 border border-amber-500/40">
              🗝️
            </div>
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-amber-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>Секретное Дополнительное Задание</span>
              </div>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-100">
                Тайное Испытание Хранителя Пара
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-stone-800 text-stone-400 hover:text-stone-100 hover:bg-stone-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 relative z-10">
          {/* Lore Intro */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/40 via-stone-900 to-amber-950/30 border border-amber-500/30 text-xs text-stone-300 leading-relaxed space-y-2">
            <div className="font-bold text-amber-300 flex items-center gap-1.5">
              <span>🧙‍♂️</span>
              <span>Мудрость Старого Мастера:</span>
            </div>
            <p>
              «Золотой Ключ от Кованого Сундука дается не за силу рук, а за чуткость сердца и тонкое понимание души пара. Ответьте на 3 сокровенных вопроса без права на ошибку — и замок Сундука подчинится вашей воле!»
            </p>
            <div className="text-[11px] text-amber-400/90 font-mono">
              Награда: <strong>Золотой Ключ Тайных Знаний</strong> + <strong>150 XP</strong>
            </div>
          </div>

          {/* Success Banner if won */}
          {hasWon && (
            <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 text-xs space-y-2 text-center animate-fade-in">
              <div className="text-2xl">🗝️ ✨</div>
              <div className="font-bold text-emerald-100 text-sm">
                Поздравляем! Вы прошли испытание Хранителя!
              </div>
              <p>
                Золотой Ключ теперь в вашем инвентаре. Замок Сундука Тайных Знаний открыт — загляните внутрь и изучите древние свитки!
              </p>
            </div>
          )}

          {/* Failure Banner if not won */}
          {submitted && !hasWon && (
            <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs space-y-2 flex items-start gap-3 animate-fade-in">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-rose-100 font-semibold mb-1">
                  Не все ответы оказались верными
                </strong>
                <p>
                  Хранитель пара строг, но справедлив. Проанализируйте подсказки и попробуйте пройти испытание снова.
                </p>
              </div>
            </div>
          )}

          {/* Questions */}
          <div className="space-y-5">
            {KEEPER_CHALLENGE_QUESTIONS.map((q, qIdx) => {
              const selectedOpt = selectedAnswers[qIdx];
              const isAnswered = selectedOpt !== undefined;
              const isCorrect = isAnswered && selectedOpt === q.correctIndex;

              return (
                <div
                  key={q.id}
                  className="p-4 rounded-xl bg-stone-950/80 border border-stone-800 space-y-3"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 text-xs font-mono font-bold flex items-center justify-center shrink-0 border border-amber-500/30">
                      {qIdx + 1}
                    </span>
                    <h4 className="text-xs sm:text-sm font-semibold text-stone-100 leading-snug">
                      {q.question}
                    </h4>
                  </div>

                  <div className="space-y-1.5 pl-8">
                    {q.options.map((opt, optIdx) => {
                      const isChosen = selectedOpt === optIdx;
                      let btnStyle =
                        'border-stone-800 bg-stone-900/80 text-stone-300 hover:bg-stone-800 hover:text-stone-100';

                      if (submitted) {
                        if (optIdx === q.correctIndex) {
                          btnStyle = 'border-emerald-500 bg-emerald-950/40 text-emerald-200';
                        } else if (isChosen && !isCorrect) {
                          btnStyle = 'border-rose-500 bg-rose-950/40 text-rose-200';
                        } else {
                          btnStyle = 'border-stone-800 bg-stone-950/40 text-stone-500 opacity-60';
                        }
                      } else if (isChosen) {
                        btnStyle = 'border-amber-500 bg-amber-950/30 text-amber-200 ring-1 ring-amber-500/40';
                      }

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => handleSelect(qIdx, optIdx)}
                          className={`w-full p-2.5 rounded-lg border text-left text-xs transition-colors cursor-pointer ${btnStyle}`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] opacity-60">
                              {String.fromCharCode(65 + optIdx)})
                            </span>
                            <span>{opt}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {submitted && (
                    <div
                      className={`text-xs p-2.5 rounded-lg ml-8 ${
                        isCorrect
                          ? 'bg-emerald-950/30 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-950/30 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      <p>{q.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-800 bg-stone-950/60 flex items-center justify-between gap-3 shrink-0 relative z-10">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            {hasWon ? 'Вернуться к Сундуку' : 'Отложить'}
          </button>

          {!hasWon ? (
            submitted ? (
              <button
                onClick={handleRetry}
                className="px-5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 text-xs font-bold transition-all cursor-pointer border border-amber-500/40"
              >
                Попробовать снова
              </button>
            ) : (
              <button
                onClick={handleCheck}
                disabled={answeredCount < totalQuestions}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md"
              >
                <span>Подтвердить ({answeredCount}/{totalQuestions})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )
          ) : (
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-6 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md"
            >
              <span>Забрать Ключ и Открыть Сундук</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
