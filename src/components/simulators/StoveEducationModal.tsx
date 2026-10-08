import React, { useState } from 'react';
import {
  Flame,
  Droplets,
  Wind,
  Info,
  Sparkles,
  Layers,
  Radio,
  X,
  CheckCircle2,
  ChevronRight,
  ShieldAlert,
  Zap,
  HelpCircle,
} from 'lucide-react';
import { playExplosiveSteamSound, playSteamSound, playWoodTap, playSuccessChime } from '../../utils/audio';

interface StoveEducationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplySteam: (type: 'closed' | 'open', humidityBoost: number, tempBoost: number) => void;
  soundEnabled: boolean;
}

export const StoveEducationModal: React.FC<StoveEducationModalProps> = ({
  isOpen,
  onClose,
  onApplySteam,
  soundEnabled,
}) => {
  const [activeTab, setActiveTab] = useState<'blueprint' | 'steamTypes' | 'ceremonies' | 'infrared' | 'quiz'>('blueprint');
  const [selectedPart, setSelectedPart] = useState<string>('closed_chamber');
  const [steamAnimation, setSteamAnimation] = useState<'closed' | 'open' | 'herbal' | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleStovePour = (type: 'closed' | 'open' | 'herbal') => {
    playWoodTap(soundEnabled);
    setSteamAnimation(type);

    if (type === 'closed') {
      playExplosiveSteamSound(soundEnabled);
      setFeedbackMessage(
        '💥 Пушечный выстрел! Вода взорвалась на камнях t=550°C в глубине ядра. Родился легчайший сухой мелкодисперсный пар!'
      );
      onApplySteam('closed', 8, 2);
    } else if (type === 'open') {
      playSteamSound(soundEnabled);
      setFeedbackMessage(
        '♨️ Мягкое шипение! Верхние камни t=220°C дали влажный плотный пар для создания контраста или шапки.'
      );
      onApplySteam('open', 5, 1);
    } else {
      playSteamSound(soundEnabled);
      setFeedbackMessage(
        '🌿 Травяной отвар подан на умеренно прогретый камень (t≈190°C). Фитонциды раскрылись целебным ароматом без гари!'
      );
      onApplySteam('open', 6, 1);
    }

    setTimeout(() => {
      setSteamAnimation(null);
    }, 2500);
  };

  const stoveParts = [
    {
      id: 'closed_chamber',
      name: 'Закрытая каменка (Ядро печи)',
      temp: '450°C — 650°C',
      icon: '🔒',
      desc: 'Сердце русской бани. Чугунный или жаропрочный короб внутри пламени. Камни раскалены докрасна, но не перегревают воздух в парной.',
      role: 'Рождает сухой перегретый («мелкодисперсный») пар без видимого тумана. Вода подается через специальную паровую пушку на самое дно.',
      proTip: 'Заливать ядро холодной водой нельзя — только крутой кипяток малыми порциями (по 100-200 мл), чтобы не залить каменку.',
    },
    {
      id: 'steam_cannon',
      name: 'Паровая пушка / Воронка подачи',
      temp: 'До 500°C',
      icon: '🚿',
      desc: 'Канал из нержавеющей стали с перфорированными лучами на дне закрытой каменки.',
      role: 'Доставляет воду в самый раскаленный нижний слой камней. Вода превращается в пар в замкнутом объеме под давлением, вылетая в парную перегретой струей.',
      proTip: 'Благодаря пушке пар проходит снизу вверх через всю толщу раскаленных камней, дробясь до молекулярного состояния.',
    },
    {
      id: 'open_stones',
      name: 'Открытая каменка (Верхний ярус)',
      temp: '180°C — 260°C',
      icon: '🪨',
      desc: 'Камни, лежащие на внешней поверхности печи, непосредственно контактирующие с воздухом парной.',
      role: 'Идеальны для подачи травяных отваров, эфирных запарок и доиспарения. Не дают травам сгореть.',
      proTip: 'Если лить только сюда — пар будет тяжелым, крупнодисперсным, а камни быстро остынут и «зальются».',
    },
    {
      id: 'sarcophagus',
      name: 'Облицовка / Саркофаг (Талькомагнезит/Кирпич)',
      temp: '60°C — 85°C',
      icon: '🛡️',
      desc: 'Толстостенный кожух из натурального камня (талькохлорит, змеевик, пироксенит) или шамотного кирпича.',
      role: 'Блокирует жесткое коротковолновое инфракрасное излучение от металла печи и трансформирует его в целебное длинноволновое ИК-тепло.',
      proTip: 'Саркофаг стабилизирует кондиции русской бани: 60°C на полке без пересушивания воздуха конвекцией.',
    },
    {
      id: 'firebox',
      name: 'Топочная камера и пламя',
      temp: '800°C — 1100°C',
      icon: '🔥',
      desc: 'Пространство сгорания дров с колосником, зольником и каналами вторичного дожига газов.',
      role: 'Энергетический генератор бани. В правильной печи огонь обтекает каменку со всех пяти сторон для максимального прогрева закладки.',
      proTip: 'Березовые и ольховые дрова дают длинное мягкое пламя с минимальным количеством копоти.',
    },
    {
      id: 'convection_doors',
      name: 'Конвекционные дверцы / Заслонки',
      temp: 'Регулируемые',
      icon: '🚪',
      desc: 'Вентиляционные отверстия в нижней и верхней части каменного саркофага.',
      role: 'При растопке дверцы открывают — горячий воздух быстро греет парную. Во время парения их закрывают, чтобы остановить сквозняки и пересушивание пара.',
      proTip: '«Убить конвекцию во время парения» — главный закон русской бани, иначе пар с полка сдует конвекционным вихрем.',
    },
    {
      id: 'chimney_economizer',
      name: 'Дымоход с сеткой-экономайзером',
      temp: '300°C — 450°C',
      icon: '💨',
      desc: 'Первый метр дымоходной трубы, закрытый сеткой с камнями или теплообменником.',
      role: 'Снимает самое опасное жесткое ИК-излучение с раскаленной трубы, забирает паразитное тепло уходящих газов и повышает пожарную безопасность.',
      proTip: 'Шиберная заслонка на трубе позволяет точно регулировать тягу и сохранять накопленное тепло.',
    },
  ];

  const currentPartData = stoveParts.find((p) => p.id === selectedPart) || stoveParts[0];

  const quizQuestions = [
    {
      q: 'Где в правильной банной печи рождается легкий мелкодисперсный пар?',
      options: [
        'На трубе дымохода при максимальной тяге',
        'В закрытой каменке при температуре камней свыше 450–500°C',
        'На открытых камнях, если плеснуть сразу 2 литра холодной воды',
        'В зольнике под колосниковой решеткой',
      ],
      correct: 1,
      explain: 'Именно в изолированной закрытой каменке камни раскаляются до 500-600°C. Капли воды взрываются в пар субмикронного размера.',
    },
    {
      q: 'Какое инфракрасное излучение считается целебным для человеческого организма в парной?',
      options: [
        'Коротковолновое от раскаленного железа (длина волны < 2 мкм)',
        'Рентгеновское и ультрафиолетовое излучение от углей',
        'Мягкое длинноволновое от камня саркофага (длина волны 8–14 мкм, биорезонанс)',
        'Чем горячее и жестче печет кожу — тем полезнее',
      ],
      correct: 2,
      explain: 'Тепловое излучение камня при 60-80°C по спектру (8-14 мкм) идентично теплу человеческого тела. Оно прогревает ткани на глубину до 4 см без ожога кожи.',
    },
    {
      q: 'Почему нельзя лить отвары трав прямо в раскаленное ядро закрытой каменки?',
      options: [
        'Камни мгновенно лопнут от запаха трав',
        'Эфирные масла и органика сгорят при 500°C с выделением едкой гари и канцерогенов',
        'Травы затушат пламя в топке',
        'Пар станет слишком холодным',
      ],
      correct: 1,
      explain: 'Органика мгновенно обугливается при t > 300°C. Арома-настои подают только на верхние умеренно прогретые камни или через арома-чашу.',
    },
  ];

  const handleAnswer = (qIdx: number, optIdx: number) => {
    if (quizSubmitted) return;
    setQuizAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
  };

  const handleCheckQuiz = () => {
    setQuizSubmitted(true);
    playSuccessChime(soundEnabled);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-5xl rounded-3xl border border-amber-600/40 bg-stone-950 text-stone-100 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Top Header / Humorous Hook */}
        <div className="relative bg-gradient-to-r from-amber-950/80 via-stone-900 to-rose-950/80 border-b border-stone-800 p-5 sm:p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-stone-900/80 hover:bg-stone-800 text-stone-400 hover:text-stone-100 transition-colors border border-stone-700/60"
            title="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start gap-4">
            <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-2xl sm:text-3xl shrink-0 shadow-inner">
              🪵
            </div>

            <div className="pr-8">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-mono uppercase tracking-wider mb-1">
                <span>🔥 В парной кнопок нет!</span>
                <span className="text-stone-500">•</span>
                <span>Анатомия сердца бани</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-serif font-bold text-amber-100">
                «В парной кнопок нет) Давай разберемся с печкой!»
              </h2>

              <p className="text-xs sm:text-sm text-stone-300 mt-1 leading-relaxed">
                Настоящий пармастер не тыкает кнопки — он управляет стихиями воды, огня, камня и пара. 
                Узнай, как устроена печь, откуда берется невесомый «легкий пар», как миксовать паровой пирог и почему каменный саркофаг спасает от «жесткого облучения».
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-4 mt-3 border-t border-stone-800/80 scrollbar-none">
            <button
              onClick={() => setActiveTab('blueprint')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'blueprint'
                  ? 'bg-amber-500 text-stone-950 shadow-md font-bold'
                  : 'bg-stone-900/80 text-stone-400 hover:text-stone-200 hover:bg-stone-800'
              }`}
            >
              <span>📐 Макет печи в разрезе</span>
            </button>

            <button
              onClick={() => setActiveTab('steamTypes')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'steamTypes'
                  ? 'bg-amber-500 text-stone-950 shadow-md font-bold'
                  : 'bg-stone-900/80 text-stone-400 hover:text-stone-200 hover:bg-stone-800'
              }`}
            >
              <Droplets className="w-3.5 h-3.5" />
              <span>Мелкодисперсный vs Крупный пар</span>
            </button>

            <button
              onClick={() => setActiveTab('ceremonies')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'ceremonies'
                  ? 'bg-amber-500 text-stone-950 shadow-md font-bold'
                  : 'bg-stone-900/80 text-stone-400 hover:text-stone-200 hover:bg-stone-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Смешивание пара и церемонии</span>
            </button>

            <button
              onClick={() => setActiveTab('infrared')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'infrared'
                  ? 'bg-amber-500 text-stone-950 shadow-md font-bold'
                  : 'bg-stone-900/80 text-stone-400 hover:text-stone-200 hover:bg-stone-800'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Инфракрасное тепло (ИК-волны)</span>
            </button>

            <button
              onClick={() => setActiveTab('quiz')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === 'quiz'
                  ? 'bg-amber-500 text-stone-950 shadow-md font-bold'
                  : 'bg-stone-900/80 text-stone-400 hover:text-stone-200 hover:bg-stone-800'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Тест пармастера</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">

          {/* TAB 1: INTERACTIVE BLUEPRINT */}
          {activeTab === 'blueprint' && (
            <div className="space-y-6">
              {/* Interactive Stove Controls Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/20">
                <div className="flex items-center gap-2 text-xs text-amber-200">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Интерактивный пульт подачи ковша: жми и смотри, как работает физика печи!</span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleStovePour('closed')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs uppercase tracking-wide transition-all shadow-md active:scale-95"
                  >
                    <span>💥 В закрытую каменку (550°C)</span>
                  </button>

                  <button
                    onClick={() => handleStovePour('open')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-xs transition-all border border-stone-700 active:scale-95"
                  >
                    <span>♨️ На открытые камни (220°C)</span>
                  </button>

                  <button
                    onClick={() => handleStovePour('herbal')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 font-semibold text-xs transition-all border border-emerald-700/50 active:scale-95"
                  >
                    <span>🌿 Фито-запарка с травами</span>
                  </button>
                </div>
              </div>

              {/* Toast Feedback */}
              {feedbackMessage && (
                <div className="p-3 rounded-xl bg-stone-900 border border-amber-500/40 text-xs text-amber-200 animate-fade-in flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>{feedbackMessage}</span>
                  </div>
                  <span className="text-[10px] font-mono text-stone-400">Параметры симулятора обновлены</span>
                </div>
              )}

              {/* Main Blueprint & Breakdown Split */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Visual SVG Cross-Section Schema */}
                <div className="lg:col-span-7 rounded-2xl bg-stone-900/90 border border-stone-800 p-4 sm:p-5 relative overflow-hidden shadow-inner flex flex-col items-center">
                  
                  {/* Floating Steam particles when animation triggers */}
                  {steamAnimation && (
                    <div className="absolute inset-0 pointer-events-none z-20 flex flex-col items-center justify-start pt-6 overflow-hidden">
                      <div
                        className={`w-3/4 rounded-full blur-2xl transition-all duration-1000 ${
                          steamAnimation === 'closed'
                            ? 'h-32 bg-amber-400/20 animate-pulse'
                            : steamAnimation === 'herbal'
                            ? 'h-40 bg-emerald-400/25 animate-pulse'
                            : 'h-48 bg-stone-200/35 animate-pulse'
                        }`}
                      />
                      <div className="text-xs font-mono font-bold tracking-wider px-3 py-1 rounded-full bg-stone-950/80 border border-amber-500/50 text-amber-300 mt-2 shadow-lg">
                        {steamAnimation === 'closed'
                          ? '💨 ВЗРЫВ ЛЕГКОГО ПЕРЕГРЕТОГО ПАРА (СУБМИКРОН)!'
                          : steamAnimation === 'herbal'
                          ? '🌿 ФИТОНЦИДНОЕ ОБЛАКО АРОМАТА!'
                          : '🌫️ КЛУБЫ ПЛОТНОГО КРУПНОДИСПЕРСНОГО ПАРА!'}
                      </div>
                    </div>
                  )}

                  <div className="w-full flex items-center justify-between pb-3 border-b border-stone-800/80 text-xs">
                    <span className="font-mono text-stone-300 font-semibold flex items-center gap-2">
                      <span>🪵</span>
                      <span>ИНТЕРАКТИВНЫЙ РАЗРЕЗ ПЕЧИ (КЛИКАЙ НА УЗЛЫ)</span>
                    </span>
                    <span className="text-amber-400 font-bold hidden sm:inline">
                      ● РЕЖИМ: ЗАКРЫТАЯ КАМЕНКА 550°C
                    </span>
                  </div>

                  {/* SVG Cutaway Graphic */}
                  <div className="w-full max-w-[500px] aspect-[4/5] relative my-2">
                    <svg viewBox="0 0 440 560" className="w-full h-full select-none">
                      <defs>
                        {/* Realistic Fire Gradient */}
                        <linearGradient id="fireGradRich" x1="0" y1="1" x2="0" y2="0">
                          <stop offset="0%" stopColor="#b91c1c" />
                          <stop offset="25%" stopColor="#ea580c" />
                          <stop offset="55%" stopColor="#f59e0b" />
                          <stop offset="85%" stopColor="#fef08a" />
                          <stop offset="100%" stopColor="#ffffff" />
                        </linearGradient>

                        {/* Polished Soapstone Sarcophagus Gradient */}
                        <linearGradient id="soapstoneGrad" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#1c1917" />
                          <stop offset="15%" stopColor="#292524" />
                          <stop offset="50%" stopColor="#44403c" />
                          <stop offset="85%" stopColor="#292524" />
                          <stop offset="100%" stopColor="#1c1917" />
                        </linearGradient>

                        {/* Superheated Core Radiance */}
                        <radialGradient id="hotCoreRadial" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor="#fef08a" stopOpacity="1" />
                          <stop offset="35%" stopColor="#f59e0b" stopOpacity="0.9" />
                          <stop offset="70%" stopColor="#dc2626" stopOpacity="0.8" />
                          <stop offset="100%" stopColor="#7f1d1d" stopOpacity="0.7" />
                        </radialGradient>

                        {/* Soft Infrared Bio-Resonance Waves */}
                        <radialGradient id="irWaveGrad">
                          <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.16" />
                          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                        </radialGradient>

                        {/* Metallic Stainless Steel */}
                        <linearGradient id="steelPipeGrad" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#57534e" />
                          <stop offset="40%" stopColor="#a8a29e" />
                          <stop offset="70%" stopColor="#d6d3d1" />
                          <stop offset="100%" stopColor="#57534e" />
                        </linearGradient>
                      </defs>

                      {/* External Infrared Waves radiating from Sarcophagus */}
                      <circle cx="220" cy="310" r="210" fill="url(#irWaveGrad)" stroke="#f59e0b" strokeWidth="1" strokeDasharray="6 4" opacity="0.4" />
                      <circle cx="220" cy="310" r="185" fill="none" stroke="#f59e0b" strokeWidth="1" strokeDasharray="4 3" opacity="0.6" />

                      {/* --- 1. CHIMNEY & ECONOMIZER (Дымоход с экономайзером) --- */}
                      <g
                        className="cursor-pointer transition-all hover:opacity-95"
                        onClick={() => {
                          playWoodTap(soundEnabled);
                          setSelectedPart('chimney_economizer');
                        }}
                      >
                        {/* Chimney Pipe */}
                        <rect
                          x="192"
                          y="15"
                          width="56"
                          height="115"
                          rx="4"
                          fill="url(#steelPipeGrad)"
                          stroke={selectedPart === 'chimney_economizer' ? '#f59e0b' : '#78716c'}
                          strokeWidth={selectedPart === 'chimney_economizer' ? 2.5 : 1.5}
                        />

                        {/* Damper (Шибер) Control Rod & Plate */}
                        <line x1="180" y1="55" x2="260" y2="55" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
                        <circle cx="260" cy="55" r="6" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
                        <text x="272" y="59" fill="#f59e0b" fontSize="9" fontWeight="bold" fontFamily="monospace">Шибер</text>

                        {/* Economizer Rock Cage */}
                        <rect
                          x="175"
                          y="62"
                          width="90"
                          height="70"
                          rx="8"
                          fill="#141211"
                          stroke={selectedPart === 'chimney_economizer' ? '#f59e0b' : '#a8a29e'}
                          strokeWidth={selectedPart === 'chimney_economizer' ? 2 : 1.5}
                          strokeDasharray="4 2"
                        />

                        {/* Stones inside economizer cage */}
                        <circle cx="192" cy="80" r="8" fill="#78716c" />
                        <circle cx="214" cy="76" r="9" fill="#57534e" />
                        <circle cx="238" cy="82" r="8" fill="#78716c" />
                        <circle cx="198" cy="104" r="10" fill="#44403c" />
                        <circle cx="222" cy="110" r="9" fill="#78716c" />
                        <circle cx="244" cy="102" r="9" fill="#57534e" />
                      </g>

                      {/* --- 2. OUTER STONE SARCOPHAGUS (Саркофаг из талькохлорита) --- */}
                      <g
                        className="cursor-pointer transition-all hover:opacity-95"
                        onClick={() => {
                          playWoodTap(soundEnabled);
                          setSelectedPart('sarcophagus');
                        }}
                      >
                        <rect
                          x="75"
                          y="135"
                          width="290"
                          height="390"
                          rx="14"
                          fill="url(#soapstoneGrad)"
                          stroke={selectedPart === 'sarcophagus' ? '#f59e0b' : '#78716c'}
                          strokeWidth={selectedPart === 'sarcophagus' ? 3 : 2}
                        />

                        {/* Stone Masonry Seams & Chamfers */}
                        <line x1="75" y1="220" x2="365" y2="220" stroke="#0c0a09" strokeWidth="2.5" />
                        <line x1="75" y1="305" x2="365" y2="305" stroke="#0c0a09" strokeWidth="2.5" />
                        <line x1="75" y1="395" x2="365" y2="395" stroke="#0c0a09" strokeWidth="2.5" />
                        <line x1="75" y1="480" x2="365" y2="480" stroke="#0c0a09" strokeWidth="2.5" />
                        
                        <line x1="175" y1="135" x2="175" y2="220" stroke="#0c0a09" strokeWidth="2" />
                        <line x1="265" y1="220" x2="265" y2="305" stroke="#0c0a09" strokeWidth="2" />
                        <line x1="165" y1="305" x2="165" y2="395" stroke="#0c0a09" strokeWidth="2" />
                        <line x1="275" y1="395" x2="275" y2="480" stroke="#0c0a09" strokeWidth="2" />
                      </g>

                      {/* --- 3. CONVECTION DAMPERS (Конвекционные заслонки) --- */}
                      <g
                        className="cursor-pointer transition-all"
                        onClick={() => {
                          playWoodTap(soundEnabled);
                          setSelectedPart('convection_doors');
                        }}
                      >
                        {/* Top Louvers (Hot Air Outlet) */}
                        <rect x="85" y="150" width="40" height="22" rx="4" fill="#0c0a09" stroke={selectedPart === 'convection_doors' ? '#38bdf8' : '#f59e0b'} strokeWidth="1.5" />
                        <text x="91" y="165" fill="#f59e0b" fontSize="9" fontWeight="bold" fontFamily="sans-serif">ЗАКР</text>

                        <rect x="315" y="150" width="40" height="22" rx="4" fill="#0c0a09" stroke={selectedPart === 'convection_doors' ? '#38bdf8' : '#f59e0b'} strokeWidth="1.5" />
                        <text x="321" y="165" fill="#f59e0b" fontSize="9" fontWeight="bold" fontFamily="sans-serif">ЗАКР</text>

                        {/* Bottom Air Intakes (Cool air in) */}
                        <rect x="85" y="490" width="40" height="22" rx="4" fill="#0c0a09" stroke="#78716c" strokeWidth="1.5" />
                        <rect x="315" y="490" width="40" height="22" rx="4" fill="#0c0a09" stroke="#78716c" strokeWidth="1.5" />
                        
                        {/* Airflow Direction Indicators */}
                        <path d="M 105,485 L 105,455" stroke="#38bdf8" strokeWidth="2" strokeDasharray="3 2" markerEnd="url(#arrow)" />
                        <path d="M 335,485 L 335,455" stroke="#38bdf8" strokeWidth="2" strokeDasharray="3 2" />
                      </g>

                      {/* --- 4. OPEN STONES TRAY (Открытая каменка - Арома) --- */}
                      <g
                        className="cursor-pointer"
                        onClick={() => {
                          playWoodTap(soundEnabled);
                          setSelectedPart('open_stones');
                        }}
                      >
                        <rect
                          x="135"
                          y="140"
                          width="170"
                          height="40"
                          rx="7"
                          fill="#1c1917"
                          stroke={selectedPart === 'open_stones' ? '#f43f5e' : '#e11d48'}
                          strokeWidth={selectedPart === 'open_stones' ? 2.5 : 1.5}
                        />

                        {/* Upper Stones with soft warm tints */}
                        <ellipse cx="158" cy="155" rx="12" ry="8" fill="#78716c" />
                        <ellipse cx="186" cy="151" rx="14" ry="9" fill="#a8a29e" />
                        <ellipse cx="220" cy="155" rx="16" ry="10" fill="#78716c" />
                        <ellipse cx="254" cy="151" rx="14" ry="9" fill="#a8a29e" />
                        <ellipse cx="282" cy="155" rx="12" ry="8" fill="#78716c" />
                        <text x="180" y="171" fill="#fda4af" fontSize="10" fontWeight="bold">220°C Открытая</text>
                      </g>

                      {/* --- 5. STEAM CANNON (Паровая пушка / Дозатор) --- */}
                      <g
                        className="cursor-pointer"
                        onClick={() => {
                          playWoodTap(soundEnabled);
                          setSelectedPart('steam_cannon');
                        }}
                      >
                        {/* Funnel */}
                        <polygon
                          points="210,120 230,120 224,180 216,180"
                          fill="#38bdf8"
                          stroke={selectedPart === 'steam_cannon' ? '#ffffff' : '#0284c7'}
                          strokeWidth="2"
                        />
                        {/* Feed pipe down into the hot bottom */}
                        <line x1="220" y1="180" x2="220" y2="280" stroke="#38bdf8" strokeWidth="4" />
                        {/* Bottom distribution branches */}
                        <line x1="160" y1="280" x2="280" y2="280" stroke="#38bdf8" strokeWidth="3" strokeDasharray="5 3" />
                        {/* Water Droplet Glow */}
                        <circle cx="220" cy="132" r="5" fill="#38bdf8" className="animate-pulse" />
                      </g>

                      {/* --- 6. CLOSED STONE CORE (Закрытая каменка - Ядро 550°C) --- */}
                      <g
                        className="cursor-pointer"
                        onClick={() => {
                          playWoodTap(soundEnabled);
                          setSelectedPart('closed_chamber');
                        }}
                      >
                        <rect
                          x="130"
                          y="185"
                          width="180"
                          height="115"
                          rx="10"
                          fill="url(#hotCoreRadial)"
                          stroke={selectedPart === 'closed_chamber' ? '#ffffff' : '#f59e0b'}
                          strokeWidth={selectedPart === 'closed_chamber' ? 3.5 : 2}
                        />

                        {/* Internal Glowing Hot Jadeite & Cast Iron Cannonballs */}
                        <circle cx="158" cy="214" r="14" fill="#991b1b" stroke="#fca5a5" strokeWidth="1" />
                        <circle cx="192" cy="208" r="15" fill="#b91c1c" stroke="#fef08a" strokeWidth="1.5" />
                        <circle cx="228" cy="212" r="16" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
                        <circle cx="262" cy="210" r="15" fill="#b91c1c" stroke="#fef08a" strokeWidth="1.5" />
                        <circle cx="288" cy="220" r="12" fill="#991b1b" stroke="#fca5a5" strokeWidth="1" />

                        <circle cx="150" cy="248" r="15" fill="#b91c1c" stroke="#fef08a" strokeWidth="1.5" />
                        <circle cx="184" cy="254" r="17" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
                        <circle cx="220" cy="248" r="18" fill="#f59e0b" stroke="#ffffff" strokeWidth="2.5" className="animate-pulse" />
                        <circle cx="256" cy="255" r="17" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
                        <circle cx="290" cy="246" r="14" fill="#b91c1c" stroke="#fef08a" strokeWidth="1.5" />

                        {/* Core Status Banner */}
                        <rect x="145" y="274" width="150" height="20" rx="5" fill="#000000" opacity="0.85" />
                        <text x="155" y="288" fill="#fde047" fontSize="11" fontWeight="bold" fontFamily="monospace">
                          ЯДРО: 550°C — 650°C
                        </text>
                      </g>

                      {/* --- 7. FIREBOX & COMBUSTION (Топка и Пламя) --- */}
                      <g
                        className="cursor-pointer"
                        onClick={() => {
                          playWoodTap(soundEnabled);
                          setSelectedPart('firebox');
                        }}
                      >
                        {/* Firebox Chamber */}
                        <rect
                          x="120"
                          y="310"
                          width="200"
                          height="130"
                          rx="8"
                          fill="#14110f"
                          stroke={selectedPart === 'firebox' ? '#ef4444' : '#b45309'}
                          strokeWidth={selectedPart === 'firebox' ? 3 : 2}
                        />

                        {/* Roaring Flames */}
                        <path
                          d="M 135,415 Q 155,325 170,405 Q 190,315 205,400 Q 220,305 235,405 Q 255,320 270,410 Q 290,340 305,415 Z"
                          fill="url(#fireGradRich)"
                          className="animate-pulse"
                        />

                        {/* Birch Firewood Logs */}
                        <line x1="145" y1="410" x2="295" y2="410" stroke="#78350f" strokeWidth="10" strokeLinecap="round" />
                        <line x1="155" y1="400" x2="285" y2="400" stroke="#451a03" strokeWidth="8" strokeLinecap="round" />
                        
                        {/* Secondary Air Injection Ports */}
                        <circle cx="150" cy="335" r="3" fill="#38bdf8" />
                        <circle cx="290" cy="335" r="3" fill="#38bdf8" />
                        <text x="175" y="340" fill="#fca5a5" fontSize="11" fontWeight="bold">ТОПКА (950°C)</text>
                      </g>

                      {/* --- 8. ASH PAN & PRIMARY AIR (Зольник и Поддувало) --- */}
                      <g
                        className="cursor-pointer"
                        onClick={() => {
                          playWoodTap(soundEnabled);
                          setSelectedPart('firebox');
                        }}
                      >
                        <rect x="140" y="450" width="160" height="45" rx="5" fill="#292524" stroke="#57534e" strokeWidth="1.5" />
                        {/* Grate & Air Slots */}
                        <line x1="160" y1="468" x2="195" y2="468" stroke="#a8a29e" strokeWidth="2.5" />
                        <line x1="205" y1="468" x2="240" y2="468" stroke="#a8a29e" strokeWidth="2.5" />
                        <line x1="250" y1="468" x2="285" y2="468" stroke="#a8a29e" strokeWidth="2.5" />
                        <text x="175" y="485" fill="#a8a29e" fontSize="10">Поддувало / Приток O₂</text>
                      </g>

                      {/* --- INTERACTIVE PINS (Pulsing Targets) --- */}
                      {/* Chimney Pin */}
                      <g
                        className="cursor-pointer"
                        onClick={() => { playWoodTap(soundEnabled); setSelectedPart('chimney_economizer'); }}
                      >
                        <circle cx="220" cy="85" r="10" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" className="animate-ping opacity-60" />
                        <circle cx="220" cy="85" r="8" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
                      </g>

                      {/* Core Pin */}
                      <g
                        className="cursor-pointer"
                        onClick={() => { playWoodTap(soundEnabled); setSelectedPart('closed_chamber'); }}
                      >
                        <circle cx="220" cy="245" r="12" fill="#f59e0b" stroke="#ffffff" strokeWidth="2.5" className="animate-ping opacity-80" />
                        <circle cx="220" cy="245" r="9" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
                      </g>

                      {/* Steam Cannon Pin */}
                      <g
                        className="cursor-pointer"
                        onClick={() => { playWoodTap(soundEnabled); setSelectedPart('steam_cannon'); }}
                      >
                        <circle cx="220" cy="150" r="9" fill="#38bdf8" stroke="#ffffff" strokeWidth="2" className="animate-ping opacity-75" />
                        <circle cx="220" cy="150" r="7" fill="#38bdf8" stroke="#ffffff" strokeWidth="2" />
                      </g>

                      {/* Firebox Pin */}
                      <g
                        className="cursor-pointer"
                        onClick={() => { playWoodTap(soundEnabled); setSelectedPart('firebox'); }}
                      >
                        <circle cx="220" cy="380" r="11" fill="#ef4444" stroke="#ffffff" strokeWidth="2" className="animate-ping opacity-75" />
                        <circle cx="220" cy="380" r="8" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
                      </g>
                    </svg>
                  </div>

                  {/* Component Quick Chips */}
                  <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-stone-800 text-[11px] font-mono">
                    <button
                      onClick={() => { playWoodTap(soundEnabled); setSelectedPart('closed_chamber'); }}
                      className={`px-2 py-1.5 rounded-lg border text-left transition-all ${
                        selectedPart === 'closed_chamber'
                          ? 'border-amber-400 bg-amber-500/20 text-amber-200 font-bold'
                          : 'border-stone-800 bg-stone-950/60 text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      <span className="text-amber-400 font-bold">🔒 Ядро</span> (550°C)
                    </button>

                    <button
                      onClick={() => { playWoodTap(soundEnabled); setSelectedPart('steam_cannon'); }}
                      className={`px-2 py-1.5 rounded-lg border text-left transition-all ${
                        selectedPart === 'steam_cannon'
                          ? 'border-cyan-400 bg-cyan-500/20 text-cyan-200 font-bold'
                          : 'border-stone-800 bg-stone-950/60 text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      <span className="text-cyan-400 font-bold">🚿 Пушка</span> (пар)
                    </button>

                    <button
                      onClick={() => { playWoodTap(soundEnabled); setSelectedPart('firebox'); }}
                      className={`px-2 py-1.5 rounded-lg border text-left transition-all ${
                        selectedPart === 'firebox'
                          ? 'border-rose-400 bg-rose-500/20 text-rose-200 font-bold'
                          : 'border-stone-800 bg-stone-950/60 text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      <span className="text-rose-400 font-bold">🔥 Топка</span> (950°C)
                    </button>

                    <button
                      onClick={() => { playWoodTap(soundEnabled); setSelectedPart('sarcophagus'); }}
                      className={`px-2 py-1.5 rounded-lg border text-left transition-all ${
                        selectedPart === 'sarcophagus'
                          ? 'border-emerald-400 bg-emerald-500/20 text-emerald-200 font-bold'
                          : 'border-stone-800 bg-stone-950/60 text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      <span className="text-emerald-400 font-bold">🛡️ Саркофаг</span> (ИК)
                    </button>
                  </div>
                </div>

                {/* Selected Node Detailed Inspection */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="rounded-2xl bg-stone-900 border border-stone-800 p-5 space-y-4 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{currentPartData.icon}</span>
                        <div>
                          <h4 className="font-serif font-bold text-lg text-amber-300">
                            {currentPartData.name}
                          </h4>
                          <span className="text-xs font-mono text-rose-400 font-semibold">
                            Рабочая температура: {currentPartData.temp}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-stone-300 leading-relaxed">
                      {currentPartData.desc}
                    </p>

                    <div className="rounded-xl bg-stone-950 p-3.5 border border-stone-800 space-y-2 text-xs">
                      <div className="font-semibold text-amber-400 flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5" />
                        <span>Роль в образовании пара и микроклимата:</span>
                      </div>
                      <p className="text-stone-300 leading-relaxed">
                        {currentPartData.role}
                      </p>
                    </div>

                    <div className="rounded-xl bg-amber-950/30 p-3.5 border border-amber-600/30 space-y-1.5 text-xs">
                      <div className="font-semibold text-amber-300 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Секрет и совет мастера (Pro Tip):</span>
                      </div>
                      <p className="text-amber-100/90 leading-relaxed">
                        {currentPartData.proTip}
                      </p>
                    </div>
                  </div>

                  {/* Quick Select Buttons */}
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-mono text-stone-400 uppercase tracking-wider">
                      Все узлы банной печи:
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {stoveParts.map((part) => (
                        <button
                          key={part.id}
                          onClick={() => setSelectedPart(part.id)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-left transition-all border ${
                            selectedPart === part.id
                              ? 'bg-amber-500/20 border-amber-500 text-amber-200 font-bold'
                              : 'bg-stone-900/60 border-stone-800 text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                          }`}
                        >
                          <span>{part.icon}</span>
                          <span className="truncate">{part.name.split(' (')[0]}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: STEAM TYPES (МЕЛКОДИСПЕРСНЫЙ VS КРУПНОДИСПЕРСНЫЙ) */}
          {activeTab === 'steamTypes' && (
            <div className="space-y-6">
              <div className="rounded-2xl bg-amber-950/20 border border-amber-500/20 p-4 text-xs sm:text-sm text-stone-300 leading-relaxed">
                <span className="font-bold text-amber-400">«С легким паром!»</span> — это не просто тост, а физическое состояние воды в воздухе.
                Пар бывает принципиально разным по размеру водяных капель, температуре и влиянию на легкие.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Light Microdispersed Steam */}
                <div className="rounded-2xl bg-stone-900 border-2 border-emerald-500/50 p-5 space-y-4 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 px-3 py-1 bg-emerald-500 text-stone-950 text-[10px] font-bold uppercase tracking-wider rounded-bl-xl">
                    Золотой эталон русской бани
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-xl">
                      ✨
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-lg text-emerald-300">
                        Мелкодисперсный («Легкий») пар
                      </h3>
                      <div className="text-xs font-mono text-emerald-400">Размер частиц: менее 0.5 — 1 микрона</div>
                    </div>
                  </div>

                  <div className="space-y-3 text-xs text-stone-300 leading-relaxed">
                    <div className="p-3 rounded-xl bg-stone-950/70 border border-stone-800">
                      <span className="font-semibold text-stone-200">Где рождается: </span>
                      В закрытой каменке при температуре камня <strong className="text-emerald-400">450°C — 650°C</strong>.
                      Вода взрывается в лабиринте раскаленного чугуна и жадеита, дробясь до молекулярного тумана и перегреваясь выше 130°C.
                    </div>

                    <div className="p-3 rounded-xl bg-stone-950/70 border border-stone-800">
                      <span className="font-semibold text-stone-200">Внешний вид: </span>
                      Практически <strong className="text-emerald-400">невидим глазу</strong>. Воздух в парной остается прозрачным, лишь дрожит от тепловых конвекционных преломлений.
                    </div>

                    <div className="p-3 rounded-xl bg-stone-950/70 border border-stone-800">
                      <span className="font-semibold text-stone-200">Ощущения на коже и в легких: </span>
                      Дышится легко, словно в хвойном лесу. Пар не обжигает носоглотку каплями кипятка. Он мягко обволакивает, глубоко прогревая мышцы, суставы и связки.
                    </div>
                  </div>

                  <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between text-xs">
                    <span className="text-stone-400">Нагрузка на сердце:</span>
                    <span className="text-emerald-400 font-bold">Минимальная и физиологичная</span>
                  </div>
                </div>

                {/* Heavy Macrodispersed Steam */}
                <div className="rounded-2xl bg-stone-900 border-2 border-rose-500/50 p-5 space-y-4 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 px-3 py-1 bg-rose-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-bl-xl">
                    Тяжелый сырой режим
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-rose-500/20 flex items-center justify-center text-xl">
                      🌫️
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-lg text-rose-300">
                        Крупнодисперсный («Тяжелый») пар
                      </h3>
                      <div className="text-xs font-mono text-rose-400">Размер частиц: 15 — 50 микрон (микрокапли)</div>
                    </div>
                  </div>

                  <div className="space-y-3 text-xs text-stone-300 leading-relaxed">
                    <div className="p-3 rounded-xl bg-stone-950/70 border border-stone-800">
                      <span className="font-semibold text-stone-200">Где рождается: </span>
                      На открытых камнях или остывшей каменке при температуре камня <strong className="text-rose-400">ниже 220°C</strong>, либо при залповом «заливании» печи.
                    </div>

                    <div className="p-3 rounded-xl bg-stone-950/70 border border-stone-800">
                      <span className="font-semibold text-stone-200">Внешний вид: </span>
                      Густые белесые клубы <strong className="text-rose-400">видимого тумана и сырости</strong>, как из носика закипевшего чайника.
                    </div>

                    <div className="p-3 rounded-xl bg-stone-950/70 border border-stone-800">
                      <span className="font-semibold text-stone-200">Ощущения на коже и в легких: </span>
                      «Печет нос», дерет горло, перехватывает дыхание. В воздухе висит кипящая взвесь, которая мгновенно оседает на коже липкой горячей пленкой.
                    </div>
                  </div>

                  <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between text-xs">
                    <span className="text-stone-400">Нагрузка на сердце:</span>
                    <span className="text-rose-400 font-bold">Высокая (риск тахикардии и удушья)</span>
                  </div>
                </div>

              </div>

              {/* Comparative Matrix */}
              <div className="rounded-2xl bg-stone-900 border border-stone-800 p-5 space-y-4">
                <h4 className="font-serif font-bold text-base text-amber-200 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-400" />
                  <span>Сравнительная таблица дисперсности пара</span>
                </h4>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-stone-800 text-stone-400 font-mono">
                        <th className="py-2 px-3">Параметр</th>
                        <th className="py-2 px-3 text-emerald-400">Мелкодисперсный (Легкий)</th>
                        <th className="py-2 px-3 text-rose-400">Крупнодисперсный (Сырой)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-800 text-stone-300">
                      <tr>
                        <td className="py-2.5 px-3 font-medium text-stone-200">Температура камней</td>
                        <td className="py-2.5 px-3 text-emerald-300">450°C — 650°C (в ядре)</td>
                        <td className="py-2.5 px-3 text-rose-300">180°C — 240°C (на открытых)</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-medium text-stone-200">Температура пара на выходе</td>
                        <td className="py-2.5 px-3 text-emerald-300">Перегретый пар (120°C — 160°C)</td>
                        <td className="py-2.5 px-3 text-rose-300">Насыщенный пар (~100°C с конденсатом)</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-medium text-stone-200">Видимость</td>
                        <td className="py-2.5 px-3 text-emerald-300">Прозрачный, воздух чист</td>
                        <td className="py-2.5 px-3 text-rose-300">Белый клубящийся туман</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-medium text-stone-200">Физика теплопередачи</td>
                        <td className="py-2.5 px-3 text-emerald-300">Плавная конденсация в порах кожи</td>
                        <td className="py-2.5 px-3 text-rose-300">Мгновенный ожог микрокаплями кипятка</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-medium text-stone-200">Идеальное назначение</td>
                        <td className="py-2.5 px-3 text-emerald-300">Классическое парение вениками, долгий прогрев</td>
                        <td className="py-2.5 px-3 text-rose-300">Хаммам, мыльные процедуры, резкий контраст</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: STEAM MIXING & CEREMONIES */}
          {activeTab === 'ceremonies' && (
            <div className="space-y-6">
              <div className="rounded-2xl bg-amber-950/20 border border-amber-500/20 p-4 text-xs sm:text-sm text-stone-300 leading-relaxed">
                Пармастер — как шеф-повар: подать воду на камни — это лишь взять соль и перец.
                Главное искусство заключается в том, <strong className="text-amber-400">как замешать пар</strong>, создать устойчивый «пирог» под потолком и бережно опускать его вениками на гостя.
              </div>

              {/* The Steam Pie Concept */}
              <div className="rounded-2xl bg-stone-900 border border-stone-800 p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-xl">
                    🥧
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-lg text-amber-200">
                      Концепция «Парового пирога» (Шапка жара)
                    </h3>
                    <div className="text-xs text-stone-400">Физика конвекционного купола под потолком парной</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800 space-y-1.5">
                    <span className="font-bold text-amber-400">1. Зарождение под потолком</span>
                    <p className="text-stone-300 leading-relaxed">
                      Горячий перегретый пар легче воздуха. При подаче в пушку он мгновенно взмывает вверх и образует устойчивый слой жара толщиной 30–50 см под потолком.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800 space-y-1.5">
                    <span className="font-bold text-amber-400">2. Запрет на «мельницу»</span>
                    <p className="text-stone-300 leading-relaxed">
                      Грубая ошибка новичка — махать вениками как лопастями вертолета. Это разрушает пирог, перемешивает пар и делает воздух тяжелым. Пирог берегут!
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800 space-y-1.5">
                    <span className="font-bold text-amber-400">3. Черпание веником</span>
                    <p className="text-stone-300 leading-relaxed">
                      Мастер поднимает кончики веников в пирог, захватывает порцию горячего пара и легким волнообразным движением опускает её прямо на тело гостя.
                    </p>
                  </div>
                </div>
              </div>

              {/* Ceremonies and Protocols */}
              <div className="space-y-4">
                <h4 className="font-serif font-bold text-base text-stone-100">
                  Режимы смешивания пара под банные ритуалы:
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* First Steam Intro */}
                  <div className="rounded-xl bg-stone-900 border border-stone-800 p-4 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-serif font-bold text-sm text-cyan-300 flex items-center gap-1.5">
                        <span>🍃</span> Первый пар («Знакомство с баней»)
                      </span>
                      <span className="text-[11px] font-mono text-cyan-400 font-bold">50-55°C | 50%</span>
                    </div>
                    <p className="text-xs text-stone-300 leading-relaxed">
                      Задача: адаптировать сосуды без стресса. Подается 1 ковшик в пушку + запарка из мяты и донника на верхние камни. Работа только опахалом или веером, бесконтактный обдув.
                    </p>
                  </div>

                  {/* Classic Dual Broom */}
                  <div className="rounded-xl bg-stone-900 border border-stone-800 p-4 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-serif font-bold text-sm text-emerald-300 flex items-center gap-1.5">
                        <span>🌿</span> Классическое парение (Два дубовых веника)
                      </span>
                      <span className="text-[11px] font-mono text-emerald-400 font-bold">60-65°C | 60%</span>
                    </div>
                    <p className="text-xs text-stone-300 leading-relaxed">
                      Формируется плотный пирог в 2–3 подачи в глубину закрытой каменки. Поочередно прогреваются стопы, подколенные зоны, поясница, лопатки с фиксацией горячих компрессов.
                    </p>
                  </div>

                  {/* Contrast & Hard Hitting */}
                  <div className="rounded-xl bg-stone-900 border border-stone-800 p-4 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-serif font-bold text-sm text-rose-300 flex items-center gap-1.5">
                        <span>⚡</span> Контрастное ударное парение (перед купелью)
                      </span>
                      <span className="text-[11px] font-mono text-rose-400 font-bold">70-75°C | 65%</span>
                    </div>
                    <p className="text-xs text-stone-300 leading-relaxed">
                      Мощная поддача: ковш в ядро + полковша на открытую каменку для создания плотной термоподушки. Быстрый глубокий прогрев для выброса адреналина перед ледяной водой.
                    </p>
                  </div>

                  {/* Ladnoe / Gentle */}
                  <div className="rounded-xl bg-stone-900 border border-stone-800 p-4 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-serif font-bold text-sm text-amber-300 flex items-center gap-1.5">
                        <span>🌸</span> Ладное / Женское / Детское парение
                      </span>
                      <span className="text-[11px] font-mono text-amber-400 font-bold">50-55°C | 55%</span>
                    </div>
                    <p className="text-xs text-stone-300 leading-relaxed">
                      Минимум пара, акцент на длинноволновое ИК-тепло от каменного саркофага печи. Липовые и березовые веники, растирания медом и солью, мягкая фитотерапия.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: INFRARED RADIATION (КОРОТКИЕ И ДЛИННЫЕ ВОЛНЫ) */}
          {activeTab === 'infrared' && (
            <div className="space-y-6">
              <div className="rounded-2xl bg-amber-950/20 border border-amber-500/20 p-4 text-xs sm:text-sm text-stone-300 leading-relaxed">
                Почему в одной бане голова звенит и тяжело дышать, а в другой ты словно перерождаешься? 
                Ответ в <strong className="text-amber-400">спектре инфракрасного излучения</strong> от печи!
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Short-wave IR Danger */}
                <div className="rounded-2xl bg-stone-900 border border-rose-600/40 p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-rose-500/20 flex items-center justify-center text-xl">
                      🔴
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-base text-rose-300">
                        Коротковолновое жесткое ИК (λ &lt; 2.5 мкм)
                      </h4>
                      <div className="text-xs text-rose-400 font-mono">Источник: раскаленный металл (&gt; 250°C)</div>
                    </div>
                  </div>

                  <div className="space-y-2.5 text-xs text-stone-300 leading-relaxed">
                    <p>
                      <strong>Физика:</strong> Голая металлическая печь или неизолированная труба дымохода испускают короткие высокоэнергетические волны.
                    </p>
                    <p>
                      <strong>Влияние на человека:</strong>
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-stone-300">
                      <li>Жжет верхний слой эпидермиса (эффект раскаленной сковороды).</li>
                      <li>Спазмирует капилляры вместо их плавного расширения.</li>
                      <li>Вызывает перегрев костей черепа, тяжесть в затылке и головную боль.</li>
                      <li>Выжигает кислород и подгорает пыль в воздухе.</li>
                    </ul>
                  </div>

                  <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-200">
                    ⚠️ Признак плохой печи: к ней невозможно подойти ближе метра — «жарит нестерпимо», а у полка при этом холодно.
                  </div>
                </div>

                {/* Long-wave Bio-resonant IR */}
                <div className="rounded-2xl bg-stone-900 border border-amber-500/50 p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-xl">
                      🟡
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-base text-amber-300">
                        Длинноволновое мягкое ИК (λ = 8 — 14 мкм)
                      </h4>
                      <div className="text-xs text-amber-400 font-mono">Источник: камень и кирпич (55°C — 85°C)</div>
                    </div>
                  </div>

                  <div className="space-y-2.5 text-xs text-stone-300 leading-relaxed">
                    <p>
                      <strong>Физика:</strong> Тепло от массивного каменного саркофага (талькохлорит, жадеит, змеевик) или кирпичной кладки.
                    </p>
                    <p>
                      <strong>Биорезонанс с телом:</strong>
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-stone-300">
                      <li>Спектр волн точно совпадает с тепловым излучением самого человека (9.4 мкм).</li>
                      <li>Проникает на глубину до 4–5 см прямо в мышечный корсет и суставы.</li>
                      <li>Снимает спазмы фасций, ускоряет лимфодренаж и расслабляет нервную систему.</li>
                      <li>Кожа не «горит», а равномерно потеет целебной росой.</li>
                    </ul>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/60 text-xs text-amber-200">
                    ✨ Золотое правило пармастера: «Металл греет камни внутри, камни делают легкий пар, а саркофаг греет парную мягким длинным ИК!»
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 5: PARMASTER QUIZ */}
          {activeTab === 'quiz' && (
            <div className="space-y-6">
              <div className="rounded-2xl bg-amber-950/20 border border-amber-500/20 p-4 text-xs sm:text-sm text-stone-300 leading-relaxed flex items-center justify-between">
                <div>
                  <h3 className="font-serif font-bold text-amber-300 text-base">
                    Экзамен на знание физики печи и пара
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Ответь на 3 вопроса, чтобы закрепить понимание устройства печи и легкого пара!
                  </p>
                </div>
                {quizSubmitted && (
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-mono text-xs font-bold">
                    Проверено!
                  </span>
                )}
              </div>

              <div className="space-y-4">
                {quizQuestions.map((item, qIdx) => {
                  const userAnswer = quizAnswers[qIdx];
                  const isCorrect = userAnswer === item.correct;

                  return (
                    <div
                      key={qIdx}
                      className="rounded-2xl bg-stone-900 border border-stone-800 p-5 space-y-3"
                    >
                      <div className="font-serif font-bold text-sm text-stone-100 flex items-start gap-2">
                        <span className="text-amber-400 font-mono">0{qIdx + 1}.</span>
                        <span>{item.q}</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {item.options.map((opt, optIdx) => {
                          const isSelected = userAnswer === optIdx;
                          let btnStyle = 'bg-stone-950 border-stone-800 text-stone-300 hover:border-stone-700';

                          if (quizSubmitted) {
                            if (optIdx === item.correct) {
                              btnStyle = 'bg-emerald-950/60 border-emerald-500 text-emerald-200 font-semibold';
                            } else if (isSelected && !isCorrect) {
                              btnStyle = 'bg-rose-950/60 border-rose-500 text-rose-200';
                            } else {
                              btnStyle = 'bg-stone-950/40 border-stone-900 text-stone-500 opacity-60';
                            }
                          } else if (isSelected) {
                            btnStyle = 'bg-amber-500/20 border-amber-500 text-amber-200 font-semibold';
                          }

                          return (
                            <button
                              key={optIdx}
                              onClick={() => handleAnswer(qIdx, optIdx)}
                              className={`p-3 rounded-xl border text-xs text-left transition-all ${btnStyle}`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>

                      {quizSubmitted && (
                        <div className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                          isCorrect ? 'bg-emerald-950/30 text-emerald-200 border border-emerald-800/40' : 'bg-rose-950/30 text-rose-200 border border-rose-800/40'
                        }`}>
                          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                          <span>{item.explain}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                {!quizSubmitted ? (
                  <button
                    onClick={handleCheckQuiz}
                    disabled={Object.keys(quizAnswers).length < quizQuestions.length}
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-stone-950 font-bold text-xs uppercase tracking-wide transition-all shadow-md cursor-pointer"
                  >
                    Проверить ответы
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setQuizSubmitted(false);
                      setQuizAnswers({});
                    }}
                    className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition-all border border-stone-700 cursor-pointer"
                  >
                    Пройти заново
                  </button>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Modal Bottom Footer / Quick Action */}
        <div className="bg-stone-900/95 border-t border-stone-800 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-stone-400">
            <span>💡 Хочешь испытать пар на практике? Нажми кнопку подачи или закрой окно.</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                handleStovePour('closed');
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
            >
              <Droplets className="w-4 h-4" />
              <span>Подать легкий пар в парную (+8%)</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium transition-all border border-stone-700 cursor-pointer"
            >
              Понятно, вернуться в парную
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
