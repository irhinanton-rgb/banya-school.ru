import React, { useState } from 'react';
import { playSuccessChime, playWoodTap } from '../../utils/audio';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';

interface GuestServiceSimulatorProps {
  soundEnabled: boolean;
  onComplete: () => void;
  onSubTaskComplete?: (subTaskId: string) => void;
}

interface ScenarioOption {
  id: string;
  text: string;
  isCorrect: boolean;
  guestReaction: string;
  explanation: string;
}

interface ServiceScenario {
  id: string;
  subTaskId: string;
  stageTitle: string;
  guestType: string;
  guestEmoji: string;
  situation: string;
  guestQuote: string;
  options: ScenarioOption[];
}

const SCENARIOS: ServiceScenario[] = [
  {
    id: 'anxious_first_timer',
    subTaskId: 'first_contact',
    stageTitle: 'Кейс 1: Встреча и снятие страха',
    guestType: 'Тревожный гость с негативным опытом',
    guestEmoji: '😟',
    situation:
      'Гость впервые пришёл на авторское парение. Он напряжён, дышит поверхностно и признаётся, что в детстве угорел в деревенской бане и с тех пор боится задохнуться в горячем пару.',
    guestQuote:
      '«Честно говоря, я немного боюсь парной... Когда становится слишком жарко и душно, у меня сразу начинается паника и не хватает воздуха».',
    options: [
      {
        id: 'opt1',
        text: 'Отшутиться: «Да ладно вам, у нас настоящая русская жара под 90 градусов, сейчас выбьем из вас все страхи дубовыми вениками!»',
        isCorrect: false,
        guestReaction:
          'Гость бледнеет, зажимается ещё сильнее и думает о том, как бы скорее уйти.',
        explanation:
          'Обесценивание страха вызывает выброс адреналина и спазм сосудов ещё до входа в парную.',
      },
      {
        id: 'opt2',
        text: 'Заключить «контракт доверия»: начать с мягких +45...+50°C, уложить гостя лицом к подаче свежего воздуха («второе дыхание») с прохладной пихтой и дать правило «стоп-слова» — по первому жесту ладони сразу делаем паузу.',
        isCorrect: true,
        guestReaction:
          'Гость с облегчением выдыхает, плечи опускаются: «Спасибо! Когда я знаю, что всегда могу дышать прохладой и остановить процесс, мне спокойно».',
        explanation:
          'Возврат чувства контроля и обеспечение прохладного дыхания снимают 90% психологической тревоги с первой минуты.',
      },
      {
        id: 'opt3',
        text: 'Молча завести гостя в парную и сразу поддать три ковша в каменку, чтобы он не успел испугаться.',
        isCorrect: false,
        guestReaction:
          'У гостя начинается паническая атака, тахикардия, он вскакивает и выбегает из парной.',
        explanation:
          'Резкий паровой удар для тревожного человека приводит к вегетативному кризу и полной потере доверия.',
      },
    ],
  },
  {
    id: 'silent_endurer',
    subTaskId: 'nonverbal_signs',
    stageTitle: 'Кейс 2: Скрытое терпение на полке',
    guestType: 'Молчаливый гость («терпила»)',
    guestEmoji: '😶',
    situation:
      'Идёт 8-я минута основного парения. Гость лежит молча и не жалуется, но вы замечаете невербальные маркеры: пальцы рук вцепились в край полка, дыхание стало частым и прерывистым, а носогубный треугольник заметно побледнел.',
    guestQuote: 'Гость молчит, плотно сжав челюсти, стараясь «держать марку» и не показаться слабым.',
    options: [
      {
        id: 'opt1',
        text: 'Продолжать наращивать жар и делать интенсивные припарки: раз гость молчит, значит ему всё нравится.',
        isCorrect: false,
        guestReaction:
          'Через минуту при попытке встать у гостя темнеет в глазах и развивается предобморочное состояние.',
        explanation:
          'Многие гости терпят до последнего из-за ложного стыда. Побледнение носогубного треугольника — сигнал критической перегрузки!',
      },
      {
        id: 'opt2',
        text: 'Резко бросить веники и закричать: «Вам плохо?! Вы совсем белый, срочно выбегайте на пол!»',
        isCorrect: false,
        guestReaction:
          'От испуга у гостя резко подскакивает пульс, возникает неловкость и удар по самолюбию.',
        explanation:
          'Паника мастера передаётся гостю и бьёт по его достоинству.',
      },
      {
        id: 'opt3',
        text: 'Мягко перевести работу на стопы, положить свежий холодный веник на лоб и сердце, приоткрыть проветривание и тактично сказать: «Тело взяло идеальный прогрев, сейчас самое время плавно перейти к отдыху» — затем поднять гостя в 3 этапа (лёжа -> сидя -> выход).',
        isCorrect: true,
        guestReaction:
          'Гость благодарно кивает, спокойно садится на полке на 40 секунд и мягко выходит под вашу руку без головокружения.',
        explanation:
          'Высший пилотаж! Вы вовремя считали сигналы тела, защитили здоровье гостя, предотвратили ортостатический спазм при подъёме и сохранили его достоинство.',
      },
    ],
  },
  {
    id: 'steelworker_guest',
    subTaskId: 'first_contact',
    stageTitle: 'Кейс 3: Любитель «сталеварского жара»',
    guestType: 'Требовательный гость («Давай 110 градусов!»)',
    guestEmoji: '🔥',
    situation:
      'Опытный на вид гость с порога требует: «Мне эти ваши мягкие прогревы не нужны! Поддай сразу пять ковшей и лупи дубом со всей дури с первой минуты, я привык к 110 градусам в сухой сауне!».',
    guestQuote:
      '«Если кожа не горит и уши в трубочку не сворачиваются — значит баня холодная!»',
    options: [
      {
        id: 'opt1',
        text: 'Пойти на поводу у гостя: вылить полведра воды в каменку на сухую кожу и начать хлестать со всей силы без предварительного прогрева.',
        isCorrect: false,
        guestReaction:
          'Гость получает поверхностный ожог кожи и спазм сосудов, а через 4 минуты выскакивает с колотящимся сердцем и головной болью.',
        explanation:
          'Во влажной русской парной при 60% влажности теплопроводность в десятки раз выше сухой сауны. Жар на непрогретое тело вызывает защитный спазм капилляров.',
      },
      {
        id: 'opt2',
        text: 'Вступить в спор и высокомерно прочитать лекцию о том, что он всю жизнь неправильно ходил в баню.',
        isCorrect: false,
        guestReaction:
          'Гость раздражается и воспринимает мастера как заносчивого теоретика.',
        explanation:
          'Прямой спор с гостем разрушает раппорт и превращает отдых в конфликт.',
      },
      {
        id: 'opt3',
        text: 'С уважением поддержать его любовь к крепкому пару и предложить честный договор: «Обязательно сделаем мощный, плотный пик! Но чтобы жар вошёл глубоко в мышцы и кости, а не обжёг кожу сверху, мы за 5 минут раскроем сосуды, а во втором заходе я дам вам настоящий плотный припарок».',
        isCorrect: true,
        guestReaction:
          'Гость с интересом соглашается, а после глубокого прогрева на втором заходе признаётся: «Вот это да! Такого глубокого жара без ожога ушей я ещё никогда не чувствовал!»',
        explanation:
          'Присоединение к ценности гостя без спора и грамотный физиологический вход превращают скептика в вашего самого преданного поклонника.',
      },
    ],
  },
  {
    id: 'tea_ceremony_finale',
    subTaskId: 'aftercare_tea',
    stageTitle: 'Кейс 4: Укутывание, тишина и чайный финал',
    guestType: 'Гость после кульминационного парения',
    guestEmoji: '🍵',
    situation:
      'Основное парение и контраст завершены. Гость выходит в комнату отдыха в состоянии глубокой эндорфиновой невесомости: взгляд расфокусирован, движения плавные, мысли остановились.',
    guestQuote: '«Какое необыкновенное состояние... Будто заново родился и совсем не хочется разговаривать».',
    options: [
      {
        id: 'opt1',
        text: 'Включить яркий верхний свет, громкую музыку и начать подробно расспрашивать о работе или торопить со сборами.',
        isCorrect: false,
        guestReaction:
          'Состояние глубокого покоя мгновенно разбивается, возвращается суета и усталость.',
        explanation:
          'Первые 15–20 минут после выхода — золотое окно парасимпатического восстановления. Шум и бытовые разговоры обнуляют терапевтический эффект.',
      },
      {
        id: 'opt2',
        text: 'Промокнуть влагу, бережно укутать гостя в сухую тёплую простыню (особенно стопы), уложить с валиком под колени в полумраке на 15 минут полной тишины, а затем подать тёплый травяной сбор с мёдом и сухофруктами.',
        isCorrect: true,
        guestReaction:
          'Гость глубоко отдыхает в тишине, с наслаждением пьёт тёплый чай и говорит: «Это была лучшая баня в моей жизни. Запишите меня снова через неделю!»',
        explanation:
          'Безупречный сервис! Пеленание сохраняет внутреннее тепло, тишина закрепляет перезагрузку нервной системы, а травяной чай восполняет влагу и калий.',
      },
      {
        id: 'opt3',
        text: 'Оставить мокрого гостя сидеть на сквозняке и подать ледяную газировку из холодильника.',
        isCorrect: false,
        guestReaction:
          'Гость начинает зябнуть, а ледяной напиток вызывает спазм разгорячённого желудка.',
        explanation:
          'Остывание мокрого тела на сквозняке и ледяные напитки после парной — прямая дорога к простуде и спазму ЖКТ.',
      },
    ],
  },
];

export const GuestServiceSimulator: React.FC<GuestServiceSimulatorProps> = ({
  soundEnabled,
  onComplete,
  onSubTaskComplete,
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [activeScenarioIdx, setActiveScenarioIdx] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  const currentScenario = SCENARIOS[activeScenarioIdx];
  const selectedOptId = selectedOptions[currentScenario.id];
  const selectedOpt = currentScenario.options.find((o) => o.id === selectedOptId);

  const solvedCount = SCENARIOS.filter((s) => {
    const pick = selectedOptions[s.id];
    const opt = s.options.find((o) => o.id === pick);
    return opt?.isCorrect;
  }).length;

  const handleSelectOption = (option: ScenarioOption) => {
    if (soundEnabled) playWoodTap();
    const nextSelected = { ...selectedOptions, [currentScenario.id]: option.id };
    setSelectedOptions(nextSelected);

    if (option.isCorrect) {
      if (soundEnabled) playSuccessChime();
      onSubTaskComplete?.(currentScenario.subTaskId);

      const newSolvedCount = SCENARIOS.filter((s) => {
        const pick = nextSelected[s.id];
        const opt = s.options.find((o) => o.id === pick);
        return opt?.isCorrect;
      }).length;

      if (newSolvedCount === SCENARIOS.length) {
        onSubTaskComplete?.('interactive');
        confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
        onComplete();
      }
    }
  };

  return (
    <div className="space-y-6 text-stone-200 max-w-4xl mx-auto">
      {/* Шапка и переключатель 2 шагов */}
      <div className="rounded-2xl bg-stone-900/90 border border-stone-800 p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
              Уровень 7 · Этика, психология и сервис пятизвёздочной бани
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-white mt-0.5">
              Путь гостя от порога до чайной церемонии и практикум ситуаций
            </h3>
          </div>
          <span className="text-xs font-semibold text-stone-400 bg-stone-950 px-3 py-1.5 rounded-lg border border-stone-800">
            Решено кейсов: <strong className="text-amber-400">{solvedCount} / {SCENARIOS.length}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            onClick={() => setStep(1)}
            className={`px-4 py-3 rounded-xl font-bold text-xs sm:text-sm text-left transition-all cursor-pointer flex items-center justify-between border ${
              step === 1
                ? 'bg-amber-500/15 border-amber-500/50 text-amber-300 shadow-sm'
                : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:text-stone-200'
            }`}
          >
            <span>Шаг 1. Полный стандарт заботы (5 этапов)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          </button>
          <button
            onClick={() => setStep(2)}
            className={`px-4 py-3 rounded-xl font-bold text-xs sm:text-sm text-left transition-all cursor-pointer flex items-center justify-between border ${
              step === 2
                ? 'bg-amber-500/15 border-amber-500/50 text-amber-300 shadow-sm'
                : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:text-stone-200'
            }`}
          >
            <span>Шаг 2. Практикум: 4 реальных кейса</span>
            {solvedCount === SCENARIOS.length ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <span className="text-[11px] text-stone-500">{solvedCount}/{SCENARIOS.length}</span>
            )}
          </button>
        </div>
      </div>

      {/* ================================================================= */}
      {/* ШАГ 1: ПОДРОБНЫЙ СТАНДАРТ СЕРВИСА И ПСИХОЛОГИИ (5 ЭТАПОВ)         */}
      {/* ================================================================= */}
      {step === 1 && (
        <div className="rounded-2xl bg-stone-900/90 border border-stone-800 p-6 sm:p-8 space-y-6">
          <div className="border-b border-stone-800 pb-4 space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Шаг 1 из 2 · Глубокий разбор сервиса и психологии
            </span>
            <h4 className="text-lg sm:text-xl font-bold text-white">
              5 этапов эталонного банного сервиса: почему гость возвращается именно к вам
            </h4>
            <p className="text-xs sm:text-sm text-stone-400">
              До 85% гостей возвращаются в баню не из-за породы камня в печи, а из-за состояния
              защищённости, чуткости и бережного послевкусия, которые создаёт мастер.
            </p>
          </div>

          <div className="space-y-4 text-sm sm:text-base text-stone-300 leading-relaxed">
            {/* Этап 1 */}
            <div className="p-5 rounded-xl bg-stone-950/70 border border-stone-800 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <h5 className="font-bold text-amber-300">
                  1. Сенсорная архитектура встречи: настройка 5 органов чувств
                </h5>
                <span className="text-[11px] font-semibold text-stone-500 uppercase">До парной</span>
              </div>
              <p>
                Расслабление гостя начинается с первой секунды переступания порога бани. Если в комнате
                отдыха бьёт в глаза холодный офисный свет, работает телевизор или тянет сквозняком по
                ногам — нервная система гостя остаётся в режиме обороны.
              </p>
              <ul className="space-y-1.5 text-xs sm:text-sm text-stone-300 pl-4 list-disc">
                <li>
                  <strong className="text-white">Свет:</strong> мягкий, тёплый янтарный полумрак (2700K),
                  скрытая подсветка под полками без прямых ламп в глаза лежащего гостя.
                </li>
                <li>
                  <strong className="text-white">Звук и речь:</strong> тишина, живое потрескивание дров,
                  шум воды или мягкие природные обертоны. Мастер говорит спокойно, чуть медленнее обычного,
                  низким грудным тембром.
                </li>
                <li>
                  <strong className="text-white">Тактильный тепловой комфорт:</strong> температура в зоне
                  отдыха +24...+25°C, тёплые тапочки, подогретые простыни и травяной чай приветствия.
                </li>
              </ul>
            </div>

            {/* Этап 2 */}
            <div className="p-5 rounded-xl bg-stone-950/70 border border-stone-800 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <h5 className="font-bold text-amber-300">
                  2. Психология доверия и «Контракт безопасности»
                </h5>
                <span className="text-[11px] font-semibold text-stone-500 uppercase">Знакомство</span>
              </div>
              <p>
                У большинства людей есть скрытые страхи перед баней: страх задохнуться в горячем пару,
                страх обжечься веником, страх потерять сознание или неловкость за своё тело. Пока есть
                страх — в крови держится адреналин, а сосуды спазмированы.
              </p>
              <ul className="space-y-1.5 text-xs sm:text-sm text-stone-300 pl-4 list-disc">
                <li>
                  <strong className="text-white">Прозрачный маршрут:</strong> за 1 минуту расскажите гостю,
                  что именно его ждёт («Сначала мягкий ароматный прогрев при +50°C, затем тёплый душ и
                  отдых с чаем, и только потом — глубокое парение»). Предсказуемость убирает тревогу.
                </li>
                <li>
                  <strong className="text-white">Правило «Стоп-слова и главного человека»:</strong> дайте
                  гостю чёткую установку: <em>«В парной не нужно ничего терпеть. Главный здесь — вы.
                  Достаточно поднять ладонь или сказать одно слово, и мы сразу убавим жар или выйдем»</em>.
                </li>
              </ul>
            </div>

            {/* Этап 3 */}
            <div className="p-5 rounded-xl bg-stone-950/70 border border-stone-800 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <h5 className="font-bold text-amber-300">
                  3. Невербальный радар на полке и «Правило 3 ступеней» при подъёме
                </h5>
                <span className="text-[11px] font-semibold text-stone-500 uppercase">В парной</span>
              </div>
              <p>
                Во время парения не стоит постоянно дёргать гостя вопросами («Вам нормально? Не горячо?») —
                каждый вопрос включает кору головного мозга и выбрасывает человека из глубокого транса.
                Мастер считывает состояние по телу:
              </p>
              <ul className="space-y-1.5 text-xs sm:text-sm text-stone-300 pl-4 list-disc">
                <li>
                  <strong className="text-white">Маркеры скрытого перегрева:</strong> сжатые кулаки или
                  пальцы стоп, напряжённые икры, частое поверхностное дыхание ртом, побледнение
                  носогубного треугольника. Увидели — сразу переходите на мягкие поглаживания и охлаждайте
                  голову!
                </li>
                <li>
                  <strong className="text-white">Безопасный подъём в 3 ступени (защита от обморока):</strong>{' '}
                  никогда не поднимайте гостя с полка резко! В жаре кровь депонирована в коже и ногах.
                  <strong> Ступень 1:</strong> закончили парение, дали полежать спокойно 30 секунд.
                  <strong> Ступень 2:</strong> помогли плавно сесть на край полка со спущенными ногами на
                  30–60 секунд (выровнять давление). <strong> Ступень 3:</strong> бережно вывели под локоть.
                </li>
              </ul>
            </div>

            {/* Этап 4 */}
            <div className="p-5 rounded-xl bg-stone-950/70 border border-stone-800 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <h5 className="font-bold text-amber-300">
                  4. Ритуал «Банного пеленания» и охрана 15 минут тишины
                </h5>
                <span className="text-[11px] font-semibold text-stone-500 uppercase">После выхода</span>
              </div>
              <p>
                После выхода из парной и контраста наступает самое ценное терапевтическое окно — пиковый
                выброс эндорфинов и глубокое парасимпатическое торможение («банная невесомость»).
              </p>
              <ul className="space-y-1.5 text-xs sm:text-sm text-stone-300 pl-4 list-disc">
                <li>
                  <strong className="text-white">Сухое тёплое пеленание:</strong> промокните воду с кожи
                  сухим полотенцем, уложите гостя на лежак с валиком под колени и плотно укутайте сухой
                  тёплой простынёй и пледом от плеч до самых кончиков пальцев ног.
                </li>
                <li>
                  <strong className="text-white">Священная тишина:</strong> первые 10–15 минут не разговаривайте
                  с гостем и не позволяйте другим шуметь рядом. Пусть человек побудет наедине с тишиной
                  и ощущением нового тела.
                </li>
              </ul>
            </div>

            {/* Этап 5 */}
            <div className="p-5 rounded-xl bg-stone-950/70 border border-stone-800 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <h5 className="font-bold text-amber-300">
                  5. Чайная церемония, минеральный баланс и послевкусие на неделю
                </h5>
                <span className="text-[11px] font-semibold text-stone-500 uppercase">Финал и забота</span>
              </div>
              <p>
                По закону психологии («правило пика и финала») именно последние 20 минут визита определяют
                90% воспоминаний гостя о бане:
              </p>
              <ul className="space-y-1.5 text-xs sm:text-sm text-stone-300 pl-4 list-disc">
                <li>
                  <strong className="text-white">Правильная карта напитков:</strong> между заходами —
                  тёплая вода (+38...+40°C) с долькой лимона или ягодным морсом небольшими глотками. В финале —
                  ароматный травяной сбор (ферментированный иван-чай, липа, чабрец, мята, донник, шиповник)
                  с мёдом вприкуску, орехами и курагой (восполнение калия и магния). Никакого ледяного
                  пива или газировки!
                </li>
                <li>
                  <strong className="text-white">Якорь памяти и забота на следующий день:</strong> подарите
                  гостю с собой маленький душистый пучок пихты или луговых трав в машину, пожелайте
                  спокойного сна, а на следующий день отправьте короткое тёплое сообщение:{' '}
                  <em>«Доброе утро! Как ваше самочувствие и сон после вчерашнего пара?»</em>. Такой гость
                  останется с вами на годы.
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={() => setStep(2)}
              className="px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2 shadow-lg"
            >
              Перейти к Шагу 2: Практикум (4 кейса) <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* ШАГ 2: ИНТЕРАКТИВНЫЙ ПРАКТИКУМ (4 РЕАЛЬНЫХ КЕЙСА)                 */}
      {/* ================================================================= */}
      {step === 2 && (
        <div className="rounded-2xl bg-stone-900/90 border border-stone-800 p-6 sm:p-8 space-y-6">
          {/* Переключатель 4 кейсов */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {SCENARIOS.map((s, idx) => {
              const pick = selectedOptions[s.id];
              const isSolved = s.options.find((o) => o.id === pick)?.isCorrect;
              const isActive = idx === activeScenarioIdx;
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveScenarioIdx(idx)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
                    isActive
                      ? 'bg-amber-950/30 border-amber-500/60 text-white'
                      : isSolved
                      ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                      : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <span className="text-xs font-bold truncate">
                    {s.guestEmoji} {s.stageTitle}
                  </span>
                  {isSolved && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Карточка ситуации */}
          <div className="p-5 rounded-xl bg-stone-950/80 border border-stone-800 space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">{currentScenario.guestEmoji}</span>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                  {currentScenario.stageTitle}
                </span>
                <h5 className="text-base sm:text-lg font-bold text-white">
                  {currentScenario.guestType}
                </h5>
              </div>
            </div>
            <p className="text-sm text-stone-300 leading-relaxed">{currentScenario.situation}</p>
            <div className="p-3.5 rounded-lg bg-stone-900 border-l-4 border-amber-500 text-xs sm:text-sm italic text-amber-100/90">
              {currentScenario.guestQuote}
            </div>
          </div>

          {/* Варианты действий мастера */}
          <div className="space-y-2.5">
            <p className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Выберите действие пармастера:
            </p>
            {currentScenario.options.map((opt) => {
              const isPicked = selectedOptId === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelectOption(opt)}
                  className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer text-xs sm:text-sm leading-relaxed ${
                    isPicked
                      ? opt.isCorrect
                        ? 'bg-emerald-950/30 border-emerald-500/60 text-emerald-100'
                        : 'bg-red-950/30 border-red-500/60 text-red-100'
                      : 'bg-stone-950/60 border-stone-800 text-stone-200 hover:border-amber-500/40'
                  }`}
                >
                  {opt.text}
                </button>
              );
            })}
          </div>

          {/* Разбор выбранного варианта */}
          {selectedOpt && (
            <div
              className={`p-4 rounded-xl border space-y-2 ${
                selectedOpt.isCorrect
                  ? 'bg-emerald-950/25 border-emerald-500/40 text-emerald-200'
                  : 'bg-red-950/25 border-red-500/40 text-red-200'
              }`}
            >
              <p className="text-xs sm:text-sm font-bold">
                {selectedOpt.isCorrect
                  ? '✓ Верное решение мастера!'
                  : '✕ Ошибка сервиса — выберите другой вариант выше'}
              </p>
              <p className="text-xs sm:text-sm text-stone-200">
                <strong>Реакция гостя:</strong> {selectedOpt.guestReaction}
              </p>
              <p className="text-xs text-stone-300">{selectedOpt.explanation}</p>

              {!selectedOpt.isCorrect && (
                <button
                  onClick={() => {
                    const copy = { ...selectedOptions };
                    delete copy[currentScenario.id];
                    setSelectedOptions(copy);
                  }}
                  className="mt-1 inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 hover:text-amber-200 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Попробовать другой ответ
                </button>
              )}
            </div>
          )}

          {/* Навигация между кейсами и шагами */}
          <div className="pt-2 border-t border-stone-800 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> К Шагу 1 (5 этапов стандарта)
            </button>

            {activeScenarioIdx < SCENARIOS.length - 1 && (
              <button
                onClick={() => setActiveScenarioIdx((i) => i + 1)}
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                Следующий кейс <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
