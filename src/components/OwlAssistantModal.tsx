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
  User as UserIcon,
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

interface ChatMessage {
  id: string;
  sender: 'user' | 'owl';
  text: string;
  timestamp: string;
}

export const OwlAssistantModal: React.FC<OwlAssistantModalProps> = ({
  isOpen,
  onClose,
  progress,
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminMessageType>('question');
  
  // Interactive Chat history
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'owl',
      text: `Ух! 🦉 Приветствую тебя, ${progress.name || 'дорогой ученик'}! Я — Сова PQ, твой персональный банный наставник. Задай мне любой вопрос о прохождении квеста, температуре камней, хвате веников или кондициях парной, и я сразу помогу!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);

  // Form fields
  const [questionText, setQuestionText] = useState('');
  const [bugText, setBugText] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [userName, setUserName] = useState(progress.name || user?.displayName || '');
  const [userContact, setUserContact] = useState(user?.email || '');
  const [referralSource, setReferralSource] = useState('Telegram-канал Батя в Бане');
  const [customReferral, setCustomReferral] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successStatus, setSuccessStatus] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const quickQuestions = [
    'Какая температура нужна для лёгкого пара?',
    `Как лучше пройти Станцию ${progress.activeLevelId || 1}?`,
    'В чём секрет кондиций 60/60?',
    'Как правильно держать веник в руке?',
  ];

  const handleSendQuestion = async (textToSend?: string) => {
    const question = (textToSend || questionText).trim();
    if (!question || isSubmitting) return;

    const userMsg: ChatMessage = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: question,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatHistory(prev => [...prev, userMsg]);
    setQuestionText('');
    setIsSubmitting(true);
    setSuccessStatus(null);
    setErrorStatus(null);

    try {
      // 1. Ask Gemini AI for real-time guidance
      let reply = 'Твой вопрос принят мудрой Совой PQ! Для успешного прохождения квеста изучай теорию на станциях, внимательно следи за кондициями 60/60 и закрепляй знания в симуляторах. Ух! 🦉';

      try {
        const res = await fetch('/api/assistant-ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question,
            currentLevel: progress.activeLevelId || 1,
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
        console.warn('AI assistant request failed, using default guidance:', err);
      }

      const owlMsg: ChatMessage = {
        id: 'owl-' + Date.now(),
        sender: 'owl',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatHistory(prev => [...prev, owlMsg]);

      // 2. Also send to Admin via Firestore + Telegram in background
      sendAdminMessage({
        type: 'question',
        message: question,
        answer: reply,
        currentLevel: progress.activeLevelId || 1,
        userId: user?.uid || 'guest',
        userName: userName || progress.name || 'Гость курса',
        userEmail: userContact || user?.email || '',
        referralSource: referralSource === 'Другое' ? customReferral : referralSource,
      }).catch(err => console.warn('Background admin send warning:', err));

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
        className="relative max-w-2xl w-full h-[90vh] max-h-[850px] flex flex-col rounded-3xl bg-gradient-to-b from-stone-900 via-stone-950 to-stone-900 border border-amber-500/40 shadow-[0_20px_70px_rgba(0,0,0,0.9)] text-stone-100 overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Header with Owl Assistant Avatar (Fixed compact dimensions) */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-stone-800 bg-stone-900/80 shrink-0">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="relative flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-stone-950/60 p-1 border border-amber-500/30 shrink-0">
              <img
                src="/images/PQ.png"
                alt="Помощник Сова PQ"
                className="w-10 h-10 sm:w-12 sm:h-12 max-w-full max-h-full object-contain filter drop-shadow-[0_2px_8px_rgba(245,158,11,0.5)] hover:scale-105 transition-transform"
              />
              <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-stone-900" />
              </span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/25 shrink-0">
                  ИИ Наставник Сова PQ
                </span>
                <span className="text-[11px] font-mono text-emerald-400 font-semibold flex items-center gap-1 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                  Онлайн
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-serif font-bold text-stone-100 mt-0.5 truncate">
                Помощник PQ & Связь с Наставником
              </h2>
              <p className="text-xs text-stone-400 hidden sm:block truncate">
                Задайте вопрос ИИ-Сове по квесту, сообщите о баге или оставьте отзыв
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-stone-800/80 text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors cursor-pointer shrink-0 ml-2"
            aria-label="Закрыть окно"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-stone-800 bg-stone-950/80 px-4 sm:px-6 gap-2 sm:gap-4 overflow-x-auto shrink-0">
          <button
            onClick={() => { setActiveTab('question'); setSuccessStatus(null); setErrorStatus(null); }}
            className={`flex items-center gap-2 py-3 px-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'question'
                ? 'border-amber-400 text-amber-300 font-semibold'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Вопрос Сове (ИИ)</span>
          </button>

          <button
            onClick={() => { setActiveTab('bug'); setSuccessStatus(null); setErrorStatus(null); }}
            className={`flex items-center gap-2 py-3 px-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'bug'
                ? 'border-red-400 text-red-300 font-semibold'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Bug className="w-4 h-4 text-red-400 shrink-0" />
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
            <Heart className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Отзывы и Впечатления</span>
          </button>
        </div>

        {/* Scrollable Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
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

          {/* TAB 1: QUESTION TO OWL PQ (INTERACTIVE AI CHAT) */}
          {activeTab === 'question' && (
            <div className="space-y-4 flex flex-col h-full">
              {/* Quick Prompt Chips */}
              <div>
                <span className="text-[11px] font-mono text-stone-400 uppercase tracking-wider mb-2 block">
                  Быстрые вопросы Сове:
                </span>
                <div className="flex flex-wrap gap-2">
                  {quickQuestions.map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handleSendQuestion(chip)}
                      className="px-3 py-1.5 rounded-full bg-stone-800/80 hover:bg-amber-500/20 text-stone-300 hover:text-amber-300 text-xs border border-stone-700/80 hover:border-amber-500/40 transition-all text-left cursor-pointer"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Thread */}
              <div className="space-y-3 min-h-[180px] max-h-[340px] overflow-y-auto pr-1 rounded-2xl bg-stone-950/70 p-3.5 border border-stone-800/80 flex-1">
                {chatHistory.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2.5 ${
                      msg.sender === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {msg.sender === 'owl' && (
                      <div className="w-7 h-7 shrink-0 rounded-lg bg-amber-500/10 p-1 border border-amber-500/20 flex items-center justify-center">
                        <img
                          src="/images/PQ.png"
                          alt="Сова"
                          className="w-full h-full object-contain drop-shadow"
                        />
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-amber-500 text-stone-950 font-medium rounded-tr-sm shadow-md'
                          : 'bg-stone-900 border border-stone-700/70 text-stone-100 rounded-tl-sm shadow-lg whitespace-pre-wrap'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4 mb-1 text-[10px] opacity-75 font-mono">
                        <span className="font-semibold">
                          {msg.sender === 'user' ? (userName || 'Ученик') : 'Сова PQ'}
                        </span>
                        <span>{msg.timestamp}</span>
                      </div>
                      <div>{msg.text}</div>
                    </div>

                    {msg.sender === 'user' && (
                      <div className="w-7 h-7 shrink-0 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
                        <UserIcon className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                ))}

                {isSubmitting && (
                  <div className="flex items-start gap-2.5 justify-start animate-pulse">
                    <div className="w-7 h-7 shrink-0 rounded-lg bg-amber-500/10 p-1 border border-amber-500/20 flex items-center justify-center">
                      <img
                        src="/images/PQ.png"
                        alt="Сова"
                        className="w-full h-full object-contain drop-shadow"
                      />
                    </div>
                    <div className="bg-stone-900 border border-stone-700/70 text-stone-300 rounded-2xl px-4 py-2.5 text-xs flex items-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                      <span>Сова PQ обдумывает ответ...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input Box */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendQuestion();
                }}
                className="space-y-3"
              >
                <div className="relative">
                  <textarea
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendQuestion();
                      }
                    }}
                    placeholder="Задайте вопрос Сове (нажмите Enter для отправки)..."
                    rows={2}
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 pr-12 rounded-2xl bg-stone-900 border border-stone-700 text-stone-100 placeholder-stone-500 text-xs sm:text-sm focus:outline-none focus:border-amber-400 transition-colors resize-none"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting || !questionText.trim()}
                    className="absolute right-2.5 bottom-3.5 p-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold transition-all disabled:opacity-40 cursor-pointer shadow-md active:scale-95"
                    title="Отправить вопрос"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between text-[11px] text-stone-400 px-1 font-mono">
                  <span>✨ Сова отвечает мгновенно на базе ИИ</span>
                  <span>Копия сохраняется для наставника</span>
                </div>
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
                    placeholder="Например: на 1-м уровне кнопка вентиляции не открывает заслонку или таймер завис..."
                    rows={4}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-stone-900 border border-stone-700 text-stone-100 placeholder-stone-500 text-xs sm:text-sm focus:outline-none focus:border-red-400 transition-colors resize-none"
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
