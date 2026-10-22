import React, { useState } from 'react';
import { playSuccessChime } from '../../utils/audio';
import confetti from 'canvas-confetti';
import { CheckCircle2, Check } from 'lucide-react';
import { TermTooltip } from '../TermTooltip';

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

        <div className="space-y-4 text-sm sm:text-base text-stone-300 leading-relaxed">
          <p>
            Физическое тело в парной проходит через три последовательные фазы: бережное раскрытие
            сосудов на первом заходе, глубокую тканевую и клеточную проработку под вениками и
            сосудистую гимнастику на контрасте.
          </p>

          <div className="space-y-2.5 bg-stone-950/60 border border-stone-800/80 rounded-xl p-5">
            <h5 className="font-bold text-amber-300">
              Этап А. Первый пар: раскрытие сосудистого русла (+45...+55°C)
            </h5>
            <p>
              От мягкого тепла в стенках сосудов выделяется <strong>оксид азота (NO)</strong>, и спящие
              капилляры кожи плавно расширяются в 2–3 раза. До <strong>15–20% всей крови</strong>{' '}
              перераспределяется из глубины тела к коже: это мягко снижает давление и разгружает
              сердце, печень и почки, а влажный пар с фитонцидами раскрывает бронхи и запускает потоотделение.
            </p>
          </div>

          <div className="space-y-2.5 bg-stone-950/60 border border-stone-800/80 rounded-xl p-5">
            <h5 className="font-bold text-amber-300">
              Этап Б. Парение вениками: размягчение фасций и белки HSP70 (+60...+70°C)
            </h5>
            <p>
              Конденсация пара на коже отдаёт мощную{' '}
              <TermTooltip
                title="Скрытая теплота конденсации (2260 кДж/кг)"
                text="Физический закон русской бани: когда невидимый водяной пар садится росой на более прохладную кожу гостя, он мгновенно высвобождает в 5 раз больше тепла, чем просто горячий сухой воздух."
              >
                скрытую теплоту фазового перехода
              </TermTooltip>
              , прогревая ткани на глубину 3–5 см. Пульс плавно растёт до 110–130 уд/мин — сердце получает
              мягкую кардиотренировку без ударной нагрузки на суставы.
            </p>
            <p>
              При прогреве мышц до +39...+40°C плотный коллаген мышечных оболочек (
              <TermTooltip
                title="Фасции (переход «гель → золь»)"
                text="Фасции — это соединительнотканные «футляры», окутывающие каждую мышцу. От стресса и холода они слипаются и твердеют, а при прогреве до +39...+40 °C становятся пластичными и текучими, как тёплый воск."
              >
                фасций
              </TermTooltip>
              ) переходит из вязкого состояния «геля» в текучее состояние «золя» —
              зажимы расправляются, а веники выжимают застойную жидкость в лимфоток. Одновременно
              в клетках синтезируются{' '}
              <TermTooltip
                title="Белки теплового шока (HSP70)"
                text="Особые защитные белки внутри наших клеток, которые включаются при глубоком банном прогреве. Они находят и «чинят» повреждённые клеточные структуры, замедляют старение и усиливают противовирусный иммунитет."
              >
                белки теплового шока (HSP70)
              </TermTooltip>{' '}
              — молекулярные «ремонтники», которые восстанавливают структуры клеток и укрепляют иммунитет.
            </p>
          </div>

          <div className="space-y-2.5 bg-stone-950/60 border border-stone-800/80 rounded-xl p-5">
            <h5 className="font-bold text-amber-300">
              Этап В. Контраст: «сосудистая помпа» и обновление крови
            </h5>
            <p>
              Когда тело прогрето до самого ядра, холодная вода или свежий воздух включают{' '}
              <strong>«сосудистую помпу»</strong>. Капилляры кожи мгновенно сужаются, и{' '}
              <strong>1–1.5 литра разогретой крови</strong> мощной волной устремляются внутрь — к сердцу,
              мозгу и внутренним органам, промывая их кислородом и выбрасывая в кровоток резервные
              иммунные клетки.
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

        <div className="space-y-4 text-sm sm:text-base text-stone-300 leading-relaxed">
          <p>
            Непрожитые стрессы — тревога, обида, гиперответственность — годами фиксируются в теле в виде
            хронических спазмов. В телесной терапии это называется{' '}
            <TermTooltip
              title="«Мышечный панцирь»"
              text="Привычное хроническое напряжение мышц (поднятые плечи, сжатые челюсти, зажатая диафрагма), с помощью которого психика годами сдерживает тревогу и эмоции. Когда пар расслабляет мышцу, уходит и запертое в ней напряжение."
            >
              «мышечным панцирем»
            </TermTooltip>
            .
          </p>

          <div className="space-y-1.5">
            <h5 className="font-bold text-white">
              1. Снятие защитных зажимов и отпускание гиперконтроля
            </h5>
            <p>
              В быту человек привыкает держать поднятыми плечи («груз ответственности»), сжимать челюсти
              («самоконтроль») и поверхностно дышать. В полумраке парной под обволакивающим теплом и
              ритмичным шелестом веников мозг получает сигнал безопасности: когда физически размягчаются
              трапеции, шея и диафрагма, по закону обратной связи <strong>уходит и удерживаемая ими тревога</strong>.
            </p>
          </div>

          <div className="space-y-1.5">
            <h5 className="font-bold text-white">
              2. Гормональная перезагрузка: снижение кортизола и волна эндорфинов
            </h5>
            <p>
              После глубокого прогрева и мягкого контраста уровень главного гормона стресса —{' '}
              <strong>кортизола — снижается на 40–45%</strong>, а гипофиз выбрасывает в кровь{' '}
              <strong>бета-эндорфины, серотонин и дофамин</strong> — природные нейромедиаторы покоя,
              умиротворения и светлой радости.
            </p>
          </div>

          <div className="space-y-1.5">
            <h5 className="font-bold text-white">
              3. Эмоциональный катарсис (разрядка) в зоне отдыха
            </h5>
            <p>
              После выхода из парной у гостя нередко наступает эмоциональная разрядка: глубокий вздох
              во всю грудь, непроизвольный смех от лёгкости или даже слёзы облегчения. Для мастера важно
              знать: это <strong>естественный и целительный выход накопленного напряжения</strong>, за
              которым приходит состояние глубокого покоя.
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

        <div className="space-y-4 text-sm sm:text-base text-stone-300 leading-relaxed">
          <p>
            На духовном уровне баня — это пространство внутренней тишины, где человек снимает не только
            одежду, но и социальные роли, спешку и информационный шум.
          </p>

          <div className="space-y-1.5">
            <h5 className="font-bold text-white">
              1. Остановка внутреннего диалога и переход на альфа- и тета-ритмы
            </h5>
            <p>
              Когда на тело ложится горячий дубовый компресс или человек погружается в купель, яркость
              телесных ощущений мгновенно выключает тревожную «мысленную жвачку». Внимание на 100%
              возвращается в точку «здесь и сейчас», а мозг переходит с суетливых бета-ритмов на
              медитативные{' '}
              <TermTooltip
                title="Альфа- и тета-ритмы мозга"
                text="Биоэлектрические волны глубокого покоя (4–13 Гц), характерные для медитации и момента перед засыпанием. В этом режиме отключается внутренняя тревога и запускается глубокое восстановление нервной системы."
              >
                альфа- и тета-волны
              </TermTooltip>{' '}
              глубокого покоя.
            </p>
          </div>

          <div className="space-y-1.5">
            <h5 className="font-bold text-white">
              2. Соединение с 4 стихиями и состояние обновления
            </h5>
            <p>
              В парной человек входит в живой контакт с четырьмя первоэлементами природы:{' '}
              <strong>Огнём</strong> (жар печи), <strong>Водой</strong> (пар и купель),{' '}
              <strong>Воздухом</strong> (дыхание и ветер от веников) и <strong>Землёй</strong> (дерево
              полка, камни, листья и травы). Проходя через жар, очищение водой и тихий отдых в простыне
              («банный пеленальник»), гость переживает глубокое внутреннее обновление — то самое чувство{' '}
              <em>«будто заново родился»</em>.
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
            4. Биомеханика пармастера («Банное тай-чи»): как не передавать напряжение гостю
          </h4>
        </div>

        <div className="space-y-4 text-sm sm:text-base text-stone-300 leading-relaxed">
          <p>
            Состояние мастера напрямую передаётся гостю через веники. Если пармастер сутулится, зажимает
            плечи и сбивает дыхание — тело гостя считывает тревогу и не может расслабиться.
          </p>

          <div className="space-y-1.5">
            <h5 className="font-bold text-white">
              1. Волновой импульс от стоп вместо работы руками
            </h5>
            <p>
              В технике <strong>«Банного тай-чи»</strong> мастер стоит в устойчивой широкой стойке на
              мягких пружинящих коленях с прямой осью позвоночника (бережем диски L4–L5 от перегрузки).
              Движение зарождается в стопах при плавном перекате веса с ноги на ногу, проходит волной
              через таз и корпус и легко вытекает в расслабленные руки — это экономит до 60% мышечной энергии.
            </p>
          </div>

          <div className="space-y-1.5">
            <h5 className="font-bold text-white">
              2. «Живая кисть» и синхронизация дыхания
            </h5>
            <p>
              Плечи всегда опущены, а рукоять веника удерживается свободно, как смычок скрипки (без
              «мёртвой хватки», забивающей предплечья). Глубокое диафрагмальное дыхание мастера животом
              через нос задаёт ритм взмахов и служит камертоном спокойствия для гостя, позволяя легко
              проводить 4–6 парений за смену.
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
