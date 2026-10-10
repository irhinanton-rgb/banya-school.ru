import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Sparkles, Award, Flame, MapPin } from 'lucide-react';
import { UserProgress } from '../types/banya';

interface HeroIntroProps {
  progress: UserProgress;
  onStartQuest: () => void;
  onSelectLevel: (levelId: any) => void;
}

export const HeroIntro: React.FC<HeroIntroProps> = ({
  progress,
  onStartQuest,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        setIsPlaying(false);
      });
    }
  }, []);

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
    const newMuted = !isMuted;
    videoRef.current.muted = newMuted;
    setIsMuted(newMuted);
  };

  const completedCount = progress.completedLevels ? progress.completedLevels.length : 0;
  const currentStepNum = progress.activeLevelId || 1;
  const currentStepTitle =
    currentStepNum === 1
      ? 'Вход в Банное Дело'
      : currentStepNum === 2
      ? 'Анатомия Пара и Веники'
      : currentStepNum === 3
      ? 'Банная Фармакопея'
      : currentStepNum === 4
      ? 'Диагностика и Безопасность'
      : currentStepNum === 5
      ? 'Сервис и Ритуалы'
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
        <div className="absolute inset-0 bg-[#0a0908]/45" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0908]/95 via-[#0a0908]/75 sm:via-[#0a0908]/55 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0908]/85 via-transparent to-[#0a0908]/60" />
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
                className="relative group px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-bold text-sm sm:text-base uppercase tracking-wider transition-all duration-300 shadow-[0_0_35px_rgba(245,158,11,0.6)] hover:shadow-[0_0_50px_rgba(245,158,11,0.9)] cursor-pointer active:scale-95 flex items-center justify-center text-center border border-amber-300/60"
              >
                {/* Glowing pulsating outer halo ring */}
                <span className="absolute -inset-1 rounded-2xl bg-amber-500/30 blur-md group-hover:bg-amber-400/50 transition-all animate-pulse pointer-events-none" />
                
                <span className="relative font-bold tracking-wide text-center">
                  {completedCount > 0 ? 'ПРОДОЛЖИТЬ ОБУЧЕНИЕ' : 'НАЧАТЬ ОБУЧЕНИЕ'}
                </span>
              </button>

              {/* Adjacent Progress Counter */}
              <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-stone-900/90 border border-stone-800/90 backdrop-blur-md shadow-inner text-xs font-mono text-stone-300">
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
                <span>
                  Шаг {currentStepNum} из 7 · <strong className="text-amber-300 font-semibold">{currentStepTitle}</strong>
                </span>
              </div>
            </div>

            {/* Micro Trust Indicators */}
            <div className="pt-2 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-stone-300/80 font-mono">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>7 интерактивных станций</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>Именной сертификат мастера</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>Симуляторы и тесты</span>
              </span>
            </div>
          </div>

          {/* Right Column: Founder & Author Stamp (Anton Irkhin) */}
          <div className="lg:col-span-5 flex flex-col items-center lg:items-end justify-center">
            <div className="w-full max-w-sm rounded-3xl bg-stone-900/90 border border-amber-500/30 p-5 backdrop-blur-md shadow-2xl space-y-4">
              
              {/* Header Info */}
              <div className="flex items-center gap-3.5">
                <img
                  src="/images/anton-irkhin-avatar.jpg"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    if (!target.src.includes('anton-irkhin.jpg')) {
                      target.src = '/images/anton-irkhin.jpg';
                    }
                  }}
                  alt="Антон Ирхин"
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-500/50 shadow-md shrink-0"
                />
                <div>
                  <div className="text-stone-100 font-serif font-bold text-base leading-tight">
                    Антон Ирхин
                  </div>
                  <div className="text-amber-400 text-xs font-mono mt-0.5 font-medium">
                    Автор пармастер квест и наставник
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-stone-400 font-mono mt-0.5">
                    <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                    <span>г. Ростов-на-Дону</span>
                  </div>
                </div>
              </div>

              {/* 7 лет опыта · 5000+ парений */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <div className="px-3.5 py-2.5 rounded-2xl bg-stone-950/80 border border-stone-800/90 text-center shadow-inner">
                  <div className="font-serif text-amber-300 font-bold text-base sm:text-lg leading-tight">
                    7 лет
                  </div>
                  <div className="text-[10px] text-stone-400 leading-snug mt-0.5">
                    опыта в банной практике
                  </div>
                </div>
                <div className="px-3.5 py-2.5 rounded-2xl bg-stone-950/80 border border-stone-800/90 text-center shadow-inner">
                  <div className="font-serif text-amber-300 font-bold text-base sm:text-lg leading-tight">
                    5000+
                  </div>
                  <div className="text-[10px] text-stone-400 leading-snug mt-0.5">
                    парений
                  </div>
                </div>
              </div>

              {/* Both Quotes as requested */}
              <div className="space-y-2.5 border-t border-stone-800/80 pt-3">
                <div className="p-3 rounded-xl bg-stone-950/70 border border-stone-800/80 text-xs text-stone-300 leading-relaxed italic">
                  «Наша миссия — передать чистое ремесло пара: без суеты, с глубоким уважением к физиологии и банным традициям.»
                </div>
                <div className="p-3 rounded-xl bg-stone-950/70 border border-stone-800/80 text-xs text-amber-100/90 leading-relaxed italic">
                  «Пар должен быть мягким, целительным и ласковым. Здесь вы научитесь парить так, чтобы гости возвращались к вам снова и снова.»
                </div>
              </div>

              {/* Location footer without rating */}
              <div className="flex items-center justify-between text-[11px] font-mono text-stone-400 pt-1 border-t border-stone-800/50">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  Онлайн в Академии
                </span>
                <span>г. Ростов-на-Дону</span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
