import React, { useState, useRef } from 'react';
import { Sparkles, ArrowRight, Volume2, VolumeX, Play, Pause } from 'lucide-react';
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const toggleSound = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-stone-800 bg-stone-950 shadow-2xl">
      {/* Background Video with Multi-Layer Scrim for Perfect Readability */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <video
          ref={videoRef}
          poster="/images/hero-poster.jpg"
          autoPlay
          loop
          muted={isMuted}
          playsInline
          className="w-full h-full object-cover object-center scale-105 pointer-events-none transition-transform duration-1000"
          style={{ filter: 'brightness(0.6) contrast(1.15) saturate(1.1)' }}
        >
          <source src="/videos/hero-bg.mp4" type="video/mp4" />
          <source src="/videos/video5343800714864926871.mp4" type="video/mp4" />
        </video>

        {/* Scrim Layers: Guarantees 100% Crisp Text Legibility */}
        {/* Layer 1: Dark base veil */}
        <div className="absolute inset-0 bg-stone-950/70" />

        {/* Layer 2: Horizontal reading gradient (heavy left side, translucent right) */}
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/85 to-stone-950/40" />

        {/* Layer 3: Vertical framing gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-stone-950/70" />

        {/* Layer 4: Warm amber hearth glow */}
        <div
          className="absolute inset-0 pointer-events-none opacity-30 mix-blend-screen"
          style={{
            background: 'radial-gradient(circle at 80% 40%, rgba(245, 158, 11, 0.4) 0%, rgba(180, 83, 9, 0.15) 45%, transparent 70%)'
          }}
        />
      </div>

      {/* Video Controls Pill */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 flex items-center gap-2">
        <button
          onClick={toggleSound}
          title={isMuted ? 'Включить звук парной' : 'Выключить звук'}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-900/80 hover:bg-stone-800 text-stone-300 hover:text-amber-400 border border-stone-700/60 backdrop-blur-md text-xs font-mono transition-all cursor-pointer shadow-lg"
        >
          {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5 text-amber-400" />}
          <span className="hidden sm:inline">{isMuted ? 'Звук' : 'Звук парной'}</span>
        </button>

        <button
          onClick={togglePlay}
          title={isPlaying ? 'Пауза видео' : 'Воспроизвести'}
          className="p-1.5 rounded-full bg-stone-900/80 hover:bg-stone-800 text-stone-300 hover:text-amber-400 border border-stone-700/60 backdrop-blur-md transition-all cursor-pointer shadow-lg"
        >
          {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Foreground Content */}
      <div className="relative z-10 p-6 sm:p-10 lg:p-12 space-y-8 max-w-4xl">
        {/* Intro Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/35 text-amber-300 text-xs font-mono uppercase tracking-wider backdrop-blur-md shadow-sm">
          <Sparkles className="h-3.5 w-3.5 text-amber-400" />
          <span>Геймифицированная Академия Банного Мастерства</span>
        </div>

        {/* Hero Title & Prologue */}
        <div className="space-y-4">
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1] drop-shadow-md">
            Квест Пармастера: <br />
            <span className="text-amber-400 drop-shadow">Путь к Мастерству</span>
          </h1>

          <p className="text-sm sm:text-base text-stone-200 leading-relaxed max-w-2xl font-normal drop-shadow">
            Полноценная авторская программа обучения искусству парения от первого пара до виртуозного владения парой веников, фитотерапии и безопасности в парной.
          </p>

          {/* Master Founder Trust Card */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3.5 p-3.5 sm:p-4 rounded-2xl bg-stone-950/85 border border-amber-500/30 shadow-xl backdrop-blur-md max-w-2xl">
            <div className="relative shrink-0">
              <img
                src="/images/anton-irkhin-avatar.jpg"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/images/anton-irkhin.jpg';
                }}
                alt="Антон Ирхин"
                className="h-14 w-14 rounded-2xl object-cover object-top border-2 border-amber-500 shadow-md ring-2 ring-amber-500/20"
              />
              <span className="absolute -bottom-1 -right-1 text-xs">👑</span>
            </div>
            <div className="space-y-0.5">
              <div className="text-[10px] font-mono text-amber-400 uppercase tracking-wider font-semibold">
                Автор курса & Главный Наставник
              </div>
              <div className="text-sm font-bold text-stone-100 flex items-center gap-2">
                <span>Антон Ирхин</span>
                <span className="text-xs text-stone-400 font-normal">· 15 лет банной практики</span>
              </div>
              <p className="text-xs text-stone-300 leading-snug">
                «Пар должен быть мягким, целительным и ласковым. Здесь вы научитесь парить так, чтобы гости возвращались к вам снова и снова.»
              </p>
            </div>
          </div>
        </div>

        {/* Core Stats / Feature Pillars */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="rounded-xl bg-stone-950/80 border border-stone-800/90 p-3.5 backdrop-blur-md shadow-md">
            <div className="text-amber-400 font-serif text-2xl font-bold">7</div>
            <div className="text-[11px] text-stone-300 mt-0.5">Квестовых уровней</div>
          </div>
          <div className="rounded-xl bg-stone-950/80 border border-stone-800/90 p-3.5 backdrop-blur-md shadow-md">
            <div className="text-amber-400 font-serif text-2xl font-bold">8</div>
            <div className="text-[11px] text-stone-300 mt-0.5">Техник веника</div>
          </div>
          <div className="rounded-xl bg-stone-950/80 border border-stone-800/90 p-3.5 backdrop-blur-md shadow-md">
            <div className="text-amber-400 font-serif text-2xl font-bold">8</div>
            <div className="text-[11px] text-stone-300 mt-0.5">Целебных трав</div>
          </div>
          <div className="rounded-xl bg-stone-950/80 border border-stone-800/90 p-3.5 backdrop-blur-md shadow-md">
            <div className="text-amber-400 font-serif text-2xl font-bold">👑</div>
            <div className="text-[11px] text-stone-300 mt-0.5">Именной Сертификат</div>
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

          <div className="flex items-center gap-2 text-xs text-stone-300 font-mono bg-stone-950/60 px-3 py-2 rounded-lg border border-stone-800 backdrop-blur-sm">
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
