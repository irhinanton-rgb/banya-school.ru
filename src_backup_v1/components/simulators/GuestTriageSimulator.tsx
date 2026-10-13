import React, { useState } from 'react';
import { GUEST_CASES } from '../../data/courseData';
import { GuestCase } from '../../types/banya';
import { playSuccessChime } from '../../utils/audio';
import { UserCheck, ShieldAlert, Heart, CheckCircle2, XCircle, ArrowRight, AlertTriangle } from 'lucide-react';

interface GuestTriageSimulatorProps {
  soundEnabled: boolean;
  onGrantXp?: (amount: number) => void;
}

export const GuestTriageSimulator: React.FC<GuestTriageSimulatorProps> = ({
  soundEnabled,
  onGrantXp,
}) => {
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [selectedDecision, setSelectedDecision] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [solvedCount, setSolvedCount] = useState<number>(0);

  const currentCase: GuestCase = GUEST_CASES[currentIdx];

  const handleSelect = (decision: string) => {
    if (hasSubmitted) return;
    setSelectedDecision(decision);
  };

  const handleSubmit = () => {
    if (!selectedDecision || hasSubmitted) return;
    setHasSubmitted(true);

    const isCorrect = selectedDecision === currentCase.correctDecision;
    if (isCorrect) {
      playSuccessChime(soundEnabled);
      setSolvedCount((prev) => prev + 1);
      if (onGrantXp) onGrantXp(30);
    }
  };

  const handleNext = () => {
    setSelectedDecision(null);
    setHasSubmitted(false);
    setCurrentIdx((prev) => (prev + 1) % GUEST_CASES.length);
  };

  const isCurrentCorrect = selectedDecision === currentCase.correctDecision;

  return (
    <div className="rounded-2xl border border-stone-800 bg-stone-900/90 p-5 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
            <span>🛡️</span>
            <span>Тренажер Входной Диагностики</span>
          </div>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-100 mt-1">
            Приёмка Гостя: Противопоказания и Допуск к Парению
          </h3>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-stone-400">
          <span>Кейс {currentIdx + 1} из {GUEST_CASES.length}</span>
          <span className="text-stone-600">·</span>
          <span>Решено верно: <strong className="text-emerald-400">{solvedCount}</strong></span>
        </div>
      </div>

      {/* Guest Card */}
      <div className="rounded-xl border border-stone-800 bg-stone-950 p-6 space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-bold text-amber-300 text-sm">
              {currentCase.avatarText}
            </div>
            <div>
              <h4 className="font-serif text-lg font-bold text-stone-100">{currentCase.guestName}</h4>
              <p className="text-xs text-stone-400">Давление: {currentCase.bloodPressure}</p>
            </div>
          </div>

          <div className="px-3 py-1 rounded-md bg-stone-900 border border-stone-800 text-xs font-mono text-stone-300">
            Возраст: {currentCase.age} лет
          </div>
        </div>

        {/* Guest quote */}
        <div className="rounded-lg bg-stone-900/80 border-l-4 border-amber-500 p-4 text-xs sm:text-sm text-stone-200 italic leading-relaxed">
          {currentCase.request}
        </div>

        {/* Symptoms / Medical flags */}
        <div className="space-y-2">
          <div className="text-xs text-stone-400 font-mono uppercase tracking-wider">
            Выявленные симптомы и анамнез:
          </div>
          <div className="flex flex-wrap gap-2">
            {currentCase.symptoms.map((sym, i) => (
              <span
                key={i}
                className="px-2.5 py-1 rounded-md bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-1.5"
              >
                <span>⚠️</span>
                <span>{sym}</span>
              </span>
            ))}
            {currentCase.medicalConditions.map((med, i) => (
              <span
                key={i}
                className="px-2.5 py-1 rounded-md bg-stone-900 border border-stone-700 text-stone-300 text-xs"
              >
                {med}
              </span>
            ))}
          </div>
        </div>

        {/* Decision choices */}
        <div className="pt-2 space-y-3">
          <div className="text-xs font-semibold text-stone-300">
            Решение пармастера: какой вердикт вы выносите гостю?
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              onClick={() => handleSelect('allow_standard')}
              disabled={hasSubmitted}
              className={`p-3.5 rounded-xl border text-left text-xs font-medium transition-all cursor-pointer ${
                selectedDecision === 'allow_standard'
                  ? 'border-emerald-500 bg-emerald-950/40 text-emerald-200 ring-1 ring-emerald-500'
                  : 'border-stone-800 bg-stone-900 text-stone-300 hover:border-stone-700'
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-base">🟢</span>
                <span className="font-bold text-stone-100">Стандартная программа</span>
              </div>
              <p className="text-[11px] text-stone-400">
                Полный цикл парения, 60-70°C, контраст по желанию гостя.
              </p>
            </button>

            <button
              onClick={() => handleSelect('allow_gentle_adapted')}
              disabled={hasSubmitted}
              className={`p-3.5 rounded-xl border text-left text-xs font-medium transition-all cursor-pointer ${
                selectedDecision === 'allow_gentle_adapted'
                  ? 'border-amber-500 bg-amber-950/40 text-amber-200 ring-1 ring-amber-500'
                  : 'border-stone-800 bg-stone-900 text-stone-300 hover:border-stone-700'
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-base">🟡</span>
                <span className="font-bold text-stone-100">Щадящий спецрежим</span>
              </div>
              <p className="text-[11px] text-stone-400">
                Мягкий прогрев до 50-55°C, нижний полок, СТРОГО без ледяной купели.
              </p>
            </button>

            <button
              onClick={() => handleSelect('strictly_prohibited')}
              disabled={hasSubmitted}
              className={`p-3.5 rounded-xl border text-left text-xs font-medium transition-all cursor-pointer ${
                selectedDecision === 'strictly_prohibited'
                  ? 'border-rose-500 bg-rose-950/40 text-rose-200 ring-1 ring-rose-500'
                  : 'border-stone-800 bg-stone-900 text-stone-300 hover:border-stone-700'
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-base">🔴</span>
                <span className="font-bold text-stone-100">Парение ЗАПРЕЩЕНО</span>
              </div>
              <p className="text-[11px] text-stone-400">
                Отказ в процедуре по медицинским показаниям, консультация врача.
              </p>
            </button>
          </div>
        </div>

        {/* Submit & Next Actions */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
          {!hasSubmitted ? (
            <button
              onClick={handleSubmit}
              disabled={!selectedDecision}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md"
            >
              Утвердить вердикт
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-100 text-xs font-bold transition-all cursor-pointer border border-stone-700"
            >
              <span>Следующий гость</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Feedback block */}
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
  );
};
