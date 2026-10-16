import React, { useState } from 'react';
import { HERBS_LIBRARY, HerbLibraryItem } from '../../data/herbsLibraryData';
import { playSteamSound, playWoodTap, playSuccessChime } from '../../utils/audio';
import {
  Sparkles,
  Check,
  CheckCircle2,
  Trophy,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  AlertCircle,
  HelpCircle,
  Award,
} from 'lucide-react';

interface HerbalBlenderSimulatorProps {
  soundEnabled: boolean;
  onGrantXp?: (amount: number) => void;
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
  recommendedHerbsIds: string[]; // 4-5 relevant choices shown prominently
  successCombinations: string[][]; // winning pairs or triples
  resultTitle: string;
  resultEffect: string;
  scientificProof: string;
  proTip: string;
}

const STEP_QUESTS: StepQuest[] = [
  {
    stepNumber: 1,
    id: 'relax',
    title: 'Задание 1: Замедление, релакс и глубокий сон',
    subtitle: 'Вечернее парение после тяжелой недели',
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
    scientificProof: 'Кумарины донника («кумариновая трава») снимают спазмы сосудов мозга, а флавоноид апигенин ромашки связывается с ГАМК-рецепторами, снижая уровень гормона тревоги кортизола.',
    proTip: 'Лейте настой на деревянный полок за 2 минуты до укладывания гостя — теплый ванильно-травяной флёр расслабит тело без давления на виски.',
  },
  {
    stepNumber: 2,
    id: 'tonus',
    title: 'Задание 2: Бодрость, сила и мышечный тонус',
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
    resultEffect: 'Активирует кровообращение, убирает застой молочной кислоты в мышцах и придает телу упругость.',
    scientificProof: 'Дубильные танины дуба уплотняют сосудистую стенку, а альфа-пинен можжевельника стимулирует капиллярный кровоток и снимает ломоту в суставах.',
    proTip: 'Опахивайте гостя парой дубовых веников, в центр которых вплетена веточка можжевельника — пар получается плотным и бодрящим.',
  },
  {
    stepNumber: 3,
    id: 'detox',
    title: 'Задание 3: Детокс и выведение токсинов',
    subtitle: 'Второй заход: мощное очищение пор и стимуляция печени',
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
    resultEffect: 'Раскрывает все поры кожи, стимулирует мягкое потоотделение и активирует детоксикационную функцию печени.',
    scientificProof: 'Бетулин берёзового листа и липовые флавоноиды действуют как природные диафоретики (потогонные), а нарингенин бессмертника защищает клетки печени при термонагрузке.',
    proTip: 'Не пейте ледяную воду! Подайте гостю тёплый отвар иван-чая с мёдом мелкими глотками между прогревами.',
  },
  {
    stepNumber: 4,
    id: 'respiratory',
    title: 'Задание 4: Заложенность носа и дыхательные пути',
    subtitle: 'Противовирусная санация легких и ингаляция',
    icon: '🌬️',
    colorScheme: {
      accent: 'text-sky-300',
      border: 'border-sky-500/60',
      bg: 'bg-sky-950/30',
      glow: 'shadow-sky-500/20',
    },
    taskInstruction: 'Выберите 2 растения с высоким содержанием фитонцидов, чтобы пробить заложенность носа:',
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
    resultEffect: 'Моментально снимает отек носоглотки, разжижает вязкий секрет и убивает до 95% патогенных микробов в воздухе парной.',
    scientificProof: '1,8-цинеол (эвкалиптол) расширяет альвеолы и снимает спазм дыхательных путей за 30 секунд, а борнилацетат сибирской пихты — мощнейший природный антисептик.',
    proTip: 'Используйте «второе дыхание»: положите пихтовую ветку или холодную мяту со льдом прямо под лицо гостя во время парения.',
  },
];

export const HerbalBlenderSimulator: React.FC<HerbalBlenderSimulatorProps> = ({
  soundEnabled,
  onGrantXp,
}) => {
  // Current active step: 0 to 3
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBrewing, setIsBrewing] = useState<boolean>(false);
  const [stepPassed, setStepPassed] = useState<boolean>(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [errorFeedback, setErrorFeedback] = useState<string | null>(null);

  const quest = STEP_QUESTS[currentStepIdx];
  const allCompleted = completedSteps.length === STEP_QUESTS.length;

  // Selected herb items
  const selectedHerbs: HerbLibraryItem[] = selectedIds
    .map((id) => HERBS_LIBRARY.find((h) => h.id === id))
    .filter(Boolean) as HerbLibraryItem[];

  // Candidate herbs for current step
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
        // Replace second or swap to keep exactly 2 for clear decision
        setSelectedIds([selectedIds[0], herbId]);
      } else {
        setSelectedIds([...selectedIds, herbId]);
      }
      setStepPassed(false);
    }
  };

  const handleBrewCheck = () => {
    if (selectedIds.length < 2) {
      setErrorFeedback('Пожалуйста, выберите 2 растения из списка выше для создания гармоничного дуэта!');
      return;
    }

    setIsBrewing(true);
    playSteamSound(soundEnabled);

    setTimeout(() => {
      setIsBrewing(false);
      // Check if current pair matches any winning combination for this quest
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
          'Этот сбор интересен, но не решает текущую задачу на 100%. Попробуйте другое сочетание из подсказки!'
        );
      }
    }, 800);
  };

  const goToNextStep = () => {
    playWoodTap(soundEnabled);
    if (currentStepIdx < STEP_QUESTS.length - 1) {
      setCurrentStepIdx(currentStepIdx + 1);
      setSelectedIds([]);
      setStepPassed(false);
      setErrorFeedback(null);
    }
  };

  const goToPrevStep = () => {
    playWoodTap(soundEnabled);
    if (currentStepIdx > 0) {
      setCurrentStepIdx(currentStepIdx - 1);
      setSelectedIds([]);
      setStepPassed(false);
      setErrorFeedback(null);
    }
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
    <div className="rounded-3xl border border-stone-800 bg-stone-950 p-4 sm:p-7 space-y-6 shadow-2xl">
      
      {/* Top Header */}
      <div className="border-b border-stone-800 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
              <span>🌿</span>
              <span>Пошаговый тренажер пармастера</span>
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-stone-100 mt-1">
              Конструктор Травяных Сборов
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-stone-400 bg-stone-900 px-3 py-1.5 rounded-xl border border-stone-800">
              Сдано задач: <strong className="text-amber-300">{completedSteps.length} из 4</strong>
            </span>
          </div>
        </div>
      </div>

      {/* STEPPER PROGRESS BAR (4 STEPS) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {STEP_QUESTS.map((q, idx) => {
          const isDone = completedSteps.includes(idx);
          const isCurrent = currentStepIdx === idx;
          return (
            <button
              key={q.id}
              type="button"
              onClick={() => {
                playWoodTap(soundEnabled);
                setCurrentStepIdx(idx);
                setSelectedIds([]);
                setStepPassed(false);
                setErrorFeedback(null);
              }}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                isCurrent
                  ? 'bg-stone-900 border-amber-400 ring-2 ring-amber-400/30 shadow-md'
                  : isDone
                  ? 'bg-emerald-950/20 border-emerald-500/40 text-stone-300'
                  : 'bg-stone-950 border-stone-850 text-stone-500 hover:border-stone-700'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                  isDone
                    ? 'bg-emerald-500 text-stone-950'
                    : isCurrent
                    ? 'bg-amber-500 text-stone-950 font-bold'
                    : 'bg-stone-800 text-stone-400'
                }`}
              >
                {isDone ? '✓' : `0${q.stepNumber}`}
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-mono uppercase block text-stone-400 truncate">
                  Шаг {q.stepNumber}
                </span>
                <span className={`text-xs font-bold block truncate ${isCurrent ? 'text-amber-200' : 'text-stone-300'}`}>
                  {q.title.split(':')[1]?.trim() || q.title}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* MAIN ACTIVE QUEST STAGE */}
      <div className={`rounded-3xl border-2 ${quest.colorScheme.border} ${quest.colorScheme.bg} p-5 sm:p-7 space-y-6 relative overflow-hidden shadow-xl`}>
        
        {/* Step Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-stone-800/80 pb-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-stone-900 border border-stone-700 flex items-center justify-center text-2xl shrink-0 shadow-inner">
              {quest.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-stone-900 border border-stone-700 ${quest.colorScheme.accent}`}>
                  ШАГ {quest.stepNumber} ИЗ 4
                </span>
                <span className="text-xs text-stone-400">• {quest.subtitle}</span>
              </div>
              <h4 className="font-serif text-xl sm:text-2xl font-bold text-stone-100 mt-1">
                {quest.title}
              </h4>
              <p className="text-xs sm:text-sm text-stone-300 mt-1">
                {quest.taskInstruction}
              </p>
            </div>
          </div>

          <div className="shrink-0 text-right">
            <span className="text-[10px] font-mono text-stone-400 uppercase block">В шайке</span>
            <span className="text-xs font-bold text-amber-300 font-mono">
              {selectedIds.length} из 2 компонентов
            </span>
          </div>
        </div>

        {/* CANDIDATE HERBS CARDS (Clean selection of 5 items) */}
        <div className="space-y-2">
          <span className="text-xs font-mono text-stone-400 uppercase tracking-wider block">
            Нажмите на 2 растения для составления сбора:
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {candidateHerbs.map((herb) => {
              const isSelected = selectedIds.includes(herb.id);
              return (
                <button
                  key={herb.id}
                  type="button"
                  onClick={() => handleToggleHerb(herb.id)}
                  className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer relative flex items-start gap-3 active:scale-98 ${
                    isSelected
                      ? 'border-amber-400 bg-amber-950/50 shadow-lg ring-2 ring-amber-400/30'
                      : 'border-stone-800 bg-stone-900/80 hover:border-stone-700 hover:bg-stone-900'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-stone-950 border border-stone-800 flex items-center justify-center text-2xl shrink-0">
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

                    <div className="mt-2 text-[10px] font-mono text-amber-300/80">
                      {herb.activeSubstances[0]}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* INTERACTIVE SHAYKA / BREW BUTTON */}
        <div className="p-4 sm:p-5 rounded-2xl bg-stone-950 border border-stone-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-2xl">🥣</span>
            <div>
              <span className="text-[10px] font-mono uppercase text-stone-400 block">Состав в шайке:</span>
              <div className="text-xs font-bold text-stone-200">
                {selectedHerbs.length === 0 ? (
                  <span className="text-stone-500 font-normal italic">Растения пока не выбраны</span>
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
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/25 active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isBrewing ? 'Запаривание сбора...' : 'Запарить и проверить сбор'}</span>
          </button>
        </div>

        {/* ERROR FEEDBACK */}
        {errorFeedback && (
          <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2.5 animate-fade-in">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorFeedback}</span>
          </div>
        )}

        {/* SUCCESSFUL RESULT & REAL PHYSIOLOGY CARD */}
        {stepPassed && (
          <div className="p-5 sm:p-6 rounded-2xl border-2 border-emerald-500/70 bg-gradient-to-br from-stone-950 via-emerald-950/30 to-stone-950 space-y-4 animate-fade-in shadow-xl">
            <div className="flex items-center justify-between gap-3 border-b border-emerald-500/30 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 font-bold">
                  ✓
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase font-bold text-emerald-400 tracking-wider block">
                    Задание успешно выполнено! (+40 XP)
                  </span>
                  <h5 className="font-serif font-bold text-base text-emerald-200">
                    {quest.resultTitle}
                  </h5>
                </div>
              </div>

              {currentStepIdx < STEP_QUESTS.length - 1 ? (
                <button
                  type="button"
                  onClick={goToNextStep}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Следующее задание</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400 text-amber-300 text-xs font-mono font-bold flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  <span>Все 4 задания сданы!</span>
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-stone-300">
              <div className="p-3.5 rounded-xl bg-stone-900/90 border border-stone-800 space-y-1">
                <strong className="text-emerald-300 block text-xs">
                  🌿 Действительный физиологический эффект:
                </strong>
                <p className="leading-relaxed text-stone-300">
                  {quest.resultEffect}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-900/90 border border-stone-800 space-y-1">
                <strong className="text-amber-300 block text-xs">
                  🔬 Научный механизм (вещества):
                </strong>
                <p className="leading-relaxed text-stone-300">
                  {quest.scientificProof}
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs text-amber-200 flex items-start gap-2">
              <span className="text-sm shrink-0">💡</span>
              <div>
                <strong>Секрет применения мастера: </strong>
                <span>{quest.proTip}</span>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ALL COMPLETED GRAND FINALE BANNER */}
      {allCompleted && (
        <div className="p-5 sm:p-6 rounded-3xl border-2 border-amber-400/80 bg-gradient-to-r from-amber-950/60 via-stone-900 to-amber-950/60 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl animate-fade-in">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-2xl shrink-0">
              👑
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase font-bold text-amber-400 tracking-wider block">
                Фитотерапевтическая аттестация пройдена
              </span>
              <h4 className="font-serif font-bold text-base sm:text-lg text-stone-100">
                Вы освоили 4 базовых сбора русской бани!
              </h4>
              <p className="text-xs text-stone-300">
                Теперь вы точно знаете, как без вреда и гари подобрать травы под любой запрос гостя.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={resetAll}
            className="px-4 py-2 rounded-xl border border-stone-700 bg-stone-800 text-stone-300 hover:text-stone-100 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Пройти заново</span>
          </button>
        </div>
      )}

    </div>
  );
};
