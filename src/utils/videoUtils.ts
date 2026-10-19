export interface VideoSource {
  type: 'html5' | 'vk' | 'rutube' | 'kinescope' | 'youtube';
  embedUrl: string;
  directUrl?: string;
  serviceLabel: string;
}

export function parseVideoSource(urlOrId?: string): VideoSource | null {
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

  // 2. VK Video (ВКонтакте)
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

  // 3. Rutube (Рутуб)
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

  // 4. Kinescope (Кинескоп)
  const kinescopeMatch = raw.match(/kinescope\.io\/(?:embed\/)?([a-zA-Z0-9_-]+)/i);
  if (kinescopeMatch) {
    return {
      type: 'kinescope',
      embedUrl: `https://kinescope.io/embed/${kinescopeMatch[1]}`,
      serviceLabel: 'Kinescope',
    };
  }

  // 5. YouTube
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

  // Fallback: if it's any http link, treat as direct or iframe
  if (raw.startsWith('http://') || raw.startsWith('https://')) {
    return {
      type: 'html5',
      embedUrl: raw,
      directUrl: raw,
      serviceLabel: 'Внешний видеоисточник',
    };
  }

  return null;
}
