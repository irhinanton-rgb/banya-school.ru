import React, { useState } from 'react';
import { SECRET_KNOWLEDGE_SCROLLS, SecretScroll } from '../../data/secretKnowledgeData';
import { playSuccessChime, playWoodTap } from '../../utils/audio';
import confetti from 'canvas-confetti';
import {
  X,
  Lock,
  Unlock,
  Key,
  Sparkles,
  Scroll,
  Copy,
  Check,
  Flame,
  Printer,
  ChevronRight,
  ShieldCheck,
  BookOpen,
} from 'lucide-react';

interface SecretChestModalProps {
  isOpen: boolean;
  hasKey: boolean;
  onClose: () => void;
  onOpenKeeperChallenge: () => void;
  soundEnabled: boolean;
}

export const SecretChestModal: React.FC<SecretChestModalProps> = ({
  isOpen,
  hasKey,
  onClose,
  onOpenKeeperChallenge,
  soundEnabled,
}) => {
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    try {
      return localStorage.getItem('banya_secret_chest_opened') === 'true';
    } catch {
      return false;
    }
  });

  const [activeScroll, setActiveScroll] = useState<SecretScroll>(SECRET_KNOWLEDGE_SCROLLS[0]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isOpeningAnim, setIsOpeningAnim] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleUnlockChest = () => {
    if (!hasKey) return;
    setIsOpeningAnim(true);
    playWoodTap(soundEnabled);

    setTimeout(() => {
      setIsUnlocked(true);
      setIsOpeningAnim(false);
      try {
        localStorage.setItem('banya_secret_chest_opened', 'true');
      } catch {
        // ignore
      }
      playSuccessChime(soundEnabled);
      confetti({
        particleCount: 100,
        spread: 100,
        origin: { y: 0.5 },
      });
    }, 700);
  };

  const handleCopyScroll = (scroll: SecretScroll) => {
    const textToCopy = `${scroll.title}\n\n${scroll.summary}\n\n${scroll.fullContent}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(scroll.id);
    playWoodTap(soundEnabled);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-stone-900 border border-amber-500/50 rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl relative animate-scale-up">
        {/* Ambient glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-800 flex items-center justify-between shrink-0 bg-stone-950/60 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500/30 to-amber-950/50 border border-amber-500/50 flex items-center justify-center text-2xl shadow-lg shrink-0">
              {isUnlocked ? '🧰' : '🔒'}
            </div>
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Тайник Академии Банного Мастерства</span>
              </div>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-100 flex items-center gap-2">
                <span>Кованый Сундук Тайных Знаний</span>
                {isUnlocked && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-normal">
                    Отперт ключом
                  </span>
                )}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-stone-800 text-stone-400 hover:text-stone-100 hover:bg-stone-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-6 space-y-6 relative z-10">
          {/* STATE 1: CHEST IS LOCKED */}
          {!isUnlocked ? (
            <div className="flex flex-col items-center justify-center text-center py-8 sm:py-12 px-4 space-y-6 max-w-lg mx-auto">
              {/* Chest Visual */}
              <div className="relative">
                <div
                  className={`w-36 h-36 sm:w-44 sm:h-44 rounded-3xl bg-gradient-to-b from-stone-800 via-stone-900 to-stone-950 border-2 ${
                    hasKey ? 'border-amber-500 shadow-amber-500/20' : 'border-stone-700'
                  } shadow-2xl flex flex-col items-center justify-center relative transition-transform ${
                    isOpeningAnim ? 'scale-110 animate-pulse ring-4 ring-amber-400' : ''
                  }`}
                >
                  <div className="text-6xl sm:text-7xl mb-1">🧰</div>
                  <div className="absolute -bottom-3 px-3 py-1 rounded-full bg-stone-950 border border-amber-500/50 text-amber-400 font-mono text-xs flex items-center gap-1.5 shadow-md">
                    {hasKey ? (
                      <>
                        <Key className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
                        <span>Ключ в наличии!</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5 text-stone-400" />
                        <span>Заперт на засов</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Text explanation */}
              <div className="space-y-2">
                <h4 className="font-serif text-xl sm:text-2xl font-bold text-stone-100">
                  {hasKey
                    ? 'Замок готов к открытию!'
                    : 'Сундук заперт на древний кованый замок'}
                </h4>
                <p className="text-xs sm:text-sm text-stone-400 leading-relaxed">
                  {hasKey
                    ? 'В вашем инвентаре есть Золотой Ключ Тайных Знаний. Поверните его в замке, чтобы снять печать и изучить секретные свитки мастеров.'
                    : 'Внутри хранятся 4 закрытых свитка: секретный рецепт Царского взвара из 12 трав, чек-лист Антона Ирхина, техника Ледяного Дыхания и формула золотой кривой пара 60/60.'}
                </p>
              </div>

              {/* Action buttons */}
              {hasKey ? (
                <button
                  onClick={handleUnlockChest}
                  disabled={isOpeningAnim}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-bold text-sm tracking-wide shadow-xl shadow-amber-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 group"
                >
                  <Key className="w-4 h-4 text-stone-950 group-hover:rotate-45 transition-transform" />
                  <span>{isOpeningAnim ? 'Открываем замок...' : 'Вставить Золотой Ключ и Открыть Сундук'}</span>
                </button>
              ) : (
                <div className="w-full space-y-3">
                  <div className="p-3.5 rounded-xl bg-stone-950/80 border border-stone-800 text-xs text-stone-300 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-stone-400">
                      <Key className="w-4 h-4 text-amber-500/50" />
                      <span>Требуется: <strong>Золотой Ключ</strong></span>
                    </div>
                    <span className="font-mono text-amber-400 text-[11px]">0 / 1</span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <button
                      onClick={onOpenKeeperChallenge}
                      className="flex-1 px-4 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
                    >
                      <span>Пройти испытание и получить ключ</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-[11px] text-stone-500 font-mono">
                    💡 Ключ также можно получить за прохождение 6-го уровня курса.
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* STATE 2: CHEST IS UNLOCKED, DISPLAY SCROLLS */
            <div className="space-y-6">
              {/* Top Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/40 via-stone-900 to-amber-950/30 border border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center text-xl shrink-0">
                    📜
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-stone-100">
                      Печать снята: 4 Тайных Свитка Мастера
                    </h4>
                    <p className="text-xs text-stone-400">
                      Материалы доступны для изучения, копирования и распечатки.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handlePrint}
                  className="px-3.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-stone-100 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <Printer className="w-3.5 h-3.5 text-amber-400" />
                  <span>Печать конспекта</span>
                </button>
              </div>

              {/* Scroll Selector Tabs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {SECRET_KNOWLEDGE_SCROLLS.map((scroll) => {
                  const isSelected = activeScroll.id === scroll.id;
                  return (
                    <button
                      key={scroll.id}
                      onClick={() => {
                        setActiveScroll(scroll);
                        playWoodTap(soundEnabled);
                      }}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                        isSelected
                          ? 'border-amber-500 bg-amber-950/30 shadow-md ring-1 ring-amber-500/40'
                          : 'border-stone-800 bg-stone-950/60 hover:bg-stone-850 hover:border-stone-700'
                      }`}
                    >
                      <span className="text-2xl shrink-0">{scroll.icon}</span>
                      <div className="min-w-0">
                        <div
                          className={`font-semibold text-xs truncate ${
                            isSelected ? 'text-amber-200' : 'text-stone-200'
                          }`}
                        >
                          {scroll.title}
                        </div>
                        <div className="text-[10px] text-stone-400 font-mono mt-0.5 truncate">
                          {scroll.subtitle}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Active Scroll Detailed View */}
              <div className="p-5 sm:p-6 rounded-2xl bg-stone-950/90 border border-amber-500/30 space-y-5 shadow-xl relative">
                {/* Scroll Title & Copy Action */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{activeScroll.icon}</span>
                    <div>
                      <h4 className="font-serif text-lg sm:text-xl font-bold text-amber-100">
                        {activeScroll.title}
                      </h4>
                      <div className="text-xs text-stone-400 mt-0.5">
                        {activeScroll.subtitle}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleCopyScroll(activeScroll)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition-colors cursor-pointer self-start sm:self-auto shadow-sm"
                  >
                    {copiedId === activeScroll.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-300">Скопировано!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-amber-400" />
                        <span>Скопировать рецепт</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Summary */}
                <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/20 text-xs text-amber-200/90 leading-relaxed">
                  <strong>Суть секрета:</strong> {activeScroll.summary}
                </div>

                {/* Full Content */}
                <div className="space-y-2">
                  <div className="text-xs font-mono uppercase text-stone-400 font-semibold tracking-wider">
                    Полный текст свитка:
                  </div>
                  <pre className="p-4 rounded-xl bg-stone-900 border border-stone-800 text-xs text-stone-200 font-sans whitespace-pre-wrap leading-relaxed overflow-x-auto">
                    {activeScroll.fullContent}
                  </pre>
                </div>

                {/* Key Takeaways */}
                <div className="p-4 rounded-xl bg-stone-900/60 border border-stone-800 space-y-2">
                  <div className="text-xs font-semibold text-stone-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Главные выводы для практики:</span>
                  </div>
                  <ul className="space-y-1.5 pl-5 list-disc text-xs text-stone-300 leading-relaxed">
                    {activeScroll.keyTakeaways.map((point, pIdx) => (
                      <li key={pIdx}>{point}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-800 bg-stone-950/60 flex items-center justify-between gap-3 shrink-0 relative z-10">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            Закрыть
          </button>

          {!isUnlocked && !hasKey && (
            <button
              onClick={onOpenKeeperChallenge}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold transition-all cursor-pointer shadow-md"
            >
              <Key className="w-3.5 h-3.5" />
              <span>Получить Золотой Ключ</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
