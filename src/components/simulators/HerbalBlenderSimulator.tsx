import React, { useState } from 'react';
import { HERBS_LIBRARY, HerbLibraryItem } from '../../data/herbsLibraryData';
import { playSteamSound, playWoodTap, playSuccessChime } from '../../utils/audio';
import {
  Sparkles,
  Trophy,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  AlertCircle,
  BookOpen,
} from 'lucide-react';

interface HerbalBlenderSimulatorProps {
  soundEnabled: boolean;
  onGrantXp?: (amount: number) => void;
  onOpenHerbsLibrary?: () => void;
}

interface StepQuest {
  stepNumber: number;
  id: 'relax' | 'tonus' | 'detox' | 'respiratory';
  title: string;
  subtitle: string;
  icon: string;
  colorScheme: {
    accent: string;
    border: string;
    bg: string;
    glow: string;
  };
  taskInstruction: string;
  recommendedHerbsIds: string[];
  successCombinations: string[][];
  resultTitle: string;
  resultEffect: string;
  scientificProof: string;
  proTip: string;
}

const STEP_QUESTS: StepQuest[] = [
  {
    stepNumber: 1,
    id: 'relax',
    title: 'Задача 1: Замедление, релакс и глубокий сон',
    subtitle: 'Вечернее парение после тяжёлой рабочей недели',
    icon: '🌙',
    colorScheme: {
      accent: 'text-indigo-300',
      border: 'border-indigo-500/60',
      bg: 'bg-indigo-950/30',
      glow: 'shadow-indigo-500/20',
    },
    taskInstruction: 'Выберите 2 растения, которые успокоят пульс, снимут спазм сосудов и помогут гостю уснуть:',
    recommendedHerbsIds: ['sweet_clover', 'chamomile_matricaria', 'meadowsweet', 'thyme', 'peppermint'],
    successCombinations: [
      ['sweet_clover', 'chamomile_matricaria'],
      ['sweet_clover', 'meadowsweet'],
      ['chamomile_matricaria', 'peppermint'],
      ['meadowsweet', 'thyme'],
      ['sweet_clover', 'thyme'],
      ['chamomile_matricaria', 'meadowsweet'],
    ],
    resultTitle: 'Сбор «Вечерний Покой и Сон» успешно запарен!',
    resultEffect: 'Снижает тонус сосудистых стенок, плавно замедляет дыхание и снимает мышечное напряжение в воротниковой зоне.',
    scientificProof: 'Кумарины донника снимают спазмы сосудов мозга, а апигенин ромашки связывается с ГАМК-рецепторами, снижая уровень кортизола.',
    proTip: 'Подавайте настой на тёплый деревянный полок за 2 минуты до укладывания гостя — медово-травяной флёр мягко расслабит нервную систему.',
  },
  {
    stepNumber: 2,
    id: 'tonus',
    title: 'Задача 2: Бодрость, сила и мышечный тонус',
    subtitle: 'Утреннее или дневное парение для физической перезагрузки',
    icon: '⚡',
    colorScheme: {
      accent: 'text-amber-300',
      border: 'border-amber-500/60',
      bg: 'bg-amber-950/30',
      glow: 'shadow-amber-500/20',
    },
    taskInstruction: 'Выберите 2 растения, которые разгонят застойную кровь и снимут ломоту в мышцах:',
    recommendedHerbsIds: ['oak_pedunculate', 'juniper', 'wormwood_bitter', 'siberian_cedar', 'st_johns_wort'],
    successCombinations: [
      ['oak_pedunculate', 'juniper'],
      ['juniper', 'wormwood_bitter'],
      ['siberian_cedar', 'oak_pedunculate'],
      ['wormwood_bitter', 'oak_pedunculate'],
      ['juniper', 'siberian_cedar'],
    ],
    resultTitle: 'Сбор «Богатырский Тонус и Сила» запарен верно!',
    resultEffect: 'Активирует кровообращение, убирает застой молочной кислоты в мышцах и придаёт телу упругость.',
    scientificProof: 'Дубильные танины дуба укрепляют капилляры, а альфа-пинен можжевельника усиливает кровоток и снимает ломоту в суставах.',
    proTip: 'Вплетите веточку можжевельника или полыни в центр дубового веника — пар получится плотным и бодрящим.',
  },
  {
    stepNumber: 3,
    id: 'detox',
    title: 'Задача 3: Детокс и выведение токсинов',
    subtitle: 'Второй заход: мощное очищение пор и стимуляция потоотделения',
    icon: '🍃',
    colorScheme: {
      accent: 'text-emerald-300',
      border: 'border-emerald-500/60',
      bg: 'bg-emerald-950/30',
      glow: 'shadow-emerald-500/20',
    },
    taskInstruction: 'Выберите 2 растения для стимуляции обильного потоотделения и очищения кожи:',
    recommendedHerbsIds: ['helichrysum', 'silver_birch', 'linden', 'stinging_nettle', 'ivan_tea'],
    successCombinations: [
      ['helichrysum', 'silver_birch'],
      ['silver_birch', 'linden'],
      ['helichrysum', 'linden'],
      ['silver_birch', 'stinging_nettle'],
      ['helichrysum', 'stinging_nettle'],
    ],
    resultTitle: 'Сбор «Семь Потов и Глубокий Детокс» собран идеально!',
    resultEffect: 'Раскрывает все поры кожи, стимулирует мягкое потоотделение и помогает печени выводить метаболиты.',
    scientificProof: 'Бетулин берёзового листа и флавоноиды липы работают как природные потогонные, а бессмертник поддерживает клетки печени.',
    proTip: 'Между прогревами подайте гостю тёплый настой липы или иван-чая мелкими глотками.',
  },
  {
    stepNumber: 4,
    id: 'respiratory',
    title: 'Задача 4: Свободное дыхание и защита бронхов',
    subtitle: 'Противовирусная санация лёгких и «Второе дыхание»',
    icon: '🌬️',
    colorScheme: {
      accent: 'text-sky-300',
      border: 'border-sky-500/60',
      bg: 'bg-sky-950/30',
      glow: 'shadow-sky-500/20',
    },
    taskInstruction: 'Выберите 2 растения с высоким содержанием фитонцидов, чтобы раскрыть дыхание:',
    recommendedHerbsIds: ['siberian_fir', 'narrow_eucalyptus', 'round_eucalyptus', 'peppermint', 'sage_officinalis'],
    successCombinations: [
      ['siberian_fir', 'narrow_eucalyptus'],
      ['siberian_fir', 'round_eucalyptus'],
      ['narrow_eucalyptus', 'peppermint'],
      ['siberian_fir', 'peppermint'],
      ['round_eucalyptus', 'sage_officinalis'],
      ['siberian_fir', 'sage_officinalis'],
    ],
    resultTitle: 'Сбор «Таёжное Дыхание» готов к ингаляции!',
    resultEffect: 'Мгновенно снимает отёк носоглотки, облегчает дыхание и очищает воздух парной на 90–95%.',
    scientificProof: 'Цинеол эвкалипта расширяет бронхи за 30 секунд, а борнилацетат сибирской пихты — мощнейший природный антисептик.',
    proTip: 'Положите прохладный пихтовый веник или мяту со льдом прямо под лицо гостя («второе дыхание») во время горячего парения.',
  },
];

export const HerbalBlenderSimulator: React.FC<HerbalBlenderSimulatorProps> = ({
  soundEnabled,
  onGrantXp,
  onOpenHerbsLibrary,
}) => {
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBrewing, setIsBrewing] = useState<boolean>(false);
  const [stepPassed, setStepPassed] = useState<boolean>(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [errorFeedback, setErrorFeedback] = useState<string | null>(null);

  const quest = STEP_QUESTS[currentStepIdx];
  const allCompleted = completedSteps.length === STEP_QUESTS.length;

  const selectedHerbs: HerbLibraryItem[] = selectedIds
    .map((id) => HERBS_LIBRARY.find((h) => h.id === id))
    .filter(Boolean) as HerbLibraryItem[];

  const candidateHerbs: HerbLibraryItem[] = quest.recommendedHerbsIds
    .map((id) => HERBS_LIBRARY.find((h) => h.id === id))
    .filter(Boolean) as HerbLibraryItem[];

  const handleToggleHerb = (herbId: string) => {
    setErrorFeedback(null);
    playWoodTap(soundEnabled);

    if (selectedIds.includes(herbId)) {
      setSelectedIds(selectedIds.filter((id) => id !== herbId));
      setStepPassed(false);
    } else {
      if (selectedIds.length >= 2) {
        setSelectedIds([selectedIds[0], herbId]);
      } else {
        setSelectedIds([...selectedIds, herbId]);
      }
      setStepPassed(false);
    }
  };

  const handleBrewCheck = () => {
    if (selectedIds.length < 2) {
      setErrorFeedback('Выберите 2 растения из карточек выше, чтобы составить сбор!');
      return;
    }

    setIsBrewing(true);
    playSteamSound(soundEnabled);

    setTimeout(() => {
      setIsBrewing(false);
      const isMatch = quest.successCombinations.some((combo) =>
        combo.every((reqId) => selectedIds.includes(reqId))
      );

      if (isMatch) {
        setStepPassed(true);
        setErrorFeedback(null);
        playSuccessChime(soundEnabled);

        if (!completedSteps.includes(currentStepIdx)) {
          setCompletedSteps((prev) => [...prev, currentStepIdx]);
          if (onGrantXp) onGrantXp(40);
        }
      } else {
        setStepPassed(false);
        setErrorFeedback(
          'Этот дуэт не решает текущую задачу на 100%. Попробуйте заменить одно из растений!'
        );
      }
    }, 600);
  };

  const goToStep = (idx: number) => {
    playWoodTap(soundEnabled);
    setCurrentStepIdx(idx);
    setSelectedIds([]);
    setStepPassed(false);
    setErrorFeedback(null);
  };

  const resetAll = () => {
    playWoodTap(soundEnabled);
    setCurrentStepIdx(0);
    setSelectedIds([]);
    setStepPassed(false);
    setCompletedSteps([]);
    setErrorFeedback(null);
  };

  return (
    <div className="space-y-6">
      {/* ===================================================================== */}
      {/* ШАГ 1: 3 ПРАВИЛА ФИТОТЕРАПИИ И СПРАВОЧНИК 22 РАСТЕНИЙ                 */}
      {/* ===================================================================== */}
      <div className="rounded-2xl border border-stone-800 bg-stone-900/95 p-5 sm:p-6 space-y-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-4">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
              Шаг 1 из 2 · Правила работы с травами без гари
            </span>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-100 mt-0.5">
              1. Как фитонциды влияют на мозг и как подавать ароматы в парной
            </h3>
          </div>

          {onOpenHerbsLibrary && (
            <button
              type="button"
              onClick={onOpenHerbsLibrary}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20 cursor-pointer flex items-center justify-center gap-2 shrink-0"
            >
              <BookOpen className="w-4 h-4" />
              <span>Справочник: 22 банных растения →</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: 0.2 sec brain reaction */}
          <div className="rounded-xl bg-stone-950/90 border border-stone-800 p-4 flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold">
                  01 · ОТКЛИК ЗА 0.2 СЕК
                </span>
                <span className="text-lg">🧠</span>
              </div>
              <h4 className="font-serif font-bold text-sm sm:text-base text-stone-100">
                Прямой путь в лимбическую систему
              </h4>
              <p className="text-xs text-stone-300 leading-relaxed">
                Природные фитонциды уничтожают до 90% бактерий в воздухе. Через обонятельные рецепторы молекулы эфирных масел попадают в лимбический центр мозга всего за <strong>0.2 секунды — быстрее болевого импульса</strong>, сразу регулируя пульс и настроение.
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-[11px] text-emerald-200 leading-snug">
              💡 <strong>Согласование:</strong> всегда дайте гостю вдохнуть аромат до захода. Если запах неприятен — пользы не будет.
            </div>
          </div>

          {/* Card 2: 5 methods without burning */}
          <div className="rounded-xl bg-stone-950/90 border border-stone-800 p-4 flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold">
                  02 · 5 МЕТОДОВ БЕЗ ГАРИ
                </span>
                <span className="text-lg">🔥</span>
              </div>
              <h4 className="font-serif font-bold text-sm sm:text-base text-stone-100">
                Табу на полив раскалённых камней
              </h4>
              <p className="text-xs text-stone-300 leading-relaxed">
                Эфирные масла горят при <strong>t &gt; 80°C</strong>. Лить масла и отвары на камни (350–450°C) нельзя — они превращаются в канцерогенный угар! <strong>5 чистых методов:</strong> 1) на тёплые деревянные стены, 2) веник со льдом под лицо («второе дыхание»), 3) вплетение в веник, 4) снопы под потолком, 5) прогрев пучка над паром каменки.
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-500/30 text-[11px] text-amber-200 leading-snug">
              ⚠️ <strong>Осторожно у печи:</strong> прогревая пучок трав над струёй пара, стойте сбоку и работайте в плотных рукавицах (40–50 см от устья).
            </div>
          </div>

          {/* Card 3: Biorhythms & Contraindications */}
          <div className="rounded-xl bg-stone-950/90 border border-stone-800 p-4 flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-md bg-sky-500/15 border border-sky-500/30 text-sky-300 text-xs font-mono font-bold">
                  03 · БИОРИТМЫ И ВОЗДУХ
                </span>
                <span className="text-lg">🌬️</span>
              </div>
              <h4 className="font-serif font-bold text-sm sm:text-base text-stone-100">
                Утро — тонус, вечер — покой
              </h4>
              <p className="text-xs text-stone-300 leading-relaxed">
                <strong>Утром и днём</strong> выбирайте тонизирующие травы (хвоя пихты, эвкалипт, можжевельник, полынь). <strong>Вечером</strong> — мягкие седативные травы для глубокого сна (донник, таволга, ромашка, чабрец). Не смешивайте более 2–3 трав за один заход.
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-500/30 text-[11px] text-rose-200 leading-snug">
              🛑 <strong>Важно:</strong> между заходами обязательно залповое проветривание. Беременным строго противопоказаны <strong>душица (орегано) и пижма</strong>!
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* ШАГ 2: ПРАКТИКА — КОНСТРУКТОР ТРАВЯНЫХ СБОРОВ (4 ЗАДАЧИ)              */}
      {/* ===================================================================== */}
      <div className="rounded-2xl border border-stone-800 bg-stone-900/95 p-5 sm:p-6 space-y-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-800 pb-4">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-bold">
              Шаг 2 из 2 · Практический тренажёр травника
            </span>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-100 mt-0.5">
              2. Соберите 4 целебных сбора под запрос гостя
            </h3>
          </div>
          <span className="text-xs font-mono text-stone-400 bg-stone-950 px-3 py-1.5 rounded-xl border border-stone-800 self-start sm:self-auto">
            Сдано задач: <strong className="text-amber-300">{completedSteps.length} из 4</strong>
          </span>
        </div>

        {/* 4 Step Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {STEP_QUESTS.map((q, idx) => {
            const isDone = completedSteps.includes(idx);
            const isCurrent = currentStepIdx === idx;
            return (
              <button
                key={q.id}
                type="button"
                onClick={() => goToStep(idx)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                  isCurrent
                    ? 'bg-stone-950 border-amber-400 ring-1 ring-amber-400/40'
                    : isDone
                    ? 'bg-emerald-950/20 border-emerald-500/40 text-stone-300'
                    : 'bg-stone-950/70 border-stone-800 text-stone-400 hover:border-stone-700'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                    isDone
                      ? 'bg-emerald-500 text-stone-950'
                      : isCurrent
                      ? 'bg-amber-500 text-stone-950'
                      : 'bg-stone-800 text-stone-400'
                  }`}
                >
                  {isDone ? '✓' : q.stepNumber}
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-mono uppercase block text-stone-400 truncate">
                    Задача {q.stepNumber}
                  </span>
                  <span className={`text-xs font-bold block truncate ${isCurrent ? 'text-amber-200' : 'text-stone-200'}`}>
                    {q.title.split(':')[1]?.trim() || q.title}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Quest Card */}
        <div className={`rounded-2xl border ${quest.colorScheme.border} ${quest.colorScheme.bg} p-4 sm:p-6 space-y-5`}>
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-stone-800/80 pb-4">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-xl bg-stone-950 border border-stone-700 flex items-center justify-center text-2xl shrink-0">
                {quest.icon}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-stone-950 border border-stone-700 ${quest.colorScheme.accent}`}>
                    ЗАДАЧА {quest.stepNumber} ИЗ 4
                  </span>
                  <span className="text-xs text-stone-400">• {quest.subtitle}</span>
                </div>
                <h4 className="font-serif text-base sm:text-xl font-bold text-stone-100 mt-1">
                  {quest.title}
                </h4>
                <p className="text-xs text-stone-300 mt-0.5">
                  {quest.taskInstruction}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => goToStep((currentStepIdx - 1 + STEP_QUESTS.length) % STEP_QUESTS.length)}
                className="p-2 rounded-xl bg-stone-950 hover:bg-stone-800 text-stone-300 border border-stone-800 cursor-pointer"
                title="Предыдущая задача"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => goToStep((currentStepIdx + 1) % STEP_QUESTS.length)}
                className="p-2 rounded-xl bg-stone-950 hover:bg-stone-800 text-stone-300 border border-stone-800 cursor-pointer"
                title="Следующая задача"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 5 Candidate Herbs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {candidateHerbs.map((herb) => {
              const isSelected = selectedIds.includes(herb.id);
              return (
                <button
                  key={herb.id}
                  type="button"
                  onClick={() => handleToggleHerb(herb.id)}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                    isSelected
                      ? 'border-amber-400 bg-amber-950/50 ring-1 ring-amber-400'
                      : 'border-stone-800 bg-stone-950/80 hover:border-stone-700'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-center text-2xl shrink-0">
                    {herb.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <h5 className="font-serif font-bold text-xs sm:text-sm text-stone-100 truncate">
                        {herb.name}
                      </h5>
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          isSelected ? 'bg-amber-500 text-stone-950' : 'border border-stone-700 text-transparent'
                        }`}
                      >
                        ✓
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-300 line-clamp-2 mt-1 leading-snug">
                      {herb.provenMedicalEffect}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Shayka & Brew Check */}
          <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <span className="text-2xl">🥣</span>
              <div>
                <span className="text-[10px] font-mono uppercase text-stone-400 block">
                  В шайке ({selectedIds.length}/2):
                </span>
                <div className="text-xs font-bold text-stone-200">
                  {selectedHerbs.length === 0 ? (
                    <span className="text-stone-500 font-normal italic">Выберите 2 растения выше</span>
                  ) : (
                    selectedHerbs.map((h) => h.name).join(' + ')
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleBrewCheck}
              disabled={selectedIds.length === 0 || isBrewing}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md disabled:opacity-40 cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isBrewing ? 'Запариваем...' : 'Запарить и проверить сбор'}</span>
            </button>
          </div>

          {errorFeedback && (
            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorFeedback}</span>
            </div>
          )}

          {stepPassed && (
            <div className="p-4 sm:p-5 rounded-xl border border-emerald-500/60 bg-stone-950/95 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-800 pb-3">
                <div>
                  <span className="text-[10px] font-mono uppercase font-bold text-emerald-400 block">
                    ✓ Сбор составлен верно (+40 XP)
                  </span>
                  <h5 className="font-serif font-bold text-sm sm:text-base text-emerald-200">
                    {quest.resultTitle}
                  </h5>
                </div>

                {currentStepIdx < STEP_QUESTS.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => goToStep(currentStepIdx + 1)}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Следующая задача</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400 text-amber-300 text-xs font-mono font-bold flex items-center gap-1">
                    <Trophy className="w-3.5 h-3.5" />
                    <span>Все 4 задачи пройдены!</span>
                  </span>
                )}
              </div>

              <p className="text-xs text-stone-300 leading-relaxed">
                <strong className="text-emerald-300">Физиология: </strong>
                {quest.resultEffect} {quest.scientificProof}
              </p>
              <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-500/30 text-xs text-amber-200">
                💡 <strong>Совет мастера:</strong> {quest.proTip}
              </div>
            </div>
          )}
        </div>

        {allCompleted && (
          <div className="p-4 rounded-xl border border-amber-400/60 bg-amber-950/30 flex items-center justify-between gap-3">
            <div className="text-xs sm:text-sm text-amber-200 font-semibold">
              👑 Все 4 базовых сбора русской бани освоены! Переходите к проверочному тесту ниже.
            </div>
            <button
              type="button"
              onClick={resetAll}
              className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 text-xs border border-stone-700 cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Сбросить</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
