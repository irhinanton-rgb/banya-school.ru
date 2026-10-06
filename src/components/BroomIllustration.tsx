import React, { useState } from 'react';

interface BroomIllustrationProps {
  id: string;
  name: string;
  spriteCol: number; // 0, 1, 2
  spriteRow: number; // 0, 1
  className?: string;
}

export const BroomIllustration: React.FC<BroomIllustrationProps> = ({
  id,
  name,
  spriteCol,
  spriteRow,
  className = ''
}) => {
  const [imageError, setImageError] = useState(false);

  // Background position for 3 columns x 2 rows
  // Col 0: 0%, Col 1: 50%, Col 2: 100%
  // Row 0: 0%, Row 1: 100%
  const posX = spriteCol === 0 ? '1.5%' : spriteCol === 1 ? '50%' : '98.5%';
  const posY = spriteRow === 0 ? '1.5%' : '98.5%';

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-stone-800 bg-[#0d0f11] shadow-inner group ${className}`}
      style={{ aspectRatio: '16/10' }}
    >
      {/* 1. Primary: Sliced panel from the uploaded high-res 6-broom botanical atlas sheet */}
      {!imageError && (
        <div
          className="absolute inset-0 transition-transform duration-500 group-hover:scale-105"
          style={{
            backgroundImage: 'url(/images/brooms-atlas.jpg), url(/images/brooms-atlas.png)',
            backgroundSize: '302% 202%',
            backgroundPosition: `${posX} ${posY}`,
            backgroundRepeat: 'no-repeat'
          }}
        />
      )}

      {/* 2. Fallback Botanical Artwork if image is not yet loaded */}
      {imageError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-gradient-to-br from-stone-900 to-stone-950 text-center">
          <div className="text-4xl mb-1 filter drop-shadow">
            {id === 'oak_classic' && '🪵'}
            {id === 'birch_may' && '🌿'}
            {id === 'fir_siberian' && '🌲'}
            {id === 'linden_flowering' && '🌸'}
            {id === 'juniper' && '🫐'}
            {id === 'eucalyptus_silver' && '🍃'}
          </div>
          <span className="text-xs font-serif text-amber-200 font-bold">{name}</span>
          <span className="text-[10px] text-stone-400 font-mono">Ботанический атлас</span>
        </div>
      )}

      {/* Elegant thin framing border like in vintage botanical plate */}
      <div className="absolute inset-1.5 rounded-xl border border-amber-500/15 pointer-events-none" />

      {/* Subdued corner badge */}
      <div className="absolute bottom-2 left-2 z-10 px-2 py-0.5 rounded-md bg-stone-950/80 border border-stone-800/80 backdrop-blur-sm text-[10px] font-mono text-amber-300/90 font-medium">
        {name.split(' ')[0]}
      </div>
    </div>
  );
};
