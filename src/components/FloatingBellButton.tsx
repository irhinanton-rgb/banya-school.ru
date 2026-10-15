import React from 'react';
import { Bell } from 'lucide-react';

interface FloatingBellButtonProps {
  onClick: () => void;
  hasUnread?: boolean;
}

export const FloatingBellButton: React.FC<FloatingBellButtonProps> = ({
  onClick,
  hasUnread,
}) => {
  return (
    /* Only rendered on desktop/tablet (hidden on mobile, where the bell is in the bottom bar) */
    <div className="hidden md:block fixed bottom-8 right-6 z-40 group pointer-events-auto">
      {/* Floating Button (Pulsating gold glow) */}
      <button
        onClick={onClick}
        aria-label="Помощник Сова PQ"
        title="Помощник Сова PQ"
        className="relative flex h-13 w-13 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-500 text-stone-950 shadow-[0_4px_25px_rgba(245,158,11,0.55)] hover:shadow-[0_4px_35px_rgba(245,158,11,0.85)] hover:scale-110 active:scale-95 transition-all duration-300 border border-amber-300/60 cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-stone-950"
      >
        {/* Subtle breathing outer ring */}
        <span className="absolute -inset-1 rounded-full bg-amber-400/30 blur-sm group-hover:bg-amber-400/60 animate-pulse pointer-events-none" />

        {/* Crisp Bell Icon */}
        <Bell className="relative w-6 h-6 fill-stone-950 text-stone-950 group-hover:rotate-12 transition-transform duration-200" />

        {/* Small live notification indicator badge */}
        <span className="absolute top-0 right-0 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-stone-950" />
        </span>
      </button>

      {/* Hover pop-up on PC: transparent owl without background standing above button + tooltip that it is the assistant */}
      <div className="absolute right-0 bottom-full mb-3 hidden md:group-hover:flex flex-col items-center pointer-events-none transition-all duration-300 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 z-50">
        {/* Owl illustration without background (floating with drop-shadow) */}
        <div className="relative animate-bounce">
          <img
            src="/images/PQ.png"
            alt="Сова Помощник"
            className="w-20 h-20 object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] filter drop-shadow-[0_0_12px_rgba(245,158,11,0.4)]"
          />
        </div>

        {/* Tooltip badge */}
        <div className="mt-1 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-950/95 border border-amber-500/50 shadow-2xl backdrop-blur-md whitespace-nowrap">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-serif font-bold text-amber-200 tracking-wide">
            Помощник Сова PQ
          </span>
          <span className="text-[10px] text-stone-400 font-mono">· Онлайн</span>
        </div>
      </div>
    </div>
  );
};
