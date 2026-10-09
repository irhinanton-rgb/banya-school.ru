import React from 'react';
import { X, Sparkles, Download, Maximize2 } from 'lucide-react';

interface FitotekaMasterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FitotekaMasterModal: React.FC<FitotekaMasterModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative max-w-5xl w-full max-h-[95vh] rounded-3xl bg-stone-900 border border-stone-700 shadow-2xl flex flex-col overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-stone-800 bg-stone-950/70">
          <div className="flex items-center gap-3">
            <span className="text-2xl p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              🌿
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                  Полный сводный атлас
                </span>
                <span className="text-xs text-stone-400 font-mono">22 целебных растения</span>
              </div>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-100 mt-0.5">
                Генеральная Фитотека Банных Трав & Веников
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/images/fitoteka.png"
              download="fitoteka-atlas.png"
              className="p-2 rounded-xl bg-stone-800 text-stone-300 hover:text-amber-300 hover:bg-stone-700 transition-colors hidden sm:flex items-center gap-1.5 text-xs font-mono"
              title="Скачать атлас в полном разрешении"
            >
              <Download className="w-4 h-4" />
              <span>Скачать</span>
            </a>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-stone-800 text-stone-400 hover:text-stone-100 hover:bg-stone-700 transition-colors cursor-pointer"
              aria-label="Закрыть"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Master Image Viewport */}
        <div className="flex-1 overflow-auto bg-black p-3 sm:p-6 flex items-center justify-center">
          <div className="relative rounded-2xl overflow-hidden border border-stone-800 shadow-2xl">
            <img
              src="/images/fitoteka.png"
              alt="Генеральный Атлас Фитотеки"
              className="max-h-[75vh] w-auto object-contain rounded-xl"
            />
          </div>
        </div>

        {/* Footer info */}
        <div className="p-3 sm:p-4 border-t border-stone-800 bg-stone-950/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-400 font-mono">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>22 ботанические иллюстрации: луговые травы, таёжная хвоя, эвкалипт и банные веники</span>
          </div>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold transition-colors cursor-pointer shadow-md"
          >
            Закрыть просмотр
          </button>
        </div>
      </div>
    </div>
  );
};
