import React, { useState } from 'react';
import { BADGES } from '../data/courseData';
import { Badge, BadgeId, LevelId } from '../types/banya';
import { playWoodTap, playSuccessChime } from '../utils/audio';
import { ItemDetailModal } from './inventory/ItemDetailModal';
import { SecretChestModal } from './inventory/SecretChestModal';
import { KeeperChallengeModal } from './inventory/KeeperChallengeModal';
import {
  Sparkles,
  Lock,
  Unlock,
  Key,
  Wrench,
  Award,
  ChevronRight,
  Flame,
  Info,
  CheckCircle2,
} from 'lucide-react';

interface BadgesShowcaseProps {
  unlockedBadges: BadgeId[];
  onNavigateToLevel?: (levelId: LevelId) => void;
  onUnlockBadge?: (badgeId: BadgeId, xp: number) => void;
  soundEnabled?: boolean;
}

export const BadgesShowcase: React.FC<BadgesShowcaseProps> = ({
  unlockedBadges,
  onNavigateToLevel,
  onUnlockBadge,
  soundEnabled = true,
}) => {
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [isChestModalOpen, setIsChestModalOpen] = useState<boolean>(false);
  const [isKeeperModalOpen, setIsKeeperModalOpen] = useState<boolean>(false);

  const hasGoldenKey = unlockedBadges.includes('golden_key');
  const unlockedCount = unlockedBadges.length;

  const handleInspectBadge = (badge: Badge) => {
    setSelectedBadge(badge);
    playWoodTap(soundEnabled);
  };

  const handleOpenChest = () => {
    setIsChestModalOpen(true);
    playWoodTap(soundEnabled);
  };

  const handleOpenKeeperChallenge = () => {
    setIsChestModalOpen(false);
    setIsKeeperModalOpen(true);
    playWoodTap(soundEnabled);
  };

  const handleKeyEarned = (badgeId: BadgeId, xp: number) => {
    if (onUnlockBadge) {
      onUnlockBadge(badgeId, xp);
    }
    // Re-open chest modal after winning so the user can immediately unlock it!
    setTimeout(() => {
      setIsKeeperModalOpen(false);
      setIsChestModalOpen(true);
    }, 400);
  };

  return (
    <div className="rounded-2xl border border-stone-800 bg-stone-900/90 p-5 sm:p-7 space-y-6 relative overflow-hidden shadow-xl">
      {/* Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-4 relative z-10">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber-400">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>Инвентарь & Награды Мастера</span>
          </div>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-100 mt-0.5">
            Боевой Арсенал и Реликвии Пармастера
          </h3>
          <p className="text-xs text-stone-400 mt-1">
            Каждый пройденный уровень открывает реальный инструмент, используемый на следующем шаге обучения. Нажмите на предмет для детального осмотра.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <div className="px-3 py-1.5 rounded-xl bg-stone-950 border border-stone-800 text-xs font-mono text-stone-300">
            Собрано инструментов: <span className="text-amber-400 font-bold">{unlockedCount}</span> из {BADGES.length}
          </div>
        </div>
      </div>

      {/* Badges / Items Shelf */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 relative z-10">
        {BADGES.map((b) => {
          const isUnlocked = unlockedBadges.includes(b.id);
          const isKeyItem = b.id === 'golden_key';

          return (
            <button
              key={b.id}
              type="button"
              onClick={() => handleInspectBadge(b)}
              className={`p-3 sm:p-3.5 rounded-2xl border text-center flex flex-col items-center justify-between transition-all cursor-pointer group relative ${
                isUnlocked
                  ? 'border-amber-500/50 bg-stone-950 shadow-md ring-1 ring-amber-500/20 hover:border-amber-400 hover:-translate-y-1 hover:shadow-amber-500/10'
                  : 'border-stone-800/80 bg-stone-950/40 opacity-55 hover:opacity-85 hover:border-stone-700'
              }`}
            >
              {/* Tool type indicator pill */}
              <div className="w-full flex items-center justify-between text-[9px] font-mono mb-1 text-stone-400">
                <span className="truncate">Ур. {b.unlockedAtLevel}</span>
                {isUnlocked ? (
                  <span className="text-emerald-400">✓</span>
                ) : (
                  <span className="text-stone-500">🔒</span>
                )}
              </div>

              {/* Big Icon */}
              <div className="text-3xl sm:text-4xl my-2 relative transition-transform group-hover:scale-110">
                {b.icon}
                {isKeyItem && isUnlocked && (
                  <span className="absolute -top-1 -right-2 text-xs animate-ping">✨</span>
                )}
              </div>

              {/* Title & Role */}
              <div className="mt-1 w-full space-y-1">
                <div
                  className={`font-semibold text-xs leading-tight line-clamp-2 ${
                    isUnlocked ? 'text-stone-100 group-hover:text-amber-300' : 'text-stone-400'
                  }`}
                >
                  {b.name}
                </div>
                <div className="text-[10px] text-amber-500/80 font-mono truncate">
                  {b.toolType === 'equipment' ? 'Инструмент' : b.toolType === 'key' ? 'Ключ' : 'Трофей'}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* SPECIAL INTERACTIVE BANNER: The Ancient Forged Chest of Secret Knowledge */}
      <div className="relative rounded-2xl bg-gradient-to-r from-amber-950/40 via-stone-950 to-stone-900 border border-amber-500/40 p-5 sm:p-6 shadow-xl overflow-hidden z-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div className="flex items-start sm:items-center gap-4">
            {/* Animated Chest Icon */}
            <div
              onClick={handleOpenChest}
              className={`w-16 h-16 sm:w-18 sm:h-18 rounded-2xl border-2 flex items-center justify-center text-3xl sm:text-4xl shadow-xl shrink-0 cursor-pointer transition-transform hover:scale-105 ${
                hasGoldenKey
                  ? 'bg-gradient-to-br from-amber-500/30 via-stone-900 to-amber-950/60 border-amber-500 ring-2 ring-amber-400/30'
                  : 'bg-stone-900 border-stone-700'
              }`}
            >
              <span className="select-none">🧰</span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-mono uppercase font-bold tracking-wider">
                  Секретные Знания
                </span>
                {hasGoldenKey ? (
                  <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Золотой Ключ найден</span>
                  </span>
                ) : (
                  <span className="text-[11px] font-mono text-stone-400 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-amber-500/60" />
                    <span>Заперт на кованый замок</span>
                  </span>
                )}
              </div>

              <h4 className="font-serif text-lg sm:text-xl font-bold text-stone-100">
                Кованый Сундук Тайных Знаний
              </h4>

              <p className="text-xs text-stone-300 max-w-xl leading-relaxed">
                Внутри хранятся 4 закрытых свитка: секретный рецепт Царского взвара из 12 дикоросов, чек-лист идеальной парной от Антона Ирхина, техника Ледяного Дыхания и матрица золотой кривой пара 60/60.
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row gap-2 shrink-0">
            {hasGoldenKey ? (
              <button
                onClick={handleOpenChest}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
              >
                <Key className="w-4 h-4 text-stone-950" />
                <span>Открыть Сундук</span>
              </button>
            ) : (
              <>
                <button
                  onClick={handleOpenKeeperChallenge}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Получить Ключ (Тайное Задание)</span>
                </button>
                <button
                  onClick={handleOpenChest}
                  className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5 text-stone-400" />
                  <span>Осмотреть Сундук</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* MODAL 1: Item Inspection */}
      <ItemDetailModal
        badge={selectedBadge}
        isUnlocked={selectedBadge ? unlockedBadges.includes(selectedBadge.id) : false}
        onClose={() => setSelectedBadge(null)}
        onNavigateToLevel={onNavigateToLevel}
      />

      {/* MODAL 2: Ancient Secret Chest */}
      <SecretChestModal
        isOpen={isChestModalOpen}
        hasKey={hasGoldenKey}
        onClose={() => setIsChestModalOpen(false)}
        onOpenKeeperChallenge={handleOpenKeeperChallenge}
        soundEnabled={soundEnabled}
      />

      {/* MODAL 3: Keeper's Challenge Quest */}
      <KeeperChallengeModal
        isOpen={isKeeperModalOpen}
        onClose={() => setIsKeeperModalOpen(false)}
        onUnlockKey={handleKeyEarned}
        soundEnabled={soundEnabled}
      />
    </div>
  );
};
