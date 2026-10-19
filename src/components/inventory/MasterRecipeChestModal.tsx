import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  Unlock,
  Key,
  Sparkles,
  Zap,
  Printer,
  Copy,
  Check,
  ShieldCheck,
  Flame,
  Droplet,
} from 'lucide-react';
import { MASTER_RECIPE_SCROLL } from '../../data/secretKnowledgeData';
import { playSuccessChime, playSteamSound, playWoodTap } from '../../utils/audio';
import confetti from 'canvas-confetti';

interface MasterRecipeChestModalProps {
  isOpen: boolean;
  onClose: () => void;
  hasKey: boolean;
  soundEnabled: boolean;
  onGoToTriage?: () => void;
}

export const MasterRecipeChestModal: React.FC<MasterRecipeChestModalProps> = ({
  isOpen,
  onClose,
  hasKey,
  soundEnabled,
  onGoToTriage,
}) => {
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('banya_recipe_chest_opened') === 'true';
    }
    return false;
  });

  const [isOpeningAnim, setIsOpeningAnim] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('banya_recipe_chest_opened') === 'true') {
      setIsUnlocked(true);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleUnlockChest = () => {
    if (!hasKey) return;

    setIsOpeningAnim(true);
    playSteamSound(soundEnabled);

    setTimeout(() => {
      setIsOpeningAnim(false);
      setIsUnlocked(true);
      playSuccessChime(soundEnabled);
      if (typeof window !== 'undefined') {
        localStorage.setItem('banya_recipe_chest_opened', 'true');
      }

      try {
        confetti({
          particleCount: 75,
          spread: 80,
          origin: { y: 0.5 },
        });
      } catch {
        // ignore
      }
    }, 900);
  };

  const handleCopy = () => {
    if (!MASTER_RECIPE_SCROLL) return;
    const fullText = `${MASTER_RECIPE_SCROLL.title}\n\n${MASTER_RECIPE_SCROLL.summary}\n\n${MASTER_RECIPE_SCROLL.fullContent}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    playWoodTap(soundEnabled);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    playWoodTap(soundEnabled);
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl border-2 border-amber-500/50 bg-stone-950 text-stone-100 shadow-[0_0_50px_rgba(245,158,11,0.25)] overflow-hidden">
        
        {/* Glow backdrop */}
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-stone-800 bg-stone-900/80 flex items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-500/20 border border-amber-400 p-1 flex items-center justify-center shrink-0 shadow-inner">
              <img
                src="/images/forged-chest.svg"
                alt="Сундук с рецептом"
                className="w-full h-full object-contain filter drop-shadow"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                  Уровень 4 · Безопасность мастера
                </span>
                {isUnlocked ? (
                  <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    <span>ОТКРЫТ</span>
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-stone-400 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-amber-500" />
                    <span>ЗАКРЫТ</span>
                  </span>
                )}
              </div>
              <h3 className="font-serif text-base sm:text-lg font-bold text-stone-100 mt-0.5">
                Сундук с тайным рецептом пармастера
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-400 hover:text-white hover:border-stone-700 transition-colors cursor-pointer"
            title="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-6 space-y-5 relative z-10">
          {!isUnlocked ? (
            /* STATE 1: CHEST IS LOCKED */
            <div className="flex flex-col items-center justify-center text-center py-6 sm:py-10 px-3 space-y-6 max-w-md mx-auto">
              
              {/* Big Chest Visual */}
              <div className="relative">
                <div
                  className={`w-36 h-36 sm:w-44 sm:h-44 rounded-3xl bg-gradient-to-b from-stone-900 via-stone-950 to-stone-900 border-2 ${
                    hasKey ? 'border-amber-400 shadow-[0_0_35px_rgba(245,158,11,0.35)] ring-2 ring-amber-400/40' : 'border-stone-700'
                  } shadow-2xl flex flex-col items-center justify-center p-4 relative transition-all ${
                    isOpeningAnim ? 'scale-110 animate-pulse ring-4 ring-amber-400' : ''
                  }`}
                >
                  <img
                    src="/images/forged-chest.svg"
                    alt="Сундук"
                    className="w-24 h-24 sm:w-28 sm:h-28 object-contain filter drop-shadow-xl"
                  />
                  <div className="absolute -bottom-3 px-3 py-1 rounded-full bg-stone-950 border border-amber-500/50 text-amber-400 font-mono text-xs flex items-center gap-1.5 shadow-md">
                    {hasKey ? (
                      <>
                        <Key className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
                        <span className="font-bold">Ключ получен!</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5 text-stone-400" />
                        <span>Нужен ключ от триажа</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Text explanation */}
              <div className="space-y-2">
                <h4 className="font-serif text-xl sm:text-2xl font-bold text-stone-100">
                  {hasKey ? 'Замок готов к открытию!' : 'Сундук заперт на ключ'}
                </h4>
                <p className="text-xs sm:text-sm text-stone-400 leading-relaxed">
                  {hasKey
                    ? 'Вы успешно получили Золотой Ключ за прохождение входного триажа гостей в Разделе 2. Нажмите кнопку ниже, чтобы открыть замок и достать свиток с тайным рецептом!'
                    : 'Внутри этого сундука хранится закрытый свиток «Рецепт быстрого восстановления сил пармастера: Лимон + Соль + Мёд + Вода». Чтобы получить ключ, перейдите в раздел «Безопасность гостя» (Раздел 2) и пройдите тренажер входного триажа!'}
                </p>
              </div>

              {/* Unlock Action Button */}
              {hasKey ? (
                <button
                  onClick={handleUnlockChest}
                  disabled={isOpeningAnim}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-bold text-sm tracking-wide shadow-xl shadow-amber-500/25 transition-all cursor-pointer flex items-center justify-center gap-2 group active:scale-95 disabled:opacity-50"
                >
                  <Key className="w-4 h-4 text-stone-950 group-hover:rotate-45 transition-transform" />
                  <span>{isOpeningAnim ? 'Открываем замок...' : 'Вставить Ключ и Открыть Сундук'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onGoToTriage) onGoToTriage();
                  }}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-500/10 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Key className="w-4 h-4 text-amber-400" />
                  <span>Пройти триаж гостей в Разделе 2 за ключом →</span>
                </button>
              )}
            </div>
          ) : (
            /* STATE 2: CHEST IS UNLOCKED - ONLY CONTAINS THE MASTER BOOST RECIPE! */
            <div className="space-y-5 animate-fadeIn">
              
              {/* Header inside open chest */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-2xl shrink-0 shadow-inner">
                    ⚡
                  </div>
                  <div>
                    <h4 className="font-serif text-lg sm:text-xl font-bold text-amber-200">
                      {MASTER_RECIPE_SCROLL.title}
                    </h4>
                    <p className="text-xs text-stone-400 mt-0.5">
                      {MASTER_RECIPE_SCROLL.subtitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-800 text-xs font-medium transition-colors cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-300">Скопировано!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-amber-400" />
                        <span>Копировать</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handlePrint}
                    className="p-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-stone-200 border border-stone-800 transition-colors cursor-pointer"
                    title="Печать рецепта"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Summary Callout */}
              <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs text-amber-200 leading-relaxed flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-300 font-semibold">Назначение эликсира:</strong> {MASTER_RECIPE_SCROLL.summary}
                </div>
              </div>

              {/* Full Detailed Content */}
              <div className="space-y-2">
                <div className="text-[11px] font-mono uppercase tracking-wider text-stone-400 font-semibold">
                  Точный состав и способ приготовления:
                </div>
                <pre className="p-4 sm:p-5 rounded-2xl bg-stone-900/90 border border-stone-800 text-xs text-stone-200 font-sans whitespace-pre-wrap leading-relaxed overflow-x-auto shadow-inner">
                  {MASTER_RECIPE_SCROLL.fullContent}
                </pre>
              </div>

              {/* Key Takeaways */}
              <div className="p-4 rounded-xl bg-stone-900/60 border border-stone-800 space-y-2">
                <div className="text-xs font-semibold text-stone-200 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Ключевые правила безопасности применения:</span>
                </div>
                <ul className="space-y-1.5 pl-5 list-disc text-xs text-stone-300 leading-relaxed">
                  {MASTER_RECIPE_SCROLL.keyTakeaways.map((point, idx) => (
                    <li key={idx}>{point}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-stone-800 bg-stone-900/60 flex items-center justify-between gap-3 relative z-10">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            Закрыть
          </button>
          
          {!isUnlocked && (
            <span className="text-[11px] text-stone-400 font-mono">
              {hasKey ? 'Ключ активирован' : 'Требуется решение триажа в Разделе 2'}
            </span>
          )}
        </div>

      </div>
    </div>
  );
};
