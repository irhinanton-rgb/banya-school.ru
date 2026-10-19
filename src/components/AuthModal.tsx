import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Sparkles,
  Cloud,
  CheckCircle2,
  Award,
  LogOut,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
  Mail,
  Lock,
  User,
  ArrowRight,
  KeyRound,
  Check,
  Copy,
  Globe,
  ExternalLink,
  Flame,
  Crown,
  BookOpen,
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
  onOpenPricing?: () => void;
  onOpenProfile?: () => void;
  onOpenLegal?: (tab: 'offer' | 'privacy' | 'requisites') => void;
  startLearningMode?: boolean;
  showGuestContinue?: boolean;
  onContinueAsGuest?: () => void;
  onAuthSuccessRedirect?: () => void;
  initialMode?: 'signup' | 'signin';
}

type AuthTab = 'email' | 'phone' | 'google';
type EmailMode = 'signin' | 'signup' | 'forgot';

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  progress,
  onManualSync,
  isSyncing = false,
  lastSyncedTime,
  onOpenPricing,
  onOpenProfile,
  onOpenLegal,
  startLearningMode = false,
  showGuestContinue = false,
  onContinueAsGuest,
  onAuthSuccessRedirect,
  initialMode = 'signup',
}) => {
  const {
    user,
    authMethod,
    authError,
    authSuccessMsg,
    clearAuthError,
    clearAuthSuccess,
    signInWithGoogle,
    signUpWithEmail,
    signInWithEmail,
    resetPassword,
    initPhoneRecaptcha,
    sendPhoneCode,
    confirmPhoneCode,
    signOutUser,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<AuthTab>('email');
  const [emailMode, setEmailMode] = useState<EmailMode>('signup');
  const [loading, setLoading] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Email form state
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [displayName, setDisplayName] = useState<string>(progress.name || '');

  // Agreement checkbox
  const [agreedToTerms, setAgreedToTerms] = useState<boolean>(true);
  const [localError, setLocalError] = useState<string | null>(null);



  // Set email mode based on initialMode or startLearningMode
  useEffect(() => {
    if (isOpen) {
      if (startLearningMode) {
        setEmailMode('signup');
      } else if (initialMode) {
        setEmailMode(initialMode);
      }
      clearAuthError();
      clearAuthSuccess();
    }
  }, [isOpen, startLearningMode, initialMode]);

  // Redirect to learning automatically upon successful auth if startLearningMode is true
  const hasRedirectedRef = useRef<boolean>(false);
  useEffect(() => {
    if (isOpen && user && startLearningMode && onAuthSuccessRedirect && !hasRedirectedRef.current) {
      hasRedirectedRef.current = true;
      const timer = setTimeout(() => {
        onClose();
        onAuthSuccessRedirect();
      }, 500);
      return () => clearTimeout(timer);
    }
    if (!isOpen) {
      hasRedirectedRef.current = false;
    }
  }, [isOpen, user, startLearningMode, onAuthSuccessRedirect, onClose]);

  if (!isOpen) return null;

  const currentHostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const isDomainError =
    authError &&
    (authError.includes('unauthorized-domain') ||
      authError.includes('auth/unauthorized-domain') ||
      authError.toLowerCase().includes('authorized domain'));

  const isOperationNotAllowed =
    authError &&
    (authError.includes('operation-not-allowed') ||
      authError.toLowerCase().includes('еще не активирован в консоли'));

  const handleCopy = (text: string, key: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2500);
    }
  };

  // Google Login
  const handleGoogleLogin = async () => {
    setLoading(true);
    clearAuthError();
    clearAuthSuccess();
    try {
      await signInWithGoogle();
    } finally {
      setLoading(false);
    }
  };

  // Email Submit
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAuthError();
    clearAuthSuccess();
    setLocalError(null);

    if (!email.trim() || !password) return;

    if (emailMode === 'signup') {
      if (password.length < 6) {
        setLocalError('Пароль должен содержать минимум 6 символов.');
        return;
      }
      if (password !== confirmPassword) {
        setLocalError('Введённые пароли не совпадают. Проверьте правильность ввода.');
        return;
      }
      if (!agreedToTerms) {
        setLocalError('Для регистрации необходимо принять условия оферты и политики конфиденциальности.');
        return;
      }
      setLoading(true);
      try {
        await signUpWithEmail(email, password, displayName || progress.name);
      } finally {
        setLoading(false);
      }
    } else if (emailMode === 'signin') {
      setLoading(true);
      try {
        await signInWithEmail(email, password);
      } finally {
        setLoading(false);
      }
    } else if (emailMode === 'forgot') {
      setLoading(true);
      try {
        await resetPassword(email);
      } finally {
        setLoading(false);
      }
    }
  };

  // Phone: Send SMS
  const handleLogout = async () => {
    await signOutUser();

  };

  const isMasterPro = progress.isPaid || progress.tariff === 'master_pro';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-5 overflow-y-auto bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl rounded-t-3xl sm:rounded-3xl border-t sm:border border-amber-600/40 bg-stone-950 text-stone-100 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[94vh]">
        
        {/* Mobile Swipe Handle */}
        <div className="w-12 h-1 bg-stone-700/80 rounded-full mx-auto my-2 sm:hidden shrink-0" />

        {/* Header */}
        <div className="relative bg-gradient-to-r from-amber-950/80 via-stone-900 to-amber-950/80 border-b border-stone-800 p-4 sm:p-6 shrink-0">
          <button
            onClick={onClose}
            className="absolute top-3 sm:top-4 right-3 sm:right-4 p-2 rounded-full bg-stone-900/80 hover:bg-stone-800 text-stone-400 hover:text-stone-100 transition-colors border border-stone-700/60 cursor-pointer"
            title="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-2xl shrink-0 shadow-inner">
              {startLearningMode ? '🚀' : '☁️'}
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-mono uppercase tracking-wider mb-1">
                <span>{startLearningMode ? 'Быстрый старт и сохранение прогресса' : 'Облачный профиль пармастера'}</span>
              </div>
              <h2 className="text-xl font-serif font-bold text-amber-100">
                {user
                  ? 'Личный кабинет и Синхронизация'
                  : startLearningMode
                    ? 'Быстрая регистрация перед обучением'
                    : emailMode === 'signup' ? 'Регистрация в Пармастер Квест' : emailMode === 'forgot' ? 'Восстановление доступа' : 'Вход в аккаунт'}
              </h2>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto">
          
          {/* Error Message */}
          {(authError || localError) && (
            <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/50 space-y-2 text-xs text-red-200 animate-fade-in shadow-lg">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-semibold text-red-300">Ошибка авторизации:</div>
                  <p className="mt-0.5 text-stone-300 leading-relaxed">{localError || authError}</p>
                </div>
              </div>
            </div>
          )}

          {/* Success Message */}
          {authSuccessMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/50 text-xs text-emerald-200 flex items-center gap-2.5 shadow-md">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{authSuccessMsg}</span>
            </div>
          )}

          {/* Domain Whitelist Guidance */}
          {isDomainError && (
            <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/50 space-y-3.5 text-xs text-stone-200 animate-fade-in shadow-lg">
              <div className="flex items-start gap-2.5">
                <Globe className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-serif font-bold text-sm text-amber-200">
                    Домен не добавлен в доверенные домены Firebase
                  </h4>
                  <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                    Для защиты аккаунтов Google блокирует вход на новых доменах, пока они не внесены в список разрешенных в консоли Firebase (раздел Authentication → Settings → Authorized domains).
                  </p>
                </div>
              </div>

              {currentHostname && (
                <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-stone-900 border border-stone-800">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-stone-400 font-mono text-[10px]">Текущий домен:</span>
                    <code className="text-amber-300 font-mono text-xs truncate select-all font-semibold">
                      {currentHostname}
                    </code>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(currentHostname, 'current')}
                    className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-[11px] font-medium transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === 'current' ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Скопировано</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-stone-400" />
                        <span>Копировать</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Provider Activation Guidance if operation not allowed */}
          {isOperationNotAllowed && (
            <div className="p-4 rounded-2xl bg-amber-950/50 border border-amber-500/60 text-xs text-amber-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-300">
                <KeyRound className="w-4 h-4 text-amber-400" />
                <span>Как включить вход по Почте или Телефону в Firebase Console:</span>
              </div>
              <ol className="list-decimal pl-5 space-y-1 text-stone-300 leading-relaxed">
                <li>Откройте консоль Firebase: <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-amber-400 underline inline-flex items-center gap-0.5">console.firebase.google.com <ExternalLink className="w-3 h-3" /></a></li>
                <li>Перейдите в проект <strong>banya-school</strong> → <strong>Authentication</strong> → вкладка <strong>Sign-in method</strong>.</li>
                <li>Нажмите <strong>Email/Password</strong> и переключите тумблер в положение <strong>Enable</strong>.</li>
                <li>(Для входа по SMS) Нажмите <strong>Phone</strong> и также включите его.</li>
              </ol>
            </div>
          )}

          {/* State 1: User is Logged In */}
          {user ? (
            <div className="space-y-5 animate-fade-in">
              {/* User Identity Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 min-w-0">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'Профиль'}
                      className="h-12 w-12 rounded-2xl object-cover border-2 border-emerald-500/60 shrink-0"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center text-lg border border-emerald-500/40 shrink-0">
                      {user.displayName ? user.displayName.slice(0, 1).toUpperCase() : (user.phoneNumber ? '📱' : 'П')}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif font-bold text-stone-100 truncate text-base">
                        {user.displayName || progress.name || 'Пармастер'}
                      </h3>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-medium shrink-0 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>В сети</span>
                      </span>
                    </div>
                    <div className="text-xs text-stone-400 truncate mt-0.5 font-mono">
                      {user.email || user.phoneNumber || 'Авторизованный ученик'}
                    </div>
                    <div className="text-[11px] text-stone-500 mt-1 flex items-center gap-1.5">
                      <span>Способ входа:</span>
                      <span className="text-amber-400 font-medium">
                        {authMethod === 'google' && 'Google'}
                        {authMethod === 'password' && 'Email и Пароль'}
                        {authMethod === 'phone' && 'Номер Телефона'}
                        {authMethod === 'unknown' && 'Облачный аккаунт'}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="p-2.5 rounded-xl bg-stone-800/80 hover:bg-stone-700 border border-stone-700 text-stone-300 hover:text-red-400 transition-colors shrink-0 flex items-center gap-1.5 text-xs cursor-pointer"
                  title="Выйти из аккаунта"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Выйти</span>
                </button>
              </div>

              {/* Course Access / Tariff Card */}
              <div className={`p-4 rounded-2xl border transition-all ${
                isMasterPro
                  ? 'bg-gradient-to-r from-amber-950/40 to-stone-900 border-amber-500/50'
                  : 'bg-stone-900/70 border-stone-800'
              }`}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                      isMasterPro ? 'bg-amber-500/20 text-amber-300' : 'bg-stone-800 text-stone-400'
                    }`}>
                      {isMasterPro ? <Crown className="w-5 h-5 text-amber-400" /> : <BookOpen className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="text-xs text-stone-400 font-mono uppercase tracking-wider">
                        Текущий тариф
                      </div>
                      <div className="font-serif font-bold text-sm text-stone-100 flex items-center gap-2">
                        <span>{isMasterPro ? 'Мастер Пара PRO (Полный доступ)' : 'Вольный Слушатель (Базовый)'}</span>
                      </div>
                    </div>
                  </div>

                  {onOpenPricing && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenPricing();
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isMasterPro
                          ? 'bg-stone-800 hover:bg-stone-700 text-amber-300 border border-amber-500/30'
                          : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 shadow-md'
                      }`}
                    >
                      {isMasterPro ? 'Детали тарифа' : 'Купить курс'}
                    </button>
                  )}
                </div>
              </div>

              {/* Profile & Avatar Editing Action Button */}
              {onOpenProfile && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenProfile();
                  }}
                  className="w-full py-2.5 px-4 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm"
                >
                  <User className="w-3.5 h-3.5 text-amber-400" />
                  <span>Редактировать фото, банный статус и описание о себе →</span>
                </button>
              )}

              {/* Sync Statistics */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="p-3 rounded-xl bg-stone-900/60 border border-stone-800 text-center">
                  <div className="text-amber-400 font-bold font-mono text-base">{progress.xp}</div>
                  <div className="text-[10px] text-stone-400 uppercase tracking-wide mt-0.5">Очки XP</div>
                </div>
                <div className="p-3 rounded-xl bg-stone-900/60 border border-stone-800 text-center">
                  <div className="text-emerald-400 font-bold font-mono text-base">
                    {progress.completedLevels.length} / 7
                  </div>
                  <div className="text-[10px] text-stone-400 uppercase tracking-wide mt-0.5">Станций</div>
                </div>
                <div className="p-3 rounded-xl bg-stone-900/60 border border-stone-800 text-center">
                  <div className="text-amber-300 font-bold font-mono text-base">
                    {progress.unlockedBadges.length}
                  </div>
                  <div className="text-[10px] text-stone-400 uppercase tracking-wide mt-0.5">Трофеев</div>
                </div>
              </div>

              {/* Manual Cloud Sync Action */}
              <div className="p-3.5 rounded-2xl bg-stone-900/60 border border-stone-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Cloud className="w-4 h-4 text-emerald-400" />
                  <span className="text-stone-300">
                    {lastSyncedTime ? `Синхронизировано в ${lastSyncedTime}` : 'Облачное сохранение активно'}
                  </span>
                </div>
                {onManualSync && (
                  <button
                    onClick={onManualSync}
                    disabled={isSyncing}
                    className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-300 border border-amber-500/20 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>Синхронизировать</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* State 2: User is NOT Logged In - Multiple Login Tabs */
            <div className="space-y-5 animate-fade-in">
              {/* Gentle, non-intrusive Guest Progress Safeguard Banner */}
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs">
                <div className="h-8 w-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                  🛡️
                </div>
                <div className="space-y-0.5">
                  <div className="font-semibold text-amber-200">
                    {startLearningMode
                      ? 'Сохраните ваш прогресс перед началом обучения'
                      : 'Зачем регистрироваться в «Пармастер Квест»?'}
                  </div>
                  <p className="text-stone-300 leading-relaxed text-[11px]">
                    {startLearningMode
                      ? 'В гостевом режиме прогресс, баллы XP и сертификат хранятся лишь во временной памяти браузера. Быстрая регистрация навсегда закрепит ваши результаты!'
                      : 'В гостевом режиме прогресс станций, баллы XP и трофеи хранятся только в кэше текущего браузера. Создайте аккаунт, чтобы навсегда сохранить свои достижения и продолжать обучение с любого устройства!'}
                  </p>
                </div>
              </div>

              {/* Mode Selector: Регистрация / Вход в аккаунт */}
              {emailMode !== 'forgot' && (
                <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-stone-900 border border-stone-800">
                  <button
                    type="button"
                    onClick={() => {
                      setEmailMode('signup');
                      clearAuthError();
                      clearAuthSuccess();
                    }}
                    className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      emailMode === 'signup'
                        ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-stone-950 shadow-md shadow-amber-500/20'
                        : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
                    }`}
                  >
                    <span>Регистрация</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmailMode('signin');
                      clearAuthError();
                      clearAuthSuccess();
                    }}
                    className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      emailMode === 'signin'
                        ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-stone-950 shadow-md shadow-amber-500/20'
                        : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
                    }`}
                  >
                    <span>Вход в аккаунт</span>
                  </button>
                </div>
              )}

              {/* EMAIL & PASSWORD FORM */}
              <div className="space-y-4">

                  {emailMode === 'forgot' ? (
                    <form onSubmit={handleEmailSubmit} className="space-y-4">
                      <div className="text-xs text-stone-300">
                        Введите ваш e-mail, и мы отправим ссылку для восстановления пароля:
                      </div>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-stone-500 absolute left-3.5 top-3.5" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@example.com"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-stone-100 placeholder-stone-600 text-xs focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="submit"
                          disabled={loading}
                          className="flex-1 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {loading ? 'Отправка...' : 'Сбросить пароль'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEmailMode('signin')}
                          className="py-2.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs transition-colors cursor-pointer"
                        >
                          Назад
                        </button>
                      </div>
                    </form>
                  ) : (
                    <form onSubmit={handleEmailSubmit} className="space-y-3.5">
                      {emailMode === 'signup' && (
                        <div>
                          <label className="text-[11px] font-mono text-stone-400 block mb-1">
                            Ваше имя (для сертификата):
                          </label>
                          <div className="relative">
                            <User className="w-4 h-4 text-stone-500 absolute left-3.5 top-3.5" />
                            <input
                              type="text"
                              required
                              value={displayName}
                              onChange={(e) => setDisplayName(e.target.value)}
                              placeholder="Иван Мастеров"
                              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-stone-100 placeholder-stone-600 text-xs focus:outline-none focus:border-amber-500"
                            />
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="text-[11px] font-mono text-stone-400 block mb-1">
                          {emailMode === 'signin' ? 'Электронная почта или Логин:' : 'Электронная почта:'}
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-stone-500 absolute left-3.5 top-3.5" />
                          <input
                            type={emailMode === 'signin' ? 'text' : 'email'}
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder={emailMode === 'signin' ? 'master@banya.ru или admin' : 'master@banya.ru'}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-stone-100 placeholder-stone-600 text-xs focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[11px] font-mono text-stone-300 font-semibold flex items-center gap-1.5">
                            <Lock className="w-3.5 h-3.5 text-amber-400" />
                            <span>{emailMode === 'signup' ? 'Придумайте пароль для сайта:' : 'Ваш пароль для сайта:'}</span>
                          </label>
                          {emailMode === 'signin' && (
                            <button
                              type="button"
                              onClick={() => setEmailMode('forgot')}
                              className="text-[11px] text-amber-400 hover:underline cursor-pointer"
                            >
                              Забыли пароль?
                            </button>
                          )}
                        </div>

                        {/* Crucial instruction: Password is NOT for mailbox, but created for this site */}
                        {emailMode === 'signup' && (
                          <div className="mb-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2 text-[11px] text-amber-200">
                            <span className="text-sm shrink-0">💡</span>
                            <div className="leading-snug">
                              <strong className="text-amber-300 font-bold">Внимание:</strong> пароль нужен <span className="underline decoration-amber-400 font-bold">не от вашей личной почты</span>! Придумайте <strong>любой новый пароль</strong> (от 6 символов) специально для входа на этот сайт и обязательно запомните его.
                            </div>
                          </div>
                        )}

                        <div className="relative">
                          <Lock className="w-4 h-4 text-stone-500 absolute left-3.5 top-3.5" />
                          <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder={emailMode === 'signup' ? "Придумайте пароль (от 6 символов)" : "Введите пароль"}
                            minLength={6}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-stone-100 placeholder-stone-600 text-xs focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      </div>

                      {emailMode === 'signup' && (
                        <div>
                          <label className="text-[11px] font-mono text-stone-400 block mb-1">
                            Подтвердите пароль:
                          </label>
                          <div className="relative">
                            <Lock className="w-4 h-4 text-stone-500 absolute left-3.5 top-3.5" />
                            <input
                              type="password"
                              required
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              placeholder="••••••••"
                              minLength={6}
                              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-stone-100 placeholder-stone-600 text-xs focus:outline-none focus:border-amber-500"
                            />
                          </div>
                        </div>
                      )}

                      {/* Agreement Checkbox */}
                      {emailMode === 'signup' && (
                        <label className="flex items-start gap-2.5 pt-1 text-[11px] text-stone-400 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={agreedToTerms}
                            onChange={(e) => setAgreedToTerms(e.target.checked)}
                            className="mt-0.5 rounded border-stone-700 bg-stone-900 text-amber-500 focus:ring-0"
                          />
                          <span>
                            Я согласен с{' '}
                            <button
                              type="button"
                              onClick={() => onOpenLegal && onOpenLegal('offer')}
                              className="text-amber-400 underline cursor-pointer"
                            >
                              Публичной офертой
                            </button>{' '}
                            и{' '}
                            <button
                              type="button"
                              onClick={() => onOpenLegal && onOpenLegal('privacy')}
                              className="text-amber-400 underline cursor-pointer"
                            >
                              Политикой конфиденциальности (152-ФЗ)
                            </button>
                          </span>
                        </label>
                      )}

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
                      >
                        {loading ? (
                          <span>Обработка...</span>
                        ) : emailMode === 'signup' ? (
                          <>
                            <span>Зарегистрироваться в Пармастер Квест</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        ) : (
                          <>
                            <span>Войти в личный кабинет</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>

              {/* Continue as Guest with Progress Warning */}
              {showGuestContinue && onContinueAsGuest && (
                <div className="pt-3 border-t border-stone-800 space-y-3">
                  <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/30 flex items-start gap-3 text-xs">
                    <div className="p-1.5 rounded-xl bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
                      <AlertCircle className="w-4 h-4 text-amber-400" />
                    </div>
                    <div className="space-y-1">
                      <div className="font-semibold text-amber-300">
                        Предупреждение: прогресс не сохранится
                      </div>
                      <p className="text-[11px] text-stone-300 leading-relaxed">
                        В гостевом режиме ваши баллы XP, пройденные станции и сертификат мастера не сохранятся при выходе или очистке кэша браузера.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onContinueAsGuest();
                    }}
                    className="w-full py-3 px-4 rounded-xl bg-stone-900 hover:bg-stone-850 text-stone-300 hover:text-white border border-stone-700/80 hover:border-amber-500/50 text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] shadow-sm"
                  >
                    <span>Продолжить как гость (без сохранения)</span>
                    <ArrowRight className="w-4 h-4 text-stone-400" />
                  </button>
                </div>
              )}

              {/* Bottom Guarantee Banner */}
              <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between text-[11px] text-stone-500">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Шифрование данных и безопасность</span>
                </div>
                {onOpenLegal && (
                  <button
                    onClick={() => onOpenLegal('privacy')}
                    className="text-stone-400 hover:text-amber-400 transition-colors cursor-pointer"
                  >
                    Политика 152-ФЗ
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};