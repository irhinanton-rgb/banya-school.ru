import React, { useState } from 'react';
import { Maximize2, X, Sparkles, BookOpen } from 'lucide-react';

interface HerbIllustrationProps {
  id: string;
  name: string;
  botanicalName?: string;
  categoryTitle?: string;
  imageUrl?: string;
  className?: string;
  onOpenDetails?: () => void;
}

export const HerbIllustration: React.FC<HerbIllustrationProps> = ({
  id,
  name,
  botanicalName,
  categoryTitle,
  imageUrl,
  className = '',
  onOpenDetails,
}) => {
  const [imageError, setImageError] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Resolve image source: custom URL, sliced herb JPG, or fallback to PNG
  const resolvedImg = imageUrl || `/images/herbs/herb-${id}.jpg`;
  const fallbackPng = `/images/herbs/herb-${id}.png`;

  const shortName = name.split(' ')[0];

  return (
    <>
      <div
        className={`relative overflow-hidden rounded-2xl border border-stone-800 bg-[#0d0f11] shadow-inner group cursor-pointer ${className}`}
        style={{ aspectRatio: '16/10' }}
        onClick={(e) => {
          e.stopPropagation();
          setShowModal(true);
        }}
        title={`Нажмите для увеличения ботанической иллюстрации: ${name}`}
      >
        {/* 1. High-resolution direct sliced artwork from uploaded Phytotheque atlas */}
        {!imageError && (
          <img
            src={resolvedImg}
            alt={name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => {
              if (resolvedImg !== fallbackPng) {
                // Try fallback PNG
                const target = document.querySelector(`img[alt="${name}"]`) as HTMLImageElement;
                if (target) target.src = fallbackPng;
                else setImageError(true);
              } else {
                setImageError(true);
              }
            }}
          />
        )}

        {/* 2. Fallback if image file is not found */}
        {imageError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-gradient-to-br from-stone-900 to-stone-950 text-center">
            <span className="text-3xl mb-1">🌿</span>
            <span className="text-xs font-serif text-amber-200 font-bold">{name}</span>
            <span className="text-[10px] text-stone-400 font-mono">Ботаническая иллюстрация</span>
          </div>
        )}

        {/* Gradient vignette for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-transparent to-stone-950/20 pointer-events-none" />

        {/* Vintage botanical framing border */}
        <div className="absolute inset-1.5 rounded-xl border border-amber-500/20 pointer-events-none group-hover:border-amber-400/40 transition-colors" />

        {/* Plant category badge */}
        <div className="absolute bottom-2.5 left-2.5 z-10 px-2.5 py-1 rounded-lg bg-stone-950/90 border border-stone-800 backdrop-blur-md text-[11px] font-mono text-amber-300 font-medium shadow-md flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          <span>{shortName}</span>
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
            className="relative max-w-2xl w-full rounded-2xl bg-stone-900 border border-stone-700 p-5 shadow-2xl overflow-hidden animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono">
                    {categoryTitle || 'Фитотека'}
                  </span>
                  <span className="text-xs text-stone-400 font-mono">Ботаническая иллюстрация</span>
                </div>
                <h4 className="text-lg font-serif font-bold text-amber-100 mt-1">{name}</h4>
                {botanicalName && (
                  <p className="text-xs text-stone-400 font-mono italic">{botanicalName}</p>
                )}
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-xl bg-stone-800 text-stone-400 hover:text-stone-100 hover:bg-stone-700 transition-colors cursor-pointer"
                aria-label="Закрыть"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* High-Resolution Artwork View */}
            <div className="mt-4 rounded-xl overflow-hidden bg-black flex items-center justify-center border border-stone-800 p-2 shadow-inner">
              <img
                src={resolvedImg}
                alt={name}
                className="max-h-[60vh] w-auto object-contain rounded-lg shadow-2xl"
              />
            </div>

            {/* Footer with actions */}
            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-400 font-mono border-t border-stone-800/80 pt-3">
              <div className="flex items-center gap-2 text-stone-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Иллюстрация из генерального атласа Фитотеки</span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {onOpenDetails && (
                  <button
                    onClick={() => {
                      setShowModal(false);
                      onOpenDetails();
                    }}
                    className="flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Свойства и заваривание</span>
                  </button>
                )}
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 transition-colors cursor-pointer"
                >
                  Закрыть
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
