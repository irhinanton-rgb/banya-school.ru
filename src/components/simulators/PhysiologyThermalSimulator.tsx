import React, { useState } from 'react';
import { playSuccessChime } from '../../utils/audio';
import confetti from 'canvas-confetti';
import { CheckCircle2, Check } from 'lucide-react';

interface PhysiologyThermalSimulatorProps {
  soundEnabled: boolean;
  onGrantXp?: (amount: number) => void;
  onSuccess?: () => void;
  onStage1Completed?: () => void;
  onStage2Completed?: () => void;
  onStage3Completed?: () => void;
}

type StageKey = 1 | 2 | 3;

interface NarrativeSection {
  id: StageKey;
  stepLabel: string;
  title: string;
  subtitle: string;
  paragraphs: {
    heading: string;
    text: string;
  }[];
  masterTakeaway: string;
}

const PHYSIOLOGY_STAGES: NarrativeSection[] = [
  {
    id: 1,
    stepLabel: 'Этап 1 из 3',
    title: '1. Что происходит с телом от первого пара',
    subtitle: 'Мягкая адаптация (+45...+55°C), раскрытие сосудов и разгрузка внутренних органов',
    paragraphs: [
      {
        heading: 'Сигнал от кожи в мозг и раскрытие капилляров',
        text: 'Когда человек заходит в мягко прогретую парную и на него опускается первая теплая волна пара, терморецепторы кожи мгновенно передают сигнал в центр терморегуляции мозга (гипоталамус). Организм понимает, что опасности и обжигающего шока нет, и запускает выработку оксида азота (NO). Под его действием стенки мельчайших сосудов расслабляются, и капилляры кожи плавно расширяются в 2–3 раза (происходит вазодилатация). Кожа равномерно розовеет и согревается.',
      },
      {
        heading: 'Разгрузка сердца, печени и почек',
        text: 'За счет того, что капиллярная сеть кожи открылась, туда плавно перетекает до 15–20% всей циркулирующей крови. Это работает как естественный предохранительный клапан: внутренние органы (печень, почки, легкие) освобождаются от избыточного застойного давления. Общее сопротивление сосудов падает, артериальное давление мягко выравнивается, а сердцу становится значительно легче перекачивать кровь.',
      },
      {
        heading: 'Глубокое дыхание и первый легкий пот',
        text: 'Теплый влажный воздух с фитонцидами трав согревает слизистые оболочки и рефлекторно расширяет бронхи. Дыхание становится глубоким, редким и свободным, уходит спазм диафрагмы. Одновременно мягко открываются потовые железы: начинается первое потоотделение, которое увлажняет эпидермис и запускает механизм естественного охлаждения тела без потери важных солей.',
      },
    ],
    masterTakeaway:
      'Именно поэтому первый заход всегда проводят бесконтактно и при мягкой температуре: нужно дать сосудам кожи спокойно раскрыться, иначе резкий жар вызовет защитный спазм и перегрузит сердце.',
  },
  {
    id: 2,
    stepLabel: 'Этап 2 из 3',
    title: '2. Что происходит с телом во время основного парения',
    subtitle: 'Глубокий прогрев вениками (+60...+70°C), «таяние» фасций и клеточное обновление',
    paragraphs: [
      {
        heading: 'Скрытая теплота пара и прогрев на глубину 3–5 см',
        text: 'Во время работы вениками мастер опускает горячий пар из-под потолка прямо на тело гостя. Соприкасаясь с более прохладной кожей, пар конденсируется в микрокапли воды и отдает колоссальное количество скрытой теплоты (2260 кДж на килограмм пара). В отличие от сухого воздуха сауны, который греет только поверхность кожи, конденсирующийся пар мягко и глубоко прогревает мышцы, связки и суставы на глубину до 3–5 сантиметров.',
      },
      {
        heading: 'Кардиотренировка лёжа и лимфодренаж',
        text: 'Кровоток в коже возрастает в 4–5 раз по сравнению с покоем, а пульс гостя плавно поднимается до 110–130 ударов в минуту. Сердечно-сосудистая система получает полноценную аэробную кардиотренировку — как при легком беге, но в состоянии полной невесомости и без малейшей нагрузки на позвоночник и суставы. При этом ритмичные припарки и компрессии вениками работают как механический насос, выжимающий застойную межклеточную жидкость и молочную кислоту в лимфатическое русло.',
      },
      {
        heading: 'Размягчение фасций и выработка защитных белков HSP70',
        text: 'Когда температура глубоких мышц и соединительной ткани достигает +38.5...+39°C, плотный коллаген мышечных оболочек (фасций) меняет свою структуру: из жесткого зажатого «геля» он переходит в текучее и пластичное состояние «золя» — зажимы в шее и пояснице буквально тают, как теплый воск. Одновременно в клетках включается выработка белков теплового шока (HSP70): эти молекулы находят поврежденные внутриклеточные структуры, восстанавливают их и запускают процесс клеточного омоложения.',
      },
    ],
    masterTakeaway:
      'Во время парения мы греем человека не силой удара, а конденсатом пара через лиственную подушку веника, обязательно сохраняя голову гостя в прохладе под влажным веником.',
  },
  {
    id: 3,
    stepLabel: 'Этап 3 из 3',
    title: '3. Что происходит с телом во время контраста и отдыха',
    subtitle: 'Сосудистая помпа (+10...+16°C), эндорфиновый всплеск и глубокое восстановление',
    paragraphs: [
      {
        heading: 'Механизм «сосудистой помпы»',
        text: 'Когда глубоко прогретый человек погружается в прохладную купель или принимает холодный облив, холодовые рецепторы кожи вызывают мгновенное рефлекторное сужение капилляров (вазоконстрикцию). Около 1–1.5 литров горячей, обогащенной кислородом крови за считанные секунды выталкиваются от периферии обратно к внутренним органам, сердцу и головному мозгу. Такая гимнастика («расширение в паре — сжатие в холоде») мощно тренирует эластичность сосудистых стенок и промывает капиллярное русло.',
      },
      {
        heading: 'Ясность ума и лавина эндорфинов («второе рождение»)',
        text: 'Короткий контакт с холодом вызывает мгновенный адаптационный выброс норадреналина и дофамина: из головы исчезает малейшая тяжесть, мысли становятся кристально чистыми и ясными. Сразу вслед за этим гипофиз выбрасывает в кровь мощную порцию бета-эндорфинов и серотонина (природных гормонов счастья и обезболивания), а уровень гормона стресса кортизола падает на 40–45%. Именно этот биохимический каскад рождает знаменитое банное чувство невесомости, радости и ощущения «будто заново родился».',
      },
      {
        heading: 'Вторая волна тепла и включение глубокого покоя',
        text: 'Как только гость выходит из купели и его укутывают в сухой халат или простыню в теплой комнате отдыха, сосуды кожи снова мягко расширяются — по телу разливается приятное бархатное тепло. Включается блуждающий нерв и парасимпатическая нервная система (режим глубокого восстановления): пульс замедляется до спокойных 60 ударов в минуту, дыхание выравнивается, а нервная система переходит в состояние глубокого целительного отдыха.',
      },
    ],
    masterTakeaway:
      'Контраст полезен только тогда, когда тело прогрето до самого ядра (после основного парения). Погружение в холод должно быть коротким (5–15 секунд), после чего гостя сразу укутывают в тепло и ведут пить травяной чай.',
  },
];

export const PhysiologyThermalSimulator: React.FC<PhysiologyThermalSimulatorProps> = ({
  soundEnabled,
  onGrantXp,
  onSuccess,
  onStage1Completed,
  onStage2Completed,
  onStage3Completed,
}) => {
  const [completedSteps, setCompletedSteps] = useState<Record<StageKey, boolean>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('banya_level6_completed_steps');
        if (saved) return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return { 1: false, 2: false, 3: false };
  });

  const completedCount = Object.values(completedSteps).filter(Boolean).length;
  const isAllComplete = completedCount === 3;

  const handleMarkStepDone = (stepId: StageKey) => {
    if (completedSteps[stepId]) return;

    const updated = { ...completedSteps, [stepId]: true };
    setCompletedSteps(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('banya_level6_completed_steps', JSON.stringify(updated));
    }

    playSuccessChime(soundEnabled);
    if (onGrantXp) onGrantXp(30);

    if (stepId === 1 && onStage1Completed) onStage1Completed();
    if (stepId === 2 && onStage2Completed) onStage2Completed();
    if (stepId === 3 && onStage3Completed) onStage3Completed();

    const count = Object.values(updated).filter(Boolean).length;
    if (count === 3) {
      if (onSuccess) onSuccess();
      try {
        confetti({
          particleCount: 70,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }
    }
  };

  return (
    <div className="space-y-8">
      {PHYSIOLOGY_STAGES.map((stage) => {
        const isDone = completedSteps[stage.id];

        return (
          <article
            key={stage.id}
            className="rounded-2xl border border-stone-800 bg-stone-900/90 p-6 sm:p-8 space-y-6 shadow-lg"
          >
            {/* Section Header */}
            <div className="border-b border-stone-800 pb-4 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">
                  {stage.stepLabel}
                </span>
                {isDone && (
                  <span className="inline-flex items-center gap-1 text-xs font-mono text-emerald-400 font-semibold">
                    <Check className="w-3.5 h-3.5" />
                    <span>Изучено</span>
                  </span>
                )}
              </div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-100">
                {stage.title}
              </h3>
              <p className="text-xs sm:text-sm text-stone-400">
                {stage.subtitle}
              </p>
            </div>

            {/* Sequential Narrative Paragraphs */}
            <div className="space-y-5">
              {stage.paragraphs.map((p, idx) => (
                <div key={idx} className="space-y-1.5">
                  <h4 className="font-serif text-base sm:text-lg font-semibold text-amber-200">
                    {p.heading}
                  </h4>
                  <p className="text-sm sm:text-base text-stone-200 leading-relaxed font-sans">
                    {p.text}
                  </p>
                </div>
              ))}
            </div>

            {/* Practical Conclusion in Plain Text */}
            <div className="pt-4 border-t border-stone-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <p className="text-xs sm:text-sm text-amber-200/90 leading-relaxed italic max-w-3xl">
                <strong className="not-italic text-amber-400 font-semibold">Вывод для мастера: </strong>
                {stage.masterTakeaway}
              </p>

              <button
                type="button"
                onClick={() => handleMarkStepDone(stage.id)}
                disabled={isDone}
                className={`shrink-0 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                  isDone
                    ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30 cursor-default'
                    : 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-md cursor-pointer active:scale-95'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isDone ? 'Этап изучен ✓' : 'Понятно, изучено (+30 XP)'}</span>
              </button>
            </div>
          </article>
        );
      })}

      {isAllComplete && (
        <div className="p-5 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 text-center space-y-1">
          <div className="text-sm sm:text-base font-serif font-bold text-emerald-200">
            Все 3 этапа физиологии бани последовательно изучены!
          </div>
          <p className="text-xs text-stone-300">
            Теперь вы можете закрепить знания в коротком проверочном тесте ниже.
          </p>
        </div>
      )}
    </div>
  );
};
