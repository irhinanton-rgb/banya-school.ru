import React, { useState } from 'react';
import { EMERGENCY_EVENTS } from '../../data/courseData';
import { RandomEmergencyEvent } from '../../types/banya';
import { playSuccessChime } from '../../utils/audio';
import { AlertOctagon, X, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';

interface EmergencyEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  soundEnabled: boolean;
  onGrantXp?: (amount: number) => void;
}

export const EmergencyEventModal: React.FC<EmergencyEventModalProps> = ({
  isOpen,
  onClose,
  soundEnabled,
  onGrantXp,
}) => {
  const [selectedEventIdx, setSelectedEventIdx] = useState<number>(0);
  const [selectedOptionIdx, setSelectedOptionIdx] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentEvent: RandomEmergencyEvent = EMERGENCY_EVENTS[selectedEventIdx];

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedOptionIdx(idx);
    setIsAnswered(true);

    if (currentEvent.options[idx].isCorrect) {
      playSuccessChime(soundEnabled);
      if (onGrantXp) onGrantXp(40);
    }
  };

  const handleNextEvent = () => {
    setSelectedOptionIdx(null);
    setIsAnswered(false);
    setSelectedEventIdx((prev) => (prev + 1) % EMERGENCY_EVENTS.length);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl border border-stone-800 bg-stone-900 p-6 sm:p-7 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-stone-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <AlertOctagon className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-rose-400">
                Случайное событие · Практический тренажер
              </div>
              <h3 className="font-serif text-xl font-bold text-stone-100">
                ЧП в Парной: Ситуационный Разбор
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

        {/* Situation prompt */}
        <div className="rounded-xl border border-rose-500/20 bg-rose-950/20 p-4 space-y-2">
          <h4 className="font-bold text-sm text-rose-300">{currentEvent.title}</h4>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
            {currentEvent.situation}
          </p>
        </div>

        {/* Action Options */}
        <div className="space-y-3">
          <div className="text-xs font-semibold text-stone-300">
            Ваши действия как пармастера:
          </div>
          {currentEvent.options.map((opt, idx) => {
            const isChosen = selectedOptionIdx === idx;
            let btnStyle = 'border-stone-800 bg-stone-950 hover:border-stone-700 text-stone-300';
            if (isAnswered) {
              if (opt.isCorrect) {
                btnStyle = 'border-emerald-500 bg-emerald-950/50 text-emerald-200 ring-1 ring-emerald-500';
              } else if (isChosen && !opt.isCorrect) {
                btnStyle = 'border-rose-500 bg-rose-950/50 text-rose-200 ring-1 ring-rose-500';
              } else {
                btnStyle = 'border-stone-800 bg-stone-950/40 text-stone-500 opacity-60';
              }
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelectOption(idx)}
                disabled={isAnswered}
                className={`w-full p-4 rounded-xl border text-left text-xs sm:text-sm leading-relaxed transition-all cursor-pointer ${btnStyle}`}
              >
                <div className="flex items-start gap-3">
                  <span className="font-mono text-xs opacity-60 mt-0.5">{idx + 1}.</span>
                  <div className="space-y-2 flex-1">
                    <p>{opt.text}</p>
                    {isAnswered && isChosen && (
                      <div className="text-xs font-mono pt-1 text-stone-300 border-t border-stone-800">
                        {opt.feedback}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Safety Rule Footer & Switch */}
        {isAnswered && (
          <div className="rounded-xl bg-stone-950 border border-stone-800 p-4 space-y-2 animate-fadeIn">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
              <ShieldCheck className="h-4 w-4" />
              <span>Главное правило безопасности парной:</span>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed">{currentEvent.safetyRule}</p>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-stone-500 font-mono">
            Ситуация {selectedEventIdx + 1} из {EMERGENCY_EVENTS.length}
          </div>

          <div className="flex items-center gap-3">
            {isAnswered && (
              <button
                onClick={handleNextEvent}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                Следующее ЧП
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-medium transition-colors"
            >
              Закрыть
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
