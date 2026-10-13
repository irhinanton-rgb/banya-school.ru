import React, { useState, useEffect } from 'react';
import { Sparkles, ShieldAlert, ArrowRight, X, UserPlus, CloudOff } from 'lucide-react';
import { useAuth } from '../firebase/AuthContext';
import { UserProgress } from '../types/banya';

interface GuestProgressNoticeProps {
  progress: UserProgress;
  onOpenAuth: () => void;
}

const STORAGE_DISMISSED_KEY = 'pq_guest_notice_dismissed_until';

export const GuestProgressNotice: React.FC<GuestProgressNoticeProps> = ({
  progress,
  onOpenAuth,
}) => {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  useEffect(() => {
    // If logged in, never show
    if (user) {
      setIsVisible(false);
      return;
    }

    // Check if dismissed recently (e.g., dismissed for 24 hours)
    try {
      const dismissedUntil = localStorage.getItem(STORAGE_DISMISSED_KEY);
      if (dismissedUntil && Number(dismissedUntil) > Date.now()) {
        setIsDismissed(true);
        return;
      }
    } catch {
      // ignore localStorage errors
    }

    // Gentle delay (3 seconds after entering) so it doesn't slam the user on the very first second
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, [user]);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    try {
      // Dismiss for 24 hours to stay non-intrusive
      localStorage.setItem(STORAGE_DISMISSED_KEY, String(Date.now() + 24 * 60 * 60 * 1000));
    } catch {
      // ignore
    }
  };

  if (!isVisible || isDismissed || user) {
    return null;
  }

  const currentLevel = progress.activeLevelId || 1;
  const currentXp = progress.xp || 0;

  return (
    <aside 
      aria-label="Напоминание о сохранении прогресса"
      className="fixed bottom-24 md:bottom-7 left-3 sm:left-6 z-40 max-w-[calc(100vw-1.5rem)] sm:max-w-md animate-fadeIn"
    >
      <div className="relative rounded-2xl bg-gradient-to-br from-stone-900/98 via-stone-950/98 to-stone-900/98 border border-amber-500/40 p-4 sm:p-5 shadow-[0_15px_45px_rgba(0,0,0,0.85)] backdrop-blur-xl text-stone-100 space-y-3 ring-1 ring-amber-400/20">
        
        {/* Close / Dismiss button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1.5 rounded-xl text-stone-400 hover:text-stone-100 hover:bg-stone-800/80 transition-colors cursor-pointer"
          title="Скрыть напоминание"
          aria-label="Скрыть напоминание"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content Header */}
        <div className="flex items-start gap-3 pr-6">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0 shadow-inner">
            <CloudOff className="w-5 h-5 text-amber-400" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/25">
                Гостевой режим
              </span>
              {currentXp > 0 && (
                <span className="text-[10px] font-mono text-amber-300 font-semibold">
                  {currentXp} XP
                </span>
              )}
            </div>
            <h4 className="text-sm sm:text-base font-serif font-bold text-stone-100 leading-snug">
              Сохраните ваш банный путь
            </h4>
          </div>
        </div>

        {/* Persuasive and respectful explanation */}
        <p className="text-xs text-stone-300 leading-relaxed">
          Сейчас вы изучаете квест как гость. Если закрыть браузер или очистить кэш, пройденные уроки, тесты и баллы опыта могут сброситься.
        </p>

        {/* Highlights */}
        <div className="text-[11px] font-mono text-stone-400 flex items-center gap-2 bg-stone-900/80 p-2 rounded-xl border border-stone-800/80">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
          <span>Быстрый вход в 1 клик через Google, Email или SMS</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => {
              handleDismiss();
              onOpenAuth();
            }}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(245,158,11,0.35)] hover:shadow-[0_0_25px_rgba(245,158,11,0.5)] transition-all cursor-pointer active:scale-95 border border-amber-300/40"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Закрепить прогресс</span>
          </button>
          
          <button
            onClick={handleDismiss}
            className="py-2.5 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-stone-200 text-xs font-medium border border-stone-800 transition-colors cursor-pointer"
          >
            Позже
          </button>
        </div>

      </div>
    </aside>
  );
};
