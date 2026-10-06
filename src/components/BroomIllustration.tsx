import React, { useState } from 'react';
import { Maximize2, X } from 'lucide-react';

interface BroomIllustrationProps {
  id: string;
  name: string;
  imageUrl?: string;
  spriteCol: number; // 0, 1, 2
  spriteRow: number; // 0, 1
  className?: string;
}

export const BroomIllustration: React.FC<BroomIllustrationProps> = ({
  id,
  name,
  imageUrl,
  spriteCol,
  spriteRow,
  className = ''
}) => {
  const [imageError, setImageError] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Background position for 3 columns x 2 rows
  const posX = spriteCol === 0 ? '1.5%' : spriteCol === 1 ? '50%' : '98.5%';
  const posY = spriteRow === 0 ? '1.5%' : '98.5%';

  // Resolve active image source: direct cropped image or master atlas sheet
  const resolvedImg = imageUrl || `/images/brooms/broom-${id.split('_')[0]}.jpg`;

  return (
    <>
      <div
        className={`relative overflow-hidden rounded-2xl border border-stone-800 bg-[#0d0f11] shadow-inner group cursor-pointer ${className}`}
        style={{ aspectRatio: '16/10' }}
        onClick={() => setShowModal(true)}
      >
        {/* 1. High-resolution direct cropped photograph from uploaded atlas */}
        {!imageError && (
          <img
            src={resolvedImg}
            alt={name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => {
              // If direct file fails, try sprite or fallback
              setImageError(true);
            }}
          />
        )}

        {/* 2. Fallback to CSS sprite from brooms-atlas.jpg if individual image fails */}
        {imageError && (
          <div
            className="absolute inset-0 transition-transform duration-500 group-hover:scale-105"
            style={{
              backgroundImage: 'url(/images/brooms-atlas.jpg), url(/images/brooms-atlas.jpg.jpg)',
              backgroundSize: '302% 202%',
              backgroundPosition: `${posX} ${posY}`,
              backgroundRepeat: 'no-repeat'
            }}
          />
        )}

        {/* Gradient vignette for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent pointer-events-none" />

        {/* Vintage botanical framing border */}
        <div className="absolute inset-1.5 rounded-xl border border-amber-500/20 pointer-events-none group-hover:border-amber-400/40 transition-colors" />

        {/* Plant category badge */}
        <div className="absolute bottom-2.5 left-2.5 z-10 px-2.5 py-1 rounded-lg bg-stone-950/90 border border-stone-800 backdrop-blur-md text-[11px] font-mono text-amber-300 font-medium shadow-md">
          {name.split(' ')[0]}
        </div>

        {/* Zoom trigger indicator */}
        <div className="absolute top-2.5 right-2.5 z-10 p-1.5 rounded-lg bg-stone-950/80 border border-stone-800/80 text-stone-400 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm hover:text-amber-300">
          <Maximize2 className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Lightbox Modal for Full View */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
          onClick={() => setShowModal(false)}
        >
          <div
            className="relative max-w-2xl w-full rounded-2xl bg-stone-900 border border-stone-700 p-4 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div>
                <h4 className="text-base font-serif font-bold text-amber-200">{name}</h4>
                <p className="text-xs text-stone-400 font-mono">Ботаническая иллюстрация из Атласа Веников</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg bg-stone-800 text-stone-400 hover:text-stone-100 hover:bg-stone-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-3 rounded-xl overflow-hidden bg-black flex items-center justify-center border border-stone-800">
              <img
                src={resolvedImg}
                alt={name}
                className="max-h-[65vh] w-auto object-contain rounded-lg shadow-inner"
              />
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-stone-400 font-mono">
              <span>Качественная иллюстрация ручной работы</span>
              <button
                onClick={() => setShowModal(false)}
                className="px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 transition-colors cursor-pointer"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

