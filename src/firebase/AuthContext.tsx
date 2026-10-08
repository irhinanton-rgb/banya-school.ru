import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  ConfirmationResult,
} from 'firebase/auth';
import { auth } from './config';

export type AuthProviderType = 'google' | 'password' | 'phone' | 'unknown';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  authMethod: AuthProviderType;
  authError: string | null;
  authSuccessMsg: string | null;
  clearAuthError: () => void;
  clearAuthSuccess: () => void;
  signInWithGoogle: () => Promise<User | null>;
  signUpWithEmail: (email: string, password: string, displayName?: string) => Promise<User | null>;
  signInWithEmail: (email: string, password: string) => Promise<User | null>;
  resetPassword: (email: string) => Promise<boolean>;
  initPhoneRecaptcha: (containerId: string) => RecaptchaVerifier;
  sendPhoneCode: (phoneNumber: string, recaptchaVerifier: RecaptchaVerifier) => Promise<ConfirmationResult | null>;
  confirmPhoneCode: (confirmationResult: ConfirmationResult, code: string, displayName?: string) => Promise<User | null>;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapAuthErrorMessage(error: unknown): string {
  if (!error) return 'Неизвестная ошибка';
  const raw = error instanceof Error ? error.message : String(error);
  const code = (error as { code?: string })?.code || '';

  if (code.includes('auth/invalid-credential') || code.includes('auth/wrong-password')) {
    return 'Неверный адрес почты или пароль. Проверьте правильность введенных данных.';
  }
  if (code.includes('auth/user-not-found')) {
    return 'Пользователь с таким email не найден. Зарегистрируйтесь, если у вас еще нет аккаунта.';
  }
  if (code.includes('auth/email-already-in-use')) {
    return 'Этот email уже зарегистрирован. Переключитесь на вкладку «Войти» или восстановите пароль.';
  }
  if (code.includes('auth/weak-password')) {
    return 'Слишком простой пароль. Пароль должен содержать минимум 6 символов.';
  }
  if (code.includes('auth/invalid-email')) {
    return 'Некорректный формат адреса электронной почты (например, name@example.com).';
  }
  if (code.includes('auth/invalid-phone-number')) {
    return 'Некорректный номер телефона. Введите номер в международном формате, например +79991234567.';
  }
  if (code.includes('auth/invalid-verification-code')) {
    return 'Неверный код из SMS. Проверьте цифры и попробуйте снова.';
  }
  if (code.includes('auth/code-expired')) {
    return 'Срок действия кода из SMS истек. Запросите код повторно.';
  }
  if (code.includes('auth/quota-exceeded')) {
    return 'Исчерпан лимит бесплатных SMS на сегодня. Воспользуйтесь входом по Email или Google.';
  }
  if (code.includes('auth/captcha-check-failed')) {
    return 'Проверка безопасности reCAPTCHA не пройдена. Пожалуйста, обновите страницу и повторите попытку.';
  }
  if (code.includes('auth/operation-not-allowed')) {
    return 'Этот способ авторизации (Email или Телефон) еще не активирован в консоли Firebase (раздел Authentication -> Sign-in method).';
  }
  if (code.includes('auth/too-many-requests')) {
    return 'Слишком много попыток входа подряд. В целях безопасности система временно заблокировала запросы. Подождите пару минут.';
  }
  if (code.includes('auth/popup-closed-by-user')) {
    return 'Окно авторизации Google было закрыто до завершения входа.';
  }
  if (code.includes('auth/unauthorized-domain')) {
    return 'Текущий домен приложения не добавлен в список разрешенных доменов в консоли Firebase (Authentication -> Settings -> Authorized domains).';
  }

  return raw;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccessMsg, setAuthSuccessMsg] = useState<string | null>(null);
  const [authMethod, setAuthMethod] = useState<AuthProviderType>('unknown');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser?.providerData && currentUser.providerData.length > 0) {
        const pId = currentUser.providerData[0].providerId;
        if (pId === 'google.com') setAuthMethod('google');
        else if (pId === 'password') setAuthMethod('password');
        else if (pId === 'phone') setAuthMethod('phone');
        else setAuthMethod('unknown');
      } else if (currentUser?.phoneNumber) {
        setAuthMethod('phone');
      } else {
        setAuthMethod('unknown');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const clearAuthError = () => setAuthError(null);
  const clearAuthSuccess = () => setAuthSuccessMsg(null);

  // 1. Google Auth
  const signInWithGoogle = async (): Promise<User | null> => {
    setAuthError(null);
    setAuthSuccessMsg(null);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      setAuthMethod('google');
      return result.user;
    } catch (err: unknown) {
      const msg = mapAuthErrorMessage(err);
      console.error('Google Sign-in failed:', err);
      setAuthError(msg);
      return null;
    }
  };

  // 2. Email + Password Sign Up
  const signUpWithEmail = async (
    email: string,
    password: string,
    displayName?: string
  ): Promise<User | null> => {
    setAuthError(null);
    setAuthSuccessMsg(null);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      if (displayName && cred.user) {
        await updateProfile(cred.user, { displayName: displayName.trim() });
      }
      setAuthMethod('password');
      setAuthSuccessMsg('Регистрация успешно завершена! Добро пожаловать в Пармастер Квест.');
      return cred.user;
    } catch (err: unknown) {
      const msg = mapAuthErrorMessage(err);
      console.error('Email Sign-up failed:', err);
      setAuthError(msg);
      return null;
    }
  };

  // 3. Email + Password Sign In
  const signInWithEmail = async (email: string, password: string): Promise<User | null> => {
    setAuthError(null);
    setAuthSuccessMsg(null);
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      setAuthMethod('password');
      return cred.user;
    } catch (err: unknown) {
      const msg = mapAuthErrorMessage(err);
      console.error('Email Sign-in failed:', err);
      setAuthError(msg);
      return null;
    }
  };

  // 4. Password Reset
  const resetPassword = async (email: string): Promise<boolean> => {
    setAuthError(null);
    setAuthSuccessMsg(null);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setAuthSuccessMsg('Письмо с инструкциями по сбросу пароля отправлено на вашу почту.');
      return true;
    } catch (err: unknown) {
      const msg = mapAuthErrorMessage(err);
      console.error('Password reset failed:', err);
      setAuthError(msg);
      return false;
    }
  };

  // 5. Phone Auth: initialize Recaptcha
  const initPhoneRecaptcha = (containerId: string): RecaptchaVerifier => {
    // Clear DOM container to avoid "reCAPTCHA already rendered"
    if (typeof document !== 'undefined') {
      const el = document.getElementById(containerId);
      if (el) {
        el.innerHTML = '';
      }
    }

    // Clear any existing window recaptcha verifier
    if (typeof window !== 'undefined' && (window as unknown as { recaptchaVerifier?: RecaptchaVerifier }).recaptchaVerifier) {
      try {
        (window as unknown as { recaptchaVerifier?: RecaptchaVerifier }).recaptchaVerifier?.clear();
      } catch {
        // ignore
      }
    }

    const verifier = new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
      callback: () => {
        // reCAPTCHA solved
      },
      'expired-callback': () => {
        setAuthError('Время действия проверки reCAPTCHA истекло. Пожалуйста, отправьте SMS повторно.');
      },
    });

    if (typeof window !== 'undefined') {
      (window as unknown as { recaptchaVerifier?: RecaptchaVerifier }).recaptchaVerifier = verifier;
    }

    return verifier;
  };

  // 6. Phone Auth: Send SMS
  const sendPhoneCode = async (
    phoneNumber: string,
    recaptchaVerifier: RecaptchaVerifier
  ): Promise<ConfirmationResult | null> => {
    setAuthError(null);
    setAuthSuccessMsg(null);
    try {
      // Robust phone normalization (E.164 standard)
      const digits = phoneNumber.replace(/\D/g, '');
      let cleanPhone = '';

      if (digits.length === 11 && (digits.startsWith('7') || digits.startsWith('8'))) {
        cleanPhone = '+7' + digits.slice(1);
      } else if (digits.length === 10) {
        cleanPhone = '+7' + digits;
      } else if (phoneNumber.trim().startsWith('+')) {
        cleanPhone = '+' + digits;
      } else {
        cleanPhone = '+' + digits;
      }

      if (cleanPhone.length < 11) {
        setAuthError('Слишком короткий номер телефона. Проверьте правильность (например: +7 999 123-45-67).');
        return null;
      }

      const confirmationResult = await signInWithPhoneNumber(auth, cleanPhone, recaptchaVerifier);
      setAuthSuccessMsg(`Код подтверждения отправлен на номер ${cleanPhone}`);
      return confirmationResult;
    } catch (err: unknown) {
      const msg = mapAuthErrorMessage(err);
      console.error('Phone SMS send failed:', err);
      setAuthError(msg);
      return null;
    }
  };

  // 7. Phone Auth: Confirm SMS code
  const confirmPhoneCode = async (
    confirmationResult: ConfirmationResult,
    code: string,
    displayName?: string
  ): Promise<User | null> => {
    setAuthError(null);
    setAuthSuccessMsg(null);
    try {
      const cred = await confirmationResult.confirm(code.trim());
      if (displayName && cred.user) {
        await updateProfile(cred.user, { displayName: displayName.trim() });
      }
      setAuthMethod('phone');
      setAuthSuccessMsg('Телефон успешно подтвержден!');
      return cred.user;
    } catch (err: unknown) {
      const msg = mapAuthErrorMessage(err);
      console.error('Phone confirmation failed:', err);
      setAuthError(msg);
      return null;
    }
  };

  // 8. Sign Out
  const signOutUser = async (): Promise<void> => {
    try {
      await signOut(auth);
      setUser(null);
      setAuthMethod('unknown');
      setAuthError(null);
      setAuthSuccessMsg(null);
    } catch (err: unknown) {
      console.error('Sign-out error:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
