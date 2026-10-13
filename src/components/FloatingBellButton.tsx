import React, { useState } from 'react';
import { Bell } from 'lucide-react';

interface FloatingBellButtonProps {
  onClick: () => void;
  hasUnread?: boolean;
}

export const FloatingBellButton: React.FC<FloatingBellButtonProps> = ({
  onClick,
  hasUnread,
}) => {
  const [showOwlPopup, setShowOwlPopup] = useState(false);

  const handleClick = () => {
    // Show animated pop-up owl
    setShowOwlPopup(true);
    setTimeout(() => {
      setShowOwlPopup(false);
      onClick();
    }, 450);
  };

  return (
    <div className="fixed bottom-20 md:bottom-8 right-3.5 sm:right-6 z-40 group pointer-events-auto">
      {/* Pop-up animated Owl PQ avatar on click */}
      {showOwlPopup && (
        <div className="absolute bottom-14 right-1/2 translate-x-1/2 flex flex-col items-center animate-bounce z-50 pointer-events-none">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-amber-500/20 backdrop-blur-md p-1.5 border-2 border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.8)] flex items-center justify-center scale-110 transition-all">
            <img
              src="/images/PQ.png"
              alt="Сова PQ"
              className="w-full h-full object-contain filter drop-shadow-[0_4px_12px_rgba(245,158,11,0.9)]"
            />
          </div>
          <span className="mt-1 text-[11px] font-mono font-bold bg-stone-950/90 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/50 shadow-lg whitespace-nowrap">
            Ух! Сова спешит на помощь 🦉
          </span>
        </div>
      )}

      {/* Floating Button (Compact, without text, pulsating gold glow) */}
      <button
        onClick={handleClick}
        aria-label="Помощник Сова PQ и колокольчик"
        title="Помощник Сова PQ (вопросы, баги, отзывы)"
        className="relative flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-500 text-stone-950 shadow-[0_4px_25px_rgba(245,158,11,0.55)] hover:shadow-[0_4px_35px_rgba(245,158,11,0.85)] hover:scale-110 active:scale-95 transition-all duration-300 border border-amber-300/60 cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-stone-950"
      >
        {/* Subtle breathing outer ring */}
        <span className="absolute -inset-1 rounded-full bg-amber-400/30 blur-sm group-hover:bg-amber-400/60 animate-pulse pointer-events-none" />

        {/* Crisp Bell Icon */}
        <Bell className="relative w-5 h-5 sm:w-5.5 sm:h-5.5 fill-stone-950 text-stone-950 group-hover:rotate-12 transition-transform duration-200" />

        {/* Small live notification indicator badge */}
        <span className="absolute top-0 right-0 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border border-stone-950" />
        </span>
      </button>

      {/* Hover tooltip for clarity on desktop */}
      <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 hidden lg:group-hover:flex items-center gap-2 pointer-events-none transition-opacity duration-200 opacity-0 group-hover:opacity-100 whitespace-nowrap bg-stone-900/95 border border-amber-500/30 text-amber-200 text-xs px-3 py-1.5 rounded-xl shadow-xl backdrop-blur-md font-medium">
        <img
          src="/images/PQ.png"
          alt="PQ"
          className="w-4 h-4 object-contain"
        />
        <span>Помощник PQ</span>
      </div>
    </div>
  );
};
