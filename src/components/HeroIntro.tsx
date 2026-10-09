import React, { useState, useRef } from 'react';
import { ArrowRight, Volume2, VolumeX, Play, Pause } from 'lucide-react';
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

  // Determine current active step title
  const completedCount = progress?.completedLevels?.length || 0;
  const currentStepNum = Math.min(completedCount + 1, 7);
  const currentStepTitle =
    currentStepNum === 1
      ? 'Вход в Банное Дело'
      : currentStepNum === 2
      ? 'Анатомия и Первый Контакт'
      : currentStepNum === 3
      ? 'Симфония Веников'
      : currentStepNum === 4
      ? 'Фитотерапия и Аромамагия'
      : currentStepNum === 5
      ? 'Температурные Контрасты'
      : currentStepNum === 6
      ? 'Безопасность и ЧП'
      : 'Финальная Аттестация';

  return (
    <div className="relative overflow-hidden rounded-3xl border border-stone-800/90 bg-stone-950 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.9)] min-h-[680px] sm:min-h-[760px] lg:min-h-[820px] flex flex-col justify-center">
      {/* 1. Cinematic Background Video — Full Background as originally set */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <video
          ref={videoRef}
          src="/videos/omakhivanie.mp4"
          poster="/images/anton-irkhin.jpg"
          autoPlay
          loop
          muted={isMuted}
          playsInline
          className="w-full h-full object-cover object-center pointer-events-none transition-transform duration-1000"
          style={{ filter: 'brightness(0.74) contrast(1.10) saturate(1.15)' }}
        />

        {/* Scrim Layers: Guarantees 100% Crisp Text Legibility while video is clearly visible */}
        {/* Layer 1: Base translucent veil */}
        <div className="absolute inset-0 bg-[#0a0908]/45" />

        {/* Layer 2: Reading gradient from deep charcoal on left to translucent on right */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0908]/95 via-[#0a0908]/75 sm:via-[#0a0908]/55 to-transparent" />

        {/* Layer 3: Vertical edge vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0908]/85 via-transparent to-[#0a0908]/60" />

        {/* Layer 4: Warm amber sauna lamp directional radial glow */}
        <div
          className="absolute inset-0 pointer-events-none opacity-35 mix-blend-screen"
          style={{
            background:
              'radial-gradient(circle at 85% 30%, rgba(245, 158, 11, 0.45) 0%, rgba(217, 119, 6, 0.2) 40%, transparent 70%)',
          }}
        />
      </div>

      {/* Video Controls Pill in Top Right */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 flex items-center gap-2">
        <button
          onClick={toggleSound}
          title={isMuted ? 'Включить атмосферный звук пара' : 'Выключить звук'}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-900/85 hover:bg-stone-800 text-stone-300 hover:text-amber-400 border border-amber-500/30 backdrop-blur-md text-xs font-mono transition-all cursor-pointer shadow-lg"
        >
          {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5 text-amber-400" />}
          <span className="hidden sm:inline">{isMuted ? 'Звук' : 'Звук парной'}</span>
        </button>

        <button
          onClick={togglePlay}
          title={isPlaying ? 'Пауза видео' : 'Воспроизвести'}
          className="p-1.5 rounded-full bg-stone-900/85 hover:bg-stone-800 text-stone-300 hover:text-amber-400 border border-amber-500/30 backdrop-blur-md transition-all cursor-pointer shadow-lg"
        >
          {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Foreground Hero Content Grid */}
      <div className="relative z-10 p-6 sm:p-10 lg:p-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Headlines & Call-to-Action (7 Cols on desktop) */}
          <div className="lg:col-span-7 space-y-6">

            {/* Main Headline */}
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-stone-100 leading-[1.12] drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
              Пармастер Квест: <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 drop-shadow">
                Путь к Мастерству
              </span>
            </h1>

            {/* Sub-headline */}
            <p className="text-base sm:text-lg text-stone-200/90 leading-relaxed font-sans max-w-xl drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
              Интерактивная программа от первого пара до уверенного мастера.
            </p>

            {/* CTA Button + Adjacent Progress Counter Block */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-4">
              
              {/* Pulsating Glowing Amber CTA Button */}
              <button
                onClick={onStartQuest}
                className="relative group px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-bold text-sm sm:text-base uppercase tracking-wider transition-all duration-300 shadow-[0_0_35px_rgba(245,158,11,0.6)] hover:shadow-[0_0_50px_rgba(245,158,11,0.9)] cursor-pointer active:scale-95 flex items-center justify-center gap-3 border border-amber-300/60"
              >
                {/* Glowing pulsating outer halo ring */}
                <span className="absolute -inset-1 rounded-2xl bg-amber-500/30 blur-md group-hover:bg-amber-400/50 transition-all animate-pulse pointer-events-none" />
                <span className="relative font-bold tracking-wide">
                  {completedCount > 0 ? 'ПРОДОЛЖИТЬ ОБУЧЕНИЕ →' : 'НАЧАТЬ ОБУЧЕНИЕ →'}
                </span>
                <ArrowRight className="h-5 w-5 relative transition-transform group-hover:translate-x-1" />
              </button>

              {/* Adjacent Progress Counter */}
              <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-stone-900/90 border border-stone-800/90 backdrop-blur-md shadow-inner text-xs font-mono text-stone-300">
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
                <span>
                  Шаг {currentStepNum} из 7 · <strong className="text-amber-300 font-semibold">{currentStepTitle}</strong>
                </span>
              </div>
            </div>

          </div>

          {/* Right Column: Professional Profile Portrait Card of Anton Irkhin (5 Cols on desktop) */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="w-full max-w-sm rounded-3xl bg-stone-950/90 sm:bg-gradient-to-b sm:from-stone-900/95 sm:via-stone-950 sm:to-stone-900/95 border border-amber-500/40 p-5 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.85)] backdrop-blur-xl space-y-4 relative overflow-hidden group hover:border-amber-400/60 transition-all">
              
              {/* Warm decorative sauna glow inside card */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Anton Irkhin Header Info */}
              <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                  <img
                    src="/images/anton-irkhin-avatar.jpg"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/images/anton-irkhin.jpg';
                    }}
                    alt="Антон Ирхин"
                    className="h-20 w-20 rounded-2xl object-cover object-top border-2 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.35)] group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500 text-stone-950 text-xs font-bold shadow-md">
                    👑
                  </span>
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-100 leading-tight">
                    Антон Ирхин
                  </h3>
                  <div className="text-xs font-medium text-amber-300 leading-snug">
                    Автор курса · Мастер-наставник
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-mono">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Онлайн на платформе</span>
                  </div>
                </div>
              </div>

              {/* 7 лет в банной практике · 5000+ парений */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <div className="px-3.5 py-2.5 rounded-2xl bg-stone-900/90 border border-stone-800/90 text-center shadow-inner">
                  <div className="font-serif text-amber-300 font-bold text-base sm:text-lg leading-tight">7 лет</div>
                  <div className="text-[10px] text-stone-400 leading-snug mt-0.5">в банной практике</div>
                </div>
                <div className="px-3.5 py-2.5 rounded-2xl bg-stone-900/90 border border-stone-800/90 text-center shadow-inner">
                  <div className="font-serif text-amber-300 font-bold text-base sm:text-lg leading-tight">5000+</div>
                  <div className="text-[10px] text-stone-400 leading-snug mt-0.5">парений</div>
                </div>
              </div>

              {/* Quote */}
              <div className="relative p-3.5 rounded-2xl bg-stone-950/90 border border-stone-800/90">
                <div className="text-amber-500/40 text-3xl font-serif leading-none absolute -top-1 left-2 font-bold">
                  “
                </div>
                <p className="text-xs sm:text-sm font-serif italic text-amber-100/90 leading-relaxed pl-3">
                  «Пар должен быть мягким, целительным и ласковым. Здесь вы научитесь парить так, чтобы гости возвращались к вам снова и снова.»
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
