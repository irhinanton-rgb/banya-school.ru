import React, { useState, useEffect, useRef } from 'react';
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
import { ConfirmationResult, RecaptchaVerifier } from 'firebase/auth';

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

  // Phone form state
  const [phone, setPhone] = useState<string>('+7');
  const [phoneCode, setPhoneCode] = useState<string>('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [smsTimer, setSmsTimer] = useState<number>(0);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  // Agreement checkbox
  const [agreedToTerms, setAgreedToTerms] = useState<boolean>(true);

  // Countdown timer for SMS
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (smsTimer > 0) {
      interval = setInterval(() => {
        setSmsTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [smsTimer]);

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

    if (!email.trim() || !password) return;

    if (emailMode === 'signup') {
      if (password.length < 6) {
        return;
      }
      if (password !== confirmPassword) {
        alert('Пароли не совпадают');
        return;
      }
      if (!agreedToTerms) {
        alert('Для регистрации необходимо принять условия оферты и политики конфиденциальности');
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
  const handleSendPhoneSms = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAuthError();
    clearAuthSuccess();

    if (!phone || phone.length < 10) return;

    if (!agreedToTerms) {
      alert('Необходимо согласие с условиями оферты и обработки данных');
      return;
    }

    setLoading(true);
    try {
      // Initialize recaptcha if needed
      const verifier = initPhoneRecaptcha('recaptcha-container');
      recaptchaVerifierRef.current = verifier;

      const result = await sendPhoneCode(phone, verifier);
      if (result) {
        setConfirmationResult(result);
        setSmsTimer(60);
      }
    } finally {
      setLoading(false);
    }
  };

  // Phone: Verify Code
  const handleVerifyPhoneCode = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAuthError();
    clearAuthSuccess();

    if (!confirmationResult || !phoneCode.trim()) return;

    setLoading(true);
    try {
      await confirmPhoneCode(confirmationResult, phoneCode, displayName || progress.name);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOutUser();
    setConfirmationResult(null);
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
              ☁️
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-mono uppercase tracking-wider mb-1">
                <span>Облачный профиль пармастера</span>
              </div>
              <h2 className="text-xl font-serif font-bold text-amber-100">
                {user ? 'Личный кабинет и Синхронизация' : 'Вход и Регистрация в Пармастер Квест'}
              </h2>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto">
          
          {/* Error Message */}
          {authError && (
            <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/50 space-y-2 text-xs text-red-200 animate-fade-in shadow-lg">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-semibold text-red-300">Ошибка авторизации:</div>
                  <p className="mt-0.5 text-stone-300 leading-relaxed">{authError}</p>
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
              {/* Tab Selector */}
              <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-stone-900 border border-stone-800">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('email');
                    clearAuthError();
                    clearAuthSuccess();
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'email'
                      ? 'bg-amber-500 text-stone-950 shadow-md font-bold'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>По почте</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('phone');
                    clearAuthError();
                    clearAuthSuccess();
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'phone'
                      ? 'bg-amber-500 text-stone-950 shadow-md font-bold'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>По телефону</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('google');
                    clearAuthError();
                    clearAuthSuccess();
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'google'
                      ? 'bg-amber-500 text-stone-950 shadow-md font-bold'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <span>Google</span>
                </button>
              </div>

              {/* TAB 1: EMAIL & PASSWORD */}
              {activeTab === 'email' && (
                <div className="space-y-4">
                  {/* Mode Selector for Email (Sign in / Sign up) */}
                  {emailMode !== 'forgot' && (
                    <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                      <div className="flex gap-4 text-xs font-medium">
                        <button
                          type="button"
                          onClick={() => setEmailMode('signup')}
                          className={`transition-colors cursor-pointer ${
                            emailMode === 'signup'
                              ? 'text-amber-400 font-bold border-b-2 border-amber-500 pb-1'
                              : 'text-stone-400 hover:text-stone-200'
                          }`}
                        >
                          Регистрация
                        </button>
                        <button
                          type="button"
                          onClick={() => setEmailMode('signin')}
                          className={`transition-colors cursor-pointer ${
                            emailMode === 'signin'
                              ? 'text-amber-400 font-bold border-b-2 border-amber-500 pb-1'
                              : 'text-stone-400 hover:text-stone-200'
                          }`}
                        >
                          Вход в аккаунт
                        </button>
                      </div>
                    </div>
                  )}

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
                          Электронная почта:
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-stone-500 absolute left-3.5 top-3.5" />
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="master@banya.ru"
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-stone-100 placeholder-stone-600 text-xs focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[11px] font-mono text-stone-400">
                            Пароль (от 6 символов):
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
                        <div className="relative">
                          <Lock className="w-4 h-4 text-stone-500 absolute left-3.5 top-3.5" />
                          <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
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
              )}

              {/* TAB 2: PHONE AUTHENTICATION */}
              {activeTab === 'phone' && (
                <div className="space-y-4">
                  {/* Invisible Recaptcha Container */}
                  <div id="recaptcha-container"></div>

                  {!confirmationResult ? (
                    <form onSubmit={handleSendPhoneSms} className="space-y-3.5">
                      <div className="p-3 rounded-xl bg-stone-900/80 border border-stone-800 text-xs text-stone-300">
                        📱 Введите номер телефона. Мы отправим бесплатный проверочный 6-значный SMS-код для входа.
                      </div>

                      <div>
                        <label className="text-[11px] font-mono text-stone-400 block mb-1">
                          Ваше имя:
                        </label>
                        <div className="relative">
                          <User className="w-4 h-4 text-stone-500 absolute left-3.5 top-3.5" />
                          <input
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            placeholder="Александр"
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-stone-100 placeholder-stone-600 text-xs focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-mono text-stone-400 block mb-1">
                          Номер мобильного телефона:
                        </label>
                        <div className="relative">
                          <Smartphone className="w-4 h-4 text-stone-500 absolute left-3.5 top-3.5" />
                          <input
                            type="tel"
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+7 999 123-45-67"
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-stone-100 placeholder-stone-600 text-xs font-mono focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      </div>

                      <label className="flex items-start gap-2.5 pt-1 text-[11px] text-stone-400 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={agreedToTerms}
                          onChange={(e) => setAgreedToTerms(e.target.checked)}
                          className="mt-0.5 rounded border-stone-700 bg-stone-900 text-amber-500 focus:ring-0"
                        />
                        <span>
                          Согласен с получением SMS и условиями{' '}
                          <button
                            type="button"
                            onClick={() => onOpenLegal && onOpenLegal('offer')}
                            className="text-amber-400 underline cursor-pointer"
                          >
                            оферты
                          </button>
                        </span>
                      </label>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
                      >
                        {loading ? 'Отправка SMS...' : 'Получить SMS с кодом'}
                      </button>

                      {/* Phone Setup & Testing Info */}
                      <div className="rounded-xl border border-stone-800 bg-stone-900/60 p-3 space-y-2 text-xs text-stone-300 mt-3">
                        <div className="flex items-center justify-between font-mono text-[11px] text-amber-400 font-semibold">
                          <span>Настройка SMS в Firebase:</span>
                        </div>
                        <p className="text-[11px] text-stone-400 leading-relaxed">
                          В проекте <strong>banya-school</strong> перейдите в <em>Authentication → Sign-in method → Phone</em> и включите тумблер <strong>Enable</strong>.
                        </p>
                        <div className="text-[11px] text-stone-400 bg-stone-950/80 p-2.5 rounded-lg border border-stone-800/80 space-y-1">
                          <strong className="text-amber-300 block">💡 Вход без ожидания SMS (тестовые номера):</strong>
                          <span>В настройках Phone разверните пункт <em>«Phone numbers for testing»</em> и укажите номер (например: <code className="text-amber-200 font-mono">+79991234567</code>) и код <code className="text-amber-200 font-mono">123456</code>. По этому номеру вход будет срабатывать мгновенно!</span>
                        </div>
                      </div>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyPhoneCode} className="space-y-4">
                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200">
                        Код отправлен на <strong className="font-mono">{phone}</strong>
                      </div>

                      <div>
                        <label className="text-[11px] font-mono text-stone-400 block mb-1">
                          Введите 6-значный код из SMS:
                        </label>
                        <div className="relative">
                          <KeyRound className="w-4 h-4 text-stone-500 absolute left-3.5 top-3.5" />
                          <input
                            type="text"
                            required
                            maxLength={6}
                            value={phoneCode}
                            onChange={(e) => setPhoneCode(e.target.value.replace(/\D/g, ''))}
                            placeholder="123456"
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-stone-100 placeholder-stone-600 text-center font-mono text-lg tracking-widest focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-stone-400">
                        {smsTimer > 0 ? (
                          <span>Повторный запрос через {smsTimer} сек</span>
                        ) : (
                          <button
                            type="button"
                            onClick={handleSendPhoneSms}
                            className="text-amber-400 hover:underline cursor-pointer"
                          >
                            Отправить код повторно
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setConfirmationResult(null)}
                          className="text-stone-400 hover:text-stone-200 cursor-pointer"
                        >
                          Изменить номер
                        </button>
                      </div>

                      <button
                        type="submit"
                        disabled={loading || phoneCode.length < 6}
                        className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {loading ? 'Проверка...' : 'Подтвердить и войти'}
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* TAB 3: GOOGLE AUTH */}
              {activeTab === 'google' && (
                <div className="space-y-4">
                  <p className="text-xs text-stone-300 leading-relaxed">
                    Быстрый вход в один клик без ввода паролей. Прогресс и сертификат привязываются к вашему аккаунту Google.
                  </p>

                  <button
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-stone-100 text-stone-900 font-semibold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-3 cursor-pointer active:scale-[0.99] disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                    <span>{loading ? 'Подключение к Google...' : 'Войти через Google'}</span>
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
