import React, { useState } from 'react';
import { HERBS_DATA } from '../../data/courseData';
import { HerbInfo } from '../../types/banya';
import { playSteamSound, playWoodTap } from '../../utils/audio';
import { HerbsEncyclopedia } from '../herbs/HerbsEncyclopedia';
import { HerbLibraryItem } from '../../data/herbsLibraryData';
import {
  Sparkles,
  AlertCircle,
  BookOpen,
  FlaskConical,
  Flame,
  Droplet,
  Info,
  Check,
} from 'lucide-react';

interface HerbalBlenderSimulatorProps {
  soundEnabled: boolean;
  onGrantXp?: (amount: number) => void;
}

export const HerbalBlenderSimulator: React.FC<HerbalBlenderSimulatorProps> = ({
  soundEnabled,
  onGrantXp,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'library' | 'blender'>('library');
  const [selectedHerbs, setSelectedHerbs] = useState<HerbInfo[]>([HERBS_DATA[0], HERBS_DATA[1]]);
  const [isBrewing, setIsBrewing] = useState<boolean>(false);
  const [brewResult, setBrewResult] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const toggleHerb = (herb: HerbInfo) => {
    setBrewResult(null);
    if (selectedHerbs.some((h) => h.id === herb.id)) {
      setSelectedHerbs(selectedHerbs.filter((h) => h.id !== herb.id));
    } else {
      if (selectedHerbs.length >= 3) {
        // limit to 3 for balanced aromatherapy synergy
        return;
      }
      setSelectedHerbs([...selectedHerbs, herb]);
    }
  };

  const handleSelectFromLibrary = (libHerb: HerbLibraryItem) => {
    // Find matching herb in HERBS_DATA or create a compatible HerbInfo
    let match = HERBS_DATA.find((h) => h.id === libHerb.id || h.name.includes(libHerb.name));
    if (!match) {
      match = {
        id: libHerb.id,
        name: libHerb.name,
        botanicalName: libHerb.botanicalName,
        properties: libHerb.provenMedicalEffect,
        usage: libHerb.masterBrewingSecret,
        category: libHerb.category === 'conifers' ? 'respiratory' : libHerb.category === 'brooms' ? 'tonus' : 'relax',
        icon: libHerb.icon,
        contraindicatedFor: libHerb.contraindications,
      };
    }

    if (!selectedHerbs.some((h) => h.id === match!.id)) {
      if (selectedHerbs.length >= 3) {
        setSelectedHerbs([selectedHerbs[1], selectedHerbs[2], match]);
      } else {
        setSelectedHerbs([...selectedHerbs, match]);
      }
    }

    // Automatically switch to blender view
    setActiveSubTab('blender');
  };

  const handleBrew = () => {
    if (selectedHerbs.length === 0) return;
    setIsBrewing(true);
    playSteamSound(soundEnabled);

    setTimeout(() => {
      setIsBrewing(false);
      const names = selectedHerbs.map((h) => h.name).join(' + ');

      let effect = 'Гармонизирующий банный сбор: мягкое прогревание и релаксация всего тела.';

      const ids = selectedHerbs.map((h) => h.id);

      if (ids.includes('helichrysum') || ids.includes('sweet_clover')) {
        effect = 'Сбор «Степной целитель и глубокий детокс»: кумарины разжижают кровь, снимают мышечные спазмы и улучшают работу печени.';
      } else if (ids.includes('siberian_fir') && (ids.includes('narrow_eucalyptus') || ids.includes('round_eucalyptus'))) {
        effect = 'Сбор «Таёжное дыхание богатыря»: мощный фитонцидный залп борнилацетата и цинеола. Мгновенно открывает бронхи и санирует легкие.';
      } else if (ids.includes('oak_pedunculate') || ids.includes('canadian_oak') || ids.includes('juniper')) {
        effect = 'Сбор «Богатырская крепость и сосудистый тонус»: танины дуба и микропунктура можжевельника снимают ломоту в пояснице и радикулит.';
      } else if (ids.includes('tansy') || ids.includes('ledum') || ids.includes('wormwood')) {
        effect = 'Сбор «Сакральное очищение парной»: пижма, полынь и багульник выжигают бактерии и проясняют сознание.';
      } else if (ids.includes('oregano') && ids.includes('chamomile')) {
        effect = 'Сбор «Глубокий сон и восстановление ЦНС»: снимает спазмы сосудов, нервное истощение и дарит безмятежный покой.';
      } else if (ids.includes('linden') || ids.includes('silver_birch')) {
        effect = 'Сбор «Семь потов и девичья краса»: идеальный диафоретик, раскрывает все поры, выводит соли и очищает эпидермис.';
      }

      setBrewResult(`✨ Сбор запарен: ${names}.\nЭффект: ${effect}`);
      if (onGrantXp) onGrantXp(30);
    }, 1200);
  };

  const hasPregnancyWarning = selectedHerbs.some((h) => h.contraindicatedFor);

  const filteredBlenderHerbs = HERBS_DATA.filter((herb) => {
    if (filterCategory === 'all') return true;
    if (filterCategory === 'relax') return herb.category === 'relax';
    if (filterCategory === 'respiratory') return herb.category === 'respiratory';
    if (filterCategory === 'tonus') return herb.category === 'tonus';
    if (filterCategory === 'detox') return herb.category === 'detox';
    return true;
  });

  return (
    <div className="rounded-2xl border border-stone-800 bg-stone-900/90 p-4 sm:p-6 space-y-6">
      
      {/* Top View Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
            <span>🌿</span>
            <span>Глава 3 · Фито- & Ароматерапия</span>
          </div>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-100 mt-1">
            Аромабар & Библиотека Банных Растений
          </h3>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-stone-950 rounded-xl border border-stone-800 shrink-0">
          <button
            onClick={() => {
              setActiveSubTab('library');
              playWoodTap(soundEnabled);
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === 'library'
                ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Библиотека Трав (22)</span>
          </button>

          <button
            onClick={() => {
              setActiveSubTab('blender');
              playWoodTap(soundEnabled);
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === 'blender'
                ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span>Конструктор Сборов</span>
          </button>
        </div>
      </div>

      {/* View 1: Comprehensive Herbs Encyclopedia */}
      {activeSubTab === 'library' && (
        <HerbsEncyclopedia
          soundEnabled={soundEnabled}
          onGrantXp={onGrantXp}
          onSelectForBrew={handleSelectFromLibrary}
        />
      )}

      {/* View 2: Interactive Blender Simulator */}
      {activeSubTab === 'blender' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Subheader */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <p className="text-xs sm:text-sm text-stone-300">
              Выберите от 1 до 3 растений для запаривания авторского сбора. Проверьте синергию ароматов и противопоказания.
            </p>
            <div className="text-xs text-stone-400 font-mono shrink-0">
              Выбрано: <span className="text-amber-400 font-bold">{selectedHerbs.length} / 3</span>
            </div>
          </div>

          {/* Quick Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {[
              { id: 'all', label: 'Все' },
              { id: 'relax', label: 'Релакс & Сон' },
              { id: 'respiratory', label: 'Дыхание & Бронхи' },
              { id: 'tonus', label: 'Тонус & Сила' },
              { id: 'detox', label: 'Детокс & Кожа' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterCategory(f.id)}
                className={`px-3 py-1 rounded-lg text-xs transition-colors cursor-pointer whitespace-nowrap ${
                  filterCategory === f.id
                    ? 'bg-stone-800 text-amber-300 font-bold border border-stone-700'
                    : 'text-stone-500 hover:text-stone-300'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Grid of Herbs for Blending */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 max-h-[380px] overflow-y-auto p-1 scrollbar-thin">
            {filteredBlenderHerbs.map((herb) => {
              const isSelected = selectedHerbs.some((h) => h.id === herb.id);
              return (
                <button
                  key={herb.id}
                  onClick={() => toggleHerb(herb)}
                  className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? 'border-amber-500 bg-amber-950/40 shadow-md ring-1 ring-amber-500/40'
                      : 'border-stone-800 bg-stone-950/70 hover:border-stone-700 hover:bg-stone-900'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-2xl">{herb.icon}</span>
                    <span
                      className={`h-5 w-5 rounded-full flex items-center justify-center text-xs ${
                        isSelected ? 'bg-amber-500 text-stone-950 font-bold' : 'border border-stone-700 text-transparent'
                      }`}
                    >
                      ✓
                    </span>
                  </div>

                  <div className="mt-2 space-y-1">
                    <h4 className="font-semibold text-xs text-stone-100">{herb.name}</h4>
                    <p className="text-[10px] text-stone-500 italic">{herb.botanicalName}</p>
                    <p className="text-[11px] text-stone-400 line-clamp-2 mt-1 leading-snug">
                      {herb.properties}
                    </p>
                  </div>

                  {herb.contraindicatedFor && (
                    <div className="mt-2 text-[10px] text-rose-400 font-mono flex items-center gap-1">
                      <span>⚠️</span>
                      <span className="truncate">{herb.contraindicatedFor}</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Steaming Cauldron / Basin Visual Stage */}
          <div className="rounded-2xl border border-stone-800 bg-stone-950 p-4 sm:p-5 space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <div className="text-xs text-stone-400 font-mono uppercase tracking-wider flex items-center gap-1.5 justify-center sm:justify-start">
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  <span>Травяная шайка для запаривания:</span>
                </div>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                  {selectedHerbs.length === 0 ? (
                    <span className="text-stone-500 text-xs italic">Выберите от 1 до 3 растений выше</span>
                  ) : (
                    selectedHerbs.map((h) => (
                      <span
                        key={h.id}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-stone-800 border border-stone-700 text-xs text-amber-200 font-medium"
                      >
                        <span>{h.icon}</span>
                        <span>{h.name}</span>
                      </span>
                    ))
                  )}
                </div>
              </div>

              <button
                onClick={handleBrew}
                disabled={selectedHerbs.length === 0 || isBrewing}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 disabled:opacity-50 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
              >
                <Sparkles className="h-4 w-4" />
                <span>{isBrewing ? 'Запаривание сбора...' : 'Запарить сбор в шайке'}</span>
              </button>
            </div>

            {/* Cautions and Feedback */}
            {hasPregnancyWarning && (
              <div className="rounded-xl bg-rose-950/40 border border-rose-500/40 p-3 text-xs text-rose-300 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-red-300">Внимание мастера: </strong>
                  В составе присутствует растение с противопоказаниями! Всегда уточняйте у гостей состояние здоровья перед подачей пара.
                </div>
              </div>
            )}

            {brewResult && (
              <div className="rounded-xl bg-emerald-950/40 border border-emerald-500/40 p-4 text-xs text-emerald-200 animate-fadeIn space-y-1">
                <div className="font-semibold text-emerald-300 flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Запарка готова к церемонии:</span>
                </div>
                <p className="whitespace-pre-line leading-relaxed text-stone-200">{brewResult}</p>
              </div>
            )}
          </div>

          {/* Pro-Tips Callout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-stone-300">
            <div className="rounded-xl bg-stone-950/60 border border-stone-800 p-3.5 space-y-1">
              <strong className="text-amber-400 block">1. Настои и запарки:</strong>
              Заваривайте травы горячей водой (75–80°C, не кипятком), настаивайте 15–20 минут и поливайте стены парной для тонкого фонового аромата.
            </div>
            <div className="rounded-xl bg-stone-950/60 border border-stone-800 p-3.5 space-y-1">
              <strong className="text-amber-400 block">2. Вплетение в веник:</strong>
              Вплетайте веточки полыни, донника или шалфея в центр дубового веника — аромат высвобождается постепенно с каждым мягким взмахом.
            </div>
            <div className="rounded-xl bg-stone-950/60 border border-stone-800 p-3.5 space-y-1">
              <strong className="text-amber-400 block">3. «Холодное дыхание»:</strong>
              Положите пучок свежей мяты или пихты со льдом под лицо гостя во время интенсивного парения спины и стоп.
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
