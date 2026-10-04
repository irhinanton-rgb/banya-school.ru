import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Cloud,
  CheckCircle2,
  Award,
  LogOut,
  ShieldCheck,
  Smartphone,
  RefreshCw,
  AlertCircle,
  User as UserIcon,
} from 'lucide-react';
import { useAuth } from '../firebase/AuthContext';
import { UserProgress } from '../types/banya';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  progress: UserProgress;
  onManualSync?: () => Promise<void>;
  isSyncing?: boolean;
  lastSyncedTime?: string | null;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  progress,
  onManualSync,
  isSyncing = false,
  lastSyncedTime,
}) => {
  const { user, signInWithGoogle, signOutUser, authError, clearAuthError } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setIsSigningIn(true);
    clearAuthError();
    try {
      await signInWithGoogle();
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleLogout = async () => {
    await signOutUser();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl border border-amber-600/40 bg-stone-950 text-stone-100 shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="relative bg-gradient-to-r from-amber-950/80 via-stone-900 to-amber-950/80 border-b border-stone-800 p-5 sm:p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-stone-900/80 hover:bg-stone-800 text-stone-400 hover:text-stone-100 transition-colors border border-stone-700/60"
            title="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-2xl shrink-0 shadow-inner">
              ☁️
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-mono uppercase tracking-wider mb-1">
                <span>Облачный профиль пармастера</span>
              </div>
              <h2 className="text-xl font-serif font-bold text-amber-100">
                {user ? 'Личный кабинет и Синхронизация' : 'Регистрация и Сохранение Прогресса'}
              </h2>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5">
          {authError && (
            <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/50 text-xs text-rose-200 flex items-start gap-2.5 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold block">Ошибка входа:</span>
                <span>{authError}</span>
              </div>
            </div>
          )}

          {user ? (
            /* Logged in state */
            <div className="space-y-5">
              {/* User Identity Card */}
              <div className="p-4 rounded-2xl bg-stone-900/90 border border-stone-800 flex items-center gap-4">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Пользователь'}
                    className="h-14 w-14 rounded-2xl border-2 border-amber-500/60 object-cover shadow-md"
                  />
                ) : (
                  <div className="h-14 w-14 rounded-2xl bg-amber-500/20 border-2 border-amber-500/60 flex items-center justify-center text-xl font-bold text-amber-300">
                    {user.displayName ? user.displayName.slice(0, 2).toUpperCase() : 'ПМ'}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif font-bold text-base text-stone-100 truncate">
                      {user.displayName || progress.name || 'Пармастер'}
                    </h3>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-mono">
                      <CheckCircle2 className="w-3 h-3" />
                      Онлайн
                    </span>
                  </div>
                  <p className="text-xs text-stone-400 truncate mt-0.5">{user.email}</p>
                  <p className="text-[11px] font-mono text-amber-400/90 mt-1">
                    ID: {user.uid.slice(0, 8)}...
                  </p>
                </div>
              </div>

              {/* Progress Summary in Cloud */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-stone-900 border border-stone-800 text-center">
                  <span className="text-[10px] text-stone-400 uppercase font-mono block">Опыт (XP)</span>
                  <span className="text-lg font-bold font-mono text-amber-400 tabular-nums">
                    {progress.xp}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-stone-900 border border-stone-800 text-center">
                  <span className="text-[10px] text-stone-400 uppercase font-mono block">Уровни</span>
                  <span className="text-lg font-bold font-mono text-emerald-400 tabular-nums">
                    {progress.completedLevels.length} / 7
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-stone-900 border border-stone-800 text-center">
                  <span className="text-[10px] text-stone-400 uppercase font-mono block">Значки</span>
                  <span className="text-lg font-bold font-mono text-cyan-400 tabular-nums">
                    {progress.unlockedBadges.length}
                  </span>
                </div>
              </div>

              {/* Sync Status Banner */}
              <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-200/90 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-semibold block text-emerald-300">
                      Облачное сохранение активно
                    </span>
                    <span className="text-[11px] text-stone-400">
                      {lastSyncedTime
                        ? `Последняя синхронизация: ${lastSyncedTime}`
                        : 'Данные автоматически сохраняются в Firestore'}
                    </span>
                  </div>
                </div>

                {onManualSync && (
                  <button
                    onClick={onManualSync}
                    disabled={isSyncing}
                    className="p-2 rounded-lg bg-emerald-900/50 hover:bg-emerald-800/60 text-emerald-200 transition-colors cursor-pointer border border-emerald-700/50"
                    title="Синхронизировать сейчас"
                  >
                    <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                  </button>
                )}
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-rose-300 hover:text-rose-200 text-xs font-semibold transition-all border border-stone-800 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Выйти из аккаунта</span>
                </button>

                <button
                  onClick={onClose}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wide transition-all shadow-md cursor-pointer"
                >
                  <span>Продолжить обучение</span>
                </button>
              </div>
            </div>
          ) : (
            /* Unauthenticated / Registration view */
            <div className="space-y-5">
              <div className="space-y-2.5">
                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                  Зарегистрируйтесь или войдите в аккаунт, чтобы навсегда привязать свой прогресс к профилю и не потерять достижения.
                </p>

                {/* Key Benefits */}
                <div className="space-y-2 pt-1 text-xs">
                  <div className="flex items-center gap-2.5 text-stone-300">
                    <Cloud className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Синхронизация прогресса между телефоном, планшетом и ПК</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-stone-300">
                    <Award className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Сохранение именного Сертификата пармастера с печатью</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-stone-300">
                    <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Участие в рейтинге и таблице лидеров банной школы</span>
                  </div>
                </div>
              </div>

              {/* One-Click Google Login Button */}
              <div className="pt-2 space-y-3">
                <button
                  onClick={handleGoogleLogin}
                  disabled={isSigningIn}
                  className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-2xl bg-white hover:bg-stone-100 active:scale-95 text-stone-900 font-bold text-sm transition-all shadow-xl cursor-pointer disabled:opacity-50 select-none border border-stone-200"
                >
                  {/* Google SVG Icon */}
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>{isSigningIn ? 'Авторизация...' : 'Войти через Google (в 1 клик)'}</span>
                </button>

                <p className="text-[11px] text-center text-stone-500">
                  Текущий прогресс ({progress.xp} XP) автоматически объединится с вашим облачным профилем после входа.
                </p>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
