import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { UserProgress, LevelId } from '../types/banya';

interface HeroIntroProps {
  progress: UserProgress;
  onStartQuest: () => void;
  onSelectLevel: (levelId: LevelId) => void;
}

export const HeroIntro: React.FC<HeroIntroProps> = ({
  progress,
  onStartQuest,
}) => {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-stone-800 bg-stone-900/90 shadow-2xl">
      {/* Zero-latency Atmospheric Banya Artwork & Scrim */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <svg
          viewBox="0 0 1200 600"
          preserveAspectRatio="xMidYMid slice"
          className="h-full w-full object-cover opacity-35"
          aria-hidden="true"
        >
          <defs>
            <radialGradient id="hearthGlow" cx="78%" cy="62%" r="52%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.55" />
              <stop offset="45%" stopColor="#b45309" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#0c0a09" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="woodPlank" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1c1917" />
              <stop offset="50%" stopColor="#292524" />
              <stop offset="100%" stopColor="#0c0a09" />
            </linearGradient>
            <linearGradient id="steamWave" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#fde68a" stopOpacity="0.04" />
              <stop offset="50%" stopColor="#fbbf24" stopOpacity="0.16" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          <rect width="1200" height="600" fill="url(#woodPlank)" />
          {/* Wooden cedar wall lines */}
          <g stroke="#44403c" strokeWidth="1" opacity="0.35">
            <line x1="0" y1="90" x2="1200" y2="90" />
            <line x1="0" y1="180" x2="1200" y2="180" />
            <line x1="0" y1="270" x2="1200" y2="270" />
            <line x1="0" y1="360" x2="1200" y2="360" />
            <line x1="0" y1="450" x2="1200" y2="450" />
          </g>
          {/* Hearth & stove warm glow */}
          <circle cx="940" cy="370" r="340" fill="url(#hearthGlow)" />
          {/* Rising steam ribbons */}
          <path
            d="M650,560 C720,430 610,320 740,190 C830,100 760,30 840,-20 L1020,-20 C940,60 1010,160 900,260 C790,360 890,460 810,580 Z"
            fill="url(#steamWave)"
          />
          <path
            d="M840,580 C910,450 820,330 940,210 C1020,130 960,50 1040,-10 L1160,-10 C1090,70 1140,170 1050,270 C950,370 1030,470 960,590 Z"
            fill="url(#steamWave)"
          />
          {/* Stylized Oak Leaf & Broom Silhouette */}
          <g transform="translate(860, 220)" opacity="0.28" stroke="#fbbf24" strokeWidth="2" fill="none">
            <path d="M80,260 L120,120 M100,260 L120,120 M140,260 L120,120" strokeWidth="4" />
            <ellipse cx="120" cy="95" rx="75" ry="90" fill="#78350f" fillOpacity="0.35" />
            <circle cx="95" cy="70" r="24" />
            <circle cx="145" cy="75" r="26" />
            <circle cx="120" cy="45" r="28" />
          </g>
        </svg>
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/75 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/65 to-transparent" />
      </div>

      <div className="relative z-10 p-6 sm:p-10 lg:p-12 space-y-8 max-w-4xl">
        {/* Intro Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono uppercase tracking-wider">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Геймифицированная Академия Банного Мастерства</span>
        </div>

        {/* Hero Title & Prologue */}
        <div className="space-y-4">
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-stone-100 leading-[1.1]">
            Квест Пармастера: <br />
            <span className="text-amber-400">Путь к Мастерству</span>
          </h1>

          <p className="text-sm sm:text-base text-stone-300 leading-relaxed max-w-2xl">
            Вы — авантюрист, стремящийся стать легендарным пармейстером. Ваш путь пройдёт через древние традиции бани, где вы научитесь искусству первого пара, венечного массажа, фито- и ароматерапии, а также освоите физиологию пара и секреты безопасности.
          </p>
        </div>

        {/* Core Stats / Feature Pillars */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="rounded-xl bg-stone-950/70 border border-stone-800 p-3.5">
            <div className="text-amber-400 font-serif text-2xl font-bold">7</div>
            <div className="text-[11px] text-stone-400 mt-0.5">Квестовых уровней</div>
          </div>
          <div className="rounded-xl bg-stone-950/70 border border-stone-800 p-3.5">
            <div className="text-amber-400 font-serif text-2xl font-bold">8</div>
            <div className="text-[11px] text-stone-400 mt-0.5">Техник веника</div>
          </div>
          <div className="rounded-xl bg-stone-950/70 border border-stone-800 p-3.5">
            <div className="text-amber-400 font-serif text-2xl font-bold">8</div>
            <div className="text-[11px] text-stone-400 mt-0.5">Целебных трав</div>
          </div>
          <div className="rounded-xl bg-stone-950/70 border border-stone-800 p-3.5">
            <div className="text-amber-400 font-serif text-2xl font-bold">👑</div>
            <div className="text-[11px] text-stone-400 mt-0.5">Именной Сертификат</div>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-wrap items-center gap-4 pt-2">
          <button
            onClick={onStartQuest}
            className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all shadow-xl hover:shadow-amber-500/20 cursor-pointer transform hover:-translate-y-0.5"
          >
            <span>{progress.completedLevels.length > 0 ? 'Продолжить квест' : 'Начать обучение'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-2 text-xs text-stone-400 font-mono">
            <span>Прогресс:</span>
            <span className="text-amber-300 font-bold">
              {progress.completedLevels.length} / 7 уровней
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
