import React from 'react';
import { X, ArrowRight, Lock } from 'lucide-react';

interface InDevelopmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName: string;
}

export const InDevelopmentModal: React.FC<InDevelopmentModalProps> = ({
  isOpen,
  onClose,
  featureName,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xs sm:max-w-sm rounded-3xl bg-gradient-to-b from-stone-900 via-stone-950 to-stone-900 border border-amber-500/40 p-5 sm:p-6 shadow-[0_10px_40px_rgba(0,0,0,0.8)] text-center space-y-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-full text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors cursor-pointer"
          aria-label="Закрыть"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Small Icon Badge */}
        <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center text-2xl shadow-inner">
          🛠️
        </div>

        {/* Title & Badge */}
        <div className="space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/25">
            Скоро открытие
          </span>
          <h3 className="text-xl font-serif font-bold text-stone-100 pt-1">
            В разработке
          </h3>
          <p className="text-xs font-mono text-amber-300 font-medium">
            {featureName}
          </p>
        </div>

        {/* Description */}
        <p className="text-xs text-stone-300 leading-relaxed">
          Раздел находится в активной разработке. Совсем скоро здесь появится живое общение мастеров, разборы техник и онлайн-эфиры!
        </p>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-bold text-xs transition-all shadow-md cursor-pointer"
        >
          Понятно
        </button>
      </div>
    </div>
  );
};

interface LevelLockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToQuest: () => void;
  featureName: string;
}

export const LevelLockModal: React.FC<LevelLockModalProps> = ({
  isOpen,
  onClose,
  onGoToQuest,
  featureName,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xs sm:max-w-sm rounded-3xl bg-gradient-to-b from-stone-900 via-stone-950 to-stone-900 border border-amber-500/40 p-5 sm:p-6 shadow-[0_10px_40px_rgba(0,0,0,0.8)] text-center space-y-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-full text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors cursor-pointer"
          aria-label="Закрыть"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Small Icon Badge */}
        <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center text-2xl shadow-inner">
          <Lock className="w-6 h-6 text-amber-400" />
        </div>

        {/* Title & Badge */}
        <div className="space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/25">
            3-я станция квеста
          </span>
          <h3 className="text-xl font-serif font-bold text-stone-100 pt-1">
            Доступно с 3-го уровня
          </h3>
          <p className="text-xs font-mono text-amber-300 font-medium">
            {featureName}
          </p>
        </div>

        {/* Description */}
        <p className="text-xs text-stone-300 leading-relaxed">
          Этот раздел открывается на 3-й станции квеста («Банная Фармакопея»). Завершите первые две станции, чтобы разблокировать доступ к справочнику и тренажерам!
        </p>

        {/* Actions */}
        <div className="space-y-2 pt-1">
          <button
            onClick={() => {
              onClose();
              onGoToQuest();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-bold text-xs transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>Перейти к квесту</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="w-full py-2 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 text-xs font-medium transition-colors cursor-pointer"
          >
            Понятно
          </button>
        </div>
      </div>
    </div>
  );
};
