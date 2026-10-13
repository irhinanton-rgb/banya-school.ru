import React, { useState, useMemo } from 'react';
import { HERBS_LIBRARY, HerbLibraryItem } from '../../data/herbsLibraryData';
import { playWoodTap, playSteamSound } from '../../utils/audio';
import {
  Search,
  BookOpen,
  Sparkles,
  Flame,
  AlertTriangle,
  Heart,
  Droplet,
  Compass,
  CheckCircle2,
  X,
  Share2,
  Info,
  Leaf,
  Filter,
} from 'lucide-react';

interface HerbsEncyclopediaProps {
  soundEnabled: boolean;
  onGrantXp?: (amount: number) => void;
  onSelectForBrew?: (herb: HerbLibraryItem) => void;
}

export const HerbsEncyclopedia: React.FC<HerbsEncyclopediaProps> = ({
  soundEnabled,
  onGrantXp,
  onSelectForBrew,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedHerb, setSelectedHerb] = useState<HerbLibraryItem | null>(null);
  const [readItems, setReadItems] = useState<Set<string>>(new Set());

  // Filter herbs based on search query and category
  const filteredHerbs = useMemo(() => {
    return HERBS_LIBRARY.filter((item) => {
      const matchesCategory =
        selectedCategory === 'all' || item.category === selectedCategory;

      const query = searchQuery.toLowerCase().trim();
      if (!query) return matchesCategory;

      const matchesSearch =
        item.name.toLowerCase().includes(query) ||
        item.botanicalName.toLowerCase().includes(query) ||
        item.aromaProfile.toLowerCase().includes(query) ||
        item.provenMedicalEffect.toLowerCase().includes(query) ||
        item.rusTraditionAndUsage.toLowerCase().includes(query) ||
        item.folkloreAndSigns.toLowerCase().includes(query) ||
        item.synergyTags.some((tag) => tag.toLowerCase().includes(query));

      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const handleOpenHerb = (herb: HerbLibraryItem) => {
    setSelectedHerb(herb);
    playWoodTap(soundEnabled);

    // Track read progress and grant XP for exploring
    if (!readItems.has(herb.id)) {
      const nextRead = new Set(readItems);
      nextRead.add(herb.id);
      setReadItems(nextRead);

      if (nextRead.size === 5 && onGrantXp) {
        onGrantXp(30); // Award XP for researching 5 herbs
      } else if (nextRead.size === 12 && onGrantXp) {
        onGrantXp(50); // Award XP for deep herb mastery
      }
    }
  };

  const categories = [
    { id: 'all', label: 'Все растения', count: HERBS_LIBRARY.length, icon: '🌿' },
    { id: 'herbs', label: 'Луговые травы', count: HERBS_LIBRARY.filter((h) => h.category === 'herbs').length, icon: '🌸' },
    { id: 'conifers', label: 'Хвойный лес', count: HERBS_LIBRARY.filter((h) => h.category === 'conifers').length, icon: '🌲' },
    { id: 'eucalyptus', label: 'Эвкалипты', count: HERBS_LIBRARY.filter((h) => h.category === 'eucalyptus').length, icon: '🍃' },
    { id: 'brooms', label: 'Рабочие веники', count: HERBS_LIBRARY.filter((h) => h.category === 'brooms').length, icon: '🪵' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-emerald-500/5 to-transparent border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>Энциклопедия Пармастера · Глава 3</span>
          </div>
          <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-100 mt-1">
            Библиотека Банных Трав, Хвои & Веников
          </h3>
          <p className="text-xs text-stone-400 mt-0.5 max-w-xl leading-relaxed">
            Научно доказанные физиологические свойства, обычаи Древней Руси, народные приметы и секреты профессионального запаривания для правильного пара.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="px-3.5 py-2 rounded-xl bg-stone-900 border border-stone-800 text-center">
            <div className="text-[10px] text-stone-400 uppercase font-mono">Изучено</div>
            <div className="text-sm font-bold text-emerald-400">
              {readItems.size} / {HERBS_LIBRARY.length}
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по названию, аромату, эффекту (например: сон, суставы, бронхи, танины, донник)..."
            className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-amber-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                playWoodTap(soundEnabled);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-amber-500 text-stone-950 shadow-md font-bold'
                  : 'bg-stone-900/80 text-stone-400 hover:text-stone-200 hover:bg-stone-800 border border-stone-800'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                selectedCategory === cat.id ? 'bg-stone-950/20 text-stone-950' : 'bg-stone-800 text-stone-400'
              }`}>
                {cat.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Herb Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredHerbs.map((herb) => {
          const isRead = readItems.has(herb.id);

          return (
            <div
              key={herb.id}
              onClick={() => handleOpenHerb(herb)}
              className="p-4 rounded-2xl bg-stone-900/70 hover:bg-stone-900 border border-stone-800 hover:border-amber-500/50 transition-all cursor-pointer flex flex-col justify-between space-y-3 group shadow-sm hover:shadow-lg relative overflow-hidden"
            >
              {/* Card Header */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-3xl p-1 rounded-xl bg-stone-950 border border-stone-800 shadow-inner group-hover:scale-110 transition-transform">
                      {herb.icon}
                    </span>
                    <div>
                      <h4 className="font-bold text-sm text-stone-100 group-hover:text-amber-300 transition-colors leading-tight">
                        {herb.name}
                      </h4>
                      <div className="text-[11px] text-stone-400 font-mono italic mt-0.5">
                        {herb.botanicalName}
                      </div>
                    </div>
                  </div>

                  {isRead && (
                    <span className="text-emerald-400 text-xs shrink-0" title="Изучено">
                      <CheckCircle2 className="w-4 h-4" />
                    </span>
                  )}
                </div>

                {/* Aroma Profile */}
                <div className="p-2 rounded-xl bg-stone-950/80 border border-stone-800/80 text-[11px] text-amber-200/90 leading-relaxed mb-2.5">
                  <span className="text-stone-400 font-semibold">Аромат: </span>
                  {herb.aromaProfile}
                </div>

                {/* Short Medical Summary */}
                <p className="text-xs text-stone-300 line-clamp-2 leading-relaxed">
                  {herb.provenMedicalEffect}
                </p>
              </div>

              {/* Bottom Tags & Action */}
              <div className="border-t border-stone-800/80 pt-2.5 flex items-center justify-between gap-2">
                <div className="flex flex-wrap gap-1">
                  {herb.synergyTags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-md bg-stone-800/80 border border-stone-700/60 text-stone-300 text-[10px]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <span className="text-xs text-amber-400 font-semibold group-hover:translate-x-1 transition-transform shrink-0 flex items-center gap-0.5">
                  Читать →
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {filteredHerbs.length === 0 && (
        <div className="text-center py-12 space-y-3 rounded-2xl border border-stone-800 bg-stone-950/50 p-6">
          <Leaf className="w-10 h-10 text-stone-600 mx-auto" />
          <h4 className="font-bold text-stone-300 text-sm">Ничего не найдено</h4>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Попробуйте изменить поисковый запрос или переключить категорию трав.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="px-4 py-2 rounded-xl bg-stone-800 text-stone-200 text-xs font-semibold hover:bg-stone-700 transition-colors"
          >
            Сбросить фильтры
          </button>
        </div>
      )}

      {/* Comprehensive Herb Details Modal */}
      {selectedHerb && (
        <div className="fixed inset-0 z-50 bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="relative w-full max-w-2xl max-h-[90vh] rounded-3xl bg-stone-900 border border-stone-700 shadow-2xl overflow-y-auto p-5 sm:p-7 space-y-6 animate-scale-in">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-stone-800 pb-4">
              <div className="flex items-center gap-3.5">
                <span className="text-4xl p-2.5 rounded-2xl bg-stone-950 border border-stone-800 shadow-inner">
                  {selectedHerb.icon}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-semibold">
                      {selectedHerb.categoryTitle}
                    </span>
                  </div>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-100 mt-0.5">
                    {selectedHerb.name}
                  </h3>
                  <p className="text-xs text-stone-400 font-mono italic">
                    {selectedHerb.botanicalName}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedHerb(null)}
                className="p-2 rounded-xl text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors cursor-pointer"
                aria-label="Закрыть"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Aroma Bar */}
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-amber-300">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Ароматический профиль:</span>
              </div>
              <p className="leading-relaxed text-stone-300 text-xs">
                {selectedHerb.aromaProfile}
              </p>
            </div>

            {/* Section 1: Proven Medical Effect */}
            <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                <Heart className="w-4 h-4 text-emerald-400" />
                <span>Доказанное действие на организм человека:</span>
              </div>
              <p className="text-xs sm:text-sm text-stone-200 leading-relaxed">
                {selectedHerb.provenMedicalEffect}
              </p>

              {/* Active Substances Pills */}
              <div className="pt-2 border-t border-stone-900 flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-stone-400 font-medium">Активные вещества:</span>
                {selectedHerb.activeSubstances.map((sub) => (
                  <span
                    key={sub}
                    className="px-2 py-0.5 rounded-md bg-stone-900 border border-stone-800 text-emerald-300 text-[10px] font-mono"
                  >
                    ✓ {sub}
                  </span>
                ))}
              </div>
            </div>

            {/* Section 2: Russian Tradition & History */}
            <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                <Compass className="w-4 h-4 text-amber-400" />
                <span>Использование на Руси & Традиции Предков:</span>
              </div>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                {selectedHerb.rusTraditionAndUsage}
              </p>
            </div>

            {/* Section 3: Folklore, Signs & Legends */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-stone-950/80 border border-stone-800 space-y-1.5">
                <div className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
                  <span>✨</span>
                  <span>Народные приметы и поверья:</span>
                </div>
                <p className="text-xs text-stone-400 leading-relaxed italic">
                  {selectedHerb.folkloreAndSigns}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-stone-950/80 border border-stone-800 space-y-1.5">
                <div className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
                  <span>📖</span>
                  <span>История & Происхождение:</span>
                </div>
                <p className="text-xs text-stone-400 leading-relaxed">
                  {selectedHerb.originAndLegends}
                </p>
              </div>
            </div>

            {/* Section 4: Master's Brewing Secret */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-600/5 to-transparent border border-amber-500/30 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-300">
                <Flame className="w-4 h-4 text-amber-400" />
                <span>Секрет Пармастера: Как запаривать и подавать</span>
              </div>
              <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed font-medium">
                {selectedHerb.masterBrewingSecret}
              </p>
            </div>

            {/* Contraindications Warning (if any) */}
            {selectedHerb.contraindications && (
              <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-start gap-2.5 text-xs text-red-200">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-red-300">Предостережения и противопоказания: </strong>
                  <span>{selectedHerb.contraindications}</span>
                </div>
              </div>
            )}

            {/* Modal Bottom Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-stone-800">
              <div className="flex items-center gap-1.5 text-xs text-stone-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Материал зафиксирован в журнале обучения</span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {onSelectForBrew && (
                  <button
                    onClick={() => {
                      onSelectForBrew(selectedHerb);
                      playSteamSound(soundEnabled);
                      setSelectedHerb(null);
                    }}
                    className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md"
                  >
                    <Droplet className="w-3.5 h-3.5" />
                    <span>Запарить в аромабаре</span>
                  </button>
                )}

                <button
                  onClick={() => setSelectedHerb(null)}
                  className="px-5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Закрыть
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
