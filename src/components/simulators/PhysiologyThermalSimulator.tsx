import React, { useState } from 'react';
import { playSuccessChime } from '../../utils/audio';
import confetti from 'canvas-confetti';
import { CheckCircle2, Check } from 'lucide-react';

interface PhysiologyThermalSimulatorProps {
  soundEnabled: boolean;
  onComplete: () => void;
  onSubTaskComplete?: (subTaskId: string) => void;
}

export const PhysiologyThermalSimulator: React.FC<PhysiologyThermalSimulatorProps> = ({
  soundEnabled,
  onComplete,
  onSubTaskComplete,
}) => {
  const [readStages, setReadStages] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('banya_physio_stages_v3');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const markStageRead = (stageId: string, subTaskId: string) => {
    if (!readStages.includes(stageId)) {
      const updated = [...readStages, stageId];
      setReadStages(updated);
      try {
        localStorage.setItem('banya_physio_stages_v3', JSON.stringify(updated));
      } catch {}
      onSubTaskComplete?.(subTaskId);

      if (updated.length >= 4) {
        if (soundEnabled) playSuccessChime();
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
        onComplete();
      }
    }
  };

  const allCompleted = readStages.length >= 4;

  const steps = [
    { id: 'stage_1', label: '1. Физический уровень', refId: 'physio-stage-1' },
    { id: 'stage_2', label: '2. Эмоциональный уровень', refId: 'physio-stage-2' },
    { id: 'stage_3', label: '3. Духовный уровень', refId: 'physio-stage-3' },
    { id: 'stage_4', label: '4. Биомеханика мастера', refId: 'physio-stage-4' },
  ];

  const scrollToSection = (refId: string) => {
    const el = document.getElementById(refId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="space-y-8 text-stone-200 max-w-4xl mx-auto">
      {/* Вступление и панель прогресса из 4 частей */}
      <div className="rounded-2xl bg-stone-900/90 border border-stone-800 p-6 sm:p-8 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
            Уровень 5 · Внутренние процессы человека и биомеханика в бане
          </span>
          <span className="text-xs font-semibold text-stone-400 bg-stone-950 px-3 py-1.5 rounded-lg border border-stone-800">
            Изучено разделов: <strong className="text-amber-400">{readStages.length} из 4</strong>
          </span>
        </div>

        <h3 className="text-xl sm:text-2xl font-bold text-white leading-snug">
          Что происходит с человеком в бане: Тело, Эмоции, Дух и Биомеханика
        </h3>

        <p className="text-sm sm:text-base text-stone-300 leading-relaxed">
          Настоящая баня воздействует на человека гораздо глубже простого мытья или прогрева мышц.
          В парной одновременно запускаются три пласта трансформации гостя —{' '}
          <strong className="text-white">физический, эмоциональный и духовный</strong>, а проводником
          этих процессов выступает сам пармастер, чьё тело работает по законам мягкой{' '}
          <strong className="text-amber-300">биомеханики «Банного тай-чи»</strong>. Изучите все 4 раздела
          последовательно сверху вниз.
        </p>

        {/* Компактная навигация по 4 разделам */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
          {steps.map((s) => {
            const isDone = readStages.includes(s.id);
            return (
              <button
                key={s.id}
                onClick={() => scrollToSection(s.refId)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer ${
                  isDone
                    ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                    : 'bg-stone-950/70 border-stone-800 text-stone-400 hover:border-stone-700 hover:text-stone-200'
                }`}
              >
                <span className="truncate pr-2">{s.label}</span>
                {isDone ? (
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-stone-700 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ================================================================= */}
      {/* РАЗДЕЛ 1: НА ФИЗИЧЕСКОМ УРОВНЕ (ОТ ПЕРВОГО ПАРА ДО КОНТРАСТА)     */}
      {/* ================================================================= */}
      <div
        id="physio-stage-1"
        className="rounded-2xl bg-stone-900/90 border border-stone-800 p-6 sm:p-8 space-y-6 scroll-mt-6"
      >
        <div className="border-b border-stone-800 pb-4">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Раздел 1 из 4 · Телесная физиология
            </span>
            {readStages.includes('stage_1') && (
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Изучено
              </span>
            )}
          </div>
          <h4 className="text-lg sm:text-xl font-bold text-white">
            1. Процессы на физическом уровне: от первого пара до контраста
          </h4>
        </div>

        <div className="space-y-5 text-sm sm:text-base text-stone-300 leading-relaxed">
          <p>
            Физическое тело в парной проходит через три последовательные фазы — бережное раскрытие
            на первом паре, глубокую клеточную и мышечную проработку под вениками и мощную сосудистую
            гимнастику на контрасте.
          </p>

          <div className="space-y-3 bg-stone-950/60 border border-stone-800/80 rounded-xl p-5">
            <h5 className="font-bold text-amber-300">
              Этап А. От первого пара: раскрытие капилляров и дыхания (+45...+55°C)
            </h5>
            <p>
              Когда гость ложится на тёплый полок и вдыхает первый мягкий пар, тепловые рецепторы кожи
              посылают сигнал в центр терморегуляции мозга (гипоталамус). В стенках сосудов выделяется
              природный спазмолитик — <strong>оксид азота (NO)</strong>. Спящие капилляры кожи плавно
              расширяются в 2–3 раза (<em>вазодилатация</em>).
            </p>
            <p>
              До <strong>15–20% всей крови</strong> перераспределяется из глубины тела к коже. Это мгновенно
              разгружает внутренние органы (печень, почки, сердце) и мягко снижает артериальное давление.
              Тёплый влажный воздух с фитонцидами расширяет бронхи, разжижает слизь в дыхательных путях
              и запускает первое очищающее потоотделение.
            </p>
          </div>

          <div className="space-y-3 bg-stone-950/60 border border-stone-800/80 rounded-xl p-5">
            <h5 className="font-bold text-amber-300">
              Этап Б. Во время парения вениками: глубокий прогрев, фасции и белки HSP70 (+60...+70°C)
            </h5>
            <p>
              Когда мастер опускает вениками горячий пар из-под потолка, пар конденсируется на коже
              и отдаёт колоссальную <strong>скрытую теплоту фазового перехода (2260 кДж/кг)</strong>.
              Тепло проникает на глубину 3–5 см, прогревая мышцы, связки и суставы. Пульс плавно растёт
              до 110–130 уд/мин — сердце получает кардиотренировку без ударной нагрузки на позвоночник.
            </p>
            <p>
              При прогреве тканей до +39...+40°C плотный коллаген мышечных оболочек (фасций) переходит
              из вязкого состояния «геля» в текучее состояние «золя» (<strong>эффект таяния воска</strong>).
              Мышечные зажимы расправляются, а веничный массаж выжимает застойную межклеточную жидкость
              в лимфоток. На клеточном уровне активируются <strong>белки теплового шока (HSP70)</strong> —
              молекулярные «ремонтники», которые восстанавливают повреждённые белки внутри клеток и
              укрепляют иммунитет.
            </p>
          </div>

          <div className="space-y-3 bg-stone-950/60 border border-stone-800/80 rounded-xl p-5">
            <h5 className="font-bold text-amber-300">
              Этап В. Во время контраста: «сосудистая помпа» и обновление крови
            </h5>
            <p>
              Только когда тело прогрето до самого ядра, холодная вода или свежий воздух запускают
              механизм <strong>«сосудистой помпы»</strong>. Холодовые рецепторы мгновенно сужают капилляры
              кожи, и <strong>1–1.5 литра разогретой крови</strong> мощной гидравлической волной устремляются
              внутрь — к сердцу, мозгу и внутренним органам, промывая их чистым кислородом. В кровь
              выходят резервные эритроциты и лейкоциты, а сосуды получают лучшую тренировку эластичности.
            </p>
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={() => markStageRead('stage_1', 'first_steam')}
            className={`px-5 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              readStages.includes('stage_1')
                ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/40'
                : 'bg-amber-600 hover:bg-amber-500 text-stone-950 shadow-md'
            }`}
          >
            {readStages.includes('stage_1')
              ? '✓ Раздел 1 изучен'
              : 'Понятно, отметить Раздел 1 изученным'}
          </button>
        </div>
      </div>

      {/* ================================================================= */}
      {/* РАЗДЕЛ 2: НА ЭМОЦИОНАЛЬНОМ УРОВНЕ (ПСИХИКА И ГОРМОНЫ)              */}
      {/* ================================================================= */}
      <div
        id="physio-stage-2"
        className="rounded-2xl bg-stone-900/90 border border-stone-800 p-6 sm:p-8 space-y-6 scroll-mt-6"
      >
        <div className="border-b border-stone-800 pb-4">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-400">
              Раздел 2 из 4 · Эмоции и психосоматика
            </span>
            {readStages.includes('stage_2') && (
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Изучено
              </span>
            )}
          </div>
          <h4 className="text-lg sm:text-xl font-bold text-white">
            2. Процессы на эмоциональном уровне: растворение «мышечного панциря» и радость
          </h4>
        </div>

        <div className="space-y-5 text-sm sm:text-base text-stone-300 leading-relaxed">
          <p>
            Каждая непрожитая эмоция — страх, обида, гиперответственность, подавленный гнев или
            хроническая тревога — буквально «записывается» в теле в виде хронических мышечных спазмов.
            В психологии и телесной терапии это называется <strong>«мышечным панцирем»</strong>.
          </p>

          <div className="space-y-2">
            <h5 className="font-bold text-white">
              1. Снятие защитных зажимов и отпускание гиперконтроля
            </h5>
            <p>
              В обычной жизни современный человек постоянно держит поднятыми плечи («груз ответственности»),
              сжимает челюсти («терпение и самоконтроль») и блокирует диафрагму («страх ошибиться»).
              В парной под воздействием обволакивающего тепла, полумрака и ритмичного шелеста веников
              мозг получает сигнал абсолютной безопасности. Когда физически размягчаются трапеции,
              шея и грудной отдел, по закону обратной связи <strong>растворяется и удерживаемая ими эмоция</strong>.
            </p>
          </div>

          <div className="space-y-2">
            <h5 className="font-bold text-white">
              2. Гормональная перезагрузка: обнуление кортизола и волна эндорфинов
            </h5>
            <p>
              Во время глубокого прогрева и последующего мягкого контраста происходит мощный
              нейрохимический сдвиг. Сначала короткий импульс норадреналина проясняет голову, а следом
              гипофиз выбрасывает в кровь лавину <strong>бета-эндорфинов, серотонина и дофамина</strong> —
              природных гормонов счастья, умиротворения и удовольствия. При этом уровень главного гормона
              стресса — <strong>кортизола — снижается на 40–45%</strong> и остаётся низким ещё несколько дней.
            </p>
          </div>

          <div className="space-y-2">
            <h5 className="font-bold text-white">
              3. Эмоциональный катарсис (разрядка) в зоне отдыха
            </h5>
            <p>
              Нередко после яркого парения или контраста у гостя наступает настоящая эмоциональная
              разрядка: человек может внезапно глубоко вздохнуть во всю грудь, рассмеяться от лёгкости
              или даже пустить слёзы облегчения. Пармастер должен понимать: это <strong>нормальный и
              целительный выход накопленного напряжения</strong>. После него наступает состояние
              тихой, светлой детской радости и благодарности.
            </p>
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={() => markStageRead('stage_2', 'active_steaming')}
            className={`px-5 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              readStages.includes('stage_2')
                ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/40'
                : 'bg-amber-600 hover:bg-amber-500 text-stone-950 shadow-md'
            }`}
          >
            {readStages.includes('stage_2')
              ? '✓ Раздел 2 изучен'
              : 'Понятно, отметить Раздел 2 изученным'}
          </button>
        </div>
      </div>

      {/* ================================================================= */}
      {/* РАЗДЕЛ 3: НА ДУХОВНОМ УРОВНЕ (ТИШИНА УМА И ЦЕЛОСТНОСТЬ)            */}
      {/* ================================================================= */}
      <div
        id="physio-stage-3"
        className="rounded-2xl bg-stone-900/90 border border-stone-800 p-6 sm:p-8 space-y-6 scroll-mt-6"
      >
        <div className="border-b border-stone-800 pb-4">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
              Раздел 3 из 4 · Духовное измерение и внимание
            </span>
            {readStages.includes('stage_3') && (
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Изучено
              </span>
            )}
          </div>
          <h4 className="text-lg sm:text-xl font-bold text-white">
            3. Процессы на духовном уровне: остановка мыслей и возвращение к себе
          </h4>
        </div>

        <div className="space-y-5 text-sm sm:text-base text-stone-300 leading-relaxed">
          <p>
            На духовном уровне баня — это пространство глубокой внутренней тишины, где человек
            снимает не только одежду, но и социальные маски, должности и бесконечную суету мыслей.
          </p>

          <div className="space-y-2">
            <h5 className="font-bold text-white">
              1. Остановка внутреннего диалога и возвращение в «здесь и сейчас»
            </h5>
            <p>
              Наш ум почти всегда живёт либо в тревогах о будущем, либо в сожалениях о прошлом.
              Но когда на тело ложится горячий дубовый компресс или когда человек погружается в
              прохладную купель, интенсивность чистых телесных ощущений становится настолько высокой,
              что <strong>мысленная жвачка мгновенно выключается</strong>. Внимание человека на 100%
              возвращается внутрь тела — в настоящий момент «здесь и сейчас». Мозг переходит с
              суетливых бета-ритмов на глубокие медитативные <strong>альфа- и тета-волны</strong>.
            </p>
          </div>

          <div className="space-y-2">
            <h5 className="font-bold text-white">
              2. Соединение с четырьмя живыми стихиями природы
            </h5>
            <p>
              В городской среде человек оторван от природы, что рождает чувство внутренней пустоты.
              В парной происходит живой контакт со всеми четырьмя первоэлементами: <strong>Огонь</strong>{' '}
              (жар печи и камней), <strong>Вода</strong> (пар, роса на коже и купель),{' '}
              <strong>Воздух</strong> (дыхание и ветер от веников) и <strong>Земля</strong> (живое дерево
              полка, камни, листья дуба, берёзы и луговые травы). Этот контакт восстанавливает
              первородное чувство опоры и гармонии с миром.
            </p>
          </div>

          <div className="space-y-2">
            <h5 className="font-bold text-white">
              3. Переживание очищения и внутреннего перерождения
            </h5>
            <p>
              Не случайно после настоящего парения гости говорят одну и ту же фразу:{' '}
              <em>«Я словно заново родился»</em>. Проходя через жар, очищение потом, контраст воды
              и глубокий покой в простыне («банный пеленальник»), человек проживает древний архетип
              обновления. Уходит суета, возвращается ясность ценностей, внутренняя тишина и целостность,
              когда тело, сердце и разум снова звучат в унисон.
            </p>
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={() => markStageRead('stage_3', 'contrast_mechanics')}
            className={`px-5 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              readStages.includes('stage_3')
                ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/40'
                : 'bg-amber-600 hover:bg-amber-500 text-stone-950 shadow-md'
            }`}
          >
            {readStages.includes('stage_3')
              ? '✓ Раздел 3 изучен'
              : 'Понятно, отметить Раздел 3 изученным'}
          </button>
        </div>
      </div>

      {/* ================================================================= */}
      {/* РАЗДЕЛ 4: БИОМЕХАНИКА ПАРМАСТЕРА В ПАРНОЙ («БАННОЕ ТАЙ-ЧИ»)       */}
      {/* ================================================================= */}
      <div
        id="physio-stage-4"
        className="rounded-2xl bg-stone-900/90 border border-stone-800 p-6 sm:p-8 space-y-6 scroll-mt-6"
      >
        <div className="border-b border-stone-800 pb-4">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Раздел 4 из 4 · Биомеханика и физиология мастера
            </span>
            {readStages.includes('stage_4') && (
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Изучено
              </span>
            )}
          </div>
          <h4 className="text-lg sm:text-xl font-bold text-white">
            4. Биомеханика пармастера («Банное тай-чи»): как парить без усталости и беречь спину
          </h4>
        </div>

        <div className="space-y-5 text-sm sm:text-base text-stone-300 leading-relaxed">
          <p>
            Чтобы провести гостя через глубокое физическое, эмоциональное и духовное расслабление,
            сам пармастер в парной должен двигаться свободно, мягко и без надрыва. Если мастер зажат,
            сутулится и задыхается — это напряжение мгновенно передаётся гостю через веники.
          </p>

          <div className="space-y-2">
            <h5 className="font-bold text-white">
              1. Защита поясницы (диски L4–L5) и прямая ось позвоночника
            </h5>
            <p>
              При наклоне вперёд на прямых ногах с округлённой спиной нагрузка на межпозвонковые диски
              поясницы L4–L5 возрастает в 10–12 раз и достигает <strong>200–250 кг</strong>. Работа в
              такой позе приводит к грыжам и болям уже в первый сезон. В правильной биомеханике спина
              мастера всегда остаётся прямой, а любой лёгкий наклон к полку выполняется только за счёт
              сгибания в тазобедренных суставах и мягких коленей.
            </p>
          </div>

          <div className="space-y-2">
            <h5 className="font-bold text-white">
              2. Принцип «Банного тай-чи»: импульс от стоп и перенос центра тяжести
            </h5>
            <p>
              Парят не руки и не плечи — парят ноги и корпус! Мастер стоит в устойчивой широкой стойке
              на <strong>мягких, слегка пружинящих коленях</strong>. Движение зарождается в стопах при
              плавном перекате веса тела с ноги на ногу, проходит волной через свободный таз и корпус
              и легко вытекает в расслабленные руки. Веники взлетают за счёт инерции корпуса, затрачивая
              на 60% меньше мышечной энергии.
            </p>
          </div>

          <div className="space-y-2">
            <h5 className="font-bold text-white">
              3. Расслабленный плечевой пояс, «живая кисть» и дыхание животом
            </h5>
            <p>
              Плечи мастера всегда опущены вниз от ушей, а рукоять веника удерживается свободно — как
              смычок скрипки (без «мёртвой хватки», которая быстро забивает предплечья). Дыхание
              пармастера — ровное, глубокое, диафрагмальное (животом) через нос, синхронизированное с
              ритмом взмахов. Спокойное дыхание и текучая биомеханика позволяют мастеру проводить
              4–6 парений за смену, сохраняя лёгкость в теле и ясную голову.
            </p>
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={() => markStageRead('stage_4', 'interactive')}
            className={`px-5 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              readStages.includes('stage_4')
                ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/40'
                : 'bg-amber-600 hover:bg-amber-500 text-stone-950 shadow-md'
            }`}
          >
            {readStages.includes('stage_4')
              ? '✓ Раздел 4 изучен'
              : 'Понятно, завершить изучение Уровня 5'}
          </button>
        </div>
      </div>

      {/* Итоговая плашка при завершении всех 4 разделов */}
      {allCompleted && (
        <div className="rounded-2xl bg-emerald-950/30 border border-emerald-500/40 p-6 text-center space-y-2">
          <p className="text-base sm:text-lg font-bold text-emerald-300">
            ✓ Все 4 раздела внутренних процессов и биомеханики изучены!
          </p>
          <p className="text-xs sm:text-sm text-stone-300">
            Теперь вы понимаете, как баня исцеляет тело, эмоции и дух гостя, и как при этом беречь
            собственное тело с помощью правильной биомеханики. Переходите к проверочному тесту ниже.
          </p>
        </div>
      )}
    </div>
  );
};
