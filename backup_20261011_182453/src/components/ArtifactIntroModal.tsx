import React from 'react';
import { Bell, Sparkles, X, ArrowRight, ShieldCheck, HeartHandshake, Compass, MessageSquare } from 'lucide-react';

interface ArtifactIntroModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAssistant?: () => void;
}

export const ArtifactIntroModal: React.FC<ArtifactIntroModalProps> = ({
  isOpen,
  onClose,
  onOpenAssistant,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative max-w-xl w-full rounded-3xl bg-gradient-to-b from-stone-900 via-stone-950 to-stone-900 border border-amber-500/40 p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.85)] text-stone-100 space-y-6"
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-stone-900/80 text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors cursor-pointer"
          aria-label="Закрыть"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Bell Icon Glow */}
        <div className="flex items-center gap-4">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-stone-950 shadow-[0_0_25px_rgba(245,158,11,0.5)] shrink-0 animate-bounce">
            <Bell className="w-8 h-8 fill-stone-950" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-75" />
              <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-400" />
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/25">
                Артефакт Студента
              </span>
              <span className="text-[11px] font-mono text-stone-400">
                + Наставник PQ
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-100 mt-1">
              Колокольчик Внимания и Помощник
            </h2>
          </div>
        </div>

        {/* Narrative & Explanation */}
        <div className="space-y-3.5 text-xs sm:text-sm text-stone-300 leading-relaxed bg-stone-900/60 p-4 sm:p-5 rounded-2xl border border-stone-800">
          <p className="font-medium text-amber-200/90">
            🔔 Поздравляем с началом обучения в школе «Пармастер Квест»! Вам открыт первый путеводный артефакт.
          </p>
          <p>
            В банной культуре медный звон и колокольчик издавна служили сигналом сонастройки, бережного пробуждения гостя и вызова наставника.
          </p>

          <div className="pt-2 border-t border-stone-800 space-y-2">
            <h4 className="text-xs uppercase font-mono tracking-wider text-amber-400 font-semibold">
              Что даёт этот артефакт и как им пользоваться:
            </h4>
            <ul className="space-y-2 text-stone-300">
              <li className="flex items-start gap-2.5">
                <span className="text-amber-400 shrink-0 mt-0.5 font-bold">1.</span>
                <span>
                  <strong>Плавающая кнопка колокольчика:</strong> Теперь колокольчик будет всегда под рукой у края экрана в виде компактной кнопки.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-amber-400 shrink-0 mt-0.5 font-bold">2.</span>
                <span>
                  <strong>Мудрая Сова PQ — личный помощник:</strong> При нажатии на колокольчик появляется Сова PQ. Ей можно задать любой вопрос о прохождении станций и получить мгновенный совет.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-amber-400 shrink-0 mt-0.5 font-bold">3.</span>
                <span>
                  <strong>Прямая связь с Антоном Ирхиным:</strong> Через помощника можно сообщить о баге или неисправности, поделиться впечатлениями, оставить отзыв и рассказать, откуда вы узнали о школе. Все сообщения мгновенно доставляются основателю!
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
          <button
            onClick={() => {
              onClose();
              if (onOpenAssistant) {
                onOpenAssistant();
              }
            }}
            className="w-full sm:flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs sm:text-sm uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(245,158,11,0.4)] cursor-pointer active:scale-95"
          >
            <span>Познакомиться с Совой PQ</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-800 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
          >
            Перейти к уроку
          </button>
        </div>
      </div>
    </div>
  );
};
