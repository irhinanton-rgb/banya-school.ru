import React, { useState, useEffect } from 'react';
import { BROOM_TECHNIQUES } from '../../data/courseData';
import { BroomTechnique } from '../../types/banya';
import { playWoodTap, playSuccessChime } from '../../utils/audio';
import {
  Play,
  CheckCircle2,
  Video,
  Key,
  PlusCircle,
  Layers,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';

interface BroomTechniquesSimulatorProps {
  soundEnabled: boolean;
  onGrantXp?: (amount: number) => void;
  unlockedBadges?: string[];
  onUnlockBadge?: (badgeId: any, xp: number) => void;
  onNavigateToLevel?: (levelId: any) => void;
}

export interface VideoSource {
  type: 'html5' | 'vk' | 'rutube' | 'kinescope' | 'youtube';
  embedUrl: string;
  directUrl?: string;
  serviceLabel: string;
}

function parseVideoSource(urlOrId?: string): VideoSource | null {
  if (!urlOrId || !urlOrId.trim()) return null;
  const raw = urlOrId.trim();

  if (
    raw.match(/\.(mp4|webm|ogg|m4v)(\?.*)?$/i) ||
    raw.startsWith('/videos/') ||
    raw.startsWith('./videos/')
  ) {
    return {
      type: 'html5',
      embedUrl: raw,
      directUrl: raw,
      serviceLabel: 'Видеофайл (MP4/WebM)',
    };
  }

  if (raw.includes('vk.com/video_ext.php') || raw.includes('vkvideo.ru/video_ext.php')) {
    return {
      type: 'vk',
      embedUrl: raw,
      serviceLabel: 'VK Видео',
    };
  }
  const vkMatch = raw.match(/(?:vk\.com|vkvideo\.ru)\/video(-?\d+)_(\d+)/i);
  if (vkMatch) {
    return {
      type: 'vk',
      embedUrl: `https://vk.com/video_ext.php?oid=${vkMatch[1]}&id=${vkMatch[2]}`,
      serviceLabel: 'VK Видео',
    };
  }

  const rutubeEmbedMatch = raw.match(/rutube\.ru\/play\/embed\/([a-zA-Z0-9]+)/i);
  if (rutubeEmbedMatch) {
    return {
      type: 'rutube',
      embedUrl: `https://rutube.ru/play/embed/${rutubeEmbedMatch[1]}/`,
      serviceLabel: 'Rutube',
    };
  }
  const rutubeWatchMatch = raw.match(/rutube\.ru\/video\/([a-zA-Z0-9]+)/i);
  if (rutubeWatchMatch) {
    return {
      type: 'rutube',
      embedUrl: `https://rutube.ru/play/embed/${rutubeWatchMatch[1]}/`,
      serviceLabel: 'Rutube',
    };
  }

  const kinescopeMatch = raw.match(/kinescope\.io\/(?:embed\/)?([a-zA-Z0-9_-]+)/i);
  if (kinescopeMatch) {
    return {
      type: 'kinescope',
      embedUrl: `https://kinescope.io/embed/${kinescopeMatch[1]}`,
      serviceLabel: 'Kinescope',
    };
  }

  const ytEmbed = raw.match(/^https:\/\/(www\.)?(youtube\.com|youtube-nocookie\.com)\/embed\/([a-zA-Z0-9_-]{11})/);
  if (ytEmbed) {
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytEmbed[3]}`,
      serviceLabel: 'YouTube',
    };
  }
  const ytWatch = raw.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (ytWatch) {
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytWatch[1]}`,
      serviceLabel: 'YouTube',
    };
  }
  const ytShort = raw.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (ytShort) {
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytShort[1]}`,
      serviceLabel: 'YouTube',
    };
  }
  const ytShorts = raw.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/);
  if (ytShorts) {
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytShorts[1]}`,
      serviceLabel: 'YouTube',
    };
  }
  if (/^[a-zA-Z0-9_-]{11}$/.test(raw)) {
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube-nocookie.com/embed/${raw}`,
      serviceLabel: 'YouTube',
    };
  }

  return null;
}

const LEVEL2_GLOSSARY: Record<string, { title: string; text: string }> = {
  periphery: {
    title: 'Периферические сосуды',
    text: 'Разветвлённая сеть мелких сосудов и капилляров в стопах, голенях и кистях рук. Когда мы согреваем стопы первыми, эти сосуды мягко расширяются и забирают на себя часть объёма крови, разгружая сердце и сосуды головы.',
  },
  lymph: {
    title: 'Лимфоток (Дренаж)',
    text: 'Движение лимфы по сосудам снизу вверх — от стоп и икр к крупным лимфоузлам. Мягкий прогрев вениками от пяток к коленям и бёдрам работает как естественный насос, убирающий отёки и тяжесть в ногах.',
  },
  taichi: {
    title: 'Принцип «Банного тай-чи»',
    text: 'Биомеханика пармастера: спина остаётся прямой, колени мягко пружинят, а импульс для взмаха вениками рождается от переката веса тела с ноги на ногу. Это снимает ударную нагрузку с поясницы и плеч.',
  },
  tannins: {
    title: 'Дубильные вещества и эфиры листа',
    text: 'Природные соединения в листе дуба и берёзы, которые делают лист плотным, упругим и ароматным. В крутом кипятке (100 °C) они мгновенно разрушаются («варятся»), и веник превращается в тяжёлую скользкую тряпку.',
  },
  orthostatic: {
    title: 'Ортостатический спазм (перепад давления)',
    text: 'В парной сосуды тела максимально расширены. Если резко вскочить с полка на ноги, кровь под действием гравитации отливает от головы вниз — темнеет в глазах и кружится голова. Спокойный подъём через паузу сидя полностью исключает этот риск.',
  },
};

const TermTooltip: React.FC<{ termKey: keyof typeof LEVEL2_GLOSSARY; children: React.ReactNode }> = ({
  termKey,
  children,
}) => {
  const [open, setOpen] = useState(false);
  const info = LEVEL2_GLOSSARY[termKey];
  if (!info) return <>{children}</>;

  return (
    <span
      className="relative inline-block"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
        className="inline items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-300 font-semibold border-b-2 border-dashed border-amber-400 hover:bg-amber-500/25 transition-colors cursor-help"
      >
        {children}
      </button>
      {open && (
        <span className="fixed sm:absolute z-50 left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 bottom-6 sm:bottom-full sm:mb-2.5 w-auto sm:w-80 p-3.5 rounded-2xl bg-stone-950/98 border-2 border-amber-400/80 shadow-[0_10px_40px_rgba(0,0,0,0.85)] text-left pointer-events-auto animate-fadeIn">
          <span className="block text-xs font-mono uppercase tracking-wider text-amber-400 font-bold mb-1">
            🔬 {info.title}
          </span>
          <span className="block text-xs text-stone-200 leading-relaxed font-normal">
            {info.text}
          </span>
        </span>
      )}
    </span>
  );
};

export const BroomTechniquesSimulator: React.FC<BroomTechniquesSimulatorProps> = ({
  soundEnabled,
  onGrantXp,
  unlockedBadges = [],
  onUnlockBadge,
  onNavigateToLevel,
}) => {
  const [customVideos, setCustomVideos] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('banya_technique_videos');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [selectedTech, setSelectedTech] = useState<BroomTechnique>(() => {
    const withVideo = BROOM_TECHNIQUES.find((t) => !!t.videoUrl);
    return withVideo || BROOM_TECHNIQUES[0];
  });
  const [studiedTechs, setStudiedTechs] = useState<string[]>([]);
  const [showKeyFoundModal, setShowKeyFoundModal] = useState<boolean>(false);
  const hasGoldenKey =
    unlockedBadges.includes('golden_key') ||
    (typeof window !== 'undefined' && localStorage.getItem('banya_golden_key_awarded') === 'true');

  const [inputUrl, setInputUrl] = useState<string>('');
  const [isAddingVideo, setIsAddingVideo] = useState<boolean>(false);
  const [videoError, setVideoError] = useState<boolean>(false);

  const customVal = customVideos[selectedTech.id];
  const activeVideoUrl =
    customVal && customVal.trim() !== '' ? customVal.trim() : selectedTech.videoUrl || '';
  const parsedVideo = parseVideoSource(activeVideoUrl);

  const currentIdx = BROOM_TECHNIQUES.findIndex((t) => t.id === selectedTech.id);
  const prevTech = currentIdx > 0 ? BROOM_TECHNIQUES[currentIdx - 1] : null;
  const nextTech =
    currentIdx >= 0 && currentIdx < BROOM_TECHNIQUES.length - 1
      ? BROOM_TECHNIQUES[currentIdx + 1]
      : null;

  useEffect(() => {
    setVideoError(false);
  }, [selectedTech.id, activeVideoUrl]);

  const handleSelectTech = (tech: BroomTechnique) => {
    setSelectedTech(tech);
    playWoodTap(soundEnabled);
    setInputUrl(customVideos[tech.id] || tech.videoUrl || '');
    setIsAddingVideo(false);
    setVideoError(false);
  };

  const handleMarkAsStudied = (techId: string) => {
    if (!studiedTechs.includes(techId)) {
      setStudiedTechs((prev) => [...prev, techId]);
      playSuccessChime(soundEnabled);
      if (onGrantXp) onGrantXp(15);
    }
  };

  const handleSaveVideoUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...customVideos,
      [selectedTech.id]: inputUrl.trim(),
    };
    setCustomVideos(updated);
    try {
      localStorage.setItem('banya_technique_videos', JSON.stringify(updated));
    } catch {
      // ignore
    }
    setIsAddingVideo(false);
    playSuccessChime(soundEnabled);
  };

  const handleClearVideo = () => {
    const updated = { ...customVideos };
    delete updated[selectedTech.id];
    setCustomVideos(updated);
    setInputUrl('');
    try {
      localStorage.setItem('banya_technique_videos', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const isStudied = studiedTechs.includes(selectedTech.id);

  return (
    <div className="space-y-6">
      {/* =================================================================== */}
      {/* ШАГ 1. ПОДГОТОВКА ИНСТРУМЕНТА, ХВАТ И ТОЧКА СТАРТА (ПОСЛЕДОВАТЕЛЬНО) */}
      {/* =================================================================== */}
      <div className="rounded-3xl border border-stone-800 bg-stone-900/95 p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="border-b border-stone-800 pb-4">
          <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">
            🌿 Шаг 1 из 3 · Подготовка к работе с вениками
          </span>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-100 mt-1">
            Как правильно взять веник, запарить лист и с чего начать парение
          </h3>
          <p className="text-xs sm:text-sm text-stone-400 mt-0.5">
            Наведите курсор или нажмите на <span className="text-amber-300 font-semibold border-b border-dashed border-amber-400">выделенные термины</span>, чтобы узнать, как работает физиология парения.
          </p>
        </div>

        <div className="space-y-4 text-sm sm:text-base text-stone-200 leading-relaxed">
          <div className="rounded-2xl bg-stone-950/80 border border-stone-800/90 p-4 sm:p-5 space-y-2.5">
            <h4 className="font-serif text-base sm:text-lg font-bold text-amber-300">
              1. Точка старта — всегда со стоп (снизу вверх)
            </h4>
            <div className="space-y-2 text-stone-300">
              <p>
                Контактное парение всегда начинается <strong>со стоп гостя</strong>, а не со спины или шеи. Стопы — нижняя поворотная точка большого круга кровообращения.
              </p>
              <p>
                Прогревая стопы и икры первыми, вы мягко раскрываете{' '}
                <TermTooltip termKey="periphery">периферические сосуды</TermTooltip>, запускаете{' '}
                <TermTooltip termKey="lymph">лимфоток</TermTooltip> и защищаете голову гостя от резкого прилива крови и пульсации в висках.
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-stone-950/80 border border-stone-800/90 p-4 sm:p-5 space-y-2.5">
            <h4 className="font-serif text-base sm:text-lg font-bold text-amber-300">
              2. Хват веника: «Как живую птицу — не задушить и не выпустить»
            </h4>
            <div className="space-y-2 text-stone-300">
              <p>
                Если вцепиться в ручку веника «мёртвой хваткой», мышцы предплечий пережмут сосуды и устанут уже через 5 минут.
              </p>
              <p>
                Держите рукоять расслабленной кистью: пальцы и запястье свободно пружинят, а само движение рождается от переката стоп и мягких коленей — это и есть{' '}
                <TermTooltip termKey="taichi">принцип «Банного тай-чи»</TermTooltip>.
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-stone-950/80 border border-stone-800/90 p-4 sm:p-5 space-y-3">
            <h4 className="font-serif text-base sm:text-lg font-bold text-emerald-300">
              3. Алгоритм запарки веника (никакого крутого кипятка!)
            </h4>
            <p className="text-stone-300">
              Крутой кипяток (100 °C) разрушает{' '}
              <TermTooltip termKey="tannins">дубильные вещества</TermTooltip> и буквально «варит» лист, превращая веник в тяжёлую скользкую тряпку. Правильная подготовка состоит из 3 шагов:
            </p>
            <ul className="space-y-2 text-stone-300 pl-3 border-l-2 border-emerald-500/40">
              <li className="rounded-xl bg-stone-900/80 border border-stone-800/80 p-3">
                <strong className="text-emerald-300">Шаг А:</strong> Ополосните веник в тёплой или прохладной воде — смойте пыль и оставьте капли влаги на листве.
              </li>
              <li className="rounded-xl bg-stone-900/80 border border-stone-800/80 p-3">
                <strong className="text-emerald-300">Шаг Б:</strong> Поставьте веник <u>ручками в воду</u>, а крону укройте пакетом или влажным полотенцем — капилляры веток напитают древесину изнутри, сделав прутья гибкими.
              </li>
              <li className="rounded-xl bg-stone-900/80 border border-stone-800/80 p-3">
                <strong className="text-emerald-300">Шаг В:</strong> Молодой свежий веник дойдёт до кондиции сам в тепле парной, а сухой прошлогодний веник перед работой прогрейте 1–2 минуты в паре над каменкой (берегите руки от ожога!).
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* ШАГ 2. ВИДЕОТЕКА: 8 ПРИЁМОВ ВЕНЕЧНОГО МАССАЖА */}
      {/* =================================================================== */}
      <div className="rounded-3xl border border-stone-800 bg-stone-900/95 p-5 sm:p-7 space-y-5 shadow-xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
              <span>🎬</span>
              <span>Шаг 2 из 3 · Практикум движений</span>
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-100 mt-1">
              8 базовых приёмов, собранных в единую технику парения
            </h3>
            <p className="text-xs sm:text-sm text-stone-400 mt-0.5">
              <strong>Приём</strong> — это отдельное движение веником, а <strong>техника</strong> — их последовательная связка от 1-го до 8-го шага.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto shrink-0">
            <div className="rounded-xl bg-stone-950 border border-stone-800 px-3.5 py-2 text-xs font-mono text-stone-300">
              Изучено приёмов:{' '}
              <span className="text-amber-400 font-bold">
                {studiedTechs.length} / {BROOM_TECHNIQUES.length}
              </span>
            </div>
          </div>
        </div>

        {/* Secret Key Hint */}
        <div className="rounded-xl bg-amber-950/30 border border-amber-500/30 p-3 flex items-center gap-3 text-xs text-stone-300">
          <span className="text-xl shrink-0">🗝️</span>
          <span>
            <strong className="text-amber-300">Секрет уровня:</strong> В приёме №4 («Вибрации») спрятан <strong>Золотой Ключ</strong> от Кованого Сундука с полным непрерывным видео связки всех 8 приёмов (сам сундук ждёт вас на 3-м уровне).
          </span>
        </div>

        {/* Technique Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
          {BROOM_TECHNIQUES.map((tech, index) => {
            const isSelected = selectedTech.id === tech.id;
            const isItemStudied = studiedTechs.includes(tech.id);
            const hasVideo = !!(customVideos[tech.id] || tech.videoUrl);

            return (
              <button
                key={tech.id}
                type="button"
                onClick={() => handleSelectTech(tech)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                    : 'bg-stone-950 hover:bg-stone-800 text-stone-300 border border-stone-800'
                }`}
              >
                {isItemStudied ? (
                  <CheckCircle2
                    className={`w-3.5 h-3.5 shrink-0 ${
                      isSelected ? 'text-stone-950' : 'text-emerald-400'
                    }`}
                  />
                ) : hasVideo ? (
                  <Video
                    className={`w-3.5 h-3.5 shrink-0 ${
                      isSelected ? 'text-stone-950' : 'text-amber-400'
                    }`}
                  />
                ) : null}
                <span>
                  {index + 1}. {tech.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Main Content Layout: Video Slot on Left, Technique Card on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left: Video Player Box */}
          <div className="lg:col-span-7 rounded-2xl border border-stone-800 bg-stone-950 p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden shadow-inner">
            <div className="w-full relative aspect-video rounded-xl overflow-hidden bg-stone-900 border border-stone-800/80 shadow-2xl flex flex-col items-center justify-center">
              {parsedVideo && (parsedVideo.type !== 'html5' || !videoError) ? (
                parsedVideo.type === 'html5' ? (
                  <video
                    key={parsedVideo.directUrl}
                    src={parsedVideo.directUrl}
                    controls
                    playsInline
                    preload="metadata"
                    onError={() => setVideoError(true)}
                    onEnded={() => handleMarkAsStudied(selectedTech.id)}
                    className="w-full h-full object-contain bg-black"
                  >
                    Ваш браузер не поддерживает встроенное воспроизведение видео.
                  </video>
                ) : (
                  <iframe
                    src={parsedVideo.embedUrl}
                    title={`Видео приёма: ${selectedTech.name}`}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                    allowFullScreen
                  />
                )
              ) : (
                <div className="w-full h-full p-6 flex flex-col items-center justify-center text-center relative bg-gradient-to-b from-stone-900 via-stone-950 to-stone-900">
                  <div className="relative z-10 flex flex-col items-center space-y-3 max-w-md">
                    <div className="h-14 w-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shadow-lg text-2xl">
                      🌿
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                        Приём {currentIdx + 1} из 8 · Темп: {selectedTech.tempo} ({selectedTech.frequency} движ/мин)
                      </span>
                      <h4 className="font-serif text-base sm:text-xl font-bold text-stone-100 mt-1">
                        «{selectedTech.name}»
                      </h4>
                      <p className="text-xs text-stone-300 mt-1.5 leading-relaxed">
                        {selectedTech.execution}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAddingVideo(!isAddingVideo)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-stone-800/90 hover:bg-stone-800 text-amber-300 text-xs font-medium transition-all border border-stone-700 cursor-pointer"
                    >
                      <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
                      <span>{isAddingVideo ? 'Скрыть поле ссылки' : 'Подключить видео (VK / Rutube / MP4)'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {isAddingVideo && (
              <form
                onSubmit={handleSaveVideoUrl}
                className="mt-4 p-4 rounded-xl bg-stone-900 border border-amber-500/30 space-y-3"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-amber-300 flex items-center gap-1.5">
                    <Video className="w-4 h-4 text-amber-400" />
                    <span>Ссылка на видео для «{selectedTech.name}»:</span>
                  </span>
                  {activeVideoUrl && (
                    <button
                      type="button"
                      onClick={handleClearVideo}
                      className="text-[11px] text-rose-400 hover:text-rose-300 underline cursor-pointer"
                    >
                      Сбросить
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    placeholder="Ссылка VK, Rutube, Kinescope или /videos/..."
                    className="flex-1 bg-stone-950 border border-stone-700 rounded-lg px-3 py-2 text-xs text-stone-200 placeholder:text-stone-500 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs cursor-pointer transition-colors"
                  >
                    Сохранить
                  </button>
                </div>
              </form>
            )}

            {/* Bottom Bar under video */}
            <div className="mt-4 pt-3 border-t border-stone-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-stone-400 font-mono">
                <span>Приём {currentIdx + 1} из 8</span>
                <span>·</span>
                <span className="text-amber-300 font-semibold">{selectedTech.zone}</span>
              </div>

              <div className="flex items-center gap-2">
                {!isAddingVideo && (
                  <button
                    type="button"
                    onClick={() => setIsAddingVideo(true)}
                    className="text-stone-400 hover:text-amber-300 text-xs transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>{activeVideoUrl ? 'Своя ссылка' : 'Вставить видео'}</span>
                  </button>
                )}

                {selectedTech.id === 'vibratsii' ? (
                  <button
                    type="button"
                    onClick={() => {
                      playSuccessChime(soundEnabled);
                      if (!isStudied) {
                        handleMarkAsStudied('vibratsii');
                      }
                      if (typeof window !== 'undefined') {
                        localStorage.setItem('banya_golden_key_awarded', 'true');
                      }
                      if (onUnlockBadge) {
                        onUnlockBadge('golden_key', 50);
                      }
                      setShowKeyFoundModal(true);
                    }}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg active:scale-95 cursor-pointer ${
                      hasGoldenKey
                        ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-stone-950 border border-amber-300'
                        : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 animate-pulse'
                    }`}
                  >
                    <Key className="w-4 h-4 text-stone-950" />
                    <span>
                      {hasGoldenKey
                        ? 'Золотой Ключ у вас! (Открыть подсказку)'
                        : '🗝️ Забрать Золотой Ключ (+50 XP)'}
                    </span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleMarkAsStudied(selectedTech.id)}
                    disabled={isStudied}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isStudied
                        ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/50 cursor-default'
                        : 'bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold shadow-md cursor-pointer active:scale-95'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isStudied ? 'Приём изучен ✓' : 'Изучено (+15 XP)'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right: Clean Technique Card + Sequential Step Navigation */}
          <div className="lg:col-span-5 rounded-2xl border border-stone-800 bg-stone-950/80 p-5 sm:p-6 space-y-4 flex flex-col justify-between shadow-lg">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                <span className="text-xs font-mono uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Приём {currentIdx + 1} из 8</span>
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-stone-800 text-stone-300 font-mono">
                  Темп: {selectedTech.tempo}
                </span>
              </div>

              <div>
                <h4 className="font-serif text-2xl font-bold text-stone-100">
                  {currentIdx + 1}. {selectedTech.name}
                </h4>
                <p className="text-xs sm:text-sm text-stone-300 mt-1.5 leading-relaxed">
                  {selectedTech.description}
                </p>
              </div>

              <div className="space-y-3 pt-1 text-xs sm:text-sm">
                <div className="p-3.5 sm:p-4 rounded-xl bg-amber-950/25 border border-amber-800/40 space-y-1.5">
                  <strong className="text-amber-300 block font-semibold text-xs sm:text-sm">
                    🎯 Зачем нужен:
                  </strong>
                  <p className="text-amber-100/90 leading-relaxed text-xs sm:text-sm">
                    {selectedTech.purpose}
                  </p>
                </div>

                <div className="p-3.5 sm:p-4 rounded-xl bg-stone-900 border border-stone-800/80 space-y-1.5">
                  <strong className="text-stone-200 block font-semibold text-xs sm:text-sm">
                    👐 Как выполнять:
                  </strong>
                  <p className="text-stone-300 leading-relaxed text-xs sm:text-sm">
                    {selectedTech.execution}
                  </p>
                </div>

                <div className="p-3.5 sm:p-4 rounded-xl bg-emerald-950/25 border border-emerald-800/40 space-y-1.5">
                  <strong className="text-emerald-300 block font-semibold text-xs sm:text-sm">
                    ✨ Что чувствует гость:
                  </strong>
                  <p className="text-emerald-100/90 leading-relaxed italic text-xs sm:text-sm">
                    {selectedTech.guestSensations}
                  </p>
                </div>
              </div>
            </div>

            {/* Sequential Prev / Next Technique Buttons */}
            <div className="pt-3 border-t border-stone-800 flex items-center justify-between gap-2">
              {prevTech ? (
                <button
                  type="button"
                  onClick={() => handleSelectTech(prevTech)}
                  className="px-3 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 text-xs font-medium border border-stone-800 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Пред.</span>
                </button>
              ) : (
                <div />
              )}

              {nextTech ? (
                <button
                  type="button"
                  onClick={() => {
                    if (!isStudied) handleMarkAsStudied(selectedTech.id);
                    handleSelectTech(nextTech);
                  }}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Следующий: {currentIdx + 2}. {nextTech.name}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <span className="text-xs font-mono text-emerald-400 font-bold">
                  Все 8 приёмов просмотрены ✓
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* ШАГ 3. ПАМЯТКА ДОМАШНЕЙ БЕЗОПАСНОСТИ (КОМПАКТНО И ПОСЛЕДОВАТЕЛЬНО) */}
      {/* =================================================================== */}
      <div className="rounded-3xl border border-stone-800 bg-stone-900/95 p-6 sm:p-8 space-y-5 shadow-xl">
        <div className="border-b border-stone-800 pb-4">
          <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold">
            🛡️ Шаг 3 из 3 · Базовая безопасность дома и на даче
          </span>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-100 mt-1">
            Как безопасно пропарить близкого человека: 3 зоны внимания
          </h3>
          <p className="text-xs sm:text-sm text-stone-400 mt-0.5">
            Главное правило домашнего пармастера: <strong>лучше чуть-чуть недогреть, чем перегреть!</strong>
          </p>
        </div>

        <div className="space-y-4 text-sm sm:text-base text-stone-200 leading-relaxed">
          <div className="rounded-2xl bg-stone-950/80 border border-stone-800/90 p-4 sm:p-5 space-y-3">
            <h4 className="font-serif text-base sm:text-lg font-bold text-emerald-300">
              1. Защита Гостя (Близкого человека)
            </h4>
            <ul className="space-y-2.5 text-stone-300">
              <li className="rounded-xl bg-stone-900/80 border border-stone-800/80 p-3.5">
                • <strong>Никакого алкоголя и температуры тела &gt;37 °C:</strong> алкоголь расширяет сосуды, а жар сгущает кровь — это прямой риск скачка давления и аритмии.
              </li>
              <li className="rounded-xl bg-stone-900/80 border border-stone-800/80 p-3.5">
                • <strong>На голове — СУХАЯ шапка:</strong> сухая шерсть или войлок работают как термос. Мокрая шапка в парной быстро нагревается и превращается в горячий компресс.
              </li>
              <li className="rounded-xl bg-stone-900/80 border border-stone-800/80 p-3.5">
                • <strong>Подъём через паузу (защита от <TermTooltip termKey="orthostatic">ортостатического спазма</TermTooltip>):</strong> после парения дайте человеку спокойно полежать 1–2 минуты, затем плавно сесть и только потом вставать.
              </li>
            </ul>
          </div>

          <div className="rounded-2xl bg-stone-950/80 border border-stone-800/90 p-4 sm:p-5 space-y-3">
            <h4 className="font-serif text-base sm:text-lg font-bold text-amber-300">
              2. Защита Пространства
            </h4>
            <ul className="space-y-2.5 text-stone-300">
              <li className="rounded-xl bg-stone-900/80 border border-stone-800/80 p-3.5">
                • <strong>Чистый пол без скользких листьев:</strong> между заходами обязательно смывайте с пола опавшие листья и лишнюю воду.
              </li>
              <li className="rounded-xl bg-stone-900/80 border border-stone-800/80 p-3.5">
                • <strong>Подача воды только сбоку от печи:</strong> никогда не наклоняйте лицо над открытой дверцей каменки — струя пара вылетает мгновенно.
              </li>
              <li className="rounded-xl bg-stone-900/80 border border-stone-800/80 p-3.5">
                • <strong>Свежий кислород:</strong> проветривайте парную залпом на 1–2 минуты между заходами.
              </li>
            </ul>
          </div>

          <div className="rounded-2xl bg-stone-950/80 border border-stone-800/90 p-4 sm:p-5 space-y-3">
            <h4 className="font-serif text-base sm:text-lg font-bold text-sky-300">
              3. Защита Себя (Спины и сил мастера)
            </h4>
            <ul className="space-y-2.5 text-stone-300">
              <li className="rounded-xl bg-stone-900/80 border border-stone-800/80 p-3.5">
                • <strong>Прямая спина и подстройка под полок:</strong> если полок <u>слишком низкий</u> — расставьте ноги шире в полуприседе или уложите гостя на матрас (трапик под ноги ставить нельзя — полок станет ещё ниже!). Трапик нужен только тогда, когда полок <u>слишком высокий</u>.
              </li>
              <li className="rounded-xl bg-stone-900/80 border border-stone-800/80 p-3.5">
                • <strong>Водно-солевой баланс:</strong> каждые 15 минут пейте тёплую воду с долькой лимона и щепоткой соли.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* POPUP: Key Found */}
      {showKeyFoundModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md max-h-[92vh] overflow-y-auto rounded-3xl border-2 border-amber-400 bg-stone-950 p-5 sm:p-6 text-stone-100 shadow-[0_0_50px_rgba(245,158,11,0.35)] space-y-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-3xl mx-auto shadow-[0_0_25px_rgba(245,158,11,0.4)] animate-bounce">
              🗝️
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-amber-400 bg-amber-500/15 px-3 py-1 rounded-full border border-amber-500/30">
                Тайный артефакт найден!
              </span>
              <h3 className="font-serif text-2xl font-bold text-amber-200">
                Вы получили Золотой Ключ!
              </h3>
              <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 text-xs sm:text-sm text-stone-200 leading-relaxed text-left space-y-2">
                <p>
                  🏆 <strong>Поздравляем!</strong> Вы отыскали секретный артефакт в приёме «Вибрации».
                </p>
                <p className="text-amber-300 font-semibold">
                  🔍 Сундук с тайными знаниями ждёт вас на 3-м уровне!
                </p>
                <p className="text-stone-400 text-xs">
                  На 3-м уровне вы сможете открыть этим ключом Кованый Сундук с полным непрерывным видео связки всех 8 приёмов и техникой «Ледяное дыхание».
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  setShowKeyFoundModal(false);
                  if (onNavigateToLevel) onNavigateToLevel(3);
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Искать сундук на 3-м уровне →</span>
              </button>
              <button
                type="button"
                onClick={() => setShowKeyFoundModal(false)}
                className="py-3 px-4 rounded-xl bg-stone-900 hover:bg-stone-850 text-stone-400 hover:text-stone-200 text-xs font-semibold transition-colors cursor-pointer"
              >
                Остаться здесь
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
