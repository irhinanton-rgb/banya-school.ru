import React, { useState } from 'react';
import { ShieldCheck, Mail, Globe, ArrowLeft, FileText, CheckCircle2, Phone, CreditCard, Lock } from 'lucide-react';

interface RequisitesPageProps {
  onBackToMain: () => void;
  onOpenLegalModal?: (tab: 'offer' | 'privacy' | 'requisites') => void;
}

export const RequisitesPage: React.FC<RequisitesPageProps> = ({ onBackToMain, onOpenLegalModal }) => {
  const [activeTab, setActiveTab] = useState<'requisites' | 'payment_rules' | 'offer' | 'privacy'>('requisites');

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col justify-between">
      {/* Top Navigation Bar */}
      <header className="border-b border-stone-800 bg-stone-950/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <button
            onClick={onBackToMain}
            className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-stone-300 hover:text-amber-400 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Вернуться на главную страницу</span>
          </button>

          <div className="flex items-center gap-2 text-xs font-mono text-stone-400">
            <span className="text-amber-400">🌾</span>
            <span className="hidden sm:inline">banya-school.ru</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex-1 w-full space-y-8">
        {/* Title Block */}
        <div className="space-y-3 border-b border-stone-800 pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Официальная юридическая информация</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-4xl font-bold text-stone-100">
            Реквизиты и условия оплаты сервиса banya-school.ru
          </h1>
          <p className="text-xs sm:text-sm text-stone-400 max-w-2xl leading-relaxed">
            Страница идентификации исполнителя, способов приёма платежей, выдачи электронных чеков и условий возврата в соответствии с законодательством Российской Федерации.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-stone-800/80">
          <button
            onClick={() => setActiveTab('requisites')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'requisites'
                ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                : 'bg-stone-900 text-stone-300 hover:bg-stone-800'
            }`}
          >
            🏛️ Реквизиты самозанятого (ИНН)
          </button>
          <button
            onClick={() => setActiveTab('payment_rules')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'payment_rules'
                ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                : 'bg-stone-900 text-stone-300 hover:bg-stone-800'
            }`}
          >
            💳 Оплата, чеки и безопасность (ЮKassa)
          </button>
          <button
            onClick={() => setActiveTab('offer')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'offer'
                ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                : 'bg-stone-900 text-stone-300 hover:bg-stone-800'
            }`}
          >
            📄 Публичная оферта
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'privacy'
                ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                : 'bg-stone-900 text-stone-300 hover:bg-stone-800'
            }`}
          >
            🔒 Политика 152-ФЗ
          </button>
        </div>

        {/* TAB 1: REQUISITES */}
        {activeTab === 'requisites' && (
          <div className="space-y-6">
            <div className="rounded-3xl border border-stone-800 bg-stone-900/90 p-6 sm:p-8 space-y-6 shadow-xl">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-amber-200 flex items-center gap-2.5">
                <span>🏛️</span>
                <span>Сведения об Исполнителе (Плательщик НПД)</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div className="p-4 rounded-2xl bg-stone-950/80 border border-stone-800 space-y-1">
                  <span className="text-stone-500 font-mono text-[11px] block uppercase">ФИО Исполнителя:</span>
                  <strong className="text-stone-100 text-base font-serif block">Ирхин Антон</strong>
                </div>

                <div className="p-4 rounded-2xl bg-stone-950/80 border border-amber-500/40 space-y-1">
                  <span className="text-amber-400 font-mono text-[11px] block uppercase font-bold">ИНН плательщика:</span>
                  <strong className="text-amber-300 font-mono text-lg tracking-wider block">614007827150</strong>
                </div>

                <div className="p-4 rounded-2xl bg-stone-950/80 border border-stone-800 space-y-1">
                  <span className="text-stone-500 font-mono text-[11px] block uppercase">Налоговый статус:</span>
                  <span className="text-stone-200 font-medium">Плательщик налога на профессиональный доход (НПД / Самозанятый)</span>
                </div>

                <div className="p-4 rounded-2xl bg-stone-950/80 border border-stone-800 space-y-1">
                  <span className="text-stone-500 font-mono text-[11px] block uppercase">Сайт сервиса:</span>
                  <a href="https://banya-school.ru" className="text-amber-400 hover:underline font-mono">
                    https://banya-school.ru
                  </a>
                </div>

                <div className="p-4 rounded-2xl bg-stone-950/80 border border-stone-800 space-y-1">
                  <span className="text-stone-500 font-mono text-[11px] block uppercase">E-mail для связи и обращений:</span>
                  <a href="mailto:irhinanton@gmail.com" className="text-amber-400 hover:underline font-mono">
                    irhinanton@gmail.com
                  </a>
                </div>

                <div className="p-4 rounded-2xl bg-stone-950/80 border border-stone-800 space-y-1">
                  <span className="text-stone-500 font-mono text-[11px] block uppercase">Юрисдикция:</span>
                  <span className="text-stone-200">Российская Федерация</span>
                </div>
              </div>

              {/* Service description */}
              <div className="p-5 rounded-2xl bg-stone-950/60 border border-stone-800 space-y-2">
                <h3 className="font-serif font-bold text-sm text-stone-200">
                  Виды деятельности и оказываемые услуги:
                </h3>
                <p className="text-xs text-stone-300 leading-relaxed">
                  Оказание информационно-консультационных и обучающих услуг в дистанционной форме посредством сети Интернет:
                  предоставление электронного доступа к образовательной платформе «Пармастер Квест: Школа Банного Мастерства»,
                  интерактивным симуляторам, методическим материалам, технологическим картам парения и закрытому сообществу пармастеров.
                </p>
              </div>

              {/* Federal Law 422 notice */}
              <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-900/40 text-xs text-amber-200/90 leading-relaxed space-y-1">
                <strong>🧾 Формирование фискальных чеков:</strong>
                <p>
                  В соответствии со ст. 14 Федерального закона от 27.11.2018 № 422-ФЗ, при каждой безналичной оплате
                  формируется официальный фискальный чек ФНС России в мобильном приложении «Мой налог» (сервис «Своё дело» ПАО Сбербанк)
                  и автоматически направляется Заказчику в электронном виде.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PAYMENT RULES & REFUNDS */}
        {activeTab === 'payment_rules' && (
          <div className="space-y-6">
            <div className="rounded-3xl border border-stone-800 bg-stone-900/90 p-6 sm:p-8 space-y-6 shadow-xl">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-100 flex items-center gap-2.5">
                <CreditCard className="w-6 h-6 text-amber-400" />
                <span>Порядок оплаты, доставки услуг и безопасность</span>
              </h2>

              {/* Step 1: Payment Methods */}
              <div className="space-y-3">
                <h3 className="font-serif font-bold text-base text-amber-300">
                  1. Способы оплаты (ЮKassa)
                </h3>
                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                  Оплата заказов осуществляется через сертифицированный платёжный шлюз <strong>ЮKassa</strong> (ООО НКО «ЮМани») следующими способами:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800 space-y-1">
                    <strong className="text-stone-100 block">📱 СБП (Система быстрых платежей)</strong>
                    <span className="text-stone-400">Оплата по QR-коду или переходом в банковское приложение без комиссии.</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800 space-y-1">
                    <strong className="text-stone-100 block">💳 Банковские карты РФ</strong>
                    <span className="text-stone-400">МИР, Visa, Mastercard, выпущенные российскими банками.</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800 space-y-1">
                    <strong className="text-stone-100 block">💚 SberPay / Т-Pay</strong>
                    <span className="text-stone-400">Быстрая оплата в 1 клик для клиентов Сбербанка и Т-Банка.</span>
                  </div>
                </div>
              </div>

              {/* Step 2: Instant Delivery */}
              <div className="space-y-2 pt-4 border-t border-stone-800">
                <h3 className="font-serif font-bold text-base text-amber-300">
                  2. Порядок предоставления (доставки) электронного доступа
                </h3>
                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                  Услуга оказывается полностью в электронном виде. После успешного проведения платежа Заказчик моментально получает:
                  <br />
                  • Доступ ко всем 7 станциям обучающего курса и закрытым симуляторам;
                  <br />
                  • Доступ к итоговому экзамену и персональному номерному сертификату;
                  <br />
                  • Доступ к сообществу, вебинарам и проверке домашних заданий.
                  <br />
                  Физическая доставка товаров не требуется.
                </p>
              </div>

              {/* Step 3: Security PCI DSS */}
              <div className="space-y-2 pt-4 border-t border-stone-800">
                <h3 className="font-serif font-bold text-base text-amber-300 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  <span>3. Безопасность платежей и защита данных</span>
                </h3>
                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                  Все платежи защищены по международному стандарту безопасности <strong>PCI DSS Level 1</strong>.
                  Сайт <code>banya-school.ru</code> никогда не собирает и не сохраняет данные банковских карт Заказчика (номера карт, CVC/CVV-коды).
                  Ввод данных осуществляется на защищенной платёжной странице платёжного шлюза ЮKassa с использованием 256-битного шифрования SSL/TLS.
                </p>
              </div>

              {/* Step 4: Refund Policy */}
              <div className="space-y-2 pt-4 border-t border-stone-800">
                <h3 className="font-serif font-bold text-base text-amber-300">
                  4. Порядок возврата денежных средств
                </h3>
                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                  Заказчик вправе запросить возврат средств в течение <strong>14 календарных дней</strong> с момента оплаты (до завершения изучения более чем 2 уровней программы).
                  Для оформления возврата достаточно направить заявление в свободной форме на электронную почту: <a href="mailto:irhinanton@gmail.com" className="text-amber-400 underline font-mono">irhinanton@gmail.com</a>.
                  Возврат денежных средств осуществляется на ту же банковскую карту или счёт, с которого была произведена оплата, в срок от 1 до 5 рабочих дней.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: OFFER */}
        {activeTab === 'offer' && (
          <div className="rounded-3xl border border-stone-800 bg-stone-900/90 p-6 sm:p-8 space-y-4 shadow-xl text-xs sm:text-sm text-stone-300 leading-relaxed">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-100 mb-4">
              Публичная оферта на оказание образовательных услуг
            </h2>
            <p><strong>1. Общие положения:</strong> Настоящий документ является публичной офертой Самозанятого Ирхина Антона (ИНН: 614007827150) и определяет условия предоставления доступа к онлайн-сервису «Пармастер Квест» (banya-school.ru).</p>
            <p><strong>2. Акцепт оферты:</strong> Акцептом настоящей оферты признается оплата любого из платных тарифов доступа либо прохождение регистрации на сайте.</p>
            <p><strong>3. Стоимость:</strong> Стоимость доступа фиксируется в рублях РФ на странице «Тарифы» на момент оплаты. НДС не облагается в связи с применением режима НПД (ФЗ № 422-ФЗ).</p>
            <p><strong>4. Контакты:</strong> Исполнитель: Ирхин Антон, ИНН: 614007827150, e-mail: irhinanton@gmail.com.</p>
          </div>
        )}

        {/* TAB 4: PRIVACY */}
        {activeTab === 'privacy' && (
          <div className="rounded-3xl border border-stone-800 bg-stone-900/90 p-6 sm:p-8 space-y-4 shadow-xl text-xs sm:text-sm text-stone-300 leading-relaxed">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-100 mb-4">
              Политика конфиденциальности и обработки персональных данных (152-ФЗ)
            </h2>
            <p><strong>1. Оператор данных:</strong> Самозанятый Ирхин Антон (ИНН: 614007827150). Адрес сайта: https://banya-school.ru.</p>
            <p><strong>2. Состав данных:</strong> Мы собираем адрес электронной почты, имя для сертификата и контактный телефон (при авторизации по SMS).</p>
            <p><strong>3. Безопасность:</strong> Данные никогда не передаются третьим лицам за исключением случаев, предусмотренных законодательством РФ (отправка чеков в ФНС).</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-800 bg-stone-950 py-6 text-center text-xs text-stone-500">
        <div className="max-w-4xl mx-auto px-4 space-y-1">
          <div>© 2026 Пармастер Квест — Школа Банного Мастерства. Все права защищены.</div>
          <div className="font-mono text-stone-400">
            Исполнитель: Самозанятый Ирхин Антон | ИНН: 614007827150 | irhinanton@gmail.com
          </div>
        </div>
      </footer>
    </div>
  );
};
