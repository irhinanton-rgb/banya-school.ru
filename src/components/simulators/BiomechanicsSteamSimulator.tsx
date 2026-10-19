import React, { useState, useRef, useEffect } from 'react';
import {
  LEVEL5_VIDEO_SECTIONS,
  Level5VideoLesson,
  VideoSection,
} from '../../data/level5VideoData';
import { parseVideoSource } from '../../utils/videoUtils';
import { playSuccessChime, playSteamSound, playWoodTap } from '../../utils/audio';
import confetti from 'canvas-confetti';
import {
  Play,
  CheckCircle2,
  Video,
  Sparkles,
  Layers,
  PlusCircle,
  Clock,
  Check,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';

interface BiomechanicsSteamSimulatorProps {
  soundEnabled: boolean;
  onGrantXp?: (amount: number) => void;
  onSuccess?: () => void;
  onTaiChiCompleted?: () => void;
  onSoundCompleted?: () => void;
  onSteamCompleted?: () => void;
}

// -------------------------------------------------------------
// STANDALONE SECTION VIDEOTHEQUE (Exact visual layout of Level 2)
// -------------------------------------------------------------
interface SectionVideothequeProps {
  section: VideoSection;
  soundEnabled: boolean;
  studiedLessons: string[];
  customVideos: Record<string, string>;
  onMarkAsStudied: (lessonId: string) => void;
  onSaveCustomUrl: (lessonId: string, url: string) => void;
  onClearCustomUrl: (lessonId: string) => void;
  onNextSection?: () => void;
  onPrevSection?: () => void;
  isFirstSection?: boolean;
  isLastSection?: boolean;
}

const SectionVideotheque: React.FC<SectionVideothequeProps> = ({
  section,
  soundEnabled,
  studiedLessons,
  customVideos,
  onMarkAsStudied,
  onSaveCustomUrl,
  onClearCustomUrl,
  onNextSection,
  onPrevSection,
  isFirstSection,
  isLastSection,
}) => {
  // Current selected lesson in this section
  const [selectedLessonId, setSelectedLessonId] = useState<string>(section.lessons[0]?.id || '');
  const [videoError, setVideoError] = useState<boolean>(false);
  const [isAddingVideo, setIsAddingVideo] = useState<boolean>(false);
  const [inputUrl, setInputUrl] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);

  const selectedLesson: Level5VideoLesson =
    section.lessons.find((l) => l.id === selectedLessonId) || section.lessons[0];

  const activeVideoUrl = customVideos[selectedLesson.id] || selectedLesson.defaultVideoUrl;
  const parsedVideo = parseVideoSource(activeVideoUrl);
  const isStudied = studiedLessons.includes(selectedLesson.id);

  const sectionStudiedCount = section.lessons.filter((l) => studiedLessons.includes(l.id)).length;
  const isSectionDone = sectionStudiedCount === section.lessons.length;

  useEffect(() => {
    setInputUrl(customVideos[selectedLesson.id] || selectedLesson.defaultVideoUrl);
    setVideoError(false);
  }, [selectedLesson.id, customVideos]);

  const handleSelectLesson = (lesson: Level5VideoLesson) => {
    setSelectedLessonId(lesson.id);
    setVideoError(false);
    playWoodTap(soundEnabled);
  };

  const handleSeekTimestamp = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = seconds;
      videoRef.current.play().catch(() => {});
    }
    playWoodTap(soundEnabled);
  };

  const handleSubmitCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveCustomUrl(selectedLesson.id, inputUrl.trim());
    setIsAddingVideo(false);
    setVideoError(false);
  };

  return (
    <div className="rounded-3xl border border-stone-800 bg-stone-900/95 p-5 sm:p-7 space-y-5 shadow-2xl animate-fadeIn">
      
      {/* ------------------------------------------------------- */}
      {/* VIDEOTHEQUE HEADER: Section Badge & Progress */}
      {/* ------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
            <Video className="w-4 h-4 text-amber-400" />
            <span>Видеотека · Раздел {section.number}</span>
          </div>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-100 mt-1">
            {section.icon} {section.title}
          </h3>
          <p className="text-xs sm:text-sm text-stone-400 mt-0.5">
            {section.subtitle}
          </p>
        </div>

        {/* Section Progress Badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {isSectionDone ? (
            <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold flex items-center gap-1.5 shadow-md">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Раздел освоен (2/2) ✓</span>
            </span>
          ) : (
            <span className="px-3 py-1.5 rounded-xl bg-stone-950 text-amber-300 border border-stone-800 text-xs font-mono font-bold">
              Освоено: {sectionStudiedCount} из 2 видео
            </span>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------- */}
      {/* LESSON SELECTOR PILLS: The 2 Videos in this Section */}
      {/* ------------------------------------------------------- */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {section.lessons.map((lesson) => {
          const isSelected = selectedLesson.id === lesson.id;
          const isItemStudied = studiedLessons.includes(lesson.id);
          const hasVideo = !!(customVideos[lesson.id] || lesson.defaultVideoUrl);

          return (
            <button
              key={lesson.id}
              onClick={() => handleSelectLesson(lesson)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                isSelected
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                  : 'bg-stone-950 hover:bg-stone-800 text-stone-300 border border-stone-800'
              }`}
            >
              {isItemStudied ? (
                <CheckCircle2
                  className={`w-4 h-4 shrink-0 ${
                    isSelected ? 'text-stone-950' : 'text-emerald-400'
                  }`}
                />
              ) : hasVideo ? (
                <Video
                  className={`w-4 h-4 shrink-0 ${
                    isSelected ? 'text-stone-950' : 'text-amber-400'
                  }`}
                />
              ) : null}

              <span className="text-xs sm:text-sm">{lesson.name}</span>

              <span
                className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider ${
                  isSelected
                    ? 'bg-stone-950/20 text-stone-950'
                    : 'bg-amber-500/15 text-amber-300 border border-amber-500/25'
                }`}
              >
                {lesson.duration}
              </span>
            </button>
          );
        })}
      </div>

      {/* ------------------------------------------------------- */}
      {/* TWO-COLUMN GRID: Left (Player 7 cols) | Right (Card 5 cols) */}
      {/* ------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left: Video Player Frame (7 cols) */}
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
                        Видеоурок: «{selectedLesson.name}»
                      </h4>
                      <p className="text-xs text-stone-400 mt-1 max-w-sm leading-relaxed">
                        Путь в проекте: <code className="text-amber-300 font-mono text-[11px] bg-stone-900 px-1.5 py-0.5 rounded border border-stone-800">{parsedVideo.directUrl}</code>
                      </p>
                      <p className="text-[11px] text-stone-500 mt-2 max-w-xs mx-auto">
                        Вы можете вставить ссылку на видео из VK Видео, Rutube или облака.
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
                    ref={videoRef}
                    key={parsedVideo.directUrl}
                    src={parsedVideo.directUrl}
                    controls
                    playsInline
                    preload="metadata"
                    onError={() => setVideoError(true)}
                    onEnded={() => onMarkAsStudied(selectedLesson.id)}
                    className="w-full h-full object-contain bg-black"
                  >
                    Ваш браузер не поддерживает встроенное воспроизведение видео.
                  </video>
                )
              ) : (
                <iframe
                  src={parsedVideo.embedUrl}
                  title={`Видеоурок: ${selectedLesson.title}`}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  allowFullScreen
                />
              )
            ) : (
              <div className="w-full h-full p-6 flex flex-col items-center justify-center text-center relative bg-gradient-to-b from-stone-900 via-stone-950 to-stone-900">
                <div className="relative z-10 flex flex-col items-center space-y-3 max-w-sm">
                  <div className="h-16 w-16 rounded-2xl bg-stone-800/90 border border-stone-700/80 flex items-center justify-center shadow-lg">
                    <div className="h-12 w-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                      <Play className="w-6 h-6 fill-current ml-0.5" />
                    </div>
                  </div>

                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-stone-800 border border-stone-700 text-stone-300 text-[11px] font-mono mb-1.5">
                      🎬 VK Видео / Rutube / MP4
                    </span>
                    <h4 className="font-serif text-base sm:text-lg font-bold text-stone-200">
                      Видеодемонстрация: «{selectedLesson.name}»
                    </h4>
                  </div>

                  <button
                    type="button"
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
              onSubmit={handleSubmitCustomUrl}
              className="mt-4 p-4 rounded-xl bg-stone-900 border border-amber-500/30 space-y-3 animate-fadeIn"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-amber-300 flex items-center gap-1.5">
                  <Video className="w-4 h-4 text-amber-400" />
                  <span>Ссылка для «{selectedLesson.name}»:</span>
                </span>
                {activeVideoUrl && (
                  <button
                    type="button"
                    onClick={() => onClearCustomUrl(selectedLesson.id)}
                    className="text-[11px] text-rose-400 hover:text-rose-300 underline cursor-pointer"
                  >
                    Сбросить на оригинал
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="https://vk.com/video... или rutube.ru/video/... или /videos/..."
                  className="flex-1 bg-stone-950 border border-stone-700 rounded-lg px-3 py-2 text-xs text-stone-200 placeholder:text-stone-500 focus:outline-none focus:border-amber-500 font-mono"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs cursor-pointer transition-colors"
                >
                  Сохранить
                </button>
              </div>

              <div className="text-[10px] text-stone-400 space-y-0.5">
                <div>• <strong>VK Видео</strong>: <code className="text-amber-300">vk.com/video-123_456</code></div>
                <div>• <strong>Rutube</strong>: <code className="text-amber-300">rutube.ru/video/...</code></div>
              </div>
            </form>
          )}

          {/* Bottom Bar: Status and Action Button */}
          <div className="mt-4 pt-3 border-t border-stone-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-stone-400 font-mono">
              <span>{selectedLesson.sectionIcon} Урок {selectedLesson.lessonNumber} из 2</span>
              <span>·</span>
              <span className="text-amber-300 font-semibold">{selectedLesson.duration}</span>
            </div>

            <div className="flex items-center gap-2">
              {!isAddingVideo && (
                <button
                  type="button"
                  onClick={() => setIsAddingVideo(true)}
                  className="text-stone-400 hover:text-amber-300 text-xs transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>{customVideos[selectedLesson.id] ? 'Изменить видео' : 'Своя ссылка'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => onMarkAsStudied(selectedLesson.id)}
                disabled={isStudied}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isStudied
                    ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/50 cursor-default'
                    : 'bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold shadow-md cursor-pointer active:scale-95'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isStudied ? 'Урок изучен ✓' : 'Отметить как изученный (+25 XP)'}</span>
              </button>
            </div>
          </div>

        </div>

        {/* Right: Technique Anatomy Card (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-stone-800 bg-stone-950/80 p-5 sm:p-6 space-y-4 flex flex-col justify-between shadow-lg">
          <div className="space-y-4">
            
            {/* Top Bar inside Card */}
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <span className="text-xs font-mono uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                <span>Карточка видеоурока</span>
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-stone-800 text-stone-300 font-mono font-medium">
                Урок {selectedLesson.lessonNumber} из 2
              </span>
            </div>

            {/* Title & Concise Summary */}
            <div>
              <h4 className="font-serif text-xl sm:text-2xl font-bold text-stone-100">
                {selectedLesson.title}
              </h4>
              <p className="text-xs sm:text-sm text-stone-300 mt-2 leading-relaxed">
                {selectedLesson.description}
              </p>
            </div>

            {/* 3 Concise Visual Blocks matching Level 2 */}
            <div className="space-y-3 pt-2 text-xs">
              
              {/* 1. Purpose */}
              <div className="p-3 rounded-xl bg-amber-950/25 border border-amber-800/40 space-y-1">
                <strong className="text-amber-300 block font-semibold flex items-center gap-1.5">
                  <span>🎯</span> Для чего и ключевой навык:
                </strong>
                <p className="text-amber-100/90 leading-relaxed text-[11px] sm:text-xs">
                  {selectedLesson.purpose}
                </p>
              </div>

              {/* 2. Mechanics */}
              <div className="p-3 rounded-xl bg-stone-900 border border-stone-800/80 space-y-1">
                <strong className="text-stone-200 block font-semibold flex items-center gap-1.5">
                  <span>👐</span> Как выполняют (биомеханика):
                </strong>
                <p className="text-stone-300 leading-relaxed text-[11px] sm:text-xs">
                  {selectedLesson.execution}
                </p>
              </div>

              {/* 3. Mistakes */}
              <div className="p-3 rounded-xl bg-rose-950/25 border border-rose-800/40 space-y-1">
                <strong className="text-rose-300 block font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  <span>Чего избегать (частая ошибка):</span>
                </strong>
                <p className="text-rose-200/90 leading-relaxed text-[11px] sm:text-xs">
                  {selectedLesson.mistakes}
                </p>
              </div>

              {/* 4. Focus Zone */}
              <div className="p-2.5 rounded-xl bg-stone-900/60 border border-stone-800 text-[11px] flex items-center justify-between gap-2">
                <span className="text-stone-400 font-medium">📍 Фокус и рабочая зона:</span>
                <span className="text-amber-300 font-mono text-right">{selectedLesson.zone}</span>
              </div>

              {/* 5. Clickable Timestamps */}
              {selectedLesson.timestamps.length > 0 && (
                <div className="p-2.5 rounded-xl bg-stone-900/40 border border-stone-850 space-y-1.5">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-semibold flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-400" />
                    <span>Ключевые моменты (нажмите для перехода):</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedLesson.timestamps.map((ts, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSeekTimestamp(ts.seconds)}
                        className="px-2.5 py-1 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-800 hover:border-amber-500/40 text-stone-300 text-[11px] font-mono transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <span className="text-amber-400 font-bold">{ts.time}</span>
                        <span className="text-stone-400">{ts.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

      </div>

      {/* ------------------------------------------------------- */}
      {/* SECTION FOOTER: SEQUENTIAL STEP NAVIGATION */}
      {/* ------------------------------------------------------- */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-stone-800">
        <div>
          {!isFirstSection && onPrevSection ? (
            <button
              type="button"
              onClick={onPrevSection}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 text-xs font-semibold border border-stone-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>← К предыдущей видеотеке</span>
            </button>
          ) : (
            <span className="text-[11px] font-mono text-stone-500">
              Раздел {section.number} из 3
            </span>
          )}
        </div>

        <div>
          {!isLastSection && onNextSection ? (
            <button
              type="button"
              onClick={onNextSection}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <span>Перейти к Видеотеке Раздела {section.number + 1} →</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-emerald-400 font-bold">
                {isSectionDone ? 'Все разделы видеотеки изучены ✓' : 'Завершите просмотр уроков'}
              </span>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

// -------------------------------------------------------------
// MAIN LEVEL 5 COMPONENT: 3 STANDALONE SECTION VIDEOTHEQUES
// -------------------------------------------------------------
export const BiomechanicsSteamSimulator: React.FC<BiomechanicsSteamSimulatorProps> = ({
  soundEnabled,
  onGrantXp,
  onSuccess,
  onTaiChiCompleted,
  onSoundCompleted,
  onSteamCompleted,
}) => {
  // Current active section index: 1 | 2 | 3 | 'all'
  const [activeTab, setActiveTab] = useState<1 | 2 | 3 | 'all'>(1);

  // Studied lessons array stored in localStorage
  const [studiedLessons, setStudiedLessons] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('banya_level5_studied_lessons');
        if (saved) return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return [];
  });

  // Custom user video URLs state
  const [customVideos, setCustomVideos] = useState<Record<string, string>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('banya_level5_custom_videos');
        if (saved) return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return {};
  });

  const handleMarkAsStudied = (lessonId: string) => {
    if (studiedLessons.includes(lessonId)) return;

    const updated = [...studiedLessons, lessonId];
    setStudiedLessons(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('banya_level5_studied_lessons', JSON.stringify(updated));
    }

    playSuccessChime(soundEnabled);
    if (onGrantXp) onGrantXp(25);

    // Check completion of sections
    const sec1Done = LEVEL5_VIDEO_SECTIONS[0].lessons.every((l) => updated.includes(l.id));
    const sec2Done = LEVEL5_VIDEO_SECTIONS[1].lessons.every((l) => updated.includes(l.id));
    const sec3Done = LEVEL5_VIDEO_SECTIONS[2].lessons.every((l) => updated.includes(l.id));

    if (sec1Done && onTaiChiCompleted) onTaiChiCompleted();
    if (sec2Done && onSoundCompleted) onSoundCompleted();
    if (sec3Done && onSteamCompleted) onSteamCompleted();

    // Check all 6 completed
    if (updated.length >= 6) {
      if (onSuccess) onSuccess();
      try {
        confetti({
          particleCount: 80,
          spread: 90,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }
    } else {
      try {
        confetti({
          particleCount: 35,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch {
        // ignore
      }
    }
  };

  const handleSaveCustomUrl = (lessonId: string, url: string) => {
    const updated = { ...customVideos, [lessonId]: url };
    setCustomVideos(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('banya_level5_custom_videos', JSON.stringify(updated));
    }
    playSuccessChime(soundEnabled);
  };

  const handleClearCustomUrl = (lessonId: string) => {
    const updated = { ...customVideos };
    delete updated[lessonId];
    setCustomVideos(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('banya_level5_custom_videos', JSON.stringify(updated));
    }
    playWoodTap(soundEnabled);
  };

  const totalStudied = studiedLessons.length;
  const isAllCompleted = totalStudied >= 6;

  const section1 = LEVEL5_VIDEO_SECTIONS[0];
  const section2 = LEVEL5_VIDEO_SECTIONS[1];
  const section3 = LEVEL5_VIDEO_SECTIONS[2];

  return (
    <div className="space-y-6">
      
      {/* ========================================================= */}
      {/* TOP BAR: Title & 3 Section Videotheques Switcher */}
      {/* ========================================================= */}
      <div className="rounded-2xl border border-stone-800 bg-stone-900/90 p-4 sm:p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Уровень 3 · Видеопрактикум мастерства</span>
            </div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-100 mt-1">
              3 видеотeки по разделам: Тай-чи, Звук веников и Управление паром
            </h2>
            <p className="text-xs sm:text-sm text-stone-400 mt-0.5">
              Каждый раздел содержит собственную видеотеку с двумя подробными уроками.
            </p>
          </div>

          {/* Global Progress Badge */}
          <div className="flex items-center gap-3 bg-stone-950 px-4 py-2.5 rounded-2xl border border-stone-800 shrink-0 self-start sm:self-auto">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-stone-400">
                Изучено видеоуроков:
              </div>
              <div className="text-sm font-mono font-bold text-stone-100 flex items-center gap-1.5">
                <span className={totalStudied === 6 ? 'text-emerald-400' : 'text-amber-300'}>
                  {totalStudied} из 6 уроков
                </span>
                {isAllCompleted && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              </div>
            </div>
          </div>
        </div>

        {/* 3 Section Selector Buttons + "All" Toggle */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          
          {/* Button 1: Section 1 */}
          <button
            type="button"
            onClick={() => {
              setActiveTab(1);
              playWoodTap(soundEnabled);
            }}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
              activeTab === 1
                ? 'bg-amber-500/20 border-amber-400 text-amber-200 ring-2 ring-amber-400/40 shadow-md'
                : 'bg-stone-950/80 border-stone-800 text-stone-400 hover:border-stone-700 hover:text-stone-200'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-xl shrink-0">🥋</span>
              <div className="min-w-0">
                <div className="text-[10px] font-mono uppercase font-bold text-amber-400">
                  Видеотека 1
                </div>
                <div className="font-serif font-bold text-xs sm:text-sm text-stone-100 truncate">
                  Банное тай-чи
                </div>
              </div>
            </div>

            <div className="shrink-0 text-right">
              {section1.lessons.filter((l) => studiedLessons.includes(l.id)).length === 2 ? (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold">
                  2/2 ✓
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-stone-900 text-stone-400 border border-stone-800 text-[10px] font-mono">
                  {section1.lessons.filter((l) => studiedLessons.includes(l.id)).length}/2
                </span>
              )}
            </div>
          </button>

          {/* Button 2: Section 2 */}
          <button
            type="button"
            onClick={() => {
              setActiveTab(2);
              playWoodTap(soundEnabled);
            }}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
              activeTab === 2
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200 ring-2 ring-emerald-400/40 shadow-md'
                : 'bg-stone-950/80 border-stone-800 text-stone-400 hover:border-stone-700 hover:text-stone-200'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-xl shrink-0">🍃</span>
              <div className="min-w-0">
                <div className="text-[10px] font-mono uppercase font-bold text-emerald-400">
                  Видеотека 2
                </div>
                <div className="font-serif font-bold text-xs sm:text-sm text-stone-100 truncate">
                  Звук веников и ритм
                </div>
              </div>
            </div>

            <div className="shrink-0 text-right">
              {section2.lessons.filter((l) => studiedLessons.includes(l.id)).length === 2 ? (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold">
                  2/2 ✓
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-stone-900 text-stone-400 border border-stone-800 text-[10px] font-mono">
                  {section2.lessons.filter((l) => studiedLessons.includes(l.id)).length}/2
                </span>
              )}
            </div>
          </button>

          {/* Button 3: Section 3 */}
          <button
            type="button"
            onClick={() => {
              setActiveTab(3);
              playWoodTap(soundEnabled);
            }}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
              activeTab === 3
                ? 'bg-sky-500/20 border-sky-400 text-sky-200 ring-2 ring-sky-400/40 shadow-md'
                : 'bg-stone-950/80 border-stone-800 text-stone-400 hover:border-stone-700 hover:text-stone-200'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-xl shrink-0">💨</span>
              <div className="min-w-0">
                <div className="text-[10px] font-mono uppercase font-bold text-sky-400">
                  Видеотека 3
                </div>
                <div className="font-serif font-bold text-xs sm:text-sm text-stone-100 truncate">
                  Управление паром
                </div>
              </div>
            </div>

            <div className="shrink-0 text-right">
              {section3.lessons.filter((l) => studiedLessons.includes(l.id)).length === 2 ? (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold">
                  2/2 ✓
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-stone-900 text-stone-400 border border-stone-800 text-[10px] font-mono">
                  {section3.lessons.filter((l) => studiedLessons.includes(l.id)).length}/2
                </span>
              )}
            </div>
          </button>

        </div>
      </div>

      {/* ========================================================= */}
      {/* 3 STANDALONE VIDEOTHEQUES: TABBED OR ALL */}
      {/* ========================================================= */}

      {/* Section 1 Videotheque */}
      {(activeTab === 1 || activeTab === 'all') && (
        <SectionVideotheque
          section={section1}
          soundEnabled={soundEnabled}
          studiedLessons={studiedLessons}
          customVideos={customVideos}
          onMarkAsStudied={handleMarkAsStudied}
          onSaveCustomUrl={handleSaveCustomUrl}
          onClearCustomUrl={handleClearCustomUrl}
          onNextSection={() => {
            setActiveTab(2);
            playWoodTap(soundEnabled);
            window.scrollTo({ top: 300, behavior: 'smooth' });
          }}
          isFirstSection={true}
        />
      )}

      {/* Section 2 Videotheque */}
      {(activeTab === 2 || activeTab === 'all') && (
        <SectionVideotheque
          section={section2}
          soundEnabled={soundEnabled}
          studiedLessons={studiedLessons}
          customVideos={customVideos}
          onMarkAsStudied={handleMarkAsStudied}
          onSaveCustomUrl={handleSaveCustomUrl}
          onClearCustomUrl={handleClearCustomUrl}
          onPrevSection={() => {
            setActiveTab(1);
            playWoodTap(soundEnabled);
            window.scrollTo({ top: 300, behavior: 'smooth' });
          }}
          onNextSection={() => {
            setActiveTab(3);
            playWoodTap(soundEnabled);
            window.scrollTo({ top: 300, behavior: 'smooth' });
          }}
        />
      )}

      {/* Section 3 Videotheque */}
      {(activeTab === 3 || activeTab === 'all') && (
        <SectionVideotheque
          section={section3}
          soundEnabled={soundEnabled}
          studiedLessons={studiedLessons}
          customVideos={customVideos}
          onMarkAsStudied={handleMarkAsStudied}
          onSaveCustomUrl={handleSaveCustomUrl}
          onClearCustomUrl={handleClearCustomUrl}
          onPrevSection={() => {
            setActiveTab(2);
            playWoodTap(soundEnabled);
            window.scrollTo({ top: 300, behavior: 'smooth' });
          }}
          isLastSection={true}
        />
      )}

      {/* Celebration Banner */}
      {isAllCompleted && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-950/50 via-stone-900 to-emerald-950/40 border-2 border-amber-400/60 shadow-xl flex items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-2xl shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.35)]">
              👑
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase font-bold text-amber-400 tracking-wider">
                  Все 3 видеотеки пройдены!
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono font-bold">
                  6 ИЗ 6 УРОКОВ ОСВОЕНО ✓
                </span>
              </div>
              <h5 className="font-serif font-bold text-stone-100 text-sm sm:text-base mt-0.5">
                Вы изучили тай-чи, акустику веников и управление паром во всех трёх разделах!
              </h5>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
