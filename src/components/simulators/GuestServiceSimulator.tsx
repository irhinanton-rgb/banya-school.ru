import React, { useState } from 'react';
import { playSuccessChime, playWoodTap } from '../../utils/audio';
import confetti from 'canvas-confetti';
import {
  Users,
  Coffee,
  HeartHandshake,
  CheckCircle2,
  Sparkles,
  MessageSquare,
  ShieldCheck,
  Star,
  Award,
} from 'lucide-react';

interface GuestServiceSimulatorProps {
  soundEnabled: boolean;
  onGrantXp?: (amount: number) => void;
  onSuccess?: () => void;
}

interface ServiceScenario {
  id: string;
  guestType: string;
  guestWords: string;
  challenge: string;
  options: {
    text: string;
    isCorrect: boolean;
    feedback: string;
  }[];
}

const SERVICE_SCENARIOS: ServiceScenario[] = [
  {
    id: 'anxious_guest',
    guestType: 'Тревожный гость (боится духоты и давления)',
    guestWords: '«Я вообще баню плохо переношу, у меня сразу голова кружится и дышать тяжело... Но друзья уговорили прийти.»',
    challenge: 'Как правильно встретить гостя и снять страх перед парной?',
    options: [
      {
        text: 'Сказать: «Да бросьте, у меня не забалуешь, сейчас пропарим до костей — сразу полюбите!»',
        isCorrect: false,
        feedback: 'Грубая ошибка! Это усилит панику гостя, поднимет пульс и приведет к психологическому спазму.',
      },
      {
        text: 'Успокоить: «Я полностью контролирую температуру. Мы начнем с 45 градусов, положим прохладную пихту на лицо, и в любой момент вы сможете выйти. Хозяин процесса — вы, а не парная.»',
        isCorrect: true,
        feedback: 'Идеально! Вы возвращаете гостю контроль над ситуацией, снимаете выработку адреналина и завоевываете глубокое доверие.',
      },
      {
        text: 'Предложить сразу выпить 50 грамм коньяка для храбрости.',
        isCorrect: false,
        feedback: 'Абсолютно недопустимо! Алкоголь и баня несовместимы и опасны для жизни.',
      },
    ],
  },
  {
    id: 'silent_hero',
    guestType: 'Молчаливый «терпила» (пытается доказать силу)',
    guestWords: 'Гость молчит, стиснул зубы, но вы видите, что носогубный треугольник побледнел, а пальцы вцепились в полок.',
    challenge: 'Ваши действия как мастера высокого сервиса?',
    options: [
      {
        text: 'Продолжать парить еще интенсивнее, раз гость сам не просит остановиться.',
        isCorrect: false,
        feedback: 'Опасно! Такой гость может потерять сознание прямо под вениками. Настоящий мастер видит невербальные знаки тела раньше слов.',
      },
      {
        text: 'Мягко опустить веники, положить холодное полотенце на лоб, приоткрыть нижнюю форточку и спокойно сказать: «Тело приняло идеальную порцию тепла. Пора сделать паузу и попить травяного чая.»',
        isCorrect: true,
        feedback: 'Высший пилотаж сервиса! Вы спасаете здоровье гостя, не задевая его эго и мужскую гордость («не вы сдались, а тело напиталось теплом»).',
      },
      {
        text: 'Громко закричать: «Вам плохо?! Скорее на пол!»',
        isCorrect: false,
        feedback: 'Создаст панику и стыд у гостя перед другими людьми.',
      },
    ],
  },
  {
    id: 'tea_ceremony',
    guestType: 'Финальный аккорд сеанса (Чайная церемония и отдых)',
    guestWords: 'Гость вышел после финального контраста, укутан в халат и сидит в зоне отдыха.',
    challenge: 'Как закрепить пятизвездочный сервис и оставить неизгладимое впечатление?',
    options: [
      {
        text: 'Сразу выставить счет и попросить освободить помещение для следующих гостей.',
        isCorrect: false,
        feedback: 'Разрушит всю магию перезагрузки. Гость уйдет с ощущением конвейера.',
      },
      {
        text: 'Подать теплый травяной настой (донник/липа/мята) с алтайским медом, сушеными ягодами и дать 15–20 минут побыть в тишине под мягкую музыку или звуки поющей чаши.',
        isCorrect: true,
        feedback: 'Блестяще! Послевкусие бани закрепляется именно в зоне отдыха. Гость запомнит это чувство искренней заботы и станет вашим постоянным клиентом.',
      },
      {
        text: 'Включить громкий телевизор с новостями.',
        isCorrect: false,
        feedback: 'Информационный шум мгновенно разрушит парасимпатическое состояние глубокого покоя.',
      },
    ],
  },
];

export const GuestServiceSimulator: React.FC<GuestServiceSimulatorProps> = ({
  soundEnabled,
  onGrantXp,
  onSuccess,
}) => {
  const [currentScenarioIdx, setCurrentScenarioIdx] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState<boolean>(false);
  const [solvedScenarios, setSolvedScenarios] = useState<string[]>([]);

  const scenario = SERVICE_SCENARIOS[currentScenarioIdx];

  const handleSelect = (idx: number) => {
    if (hasAnswered) return;
    setSelectedOption(idx);
    setHasAnswered(true);
    playWoodTap(soundEnabled);

    const isCorrect = scenario.options[idx].isCorrect;
    if (isCorrect) {
      playSuccessChime(soundEnabled);
      if (!solvedScenarios.includes(scenario.id)) {
        const updated = [...solvedScenarios, scenario.id];
        setSolvedScenarios(updated);
        if (onGrantXp) onGrantXp(30);

        if (updated.length === SERVICE_SCENARIOS.length) {
          if (onSuccess) onSuccess();
          try {
            confetti({
              particleCount: 60,
              spread: 75,
              origin: { y: 0.6 },
            });
          } catch {
            // ignore
          }
        }
      }
    }
  };

  const handleNext = () => {
    setSelectedOption(null);
    setHasAnswered(false);
    setCurrentScenarioIdx((prev) => (prev + 1) % SERVICE_SCENARIOS.length);
    playWoodTap(soundEnabled);
  };

  return (
    <div className="rounded-2xl border border-stone-800 bg-stone-900/90 p-5 sm:p-7 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
            <span>🤝</span>
            <span>Тренажёр Премиального Сервиса и Психологии</span>
          </div>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-100 mt-1">
            Психология общения, забота и атмосфера в бане
          </h3>
          <p className="text-xs text-stone-400 mt-0.5">
            Пармастер — не просто банщик, а проводник в мир спокойствия. Отработайте тонкие ситуации с реальными гостями.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto bg-stone-950 px-3 py-1.5 rounded-xl border border-stone-800">
          <span className="text-[11px] font-mono text-stone-400">Решено кейсов:</span>
          <span className="text-xs font-mono font-bold text-amber-300">
            {solvedScenarios.length} / {SERVICE_SCENARIOS.length}
          </span>
        </div>
      </div>

      {/* Scenario Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-stone-950/90 border border-stone-800 space-y-4">
        <div className="flex items-center justify-between">
          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-mono font-semibold">
            Кейс {currentScenarioIdx + 1} из {SERVICE_SCENARIOS.length}: {scenario.guestType}
          </span>
          {solvedScenarios.includes(scenario.id) && (
            <span className="text-xs font-mono text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Решено ✓</span>
            </span>
          )}
        </div>

        <div className="p-4 rounded-xl bg-stone-900/90 border border-stone-800 text-stone-200 text-xs sm:text-sm italic leading-relaxed border-l-4 border-l-amber-500">
          {scenario.guestWords}
        </div>

        <div className="text-xs sm:text-sm font-semibold text-stone-100">
          ❓ {scenario.challenge}
        </div>

        {/* Options */}
        <div className="space-y-2.5 pt-1">
          {scenario.options.map((opt, idx) => {
            const isSelected = selectedOption === idx;
            let btnStyle = 'border-stone-800 bg-stone-900 hover:bg-stone-850 text-stone-300';
            if (hasAnswered) {
              if (opt.isCorrect) {
                btnStyle = 'border-emerald-500 bg-emerald-950/40 text-emerald-200 ring-1 ring-emerald-500/50';
              } else if (isSelected) {
                btnStyle = 'border-rose-500 bg-rose-950/40 text-rose-200';
              } else {
                btnStyle = 'border-stone-850 bg-stone-900/40 text-stone-500 opacity-60';
              }
            }

            return (
              <div key={idx} className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => handleSelect(idx)}
                  disabled={hasAnswered}
                  className={`w-full p-3.5 rounded-xl border text-left text-xs transition-all cursor-pointer flex items-start gap-3 ${btnStyle}`}
                >
                  <span className="w-5 h-5 rounded-full bg-stone-800 border border-stone-700 flex items-center justify-center shrink-0 font-mono text-[10px] text-stone-300 mt-0.5">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="flex-1 leading-snug">{opt.text}</span>
                </button>

                {hasAnswered && isSelected && (
                  <div
                    className={`p-3 rounded-xl text-xs leading-relaxed ${
                      opt.isCorrect
                        ? 'bg-emerald-950/30 text-emerald-300 border border-emerald-500/30'
                        : 'bg-rose-950/30 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    <strong>{opt.isCorrect ? '✓ Верно!' : '✗ Ошибка:'}</strong> {opt.feedback}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Next Scenario Button */}
        {hasAnswered && (
          <div className="pt-2 flex justify-end">
            <button
              onClick={handleNext}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center gap-2"
            >
              <span>Следующий кейс сервиса →</span>
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
