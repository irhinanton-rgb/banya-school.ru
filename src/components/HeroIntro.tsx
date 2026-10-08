import React, { useState, useRef } from 'react';
import { ArrowRight, Volume2, VolumeX, Play, Pause, Award, Sparkles } from 'lucide-react';
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
    <div className="relative overflow-hidden rounded-3xl border border-stone-800/90 bg-stone-950 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.9)]">
      {/* 1. Cinematic Background Video */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <video
          ref={videoRef}
          src="/videos/omakhivanie.mp4"
          poster="/images/anton-irkhin.jpg"
          autoPlay
          loop
          muted={isMuted}
          playsInline
          className="w-full h-full object-cover object-center scale-105 pointer-events-none transition-transform duration-1000"
          style={{ filter: 'brightness(0.55) contrast(1.2) saturate(1.15)' }}
        />

        {/* Multi-Layer Scrim for burnt wood / yakisugi atmosphere and 100% text readability */}
        {/* Layer 1: Dark charcoal base veil */}
        <div className="absolute inset-0 bg-[#0a0908]/75" />

        {/* Layer 2: Horizontal reading gradient from deep charcoal to translucent */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0908] via-[#0a0908]/90 to-[#0a0908]/40" />

        {/* Layer 3: Vertical edge vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0908] via-transparent to-[#0a0908]/80" />

        {/* Layer 4: Warm amber sauna lamp directional radial glow */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40 mix-blend-screen"
          style={{
            background:
              'radial-gradient(circle at 85% 30%, rgba(245, 158, 11, 0.5) 0%, rgba(217, 119, 6, 0.25) 40%, transparent 70%)',
          }}
        />

        {/* Layer 5: Subtle burnt wood texture overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.07] mix-blend-overlay"
          style={{
            backgroundImage: `repeating-linear-gradient(0deg, #000 0px, #000 2px, transparent 2px, transparent 6px)`,
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* Left Column: Headlines & Call-to-Action (7 Cols on desktop) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Category Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-mono uppercase tracking-wider backdrop-blur-md shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>Академия Банного Мастерства</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-stone-100 leading-[1.12] drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
              Квест Пармастера: <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 drop-shadow">
                Путь к Мастерству
              </span>
            </h1>

            {/* Sub-headline as specifically requested in prompt */}
            <p className="text-base sm:text-lg text-stone-200/90 leading-relaxed font-sans max-w-xl drop-shadow">
              Интерактивная программа от первого пара до уверенного мастера. Без скучной теории.
            </p>

            {/* CTA Button + Adjacent Progress Counter Block */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-4">
              
              {/* Pulsating Glowing Amber CTA Button */}
              <button
                onClick={onStartQuest}
                className="relative group px-7 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-bold text-sm uppercase tracking-wider transition-all duration-300 shadow-[0_0_30px_rgba(245,158,11,0.55)] hover:shadow-[0_0_45px_rgba(245,158,11,0.85)] cursor-pointer active:scale-95 flex items-center justify-center gap-3 border border-amber-300/60"
              >
                {/* Glowing pulsating outer halo ring */}
                <span className="absolute -inset-1 rounded-2xl bg-amber-500/30 blur-md group-hover:bg-amber-400/50 transition-all animate-pulse pointer-events-none" />
                <span className="relative font-bold text-sm tracking-wide">
                  {completedCount > 0 ? 'ПРОДОЛЖИТЬ КВЕСТ →' : 'НАЧАТЬ ПЕРВЫЙ УРОК →'}
                </span>
                <ArrowRight className="h-4 w-4 relative transition-transform group-hover:translate-x-1" />
              </button>

              {/* Adjacent Progress Counter */}
              <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-stone-900/85 border border-stone-800/90 backdrop-blur-md shadow-inner text-xs font-mono text-stone-300">
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
                <span>
                  Шаг {currentStepNum} из 7 · <strong className="text-amber-300 font-semibold">{currentStepTitle}</strong>
                </span>
              </div>
            </div>

            {/* 4 Feature Pillars (7 Levels, 8 Brooms, 8 Herbs, Certificate) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
              <div className="rounded-xl bg-stone-900/75 border border-stone-800/80 p-3 backdrop-blur-md shadow-sm">
                <div className="text-amber-300 font-serif text-xl sm:text-2xl font-bold">7</div>
                <div className="text-[11px] text-stone-300 mt-0.5">Станций квеста</div>
              </div>
              <div className="rounded-xl bg-stone-900/75 border border-stone-800/80 p-3 backdrop-blur-md shadow-sm">
                <div className="text-amber-300 font-serif text-xl sm:text-2xl font-bold">8</div>
                <div className="text-[11px] text-stone-300 mt-0.5">Техник веника</div>
              </div>
              <div className="rounded-xl bg-stone-900/75 border border-stone-800/80 p-3 backdrop-blur-md shadow-sm">
                <div className="text-amber-300 font-serif text-xl sm:text-2xl font-bold">8</div>
                <div className="text-[11px] text-stone-300 mt-0.5">Целебных трав</div>
              </div>
              <div className="rounded-xl bg-stone-900/75 border border-stone-800/80 p-3 backdrop-blur-md shadow-sm">
                <div className="text-amber-300 font-serif text-xl sm:text-2xl font-bold">👑</div>
                <div className="text-[11px] text-stone-300 mt-0.5">Сертификат</div>
              </div>
            </div>

          </div>

          {/* Right Column: Professional Profile Portrait Card of Anton Irkhin (5 Cols on desktop) */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="w-full max-w-sm rounded-3xl bg-gradient-to-b from-stone-900/90 via-stone-950/95 to-stone-900/90 border border-amber-500/40 p-5 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-xl space-y-4 relative overflow-hidden group hover:border-amber-400/60 transition-colors">
              
              {/* Warm decorative sauna glow inside card */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

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
                <div>
                  <div className="text-[10px] font-mono text-amber-400 uppercase tracking-wider font-semibold">
                    Наставник Академии
                  </div>
                  <h3 className="font-serif text-lg font-bold text-stone-100">
                    Антон Ирхин
                  </h3>
                  <p className="text-xs text-stone-400 font-mono">
                    15 лет банной практики
                  </p>
                </div>
              </div>

              {/* Specific quote from prompt */}
              <div className="relative p-3.5 rounded-2xl bg-stone-950/80 border border-stone-800/90">
                <div className="text-amber-500/40 text-3xl font-serif leading-none absolute -top-1 left-2 font-bold">
                  “
                </div>
                <p className="text-xs sm:text-sm font-serif italic text-amber-100/90 leading-relaxed pl-3">
                  «Пар должен быть мягким, целительным и ласковым. Здесь вы научитесь парить так, чтобы гости возвращались к вам снова и снова.»
                </p>
              </div>

              {/* Status pill */}
              <div className="flex items-center justify-between text-[11px] text-stone-400 pt-1 font-mono">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  Онлайн в Академии
                </span>
                <span className="text-stone-500">1 200+ парений</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
