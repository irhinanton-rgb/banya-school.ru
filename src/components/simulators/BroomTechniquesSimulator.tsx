import React, { useState, useEffect } from 'react';
import { BROOM_TECHNIQUES } from '../../data/courseData';
import { BroomTechnique } from '../../types/banya';
import { playWoodTap, playSuccessChime } from '../../utils/audio';
import {
  Play,
  Sparkles,
  CheckCircle2,
  Video,
  ExternalLink,
  PlusCircle,
  Eye,
  Layers,
  HelpCircle,
} from 'lucide-react';

interface BroomTechniquesSimulatorProps {
  soundEnabled: boolean;
  onGrantXp?: (amount: number) => void;
}

export interface VideoSource {
  type: 'html5' | 'vk' | 'rutube' | 'kinescope' | 'youtube';
  embedUrl: string;
  directUrl?: string;
  serviceLabel: string;
}

// Convert and strictly validate Russian and international video links into secure embed URLs
function parseVideoSource(urlOrId?: string): VideoSource | null {
  if (!urlOrId || !urlOrId.trim()) return null;
  const raw = urlOrId.trim();

  // 1. Direct HTML5 video file (.mp4, .webm, .ogg, or local /videos/ path)
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

  // 2. VK Video (ВКонтакте) — works reliably without VPN across Russia
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

  // 3. Rutube (Рутуб) — Russian national video platform
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

  // 4. Kinescope (Кинескоп) — specialized video platform for online schools
  const kinescopeMatch = raw.match(/kinescope\.io\/(?:embed\/)?([a-zA-Z0-9_-]+)/i);
  if (kinescopeMatch) {
    return {
      type: 'kinescope',
      embedUrl: `https://kinescope.io/embed/${kinescopeMatch[1]}`,
      serviceLabel: 'Kinescope',
    };
  }

  // 5. YouTube (preserved as fallback)
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

export const BroomTechniquesSimulator: React.FC<BroomTechniquesSimulatorProps> = ({
  soundEnabled,
  onGrantXp,
}) => {
  // Custom video URLs state (persisted in localStorage for convenience)
  const [customVideos, setCustomVideos] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('banya_technique_videos');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [selectedTech, setSelectedTech] = useState<BroomTechnique>(() => {
    // Default to the first technique that has a video attached (e.g. Омахивание)
    const withVideo = BROOM_TECHNIQUES.find((t) => !!t.videoUrl);
    return withVideo || BROOM_TECHNIQUES[0];
  });
  const [studiedTechs, setStudiedTechs] = useState<string[]>([]);

  const [inputUrl, setInputUrl] = useState<string>('');
  const [isAddingVideo, setIsAddingVideo] = useState<boolean>(false);
  const [videoError, setVideoError] = useState<boolean>(false);

  // Active video URL for current technique (prioritize non-empty custom video, else fallback to predefined videoUrl)
  const customVal = customVideos[selectedTech.id];
  const activeVideoUrl = (customVal && customVal.trim() !== '') ? customVal.trim() : (selectedTech.videoUrl || '');
  const parsedVideo = parseVideoSource(activeVideoUrl);

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
      // ignore storage error
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
    <div className="rounded-2xl border border-stone-800 bg-stone-900/90 p-5 sm:p-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
            <span>🌿</span>
            <span>Видео-Практикум Венечного Мастерства</span>
          </div>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-100 mt-1">
            8 Приёмов Венечного Массажа (Видеодемонстрация)
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-stone-950 border border-stone-800 px-3.5 py-1.5 text-xs font-mono text-stone-300">
            Изучено приёмов:{' '}
            <span className="text-amber-400 font-bold">
              {studiedTechs.length} / {BROOM_TECHNIQUES.length}
            </span>
          </div>
        </div>
      </div>

      {/* Tool continuity banner */}
      <div className="rounded-xl bg-amber-950/20 border border-amber-500/30 p-3 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">🌿</span>
          <div className="text-stone-300">
            <strong className="text-amber-300">Рабочий инструмент:</strong> Два кавказских дубовых веника (получены за Уровень 1). Отрабатывайте мягкую лиственную подушку, синхронность кистей и волновое движение от стоп.
          </div>
        </div>
      </div>

      {/* Technique Selector Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
        {BROOM_TECHNIQUES.map((tech) => {
          const isSelected = selectedTech.id === tech.id;
          const isItemStudied = studiedTechs.includes(tech.id);
          const hasVideo = !!(customVideos[tech.id] || tech.videoUrl);

          return (
            <button
              key={tech.id}
              onClick={() => handleSelectTech(tech)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                isSelected
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                  : 'bg-stone-950 hover:bg-stone-800 text-stone-300 border border-stone-800'
              }`}
            >
              {isItemStudied && (
                <CheckCircle2
                  className={`w-3.5 h-3.5 shrink-0 ${
                    isSelected ? 'text-stone-950' : 'text-emerald-400'
                  }`}
                />
              )}
              {hasVideo && !isItemStudied && (
                <Video
                  className={`w-3.5 h-3.5 shrink-0 ${
                    isSelected ? 'text-stone-950' : 'text-red-400'
                  }`}
                />
              )}
              <span>{tech.name}</span>
              {hasVideo && (
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                    isSelected
                      ? 'bg-stone-950/20 text-stone-950'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  Видео
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Content Layout: Video Slot on Left, Technique Card on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left: Video Player Box / Embed Frame */}
        <div className="lg:col-span-7 rounded-2xl border border-stone-800 bg-stone-950 p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden shadow-inner">
          
          {/* Ambient Lighting */}
          <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full bg-amber-600/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full bg-emerald-600/10 blur-3xl pointer-events-none" />

          {/* Video Container (16:9 Aspect Ratio) */}
          <div className="w-full relative aspect-video rounded-xl overflow-hidden bg-stone-900 border border-stone-800/80 shadow-2xl flex flex-col items-center justify-center">
            {parsedVideo ? (
              parsedVideo.type === 'html5' ? (
                videoError ? (
                  <div className="w-full h-full p-6 flex flex-col items-center justify-center text-center bg-stone-950/90 text-stone-300 space-y-3">
                    <div className="h-12 w-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-2xl border border-amber-500/30">
                      📹
                    </div>
                    <div>
                      <h4 className="font-bold text-amber-200 text-sm">
                        Видеофайл приёма «{selectedTech.name}»
                      </h4>
                      <p className="text-xs text-stone-400 mt-1 max-w-sm leading-relaxed">
                        Путь в проекте: <code className="text-amber-300 font-mono text-[11px] bg-stone-900 px-1.5 py-0.5 rounded border border-stone-800">{parsedVideo.directUrl}</code>
                      </p>
                      <p className="text-[11px] text-stone-500 mt-2 max-w-xs mx-auto">
                        Загрузите файл видео в папку <strong className="text-stone-300">public/videos/</strong> на GitHub, либо укажите ссылку на VK Видео / Rutube / Облако.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAddingVideo(true)}
                      className="px-3.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-300 text-xs font-medium border border-stone-700 transition-colors cursor-pointer"
                    >
                      Вставить ссылку на VK / Rutube / Диск
                    </button>
                  </div>
                ) : (
                  <video
                    key={parsedVideo.directUrl}
                    src={parsedVideo.directUrl}
                    controls
                    playsInline
                    preload="metadata"
                    onError={() => setVideoError(true)}
                    className="w-full h-full object-contain bg-black"
                  >
                    Ваш браузер не поддерживает встроенное воспроизведение видео.
                  </video>
                )
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
              /* Sleek Video Placeholder for Russian & International Video Hostings */
              <div className="w-full h-full p-6 flex flex-col items-center justify-center text-center relative bg-gradient-to-b from-stone-900 via-stone-950 to-stone-900">
                {/* Decorative video backdrop lines */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.08)_0%,transparent_70%)]" />

                <div className="relative z-10 flex flex-col items-center space-y-3 max-w-sm">
                  <div className="h-16 w-16 rounded-2xl bg-stone-800/90 border border-stone-700/80 flex items-center justify-center shadow-lg group">
                    <div className="h-12 w-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                      <Play className="w-6 h-6 fill-current ml-0.5" />
                    </div>
                  </div>

                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-stone-800 border border-stone-700 text-stone-300 text-[11px] font-mono mb-1.5">
                      🎬 VK Видео / Rutube / Kinescope / MP4
                    </span>
                    <h4 className="font-serif text-base sm:text-lg font-bold text-stone-200">
                      Видеодемонстрация: «{selectedTech.name}»
                    </h4>
                    <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                      Встройте видео с любого российского сервиса (работает быстро и без VPN у всех учеников).
                    </p>
                  </div>

                  {/* Button to open quick URL input */}
                  <button
                    onClick={() => setIsAddingVideo(!isAddingVideo)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-semibold transition-all border border-amber-500/30 cursor-pointer shadow-sm active:scale-95"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isAddingVideo ? 'Скрыть форму' : 'Добавить ссылку на видео'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Video URL Form (Collapsible) */}
          {isAddingVideo && (
            <form
              onSubmit={handleSaveVideoUrl}
              className="mt-4 p-4 rounded-xl bg-stone-900 border border-amber-500/30 space-y-3 animate-fade-in"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-amber-300 flex items-center gap-1.5">
                  <Video className="w-4 h-4 text-amber-400" />
                  <span>Вставить видео для «{selectedTech.name}»:</span>
                </span>
                {activeVideoUrl && (
                  <button
                    type="button"
                    onClick={handleClearVideo}
                    className="text-[11px] text-rose-400 hover:text-rose-300 underline cursor-pointer"
                  >
                    Удалить видео
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="Ссылка VK (vk.com/video...), Rutube, Kinescope или файл .mp4"
                  className="flex-1 bg-stone-950 border border-stone-700 rounded-lg px-3 py-2 text-xs text-stone-200 placeholder:text-stone-500 focus:outline-none focus:border-amber-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs cursor-pointer transition-colors"
                >
                  Сохранить
                </button>
              </div>

              <div className="text-[10px] text-stone-400 space-y-1">
                <div className="text-stone-300 font-medium">Поддерживаемые форматы без VPN:</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[10px]">
                  <div>• <strong>VK Видео</strong>: <code className="text-amber-300">vk.com/video-123_456</code> или код плеера</div>
                  <div>• <strong>Rutube</strong>: <code className="text-amber-300">rutube.ru/video/...</code> или embed</div>
                  <div>• <strong>Kinescope</strong>: <code className="text-amber-300">kinescope.io/...</code> (для курсов)</div>
                  <div>• <strong>Прямой MP4</strong>: <code className="text-amber-300">/videos/opakhivanie.mp4</code> или URL</div>
                </div>
              </div>
            </form>
          )}

          {/* Bottom Bar under video: Status and Studied Action */}
          <div className="mt-4 pt-3 border-t border-stone-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-stone-400 font-mono">
              <span>Зона:</span>
              <span className="text-amber-300 font-semibold">{selectedTech.zone}</span>
            </div>

            <div className="flex items-center gap-2">
              {!isAddingVideo && (
                <button
                  onClick={() => setIsAddingVideo(true)}
                  className="text-stone-400 hover:text-amber-300 text-xs transition-colors flex items-center gap-1"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>{activeVideoUrl ? 'Изменить видео' : 'Вставить видео'}</span>
                </button>
              )}

              <button
                onClick={() => handleMarkAsStudied(selectedTech.id)}
                disabled={isStudied}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isStudied
                    ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/50 cursor-default'
                    : 'bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold shadow-md cursor-pointer active:scale-95'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isStudied ? 'Приём изучен ✓' : 'Отметить как изученный (+15 XP)'}</span>
              </button>
            </div>
          </div>

        </div>

        {/* Right: Technique Anatomy & Pedagogical Instructions */}
        <div className="lg:col-span-5 rounded-2xl border border-stone-800 bg-stone-950/80 p-5 sm:p-6 space-y-4 flex flex-col justify-between shadow-lg">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <span className="text-xs font-mono uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                <span>Карточка приёма</span>
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-stone-800 text-stone-300 font-mono font-medium">
                Темп: {selectedTech.tempo}
              </span>
            </div>

            <div>
              <h4 className="font-serif text-2xl font-bold text-stone-100">
                {selectedTech.name}
              </h4>
              <p className="text-xs sm:text-sm text-stone-300 mt-2 leading-relaxed">
                {selectedTech.description}
              </p>
            </div>

            <div className="space-y-3 pt-2 text-xs">
              <div className="p-3 rounded-xl bg-stone-900 border border-stone-800/80 space-y-1">
                <strong className="text-stone-200 block font-semibold flex items-center gap-1.5">
                  <span>👐</span> Механика выполнения:
                </strong>
                <p className="text-stone-300 leading-relaxed">{selectedTech.execution}</p>
              </div>

              <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/40 space-y-1">
                <strong className="text-emerald-300 block font-semibold flex items-center gap-1.5">
                  <span>🩺</span> Физиологический эффект:
                </strong>
                <p className="text-emerald-100/90 leading-relaxed">{selectedTech.purpose}</p>
              </div>

              <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/40 space-y-1">
                <strong className="text-amber-300 block font-semibold flex items-center gap-1.5">
                  <span>🎯</span> Рабочая зона тела:
                </strong>
                <p className="text-amber-100/90 font-mono">{selectedTech.zone}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-stone-900 p-3.5 border border-stone-800/80 text-[11px] text-stone-400 leading-relaxed mt-2">
            <span className="text-amber-400 font-semibold block mb-0.5">
              💡 Совет наставника банной школы:
            </span>
            Никогда не бейте по телу голой деревянной ручкой веника. Работает только мягкая упругая лиственная подушка, которая бережно захватывает пар из верхнего пирога и компрессирует его в мышцы.
          </div>
        </div>

      </div>

    </div>
  );
};
