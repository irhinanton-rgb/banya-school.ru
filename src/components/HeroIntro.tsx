import React from 'react';
import { Sparkles, Award, ArrowRight, ShieldCheck, Flame, Compass } from 'lucide-react';
import { UserProgress, LevelId } from '../types/banya';
import heroImg from '../assets/images/hero_banya_master_1791055049693.jpg';

interface HeroIntroProps {
  progress: UserProgress;
  onStartQuest: () => void;
  onSelectLevel: (levelId: LevelId) => void;
}

export const HeroIntro: React.FC<HeroIntroProps> = ({
  progress,
  onStartQuest,
  onSelectLevel,
}) => {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-stone-800 bg-stone-900/90 shadow-2xl">
      {/* Background Image Scrim */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImg}
          alt="Пармастер в аутентичной парной"
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover object-center opacity-30 mix-blend-luminosity filter brightness-75"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/70 to-transparent" />
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
