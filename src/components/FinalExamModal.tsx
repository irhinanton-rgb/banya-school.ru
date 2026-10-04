import React, { useState } from 'react';
import { FINAL_EXAM_QUESTIONS } from '../data/courseData';
import { QuizQuestion } from '../types/banya';
import { playSuccessChime } from '../utils/audio';
import confetti from '../utils/confetti';
import { Award, CheckCircle2, XCircle, ArrowRight, RotateCcw, X } from 'lucide-react';

interface FinalExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPassExam: (score: number) => void;
  soundEnabled: boolean;
}

export const FinalExamModal: React.FC<FinalExamModalProps> = ({
  isOpen,
  onClose,
  onPassExam,
  soundEnabled,
}) => {
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<number, number>>({});
  const [isFinished, setIsFinished] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentQ: QuizQuestion = FINAL_EXAM_QUESTIONS[currentIdx];
  const totalQ = FINAL_EXAM_QUESTIONS.length;

  const handleSelect = (optionIdx: number) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [currentIdx]: optionIdx,
    }));
  };

  const handleNext = () => {
    if (currentIdx < totalQ - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      // Calculate score
      let score = 0;
      FINAL_EXAM_QUESTIONS.forEach((q, idx) => {
        if (selectedOptions[idx] === q.correctIndex) {
          score += 1;
        }
      });
      setIsFinished(true);

      const passThreshold = 8;
      if (score >= passThreshold) {
        playSuccessChime(soundEnabled);
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.6 },
        });
        onPassExam(score);
      }
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedOptions({});
    setIsFinished(false);
  };

  // Score calculation for results view
  let correctCount = 0;
  FINAL_EXAM_QUESTIONS.forEach((q, idx) => {
    if (selectedOptions[idx] === q.correctIndex) correctCount += 1;
  });
  const percent = Math.round((correctCount / totalQ) * 100);
  const passed = correctCount >= 8;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl border border-stone-800 bg-stone-900 p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-stone-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-300">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-amber-400">
                Финальный Босс · Квалификационный Экзамен
              </div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-100">
                Аттестация на Звание «Пармастер»
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {!isFinished ? (
          /* Question Form */
          <div className="space-y-6">
            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono text-stone-400">
                <span>Вопрос {currentIdx + 1} из {totalQ}</span>
                <span>Проходной балл: 8 из 10 (80%)</span>
              </div>
              <div className="h-1.5 w-full bg-stone-950 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 transition-all duration-300"
                  style={{ width: `${((currentIdx + 1) / totalQ) * 100}%` }}
                />
              </div>
            </div>

            {/* Question Text */}
            <div className="rounded-xl border border-stone-800 bg-stone-950 p-5">
              <span className="text-xs font-mono text-amber-400 block mb-2">
                СИТУАЦИЯ / ТЕОРИЯ:
              </span>
              <h4 className="font-serif text-lg sm:text-xl font-semibold text-stone-100 leading-snug">
                {currentQ.question}
              </h4>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {currentQ.options.map((opt, optIdx) => {
                const isSelected = selectedOptions[currentIdx] === optIdx;
                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelect(optIdx)}
                    className={`w-full p-4 rounded-xl border text-left text-xs sm:text-sm leading-relaxed transition-all cursor-pointer ${
                      isSelected
                        ? 'border-amber-500 bg-amber-950/40 text-amber-100 ring-1 ring-amber-500'
                        : 'border-stone-800 bg-stone-950/70 hover:border-stone-700 hover:bg-stone-800/60 text-stone-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`h-5 w-5 rounded-full flex items-center justify-center text-xs font-mono mt-0.5 shrink-0 ${
                          isSelected
                            ? 'bg-amber-500 text-stone-950 font-bold'
                            : 'border border-stone-700 text-stone-400'
                        }`}
                      >
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span>{opt}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Next / Submit Button */}
            <div className="flex justify-end pt-2">
              <button
                onClick={handleNext}
                disabled={selectedOptions[currentIdx] === undefined}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md"
              >
                <span>{currentIdx === totalQ - 1 ? 'Завершить экзамен' : 'Следующий вопрос'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Results Summary */
          <div className="space-y-6">
            <div
              className={`rounded-xl p-6 text-center space-y-3 border ${
                passed
                  ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-100'
                  : 'bg-rose-950/30 border-rose-500/50 text-rose-100'
              }`}
            >
              <div className="text-4xl">{passed ? '👑' : '📚'}</div>
              <h4 className="font-serif text-2xl font-bold">
                {passed ? 'Экзамен сдан! Звание «Пармастер» присвоено!' : 'Экзамен не сдан: нужно повторить материал'}
              </h4>
              <p className="text-sm opacity-90 max-w-md mx-auto">
                {passed
                  ? 'Поздравляем! Вы продемонстрировали глубокое понимание физиологии бани, безупречное знание техник безопасности и венечного мастерства.'
                  : `Вы набрали ${correctCount} из 10 баллов (${percent}%). Для успешной аттестации необходимо правильно ответить минимум на 8 вопросов.`}
              </p>

              <div className="pt-2 font-mono text-xl font-bold">
                Результат: {correctCount} / 10 ({percent}%)
              </div>
            </div>

            {/* Detailed Review */}
            <div className="space-y-3 max-h-72 overflow-y-auto pr-2 scrollbar-thin">
              <div className="text-xs font-mono uppercase text-stone-400">
                Разбор ответов:
              </div>
              {FINAL_EXAM_QUESTIONS.map((q, idx) => {
                const userChoice = selectedOptions[idx];
                const isCorrect = userChoice === q.correctIndex;
                return (
                  <div
                    key={q.id}
                    className={`p-3.5 rounded-lg border text-xs leading-relaxed ${
                      isCorrect
                        ? 'border-emerald-500/30 bg-emerald-950/10 text-stone-300'
                        : 'border-rose-500/30 bg-rose-950/20 text-stone-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-semibold mb-1">
                      {isCorrect ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-rose-400 shrink-0" />
                      )}
                      <span>{idx + 1}. {q.question}</span>
                    </div>
                    {!isCorrect && (
                      <div className="pl-6 space-y-1 text-stone-400">
                        <div>
                          Правильный ответ:{' '}
                          <span className="text-emerald-400 font-medium">
                            {q.options[q.correctIndex]}
                          </span>
                        </div>
                        <div className="text-[11px] text-stone-400 italic">
                          {q.explanation}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-800">
              <button
                onClick={handleRestart}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-medium transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Пройти заново</span>
              </button>

              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md"
              >
                {passed ? 'Открыть именной Сертификат' : 'Вернуться к обучению'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
