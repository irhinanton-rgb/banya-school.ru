import React, { useState } from 'react';
import { 
  X, 
  Send, 
  HelpCircle, 
  Bug, 
  Heart, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Compass,
  MessageSquare
} from 'lucide-react';
import { sendAdminMessage, AdminMessageType } from '../firebase/adminMessageService';
import { useAuth } from '../firebase/AuthContext';
import { UserProgress } from '../types/banya';

interface OwlAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  progress: UserProgress;
}

export const OwlAssistantModal: React.FC<OwlAssistantModalProps> = ({
  isOpen,
  onClose,
  progress,
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminMessageType>('question');
  
  // Form fields
  const [questionText, setQuestionText] = useState('');
  const [bugText, setBugText] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [userName, setUserName] = useState(progress.name || user?.displayName || '');
  const [userContact, setUserContact] = useState(user?.email || '');
  const [referralSource, setReferralSource] = useState('Рекомендация друзей');
  const [customReferral, setCustomReferral] = useState('');

  // AI chat answer for questions
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successStatus, setSuccessStatus] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSendQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) return;

    setIsSubmitting(true);
    setSuccessStatus(null);
    setErrorStatus(null);
    setAiAnswer(null);

    const question = questionText.trim();

    try {
      // 1. Ask Gemini AI for real-time guidance
      let reply = 'Твой вопрос принят мудрой Совой PQ! Для успешного прохождения квеста изучай теорию на станциях, внимательно следи за кондициями 60/60 и закрепляй знания в симуляторах.';
      try {
        const res = await fetch('/api/assistant-ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question,
            currentLevel: progress.activeLevelId,
            studentName: userName || progress.name || 'Ученик',
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.answer) {
            reply = data.answer;
          }
        }
      } catch (err) {
        console.warn('AI answer request failed, using default guidance:', err);
      }

      setAiAnswer(reply);

      // 2. Also send to Admin via Firestore + Telegram
      await sendAdminMessage({
        type: 'question',
        message: question,
        userId: user?.uid || 'guest',
        userName: userName || progress.name || 'Гость курса',
        userEmail: userContact || user?.email || '',
        referralSource: referralSource === 'Другое' ? customReferral : referralSource,
      });

      setSuccessStatus('Вопрос отправлен Сове и передан наставнику Антону Ирхину!');
    } catch (err: any) {
      console.error('Error handling question:', err);
      setErrorStatus('Произошла ошибка при отправке. Пожалуйста, попробуйте еще раз.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendBugReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bugText.trim()) return;

    setIsSubmitting(true);
    setSuccessStatus(null);
    setErrorStatus(null);

    try {
      await sendAdminMessage({
        type: 'bug',
        message: bugText.trim(),
        userId: user?.uid || 'guest',
        userName: userName || progress.name || 'Гость курса',
        userEmail: userContact || user?.email || '',
      });

      setSuccessStatus('Спасибо! Отчёт о неисправности передан администратору для исправления.');
      setBugText('');
    } catch (err: any) {
      console.error('Error sending bug report:', err);
      setErrorStatus('Не удалось отправить отчёт. Попробуйте снова.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;

    setIsSubmitting(true);
    setSuccessStatus(null);
    setErrorStatus(null);

    const source = referralSource === 'Другое' ? customReferral.trim() : referralSource;

    try {
      await sendAdminMessage({
        type: 'feedback',
        message: feedbackText.trim(),
        userId: user?.uid || 'guest',
        userName: userName || progress.name || 'Гость курса',
        userEmail: userContact || user?.email || '',
        referralSource: source,
      });

      setSuccessStatus('Благодарим за тёплый отзыв и обратную связь! Сообщение отправлено наставнику.');
      setFeedbackText('');
    } catch (err: any) {
      console.error('Error sending feedback:', err);
      setErrorStatus('Не удалось отправить отзыв. Попробуйте снова.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative max-w-2xl w-full max-h-[92vh] flex flex-col rounded-3xl bg-gradient-to-b from-stone-900 via-stone-950 to-stone-900 border border-amber-500/40 shadow-[0_20px_70px_rgba(0,0,0,0.9)] text-stone-100 overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Header with Owl Assistant Avatar (No background, crisp drop-shadow) */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-stone-800 bg-stone-900/60">
          <div className="flex items-center gap-3.5">
            <div className="relative flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl p-1 shrink-0">
              <img
                src="/images/PQ.png"
                alt="Помощник Сова PQ"
                className="w-full h-full object-contain filter drop-shadow-[0_4px_12px_rgba(245,158,11,0.45)] hover:scale-105 transition-transform"
              />
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-stone-900" />
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/25">
                  Мудрый Наставник
                </span>
                <span className="text-[11px] font-mono text-emerald-400 font-semibold">
                  Online
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-serif font-bold text-stone-100 mt-0.5">
                Помощник PQ & Связь с Наставником
              </h2>
              <p className="text-xs text-stone-400 hidden sm:block">
                Задайте вопрос по квесту, сообщите о баге или поделитесь впечатлениями
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-stone-800/60 text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors cursor-pointer"
            aria-label="Закрыть окно"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-stone-800 bg-stone-950/60 px-4 sm:px-6 gap-2 sm:gap-4 overflow-x-auto">
          <button
            onClick={() => { setActiveTab('question'); setSuccessStatus(null); setErrorStatus(null); }}
            className={`flex items-center gap-2 py-3 px-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'question'
                ? 'border-amber-400 text-amber-300 font-semibold'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span>Вопрос по квесту</span>
          </button>

          <button
            onClick={() => { setActiveTab('bug'); setSuccessStatus(null); setErrorStatus(null); }}
            className={`flex items-center gap-2 py-3 px-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'bug'
                ? 'border-red-400 text-red-300 font-semibold'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Bug className="w-4 h-4 text-red-400" />
            <span>Нашли баг / ошибку</span>
          </button>

          <button
            onClick={() => { setActiveTab('feedback'); setSuccessStatus(null); setErrorStatus(null); }}
            className={`flex items-center gap-2 py-3 px-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'feedback'
                ? 'border-emerald-400 text-emerald-300 font-semibold'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Heart className="w-4 h-4 text-emerald-400" />
            <span>Отзывы и Впечатления</span>
          </button>
        </div>

        {/* Scrollable Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Status notifications */}
          {successStatus && (
            <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs sm:text-sm animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{successStatus}</span>
            </div>
          )}

          {errorStatus && (
            <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs sm:text-sm animate-fadeIn">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <span>{errorStatus}</span>
            </div>
          )}

          {/* TAB 1: QUESTION TO OWL PQ */}
          {activeTab === 'question' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 leading-relaxed flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-300 font-semibold">Спросите Сову PQ о прохождении:</strong>
                  <p className="mt-1 text-stone-300">
                    Задайте любой вопрос по текущей станции (Станция {progress.activeLevelId}), тестам, симуляторам или банной технике. Сова ответит в этом же окне, а копия вопроса улетит админу Антону Ирхину.
                  </p>
                </div>
              </div>

              {/* Real-time AI Assistant Response Display in the same window */}
              {aiAnswer && (
                <div className="p-4 sm:p-5 rounded-2xl bg-stone-900 border border-amber-500/40 shadow-xl space-y-3 animate-fadeIn">
                  <div className="flex items-center gap-2.5">
                    <img
                      src="/images/PQ.png"
                      alt="Сова PQ"
                      className="w-7 h-7 object-contain drop-shadow"
                    />
                    <span className="font-serif font-bold text-amber-300 text-sm">
                      Ответ Совы PQ:
                    </span>
                  </div>
                  <div className="text-xs sm:text-sm text-stone-200 leading-relaxed whitespace-pre-wrap font-sans bg-stone-950/60 p-3.5 rounded-xl border border-stone-800">
                    {aiAnswer}
                  </div>
                  <p className="text-[11px] font-mono text-stone-400">
                    ✨ Сообщение также направлено администратору школы.
                  </p>
                </div>
              )}

              <form onSubmit={handleSendQuestion} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-stone-400 mb-1.5">
                    Ваш вопрос:
                  </label>
                  <textarea
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    placeholder="Например: Как правильно удерживать баланс веников во 2-м уровне? Или: Какая температура должна быть на закрытой каменке?"
                    rows={3}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-stone-900 border border-stone-700 text-stone-100 placeholder-stone-500 text-xs sm:text-sm focus:outline-none focus:border-amber-400 transition-colors resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-stone-400 mb-1">
                      Ваше имя:
                    </label>
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="Имя или позывной"
                      className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-700 text-stone-100 text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-stone-400 mb-1">
                      Email или Telegram для связи (опционально):
                    </label>
                    <input
                      type="text"
                      value={userContact}
                      onChange={(e) => setUserContact(e.target.value)}
                      placeholder="@telegram или email"
                      className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-700 text-stone-100 text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !questionText.trim()}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs sm:text-sm uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] disabled:opacity-50 cursor-pointer active:scale-95"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Сова думает и отправляет...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Спросить Сову PQ</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: BUG REPORT */}
          {activeTab === 'bug' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-red-950/30 border border-red-500/20 text-xs text-red-200/90 leading-relaxed flex items-start gap-3">
                <Bug className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-red-300 font-semibold">Нашли баг или неисправность?</strong>
                  <p className="mt-1 text-stone-300">
                    Опишите, что пошло не так: какая кнопка не сработала, на каком симуляторе или экране возникла сложность. Мы мгновенно передадим отчёт администратору.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSendBugReport} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-stone-400 mb-1.5">
                    Описание ошибки / бага:
                  </label>
                  <textarea
                    value={bugText}
                    onChange={(e) => setBugText(e.target.value)}
                    placeholder="Опишите, что произошло: например, «Не открывается окно теста на 3 уровне» или «Кнопка звука не отключается»..."
                    rows={4}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-stone-900 border border-stone-700 text-stone-100 placeholder-stone-500 text-xs sm:text-sm focus:outline-none focus:border-red-400 transition-colors resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-stone-400 mb-1">
                      Ваше имя (опционально):
                    </label>
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="Имя"
                      className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-700 text-stone-100 text-xs focus:outline-none focus:border-red-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-stone-400 mb-1">
                      Контакт для ответа:
                    </label>
                    <input
                      type="text"
                      value={userContact}
                      onChange={(e) => setUserContact(e.target.value)}
                      placeholder="Email или Telegram"
                      className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-700 text-stone-100 text-xs focus:outline-none focus:border-red-400"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !bugText.trim()}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs sm:text-sm uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)] disabled:opacity-50 cursor-pointer active:scale-95"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Отправка отчёта админу...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Отправить сообщение о баге админу</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: FEEDBACK & HOW DID YOU FIND US */}
          {activeTab === 'feedback' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/20 text-xs text-emerald-200/90 leading-relaxed flex items-start gap-3">
                <Heart className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-emerald-300 font-semibold">Ваши впечатления и отзывы:</strong>
                  <p className="mt-1 text-stone-300">
                    Поделитесь мнением о школе, что вам понравилось больше всего и откуда вы о нас узнали. Нам очень важна обратная связь каждого ученика!
                  </p>
                </div>
              </div>

              <form onSubmit={handleSendFeedback} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-stone-400 mb-1.5">
                    Откуда вы узнали о нас?
                  </label>
                  <select
                    value={referralSource}
                    onChange={(e) => setReferralSource(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900 border border-stone-700 text-stone-100 text-xs sm:text-sm focus:outline-none focus:border-emerald-400 cursor-pointer"
                  >
                    <option value="Telegram-канал Батя в Бане">Telegram-канал «Батя в Бане» (@BatyaVBane)</option>
                    <option value="ВКонтакте (Группа/Сообщество)">Сообщество ВКонтакте</option>
                    <option value="Рекомендация друзей / Коллег-пармастеров">Рекомендация друзей / коллег</option>
                    <option value="Поиск в Яндексе / Google">Поиск в Яндексе / Google</option>
                    <option value="YouTube / Видеоролики">YouTube / Видеоролики</option>
                    <option value="Банный фестиваль / Чемпионат">Банный фестиваль / Чемпионат</option>
                    <option value="Другое">Другое (укажу в поле ниже)</option>
                  </select>
                </div>

                {referralSource === 'Другое' && (
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-stone-400 mb-1">
                      Укажите источник:
                    </label>
                    <input
                      type="text"
                      value={customReferral}
                      onChange={(e) => setCustomReferral(e.target.value)}
                      placeholder="Откуда узнали?"
                      required
                      className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-700 text-stone-100 text-xs focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-mono uppercase text-stone-400 mb-1.5">
                    Ваши впечатления и отзыв о курсе:
                  </label>
                  <textarea
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Что понравилось, какие эмоции от симуляторов, чего не хватает, ваши пожелания Антону Ирхину..."
                    rows={4}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-stone-900 border border-stone-700 text-stone-100 placeholder-stone-500 text-xs sm:text-sm focus:outline-none focus:border-emerald-400 transition-colors resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-stone-400 mb-1">
                      Ваше имя:
                    </label>
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="Имя"
                      className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-700 text-stone-100 text-xs focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-stone-400 mb-1">
                      Контакт (Email/Telegram):
                    </label>
                    <input
                      type="text"
                      value={userContact}
                      onChange={(e) => setUserContact(e.target.value)}
                      placeholder="Для обратной связи"
                      className="w-full px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-700 text-stone-100 text-xs focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !feedbackText.trim()}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50 cursor-pointer active:scale-95"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Отправка отзыва админу...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Отправить отзыв админу</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
