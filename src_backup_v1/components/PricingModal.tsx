import React, { useState } from 'react';
import {
  X,
  Check,
  Sparkles,
  ShieldCheck,
  CreditCard,
  QrCode,
  Zap,
  Award,
  BookOpen,
  Lock,
  ArrowRight,
  Flame,
  HelpCircle,
  FileText,
} from 'lucide-react';
import { useAuth } from '../firebase/AuthContext';
import { UserProgress } from '../types/banya';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  progress: UserProgress;
  onActivatePaidTier: (orderId?: string) => Promise<void>;
  onOpenLegal?: (tab: 'offer' | 'privacy' | 'requisites') => void;
}

export const PricingModal: React.FC<PricingModalProps> = ({
  isOpen,
  onClose,
  progress,
  onActivatePaidTier,
  onOpenLegal,
}) => {
  const { user } = useAuth();
  const [selectedMethod, setSelectedMethod] = useState<'sbp' | 'card' | 'tpay'>('sbp');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [showDemoNotification, setShowDemoNotification] = useState<boolean>(false);

  if (!isOpen) return null;

  const isAlreadyPaid = progress.isPaid || progress.tariff === 'master_pro';

  const handleSimulatePayment = async () => {
    setIsProcessing(true);
    try {
      const demoOrderId = `ORDER-${Math.floor(100000 + Math.random() * 900000)}`;
      await onActivatePaidTier(demoOrderId);
      setShowDemoNotification(true);
      setTimeout(() => {
        setShowDemoNotification(false);
        onClose();
      }, 2000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl rounded-3xl border border-amber-600/40 bg-stone-950 text-stone-100 shadow-2xl overflow-hidden flex flex-col my-auto max-h-[94vh]">
        
        {/* Header */}
        <div className="relative bg-gradient-to-r from-amber-950/80 via-stone-900 to-amber-950/80 border-b border-stone-800 p-5 sm:p-6 shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-stone-900/80 hover:bg-stone-800 text-stone-400 hover:text-stone-100 transition-colors border border-stone-700/60"
            title="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-2xl shrink-0 shadow-inner">
              👑
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-mono uppercase tracking-wider mb-1">
                <span>Официальный онлайн-курс</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-amber-100">
                Тарифы Обучения и Доступ к Курсу
              </h2>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-8 space-y-8 overflow-y-auto">
          
          {/* Status Banner if already paid */}
          {isAlreadyPaid && (
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-sm flex items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-xl shrink-0">
                  ✅
                </div>
                <div>
                  <h4 className="font-bold text-emerald-100">У вас активирован полный доступ «Мастер Пара PRO»</h4>
                  <p className="text-xs text-emerald-300/80">Все 7 станций квеста, симуляторы, аттестация и сертификат открыты без ограничений.</p>
                </div>
              </div>
              <div className="text-xs font-mono px-3 py-1.5 rounded-lg bg-emerald-900/60 border border-emerald-500/40 font-semibold">
                VIP Доступ
              </div>
            </div>
          )}

          {/* Pricing Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            
            {/* Free Plan */}
            <div className="relative rounded-2xl border border-stone-800 bg-stone-900/50 p-6 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-mono uppercase tracking-wider text-stone-400">
                    Стартовый тариф
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-stone-800 text-stone-300 text-xs font-medium">
                    Базовый
                  </span>
                </div>
                <h3 className="text-xl font-serif font-bold text-stone-200 mb-1">
                  Вольный Слушатель
                </h3>
                <p className="text-xs text-stone-400 mb-4">
                  Ознакомление с основами банной традиции и микроклиматом
                </p>

                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-3xl font-serif font-bold text-stone-100">0 ₽</span>
                  <span className="text-xs text-stone-500">бесплатно навсегда</span>
                </div>

                <div className="space-y-3 text-xs text-stone-300">
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Уровень 1: Анатомия Русской Бани</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Уровень 2: Банная Гигиена и Безопасность</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Базовый симулятор микроклимата</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-stone-500">
                    <Lock className="w-4 h-4 text-stone-600 shrink-0" />
                    <span>Уровни 3–7 (Веники, Травы, ЧП, Мастерство)</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-stone-500">
                    <Lock className="w-4 h-4 text-stone-600 shrink-0" />
                    <span>Итоговый экзамен и Именной Сертификат</span>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <button
                  onClick={onClose}
                  className="w-full py-2.5 px-4 rounded-xl border border-stone-700 bg-stone-800/80 hover:bg-stone-700 text-stone-300 text-xs font-semibold transition-colors"
                >
                  Текущий базовый доступ
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
                  Полная подготовка профессионального пармастера под ключ
                </p>

                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-3xl font-serif font-bold text-amber-300">2 990 ₽</span>
                  <span className="text-sm text-stone-500 line-through">5 990 ₽</span>
                  <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    -50%
                  </span>
                </div>

                <div className="space-y-3 text-xs text-stone-200">
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="font-semibold text-amber-100">Все 7 станций квеста без ограничений</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Тренажер работы вениками и ритмики</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Симулятор первой помощи и ЧП в парной</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Атлас ароматерапии, трав и запарок</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Award className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="font-bold text-amber-200">
                      Именной верифицированный Сертификат с номером
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Бессрочный доступ к обновлениям</span>
                  </div>
                </div>
              </div>

              {/* Payment Methods and Action */}
              <div className="pt-6 space-y-4">
                {!isAlreadyPaid ? (
                  <>
                    <div className="space-y-2">
                      <label className="text-[11px] font-mono text-stone-400 uppercase tracking-wide block">
                        Выберите удобный способ оплаты:
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

                    <button
                      onClick={handleSimulatePayment}
                      disabled={isProcessing}
                      className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-bold text-sm transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <span>Обработка платежа...</span>
                      ) : (
                        <>
                          <span>Оплатить 2 990 ₽ и открыть курс</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  <div className="w-full py-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-center font-bold text-xs">
                    ✓ Курс успешно оплачен и активен
                  </div>
                )}
              </div>
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
                  Продажа курса осуществляется в полном соответствии с Федеральным законом № 422-ФЗ. После проведения оплаты формируется электронный фискальный чек ФНС России (приложение «Мой налог»), который автоматически отправляется на ваш e-mail.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-stone-800 text-[11px] text-stone-400">
              <div className="flex items-center gap-3">
                <span>🔒 Защита платежей по стандарту PCI DSS</span>
                <span>•</span>
                <span>Безопасная сделка</span>
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

          {/* Demo Success Toast */}
          {showDemoNotification && (
            <div className="p-4 rounded-xl bg-emerald-600 text-white font-bold text-sm text-center animate-bounce">
              🎉 Оплата успешно подтверждена! Курс «Мастер Пара PRO» разблокирован.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
