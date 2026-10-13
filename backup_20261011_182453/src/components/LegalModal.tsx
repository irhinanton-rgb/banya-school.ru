import React, { useState } from 'react';
import { X, Shield, FileText, CheckCircle2, UserCheck, AlertCircle } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'offer' | 'privacy' | 'requisites';
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'offer',
}) => {
  const [tab, setTab] = useState<'offer' | 'privacy' | 'requisites'>(initialTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-5 overflow-y-auto bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl rounded-t-3xl sm:rounded-3xl border-t sm:border border-stone-800 bg-stone-950 text-stone-100 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Mobile Swipe Handle */}
        <div className="w-12 h-1 bg-stone-700/80 rounded-full mx-auto my-2 sm:hidden shrink-0" />

        {/* Header */}
        <div className="relative bg-gradient-to-r from-stone-900 via-stone-950 to-stone-900 border-b border-stone-800 p-4 sm:p-6 shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-amber-100">
                Правовая информация и документы
              </h3>
              <p className="text-xs text-stone-400">
                Соблюдение законодательства РФ (ФЗ № 422-ФЗ, ФЗ № 152-ФЗ, ЗоЗПП)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-stone-100 transition-colors border border-stone-700/60"
            title="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-stone-800 bg-stone-900/60 px-5 gap-2 overflow-x-auto text-xs font-medium">
          <button
            onClick={() => setTab('offer')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              tab === 'offer'
                ? 'border-amber-500 text-amber-300 font-semibold'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Публичная оферта</span>
          </button>
          <button
            onClick={() => setTab('privacy')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              tab === 'privacy'
                ? 'border-amber-500 text-amber-300 font-semibold'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Политика конфиденциальности (152-ФЗ)</span>
          </button>
          <button
            onClick={() => setTab('requisites')}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              tab === 'requisites'
                ? 'border-amber-500 text-amber-300 font-semibold'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Реквизиты самозанятого</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-7 space-y-4 overflow-y-auto text-stone-300 text-xs sm:text-sm leading-relaxed">
          {tab === 'offer' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                <span>
                  Настоящий документ является публичной офертой в соответствии со ст. 437 Гражданского кодекса РФ. Оплата доступа к курсу означает полное и безоговорочное принятие условий оферты.
                </span>
              </div>

              <h4 className="font-serif font-bold text-amber-100 text-base">
                1. Предмет договора
              </h4>
              <p>
                1.1. Исполнитель (плательщик налога на профессиональный доход / самозанятый) обязуется предоставить Заказчику дистанционный доступ к информационно-обучающим интерактивным материалам онлайн-курса «Пармастер Квест: Путь к Мастерству» (размещенным на сайте banya-school.ru), а Заказчик обязуется оплатить выбранный тариф в полном объеме.
              </p>
              <p>
                1.2. Обучение носит информационно-консультационный характер и направлено на освоение практических навыков банного мастерства, гигиены, техники безопасности и ароматерапии. Услуга не является образовательной деятельностью, подлежащей лицензированию.
              </p>

              <h4 className="font-serif font-bold text-amber-100 text-base">
                2. Стоимость услуг, порядок оплаты и чеки
              </h4>
              <p>
                2.1. Стоимость доступа указывается на сайте в разделе «Тарифы» на момент совершения платежа (НДС не облагается в связи с применением специального налогового режима НПД в соответствии с Федеральным законом № 422-ФЗ).
              </p>
              <p>
                2.2. Оплата производится безналичным расчетом через подключенную платежную систему (эквайринг, СБП или банковские карты).
              </p>
              <p>
                2.3. В соответствии со статьей 14 Федерального закона № 422-ФЗ, на сумму произведенной оплаты формируется электронный фискальный чек в приложении «Мой налог» и направляется на адрес электронной почты или номер телефона Заказчика.
              </p>

              <h4 className="font-serif font-bold text-amber-100 text-base">
                3. Предоставление доступа и сдача-приемка услуг
              </h4>
              <p>
                3.1. Доступ к интерактивным материалам и уровням курса открывается в личном кабинете Заказчика автоматически сразу после поступления подтверждения об оплате.
              </p>
              <p>
                3.2. Услуга считается оказанной в момент предоставления доступа к закрытой части обучающей платформы.
              </p>

              <h4 className="font-serif font-bold text-amber-100 text-base">
                4. Условия возврата денежных средств
              </h4>
              <p>
                4.1. Заказчик вправе запросить возврат денежных средств до момента начала активного изучения материалов (до завершения 2-го уровня курса) в течение 14 календарных дней с момента оплаты, направив заявление на контактный e-mail Исполнителя.
              </p>
              <p>
                4.2. При возврате денежных средств доступ к материалам курса блокируется, а в системе «Мой налог» аннулируется соответствующий чек с указанием причины возврата.
              </p>

              <h4 className="font-serif font-bold text-amber-100 text-base">
                5. Интеллектуальная собственность
              </h4>
              <p>
                5.1. Все тексты, иллюстрации, тестовые задания, программный код и методология курса являются объектами авторского права Исполнителя. Запрещается копирование, тиражирование, публичное распространение или перепродажа материалов курса третьим лицам.
              </p>
            </div>
          )}

          {tab === 'privacy' && (
            <div className="space-y-4">
              <h4 className="font-serif font-bold text-amber-100 text-base">
                Политика обработки персональных данных (ФЗ № 152-ФЗ)
              </h4>
              <p>
                1. Настоящая Политика определяет порядок обработки и защиты персональных данных пользователей сервиса «Пармастер Квест: Путь к Мастерству».
              </p>
              <p>
                2. Мы обрабатываем следующие данные:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-stone-300">
                <li>Адрес электронной почты (для регистрации, восстановления пароля и отправки чеков);</li>
                <li>Номер мобильного телефона (при авторизации по SMS);</li>
                <li>Имя пользователя (для отображения в личном кабинете и сертификате);</li>
                <li>Данные о прогрессе обучения, заработанных баллах и статусе сдачи тестов.</li>
              </ul>
              <p>
                3. Мы никогда не храним данные ваших банковских карт (CVC/CVV, полные номера карт) — все платежи обрабатываются напрямую сертифицированными провайдерами интернет-эквайринга (ЮKassa / Prodamus / Т-Банк) по защищенному протоколу PCI DSS.
              </p>
              <p>
                4. Ваши данные используются исключительно для функционирования сервиса, синхронизации прогресса через базу данных Google Firestore и отправки фискальных чеков. Мы не передаем данные третьим лицам для рекламных рассылок или спама.
              </p>
            </div>
          )}

          {tab === 'requisites' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 space-y-3">
                <div className="flex items-center gap-2 text-amber-300 font-semibold text-sm">
                  <span>🏛️</span>
                  <span>Сведения об Исполнителе (Плательщик НПД / Самозанятый)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-stone-500 block">Статус:</span>
                    <span className="text-stone-200 font-medium">Плательщик налога на профессиональный доход (НПД)</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block">ФИО Исполнителя:</span>
                    <span className="text-amber-200 font-medium">Ирхин Антон</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block">ИНН плательщика:</span>
                    <span className="text-amber-300 font-mono font-bold text-sm">614007827150</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block">E-mail для связи и поддержки:</span>
                    <a href="mailto:irhinanton@gmail.com" className="text-amber-400 hover:underline">
                      irhinanton@gmail.com
                    </a>
                  </div>
                  <div>
                    <span className="text-stone-500 block">Сайт сервиса:</span>
                    <span className="text-stone-200 font-mono">banya-school.ru</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block">Юрисдикция:</span>
                    <span className="text-stone-200">Российская Федерация</span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-stone-900/60 border border-stone-800 text-stone-400 text-xs">
                💡 <span className="text-stone-300 font-medium">Для самозанятого:</span> В соответствии с законом, при получении каждого платежа сервис автоматически регистрирует продажу в приложении «Мой налог» и формирует официальный чек ФНС России, доступный по ссылке или QR-коду.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-stone-900/80 border-t border-stone-800 p-4 px-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition-colors cursor-pointer"
          >
            Понятно, закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
