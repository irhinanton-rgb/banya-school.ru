import React, { useState } from 'react';

interface TermTooltipProps {
  title: string;
  text: string;
  children: React.ReactNode;
}

export const TermTooltip: React.FC<TermTooltipProps> = ({ title, text, children }) => {
  const [open, setOpen] = useState(false);

  return (
    <span
      className="relative inline-block"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
        className="inline items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-300 font-semibold border-b-2 border-dashed border-amber-400 hover:bg-amber-500/25 transition-colors cursor-help"
      >
        {children}
      </button>
      {open && (
        <span className="fixed sm:absolute z-50 left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 bottom-6 sm:bottom-full sm:mb-2.5 w-auto sm:w-80 p-3.5 rounded-2xl bg-stone-950/98 border-2 border-amber-400/80 shadow-[0_10px_40px_rgba(0,0,0,0.85)] text-left pointer-events-auto animate-fadeIn">
          <span className="block text-xs font-mono uppercase tracking-wider text-amber-400 font-bold mb-1">
            🔬 {title}
          </span>
          <span className="block text-xs text-stone-200 leading-relaxed font-normal">
            {text}
          </span>
        </span>
      )}
    </span>
  );
};
