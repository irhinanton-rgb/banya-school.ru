import React, { useState } from 'react';
import { HERBS_LIBRARY, HerbLibraryItem } from '../../data/herbsLibraryData';
import { playSteamSound, playWoodTap, playSuccessChime } from '../../utils/audio';
import { HerbsEncyclopedia } from '../herbs/HerbsEncyclopedia';
import {
  Sparkles,
  AlertCircle,
  BookOpen,
  FlaskConical,
  Flame,
  Check,
  CheckCircle2,
  Trophy,
  RefreshCw,
  Info,
  Heart,
  Wind,
  Shield,
  Moon,
  Zap,
} from 'lucide-react';

interface HerbalBlenderSimulatorProps {
  soundEnabled: boolean;
  onGrantXp?: (amount: number) => void;
}

// 4 Specific Herbal Quests / Targets requested by the user
export interface HerbalQuest {
  id: 'relax_sleep' | 'tonus_power' | 'detox_cleansing' | 'respiratory_cold';
  title: string;
  badge: string;
  targetDescription: string;
  scientificGoal: string;
  icon: string;
  accentColor: string;
  bgGradient: string;
  borderClass: string;
  requiredHerbsAny: string[][]; // Options of combinations
  explanation: string;
}

export const HERBAL_QUESTS: HerbalQuest[] = [
  {
    id: 'relax_sleep',
    title: '1. Замедление, релакс и глубокий сон',
    badge: 'Релакс & Сон',
    icon: '🌙',
    accentColor: 'text-indigo-400',
    bgGradient: 'from-indigo-950/40 via-stone-900 to-indigo-950/20',
    borderClass: 'border-indigo-500/50 hover:border-indigo-400',
    targetDescription: 'Снять спазм сосудов, снизить уровень гормона стресса кортизола и подготовить ЦНС к глубокой фазе сна.',
    scientificGoal: 'Кумарины, апигенин, эфирные масла седативного спектра (кумариновый донник, ромашка, таволга, чабрец, мята, липа).',
    requiredHerbsAny: [
      ['sweet_clover', 'chamomile_matricaria'],
      ['sweet_clover', 'meadowsweet'],
      ['chamomile_matricaria', 'peppermint'],
      ['meadowsweet', 'thyme'],
      ['linden', 'chamomile_matricaria'],
      ['thyme', 'sweet_clover'],
    ],
    explanation: 'Кумарины донника снижают тонус сосудистых стенок, а хамазулен и апигенин ромашки мягко связываются с ГАМК-рецепторами мозга, погружая человека в восстанавливающий покой.',
  },
  {
    id: 'tonus_power',
    title: '2. Бодрость, сила и мышечный тонус',
    badge: 'Тонус & Энергия',
    icon: '⚡',
    accentColor: 'text-amber-400',
    bgGradient: 'from-amber-950/40 via-stone-900 to-amber-950/20',
    borderClass: 'border-amber-500/50 hover:border-amber-400',
    targetDescription: 'Активировать кровообращение, разогнать застойную кровь и лимфу, дать прилив сил после физической нагрузки.',
    scientificGoal: 'Танины, катехины и смолистые терпены (дуб черешчатый, канадский дуб, можжевельник, полынь горькая, кедр).',
    requiredHerbsAny: [
      ['oak_pedunculate', 'juniper'],
      ['canadian_oak', 'juniper'],
      ['wormwood_bitter', 'juniper'],
      ['siberian_cedar', 'oak_pedunculate'],
      ['st_johns_wort', 'oak_pedunculate'],
      ['wormwood_bitter', 'siberian_cedar'],
    ],
    explanation: 'Дубильные танины дуба уплотняют клеточную мембрану и капилляры, а альфа-пинен можжевельника стимулирует микроциркуляцию и снимает мышечную ломоту.',
  },
  {
    id: 'detox_cleansing',
    title: '3. Детокс и выведение метаболитов',
    badge: 'Детокс & Печень',
    icon: '🍃',
    accentColor: 'text-emerald-400',
    bgGradient: 'from-emerald-950/40 via-stone-900 to-emerald-950/20',
    borderClass: 'border-emerald-500/50 hover:border-emerald-400',
    targetDescription: 'Раскрыть потовые железы (диафоретик), поддержать фильтрующую функцию печени и стимулировать лимфоотток.',
    scientificGoal: 'Флавоноиды (нарингенин), диафоретические гликозиды, бетулин (бессмертник, береза повислая, крапива, липа, иван-чай).',
    requiredHerbsAny: [
      ['helichrysum', 'silver_birch'],
      ['helichrysum', 'linden'],
      ['silver_birch', 'stinging_nettle'],
      ['silver_birch', 'linden'],
      ['ivan_tea', 'helichrysum'],
      ['stinging_nettle', 'helichrysum'],
    ],
    explanation: 'Бетулин берёзы и гликозиды липы вызывают мощное физиологическое потоотделение, а флавоноиды бессмертника активируют гепатоциты печени для нейтрализации токсинов.',
  },
  {
    id: 'respiratory_cold',
    title: '4. Заложенность носа и дыхательные пути',
    badge: 'Дыхание & Бронхи',
    icon: '🌬️',
    accentColor: 'text-sky-400',
    bgGradient: 'from-sky-950/40 via-stone-900 to-sky-950/20',
    borderClass: 'border-sky-500/50 hover:border-sky-400',
    targetDescription: 'Снять отек слизистых, раскрыть бронхиолы, разжижить мокроту и провести мощную противовирусную санацию.',
    scientificGoal: 'Цинеол (эвкалиптол), борнилацетат, тимол (эвкалипт узколистный, эвкалипт круглый, пихта сибирская, багульник, шалфей, мята).',
    requiredHerbsAny: [
      ['siberian_fir', 'narrow_eucalyptus'],
      ['siberian_fir', 'round_eucalyptus'],
      ['narrow_eucalyptus', 'peppermint'],
      ['round_eucalyptus', 'sage_officinalis'],
      ['ledum', 'siberian_fir'],
      ['siberian_fir', 'sage_officinalis'],
    ],
    explanation: '1,8-цинеол эвкалипта разжижает бронхиальный секрет и открывает дыхание за 30 секунд, а борнилацетат пихты уничтожает до 95% патогенных микробов в воздухе парной.',
  },
];

export const HerbalBlenderSimulator: React.FC<HerbalBlenderSimulatorProps> = ({
  soundEnabled,
  onGrantXp,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'blender' | 'library'>('blender');
  const [selectedHerbIds, setSelectedHerbIds] = useState<string[]>([
    'sweet_clover',
    'chamomile_matricaria',
  ]);
  const [activeQuestId, setActiveQuestId] = useState<HerbalQuest['id'] | null>('relax_sleep');
  const [completedQuestIds, setCompletedQuestIds] = useState<string[]>([]);
  const [isBrewing, setIsBrewing] = useState<boolean>(false);
  const [brewSuccessEffect, setBrewSuccessEffect] = useState<{
    title: string;
    description: string;
    medicalScience: string;
    contraindications?: string;
    questCompleted?: HerbalQuest;
  } | null>(null);

  // Filter herbs by category
  const [filterTag, setFilterTag] = useState<string>('all');

  const selectedHerbs: HerbLibraryItem[] = selectedHerbIds
    .map((id) => HERBS_LIBRARY.find((h) => h.id === id))
    .filter(Boolean) as HerbLibraryItem[];

  const toggleHerb = (herbId: string) => {
    setBrewSuccessEffect(null);
    playWoodTap(soundEnabled);
    if (selectedHerbIds.includes(herbId)) {
      setSelectedHerbIds(selectedHerbIds.filter((id) => id !== herbId));
    } else {
      if (selectedHerbIds.length >= 3) {
        // Replace oldest or cap at 3 (golden rule: max 2-3 herbs in steam room)
        setSelectedHerbIds([...selectedHerbIds.slice(1), herbId]);
      } else {
        setSelectedHerbIds([...selectedHerbIds, herbId]);
      }
    }
  };

  const clearSelection = () => {
    playWoodTap(soundEnabled);
    setSelectedHerbIds([]);
    setBrewSuccessEffect(null);
  };

  // Check if current mix satisfies a quest
  const checkQuestMatch = (quest: HerbalQuest, herbIds: string[]): boolean => {
    return quest.requiredHerbsAny.some((pair) =>
      pair.every((neededId) => herbIds.includes(neededId))
    );
  };

  // Compute scientifically accurate blend properties
  const evaluateBlendEffect = (herbs: HerbLibraryItem[]) => {
    const ids = herbs.map((h) => h.id);
    const names = herbs.map((h) => h.name).join(' + ');

    // Match against our 4 core goals
    const matchedQuest = HERBAL_QUESTS.find((q) => checkQuestMatch(q, ids));

    let title = `Авторский сбор (${herbs.length} ${herbs.length === 1 ? 'растение' : 'растения'})`;
    let description = '';
    let medicalScience = '';

    if (matchedQuest) {
      if (matchedQuest.id === 'relax_sleep') {
        title = `Сбор «Вечерний Релакс & Глубокий Сон»: ${names}`;
        description = 'Мягкое расслабление ЦНС, снятие мышечных спазмов, устранение тревожности и ровное дыхание. Сердцебиение замедляется, тело плавно согревается без скачков давления.';
        medicalScience = matchedQuest.explanation;
      } else if (matchedQuest.id === 'tonus_power') {
        title = `Сбор «Богатырская Сила & Тонус»: ${names}`;
        description = 'Активация кровообращения, восстановление после физической усталости, снятие застойных явлений в мышцах и связках, мощная бодрость.';
        medicalScience = matchedQuest.explanation;
      } else if (matchedQuest.id === 'detox_cleansing') {
        title = `Сбор «Глубокий Детокс & Очищение»: ${names}`;
        description = 'Раскрытие пор кожи, обильное и мягкое потоотделение, стимуляция лимфотока и разгрузка печени в условиях мягкого банного тепла.';
        medicalScience = matchedQuest.explanation;
      } else if (matchedQuest.id === 'respiratory_cold') {
        title = `Сбор «Свободное Дыхание & Чистые Бронхи»: ${names}`;
        description = 'Мгновенное раскрытие носовых пазух, отхождение вязкой мокроты, устранение першения в горле и природная дезинфекция всей парной.';
        medicalScience = matchedQuest.explanation;
      }
    } else {
      // General accurate dynamic synthesis
      title = `Сбор «Гармония Трав»: ${names}`;
      const allProps = herbs.map((h) => h.provenMedicalEffect).join(' ');
      description = `Комбинированное фитотерапевтическое действие. Растения взаимно усиливают ароматический букет: ${herbs.map((h) => h.name).join(', ')}.`;
      medicalScience = `Взаимная диффузия фитонцидов. Общее содержание действующих веществ: ${herbs.flatMap((h) => h.activeSubstances).slice(0, 5).join(', ')}. Действует через обонятельные рецепторы за 0.2 секунды.`;
    }

    const contraindications = herbs
      .filter((h) => h.contraindications)
      .map((h) => `${h.name}: ${h.contraindications}`)
      .join('; ');

    return {
      title,
      description,
      medicalScience,
      contraindications: contraindications || undefined,
      questCompleted: matchedQuest,
    };
  };

  const handleBrew = () => {
    if (selectedHerbs.length === 0) return;
    setIsBrewing(true);
    playSteamSound(soundEnabled);

    setTimeout(() => {
      setIsBrewing(false);
      const result = evaluateBlendEffect(selectedHerbs);
      setBrewSuccessEffect(result);

      if (result.questCompleted) {
        if (!completedQuestIds.includes(result.questCompleted.id)) {
          setCompletedQuestIds((prev) => [...prev, result.questCompleted!.id]);
          playSuccessChime(soundEnabled);
          if (onGrantXp) onGrantXp(50);
        } else {
          if (onGrantXp) onGrantXp(20);
        }
      } else {
        if (onGrantXp) onGrantXp(15);
      }
    }, 900);
  };

  // Filter herbs for quick selection
  const filteredHerbs = HERBS_LIBRARY.filter((herb) => {
    if (filterTag === 'all') return true;
    if (filterTag === 'relax') {
      return ['sweet_clover', 'chamomile_matricaria', 'meadowsweet', 'thyme', 'peppermint', 'linden'].includes(herb.id);
    }
    if (filterTag === 'tonus') {
      return ['oak_pedunculate', 'canadian_oak', 'juniper', 'wormwood_bitter', 'siberian_cedar', 'st_johns_wort'].includes(herb.id);
    }
    if (filterTag === 'detox') {
      return ['helichrysum', 'silver_birch', 'stinging_nettle', 'linden', 'ivan_tea'].includes(herb.id);
    }
    if (filterTag === 'respiratory') {
      return ['siberian_fir', 'narrow_eucalyptus', 'round_eucalyptus', 'ledum', 'sage_officinalis', 'peppermint'].includes(herb.id);
    }
    return true;
  });

  return (
    <div className="rounded-3xl border border-stone-800 bg-stone-950 p-4 sm:p-7 space-y-7 shadow-2xl">
      
      {/* Top Header & Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
            <span>🌿</span>
            <span>Интерактивный Аромабар · Уровень 3</span>
          </div>
          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-stone-100 mt-1">
            Конструктор Банных Сборов
          </h3>
          <p className="text-xs sm:text-sm text-stone-400 mt-1">
            Миксуйте целебные растения, изучайте доказанные физиологические эффекты и выполняйте 4 задания мастера.
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center gap-2 p-1.5 bg-stone-900 rounded-2xl border border-stone-800 shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => {
              setActiveSubTab('blender');
              playWoodTap(soundEnabled);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'blender'
                ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-stone-950 shadow-md ring-2 ring-amber-400/30'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <FlaskConical className="w-4 h-4" />
            <span>Конструктор Сборов</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveSubTab('library');
              playWoodTap(soundEnabled);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'library'
                ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-stone-950 shadow-md ring-2 ring-amber-400/30'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Библиотека Растений (22)</span>
          </button>
        </div>
      </div>

      {activeSubTab === 'library' ? (
        <HerbsEncyclopedia
          soundEnabled={soundEnabled}
          onGrantXp={onGrantXp}
          onSelectForBrew={(herb) => {
            if (!selectedHerbIds.includes(herb.id)) {
              if (selectedHerbIds.length >= 3) {
                setSelectedHerbIds([...selectedHerbIds.slice(1), herb.id]);
              } else {
                setSelectedHerbIds([...selectedHerbIds, herb.id]);
              }
            }
            setActiveSubTab('blender');
          }}
        />
      ) : (
        <div className="space-y-7 animate-fade-in">
          
          {/* SECTION 1: 4 INTERACTIVE QUEST GOALS */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                <h4 className="text-sm sm:text-base font-serif font-bold text-stone-100">
                  Задания Мастера: Соберите 4 целевых сбора
                </h4>
              </div>
              <span className="text-xs font-mono text-stone-400">
                Выполнено: <strong className="text-amber-300">{completedQuestIds.length} / 4</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {HERBAL_QUESTS.map((quest) => {
                const isCompleted = completedQuestIds.includes(quest.id);
                const isActive = activeQuestId === quest.id;
                return (
                  <button
                    key={quest.id}
                    type="button"
                    onClick={() => {
                      setActiveQuestId(quest.id);
                      playWoodTap(soundEnabled);
                      // Auto-apply sample pair for quick learning if empty
                      if (selectedHerbIds.length === 0) {
                        setSelectedHerbIds(quest.requiredHerbsAny[0]);
                      }
                    }}
                    className={`p-4 rounded-2xl border-2 text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                      isActive
                        ? 'border-amber-400 bg-stone-900 shadow-lg ring-2 ring-amber-400/20'
                        : isCompleted
                        ? 'border-emerald-500/50 bg-stone-900/60'
                        : 'border-stone-800 bg-stone-900/40 hover:border-stone-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl">{quest.icon}</span>
                        {isCompleted ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-mono font-bold flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            <span>Сдано</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wide">
                            Цель {quest.badge}
                          </span>
                        )}
                      </div>
                      <h5 className="font-serif font-bold text-xs sm:text-sm text-stone-100 leading-snug">
                        {quest.title}
                      </h5>
                      <p className="text-[11px] text-stone-400 mt-1.5 line-clamp-2 leading-relaxed">
                        {quest.targetDescription}
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-stone-800/80 text-[10px] font-mono text-amber-300/80 flex items-center justify-between">
                      <span>Нажмите для подсказки</span>
                      <span>{isActive ? '● Выбрана' : '○'}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Hint Box for Active Quest */}
            {activeQuestId && (
              <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-stone-300 animate-fade-in">
                <div className="flex items-start gap-2.5">
                  <span className="text-xl shrink-0">💡</span>
                  <div>
                    <strong className="text-amber-300">
                      Подсказка для задачи «{HERBAL_QUESTS.find((q) => q.id === activeQuestId)?.title}»:
                    </strong>
                    <p className="text-stone-300 mt-0.5 leading-relaxed">
                      {HERBAL_QUESTS.find((q) => q.id === activeQuestId)?.scientificGoal}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const q = HERBAL_QUESTS.find((item) => item.id === activeQuestId);
                    if (q) {
                      setSelectedHerbIds(q.requiredHerbsAny[0]);
                      playWoodTap(soundEnabled);
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-mono font-bold shrink-0 transition-all cursor-pointer text-center"
                >
                  ⚡ Подставить рабочий рецепт
                </button>
              </div>
            )}
          </div>

          {/* SECTION 2: THE STEAMING CAULDRON & BLEND BAR */}
          <div className="rounded-3xl border-2 border-amber-500/50 bg-gradient-to-b from-stone-900 via-stone-950 to-stone-950 p-5 sm:p-7 shadow-xl space-y-6">
            
            {/* Header of cauldron */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-2xl shrink-0 shadow-inner">
                  🥣
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase font-bold text-amber-400 tracking-wider block">
                    Банная шайка для травяной запарки
                  </span>
                  <h4 className="font-serif font-bold text-lg text-stone-100">
                    Ваш текущий сбор (максимум 2–3 растения)
                  </h4>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {selectedHerbs.length > 0 && (
                  <button
                    type="button"
                    onClick={clearSelection}
                    className="px-3 py-2 rounded-xl border border-stone-700 bg-stone-900 text-stone-400 hover:text-stone-200 text-xs font-mono transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Сбросить</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleBrew}
                  disabled={selectedHerbs.length === 0 || isBrewing}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/25 active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isBrewing ? 'Запаривание сбора...' : 'Запарить и оценить сбор'}</span>
                </button>
              </div>
            </div>

            {/* Current chosen herbs in cauldron */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[0, 1, 2].map((slotIdx) => {
                const herb = selectedHerbs[slotIdx];
                return (
                  <div
                    key={slotIdx}
                    className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${
                      herb
                        ? 'border-amber-400 bg-amber-950/20 shadow-md ring-1 ring-amber-400/20'
                        : 'border-dashed border-stone-800 bg-stone-900/30'
                    }`}
                  >
                    {herb ? (
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-3xl shrink-0">{herb.icon}</span>
                        <div className="min-w-0">
                          <span className="text-[10px] font-mono text-amber-400 uppercase font-bold block">
                            Компонент 0{slotIdx + 1}
                          </span>
                          <h6 className="font-serif font-bold text-xs sm:text-sm text-stone-100 truncate">
                            {herb.name}
                          </h6>
                          <span className="text-[10px] text-stone-400 block truncate">
                            {herb.activeSubstances?.slice(0, 2).join(', ')}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center w-full py-2">
                        <span className="text-[11px] font-mono text-stone-500 block">
                          + Слот {slotIdx + 1} пуст
                        </span>
                        <span className="text-[10px] text-stone-600 block">
                          Выберите растение ниже
                        </span>
                      </div>
                    )}

                    {herb && (
                      <button
                        type="button"
                        onClick={() => toggleHerb(herb.id)}
                        className="text-stone-500 hover:text-rose-400 p-1 text-xs transition-colors cursor-pointer shrink-0 ml-2"
                        title="Убрать из сбора"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* SCIENTIFIC EFFECT CARD (If brewed) */}
            {brewSuccessEffect && (
              <div className="p-5 sm:p-6 rounded-2xl border-2 border-emerald-500/70 bg-gradient-to-br from-stone-950 via-emerald-950/30 to-stone-950 space-y-4 animate-fade-in shadow-xl relative overflow-hidden">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-lg text-emerald-300">
                      ✨
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase font-bold text-emerald-400 tracking-wider block">
                        Результат фито-экспертизы сбора
                      </span>
                      <h4 className="font-serif font-bold text-base sm:text-lg text-emerald-200">
                        {brewSuccessEffect.title}
                      </h4>
                    </div>
                  </div>

                  {brewSuccessEffect.questCompleted && (
                    <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400 text-amber-300 font-mono text-xs font-bold shrink-0 flex items-center gap-1.5 shadow-md">
                      <span>🏆</span>
                      <span>Задание сдано (+50 XP)!</span>
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-stone-300">
                  <div className="p-3.5 rounded-xl bg-stone-900/90 border border-stone-800 space-y-1.5">
                    <strong className="text-emerald-300 block text-xs">
                      🌿 Физиологический эффект на организм:
                    </strong>
                    <p className="leading-relaxed text-stone-300">
                      {brewSuccessEffect.description}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-stone-900/90 border border-stone-800 space-y-1.5">
                    <strong className="text-amber-300 block text-xs">
                      🔬 Научный механизм (действующие вещества):
                    </strong>
                    <p className="leading-relaxed text-stone-300">
                      {brewSuccessEffect.medicalScience}
                    </p>
                  </div>
                </div>

                {brewSuccessEffect.contraindications && (
                  <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300 flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-rose-200">Особые противопоказания: </strong>
                      <span>{brewSuccessEffect.contraindications}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* SECTION 3: PLANT SELECTOR WITH ACCURATE HERBS */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-serif font-bold text-lg text-stone-100 flex items-center gap-2">
                  <span>🌱</span>
                  <span>Банная Кладовая Растений</span>
                </h4>
                <p className="text-xs text-stone-400">
                  Нажмите на растение, чтобы добавить его в шайку (максимум 3).
                </p>
              </div>

              {/* Tag filters */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {[
                  { id: 'all', label: 'Все растения' },
                  { id: 'relax', label: '🌙 Релакс и Сон' },
                  { id: 'tonus', label: '⚡ Тонус и Сила' },
                  { id: 'detox', label: '🍃 Детокс' },
                  { id: 'respiratory', label: '🌬️ Дыхание' },
                ].map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => {
                      setFilterTag(tag.id);
                      playWoodTap(soundEnabled);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      filterTag === tag.id
                        ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                        : 'bg-stone-900 border border-stone-800 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    {tag.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid of Available Herbs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 max-h-[460px] overflow-y-auto p-1 scrollbar-thin">
              {filteredHerbs.map((herb) => {
                const isSelected = selectedHerbIds.includes(herb.id);
                return (
                  <button
                    key={herb.id}
                    type="button"
                    onClick={() => toggleHerb(herb.id)}
                    className={`p-3.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between cursor-pointer active:scale-98 ${
                      isSelected
                        ? 'border-amber-400 bg-amber-950/40 shadow-lg ring-2 ring-amber-400/30'
                        : 'border-stone-800 bg-stone-900/60 hover:border-amber-500/40 hover:bg-stone-900'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="w-10 h-10 rounded-xl bg-stone-950 border border-stone-800 flex items-center justify-center text-2xl shadow-inner">
                        {herb.icon}
                      </div>

                      <span
                        className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-amber-500 text-stone-950'
                            : 'border border-stone-700 text-transparent'
                        }`}
                      >
                        ✓
                      </span>
                    </div>

                    <div className="mt-3 space-y-1">
                      <h5 className="font-serif font-bold text-xs sm:text-sm text-stone-100 leading-tight">
                        {herb.name}
                      </h5>
                      <span className="text-[10px] font-mono text-stone-500 italic block">
                        {herb.botanicalName}
                      </span>
                      <p className="text-[11px] text-stone-300 line-clamp-2 leading-snug mt-1">
                        {herb.provenMedicalEffect}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-stone-800/80 flex items-center justify-between text-[10px] font-mono">
                      <span className="text-amber-400/90 truncate max-w-[150px]">
                        {herb.activeSubstances[0] || 'Фитонциды'}
                      </span>
                      {herb.contraindications && (
                        <span className="text-rose-400 font-bold" title={herb.contraindications}>
                          ⚠️ Внимание
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 4: MASTER EXTRACT RULES */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs text-stone-300">
            <div className="p-4 rounded-2xl bg-stone-900/80 border border-stone-800 space-y-1.5 shadow-sm">
              <strong className="text-amber-300 block text-xs">
                1. Закон температуры (не выше 80°C):
              </strong>
              <p className="text-stone-400 leading-relaxed text-[11px]">
                Никогда не заваривайте травы крутым кипятком 100°C. Оптимальная экстракция эфиров происходит при 70–80°C в течение 15–20 минут.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-stone-900/80 border border-stone-800 space-y-1.5 shadow-sm">
              <strong className="text-amber-300 block text-xs">
                2. Защита от канцерогенной гари:
              </strong>
              <p className="text-stone-400 leading-relaxed text-[11px]">
                Травяные настои подают исключительно на теплое дерево стен или в чашу-испаритель. Подача на камни каменки сжигает масла в токсичный дым.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-stone-900/80 border border-stone-800 space-y-1.5 shadow-sm">
              <strong className="text-amber-300 block text-xs">
                3. «Второе дыхание» под лицо:
              </strong>
              <p className="text-stone-400 leading-relaxed text-[11px]">
                Свежая мята или пихта с кубиками льда прямо под дыханием гостя спасает от гипоксии и позволяет комфортно переносить глубокий жар.
              </p>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
