import React, { useState } from 'react';
import {
  Building2,
  Flame,
  Leaf,
  Award,
  Send,
  CheckCircle2,
  Lock,
  Sparkles,
  Users,
  ShieldCheck,
  Briefcase,
  Mail,
} from 'lucide-react';
import { sendAdminMessage } from '../firebase/adminMessageService';
import { ADMIN_EMAIL } from '../firebase/config';
import { playWoodTap, playSuccessChime } from '../utils/audio';

interface PartnershipSectionProps {
  soundEnabled?: boolean;
}

const PARTNER_CATEGORIES = [
  {
    id: 'stoves',
    title: 'Производители печей, дымоходов и камня',
    desc: 'Интеграция в интерактивные разборы микроклимата, обзоры закрытых каменок и рекомендации по закладке нефрита/жадеита.',
    icon: Flame,
  },
  {
    id: 'brooms_herbs',
    title: 'Заготовители веников, трав и банной экипировки',
    desc: 'Размещение в «Фитотеке Мастера» и списке рекомендованного инвентаря для выпускников и практикующих пармастеров.',
    icon: Leaf,
  },
  {
    id: 'complexes',
    title: 'Банные комплексы, термы и загородные SPA',
    desc: 'Привлечение сертифицированных выпускников школы в штат, совместные банные дни и спецпроекты для гостей.',
    icon: Building2,
  },
  {
    id: 'media',
    title: 'Фестивали, чемпионаты и профильные медиа',
    desc: 'Информационное партнёрство в авторском канале «Батя в Бане» (@BatyaVBane), ВКонтакте и внутри клуба мастеров.',
    icon: Award,
  },
];

export const PartnershipSection: React.FC<PartnershipSectionProps> = ({
  soundEnabled = true,
}) => {
  const [companyName, setCompanyName] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [direction, setDirection] = useState('Производители печей и оборудования');
  const [proposal, setProposal] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !contactInfo.trim() || !proposal.trim()) {
      setErrorMsg('Пожалуйста, укажите имя/компанию, контакт для связи и суть предложения.');
      return;
    }

    setErrorMsg(null);
    setIsSubmitting(true);
    playWoodTap(soundEnabled);

    try {
      await sendAdminMessage({
        type: 'ad_inquiry',
        userName: companyName.trim(),
        userEmail: contactInfo.trim(),
        referralSource: direction,
        message: proposal.trim(),
      });
      setSubmitted(true);
      setCompanyName('');
      setContactInfo('');
      setProposal('');
      playSuccessChime(soundEnabled);
    } catch {
      setErrorMsg('Не удалось отправить заявку. Напишите напрямую на ' + ADMIN_EMAIL);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="partnerships-section"
      className="space-y-8 pt-6 border-t border-stone-800/80"
    >
      {/* 1. B2B CORPORATE TRAINING BLOCK (INACTIVE / COMING SOON) */}
      <div className="relative rounded-3xl border border-stone-800/90 bg-stone-950/75 p-6 sm:p-8 overflow-hidden opacity-85 select-none">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono">
              <span className="inline-flex items-center gap-1.5 text-stone-400 uppercase tracking-wider">
                <Lock className="w-3.5 h-3.5 text-amber-500/70" />
                <span>Корпоративный стандарт B2B</span>
              </span>
              <span className="text-stone-600">·</span>
              <span className="text-amber-400/90 font-semibold">
                Раздел в разработке (Скоро)
              </span>
            </div>

            <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-200">
              Корпоративное обучение персонала для банных и SPA-комплексов
            </h3>

            <p className="text-xs sm:text-sm text-stone-400 leading-relaxed">
              Единая система подготовки, стажировки и аттестации штатных пармастеров для коммерческих парных, термальных комплексов и загородных отелей. Стандартизация техники безопасности, первой помощи, биомеханики и сервиса 5★.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs text-stone-400">
              <div className="p-3 rounded-xl bg-stone-900/60 border border-stone-800/80 flex items-center gap-2.5">
                <Users className="w-4 h-4 text-stone-500 shrink-0" />
                <span>Группы от 3 до 20 мастеров комплекса</span>
              </div>
              <div className="p-3 rounded-xl bg-stone-900/60 border border-stone-800/80 flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-stone-500 shrink-0" />
                <span>Единый регламент ПМП и безопасности</span>
              </div>
              <div className="p-3 rounded-xl bg-stone-900/60 border border-stone-800/80 flex items-center gap-2.5">
                <Award className="w-4 h-4 text-stone-500 shrink-0" />
                <span>Корпоративная аттестация и реестр</span>
              </div>
            </div>
          </div>

          <div className="shrink-0 flex flex-col items-stretch sm:items-end gap-2">
            <button
              type="button"
              disabled
              className="px-6 py-3.5 rounded-2xl bg-stone-900 border border-stone-800 text-stone-500 font-mono text-xs font-semibold uppercase tracking-wider cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>B2B-тариф временно закрыт</span>
            </button>
            <span className="text-[11px] font-mono text-stone-500 text-center sm:text-right">
              Запуск корпоративного модуля — в следующих обновлениях
            </span>
          </div>
        </div>
      </div>

      {/* 2. ACTIVE BLOCK FOR PARTNERSHIPS & ADVERTISERS */}
      <div className="rounded-3xl border border-stone-800 bg-gradient-to-br from-stone-900/95 via-stone-950 to-stone-900/95 p-6 sm:p-8 lg:p-10 shadow-2xl space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-stone-800/80 pb-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber-400">
              <Briefcase className="w-3.5 h-3.5" />
              <span>Сотрудничество и Рекламодателям</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-100">
              Партнёрство с проектом «Пармастер Квест» и каналом «Батя в Бане»
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Аудитория платформы — практикующие пармастера, владельцы частных бань и ценители правильного пара, которые регулярно выбирают печи, камни для каменки, веники, травы и экипировку.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-stone-400">
            <Mail className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Прямая почта основателя:</span>
            <a
              href={`mailto:${ADMIN_EMAIL}`}
              className="text-amber-300 hover:text-amber-200 underline font-semibold"
            >
              {ADMIN_EMAIL}
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: 4 Partnership Directions (7 cols) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PARTNER_CATEGORIES.map((item) => {
              const IconComponent = item.icon;
              return (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl bg-stone-950/80 border border-stone-800/90 hover:border-amber-500/40 transition-colors space-y-2.5"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <h4 className="font-serif font-bold text-sm sm:text-base text-stone-100">
                    {item.title}
                  </h4>
                  <p className="text-xs text-stone-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              );
            })}

            <div className="sm:col-span-2 p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex items-start gap-3 text-xs text-amber-200/90 leading-relaxed">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-100">Честный принцип отбора партнёров:</strong> мы рекомендуем ученикам только те печи, веники, травы и камни, которые отвечают стандартам безопасности парной и проверены на практике.
              </div>
            </div>
          </div>

          {/* Right: Direct Advertiser / Partner Lead Form (5 cols) */}
          <div className="lg:col-span-5 rounded-2xl bg-stone-950 border border-stone-800 p-5 sm:p-6 space-y-4">
            <div>
              <h3 className="font-serif font-bold text-base sm:text-lg text-stone-100">
                Отправить предложение о сотрудничестве
              </h3>
              <p className="text-xs text-stone-400 mt-0.5">
                Заявка мгновенно поступает лично Антону Ирхину в Telegram-бот школы
              </p>
            </div>

            {submitted ? (
              <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="font-serif font-bold text-base text-emerald-100">
                  Предложение отправлено Антону Ирхину!
                </h4>
                <p className="text-xs text-emerald-200/80 leading-relaxed">
                  Ваша заявка доставлена в личный Telegram основателя школы. Мы свяжемся с вами по указанному контакту в ближайшее время.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-xs text-stone-200 cursor-pointer"
                >
                  Отправить ещё одно сообщение
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <label className="text-[11px] font-mono text-stone-400 uppercase block mb-1">
                    Ваше имя и название бренда / компании *
                  </label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Например: Иван, Заготовка дубовых веников"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-xs text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono text-stone-400 uppercase block mb-1">
                    Телефон, @Telegram или Email для связи *
                  </label>
                  <input
                    type="text"
                    required
                    value={contactInfo}
                    onChange={(e) => setContactInfo(e.target.value)}
                    placeholder="+7 (999) 000-00-00 или @username"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-xs text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono text-stone-400 uppercase block mb-1">
                    Формат сотрудничества
                  </label>
                  <select
                    value={direction}
                    onChange={(e) => setDirection(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Производители печей и оборудования">
                      Производители печей, дымоходов и камня
                    </option>
                    <option value="Поставщики веников, трав и экипировки">
                      Поставщики веников, трав и банной экипировки
                    </option>
                    <option value="Реклама в Telegram @BatyaVBane и ВК">
                      Реклама в каналах «Батя в Бане» (TG / ВК)
                    </option>
                    <option value="Банный комплекс / Поиск мастеров">
                      Банный комплекс / Партнёрство и поиск мастеров
                    </option>
                    <option value="Другое предложение">Другое предложение</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-mono text-stone-400 uppercase block mb-1">
                    Коротко о вашем продукте и предложении *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={proposal}
                    onChange={(e) => setProposal(e.target.value)}
                    placeholder="Опишите ваш продукт, сайт/канал и желаемый формат интеграции..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-stone-800 text-xs text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-amber-500 leading-relaxed"
                  />
                </div>

                {errorMsg && (
                  <div className="p-2.5 rounded-xl bg-red-950/50 border border-red-500/40 text-xs text-red-200">
                    {errorMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>
                    {isSubmitting ? 'Отправка в Telegram...' : 'Отправить предложение основателю'}
                  </span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
