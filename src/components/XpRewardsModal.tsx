import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Gift,
  ShoppingBag,
  Share2,
  Send,
  Copy,
  Check,
  Unlock,
  Lock,
  CheckCircle2,
  ArrowRight,
  Flame,
  Award,
  Coins,
  Tag,
  Users,
  BookOpen,
  Crown,
} from 'lucide-react';
import { UserProgress, XpPerkId } from '../types/banya';
import { playWoodTap, playSuccessChime } from '../utils/audio';

interface XpRewardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  progress: UserProgress;
  onUpdateProgress: (updated: Partial<UserProgress>) => void;
  onOpenPricing: () => void;
  onStartFreeQuest: () => void;
}

interface XpShopOffer {
  id: XpPerkId;
  tier: 'novice' | 'pro';
  category: 'discount' | 'feature' | 'merch';
  stepNumber: number;
  title: string;
  subtitle: string;
  description: string;
  costXp: number;
  discountRub?: number;
  discountPercent?: string;
  finalCoursePrice?: string;
  badgeText: string;
  icon: string;
  secretBonusContent?: string[];
}

const XP_SHOP_OFFERS: XpShopOffer[] = [
  {
    id: 'course_discount_250',
    tier: 'novice',
    category: 'discount',
    stepNumber: 1,
    title: 'Бонус №1: Купон «Базовый Прогрев» -250 ₽',
    subtitle: 'Для тех, кто прошёл 1 и 2 уровни (собраны не все секретные XP)',
    description:
      'Доступен сразу после сдачи базовых тестов первых двух уровней (150 + 200 = 350 XP). Снижает стоимость курса «Мастер Пара PRO» на 7.4% — с 3 390 ₽ до 3 140 ₽.',
    costXp: 350,
    discountRub: 250,
    discountPercent: '-7.4%',
    finalCoursePrice: '3 140 ₽',
    badgeText: 'Доступно новичкам · -250 ₽',
    icon: '🎟️',
  },
  {
    id: 'course_discount_500',
    tier: 'novice',
    category: 'discount',
    stepNumber: 2,
    title: 'Бонус №2: Золотой Купон «100% Базы» -500 ₽',
    subtitle: 'Максимальная скидка за сбор всех XP на 1 и 2 уровнях!',
    description:
      'Для внимательных учеников, которые не просто сдали тесты (350 XP), но и прошли экзамен печи за Нефрит (+150 XP), изучили все 8 приёмов вениками (+120 XP) и нашли Золотой Ключ (+50 XP). Пробивает порог 3 000 ₽: цена курса составит 2 890 ₽ вместо 3 390 ₽!',
    costXp: 600,
    discountRub: 500,
    discountPercent: '-14.7%',
    finalCoursePrice: '2 890 ₽',
    badgeText: 'Максимум для новичков · -500 ₽',
    icon: '🔥',
  },
  {
    id: 'bonus_recipes_pack',
    tier: 'pro',
    category: 'feature',
    stepNumber: 3,
    title: 'Бонус №3 (PRO): Свиток «5 Царских Запарок Бати»',
    subtitle: 'Закрытая шпаргалка с точными граммовками трав для учеников курса',
    description:
      'Доступно ученикам тарифа «Мастер Пара PRO» за XP, заработанные на Уровнях 3–7. Открывает 5 фирменных рецептов фито-сборов Антона Ирхина (для глубокого сна, после спорта, бронхо-щит, медовый детокс и антистресс).',
    costXp: 300,
    badgeText: 'Только для PRO',
    icon: '📜',
    secretBonusContent: [
      '1. «Сон Младенца»: Донник жёлтый (40%) + Таволга (30%) + Мелисса (30%). Запаривать при 65°C 20 минут, подавать только на стены.',
      '2. «Таёжный Бронхо-Щит»: Пихта сибирская (50%) + Эвкалипт прутовидный (30%) + Чабрец (20%). Уложить пихту под лицо на лёд.',
      '3. «Степная Перезагрузка»: Полынь таврическая (50%) + Шалфей (30%) + Мята перечная (20%). Снимает мигрень и спазм сосудов за 5 минут.',
      '4. «Богатырское Восстановление (после тренировок)»: Берёзовый лист (50%) + Крапива двудомная (30%) + Зверобой (20%). Выводит молочную кислоту.',
      '5. «Царский Медовый Пар»: Липовый цвет (50%) + Ромашка аптечная (30%) + Донник (20%). Идеально для семейной и детской бани.',
    ],
  },
  {
    id: 'shop_voucher_500',
    tier: 'pro',
    category: 'merch',
    stepNumber: 4,
    title: 'Бонус №4 (PRO): Сертификат -500 ₽ в «Банную Лавку»',
    subtitle: 'На заказ веников, дикоросов, шапок и черпаков (от 2 500 ₽)',
    description:
      'Привилегия учеников полного курса: обменяйте 500 XP, заработанных на уровнях 3–7, на живую скидку 500 ₽ при заказе связок кавказского дуба, сибирской пихты, таврической полыни и профессиональных шапок в нашем интернет-магазине.',
    costXp: 500,
    badgeText: 'Только для PRO · Лавка',
    icon: '🛍️',
  },
  {
    id: 'pro_gift_1000',
    tier: 'pro',
    category: 'merch',
    stepNumber: 5,
    title: 'Бонус №5 (PRO): VIP-Купон -1 000 ₽ на «Курс в Подарок»',
    subtitle: 'Подарите обучение близкому человеку или напарнику по парной',
    description:
      'Высшая награда для выпускников курса (Уровни 3–7): обменяйте 800 XP на именной подарочный сертификат со скидкой 1 000 ₽ для друга, брата или супруги.',
    costXp: 800,
    badgeText: 'Только для PRO · VIP',
    icon: '👑',
  },
];

const UPCOMING_SHOP_PREVIEW = [
  {
    name: 'Набор веников «Кавказский Дуб + Сибирская Пихта» (5 пар)',
    price: '2 490 ₽',
    xpDiscount: 'Купон -500 ₽ за XP (PRO)',
    icon: '🍃',
  },
  {
    name: 'Крафтовый бокс дикоросов (Полынь, Донник, Таволга, Чабрец)',
    price: '1 890 ₽',
    xpDiscount: 'Оплата до 20% баллами XP',
    icon: '🌿',
  },
  {
    name: 'Профессиональный колпак пармастера (100% овечья шерсть)',
    price: '2 290 ₽',
    xpDiscount: 'Оплата до 20% баллами XP',
    icon: '🎩',
  },
  {
    name: 'Кованый медный черпак с длинной деревянной рукоятью',
    price: '3 490 ₽',
    xpDiscount: 'Купон -500 ₽ за XP (PRO)',
    icon: '🥄',
  },
];

export const XpRewardsModal: React.FC<XpRewardsModalProps> = ({
  isOpen,
  onClose,
  progress,
  onUpdateProgress,
  onOpenPricing,
  onStartFreeQuest,
}) => {
  const [activeTab, setActiveTab] = useState<'redeem' | 'earn' | 'merch'>('redeem');
  const [copiedRef, setCopiedRef] = useState(false);
  const [statusToast, setStatusToast] = useState<string | null>(null);

  if (!isOpen) return null;

  const isMasterPro = Boolean(
    progress.isAdmin || progress.isPaid || progress.tariff === 'master_pro'
  );
  const totalXp = progress.xp || 0;
  const spentXp = progress.spentXp || 0;
  const availableXp = Math.max(0, totalXp - spentXp);
  const unlockedPerks: XpPerkId[] = progress.unlockedPerks || [];
  const currentDiscount = progress.xpDiscountRub || 0;
  const referralShares = progress.referralShareCount || 0;

  // Generate clean referral link
  const referralCode = (progress.name || 'master')
    .toLowerCase()
    .replace(/[^a-zа-яё0-9]/gi, '')
    .slice(0, 10) || 'banya';
  const referralUrl = `https://banya-school.ru/?ref=${encodeURIComponent(referralCode)}`;

  const hasDiscount250 =
    unlockedPerks.includes('course_discount_250') ||
    unlockedPerks.includes('course_discount_300') ||
    currentDiscount >= 250;
  const hasDiscount500 =
    unlockedPerks.includes('course_discount_500') ||
    unlockedPerks.includes('course_discount_800') ||
    currentDiscount >= 500;

  const handleRedeemOffer = (offer: XpShopOffer) => {
    playWoodTap(progress.soundEnabled);

    // Block PRO perks for unpaid novices
    if (offer.tier === 'pro' && !isMasterPro) {
      setStatusToast(
        '🔒 Бонусы №3–5 доступны только ученикам полного курса «Мастер Пара PRO». Новичкам доступны Бонус №1 (-250 ₽) и Бонус №2 (-500 ₽) для выгодной покупки курса!'
      );
      return;
    }

    if (unlockedPerks.includes(offer.id)) {
      if (offer.category === 'discount') {
        onClose();
        onOpenPricing();
      }
      return;
    }

    // Special upgrade math: if user already redeemed Bonus #1 (350 XP -> -250 ₽)
    // and now wants to upgrade to Bonus #2 (600 XP -> -500 ₽), they only pay the 250 XP difference!
    const isUpgradingFrom250To500 =
      offer.id === 'course_discount_500' && hasDiscount250 && !hasDiscount500;
    const effectiveCostXp = isUpgradingFrom250To500 ? 250 : offer.costXp;

    if (availableXp < effectiveCostXp) {
      const missing = effectiveCostXp - availableXp;
      setStatusToast(
        `Не хватает ещё ${missing} XP! Допройдите задания на 1–2 уровнях (печь, 8 приёмов, Золотой Ключ) или поделитесь квестом с другом.`
      );
      return;
    }

    playSuccessChime(progress.soundEnabled);
    const nextPerks: XpPerkId[] = [...unlockedPerks, offer.id];
    const nextSpent = spentXp + effectiveCostXp;
    const nextDiscount = offer.discountRub
      ? Math.max(currentDiscount, offer.discountRub)
      : currentDiscount;

    onUpdateProgress({
      spentXp: nextSpent,
      unlockedPerks: nextPerks,
      xpDiscountRub: nextDiscount,
    });

    if (offer.discountRub) {
      setStatusToast(
        `🎉 Купон на скидку -${offer.discountRub} ₽ активирован! Цена курса снижена до ${
          3390 - nextDiscount
        } ₽.`
      );
    } else {
      setStatusToast(`🎉 Бонус «${offer.title}» успешно разблокирован!`);
    }
  };

  const handleShareReferral = (platform: 'tg' | 'vk' | 'copy') => {
    playWoodTap(progress.soundEnabled);
    const shareText =
      '🔥 Прохожу интерактивный квест «Русская Баня: Мастер Пара»! Первые 2 уровня и справочник трав и веников — бесплатно. Заходи, получишь +50 XP на старте:';

    if (platform === 'tg') {
      window.open(
        `https://t.me/share/url?url=${encodeURIComponent(referralUrl)}&text=${encodeURIComponent(shareText)}`,
        '_blank',
        'noopener,noreferrer'
      );
    } else if (platform === 'vk') {
      window.open(
        `https://vk.com/share.php?url=${encodeURIComponent(referralUrl)}&title=${encodeURIComponent(shareText)}`,
        '_blank',
        'noopener,noreferrer'
      );
    } else {
      navigator.clipboard?.writeText(referralUrl).catch(() => {});
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2500);
    }

    // Grant +50 XP for sharing (up to 2 times = +100 XP max so referrals help top up, but can't bypass playing the levels)
    if (referralShares < 2) {
      setTimeout(() => {
        playSuccessChime(progress.soundEnabled);
        onUpdateProgress({
          xp: totalXp + 50,
          referralShareCount: referralShares + 1,
          referralCount: (progress.referralCount || 0) + 1,
        });
        setStatusToast(
          '✨ Начислено +50 XP за рекомендацию другу! Спасибо за развитие банной культуры.'
        );
      }, 800);
    } else {
      setStatusToast('Ссылка скопирована! Делитесь с друзьями — каждому другу +50 XP на старте.');
    }
  };

  // Progress bar calculation for Novice towards the 2 bonuses (350 XP and 600 XP)
  const noviceProgressPercent = Math.min(100, Math.round((totalXp / 600) * 100));
  const isLevel1Done = (progress.completedLevels || []).includes(1);
  const isLevel2Done = (progress.completedLevels || []).includes(2);
  const hasJadeBadge = (progress.unlockedBadges || []).includes('stove_jade');
  const hasGoldenKey = (progress.unlockedBadges || []).includes('golden_key');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-4xl my-auto max-h-[92vh] flex flex-col rounded-3xl bg-gradient-to-b from-stone-900 via-stone-950 to-stone-900 border-2 border-amber-500/40 shadow-[0_25px_80px_rgba(0,0,0,0.9)] overflow-hidden">
        {/* Top Header */}
        <div className="p-5 sm:p-6 border-b border-stone-800 bg-stone-900/95 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 text-stone-950 flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
              <Coins className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                  Банк Опыта & Привилегии
                </span>
                {currentDiscount > 0 && (
                  <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-300 font-bold bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                    Активна скидка -{currentDiscount} ₽
                  </span>
                )}
              </div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-100 mt-1">
                Обменивайте знания (XP) на живую выгоду
              </h2>
            </div>
          </div>

          {/* Balance Card + Close */}
          <div className="flex items-center justify-between sm:justify-end gap-3">
            <div className="px-4 py-2 rounded-2xl bg-stone-950 border border-amber-500/40 flex items-center gap-3 shadow-inner">
              <div>
                <div className="text-[10px] font-mono uppercase text-stone-400">Доступный баланс</div>
                <div className="text-lg sm:text-xl font-serif font-bold text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>{availableXp} XP</span>
                </div>
              </div>
              {spentXp > 0 && (
                <div className="pl-3 border-l border-stone-800 text-[10px] font-mono text-stone-500">
                  Всего: {totalXp} XP
                  <br />
                  Вложено: {spentXp} XP
                </div>
              )}
            </div>

            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-stone-800/80 hover:bg-stone-800 text-stone-400 hover:text-stone-100 border border-stone-700 transition-colors cursor-pointer"
              title="Закрыть"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-5 sm:px-6 pt-3 bg-stone-950/80 border-b border-stone-800 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              playWoodTap(progress.soundEnabled);
              setActiveTab('redeem');
            }}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer border-b-2 ${
              activeTab === 'redeem'
                ? 'bg-amber-500/15 text-amber-300 border-amber-400'
                : 'text-stone-400 hover:text-stone-200 border-transparent'
            }`}
          >
            <Gift className="w-4 h-4" />
            <span>1. Бонусы за XP (Новичок и PRO)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playWoodTap(progress.soundEnabled);
              setActiveTab('earn');
            }}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer border-b-2 ${
              activeTab === 'earn'
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-400'
                : 'text-stone-400 hover:text-stone-200 border-transparent'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>2. Как набрать 600 XP на 1–2 уровнях</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playWoodTap(progress.soundEnabled);
              setActiveTab('merch');
            }}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer border-b-2 ${
              activeTab === 'merch'
                ? 'bg-sky-500/15 text-sky-300 border-sky-400'
                : 'text-stone-400 hover:text-stone-200 border-transparent'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>3. Банная Лавка (Товары за XP)</span>
          </button>
        </div>

        {/* Status Toast */}
        {statusToast && (
          <div className="mx-5 sm:mx-6 mt-4 p-3.5 rounded-2xl bg-amber-500/15 border border-amber-400/50 text-amber-200 text-xs sm:text-sm font-medium flex items-center justify-between gap-3 animate-fadeIn">
            <span>{statusToast}</span>
            <button
              onClick={() => setStatusToast(null)}
              className="text-amber-300 hover:text-white text-xs font-mono underline shrink-0 cursor-pointer"
            >
              Понятно
            </button>
          </div>
        )}

        {/* Modal Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'redeem' && (
            <div className="space-y-6">
              {/* Visual Progress Bar for Novice 2-Step Funnel */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-stone-900 via-stone-950 to-stone-900 border border-amber-500/30 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                      Шкала вашей выгоды за первые 2 бесплатных уровня (максимум 670 XP)
                    </span>
                    <h3 className="text-sm sm:text-base font-serif font-bold text-stone-100 mt-0.5">
                      {totalXp < 350
                        ? `Соберите ещё ${350 - totalXp} XP до первой скидки -250 ₽ (или ${600 - totalXp} XP до максимальной -500 ₽)`
                        : totalXp < 600
                        ? `Бонус №1 (-250 ₽) открыт! Доберите ещё ${600 - totalXp} XP за секреты 1–2 уровня, чтобы удвоить скидку до -500 ₽!`
                        : 'Поздравляем! Вы собрали максимум XP за 2 уровня — вам доступен Золотой Купон -500 ₽ (курс за 2 890 ₽)!'}
                    </h3>
                  </div>
                  <span className="px-3 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono text-xs font-bold shrink-0">
                    Собрано: {totalXp} / 600 XP
                  </span>
                </div>

                {/* Progress Bar with 350 XP and 600 XP milestones */}
                <div className="relative pt-2 pb-1">
                  <div className="w-full h-3 rounded-full bg-stone-800 overflow-hidden border border-stone-700">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 transition-all duration-500"
                      style={{ width: `${noviceProgressPercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-stone-400 mt-1.5">
                    <span>0 XP (Старт)</span>
                    <span className={totalXp >= 350 ? 'text-amber-300 font-bold' : ''}>
                      🎯 350 XP · Бонус №1 (-250 ₽ → 3 140 ₽)
                    </span>
                    <span className={totalXp >= 600 ? 'text-emerald-300 font-bold' : ''}>
                      🔥 600 XP · Бонус №2 (-500 ₽ → 2 890 ₽)
                    </span>
                  </div>
                </div>
              </div>

              {/* SECTION 1: FIRST 2 BONUSES AVAILABLE TO NOVICES */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-mono font-bold uppercase">
                      Доступно новичкам (Уровни 1–2)
                    </span>
                    <h4 className="font-serif text-base sm:text-lg font-bold text-stone-100">
                      Первые 2 бонуса: Конвертация XP в скидку на основной курс
                    </h4>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {XP_SHOP_OFFERS.filter((o) => o.tier === 'novice').map((offer) => {
                    const isUnlocked =
                      unlockedPerks.includes(offer.id) ||
                      (offer.id === 'course_discount_250' && hasDiscount250) ||
                      (offer.id === 'course_discount_500' && hasDiscount500);
                    const isUpgradingFrom250To500 =
                      offer.id === 'course_discount_500' && hasDiscount250 && !hasDiscount500;
                    const effectiveCostXp = isUpgradingFrom250To500 ? 250 : offer.costXp;
                    const canAfford = availableXp >= effectiveCostXp;

                    return (
                      <div
                        key={offer.id}
                        className={`rounded-2xl border p-5 flex flex-col justify-between gap-4 transition-all relative overflow-hidden ${
                          isUnlocked
                            ? 'bg-emerald-950/25 border-emerald-500/50 shadow-lg'
                            : canAfford
                            ? 'bg-stone-900/95 border-amber-500/50 hover:border-amber-400 shadow-lg'
                            : 'bg-stone-950/80 border-stone-800/90 opacity-90'
                        }`}
                      >
                        <div className="space-y-2.5">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <span className="text-2xl">{offer.icon}</span>
                              <div>
                                <span
                                  className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full font-bold border ${
                                    isUnlocked
                                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                      : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                                  }`}
                                >
                                  {offer.badgeText}
                                </span>
                                <h3 className="font-serif font-bold text-base sm:text-lg text-stone-100 mt-1">
                                  {offer.title}
                                </h3>
                              </div>
                            </div>

                            <div className="px-2.5 py-1 rounded-xl bg-stone-950 border border-stone-800 font-mono text-xs font-bold text-amber-300 shrink-0">
                              {isUpgradingFrom250To500
                                ? `+250 XP доплата`
                                : `${offer.costXp} XP`}
                            </div>
                          </div>

                          <p className="text-xs font-medium text-amber-200/90">{offer.subtitle}</p>
                          <p className="text-xs text-stone-400 leading-relaxed">
                            {offer.description}
                          </p>

                          {/* Price Comparison Pill */}
                          <div className="p-3 rounded-xl bg-stone-950/90 border border-stone-800 flex items-center justify-between text-xs">
                            <span className="text-stone-400">Цена курса для вас:</span>
                            <div className="flex items-center gap-2">
                              <span className="text-stone-500 line-through font-mono">3 390 ₽</span>
                              <span className="text-sm font-serif font-bold text-emerald-400">
                                {offer.finalCoursePrice}
                              </span>
                              <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 font-mono text-[10px] font-bold">
                                {offer.discountPercent}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between gap-2">
                          {isUnlocked ? (
                            <button
                              type="button"
                              onClick={() => {
                                onClose();
                                onOpenPricing();
                              }}
                              className="w-full py-2.5 px-4 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Купон активен · Перейти к оплате ({3390 - currentDiscount} ₽) →</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleRedeemOffer(offer)}
                              className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                                canAfford
                                  ? 'bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-stone-950 shadow-md shadow-amber-500/20 active:scale-95'
                                  : 'bg-stone-900 hover:bg-stone-800 text-stone-400 border border-stone-800'
                              }`}
                            >
                              <Unlock className="w-4 h-4" />
                              <span>
                                {canAfford
                                  ? isUpgradingFrom250To500
                                    ? 'Улучшить скидку до -500 ₽ (за 250 XP)'
                                    : `Обменять ${offer.costXp} XP на скидку -${offer.discountRub} ₽`
                                  : `Нужно ещё ${effectiveCostXp - availableXp} XP (К заданиям 1–2 ур.)`}
                              </span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 2: BONUSES 3-5 LOCKED FOR NOVICES (PRO ONLY) */}
              <div className="space-y-3 pt-2 border-t border-stone-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-mono font-bold uppercase flex items-center gap-1">
                      <Crown className="w-3 h-3" />
                      <span>Привилегии Учеников PRO (Уровни 3–7)</span>
                    </span>
                    <h4 className="font-serif text-base sm:text-lg font-bold text-stone-100">
                      Куда тратить XP после покупки курса (на Уровнях 3–7 вы заработаете ещё +1 400 XP!)
                    </h4>
                  </div>
                  {!isMasterPro && (
                    <span className="text-[11px] font-mono text-stone-400 flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Откроются сразу после покупки курса</span>
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {XP_SHOP_OFFERS.filter((o) => o.tier === 'pro').map((offer) => {
                    const isUnlocked = unlockedPerks.includes(offer.id);
                    const canAfford = isMasterPro && availableXp >= offer.costXp;

                    return (
                      <div
                        key={offer.id}
                        className={`rounded-2xl border p-4 flex flex-col justify-between gap-3 transition-all relative ${
                          isUnlocked
                            ? 'bg-emerald-950/25 border-emerald-500/50'
                            : isMasterPro
                            ? 'bg-stone-900/90 border-amber-500/40'
                            : 'bg-stone-950/90 border-stone-800/80'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-2xl">{offer.icon}</span>
                            <span className="px-2 py-0.5 rounded-lg bg-stone-900 border border-stone-800 font-mono text-[11px] font-bold text-amber-300">
                              {offer.costXp} XP
                            </span>
                          </div>

                          <div className="text-[10px] font-mono uppercase text-amber-400 font-bold">
                            {offer.badgeText}
                          </div>
                          <h3 className="font-serif font-bold text-sm sm:text-base text-stone-100">
                            {offer.title}
                          </h3>
                          <p className="text-xs text-stone-400 leading-relaxed">
                            {offer.description}
                          </p>

                          {isUnlocked && offer.secretBonusContent && (
                            <div className="mt-2 p-3 rounded-xl bg-stone-950 border border-emerald-500/40 space-y-1.5 text-xs text-stone-200">
                              <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                                <BookOpen className="w-3.5 h-3.5" />
                                <span>Ваши 5 Царских Запарок:</span>
                              </div>
                              {offer.secretBonusContent.map((line, i) => (
                                <p key={i} className="text-[11px] text-stone-300 leading-relaxed">
                                  {line}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="pt-2 border-t border-stone-800/80">
                          {!isMasterPro ? (
                            <button
                              type="button"
                              onClick={() => {
                                onClose();
                                onOpenPricing();
                              }}
                              className="w-full py-2 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-amber-300/90 border border-amber-500/30 font-semibold text-[11px] flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                            >
                              <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              <span>Доступно после покупки PRO →</span>
                            </button>
                          ) : isUnlocked ? (
                            <div className="w-full py-2 px-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-[11px] text-center">
                              ✓ Разблокировано
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleRedeemOffer(offer)}
                              className={`w-full py-2 px-3 rounded-xl font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer ${
                                canAfford
                                  ? 'bg-amber-500 hover:bg-amber-400 text-stone-950'
                                  : 'bg-stone-900 text-stone-400 border border-stone-800'
                              }`}
                            >
                              <Unlock className="w-3.5 h-3.5" />
                              <span>Обменять за {offer.costXp} XP</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'earn' && (
            <div className="space-y-6">
              {/* Interactive Checklist of Free Level 1 & 2 XP Sources */}
              <div className="rounded-2xl border border-amber-500/40 bg-stone-900/90 p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-800 pb-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                      Чек-лист новичка · Как собрать все 670 XP на Уровнях 1 и 2
                    </span>
                    <h4 className="font-serif font-bold text-stone-100 text-base sm:text-lg mt-0.5">
                      Где лежат ваши баллы для максимальной скидки -500 ₽:
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onStartFreeQuest();
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shrink-0"
                  >
                    Перейти к Уровням 1–2 →
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div
                    className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                      isLevel1Done
                        ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                        : 'bg-stone-950 border-stone-800 text-stone-300'
                    }`}
                  >
                    <div>
                      <div className="font-bold">1. Проверочный тест Уровня 1</div>
                      <div className="text-[11px] text-stone-400">Основы первого пара и микроклимата</div>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-300 font-mono font-bold shrink-0">
                      {isLevel1Done ? '✓ +150 XP' : '+150 XP'}
                    </span>
                  </div>

                  <div
                    className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                      hasJadeBadge
                        ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                        : 'bg-stone-950 border-stone-800 text-stone-300'
                    }`}
                  >
                    <div>
                      <div className="font-bold">2. Симулятор Печи + Экзамен Печника</div>
                      <div className="text-[11px] text-stone-400">
                        Кнопка «Анатомия печи в разрезе» на 1-м уровне (Артефакт Нефрит)
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-300 font-mono font-bold shrink-0">
                      {hasJadeBadge ? '✓ +150 XP' : '+150 XP'}
                    </span>
                  </div>

                  <div
                    className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                      isLevel2Done
                        ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                        : 'bg-stone-950 border-stone-800 text-stone-300'
                    }`}
                  >
                    <div>
                      <div className="font-bold">3. Проверочный тест Уровня 2</div>
                      <div className="text-[11px] text-stone-400">Техника венечного массажа и безопасность</div>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-300 font-mono font-bold shrink-0">
                      {isLevel2Done ? '✓ +200 XP' : '+200 XP'}
                    </span>
                  </div>

                  <div
                    className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                      hasGoldenKey
                        ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                        : 'bg-stone-950 border-stone-800 text-stone-300'
                    }`}
                  >
                    <div>
                      <div className="font-bold">4. Все 8 видео-приёмов + Золотой Ключ</div>
                      <div className="text-[11px] text-stone-400">
                        По +15 XP за каждый приём (120 XP) + Золотой Ключ в «Вибрациях» (+50 XP)
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-300 font-mono font-bold shrink-0">
                      {hasGoldenKey ? '✓ +170 XP' : '+170 XP'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Referral Block */}
              <div className="rounded-2xl border-2 border-emerald-500/40 bg-gradient-to-br from-emerald-950/30 via-stone-950 to-stone-900 p-5 sm:p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                      Не хватает 50–100 XP до Золотого Купона -500 ₽?
                    </span>
                    <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-100">
                      Пригласите друга в банный квест — получите +50 XP!
                    </h3>
                    <p className="text-xs text-stone-300 leading-relaxed max-w-2xl">
                      Отправьте ссылку другу в Telegram или ВКонтакте. Вы мгновенно получите{' '}
                      <strong className="text-emerald-300">+50 XP</strong> (до 2 раз = +100 XP), чтобы добрать баланс до скидки -500 ₽!
                    </p>
                  </div>
                  <div className="px-3.5 py-2 rounded-xl bg-stone-950 border border-emerald-500/30 text-center shrink-0">
                    <div className="text-[10px] font-mono text-stone-400">Бонус за репосты</div>
                    <div className="text-base font-serif font-bold text-emerald-300">
                      {Math.min(2, referralShares)} / 2 (+{Math.min(2, referralShares) * 50} XP)
                    </div>
                  </div>
                </div>

                {/* Copyable Referral Link */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                  <div className="flex-1 px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 font-mono text-xs text-amber-300 flex items-center justify-between gap-2 overflow-x-auto">
                    <span className="truncate">{referralUrl}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleShareReferral('copy')}
                    className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors border border-stone-700"
                  >
                    {copiedRef ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedRef ? 'Скопировано!' : 'Скопировать'}</span>
                  </button>
                </div>

                {/* Social Share Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => handleShareReferral('tg')}
                    className="py-3 px-4 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-200 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <Send className="w-4 h-4 text-sky-400" />
                    <span>Отправить в Telegram (+50 XP)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleShareReferral('vk')}
                    className="py-3 px-4 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-200 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <Share2 className="w-4 h-4 text-blue-400" />
                    <span>Поделиться ВКонтакте (+50 XP)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'merch' && (
            <div className="space-y-5">
              <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-stone-900 to-stone-950 border border-amber-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">
                    Эксклюзивно для учеников «Мастер Пара PRO»
                  </span>
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-100">
                    Интернет-магазин «Банная Лавка Бати»
                  </h3>
                  <p className="text-xs text-stone-300 max-w-2xl leading-relaxed">
                    Проходя платные уровни 3–7, вы заработаете ещё <strong>+1 400 XP</strong> и сможете обменять их на купон <strong>-500 ₽</strong> для заказа фермерских веников, дикоросов, шапок из овечьей шерсти и медных черпаков.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {UPCOMING_SHOP_PREVIEW.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-stone-950/90 border border-stone-800 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-center text-2xl shrink-0">
                        {item.icon}
                      </div>
                      <div>
                        <h4 className="font-serif font-bold text-sm text-stone-100">{item.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-mono text-stone-400">{item.price}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold">
                            {item.xpDiscount}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer CTA */}
        <div className="p-4 sm:p-5 border-t border-stone-800 bg-stone-950 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-stone-400 flex items-center gap-2">
            <Tag className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              {currentDiscount > 0
                ? `Ваша персональная скидка за XP (-${currentDiscount} ₽) активна! Итоговая цена курса: ${3390 - currentDiscount} ₽.`
                : 'Соберите 350 XP для скидки -250 ₽ или все 600 XP на 1–2 уровнях для скидки -500 ₽!'}
            </span>
          </div>
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenPricing();
              }}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
            >
              <span>Перейти к покупке курса ({3390 - currentDiscount} ₽)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
