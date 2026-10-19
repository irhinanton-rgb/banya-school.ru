import React, { useState, useEffect } from 'react';
import {
  X,
  Check,
  Crown,
  Sparkles,
  ShieldCheck,
  Award,
  Flame,
  CreditCard,
  QrCode,
  Zap,
  Lock,
  ArrowRight,
  AlertCircle,
  FlaskConical,
  CheckCircle2,
  Building2,
  Tag,
  Phone,
  Briefcase,
} from 'lucide-react';
import { UserProgress } from '../types/banya';
import { useAuth } from '../firebase/AuthContext';
import { sendAdminMessage } from '../firebase/adminMessageService';
import { playWoodTap } from '../utils/audio';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  progress: UserProgress;
  onPurchaseSuccess?: (orderId: string) => void;
  onActivatePaidTier?: (orderId?: string) => Promise<void> | void;
  onOpenLegal?: (tab: 'offer' | 'privacy' | 'requisites') => void;
}

export const PricingModal: React.FC<PricingModalProps> = ({
  isOpen,
  onClose,
  progress,
  onOpenLegal,
}) => {
  const { user } = useAuth();
  const [selectedMethod, setSelectedMethod] = useState<'sbp' | 'card' | 'tpay'>('sbp');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Lead capture contact field for guests / buyers before redirecting to YooKassa
  const [buyerContact, setBuyerContact] = useState<string>(
    user?.email || user?.phoneNumber || ''
  );
  const [buyerName, setBuyerName] = useState<string>(
    user?.displayName || progress.name || ''
  );
  const [promoCodeInput, setPromoCodeInput] = useState<string>('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [promoMessage, setPromoMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (!buyerContact && (user?.email || user?.phoneNumber)) {
        setBuyerContact(user.email || user.phoneNumber || '');
      }
      if (!buyerName && (user?.displayName || progress.name)) {
        setBuyerName(user?.displayName || progress.name || '');
      }
    }
  }, [isOpen, user?.email, user?.phoneNumber, user?.displayName, progress.name]);

  if (!isOpen) return null;

  const isAlreadyPaid = Boolean(
    progress.isAdmin || progress.isPaid || progress.tariff === 'master_pro'
  );

  const basePrice = 3390;
  const finalPrice = appliedPromo ? 3050 : basePrice;

  const handleApplyPromo = () => {
    playWoodTap(progress.soundEnabled);
    const code = promoCodeInput.trim().toUpperCase();
    if (code === 'BATYA10' || code === 'PAR10' || code === 'BANYA10') {
      setAppliedPromo(code);
      setPromoMessage('Скидка 10% активирована: стоимость курса 3 050 ₽');
    } else {
      setAppliedPromo(null);
      setPromoMessage('Промокод не найден (подписчикам @BatyaVBane доступен код BATYA10)');
    }
  };

  const handleInitiatePayment = async (customAmount?: number) => {
    playWoodTap(progress.soundEnabled);
    setPaymentError(null);

    const amountToPay = customAmount || finalPrice;
    const trimmedContact = buyerContact.trim() || user?.email || user?.phoneNumber || '';
    const trimmedName =
      buyerName.trim() || user?.displayName || progress.name || 'Ученик курса';

    // Require contact for non-logged-in guests on full course payment so lead is never lost
    if (!customAmount && !trimmedContact) {
      setPaymentError(
        'Пожалуйста, укажите ваш телефон, @Telegram или Email для отправки чека и закрепления именного сертификата.'
      );
      return;
    }

    setIsProcessing(true);

    try {
      const orderId = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

      try {
        localStorage.setItem('banya_pending_order_id', orderId);
        if (trimmedContact) {
          localStorage.setItem('banya_buyer_contact', trimmedContact);
        }
      } catch {
        // ignore storage errors
      }

      // Immediately notify admin in Telegram (@ParmasterQuest_bot) with real buyer contact
      sendAdminMessage({
        type: 'payment_intent',
        userId: user?.uid || 'guest',
        userName: trimmedName,
        userEmail: trimmedContact || 'Контакт не указан',
        phoneNumber: trimmedContact,
        orderId,
        amount: amountToPay,
        message: `Ученик нажал кнопку оплаты (${amountToPay} ₽, метод: ${selectedMethod.toUpperCase()}${
          appliedPromo ? `, промокод: ${appliedPromo}` : ''
        }). Заказ: ${orderId}. Контакт: ${trimmedContact || 'не указан'}`,
      });

      const endpoints = [
        '/api/create-payment.php',
        '/www/banya-school.ru/api/create-payment.php',
        'https://banya-school.ru/api/create-payment.php',
        '/api/create-payment',
      ];

      let responseData: any = null;
      let lastError = 'Не удалось соединиться с платёжным шлюзом ЮKassa.';

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              orderId,
              amount: amountToPay,
              paymentMethod: selectedMethod,
              userEmail: trimmedContact.includes('@') && !trimmedContact.startsWith('@')
                ? trimmedContact
                : user?.email || 'student@banya-school.ru',
              userName: trimmedName,
              returnUrl: `${window.location.origin}/?payment_success=1&order_id=${orderId}`,
            }),
          });

          const text = await response.text();
          if (!text || text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
            continue;
          }

          const parsed = JSON.parse(text);
          if (parsed && parsed.confirmationUrl) {
            responseData = parsed;
            break;
          } else if (parsed && parsed.error) {
            lastError = parsed.error;
          }
        } catch {
          // try next candidate endpoint
        }
      }

      if (responseData && responseData.confirmationUrl) {
        window.location.href = responseData.confirmationUrl;
      } else {
        setPaymentError(lastError);
        setIsProcessing(false);
      }
    } catch {
      setPaymentError('Ошибка при инициализации платежа. Попробуйте ещё раз.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-md p-0 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-t-3xl sm:rounded-3xl border-t sm:border border-stone-800 bg-stone-950 shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col">
        {/* Mobile Swipe Handle */}
        <div className="w-12 h-1 bg-stone-700/80 rounded-full mx-auto mt-2.5 sm:hidden shrink-0" />

        {/* Header */}
        <div className="relative p-5 sm:p-7 border-b border-stone-800/80 bg-gradient-to-r from-stone-900 via-amber-950/30 to-stone-900 shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-amber-300 text-xs font-mono uppercase tracking-wider">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>Образовательная платформа «Пармастер Квест»</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-100">
                Выберите формат обучения
              </h2>
              <p className="text-xs sm:text-sm text-stone-400 max-w-xl">
                Откройте все 7 станций квеста, интерактивные тренажёры, проверку заданий и получите именной номерной Сертификат Пармейстера
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-stone-900/90 hover:bg-stone-800 text-stone-400 hover:text-stone-100 border border-stone-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-8 space-y-7 overflow-y-auto">
          {/* Status Banner if already paid */}
          {isAlreadyPaid && (
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-sm flex items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-emerald-100">
                    У вас активирован полный доступ «Мастер Пара PRO»
                  </h4>
                  <p className="text-xs text-emerald-300/80">
                    Все 7 станций квеста, симуляторы, аттестация и сертификат открыты без ограничений.
                  </p>
                </div>
              </div>
              <div className="text-xs font-mono px-3 py-1.5 rounded-lg bg-emerald-900/60 border border-emerald-500/40 font-semibold">
                VIP Доступ
              </div>
            </div>
          )}

          {/* HONEST MENTOR MANIFEST */}
          <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-br from-stone-950 via-amber-950/20 to-stone-950 p-5 sm:p-6 shadow-xl relative overflow-hidden">
            <div className="flex items-start gap-4 relative z-10">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-500/15 border border-amber-400/50 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
                <ShieldCheck className="w-6 h-6" />
              </div>

              <div className="space-y-2">
                <div className="text-[11px] font-mono uppercase font-bold text-amber-400 tracking-wider">
                  Честный манифест школы · Без иллюзий
                </div>

                <h4 className="font-serif text-base sm:text-lg font-bold text-stone-100">
                  Курс не сделает вас супер-мастером за один клик. И вот почему:
                </h4>

                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                  Ни один курс в мире и ни один банный гуру не сделает новичка великим мастером за несколько уроков. Настоящее мастерство нарабатывается исключительно{' '}
                  <strong>личным опытом, сотнями часов у полка и насмотренностью</strong>.
                </p>

                <p className="text-xs sm:text-sm text-amber-200/90 leading-relaxed font-medium">
                  Но нарабатывать опыт вслепую — значит учиться на сорванных спинах, ожогах близких и опасных обмороках. Этот курс даёт вам{' '}
                  <strong>железобетонный фундамент</strong>: биомеханику, физиологию пара и культуру безопасности. Вы входите в ремесло подготовленными, экономя годы слепых проб!
                </p>
              </div>
            </div>
          </div>

          {/* Pricing Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {/* Free Plan */}
            <div className="relative rounded-2xl border border-stone-800 bg-stone-900/50 p-6 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-3 text-xs font-mono text-stone-400">
                  <span className="uppercase tracking-wider">Стартовый тариф</span>
                  <span className="text-stone-300">Базовый доступ</span>
                </div>
                <h3 className="text-xl font-serif font-bold text-stone-200 mb-1">
                  Вольный Слушатель
                </h3>
                <p className="text-xs text-stone-400 mb-4">
                  Ознакомление с микроклиматом парной, церемонией первого пара и 8 приёмами веника
                </p>

                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-3xl font-serif font-bold text-stone-100 tabular-nums">
                    0 ₽
                  </span>
                  <span className="text-xs text-stone-500">бесплатно навсегда</span>
                </div>

                <div className="space-y-3 text-xs text-stone-300">
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Уровень 1: Вход в Банное Дело (Микроклимат и Первый пар)</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Уровень 2: Анатомия Пара и Веники (8 базовых приёмов)</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Интерактивный экзамен по печи и симулятор первого пара</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-stone-500">
                    <Lock className="w-4 h-4 text-stone-600 shrink-0" />
                    <span>Уровни 3–7 (Паровой пирог, Безопасность, Фитотека, ЧП, Сервис)</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-stone-500">
                    <Lock className="w-4 h-4 text-stone-600 shrink-0" />
                    <span>Финальная аттестация и Именной Сертификат с номером</span>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <button
                  onClick={onClose}
                  className="w-full py-2.5 px-4 rounded-xl border border-stone-700 bg-stone-800/80 hover:bg-stone-700 text-stone-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Продолжить на базовом тарифе
                </button>
              </div>
            </div>

            {/* Premium Paid Plan */}
            <div className="relative rounded-2xl border-2 border-amber-500/80 bg-gradient-to-b from-amber-950/40 via-stone-900 to-amber-950/20 p-6 flex flex-col justify-between shadow-xl ring-1 ring-amber-500/20">
              <div className="absolute -top-3.5 right-6 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 text-xs font-bold uppercase tracking-wider shadow-md flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 fill-stone-950" />
                <span>Полный курс</span>
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold">
                    Профессиональный тариф
                  </span>
                </div>
                <h3 className="text-xl font-serif font-bold text-amber-100 mb-1">
                  Мастер Пара PRO
                </h3>
                <p className="text-xs text-amber-200/80 mb-4">
                  Полная система подготовки пармастера от фундамента до именного диплома
                </p>

                <div className="flex items-baseline gap-2.5 mb-5">
                  <span className="text-3xl font-serif font-bold text-amber-300 tabular-nums">
                    {finalPrice.toLocaleString('ru-RU')} ₽
                  </span>
                  <span className="text-sm text-stone-500 line-through tabular-nums">
                    6 990 ₽
                  </span>
                  <span className="text-xs text-emerald-400 font-mono font-semibold">
                    {appliedPromo ? 'Скидка по промокоду' : 'Выгода 52%'}
                  </span>
                </div>

                <div className="space-y-2.5 text-xs text-stone-200">
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="font-semibold text-amber-100">
                      Все 7 станций квеста и закрытые сундуки знаний
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Полные видеоразборы техники веников и биомеханики</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Симулятор ЧП, первой помощи и диагностики гостя</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Полная «Фитотека Мастера» (30+ трав, запарок и противопоказаний)</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Award className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="font-bold text-amber-200">
                      Именной верифицированный Сертификат с номером
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Methods, Contact Capture, Promo Code & Action */}
              <div className="pt-5 space-y-3.5">
                {!isAlreadyPaid ? (
                  <>
                    {/* Buyer Contact Capture so lead is never anonymous */}
                    <div className="p-3 rounded-xl bg-stone-950/90 border border-stone-800 space-y-2">
                      <label className="text-[11px] font-mono text-amber-300/90 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>Ваш телефон, @Telegram или Email (для чека и диплома) *</span>
                      </label>
                      <input
                        type="text"
                        value={buyerContact}
                        onChange={(e) => setBuyerContact(e.target.value)}
                        placeholder="+7 (999) 000-00-00, @telegram или почта"
                        className="w-full px-3 py-2 rounded-lg bg-stone-900 border border-stone-700 text-xs text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    {/* Promo Code Input */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <Tag className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={promoCodeInput}
                            onChange={(e) => setPromoCodeInput(e.target.value)}
                            placeholder="Промокод (если есть)"
                            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-stone-950 border border-stone-800 text-xs text-stone-200 placeholder:text-stone-500 focus:outline-none focus:border-amber-500 font-mono uppercase"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleApplyPromo}
                          className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 border border-stone-700 text-xs text-stone-300 font-semibold cursor-pointer transition-colors"
                        >
                          Применить
                        </button>
                      </div>
                      {promoMessage && (
                        <p
                          className={`text-[11px] font-mono ${
                            appliedPromo ? 'text-emerald-400' : 'text-amber-300/80'
                          }`}
                        >
                          {promoMessage}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-mono text-stone-400 uppercase tracking-wide block">
                        Способ оплаты (ЮKassa):
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedMethod('sbp')}
                          className={`p-2 rounded-xl border text-center transition-all text-xs flex flex-col items-center justify-center gap-1 cursor-pointer ${
                            selectedMethod === 'sbp'
                              ? 'bg-amber-500/20 border-amber-500 text-amber-200 font-semibold ring-1 ring-amber-500/50'
                              : 'bg-stone-900 border-stone-800 text-stone-400 hover:border-stone-700'
                          }`}
                        >
                          <QrCode className="w-4 h-4" />
                          <span>СБП (0%)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedMethod('card')}
                          className={`p-2 rounded-xl border text-center transition-all text-xs flex flex-col items-center justify-center gap-1 cursor-pointer ${
                            selectedMethod === 'card'
                              ? 'bg-amber-500/20 border-amber-500 text-amber-200 font-semibold ring-1 ring-amber-500/50'
                              : 'bg-stone-900 border-stone-800 text-stone-400 hover:border-stone-700'
                          }`}
                        >
                          <CreditCard className="w-4 h-4" />
                          <span>Карта МИР</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedMethod('tpay')}
                          className={`p-2 rounded-xl border text-center transition-all text-xs flex flex-col items-center justify-center gap-1 cursor-pointer ${
                            selectedMethod === 'tpay'
                              ? 'bg-amber-500/20 border-amber-500 text-amber-200 font-semibold ring-1 ring-amber-500/50'
                              : 'bg-stone-900 border-stone-800 text-stone-400 hover:border-stone-700'
                          }`}
                        >
                          <Zap className="w-4 h-4" />
                          <span>Т-Пэй / Sber</span>
                        </button>
                      </div>
                    </div>

                    {paymentError && (
                      <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                        <span>{paymentError}</span>
                      </div>
                    )}

                    <button
                      onClick={() => handleInitiatePayment(finalPrice)}
                      disabled={isProcessing}
                      className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-bold text-sm transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                          Переход в ЮKassa...
                        </span>
                      ) : (
                        <>
                          <span>
                            Оплатить {finalPrice.toLocaleString('ru-RU')} ₽ через ЮKassa
                          </span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    {/* Test Payment Button (10 RUB) */}
                    <div className="pt-2 border-t border-stone-800/80">
                      <button
                        type="button"
                        onClick={() => handleInitiatePayment(10)}
                        disabled={isProcessing}
                        className="w-full py-2 px-4 rounded-xl bg-stone-900/90 hover:bg-stone-800 border border-amber-500/30 hover:border-amber-500/60 text-stone-300 hover:text-amber-200 text-xs font-mono transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-50"
                      >
                        <FlaskConical className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>Проверить эквайринг: тестовый платёж 10 ₽</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="w-full py-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-center font-bold text-xs">
                    Курс успешно оплачен и активен
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* CERTIFICATE VISUAL PREVIEW CARD */}
          <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-stone-900 via-stone-950 to-stone-900 p-5 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber-400">
                <Award className="w-4 h-4" />
                <span>Итоговый документ выпускника</span>
              </div>
              <h4 className="font-serif text-lg sm:text-xl font-bold text-stone-100">
                Как выглядит ваш Именной Сертификат Пармейстера
              </h4>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                После прохождения 7 станций и сдачи итогового теста формируется персональный диплом в высоком разрешении (для печати в рамку в парную или размещения в портфолио) с индивидуальным номером и подписью основателя школы Антона Ирхина.
              </p>
            </div>

            {/* Miniature Certificate Preview */}
            <div className="w-full md:w-72 shrink-0 rounded-xl border-2 border-amber-500/60 bg-gradient-to-br from-stone-950 via-amber-950/30 to-stone-950 p-4 shadow-2xl space-y-2.5 text-center relative">
              <div className="text-[9px] font-mono uppercase tracking-widest text-amber-400">
                Школа Банного Мастерства · banya-school.ru
              </div>
              <div className="font-serif text-sm font-bold text-amber-200 border-b border-amber-500/30 pb-1.5">
                СЕРТИФИКАТ ПАРМЕЙСТЕРА
              </div>
              <div className="text-xs font-serif font-bold text-stone-100 py-1">
                {buyerName || progress.name || 'Ваше Имя и Фамилия'}
              </div>
              <div className="text-[10px] text-stone-400 leading-tight">
                Успешно прошёл аттестацию по курсу «Пармастер Квест: Путь к Мастерству»
              </div>
              <div className="pt-2 flex items-center justify-between border-t border-stone-800 text-[9px] font-mono text-amber-300/90">
                <span>№ PQ-2026-PRO</span>
                <span>Наставник: А. Ирхин</span>
              </div>
            </div>
          </div>

          {/* B2B CORPORATE TRAINING BLOCK (INACTIVE / COMING SOON) */}
          <div className="rounded-2xl border border-stone-800 bg-stone-900/40 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 opacity-80">
            <div className="space-y-1 max-w-xl">
              <div className="flex items-center gap-2 text-xs font-mono text-stone-400">
                <Building2 className="w-3.5 h-3.5 text-amber-400/80" />
                <span>Корпоративный тариф B2B</span>
                <span>·</span>
                <span className="text-amber-400 font-semibold">В разработке (Скоро)</span>
              </div>
              <h4 className="font-serif text-base font-bold text-stone-200">
                Обучение и аттестация команд для банных и SPA-комплексов
              </h4>
              <p className="text-xs text-stone-400 leading-relaxed">
                Пакетное подключение от 3 до 20 пармастеров комплекса с контролем сдачи экзамена по безопасности и ПМП.
              </p>
            </div>

            <div className="shrink-0 flex flex-col items-stretch sm:items-end gap-2">
              <button
                type="button"
                disabled
                className="px-4 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-stone-500 font-mono text-xs font-semibold cursor-not-allowed flex items-center justify-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Скоро открытие B2B</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  setTimeout(() => {
                    document
                      .getElementById('partnerships-section')
                      ?.scrollIntoView({ behavior: 'smooth' });
                  }, 150);
                }}
                className="text-[11px] font-mono text-amber-400 hover:text-amber-300 underline flex items-center justify-center sm:justify-end gap-1 cursor-pointer"
              >
                <Briefcase className="w-3 h-3" />
                <span>Партнёрам и рекламодателям →</span>
              </button>
            </div>
          </div>

          {/* Legal and Compliance Guarantee block */}
          <div className="p-4 sm:p-5 rounded-2xl bg-stone-900/60 border border-stone-800 text-xs text-stone-300 space-y-3">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-stone-100 text-sm">
                  100% Легально и Безопасно для Самозанятых (НПД)
                </h4>
                <p className="text-stone-400 mt-1 leading-relaxed">
                  Продажа курса осуществляется в полном соответствии с Федеральным законом № 422-ФЗ. После проведения оплаты формируется электронный фискальный чек ФНС России (приложение «Мой налог»), который автоматически отправляется Заказчику.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-stone-800 text-[11px] text-stone-400">
              <div className="flex items-center gap-3">
                <span>Защита платежей по стандарту PCI DSS</span>
                <span>•</span>
                <span>Безопасная сделка ЮKassa</span>
              </div>
              <div className="flex items-center gap-3">
                {onOpenLegal && (
                  <>
                    <button
                      onClick={() => onOpenLegal('offer')}
                      className="text-amber-400 hover:underline cursor-pointer"
                    >
                      Публичная оферта
                    </button>
                    <span>•</span>
                    <button
                      onClick={() => onOpenLegal('privacy')}
                      className="text-amber-400 hover:underline cursor-pointer"
                    >
                      Политика конфиденциальности
                    </button>
                    <span>•</span>
                    <button
                      onClick={() => onOpenLegal('requisites')}
                      className="text-amber-400 hover:underline cursor-pointer"
                    >
                      Реквизиты
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
