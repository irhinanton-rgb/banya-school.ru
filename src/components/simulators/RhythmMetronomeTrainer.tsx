import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Square,
  Volume2,
  Mic,
  MicOff,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  Music,
  Upload,
  Link2,
  Headphones,
  Sliders,
  Activity,
  Award,
} from 'lucide-react';
import { playSuccessChime } from '../../utils/audio';

export interface ReferenceRhythmPreset {
  id: string;
  name: string;
  subtitle: string;
  bpm: number;
  beatsPerBar: 2 | 3 | 4;
  patternLabels: string[];
  patternTypes: ('light' | 'accent' | 'priparka')[];
  description: string;
  defaultAudioUrl?: string;
}

export const LEVEL3_RHYTHM_PRESETS: ReferenceRhythmPreset[] = [
  {
    id: 'pendulum-2-4',
    name: 'Связка «Маятник» (2/4)',
    subtitle: 'Непрерывный двухдольный шаг двумя вениками',
    bpm: 68,
    beatsPerBar: 2,
    patternLabels: ['Раз (Левый веник)', 'Два (Правый веник)'],
    patternTypes: ['accent', 'light'],
    description:
      'Равномерный шаг без пауз: пока левый веник поднимается за тёплым паром, правый уже мягко ложится всей плоскостью кроны на спину гостя.',
    defaultAudioUrl: '/audio/reference-pendulum.mp3',
  },
  {
    id: 'troyka-3-4',
    name: 'Ритм «Тройка: Раз-Два-Припарка» (3/4)',
    subtitle: 'Фирменный вальсовый рисунок русской бани',
    bpm: 72,
    beatsPerBar: 3,
    patternLabels: ['Раз (Касание левым)', 'Два (Касание правым)', 'Три (Плотная припарка)'],
    patternTypes: ['light', 'light', 'priparka'],
    description:
      'Два лёгких подготавливающих касания с захватом пара на счёт «Раз-Два» и глубокий, плотный прижим обоих веников к телу на счёт «Три».',
    defaultAudioUrl: '/audio/reference-troyka.mp3',
  },
  {
    id: 'drob-4-4',
    name: 'Ритм «Мягкая Дробь» (4/4)',
    subtitle: 'Частая ритмичная работа кончиками веников',
    bpm: 108,
    beatsPerBar: 4,
    patternLabels: ['Раз (Акцент)', 'Два (Шелест)', 'Три (Шелест)', 'Четыре (Шелест)'],
    patternTypes: ['accent', 'light', 'light', 'light'],
    description:
      'Быстрая, упругая работа кончиками расслабленных веников. Чёткий акцент на первую долю такта и три мягких бархатных касания.',
    defaultAudioUrl: '/audio/reference-drob.mp3',
  },
];

interface RhythmMetronomeTrainerProps {
  soundEnabled: boolean;
  onGrantXp?: (amount: number) => void;
  activeLessonId?: string;
}

interface DetectedHit {
  timestamp: number;
  offsetMs: number; // relative to nearest target beat (- early, + late)
  intervalMs: number | null;
  amplitude: number;
}

let sharedAudioCtx: AudioContext | null = null;
function getAudioCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!sharedAudioCtx) {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) sharedAudioCtx = new AudioCtx();
  }
  if (sharedAudioCtx && sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume().catch(() => {});
  }
  return sharedAudioCtx;
}

/**
 * Classic mechanical metronome click (woodblock / pendulum escapement)
 */
function playClassicMetronomeClick(isAccent: boolean) {
  const ctx = getAudioCtx();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    // Short crisp wooden click
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    const baseFreq = isAccent ? 1150 : 780;
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.035);

    gain.gain.setValueAtTime(isAccent ? 0.42 : 0.26, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.045);
  } catch {
    // ignore audio error
  }
}

/**
 * Realistic acoustic synthesis of a banya broom stroke for the Reference Audio Player
 * Supports 'light' (soft leaf rustle), 'accent' (full crown stroke), and 'priparka' (deep warm press)
 */
function playAcousticBroomStroke(strokeType: 'light' | 'accent' | 'priparka') {
  const ctx = getAudioCtx();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const duration = strokeType === 'priparka' ? 0.34 : strokeType === 'accent' ? 0.2 : 0.14;

    // 1. Leaf rustle (filtered pink-ish noise)
    const sampleCount = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, sampleCount, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < sampleCount; i++) {
      const env = Math.sin((i / sampleCount) * Math.PI);
      data[i] = (Math.random() * 2 - 1) * env;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(
      strokeType === 'priparka' ? 680 : strokeType === 'accent' ? 1100 : 1450,
      now
    );
    filter.Q.setValueAtTime(strokeType === 'priparka' ? 1.1 : 1.6, now);

    const noiseGain = ctx.createGain();
    const peakGain = strokeType === 'priparka' ? 0.36 : strokeType === 'accent' ? 0.28 : 0.18;
    noiseGain.gain.setValueAtTime(0.01, now);
    noiseGain.gain.linearRampToValueAtTime(peakGain, now + 0.025);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    noise.start(now);
    noise.stop(now + duration);

    // 2. Warm low body contact thump
    const bodyOsc = ctx.createOscillator();
    const bodyGain = ctx.createGain();
    bodyOsc.type = 'sine';
    bodyOsc.frequency.setValueAtTime(
      strokeType === 'priparka' ? 135 : strokeType === 'accent' ? 165 : 210,
      now
    );
    bodyOsc.frequency.exponentialRampToValueAtTime(52, now + (strokeType === 'priparka' ? 0.22 : 0.1));

    bodyGain.gain.setValueAtTime(
      strokeType === 'priparka' ? 0.38 : strokeType === 'accent' ? 0.24 : 0.12,
      now
    );
    bodyGain.gain.exponentialRampToValueAtTime(0.001, now + (strokeType === 'priparka' ? 0.24 : 0.11));

    bodyOsc.connect(bodyGain);
    bodyGain.connect(ctx.destination);

    bodyOsc.start(now);
    bodyOsc.stop(now + (strokeType === 'priparka' ? 0.25 : 0.12));
  } catch {
    // ignore audio error
  }
}

function getTempoLabel(bpm: number): string {
  if (bpm < 56) return 'Largo · Медленное опахивание';
  if (bpm <= 76) return 'Andante · Спокойный пульс (Маятник / Тройка)';
  if (bpm <= 98) return 'Moderato · Активный рабочий шаг';
  return 'Allegro · Темп мелкой дроби и вибраций';
}

export const RhythmMetronomeTrainer: React.FC<RhythmMetronomeTrainerProps> = ({
  soundEnabled,
  onGrantXp,
  activeLessonId,
}) => {
  // 1. Selected Reference Preset
  const [selectedPresetId, setSelectedPresetId] = useState<string>('pendulum-2-4');
  const activePreset =
    LEVEL3_RHYTHM_PRESETS.find((p) => p.id === selectedPresetId) || LEVEL3_RHYTHM_PRESETS[0];

  // Sync preset when user switches lesson in Section 1 of Level 3
  useEffect(() => {
    if (activeLessonId === 'l5-rhythm-troyka') {
      setSelectedPresetId('troyka-3-4');
      setBpm(72);
      setBeatsPerBar(3);
    } else if (activeLessonId === 'l5-rhythm-pendulum') {
      setSelectedPresetId('pendulum-2-4');
      setBpm(68);
      setBeatsPerBar(2);
    }
  }, [activeLessonId]);

  // 2. Classic Metronome State
  const [bpm, setBpm] = useState<number>(68);
  const [beatsPerBar, setBeatsPerBar] = useState<2 | 3 | 4>(2);
  const [metronomeSoundMode, setMetronomeSoundMode] = useState<'click' | 'broom'>('click');
  const [isMetronomeRunning, setIsMetronomeRunning] = useState<boolean>(false);
  const [currentBeatIndex, setCurrentBeatIndex] = useState<number>(0);
  const [pendulumSide, setPendulumSide] = useState<'left' | 'right'>('left');

  // 3. Reference Audio Player State
  const [isReferencePlaying, setIsReferencePlaying] = useState<boolean>(false);
  const [referenceBeatStep, setReferenceBeatStep] = useState<number>(0);
  const [customAudioUrls, setCustomAudioUrls] = useState<Record<string, string>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('banya_level3_reference_audio');
        if (saved) return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return {};
  });
  const [showAudioConfig, setShowAudioConfig] = useState<boolean>(false);
  const [audioUrlInput, setAudioUrlInput] = useState<string>('');
  const htmlAudioRef = useRef<HTMLAudioElement | null>(null);

  // 4. Microphone Skill Check State
  const TARGET_HITS_COUNT = 8;
  const [isMicListening, setIsMicListening] = useState<boolean>(false);
  const [micWithMetronome, setMicWithMetronome] = useState<boolean>(true);
  const [micSensitivity, setMicSensitivity] = useState<number>(32); // 10..80 threshold
  const [liveMicLevel, setLiveMicLevel] = useState<number>(0);
  const [micError, setMicError] = useState<string | null>(null);
  const [detectedHits, setDetectedHits] = useState<DetectedHit[]>([]);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [isPlayingRecorded, setIsPlayingRecorded] = useState<boolean>(false);
  const [isComparingBoth, setIsComparingBoth] = useState<boolean>(false);
  const [completedPresets, setCompletedPresets] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('banya_level3_metronome_xp');
        if (saved) return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return [];
  });

  // Refs for timers & Web Audio microphone analysis
  const metronomeTimerRef = useRef<number | null>(null);
  const referenceTimerRef = useRef<number | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const rafIdRef = useRef<number | null>(null);
  const lastPeakTimeRef = useRef<number>(0);
  const sessionStartTimeRef = useRef<number>(0);
  const recordedPlayerRef = useRef<HTMLAudioElement | null>(null);

  const beatIntervalMs = Math.round(60000 / bpm);

  // Stop all audio / mic on unmount
  const stopMicrophoneSession = useCallback((finalizeRecording = true) => {
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== 'inactive'
    ) {
      try {
        if (finalizeRecording) {
          mediaRecorderRef.current.stop();
        }
      } catch {
        // ignore
      }
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
    }
    setIsMicListening(false);
    setLiveMicLevel(0);
  }, []);

  useEffect(() => {
    return () => {
      if (metronomeTimerRef.current) window.clearInterval(metronomeTimerRef.current);
      if (referenceTimerRef.current) window.clearInterval(referenceTimerRef.current);
      stopMicrophoneSession(false);
    };
  }, [stopMicrophoneSession]);

  // Classic Metronome Loop
  useEffect(() => {
    if (!isMetronomeRunning) {
      if (metronomeTimerRef.current) {
        window.clearInterval(metronomeTimerRef.current);
        metronomeTimerRef.current = null;
      }
      return;
    }

    let step = 0;
    const triggerTick = () => {
      const beatInBar = step % beatsPerBar;
      setCurrentBeatIndex(beatInBar);
      setPendulumSide(step % 2 === 0 ? 'left' : 'right');

      if (metronomeSoundMode === 'click') {
        playClassicMetronomeClick(beatInBar === 0);
      } else {
        playAcousticBroomStroke(beatInBar === 0 ? 'accent' : 'light');
      }
      step += 1;
    };

    triggerTick();
    metronomeTimerRef.current = window.setInterval(triggerTick, beatIntervalMs);

    return () => {
      if (metronomeTimerRef.current) {
        window.clearInterval(metronomeTimerRef.current);
        metronomeTimerRef.current = null;
      }
    };
  }, [isMetronomeRunning, beatIntervalMs, beatsPerBar, metronomeSoundMode]);

  // Reference Audio Loop (Acoustic Pattern Synthesis + Optional HTML5 Audio)
  useEffect(() => {
    if (!isReferencePlaying) {
      if (referenceTimerRef.current) {
        window.clearInterval(referenceTimerRef.current);
        referenceTimerRef.current = null;
      }
      if (htmlAudioRef.current) {
        htmlAudioRef.current.pause();
        htmlAudioRef.current.currentTime = 0;
      }
      return;
    }

    const customUrl = customAudioUrls[activePreset.id];
    const presetIntervalMs = Math.round(60000 / activePreset.bpm);

    // If user uploaded/linked a real audio file, try playing it alongside the beat indicator
    if (customUrl && htmlAudioRef.current) {
      htmlAudioRef.current.src = customUrl;
      htmlAudioRef.current.loop = true;
      htmlAudioRef.current.play().catch(() => {
        // Fallback to synthesized acoustic broom strokes if file fails to load
      });
    }

    let step = 0;
    const triggerReferenceBeat = () => {
      const idx = step % activePreset.beatsPerBar;
      setReferenceBeatStep(idx);
      const strokeType = activePreset.patternTypes[idx] || 'light';

      // Play realistic acoustic broom stroke if no custom audio is actively playing
      const hasActiveCustomAudio =
        customUrl && htmlAudioRef.current && !htmlAudioRef.current.paused && !htmlAudioRef.current.error;
      if (!hasActiveCustomAudio) {
        playAcousticBroomStroke(strokeType);
      }
      step += 1;
    };

    triggerReferenceBeat();
    referenceTimerRef.current = window.setInterval(triggerReferenceBeat, presetIntervalMs);

    return () => {
      if (referenceTimerRef.current) {
        window.clearInterval(referenceTimerRef.current);
        referenceTimerRef.current = null;
      }
    };
  }, [isReferencePlaying, activePreset, customAudioUrls]);

  // Select Preset handler
  const handleSelectPreset = (preset: ReferenceRhythmPreset) => {
    setSelectedPresetId(preset.id);
    setBpm(preset.bpm);
    setBeatsPerBar(preset.beatsPerBar);
    setAudioUrlInput(customAudioUrls[preset.id] || '');
    setIsReferencePlaying(false);
  };

  // Save custom audio file or URL for Reference Preset
  const handleSaveCustomAudioUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = audioUrlInput.trim();
    if (!trimmed) return;
    const updated = { ...customAudioUrls, [activePreset.id]: trimmed };
    setCustomAudioUrls(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('banya_level3_reference_audio', JSON.stringify(updated));
    }
    setShowAudioConfig(false);
    playSuccessChime(soundEnabled);
  };

  const handleUploadAudioFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    const updated = { ...customAudioUrls, [activePreset.id]: objectUrl };
    setCustomAudioUrls(updated);
    setAudioUrlInput(file.name);
    setShowAudioConfig(false);
    playSuccessChime(soundEnabled);
  };

  const handleClearCustomAudio = () => {
    const updated = { ...customAudioUrls };
    delete updated[activePreset.id];
    setCustomAudioUrls(updated);
    setAudioUrlInput('');
    if (typeof window !== 'undefined') {
      localStorage.setItem('banya_level3_reference_audio', JSON.stringify(updated));
    }
  };

  // Award XP when completing a preset's skill check
  const awardSkillCheckXp = useCallback(
    (presetId: string) => {
      if (!completedPresets.includes(presetId)) {
        const updated = [...completedPresets, presetId];
        setCompletedPresets(updated);
        if (typeof window !== 'undefined') {
          localStorage.setItem('banya_level3_metronome_xp', JSON.stringify(updated));
        }
        if (onGrantXp) onGrantXp(30);
      }
      playSuccessChime(soundEnabled);
    },
    [completedPresets, onGrantXp, soundEnabled]
  );

  // Register a single hit (either detected from Microphone transient peak OR manual fallback)
  const registerStrokeHit = useCallback(
    (amplitude: number) => {
      const now = performance.now();
      // Debounce minimum 230ms between broom strokes so a single rustle doesn't count twice
      if (now - lastPeakTimeRef.current < 230) return;
      lastPeakTimeRef.current = now;

      setDetectedHits((prev) => {
        if (prev.length >= TARGET_HITS_COUNT) return prev;

        const prevHit = prev.length > 0 ? prev[prev.length - 1] : null;
        const intervalMs = prevHit ? Math.round(now - prevHit.timestamp) : null;

        // Calculate offset to nearest target beat grid from first hit
        let offsetMs = 0;
        if (prev.length === 0) {
          sessionStartTimeRef.current = now;
          offsetMs = 0;
        } else {
          const elapsed = now - sessionStartTimeRef.current;
          const nearestBeatCount = Math.round(elapsed / beatIntervalMs);
          const expectedTime = nearestBeatCount * beatIntervalMs;
          offsetMs = Math.round(elapsed - expectedTime);
        }

        const nextHits = [
          ...prev,
          {
            timestamp: now,
            offsetMs,
            intervalMs,
            amplitude,
          },
        ];

        if (nextHits.length >= TARGET_HITS_COUNT) {
          // Completed 8 hits! Stop mic session cleanly
          setTimeout(() => {
            stopMicrophoneSession(true);
            awardSkillCheckXp(activePreset.id);
          }, 180);
        }

        return nextHits;
      });
    },
    [beatIntervalMs, stopMicrophoneSession, awardSkillCheckXp, activePreset.id]
  );

  // Start Live Microphone Skill Verification
  const startMicrophoneCheck = async () => {
    setMicError(null);
    setDetectedHits([]);
    setRecordedAudioUrl(null);
    setIsComparingBoth(false);
    lastPeakTimeRef.current = 0;

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setMicError(
        'Ваш браузер не поддерживает прямой доступ к микрофону. Вы можете отработать ритм кнопкой «Удар веником» ниже.'
      );
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });
      micStreamRef.current = stream;

      // Start MediaRecorder so student can play back their real audio
      recordedChunksRef.current = [];
      try {
        const recorder = new MediaRecorder(stream);
        recorder.ondataavailable = (ev) => {
          if (ev.data && ev.data.size > 0) {
            recordedChunksRef.current.push(ev.data);
          }
        };
        recorder.onstop = () => {
          if (recordedChunksRef.current.length > 0) {
            const blob = new Blob(recordedChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
            const url = URL.createObjectURL(blob);
            setRecordedAudioUrl(url);
          }
        };
        recorder.start();
        mediaRecorderRef.current = recorder;
      } catch {
        // MediaRecorder optional if unsupported on some older browsers
      }

      // Connect stream to Web Audio AnalyserNode for peak / transient detection
      const ctx = getAudioCtx();
      if (!ctx) throw new Error('AudioContext недоступен');

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.25;
      source.connect(analyser);

      const timeData = new Uint8Array(analyser.fftSize);
      setIsMicListening(true);

      // Turn on metronome if student requested background beat
      if (micWithMetronome && !isMetronomeRunning) {
        setIsMetronomeRunning(true);
      }

      const detectLoop = () => {
        if (!micStreamRef.current) return;
        analyser.getByteTimeDomainData(timeData);

        // Compute peak amplitude (0..100)
        let maxDeviation = 0;
        for (let i = 0; i < timeData.length; i++) {
          const deviation = Math.abs(timeData[i] - 128);
          if (deviation > maxDeviation) maxDeviation = deviation;
        }
        const normalizedLevel = Math.min(100, Math.round((maxDeviation / 128) * 140));
        setLiveMicLevel(normalizedLevel);

        if (normalizedLevel >= micSensitivity) {
          registerStrokeHit(normalizedLevel);
        }

        rafIdRef.current = requestAnimationFrame(detectLoop);
      };

      rafIdRef.current = requestAnimationFrame(detectLoop);
    } catch {
      setMicError(
        'Доступ к микрофону не предоставлен. Разрешите использование микрофона в браузере или используйте кнопку ручного ввода ниже.'
      );
      setIsMicListening(false);
    }
  };

  // Compare Recorded Microphone Audio + Reference Rhythm simultaneously
  const handlePlayRecordedOnly = () => {
    if (!recordedAudioUrl || !recordedPlayerRef.current) return;
    if (isPlayingRecorded) {
      recordedPlayerRef.current.pause();
      recordedPlayerRef.current.currentTime = 0;
      setIsPlayingRecorded(false);
      return;
    }
    setIsComparingBoth(false);
    setIsReferencePlaying(false);
    recordedPlayerRef.current.src = recordedAudioUrl;
    recordedPlayerRef.current.onended = () => setIsPlayingRecorded(false);
    setIsPlayingRecorded(true);
    recordedPlayerRef.current.play().catch(() => setIsPlayingRecorded(false));
  };

  const handleCompareWithReference = () => {
    if (isComparingBoth) {
      setIsComparingBoth(false);
      setIsReferencePlaying(false);
      if (recordedPlayerRef.current) {
        recordedPlayerRef.current.pause();
        recordedPlayerRef.current.currentTime = 0;
      }
      setIsPlayingRecorded(false);
      return;
    }

    setIsComparingBoth(true);
    setIsMetronomeRunning(false);
    setIsReferencePlaying(true);

    if (recordedAudioUrl && recordedPlayerRef.current) {
      recordedPlayerRef.current.src = recordedAudioUrl;
      recordedPlayerRef.current.onended = () => {
        setIsPlayingRecorded(false);
        setIsComparingBoth(false);
        setIsReferencePlaying(false);
      };
      setIsPlayingRecorded(true);
      recordedPlayerRef.current.play().catch(() => {});
    } else {
      // Replay detected hits over the reference rhythm if no raw audio blob
      const firstTs = detectedHits[0]?.timestamp || 0;
      detectedHits.forEach((hit) => {
        const delay = Math.max(0, hit.timestamp - firstTs);
        window.setTimeout(() => {
          playClassicMetronomeClick(true);
        }, delay);
      });
      const totalDuration =
        detectedHits.length > 1
          ? detectedHits[detectedHits.length - 1].timestamp - firstTs + 800
          : 4000;
      window.setTimeout(() => {
        setIsComparingBoth(false);
        setIsReferencePlaying(false);
      }, totalDuration);
    }
  };

  // Compute Student Metrics
  const intervals = detectedHits
    .map((h) => h.intervalMs)
    .filter((v): v is number => v !== null && v > 150 && v < 2500);

  const avgIntervalMs =
    intervals.length > 0
      ? Math.round(intervals.reduce((acc, v) => acc + v, 0) / intervals.length)
      : 0;

  const studentBpm = avgIntervalMs > 0 ? Math.round(60000 / avgIntervalMs) : 0;

  const avgDeviationMs =
    intervals.length > 0
      ? Math.round(
          intervals.reduce((acc, v) => acc + Math.abs(v - beatIntervalMs), 0) /
            intervals.length
        )
      : 0;

  const accuracyPercent =
    intervals.length > 0
      ? Math.max(
          0,
          Math.min(100, Math.round((1 - avgDeviationMs / (beatIntervalMs * 0.55)) * 100))
        )
      : 0;

  // Pendulum swing angle calculation (-28deg to +28deg)
  const pendulumAngle = isMetronomeRunning ? (pendulumSide === 'left' ? -26 : 26) : 0;
  // Weight position on the pendulum rod (higher BPM = lower weight on rod, classic mechanical physics)
  const weightPercent = Math.min(82, Math.max(18, ((bpm - 40) / (160 - 40)) * 64 + 18));

  return (
    <div className="rounded-3xl border-2 border-amber-500/35 bg-gradient-to-b from-stone-900 via-stone-950 to-stone-900 p-5 sm:p-7 space-y-6 shadow-2xl">
      {/* Hidden audio elements for custom reference & recorded microphone playback */}
      <audio ref={htmlAudioRef} className="hidden" preload="none" />
      <audio ref={recordedPlayerRef} className="hidden" />

      {/* ================================================================= */}
      {/* HEADER                                                            */}
      {/* ================================================================= */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-stone-800 pb-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-mono uppercase font-bold tracking-wider">
              🥁 Практикум 3-го уровня · Метроном и Эталон Звука
            </span>
            {completedPresets.includes(activePreset.id) && (
              <span className="text-xs font-mono text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Навык проверен (+30 XP)
              </span>
            )}
          </div>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-100">
            Классический метроном, эталонные аудиозаписи и проверка через микрофон
          </h3>
          <p className="text-xs sm:text-sm text-stone-400 leading-relaxed">
            Включите классический метроном для постановки темпа, прослушайте эталонное звучание приёма и включите микрофон, чтобы проверить реальную работу своих веников.
          </p>
        </div>

        {/* Preset Switcher Pills */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {LEVEL3_RHYTHM_PRESETS.map((preset) => {
            const isSelected = preset.id === activePreset.id;
            const isDone = completedPresets.includes(preset.id);
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-amber-500 text-stone-950 border-amber-400 font-bold shadow-md'
                    : 'bg-stone-900 hover:bg-stone-800 text-stone-300 border-stone-800'
                }`}
              >
                {isDone && (
                  <CheckCircle2
                    className={`w-3.5 h-3.5 ${isSelected ? 'text-stone-950' : 'text-emerald-400'}`}
                  />
                )}
                <span>{preset.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ================================================================= */}
      {/* TOP GRID: 1. CLASSIC METRONOME  |  2. REFERENCE AUDIO RECORDINGS  */}
      {/* ================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* LEFT COLUMN (6 cols): CLASSIC MECHANICAL METRONOME */}
        <div className="lg:col-span-6 rounded-2xl border border-stone-800 bg-stone-950/90 p-5 flex flex-col justify-between space-y-5 shadow-inner">
          <div className="flex items-center justify-between border-b border-stone-800/80 pb-3">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-bold block">
                1. Классический метроном
              </span>
              <h4 className="font-serif text-base sm:text-lg font-bold text-stone-100">
                Механический маятник темпа
              </h4>
            </div>

            {/* Sound selector: Classic Click vs Leaf Rustle */}
            <div className="flex items-center gap-1 bg-stone-900 p-1 rounded-xl border border-stone-800">
              <button
                type="button"
                onClick={() => setMetronomeSoundMode('click')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-colors cursor-pointer ${
                  metronomeSoundMode === 'click'
                    ? 'bg-amber-500 text-stone-950 font-bold'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                Щелчок
              </button>
              <button
                type="button"
                onClick={() => setMetronomeSoundMode('broom')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-colors cursor-pointer ${
                  metronomeSoundMode === 'broom'
                    ? 'bg-amber-500 text-stone-950 font-bold'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                Шелест
              </button>
            </div>
          </div>

          {/* Visual Classic Metronome Tower & Swinging Pendulum */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
            {/* Pyramid Metronome Graphic */}
            <div className="sm:col-span-5 flex flex-col items-center justify-center">
              <div className="relative w-36 h-44 flex flex-col items-center justify-end">
                {/* Wooden Pyramid Body */}
                <div
                  className="w-32 h-40 rounded-t-3xl rounded-b-xl border-2 border-amber-700/60 bg-gradient-to-b from-amber-950/60 via-stone-900 to-stone-950 shadow-xl flex flex-col items-center justify-between p-3 relative overflow-hidden"
                >
                  {/* Scale markings behind the rod */}
                  <div className="w-full flex flex-col items-center space-y-1 text-[8px] font-mono text-stone-500 select-none pt-1">
                    <span>40 · LARGO</span>
                    <span>60 · ANDANTE</span>
                    <span>76 · MODERATO</span>
                    <span>108 · ALLEGRO</span>
                    <span>140 · PRESTO</span>
                  </div>

                  {/* Pivot Base */}
                  <div className="w-6 h-3 rounded-t-full bg-amber-500/80 border border-amber-300 z-20" />
                </div>

                {/* Swinging Pendulum Rod */}
                <div
                  style={{
                    transform: `rotate(${pendulumAngle}deg)`,
                    transitionDuration: isMetronomeRunning ? `${beatIntervalMs}ms` : '250ms',
                    transitionTimingFunction: 'cubic-bezier(0.42, 0, 0.58, 1)',
                  }}
                  className="absolute bottom-3 w-1.5 h-36 bg-gradient-to-t from-amber-400 via-stone-300 to-amber-200 rounded-full origin-bottom z-10 shadow-md"
                >
                  {/* Movable Brass Weight on the Rod */}
                  <div
                    style={{ top: `${weightPercent}%` }}
                    className="absolute -left-2.5 w-6 h-4 rounded-sm bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-500 border border-amber-900 shadow-md"
                  />
                </div>
              </div>
            </div>

            {/* BPM Readout & Controls */}
            <div className="sm:col-span-7 space-y-3">
              <div className="p-3.5 rounded-2xl bg-stone-900/90 border border-stone-800 text-center space-y-1">
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-3xl sm:text-4xl font-mono font-bold text-amber-300">
                    {bpm}
                  </span>
                  <span className="text-xs font-mono uppercase text-stone-400">
                    уд/мин (BPM)
                  </span>
                </div>
                <div className="text-[11px] font-mono text-stone-400">
                  {getTempoLabel(bpm)}
                </div>
              </div>

              {/* Fine BPM Adjustment Buttons + Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-1.5">
                  <button
                    type="button"
                    onClick={() => setBpm((b) => Math.max(40, b - 5))}
                    className="px-2.5 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 text-xs font-mono border border-stone-800 cursor-pointer"
                  >
                    -5
                  </button>
                  <button
                    type="button"
                    onClick={() => setBpm((b) => Math.max(40, b - 1))}
                    className="px-2.5 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 text-xs font-mono border border-stone-800 cursor-pointer"
                  >
                    -1
                  </button>
                  <input
                    type="range"
                    min={40}
                    max={160}
                    value={bpm}
                    onChange={(e) => setBpm(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={() => setBpm((b) => Math.min(160, b + 1))}
                    className="px-2.5 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 text-xs font-mono border border-stone-800 cursor-pointer"
                  >
                    +1
                  </button>
                  <button
                    type="button"
                    onClick={() => setBpm((b) => Math.min(160, b + 5))}
                    className="px-2.5 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 text-xs font-mono border border-stone-800 cursor-pointer"
                  >
                    +5
                  </button>
                </div>

                {/* Time Signature Selector */}
                <div className="flex items-center justify-between gap-2 pt-1">
                  <span className="text-[11px] font-mono text-stone-400">Размер такта:</span>
                  <div className="flex items-center gap-1.5">
                    {([2, 3, 4] as const).map((sig) => (
                      <button
                        key={sig}
                        type="button"
                        onClick={() => setBeatsPerBar(sig)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono border transition-colors cursor-pointer ${
                          beatsPerBar === sig
                            ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                            : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
                        }`}
                      >
                        {sig}/4
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Beat Indicator Bulbs */}
              <div className="flex items-center justify-center gap-2.5 pt-1">
                {Array.from({ length: beatsPerBar }).map((_, idx) => {
                  const isActive = isMetronomeRunning && currentBeatIndex === idx;
                  const isAccent = idx === 0;
                  return (
                    <div
                      key={idx}
                      className={`flex-1 py-2 rounded-xl border text-center font-mono text-xs transition-all ${
                        isActive
                          ? isAccent
                            ? 'bg-amber-500 text-stone-950 font-bold border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.5)] scale-105'
                            : 'bg-emerald-500 text-stone-950 font-bold border-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.4)] scale-105'
                          : 'bg-stone-900/80 border-stone-800 text-stone-500'
                      }`}
                    >
                      {idx + 1} {isAccent ? '(Акцент)' : 'доля'}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Start / Stop Metronome Button */}
          <button
            type="button"
            onClick={() => {
              setIsReferencePlaying(false);
              setIsMetronomeRunning((prev) => !prev);
            }}
            className={`w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md ${
              isMetronomeRunning
                ? 'bg-rose-600 hover:bg-rose-500 text-white'
                : 'bg-amber-500 hover:bg-amber-400 text-stone-950'
            }`}
          >
            {isMetronomeRunning ? (
              <>
                <Square className="w-4 h-4 fill-current" />
                <span>Остановить метроном</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Запустить классический метроном ({bpm} BPM)</span>
              </>
            )}
          </button>
        </div>

        {/* RIGHT COLUMN (6 cols): REFERENCE AUDIO RECORDINGS OF TECHNIQUES */}
        <div className="lg:col-span-6 rounded-2xl border border-stone-800 bg-stone-950/90 p-5 flex flex-col justify-between space-y-4 shadow-inner">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-stone-800/80 pb-3">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-bold block">
                  2. Аудиозаписи эталонного приёма
                </span>
                <h4 className="font-serif text-base sm:text-lg font-bold text-stone-100">
                  {activePreset.name} · {activePreset.bpm} BPM
                </h4>
              </div>

              <button
                type="button"
                onClick={() => setShowAudioConfig((prev) => !prev)}
                className="px-2.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-amber-300 text-[11px] font-mono flex items-center gap-1.5 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{customAudioUrls[activePreset.id] ? 'Свой аудиофайл ✓' : 'Свой MP3/WAV'}</span>
              </button>
            </div>

            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              {activePreset.description}
            </p>

            {/* Optional Custom Audio File / Link Uploader for Reference Track */}
            {showAudioConfig && (
              <div className="p-3.5 rounded-xl bg-stone-900 border border-amber-500/40 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-amber-300 flex items-center gap-1.5">
                    <Music className="w-3.5 h-3.5" />
                    <span>Подключить запись эталона для «{activePreset.name}»:</span>
                  </span>
                  {customAudioUrls[activePreset.id] && (
                    <button
                      type="button"
                      onClick={handleClearCustomAudio}
                      className="text-rose-400 hover:text-rose-300 underline text-[11px] cursor-pointer"
                    >
                      Сбросить на встроенный синтез
                    </button>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <label className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-stone-950 hover:bg-stone-800 border border-stone-700 text-stone-200 cursor-pointer transition-colors">
                    <Upload className="w-3.5 h-3.5 text-amber-400" />
                    <span>Выбрать файл (.mp3 / .wav)</span>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={handleUploadAudioFile}
                      className="hidden"
                    />
                  </label>
                </div>

                <form onSubmit={handleSaveCustomAudioUrl} className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Link2 className="w-3.5 h-3.5 text-stone-500 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      value={audioUrlInput}
                      onChange={(e) => setAudioUrlInput(e.target.value)}
                      placeholder="Или прямая ссылка на аудио: /audio/troyka.mp3"
                      className="w-full bg-stone-950 border border-stone-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-stone-200 font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs cursor-pointer"
                  >
                    Сохранить
                  </button>
                </form>
              </div>
            )}

            {/* Visual Rhythm Score of the Reference Technique */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-[11px] font-mono text-stone-400">
                <span>Ритмический рисунок эталона ({activePreset.beatsPerBar}/4):</span>
                <span className="text-emerald-400">
                  {customAudioUrls[activePreset.id]
                    ? '🎵 Подключена внешняя аудиозапись'
                    : '🌿 Акустическая модель шелеста веников'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {activePreset.patternLabels.map((label, idx) => {
                  const strokeType = activePreset.patternTypes[idx];
                  const isActiveBeat = isReferencePlaying && referenceBeatStep === idx;
                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border transition-all flex flex-col justify-between ${
                        isActiveBeat
                          ? 'bg-emerald-500/25 border-emerald-400 text-emerald-200 shadow-[0_0_18px_rgba(16,185,129,0.35)] scale-[1.02]'
                          : 'bg-stone-900/90 border-stone-800 text-stone-300'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono uppercase">
                        <span className="text-amber-400 font-bold">Счёт {idx + 1}</span>
                        <span
                          className={`px-1.5 py-0.5 rounded ${
                            strokeType === 'priparka'
                              ? 'bg-amber-500/20 text-amber-300'
                              : strokeType === 'accent'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-stone-800 text-stone-400'
                          }`}
                        >
                          {strokeType === 'priparka'
                            ? 'Припарка'
                            : strokeType === 'accent'
                            ? 'Акцент'
                            : 'Касание'}
                        </span>
                      </div>
                      <div className="font-serif font-bold text-xs sm:text-sm text-stone-100 mt-1.5">
                        {label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Play / Stop Reference Audio Button */}
          <div className="space-y-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setIsMetronomeRunning(false);
                setIsReferencePlaying((prev) => !prev);
              }}
              className={`w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md ${
                isReferencePlaying
                  ? 'bg-rose-600 hover:bg-rose-500 text-white'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-stone-950'
              }`}
            >
              {isReferencePlaying ? (
                <>
                  <Square className="w-4 h-4 fill-current" />
                  <span>Остановить эталонную запись</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4" />
                  <span>Прослушать эталонный приём «{activePreset.name}»</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* BOTTOM SECTION: 3. LIVE MICROPHONE SKILL CHECK & COMPARISON       */}
      {/* ================================================================= */}
      <div className="rounded-2xl border border-amber-500/30 bg-stone-950/95 p-5 sm:p-6 space-y-5 shadow-inner">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-800 pb-4">
          <div className="space-y-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1.5">
              <Mic className="w-3.5 h-3.5 text-amber-400" />
              <span>3. Проверка навыка через микрофон (Живой практикум)</span>
            </span>
            <h4 className="font-serif text-lg sm:text-xl font-bold text-stone-100">
              Включите микрофон и выполните {TARGET_HITS_COUNT} акцентированных движений в ритме {bpm} BPM
            </h4>
            <p className="text-xs text-stone-400">
              Возьмите веники (или отработайте ритм хлопками ладоней перед микрофоном). Система зафиксирует каждый удар по звуковому пику, запишет ваше аудио и сравнит ритмику с эталоном.
            </p>
          </div>

          {/* Microphone Settings: Background Metronome toggle + Sensitivity */}
          <div className="flex flex-wrap items-center gap-3 bg-stone-900/90 p-3 rounded-xl border border-stone-800 shrink-0">
            <label className="flex items-center gap-2 text-xs text-stone-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={micWithMetronome}
                onChange={(e) => setMicWithMetronome(e.target.checked)}
                className="accent-amber-500 rounded cursor-pointer"
              />
              <span>Подсказка метронома</span>
            </label>

            <div className="h-4 w-px bg-stone-800 hidden sm:block" />

            <div className="flex items-center gap-2 text-xs text-stone-300">
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[11px] font-mono text-stone-400">Порог микрофона:</span>
              <input
                type="range"
                min={12}
                max={75}
                value={micSensitivity}
                onChange={(e) => setMicSensitivity(Number(e.target.value))}
                className="w-20 accent-amber-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {micError && (
          <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-xs text-amber-200 flex items-center justify-between gap-3">
            <span>⚠️ {micError}</span>
          </div>
        )}

        {/* Live Microphone Controls + Level Meter */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
          <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col gap-2.5">
            {!isMicListening ? (
              <button
                type="button"
                onClick={startMicrophoneCheck}
                className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-bold text-xs sm:text-sm uppercase tracking-wider transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2"
              >
                <Mic className="w-4 h-4 text-stone-950" />
                <span>
                  {detectedHits.length > 0
                    ? 'Записать заново через микрофон'
                    : 'Включить микрофон и проверить навык'}
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => stopMicrophoneSession(true)}
                className="w-full py-3.5 px-5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs sm:text-sm uppercase tracking-wider transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2 animate-pulse"
              >
                <MicOff className="w-4 h-4" />
                <span>Завершить запись микрофона ({detectedHits.length}/{TARGET_HITS_COUNT})</span>
              </button>
            )}

            {/* Auxiliary Manual Tap Button (works during mic check or without mic) */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => registerStrokeHit(65)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-200 text-xs font-semibold transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>🌿 Ручной удар веником (или если тихий зал)</span>
              </button>
              {detectedHits.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    stopMicrophoneSession(false);
                    setDetectedHits([]);
                    setRecordedAudioUrl(null);
                  }}
                  title="Сбросить результат"
                  className="p-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-400 hover:text-stone-200 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Live Microphone Level Bar + 8 Hit Slots */}
          <div className="lg:col-span-7 space-y-3">
            {/* Acoustic Level Meter */}
            <div className="p-3 rounded-xl bg-stone-900/90 border border-stone-800 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-stone-400 flex items-center gap-1.5">
                  <Activity
                    className={`w-3.5 h-3.5 ${
                      isMicListening ? 'text-emerald-400 animate-pulse' : 'text-stone-500'
                    }`}
                  />
                  <span>
                    {isMicListening
                      ? 'Слушаем микрофон: делайте взмахи с чётким шелестом/хлопком...'
                      : 'Уровень сигнала микрофона'}
                  </span>
                </span>
                <span className="text-amber-300 font-bold">
                  Ударов: {detectedHits.length} / {TARGET_HITS_COUNT}
                </span>
              </div>

              <div className="relative h-4 w-full rounded-full bg-stone-950 border border-stone-800 overflow-hidden">
                {/* Threshold marker line */}
                <div
                  style={{ left: `${micSensitivity}%` }}
                  className="absolute top-0 bottom-0 w-0.5 bg-amber-400 z-10"
                  title="Порог срабатывания удара"
                />
                {/* Live input bar */}
                <div
                  style={{ width: `${liveMicLevel}%` }}
                  className={`h-full transition-all duration-75 ${
                    liveMicLevel >= micSensitivity
                      ? 'bg-gradient-to-r from-emerald-500 to-amber-400'
                      : 'bg-stone-700'
                  }`}
                />
              </div>
            </div>

            {/* 8 Visual Beat Slots comparing Student Hits against Target Grid */}
            <div className="grid grid-cols-8 gap-1.5">
              {Array.from({ length: TARGET_HITS_COUNT }).map((_, idx) => {
                const hit = detectedHits[idx];
                const absError = hit ? Math.abs(hit.offsetMs) : 0;
                const isGood = hit && absError <= beatIntervalMs * 0.22;
                const isAcceptable = hit && !isGood && absError <= beatIntervalMs * 0.4;

                return (
                  <div
                    key={idx}
                    className={`p-2 rounded-xl border text-center font-mono transition-all ${
                      !hit
                        ? 'bg-stone-900/60 border-stone-800 text-stone-500'
                        : isGood
                        ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300'
                        : isAcceptable
                        ? 'bg-amber-950/60 border-amber-500/60 text-amber-300'
                        : 'bg-rose-950/60 border-rose-500/60 text-rose-300'
                    }`}
                  >
                    <div className="text-[10px] opacity-75">#{idx + 1}</div>
                    <div className="text-xs font-bold mt-0.5">
                      {!hit
                        ? '—'
                        : idx === 0
                        ? 'Старт'
                        : `${hit.offsetMs > 0 ? '+' : ''}${hit.offsetMs}мс`}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* =============================================================== */}
        {/* COMPARISON REPORT & AUDIO PLAYBACK (Shows once hits recorded)   */}
        {/* =============================================================== */}
        {detectedHits.length >= 2 && (
          <div className="pt-4 border-t border-stone-800 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase text-stone-400 block">
                    Эталонный темп
                  </span>
                  <span className="text-lg font-mono font-bold text-stone-100">
                    {bpm} BPM
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono uppercase text-amber-400 block">
                    Ваш темп
                  </span>
                  <span className="text-lg font-mono font-bold text-amber-300">
                    {studentBpm} BPM
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase text-stone-400 block">
                    Точность ритма
                  </span>
                  <span
                    className={`text-lg font-mono font-bold ${
                      accuracyPercent >= 80
                        ? 'text-emerald-400'
                        : accuracyPercent >= 60
                        ? 'text-amber-300'
                        : 'text-rose-400'
                    }`}
                  >
                    {accuracyPercent}%
                  </span>
                </div>
                <Award
                  className={`w-6 h-6 ${
                    accuracyPercent >= 80 ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                />
              </div>

              <div className="p-3.5 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase text-stone-400 block">
                    Среднее отклонение
                  </span>
                  <span className="text-lg font-mono font-bold text-stone-200">
                    ±{avgDeviationMs} мс
                  </span>
                </div>
                <Sparkles className="w-5 h-5 text-amber-400" />
              </div>
            </div>

            {/* Playback & Comparison Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-stone-900/80 p-3.5 rounded-2xl border border-stone-800">
              <div className="text-xs text-stone-300">
                <strong className="text-amber-300 block">
                  🎧 Сравните свой ритм с эталоном:
                </strong>
                <span>
                  Прослушайте записанный микрофоном звук своих веников отдельно или одновременно с эталонным ритмом.
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {recordedAudioUrl && (
                  <button
                    type="button"
                    onClick={handlePlayRecordedOnly}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                      isPlayingRecorded && !isComparingBoth
                        ? 'bg-rose-600 text-white border-rose-500'
                        : 'bg-stone-950 hover:bg-stone-800 text-stone-200 border-stone-700'
                    }`}
                  >
                    <Headphones className="w-3.5 h-3.5 text-amber-400" />
                    <span>
                      {isPlayingRecorded && !isComparingBoth
                        ? 'Стоп моя запись'
                        : 'Прослушать мою запись'}
                    </span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleCompareWithReference}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    isComparingBoth
                      ? 'bg-rose-600 text-white'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-stone-950 shadow-md'
                  }`}
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>
                    {isComparingBoth
                      ? 'Остановить сравнение'
                      : 'Сравнить: Эталон + Мой ритм'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
