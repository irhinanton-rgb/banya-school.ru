import React, { useState, useRef, useEffect } from 'react';
import {
  LEVEL5_VIDEO_SECTIONS,
  Level5VideoLesson,
  VideoSection,
} from '../../data/level5VideoData';
import { parseVideoSource } from '../../utils/videoUtils';
import { playSuccessChime, playWoodTap } from '../../utils/audio';
import { SecretChestModal } from '../inventory/SecretChestModal';
import { KeeperChallengeModal } from '../inventory/KeeperChallengeModal';
import { BadgeId } from '../../types/banya';
import confetti from 'canvas-confetti';
import {
  Play,
  CheckCircle2,
  Video,
  Sparkles,
  Layers,
  PlusCircle,
  Clock,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Key,
  Lock,
} from 'lucide-react';
import { TermTooltip } from '../TermTooltip';

interface BiomechanicsSteamSimulatorProps {
  soundEnabled: boolean;
  onGrantXp?: (amount: number) => void;
  onSuccess?: () => void;
  onTaiChiCompleted?: () => void;
  onSoundCompleted?: () => void;
  onSteamCompleted?: () => void;
  unlockedBadges?: BadgeId[];
  onUnlockBadge?: (badgeId: BadgeId, xp: number) => void;
}

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

  const otherLesson = section.lessons.find((l) => l.id !== selectedLesson.id);

  return (
    <div className="rounded-3xl border border-stone-800 bg-stone-900/95 p-5 sm:p-7 space-y-5 shadow-2xl animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
            <Video className="w-4 h-4 text-amber-400" />
            <span>Видеотека · Раздел {section.number} из 3</span>
          </div>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-100 mt-1">
            {section.icon} {section.title}
          </h3>
          <p className="text-xs sm:text-sm text-stone-400 mt-0.5">{section.subtitle}</p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {isSectionDone ? (
            <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold flex items-center gap-1.5">
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

      {/* Lesson Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {section.lessons.map((lesson) => {
          const isSelected = selectedLesson.id === lesson.id;
          const isItemStudied = studiedLessons.includes(lesson.id);

          return (
            <button
              key={lesson.id}
              type="button"
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
              ) : (
                <Video
                  className={`w-4 h-4 shrink-0 ${
                    isSelected ? 'text-stone-950' : 'text-amber-400'
                  }`}
                />
              )}
              <span className="text-xs sm:text-sm">{lesson.name}</span>
              <span
                className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
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

      {/* Two-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left: Video Player Frame */}
        <div className="lg:col-span-7 rounded-2xl border border-stone-800 bg-stone-950 p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden shadow-inner">
          <div className="w-full relative aspect-video rounded-xl overflow-hidden bg-stone-900 border border-stone-800/80 shadow-2xl flex flex-col items-center justify-center">
            {parsedVideo && (parsedVideo.type !== 'html5' || !videoError) ? (
              parsedVideo.type === 'html5' ? (
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
                <div className="relative z-10 flex flex-col items-center space-y-3 max-w-md">
                  <div className="h-14 w-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shadow-lg text-2xl">
                    {selectedLesson.sectionIcon}
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                      Урок {selectedLesson.lessonNumber} из 2 · Зона: {selectedLesson.zone}
                    </span>
                    <h4 className="font-serif text-base sm:text-xl font-bold text-stone-100 mt-1">
                      {selectedLesson.name}
                    </h4>
                    <p className="text-xs text-stone-300 mt-1.5 leading-relaxed">
                      {selectedLesson.execution}
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
              onSubmit={handleSubmitCustomUrl}
              className="mt-4 p-4 rounded-xl bg-stone-900 border border-amber-500/30 space-y-3"
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
                    Сбросить
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
            </form>
          )}

          {/* Clickable Timestamps under video */}
          {selectedLesson.timestamps.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-mono text-stone-400 flex items-center gap-1 mr-1">
                <Clock className="w-3 h-3 text-amber-400" /> Эпизоды:
              </span>
              {selectedLesson.timestamps.map((ts, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSeekTimestamp(ts.seconds)}
                  className="px-2.5 py-1 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-800 hover:border-amber-500/40 text-stone-300 text-[11px] font-mono transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span className="text-amber-400 font-bold">{ts.time}</span>
                  <span className="text-stone-400">{ts.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Bottom Bar */}
          <div className="mt-3 pt-3 border-t border-stone-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-stone-400 font-mono">
              <span>{selectedLesson.sectionIcon} Урок {selectedLesson.lessonNumber} из 2</span>
              <span>·</span>
              <span className="text-amber-300 font-semibold">{selectedLesson.zone}</span>
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
                <span>{isStudied ? 'Урок изучен ✓' : 'Изучено (+25 XP)'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Clean Lesson Card */}
        <div className="lg:col-span-5 rounded-2xl border border-stone-800 bg-stone-950/80 p-5 sm:p-6 space-y-4 flex flex-col justify-between shadow-lg">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <span className="text-xs font-mono uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                <span>Разбор урока {selectedLesson.lessonNumber} из 2</span>
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-stone-800 text-stone-300 font-mono">
                {selectedLesson.duration}
              </span>
            </div>

            <div>
              <h4 className="font-serif text-xl sm:text-2xl font-bold text-stone-100">
                {selectedLesson.title}
              </h4>
              <p className="text-xs sm:text-sm text-stone-300 mt-1.5 leading-relaxed">
                {selectedLesson.description}
              </p>
            </div>

            <div className="space-y-3 pt-1 text-xs">
              <div className="p-3 rounded-xl bg-amber-950/25 border border-amber-800/40 space-y-1">
                <strong className="text-amber-300 block font-semibold">
                  🎯 Главная цель:
                </strong>
                <p className="text-amber-100/90 leading-relaxed">{selectedLesson.purpose}</p>
              </div>

              <div className="p-3 rounded-xl bg-stone-900 border border-stone-800/80 space-y-1">
                <strong className="text-stone-200 block font-semibold">
                  👐 Как выполнять:
                </strong>
                <p className="text-stone-300 leading-relaxed">{selectedLesson.execution}</p>
              </div>

              <div className="p-3 rounded-xl bg-rose-950/25 border border-rose-800/40 space-y-1">
                <strong className="text-rose-300 block font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  <span>Частая ошибка:</span>
                </strong>
                <p className="text-rose-200/90 leading-relaxed">{selectedLesson.mistakes}</p>
              </div>
            </div>
          </div>

          {/* Quick switch to second lesson or next section */}
          <div className="pt-3 border-t border-stone-800 flex items-center justify-between gap-2">
            {otherLesson && selectedLesson.lessonNumber === 1 ? (
              <button
                type="button"
                onClick={() => {
                  if (!isStudied) onMarkAsStudied(selectedLesson.id);
                  handleSelectLesson(otherLesson);
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 border border-amber-500/30"
              >
                <span>Ко 2-му уроку раздела: {otherLesson.name}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : !isLastSection && onNextSection ? (
              <button
                type="button"
                onClick={() => {
                  if (!isStudied) onMarkAsStudied(selectedLesson.id);
                  onNextSection();
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Перейти к Видеотеке Раздела {section.number + 1} →</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <span className="text-xs font-mono text-emerald-400 font-bold">
                {isSectionDone ? 'Раздел полностью изучен ✓' : 'Отметьте урок после просмотра'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Section Footer Navigation */}
      {(!isFirstSection || !isLastSection) && (
        <div className="pt-2 flex items-center justify-between gap-3 border-t border-stone-800">
          <div>
            {!isFirstSection && onPrevSection ? (
              <button
                type="button"
                onClick={onPrevSection}
                className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 text-xs font-semibold border border-stone-800 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>К разделу {section.number - 1}</span>
              </button>
            ) : (
              <span className="text-[11px] font-mono text-stone-500">
                Раздел {section.number} из 3
              </span>
            )}
          </div>

          {!isLastSection && onNextSection && (
            <button
              type="button"
              onClick={onNextSection}
              className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-amber-300 text-xs font-semibold border border-stone-800 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>К разделу {section.number + 1}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export const BiomechanicsSteamSimulator: React.FC<BiomechanicsSteamSimulatorProps> = ({
  soundEnabled,
  onGrantXp,
  onSuccess,
  onTaiChiCompleted,
  onSoundCompleted,
  onSteamCompleted,
  unlockedBadges = [],
  onUnlockBadge,
}) => {
  const [activeTab, setActiveTab] = useState<1 | 2 | 3>(1);
  const [isChestModalOpen, setIsChestModalOpen] = useState<boolean>(false);
  const [isKeeperModalOpen, setIsKeeperModalOpen] = useState<boolean>(false);

  const hasGoldenKey =
    unlockedBadges.includes('golden_key') ||
    (typeof window !== 'undefined' && localStorage.getItem('banya_golden_key_awarded') === 'true');

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

    const sec1Done = LEVEL5_VIDEO_SECTIONS[0].lessons.every((l) => updated.includes(l.id));
    const sec2Done = LEVEL5_VIDEO_SECTIONS[1].lessons.every((l) => updated.includes(l.id));
    const sec3Done = LEVEL5_VIDEO_SECTIONS[2].lessons.every((l) => updated.includes(l.id));

    if (sec1Done && onTaiChiCompleted) onTaiChiCompleted();
    if (sec2Done && onSoundCompleted) onSoundCompleted();
    if (sec3Done && onSteamCompleted) onSteamCompleted();

    if (updated.length >= 6) {
      if (onSuccess) onSuccess();
      try {
        confetti({ particleCount: 80, spread: 90, origin: { y: 0.6 } });
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

  const handleKeyEarned = (badgeId: BadgeId, xp: number) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('banya_golden_key_awarded', 'true');
    }
    if (onUnlockBadge) {
      onUnlockBadge(badgeId, xp);
    }
    setTimeout(() => {
      setIsKeeperModalOpen(false);
      setIsChestModalOpen(true);
    }, 300);
  };

  const totalStudied = studiedLessons.length;

  const section1 = LEVEL5_VIDEO_SECTIONS[0];
  const section2 = LEVEL5_VIDEO_SECTIONS[1];
  const section3 = LEVEL5_VIDEO_SECTIONS[2];

  return (
    <div className="space-y-6">
      {/* ========================================================= */}
      {/* КРАТКАЯ СУТЬ УРОВНЯ 3 (ПОСЛЕДОВАТЕЛЬНО ПЕРЕД ВИДЕОТЕКОЙ) */}
      {/* ========================================================= */}
      <div className="rounded-3xl border border-stone-800 bg-stone-900/95 p-6 sm:p-8 space-y-4 shadow-xl">
        <div className="border-b border-stone-800 pb-4">
          <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">
            📖 Суть 3-го уровня · Продвинутая работа с веником и паром
          </span>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-100 mt-1">
            Как соединить отдельные движения в непрерывный поток тепла
          </h3>
          <p className="text-xs sm:text-sm text-stone-400 mt-0.5">
            На 2-м уровне вы изучили 8 базовых движений. Теперь разберём 3 главные задачи, которые превращают обычное махание веником в профессиональное парение:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs sm:text-sm text-stone-200 leading-relaxed">
          <div className="p-4 rounded-2xl bg-stone-950/80 border border-stone-800 space-y-1.5">
            <strong className="text-amber-300 block font-serif text-base">
              1. Ритмика и бархатный звук
            </strong>
            <p className="text-stone-300">
              Веники работают без пауз в ритме спокойного сердца (60–75 уд/мин) и ложатся всей плоскостью кроны — без хлестких ударов прутьями.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-stone-950/80 border border-stone-800 space-y-1.5">
            <strong className="text-emerald-300 block font-serif text-base">
              2. Точечный захват пара
            </strong>
            <p className="text-stone-300">
              Пар забирают из{' '}
              <TermTooltip
                title="Паровой пирог (+75...+85 °C)"
                text="Запас горячего, плотного пара, который скапливается под потолком парной после поддачи в каменку. Мастер черпает его вениками дозированно, не размывая по всей комнате."
              >
                подпотолочного пирога
              </TermTooltip>{' '}
              сложенными «лодочкой» вениками и опускают строго от стоп вверх.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-stone-950/80 border border-stone-800 space-y-1.5">
            <strong className="text-sky-300 block font-serif text-base">
              3. Удержание тепла на теле
            </strong>
            <p className="text-stone-300">
              Смена веников внахлёст (
              <TermTooltip
                title="«Двойной замок» (перехлёст веников)"
                text="Техника безотрывного парения: пока один веник уходит вверх за новой порцией пара, второй уже накрывает прогретый участок кожи, не давая телу остыть ни на секунду."
              >
                «двойной замок»
              </TermTooltip>
              ) и паровая утюжка направляют тепло на глубину 3–4 см.
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* TOP BAR: 3 Section Videotheques Switcher */}
      {/* ========================================================= */}
      <div className="rounded-2xl border border-stone-800 bg-stone-900/90 p-4 sm:p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Видеопрактикум приёмов по 3 разделам</span>
            </div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-100 mt-1">
              Выберите раздел видеотеки (по 2 видеоурока в каждом)
            </h2>
          </div>

          <div className="flex items-center gap-3 bg-stone-950 px-4 py-2 rounded-2xl border border-stone-800 shrink-0 self-start sm:self-auto">
            <div className="text-xs font-mono text-stone-300">
              Изучено видеоуроков:{' '}
              <span className={totalStudied === 6 ? 'text-emerald-400 font-bold' : 'text-amber-300 font-bold'}>
                {totalStudied} / 6
              </span>
            </div>
          </div>
        </div>

        {/* 3 Section Selector Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
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
              <span className="text-xl shrink-0">🥁</span>
              <div className="min-w-0">
                <div className="text-[10px] font-mono uppercase font-bold text-amber-400">
                  Видеотека 1
                </div>
                <div className="font-serif font-bold text-xs sm:text-sm text-stone-100 truncate">
                  Приёмы ритмики и звука
                </div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-stone-900 text-stone-300 border border-stone-800 text-[10px] font-mono">
              {section1.lessons.filter((l) => studiedLessons.includes(l.id)).length}/2
            </span>
          </button>

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
              <span className="text-xl shrink-0">💨</span>
              <div className="min-w-0">
                <div className="text-[10px] font-mono uppercase font-bold text-emerald-400">
                  Видеотека 2
                </div>
                <div className="font-serif font-bold text-xs sm:text-sm text-stone-100 truncate">
                  Приёмы захвата пара
                </div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-stone-900 text-stone-300 border border-stone-800 text-[10px] font-mono">
              {section2.lessons.filter((l) => studiedLessons.includes(l.id)).length}/2
            </span>
          </button>

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
              <span className="text-xl shrink-0">🔥</span>
              <div className="min-w-0">
                <div className="text-[10px] font-mono uppercase font-bold text-sky-400">
                  Видеотека 3
                </div>
                <div className="font-serif font-bold text-xs sm:text-sm text-stone-100 truncate">
                  Приёмы удержания пара
                </div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-stone-900 text-stone-300 border border-stone-800 text-[10px] font-mono">
              {section3.lessons.filter((l) => studiedLessons.includes(l.id)).length}/2
            </span>
          </button>
        </div>
      </div>

      {/* Active Section Videotheque */}
      {activeTab === 1 && (
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
          }}
          isFirstSection={true}
        />
      )}

      {activeTab === 2 && (
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
          }}
          onNextSection={() => {
            setActiveTab(3);
            playWoodTap(soundEnabled);
          }}
        />
      )}

      {activeTab === 3 && (
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
          }}
          isLastSection={true}
        />
      )}

      {/* ========================================================= */}
      {/* КОВАНЫЙ СУНДУК ТАЙНЫХ ЗНАНИЙ (ПРЯМО НА 3-М УРОВНЕ!) */}
      {/* ========================================================= */}
      <div className="rounded-3xl bg-gradient-to-r from-amber-950/40 via-stone-950 to-stone-900 border-2 border-amber-500/50 p-6 sm:p-7 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-start sm:items-center gap-4">
            <div
              onClick={() => setIsChestModalOpen(true)}
              className="w-16 h-16 rounded-2xl border-2 border-amber-400 bg-amber-500/20 flex items-center justify-center text-3xl shadow-lg shrink-0 cursor-pointer hover:scale-105 transition-transform"
            >
              🧰
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-mono uppercase font-bold tracking-wider">
                  Тайник 3-го уровня
                </span>
                {hasGoldenKey ? (
                  <span className="text-xs font-mono text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Золотой Ключ у вас
                  </span>
                ) : (
                  <span className="text-xs font-mono text-stone-400 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-amber-400" /> Нужен Золотой Ключ со 2-го уровня
                  </span>
                )}
              </div>
              <h4 className="font-serif text-lg sm:text-xl font-bold text-stone-100">
                Кованый Сундук Тайных Знаний
              </h4>
              <p className="text-xs sm:text-sm text-stone-300 max-w-2xl leading-relaxed">
                Внутри сундука — полное непрерывное видео связки всех 8 приёмов венечного массажа в едином потоке и секретная техника «Ледяное Дыхание в жару».
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                playWoodTap(soundEnabled);
                setIsChestModalOpen(true);
              }}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg flex items-center gap-2"
            >
              <Key className="w-4 h-4 text-stone-950" />
              <span>{hasGoldenKey ? 'Открыть Сундук Ключом' : 'Осмотреть Сундук'}</span>
            </button>
          </div>
        </div>
      </div>

      <SecretChestModal
        isOpen={isChestModalOpen}
        hasKey={hasGoldenKey}
        onClose={() => setIsChestModalOpen(false)}
        onOpenKeeperChallenge={() => {
          setIsChestModalOpen(false);
          setIsKeeperModalOpen(true);
        }}
        soundEnabled={soundEnabled}
      />

      <KeeperChallengeModal
        isOpen={isKeeperModalOpen}
        onClose={() => setIsKeeperModalOpen(false)}
        onUnlockKey={handleKeyEarned}
        soundEnabled={soundEnabled}
      />
    </div>
  );
};
