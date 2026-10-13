import React, { useState, useMemo } from 'react';
import {
  BANYA_GLOSSARY,
  BROOMS_CATALOG,
  STEAMING_PROTOCOLS,
  BanyaTerm,
  BroomCard,
  ProtocolCard
} from '../data/banyaGlossaryData';
import { HERBS_LIBRARY } from '../data/herbsLibraryData';
import { BROOM_TECHNIQUES } from '../data/referenceData';
import { BroomIllustration } from './BroomIllustration';
import { HerbIllustration } from './herbs/HerbIllustration';
import { FitotekaMasterModal } from './herbs/FitotekaMasterModal';
import {
  BookOpen,
  Search,
  Thermometer,
  ShieldAlert,
  Leaf,
  Layers,
  Sparkles,
  Copy,
  Check,
  Clock,
  Heart,
  ChevronRight,
  Filter,
  X
} from 'lucide-react';

export const HandbookView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'glossary' | 'brooms' | 'herbs' | 'climate' | 'safety' | 'protocols'>('glossary');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedGlossaryCategory, setSelectedGlossaryCategory] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showFitotekaAtlas, setShowFitotekaAtlas] = useState<boolean>(false);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered glossary terms
  const filteredTerms = useMemo(() => {
    return BANYA_GLOSSARY.filter((item) => {
      const matchesSearch =
        searchQuery === '' ||
        item.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.shortDefinition.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.practicalApplication.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCat =
        selectedGlossaryCategory === 'all' || item.category === selectedGlossaryCategory;

      return matchesSearch && matchesCat;
    });
  }, [searchQuery, selectedGlossaryCategory]);

  // Filtered brooms
  const filteredBrooms = useMemo(() => {
    if (!searchQuery) return BROOMS_CATALOG;
    const q = searchQuery.toLowerCase();
    return BROOMS_CATALOG.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.indications.toLowerCase().includes(q) ||
        b.aromaNotes.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Filtered herbs
  const filteredHerbs = useMemo(() => {
    if (!searchQuery) return HERBS_LIBRARY;
    const q = searchQuery.toLowerCase();
    return HERBS_LIBRARY.filter(
      (h) =>
        h.name.toLowerCase().includes(q) ||
        h.provenMedicalEffect.toLowerCase().includes(q) ||
        h.aromaProfile.toLowerCase().includes(q) ||
        h.synergyTags.some((t) => t.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  // Filtered protocols
  const filteredProtocols = useMemo(() => {
    if (!searchQuery) return STEAMING_PROTOCOLS;
    const q = searchQuery.toLowerCase();
    return STEAMING_PROTOCOLS.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.targetAudience.toLowerCase().includes(q) ||
        p.broomsUsed.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Hub for Desktop & Mobile */}
      <div className="rounded-3xl border border-stone-800 bg-gradient-to-br from-stone-900/95 via-stone-900/80 to-stone-950 p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-800 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber-400">
              <BookOpen className="h-4 w-4" />
              <span>База Знаний Пармастера</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-stone-100">
              Банный Справочник & Энциклопедия Терминов
            </h1>
            <p className="text-xs sm:text-sm text-stone-400 max-w-3xl leading-relaxed">
              Настольная книга для практикующего мастера: термины, физиология пара, атлас веников, фитотека трав и готовые протоколы парения.
            </p>
          </div>

          <div className="hidden lg:flex items-center gap-3 shrink-0">
            <div className="px-4 py-2.5 rounded-2xl bg-stone-950/80 border border-stone-800 text-right">
              <div className="text-xs text-stone-400 font-mono">Статей в базе</div>
              <div className="text-base font-bold text-amber-300 font-mono">
                {BANYA_GLOSSARY.length + BROOMS_CATALOG.length + HERBS_LIBRARY.length + STEAMING_PROTOCOLS.length}+
              </div>
            </div>
          </div>
        </div>

        {/* Global Instant Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Быстрый поиск по термину, траве, венику, симптому (например: пирог, донник, припарка, давление)..."
            className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-stone-950/90 border border-stone-700/80 text-stone-100 placeholder-stone-500 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200 cursor-pointer p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none scroll-smooth">
          <button
            onClick={() => setActiveTab('glossary')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'glossary'
                ? 'bg-amber-500 text-stone-950 font-bold shadow-lg scale-102'
                : 'bg-stone-950/80 text-stone-300 hover:bg-stone-800 border border-stone-800'
            }`}
          >
            <span>📖</span>
            <span>Термины и Словарь ({BANYA_GLOSSARY.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('brooms')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'brooms'
                ? 'bg-amber-500 text-stone-950 font-bold shadow-lg scale-102'
                : 'bg-stone-950/80 text-stone-300 hover:bg-stone-800 border border-stone-800'
            }`}
          >
            <span>🪵</span>
            <span>Атлас Веников ({BROOMS_CATALOG.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('herbs')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'herbs'
                ? 'bg-amber-500 text-stone-950 font-bold shadow-lg scale-102'
                : 'bg-stone-950/80 text-stone-300 hover:bg-stone-800 border border-stone-800'
            }`}
          >
            <span>🌿</span>
            <span>Фитотека Трав ({HERBS_LIBRARY.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('climate')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'climate'
                ? 'bg-amber-500 text-stone-950 font-bold shadow-lg scale-102'
                : 'bg-stone-950/80 text-stone-300 hover:bg-stone-800 border border-stone-800'
            }`}
          >
            <span>🌡️</span>
            <span>Микроклимат & Физика Пара</span>
          </button>

          <button
            onClick={() => setActiveTab('protocols')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'protocols'
                ? 'bg-amber-500 text-stone-950 font-bold shadow-lg scale-102'
                : 'bg-stone-950/80 text-stone-300 hover:bg-stone-800 border border-stone-800'
            }`}
          >
            <span>📋</span>
            <span>Техкарты Парения ({STEAMING_PROTOCOLS.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('safety')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'safety'
                ? 'bg-rose-500 text-stone-950 font-bold shadow-lg scale-102'
                : 'bg-stone-950/80 text-rose-300 hover:bg-stone-800 border border-stone-800'
            }`}
          >
            <span>🚨</span>
            <span>Безопасность & ЧП</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: GLOSSARY TERMS */}
      {activeTab === 'glossary' && (
        <div className="space-y-6">
          {/* Sub-category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 pb-1">
            <span className="text-xs text-stone-400 font-mono flex items-center gap-1.5 mr-2">
              <Filter className="w-3.5 h-3.5 text-amber-400" />
              Фильтр:
            </span>
            {[
              { id: 'all', label: 'Все категории' },
              { id: 'steam_physics', label: 'Физика пара' },
              { id: 'broom_techniques', label: 'Техники веника' },
              { id: 'herbs', label: 'Фито-аптека' },
              { id: 'physiology_safety', label: 'Безопасность & Эргономика' },
              { id: 'banya_construction', label: 'Устройство парной' },
              { id: 'protocols', label: 'Протоколы парения' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedGlossaryCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                  selectedGlossaryCategory === cat.id
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 font-semibold'
                    : 'bg-stone-900/60 text-stone-400 border border-stone-800 hover:text-stone-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Terms Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTerms.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-stone-800 bg-stone-900/90 p-5 sm:p-6 space-y-4 hover:border-amber-500/40 transition-all flex flex-col justify-between shadow-md group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                        {item.categoryLabel}
                      </span>
                      <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-100 mt-2 group-hover:text-amber-200 transition-colors">
                        {item.term}
                      </h3>
                    </div>
                    <button
                      onClick={() => handleCopy(item.id, `${item.term}: ${item.shortDefinition}\n\nПрименение: ${item.practicalApplication}`)}
                      title="Скопировать определение"
                      className="p-1.5 rounded-lg bg-stone-950 border border-stone-800 text-stone-400 hover:text-amber-300 hover:border-stone-700 transition-colors cursor-pointer shrink-0"
                    >
                      {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <p className="text-xs sm:text-sm text-stone-200 leading-relaxed">
                    {item.shortDefinition}
                  </p>

                  <div className="rounded-xl bg-stone-950/70 border border-stone-800/80 p-3 space-y-1">
                    <div className="text-[11px] font-mono text-amber-400/90 uppercase font-semibold">
                      Практическое применение:
                    </div>
                    <p className="text-xs text-stone-300 leading-relaxed">
                      {item.practicalApplication}
                    </p>
                  </div>

                  {item.commonMistakes && (
                    <div className="text-xs text-rose-300/90 bg-rose-950/20 border border-rose-900/40 p-2.5 rounded-xl leading-relaxed">
                      <strong>⚠️ Ошибка:</strong> {item.commonMistakes}
                    </div>
                  )}

                  {item.proTip && (
                    <div className="text-xs text-amber-200/90 bg-amber-950/20 border border-amber-900/40 p-2.5 rounded-xl leading-relaxed">
                      <strong>💡 Совет мастера:</strong> {item.proTip}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-stone-800/80">
                  {item.tags.map((tag, tIdx) => (
                    <span
                      key={tIdx}
                      onClick={() => setSearchQuery(tag)}
                      className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-stone-950 text-stone-400 border border-stone-800 hover:text-amber-300 hover:border-amber-500/30 cursor-pointer transition-colors"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {filteredTerms.length === 0 && (
            <div className="rounded-2xl border border-stone-800 bg-stone-900/50 p-12 text-center text-stone-400">
              По запросу «{searchQuery}» терминов не найдено. Попробуйте сбросить фильтры.
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: BROOMS CATALOG */}
      {activeTab === 'brooms' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredBrooms.map((broom) => (
              <div
                key={broom.id}
                className="rounded-2xl border border-stone-800 bg-stone-900/90 p-5 space-y-4 shadow-md flex flex-col justify-between hover:border-amber-500/40 transition-all"
              >
                <div className="space-y-3">
                  {/* Botanical Illustration Panel */}
                  <BroomIllustration
                    id={broom.id}
                    name={broom.name}
                    imageUrl={broom.imageUrl}
                    spriteCol={broom.spriteCol}
                    spriteRow={broom.spriteRow}
                  />

                  <div className="flex items-center gap-3 pt-1">
                    <span className="text-2xl">{broom.icon}</span>
                    <div>
                      <h3 className="font-serif text-lg font-bold text-stone-100">
                        {broom.name}
                      </h3>
                      <div className="text-[11px] text-stone-400 italic font-mono">
                        {broom.treeType}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-stone-950 border border-stone-800">
                      <span className="text-stone-400 block text-[10px] uppercase font-mono">Жёсткость:</span>
                      <strong className="text-amber-300 font-semibold">{broom.flexibility}</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-stone-950 border border-stone-800">
                      <span className="text-stone-400 block text-[10px] uppercase font-mono">Срок службы:</span>
                      <strong className="text-stone-200">{broom.lifespan}</strong>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-stone-300 leading-relaxed">
                    <div>
                      <strong className="text-stone-100 block mb-0.5">🌱 Способ запаривания:</strong>
                      <p className="text-stone-300">{broom.steamingMethod}</p>
                    </div>

                    <div>
                      <strong className="text-stone-100 block mb-0.5">🎯 Кому показан:</strong>
                      <p className="text-stone-300">{broom.indications}</p>
                    </div>

                    <div>
                      <strong className="text-stone-100 block mb-0.5">👃 Ароматический профиль:</strong>
                      <p className="text-stone-400 italic">«{broom.aromaNotes}»</p>
                    </div>
                  </div>
                </div>

                <div className="mt-3 p-3 rounded-xl bg-amber-950/20 border border-amber-900/40 text-xs text-amber-200 leading-relaxed">
                  <strong>💡 Секрет мастера:</strong> {broom.secretMastery}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3: HERBS & AROMATHERAPY */}
      {activeTab === 'herbs' && (
        <div className="space-y-6">
          {/* Master Fitoteka Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-stone-900 to-amber-950/30 border border-emerald-500/20 shadow-md">
            <div className="flex items-center gap-3.5">
              <span className="text-3xl p-2 rounded-xl bg-stone-950 border border-stone-800 shadow-inner">
                🌿
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    Ботаническая Фитотека
                  </span>
                  <span className="text-xs text-stone-400 font-mono">22 растения</span>
                </div>
                <h3 className="font-serif text-base sm:text-lg font-bold text-stone-100 mt-0.5">
                  Генеральный Атлас Банных Трав & Растений
                </h3>
              </div>
            </div>

            <button
              onClick={() => setShowFitotekaAtlas(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Открыть полный атлас Фитотеки</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredHerbs.map((herb) => (
              <div
                key={herb.id}
                className="rounded-2xl border border-stone-800 bg-stone-900/90 p-5 space-y-4 shadow-md flex flex-col justify-between hover:border-amber-500/40 transition-all"
              >
                <div className="space-y-3">
                  {/* Botanical Illustration Panel */}
                  <HerbIllustration
                    id={herb.id}
                    name={herb.name}
                    botanicalName={herb.botanicalName}
                    categoryTitle={herb.categoryTitle}
                    imageUrl={herb.imageUrl}
                  />

                  <div className="flex items-center gap-3 pt-1">
                    <span className="text-2xl">{herb.icon}</span>
                    <div>
                      <h3 className="font-serif text-lg font-bold text-stone-100">
                        {herb.name}
                      </h3>
                      <div className="text-[11px] text-stone-400 italic font-mono">
                        {herb.botanicalName}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-stone-300 leading-relaxed">
                    <div>
                      <strong className="text-emerald-400 block mb-0.5 font-mono uppercase text-[10px]">
                        Доказанный медицинский эффект:
                      </strong>
                      <p className="text-stone-200">{herb.provenMedicalEffect}</p>
                    </div>

                    <div>
                      <strong className="text-amber-400 block mb-0.5 font-mono uppercase text-[10px]">
                        Ароматический профиль:
                      </strong>
                      <p className="text-stone-300 italic">«{herb.aromaProfile}»</p>
                    </div>

                    <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 space-y-1">
                      <strong className="text-stone-200 block text-[11px]">🍵 Секрет заваривания:</strong>
                      <p className="text-stone-400">{herb.masterBrewingSecret}</p>
                    </div>

                    {herb.contraindications && (
                      <div className="p-2.5 rounded-xl bg-rose-950/20 border border-rose-900/40 text-rose-300">
                        <strong>⚠️ Противопоказания:</strong> {herb.contraindications}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-3 border-t border-stone-800">
                  {herb.synergyTags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-stone-950 text-emerald-300 border border-emerald-500/20 text-[10px] font-mono"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 4: CLIMATE & MICROCLIMATE PHYSICS */}
      {activeTab === 'climate' && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-stone-800 bg-stone-900/90 p-6 sm:p-8 space-y-6">
            <h3 className="font-serif text-2xl font-bold text-stone-100 flex items-center gap-3">
              <Thermometer className="h-6 w-6 text-amber-400" />
              <span>Нормативы Микроклимата: Сравнительный Анализ</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="border-b border-stone-800 text-stone-400 font-mono uppercase text-xs">
                    <th className="py-3 px-4">Тип Парной</th>
                    <th className="py-3 px-4">Температура</th>
                    <th className="py-3 px-4">Влажность</th>
                    <th className="py-3 px-4">Физика воздействия</th>
                    <th className="py-3 px-4">Целевой эффект</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/80 text-stone-300">
                  <tr className="hover:bg-stone-950/40">
                    <td className="py-4 px-4 font-bold text-amber-200">
                      🌾 Русская паровая баня (Золотой стандарт)
                    </td>
                    <td className="py-4 px-4 font-mono text-emerald-400 font-semibold">
                      55 – 65°C
                    </td>
                    <td className="py-4 px-4 font-mono text-emerald-400 font-semibold">
                      50 – 65%
                    </td>
                    <td className="py-4 px-4 text-xs leading-relaxed">
                      Конденсация влаги на теле (точка росы ~45°C). 2260 кДж/кг тепла отдается глубоко в мышцы без перегрева дыхательных путей.
                    </td>
                    <td className="py-4 px-4 text-xs text-amber-300">
                      Глубокий мышечный прогрев, работа вениками, релаксация
                    </td>
                  </tr>

                  <tr className="hover:bg-stone-950/40">
                    <td className="py-4 px-4 font-bold text-stone-200">
                      🔥 Финская суховоздушная сауна
                    </td>
                    <td className="py-4 px-4 font-mono text-amber-400">
                      90 – 110°C
                    </td>
                    <td className="py-4 px-4 font-mono text-stone-400">
                      5 – 15%
                    </td>
                    <td className="py-4 px-4 text-xs leading-relaxed">
                      Тело охлаждается непрерывным испарением пота. При подаче воды возникает ожог слизистых оболочек.
                    </td>
                    <td className="py-4 px-4 text-xs text-stone-400">
                      Быстрый кожный прогрев, сушка, без махания вениками
                    </td>
                  </tr>

                  <tr className="hover:bg-stone-950/40">
                    <td className="py-4 px-4 font-bold text-stone-200">
                      ☁️ Турецкий хаммам
                    </td>
                    <td className="py-4 px-4 font-mono text-sky-400">
                      40 – 45°C
                    </td>
                    <td className="py-4 px-4 font-mono text-sky-400">
                      95 – 100%
                    </td>
                    <td className="py-4 px-4 text-xs leading-relaxed">
                      Теплый влажный туман, прогрев за счёт мраморных плит (чебек-таши). Пот не испаряется вообще.
                    </td>
                    <td className="py-4 px-4 text-xs text-stone-400">
                      Пилинг кесе, мыльный массаж, мягкое расслабление
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Rule 120 Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-stone-800">
              <div className="p-4 rounded-2xl bg-stone-950/80 border border-amber-500/30 space-y-2">
                <div className="font-serif font-bold text-amber-300 text-base">
                  📐 Правило 110–120 (Индекс комфорта)
                </div>
                <p className="text-xs text-stone-300 leading-relaxed">
                  Сумма температуры (°C) и влажности (%) в русской бане всегда должна быть в диапазоне <strong>110–120 единиц</strong>:
                  <br />
                  • 60°C + 60% = 120 (Идеально);
                  <br />
                  • 65°C + 50% = 115 (Отлично);
                  <br />
                  • Если температура 90°C, а влажность 40% (сумма 130) — это опасная ожоговая душегубка!
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-stone-950/80 border border-amber-500/30 space-y-2">
                <div className="font-serif font-bold text-amber-300 text-base">
                  🪨 Секрет Лёгкого Пара
                </div>
                <p className="text-xs text-stone-300 leading-relaxed">
                  Лёгкий пар образуется только при испарении воды с камней, раскалённых выше <strong>400–500°C</strong> внутри закрытой каменки.
                  Водяная капля мгновенно разрывается на микромолекулы пара, невидимые глазом. Тяжёлый белый клубящийся пар — признак остывших камней (менее 250°C).
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 5: PROTOCOLS & TECH-CARDS */}
      {activeTab === 'protocols' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {filteredProtocols.map((proto) => (
              <div
                key={proto.id}
                className="rounded-3xl border border-stone-800 bg-stone-900/90 p-6 space-y-5 shadow-lg flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider font-semibold">
                      Технологическая карта парения
                    </span>
                    <h3 className="font-serif text-xl font-bold text-stone-100">
                      {proto.title}
                    </h3>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-stone-300">
                      <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>{proto.duration}</span>
                    </div>
                    <div className="flex items-center gap-2 text-stone-300">
                      <Thermometer className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>{proto.temperatureHumidity}</span>
                    </div>
                    <div className="flex items-center gap-2 text-stone-300">
                      <Leaf className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{proto.broomsUsed}</span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-stone-800">
                    <div className="text-xs font-bold text-stone-200">Поминутный сценарий:</div>
                    <div className="space-y-2">
                      {proto.steps.map((st, sIdx) => (
                        <div key={sIdx} className="p-2.5 rounded-xl bg-stone-950/80 border border-stone-800 text-xs">
                          <div className="flex items-center justify-between text-amber-400 font-mono text-[10px] mb-0.5">
                            <span>{st.time}</span>
                            <strong>{st.name}</strong>
                          </div>
                          <p className="text-stone-300 leading-snug">{st.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="text-[11px] p-3 rounded-xl bg-rose-950/20 border border-rose-900/40 text-rose-300 leading-snug">
                  <strong>⚠️ Противопоказания:</strong> {proto.contraindications}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 6: SAFETY & EMERGENCY PROTOCOL */}
      {activeTab === 'safety' && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-rose-900/60 bg-gradient-to-br from-rose-950/30 via-stone-900 to-stone-950 p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-2xl shrink-0">
                🚨
              </div>
              <div>
                <h3 className="font-serif text-2xl font-bold text-rose-100">
                  Алгоритмы Первой Помощи & Красные Флаги в Парной
                </h3>
                <p className="text-xs sm:text-sm text-stone-300">
                  Действия мастера при нештатных ситуациях: от легкого головокружения до гипертермического криза.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Case 1: Faintness */}
              <div className="rounded-2xl bg-stone-950/90 border border-stone-800 p-5 space-y-3">
                <div className="text-amber-400 font-serif font-bold text-base flex items-center gap-2">
                  <span>😵</span>
                  <span>1. Предобморочное состояние</span>
                </div>
                <div className="text-xs text-stone-300 space-y-1.5 leading-relaxed">
                  <p><strong>Симптомы:</strong> звон в ушах, потемнение в глазах, зевота, бледный носогубный треугольник.</p>
                  <p><strong>Действия:</strong></p>
                  <ul className="list-disc list-inside space-y-1 text-stone-300">
                    <li>Немедленно прекратить поддачи пара;</li>
                    <li>Помочь гостю плавно выйти на свежий воздух (не давать резко вставать!);</li>
                    <li>Уложить горизонтально, поднять ноги на валик выше уровня головы на 20 см;</li>
                    <li>Холодная влажная салфетка на лоб и виски;</li>
                    <li>Дать вдохнуть пары нашатырного спирта при спутанности сознания.</li>
                  </ul>
                </div>
              </div>

              {/* Case 2: Hypertensive Crisis */}
              <div className="rounded-2xl bg-stone-950/90 border border-stone-800 p-5 space-y-3">
                <div className="text-rose-400 font-serif font-bold text-base flex items-center gap-2">
                  <span>🫀</span>
                  <span>2. Скачок артериального давления</span>
                </div>
                <div className="text-xs text-stone-300 space-y-1.5 leading-relaxed">
                  <p><strong>Симптомы:</strong> пульсирующая боль в затылке, мелькание «мушек», тошнота, лицо багрово-красное.</p>
                  <p><strong>Действия:</strong></p>
                  <ul className="list-disc list-inside space-y-1 text-stone-300">
                    <li>Никакой ледяной купели! (вызовет спазм сосудов мозга);</li>
                    <li>Посадить в полусидячее положение (не класть ровно!);</li>
                    <li>Горячая ванночка для ног (оттянет кровь от головы);</li>
                    <li>Контроль дыхания: медленный вдох через нос, длинный выдох через рот;</li>
                    <li>При давлении выше 170 мм рт. ст. — вызвать скорую помощь.</li>
                  </ul>
                </div>
              </div>

              {/* Case 3: Thermal Burn */}
              <div className="rounded-2xl bg-stone-950/90 border border-stone-800 p-5 space-y-3">
                <div className="text-amber-400 font-serif font-bold text-base flex items-center gap-2">
                  <span>🔥</span>
                  <span>3. Паровой или контактный ожог</span>
                </div>
                <div className="text-xs text-stone-300 space-y-1.5 leading-relaxed">
                  <p><strong>Симптомы:</strong> резкая боль, покраснение кожи, возможны пузыри при контакте с горячей печью.</p>
                  <p><strong>Действия:</strong></p>
                  <ul className="list-disc list-inside space-y-1 text-stone-300">
                    <li>Немедленно охладить проточной прохладной водой 15 минут;</li>
                    <li>Запрещено мазать маслом, жиром, сметаной или спиртом!;</li>
                    <li>Наложить сухую стерильную повязку;</li>
                    <li>При ожоге 2+ степени — обратиться к врачу.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Fitoteka Master Atlas Modal */}
      <FitotekaMasterModal
        isOpen={showFitotekaAtlas}
        onClose={() => setShowFitotekaAtlas(false)}
      />
    </div>
  );
};
