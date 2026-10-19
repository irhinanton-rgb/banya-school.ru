import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Ruler,
  RotateCcw,
  Check,
  Ban,
  ArrowRight,
  ArrowLeft,
  Key,
  Unlock,
  Scale,
} from 'lucide-react';
import { GUEST_CASES } from '../../data/courseData';
import { GuestCase } from '../../types/banya';
import { MasterRecipeChestModal } from '../inventory/MasterRecipeChestModal';
import { playSuccessChime, playSteamSound, playWoodTap } from '../../utils/audio';
import confetti from 'canvas-confetti';

interface GuestTriageSimulatorProps {
  soundEnabled: boolean;
  onGrantXp?: (amount: number) => void;
  onSuccess?: () => void;
  onMasterSafetyCompleted?: () => void;
  onGuestSafetyCompleted?: () => void;
  onErgonomicsSafetyCompleted?: () => void;
  unlockedBadges?: string[];
  onUnlockBadge?: (badgeId: any, xp: number) => void;
}

export const GuestTriageSimulator: React.FC<GuestTriageSimulatorProps> = ({
  soundEnabled,
  onGrantXp,
  onSuccess,
  onMasterSafetyCompleted,
  onGuestSafetyCompleted,
  onErgonomicsSafetyCompleted,
  unlockedBadges = [],
  onUnlockBadge,
}) => {
  // --- Golden Key & Secret Chest State ---
  const [hasGoldenKey, setHasGoldenKey] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return (
        localStorage.getItem('banya_golden_key_awarded') === 'true' ||
        unlockedBadges.includes('golden_key')
      );
    }
    return false;
  });
  const [isSecretChestOpen, setIsSecretChestOpen] = useState<boolean>(false);

  // --- Interactive Guest Triage State ---
  const [currentGuestIdx, setCurrentGuestIdx] = useState<number>(0);
  const [selectedDecision, setSelectedDecision] = useState<string | null>(null);
  const [guestVerdicts, setGuestVerdicts] = useState<
    Record<string, { decision: string; isCorrect: boolean }>
  >({});
  const [solvedGuests, setSolvedGuests] = useState<Record<string, boolean>>(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('banya_golden_key_awarded') === 'true') {
      const allDone: Record<string, boolean> = { case_1: true, case_2: true, case_3: true };
      return allDone;
    }
    const empty: Record<string, boolean> = {};
    return empty;
  });

  // --- Bench Height Calibration ---
  const [masterHeight, setMasterHeight] = useState<number>(180);
  const [benchHeight, setBenchHeight] = useState<number>(79);
  const [ergonomicsCalibrated, setErgonomicsCalibrated] = useState<boolean>(false);

  const optimalBenchHeight = Math.round(masterHeight * 0.44);
  const benchDiff = benchHeight - optimalBenchHeight;

  const getBenchEvaluation = () => {
    if (benchDiff === 0) {
      return {
        badge: 'Идеальная эргономика (0 см)',
        color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/20',
        title: 'Эталон: костяшки сжатого кулака касаются полка',
        desc: `Высота полка (${benchHeight} см) точно подходит под рост ${masterHeight} см. Спина прямая, импульс идёт от стоп и пружинящих коленей — нагрузка на поясничные диски L4–L5 минимальна.`,
      };
    }
    if (benchDiff < -5) {
      return {
        badge: `Полок занижен на ${Math.abs(benchDiff)} см`,
        color: 'text-rose-400 border-rose-500/40 bg-rose-950/20',
        title: 'Критическая перегрузка поясницы (диски L4–L5)',
        desc: `Полок слишком низкий (${benchHeight} см). Мастер вынужден горбиться, а давление на поясницу превышает 200 кг. Решение: подставной деревянный трап под ноги.`,
      };
    }
    if (benchDiff < 0) {
      return {
        badge: `Полок чуть занижен (${benchDiff} см)`,
        color: 'text-amber-400 border-amber-500/40 bg-amber-950/20',
        title: 'Умеренный наклон вперёд',
        desc: `Полок немного ниже эталона. Старайтесь шире ставить стопы и пружинить коленями, сохраняя спину прямой.`,
      };
    }
    if (benchDiff > 5) {
      return {
        badge: `Полок завышен на +${benchDiff} см`,
        color: 'text-rose-400 border-rose-500/40 bg-rose-950/20',
        title: 'Зажим плеч и риск ожога рук в паровом пироге',
        desc: `Полок слишком высокий (${benchHeight} см). Приходится задирать локти и плечи в горячую зону (+75...+85°C), что спазмирует трапеции.`,
      };
    }
    return {
      badge: `Полок чуть завышен (+${benchDiff} см)`,
      color: 'text-amber-400 border-amber-500/40 bg-amber-950/20',
      title: 'Небольшой подъём плеч',
      desc: `Полок немного выше идеала. Следите за тем, чтобы не зажимать шею и работать расслабленной кистью.`,
    };
  };

  const benchEval = getBenchEvaluation();

  const currentGuest: GuestCase = GUEST_CASES[currentGuestIdx] || GUEST_CASES[0];
  const currentVerdict = guestVerdicts[currentGuest.id];
  const isCurrentSolved = !!solvedGuests[currentGuest.id];
  const solvedCount = Object.keys(solvedGuests).length;
  const allCasesSolved = solvedCount >= GUEST_CASES.length;

  const handleSelectDecision = (decision: string) => {
    if (currentVerdict && currentVerdict.isCorrect) return;
    setSelectedDecision(decision);
    playWoodTap(soundEnabled);
  };

  const handleSubmitDecision = () => {
    if (!selectedDecision) return;
    const isCorrect = selectedDecision === currentGuest.correctDecision;
    const updatedVerdicts = {
      ...guestVerdicts,
      [currentGuest.id]: { decision: selectedDecision, isCorrect },
    };
    setGuestVerdicts(updatedVerdicts);

    if (isCorrect) {
      playSuccessChime(soundEnabled);
      const updatedSolved = { ...solvedGuests, [currentGuest.id]: true };
      setSolvedGuests(updatedSolved);

      const count = Object.keys(updatedSolved).length;
      if (onGrantXp) onGrantXp(25);
      if (onMasterSafetyCompleted) onMasterSafetyCompleted();

      if (count >= GUEST_CASES.length) {
        setHasGoldenKey(true);
        if (typeof window !== 'undefined') {
          localStorage.setItem('banya_golden_key_awarded', 'true');
        }
        if (onUnlockBadge) {
          onUnlockBadge('golden_key', 50);
        }
        if (onGuestSafetyCompleted) {
          onGuestSafetyCompleted();
        }
        if (onSuccess) {
          onSuccess();
        }
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
    } else {
      playWoodTap(soundEnabled);
    }
  };

  const handleRetryGuest = () => {
    setSelectedDecision(null);
    setGuestVerdicts((prev) => {
      const copy = { ...prev };
      delete copy[currentGuest.id];
      return copy;
    });
    playWoodTap(soundEnabled);
  };

  const handleSwitchGuest = (idx: number) => {
    setCurrentGuestIdx(idx);
    const guest = GUEST_CASES[idx];
    const existing = guestVerdicts[guest.id];
    setSelectedDecision(existing ? existing.decision : null);
    playWoodTap(soundEnabled);
  };

  const handlePrevGuest = () => {
    const prevIdx = (currentGuestIdx - 1 + GUEST_CASES.length) % GUEST_CASES.length;
    handleSwitchGuest(prevIdx);
  };

  const handleNextGuest = () => {
    const nextIdx = (currentGuestIdx + 1) % GUEST_CASES.length;
    handleSwitchGuest(nextIdx);
  };

  const handleCalibrateStandard = () => {
    setBenchHeight(optimalBenchHeight);
    playSteamSound(soundEnabled);
    if (!ergonomicsCalibrated) {
      setErgonomicsCalibrated(true);
      if (onGrantXp) onGrantXp(20);
      if (onErgonomicsSafetyCompleted) onErgonomicsSafetyCompleted();
    }
  };

  return (
    <div className="space-y-6">
      {/* ===================================================================== */}
      {/* ШАГ 1: ЛИЧНАЯ БЕЗОПАСНОСТЬ И РЕСУРС МАСТЕРА (3 ПРАВИЛА)               */}
      {/* ===================================================================== */}
      <div className="rounded-2xl border border-stone-800 bg-stone-900/95 p-5 sm:p-6 space-y-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-800 pb-4">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-bold">
              Шаг 1 из 3 · Забота о себе на смене
            </span>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-100 mt-0.5">
              1. Личная безопасность пармастера: экипировка, питание и аптечка
            </h3>
          </div>
          <span className="text-xs font-mono text-stone-400 bg-stone-950 px-3 py-1.5 rounded-xl border border-stone-800 self-start sm:self-auto">
            «Голова в прохладе — ноги в тепле»
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Gear */}
          <div className="rounded-xl bg-stone-950/90 border border-stone-800 p-4 flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-md bg-sky-500/15 border border-sky-500/30 text-sky-300 text-xs font-mono font-bold">
                  01 · ЭКИПИРОВКА
                </span>
                <span className="text-lg">👕</span>
              </div>
              <h4 className="font-serif font-bold text-sm sm:text-base text-stone-100">
                Термобарьер и защита стоп
              </h4>
              <p className="text-xs text-stone-300 leading-relaxed">
                <strong>Войлочная шапка (5–8 мм)</strong> бережёт голову от +85°C под потолком. <strong>Рашгард</strong> создаёт воздушный термомост от ошпаривания паром. <strong>Закрытые кроксы и шерстяные/неопреновые носки</strong> защищают ноги от холодного сквозняка по полу и скользких листьев.
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-sky-950/30 border border-sky-500/30 text-[11px] text-sky-200 leading-snug">
              💡 <strong>Табу:</strong> не прыгайте в ледяную купель во время смены («эффект термоса» запирает жар внутри!). Замёрзли стопы — сразу согрейте их в воде +40...+42°C.
            </div>
          </div>

          {/* Card 2: Nutrition & Electrolytes */}
          <div className="rounded-xl bg-stone-950/90 border border-stone-800 p-4 flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold">
                  02 · ЭЛЕКТРОЛИТЫ И ЕДА
                </span>
                <span className="text-lg">🥗</span>
              </div>
              <h4 className="font-serif font-bold text-sm sm:text-base text-stone-100">
                Защита от судорог и истощения
              </h4>
              <p className="text-xs text-stone-300 leading-relaxed">
                С потом уходит до 2 л жидкости и солей (калий, магний, натрий). Обычная пресная вода лишь разжижает кровь и вызывает судороги икр. <strong>Изотоники — только дополнение</strong>, а 90% минералов мастер добирает из тарелки: печёный картофель, бананы, квашеная капуста и гречка.
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-[11px] text-emerald-200 leading-snug">
              💡 <strong>Совместимость:</strong> разделяйте молочный кальций (творог/сыр) и продукты с железом/магнием (мясо, гречка) на 2–3 часа, чтобы они не мешали усвоению друг друга.
            </div>
          </div>

          {/* Card 3: First Aid & Foot Hygiene */}
          <div className="rounded-xl bg-stone-950/90 border border-stone-800 p-4 flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-md bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-mono font-bold">
                  03 · АПТЕЧКА И СТОПЫ
                </span>
                <span className="text-lg">🩹</span>
              </div>
              <h4 className="font-serif font-bold text-sm sm:text-base text-stone-100">
                Гидрогели и паста Теймурова
              </h4>
              <p className="text-xs text-stone-300 leading-relaxed">
                От ожогов в аптечке держите стерильные <strong>гидрогелевые повязки («ОжоговНет») и Пантенол-спрей</strong>. А для защиты стоп во влажной среде бани от грибка используйте <strong>пасту Теймурова</strong> до смены, дегтярное мыло после и дезинфекцию обуви.
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-500/30 text-[11px] text-rose-200 leading-snug">
              🛑 <strong>Строжайшее табу:</strong> никогда не мажьте свежий ожог маслом или жиром — масляная плёнка запирает жар внутри кожи и углубляет ожог!
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* ШАГ 2: БЕЗОПАСНОСТЬ ГОСТЯ, ТРИАЖ 3 КЕЙСОВ И СУНДУК РЕЦЕПТА МАСТЕРА    */}
      {/* ===================================================================== */}
      <div className="rounded-2xl border border-stone-800 bg-stone-900/95 p-5 sm:p-6 space-y-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-800 pb-4">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-bold">
              Шаг 2 из 3 · Границы ответственности и практика приёмки
            </span>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-100 mt-0.5">
              2. Безопасность гостя и входной триаж (3 реальных кейса)
            </h3>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-950 border border-stone-800 text-xs font-mono self-start sm:self-auto">
            <span className="text-stone-400">Принято гостей:</span>
            <span className="font-bold text-emerald-400">{solvedCount} из {GUEST_CASES.length}</span>
          </div>
        </div>

        {/* Concise 2-card legal & medical boundary reminder */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-1.5">
            <strong className="text-rose-300 font-bold text-sm flex items-center gap-1.5">
              <Ban className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Закон: Табу на таблетки и диагнозы</span>
            </strong>
            <p className="text-stone-300 leading-relaxed">
              Пармастер — не врач. <strong>Категорически запрещено давать гостям любые лекарства</strong> (даже «таблетку от давления или сердца»). Разрешена только доврачебная помощь: вывести в прохладу, уложить горизонтально, <strong>приподнять ноги выше головы</strong>, дать свежий воздух и вызвать <strong>112</strong>.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-1.5">
            <strong className="text-amber-300 font-bold text-sm flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Красные флаги при входном опросе</span>
            </strong>
            <p className="text-stone-300 leading-relaxed">
              <strong>Вход строго запрещён (🔴):</strong> температура тела выше 37°C (простуда/лихорадка), алкоголь, гипертонический криз, недавний инфаркт/инсульт. <strong>Щадящий режим (🟡):</strong> варикоз (не парить ноги вениками!), беременность, возраст 60+ или стентирование в ремиссии — только мягкий прогрев 50–55°C без ледяной купели.
            </p>
          </div>
        </div>

        {/* Interactive Guest Triage Deck */}
        <div className="rounded-2xl border border-amber-500/40 bg-stone-950 p-4 sm:p-5 space-y-4">
          {/* Guest Selector Tabs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {GUEST_CASES.map((g, idx) => {
              const isSolved = !!solvedGuests[g.id];
              const isCurrent = currentGuestIdx === idx;
              const attempt = guestVerdicts[g.id];
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => handleSwitchGuest(idx)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
                    isCurrent
                      ? 'bg-amber-500/15 border-amber-400 text-amber-200 ring-1 ring-amber-400/40'
                      : isSolved
                      ? 'bg-emerald-950/30 border-emerald-500/40 text-stone-300'
                      : attempt && !attempt.isCorrect
                      ? 'bg-rose-950/30 border-rose-500/40 text-stone-300'
                      : 'bg-stone-900/70 border-stone-800 text-stone-400 hover:border-stone-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                        isCurrent
                          ? 'bg-amber-500 text-stone-950'
                          : isSolved
                          ? 'bg-emerald-500 text-stone-950'
                          : 'bg-stone-800 text-stone-400'
                      }`}
                    >
                      {isSolved ? '✓' : idx + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="font-serif font-bold text-xs text-stone-100 truncate">
                        Гость {idx + 1}: {g.guestName.split(',')[0]}
                      </div>
                      <div className="text-[10px] text-stone-400 font-mono">
                        {g.age} лет · АД {g.bloodPressure.split(' ')[0]}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Guest Card */}
          <div className="rounded-xl border border-stone-800 bg-stone-900/75 p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-800 pb-3">
              <div>
                <h4 className="font-serif text-base font-bold text-stone-100">
                  {currentGuest.guestName} ({currentGuest.age} лет)
                </h4>
                <p className="text-xs text-stone-400 font-mono">
                  Давление: <strong className="text-stone-200">{currentGuest.bloodPressure}</strong>
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {currentGuest.symptoms.map((sym, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg bg-stone-950 border border-stone-700 text-amber-200 text-xs"
                  >
                    {sym}
                  </span>
                ))}
                {currentGuest.medicalConditions.map((med, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg bg-stone-950 border border-stone-800 text-stone-400 text-xs"
                  >
                    {med}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-xl bg-stone-950/90 border-l-4 border-amber-500 p-3 text-xs sm:text-sm text-stone-200 italic leading-relaxed">
              {currentGuest.request}
            </div>

            {/* 3 Decision Choices */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => handleSelectDecision('allow_standard')}
                disabled={isCurrentSolved}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedDecision === 'allow_standard'
                    ? 'border-emerald-400 bg-emerald-950/40 text-emerald-200 ring-1 ring-emerald-400'
                    : 'border-stone-800 bg-stone-950/80 text-stone-300 hover:border-stone-700'
                }`}
              >
                <div className="font-bold text-xs sm:text-sm text-stone-100 mb-1">
                  🟢 Стандартная программа
                </div>
                <p className="text-[11px] text-stone-400 leading-snug">
                  Классическое парение 60–65°C, работа вениками и умеренный контраст.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleSelectDecision('allow_gentle_adapted')}
                disabled={isCurrentSolved}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedDecision === 'allow_gentle_adapted'
                    ? 'border-amber-400 bg-amber-950/40 text-amber-200 ring-1 ring-amber-400'
                    : 'border-stone-800 bg-stone-950/80 text-stone-300 hover:border-stone-700'
                }`}
              >
                <div className="font-bold text-xs sm:text-sm text-stone-100 mb-1">
                  🟡 Щадящий спецрежим
                </div>
                <p className="text-[11px] text-stone-400 leading-snug">
                  Мягкий прогрев до 50–55°C на нижнем полке, СТРОГО БЕЗ ледяной купели.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleSelectDecision('strictly_prohibited')}
                disabled={isCurrentSolved}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedDecision === 'strictly_prohibited'
                    ? 'border-rose-400 bg-rose-950/40 text-rose-200 ring-1 ring-rose-400'
                    : 'border-stone-800 bg-stone-950/80 text-stone-300 hover:border-stone-700'
                }`}
              >
                <div className="font-bold text-xs sm:text-sm text-stone-100 mb-1">
                  🔴 Парение ЗАПРЕЩЕНО
                </div>
                <p className="text-[11px] text-stone-400 leading-snug">
                  Категорический отказ по медпоказаниям (температура &gt; 37°C / криз).
                </p>
              </button>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
              {!currentVerdict?.isCorrect ? (
                <button
                  type="button"
                  onClick={handleSubmitDecision}
                  disabled={!selectedDecision}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md"
                >
                  Утвердить решение
                </button>
              ) : (
                <span className="text-xs font-mono text-emerald-400 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Вердикт принят верно!</span>
                </span>
              )}

              <div className="flex items-center gap-2">
                {currentVerdict && !currentVerdict.isCorrect && (
                  <button
                    type="button"
                    onClick={handleRetryGuest}
                    className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Изменить ответ</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={handlePrevGuest}
                  className="px-3 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 text-xs border border-stone-800 cursor-pointer flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Пред.</span>
                </button>
                <button
                  type="button"
                  onClick={handleNextGuest}
                  className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 text-xs font-semibold border border-stone-700 cursor-pointer flex items-center gap-1.5"
                >
                  <span>Следующий гость ({((currentGuestIdx + 1) % GUEST_CASES.length) + 1}/{GUEST_CASES.length})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Feedback */}
            {currentVerdict && (
              <div
                className={`rounded-xl p-3.5 text-xs leading-relaxed border ${
                  currentVerdict.isCorrect
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                    : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                }`}
              >
                <strong className="block mb-1">
                  {currentVerdict.isCorrect
                    ? '✓ Безупречное решение пармастера (+25 XP):'
                    : '✗ Опасная ошибка! Нажмите «Изменить ответ»:'}
                </strong>
                {currentGuest.reasoning}
              </div>
            )}
          </div>

          {/* Secret Recipe Chest directly under Triage (no tab jumping needed!) */}
          <div
            className={`p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-4 transition-all ${
              hasGoldenKey
                ? 'bg-gradient-to-r from-amber-950/60 via-stone-900 to-emerald-950/40 border-amber-400/60'
                : 'bg-stone-900/90 border-stone-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-2xl shrink-0">
                {hasGoldenKey ? '🗝️' : '🔒'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase font-bold text-amber-400">
                    Бонус за приёмку 3 гостей
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-950 border border-stone-700 text-stone-300">
                    {hasGoldenKey ? 'Открыт ✓' : `Решено ${solvedCount}/3`}
                  </span>
                </div>
                <h5 className="font-serif font-bold text-sm text-stone-100">
                  Сундук с рецептом быстрого восстановления сил мастера (Лимон + Соль + Мёд + Вода)
                </h5>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsSecretChestOpen(true);
                playWoodTap(soundEnabled);
              }}
              className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shrink-0 flex items-center justify-center gap-2 ${
                hasGoldenKey
                  ? 'bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-stone-950 shadow-md'
                  : 'bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700'
              }`}
            >
              {hasGoldenKey ? <Unlock className="w-4 h-4" /> : <Key className="w-4 h-4 text-amber-400" />}
              <span>{hasGoldenKey ? 'Открыть рецепт мастера' : 'Посмотреть сундук'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* ШАГ 3: ЭРГОНОМИКА ПАРНОЙ И КАЛИБРОВКА ВЫСОТЫ ПОЛКА                    */}
      {/* ===================================================================== */}
      <div className="rounded-2xl border border-stone-800 bg-stone-900/95 p-5 sm:p-6 space-y-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-800 pb-4">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
              Шаг 3 из 3 · Организация рабочего места
            </span>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-100 mt-0.5">
              3. Эргономика парной: «0 лишних шагов» и калибровка высоты полка
            </h3>
          </div>
          <button
            type="button"
            onClick={handleCalibrateStandard}
            className="px-3.5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer self-start sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Выставить эталон ({optimalBenchHeight} см)</span>
          </button>
        </div>

        {/* Short rule on space prep */}
        <div className="p-3.5 rounded-xl bg-stone-950/90 border border-stone-800 text-xs text-stone-300 leading-relaxed">
          <strong className="text-amber-300">Закон сохранения сил:</strong> в горячем пару энергия сгорает в 3–4 раза быстрее. До захода гостя выставьте черпак (ручка 50–70 см), запарники, веники и холодную пихту на расстоянии вытянутой руки по сценарию программы, а опавшие листья сразу смывайте в трап, чтобы не поскользнуться.
        </div>

        {/* Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 p-4 rounded-xl bg-stone-950 border border-stone-800">
            <div className="flex justify-between items-center text-xs">
              <span className="text-stone-300 font-medium">Ваш рост:</span>
              <span className="font-mono font-bold text-amber-400 text-sm">{masterHeight} см</span>
            </div>
            <input
              type="range"
              min="155"
              max="205"
              step="1"
              value={masterHeight}
              onChange={(e) => {
                setMasterHeight(Number(e.target.value));
                if (!ergonomicsCalibrated) {
                  setErgonomicsCalibrated(true);
                  if (onErgonomicsSafetyCompleted) onErgonomicsSafetyCompleted();
                }
              }}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="text-[11px] text-stone-400">
              Эталон по костяшкам опущенного кулака: <strong className="text-emerald-300">{optimalBenchHeight} см</strong>
            </div>
          </div>

          <div className="space-y-2 p-4 rounded-xl bg-stone-950 border border-stone-800">
            <div className="flex justify-between items-center text-xs">
              <span className="text-stone-300 font-medium">Высота полка в парной:</span>
              <span className="font-mono font-bold text-emerald-400 text-sm">{benchHeight} см</span>
            </div>
            <input
              type="range"
              min="60"
              max="105"
              step="1"
              value={benchHeight}
              onChange={(e) => {
                setBenchHeight(Number(e.target.value));
                playWoodTap(soundEnabled);
                if (!ergonomicsCalibrated) {
                  setErgonomicsCalibrated(true);
                  if (onErgonomicsSafetyCompleted) onErgonomicsSafetyCompleted();
                }
              }}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="text-[11px] text-stone-400 flex items-center justify-between">
              <span>Отклонение от эталона:</span>
              <span
                className={`font-mono font-bold ${
                  benchDiff === 0
                    ? 'text-emerald-400'
                    : Math.abs(benchDiff) <= 5
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                {benchDiff > 0 ? `+${benchDiff} см` : `${benchDiff} см`}
              </span>
            </div>
          </div>
        </div>

        {/* Evaluation */}
        <div className={`p-4 rounded-xl border text-xs leading-relaxed space-y-1 ${benchEval.color}`}>
          <div className="font-mono font-bold uppercase text-[11px]">{benchEval.badge}</div>
          <strong className="block text-sm">{benchEval.title}</strong>
          <p className="opacity-90">{benchEval.desc}</p>
        </div>
      </div>

      {/* Master Recipe Chest Modal */}
      <MasterRecipeChestModal
        isOpen={isSecretChestOpen}
        onClose={() => setIsSecretChestOpen(false)}
        hasKey={hasGoldenKey}
        soundEnabled={soundEnabled}
        onGoToTriage={() => {
          setIsSecretChestOpen(false);
        }}
      />
    </div>
  );
};
