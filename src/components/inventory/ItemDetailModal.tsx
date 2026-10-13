import React from 'react';
import { Badge, LevelId } from '../../types/banya';
import { X, CheckCircle2, Lock, Sparkles, ArrowRight, ShieldCheck, Flame, Wrench } from 'lucide-react';

interface ItemDetailModalProps {
  badge: Badge | null;
  isUnlocked: boolean;
  onClose: () => void;
  onNavigateToLevel?: (levelId: LevelId) => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  badge,
  isUnlocked,
  onClose,
  onNavigateToLevel,
}) => {
  if (!badge) return null;

  const getToolTypeLabel = () => {
    switch (badge.toolType) {
      case 'equipment':
        return 'Рабочий инструмент мастера';
      case 'key':
        return 'Магический артефакт / Ключ';
      case 'trophy':
        return 'Высший знак отличия';
      default:
        return 'Реликвия Пармастера';
    }
  };

  const getRarityBadge = () => {
    switch (badge.rarity) {
      case 'legendary':
        return { text: 'Легендарный', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
      case 'epic':
        return { text: 'Эпический инструмент', bg: 'bg-purple-500/20 text-purple-300 border-purple-500/40' };
      case 'rare':
        return { text: 'Редкий инструмент', bg: 'bg-blue-500/20 text-blue-300 border-blue-500/40' };
      default:
        return { text: 'Базовый', bg: 'bg-stone-800 text-stone-300 border-stone-700' };
    }
  };

  const rarity = getRarityBadge();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-stone-900 border border-amber-500/40 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl relative animate-scale-up">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="p-5 border-b border-stone-800 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono border ${rarity.bg}`}>
              {rarity.text}
            </span>
            <span className="text-xs text-stone-400 font-mono">
              Уровень {badge.unlockedAtLevel}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-stone-800 text-stone-400 hover:text-stone-100 hover:bg-stone-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 relative z-10">
          {/* Icon & Status */}
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="relative">
              <div
                className={`w-24 h-24 rounded-2xl flex items-center justify-center text-5xl shadow-xl transition-transform ${
                  isUnlocked
                    ? 'bg-gradient-to-br from-amber-500/20 to-amber-950/40 border border-amber-500/60 ring-4 ring-amber-500/20 scale-105'
                    : 'bg-stone-950 border border-stone-800 opacity-60'
                }`}
              >
                {badge.icon}
              </div>

              {!isUnlocked && (
                <div className="absolute -bottom-2 -right-2 p-1.5 rounded-full bg-stone-950 border border-stone-700 text-stone-400">
                  <Lock className="w-4 h-4" />
                </div>
              )}
            </div>

            <div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-100">
                {badge.name}
              </h3>
              <div className="text-xs text-amber-400 font-mono mt-0.5 flex items-center justify-center gap-1.5">
                <Wrench className="w-3.5 h-3.5" />
                <span>{getToolTypeLabel()}</span>
              </div>
            </div>

            {/* Ownership status badge */}
            <div className="pt-1">
              {isUnlocked ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Получено в ваш рабочий инвентарь</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-950/80 border border-stone-800 text-stone-400 text-xs">
                  <Lock className="w-3.5 h-3.5 text-stone-500" />
                  <span>Открывается за прохождение Уровня {badge.unlockedAtLevel}</span>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="p-4 rounded-xl bg-stone-950/60 border border-stone-800/80 space-y-2">
            <div className="text-xs font-semibold text-stone-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>О реликвии:</span>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed">
              {badge.description}
            </p>
          </div>

          {/* Practical Application */}
          {badge.howToUse && (
            <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-2">
              <div className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>Как применяется на практике:</span>
              </div>
              <p className="text-xs text-amber-100/90 leading-relaxed">
                {badge.howToUse}
              </p>
            </div>
          )}

          {/* Next Level Synergy */}
          {badge.nextLevelSynergy && (
            <div className="p-4 rounded-xl bg-stone-950/80 border border-stone-800 space-y-1.5">
              <div className="text-xs font-semibold text-stone-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Связка со следующим уровнем:</span>
              </div>
              <p className="text-xs text-stone-300 leading-relaxed">
                {badge.nextLevelSynergy}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-800 bg-stone-950/60 flex items-center justify-between gap-3 relative z-10">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            Закрыть
          </button>

          {!isUnlocked && onNavigateToLevel && (
            <button
              onClick={() => {
                onClose();
                onNavigateToLevel(badge.unlockedAtLevel as LevelId);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold transition-all cursor-pointer shadow-md"
            >
              <span>Перейти к Уровню {badge.unlockedAtLevel}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
