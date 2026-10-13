import React, { useState, useRef } from 'react';
import {
  X,
  User,
  Camera,
  Check,
  Sparkles,
  Crown,
  Shield,
  Award,
  BookOpen,
  MapPin,
  Leaf,
  Flame,
  Cloud,
  LogOut,
  Save,
  CheckCircle2,
  RefreshCw,
  Sliders,
  Trash2,
  Unlock,
  ExternalLink,
} from 'lucide-react';
import { UserProgress, LevelId, BadgeId } from '../../types/banya';
import { useAuth } from '../../firebase/AuthContext';
import { playWoodTap, playSuccessChime } from '../../utils/audio';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  progress: UserProgress;
  onUpdateProgress: (updated: Partial<UserProgress>) => void;
  onOpenPricing?: () => void;
  onOpenCertificate?: () => void;
  onOpenClub?: (tab?: 'chat' | 'webinar' | 'homework') => void;
  onManualSync?: () => Promise<void>;
  isSyncing?: boolean;
}

const PRESET_AVATARS = [
  {
    id: 'master_anton',
    label: '👑 Гранд-Мастер',
    url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=240&q=80',
  },
  {
    id: 'parmaster_oak',
    label: '🌿 Пармастер с дубом',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=240&q=80',
  },
  {
    id: 'banya_lady',
    label: '🌸 Банная берегиня',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=240&q=80',
  },
  {
    id: 'taiga_healer',
    label: '🧙‍♂️ Таёжный знахарь',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=80',
  },
  {
    id: 'steam_lover',
    label: '🧖‍♂️ Любитель пара',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&q=80',
  },
  {
    id: 'banya_warrior',
    label: '🪵 В войлочной шапке',
    url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=240&q=80',
  },
];

const PRESET_STATUSES = [
  '🌿 Начинающий банщик',
  '🔥 Любитель лёгкого пара',
  '💨 В парной, не беспокоить',
  '👑 Эксперт банного мастерства',
  '🍵 Пью травяной чай после парения',
  '🪵 Хранитель традиций предков',
  '⚔️ Мастер двух веников',
  '🧊 После купели и проруби',
];

const BROOM_OPTIONS = [
  'Дуб кавказский',
  'Дуб канадский (красный)',
  'Берёза кудрявая',
  'Пихта сибирская',
  'Можжевельник',
  'Эвкалипт узколистный',
  'Эвкалипт круглый',
  'Липа медовая',
];

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  progress,
  onUpdateProgress,
  onOpenPricing,
  onOpenCertificate,
  onOpenClub,
  onManualSync,
  isSyncing = false,
}) => {
  const { user, signOutUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if current user is admin
  const isAdmin =
    user?.email?.toLowerCase() === 'irhinanton@gmail.com' ||
    Boolean(progress.isAdmin);

  const [activeTab, setActiveTab] = useState<'profile' | 'stats' | 'admin'>('profile');

  // Form State
  const [name, setName] = useState<string>(user?.displayName || progress.name || 'Пармастер');
  const [bio, setBio] = useState<string>(
    progress.bio ||
      (isAdmin
        ? '15 лет банной практики. Основатель школы правильного пара. Автор методики бережного бесконтактного и контактного парения.'
        : 'Увлекаюсь банным искусством, изучаю технику двух веников и фитотерапию для семейной бани.')
  );
  const [avatarUrl, setAvatarUrl] = useState<string>(
    progress.avatarUrl || user?.photoURL || (isAdmin ? PRESET_AVATARS[0].url : '')
  );
  const [banyaStatus, setBanyaStatus] = useState<string>(
    progress.banyaStatus || (isAdmin ? '👑 Основатель & Главный Наставник' : '🌿 Начинающий банщик')
  );
  const [city, setCity] = useState<string>(progress.city || (isAdmin ? 'Москва / Санкт-Петербург' : ''));
  const [favoriteBrooms, setFavoriteBrooms] = useState<string[]>(
    progress.favoriteBrooms || (isAdmin ? ['Дуб кавказский', 'Пихта сибирская', 'Эвкалипт узколистный'] : ['Дуб кавказский', 'Берёза кудрявая'])
  );

  const [customStatusInput, setCustomStatusInput] = useState<string>('');
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [customAvatarUrlInput, setCustomAvatarUrlInput] = useState<string>('');
  const [showUrlInput, setShowUrlInput] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleToggleBroom = (broom: string) => {
    if (favoriteBrooms.includes(broom)) {
      setFavoriteBrooms(favoriteBrooms.filter((b) => b !== broom));
    } else {
      setFavoriteBrooms([...favoriteBrooms, broom]);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert file to base64 data url
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setAvatarUrl(event.target.result as string);
        playWoodTap(progress.soundEnabled);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    const updated: Partial<UserProgress> = {
      name: name.trim(),
      bio: bio.trim(),
      avatarUrl,
      banyaStatus,
      city: city.trim(),
      favoriteBrooms,
      isAdmin,
    };

    onUpdateProgress(updated);
    playSuccessChime(progress.soundEnabled);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  // Admin Tools Actions
  const handleAdminGrantXp = (amount: number) => {
    onUpdateProgress({ xp: progress.xp + amount });
    playSuccessChime(progress.soundEnabled);
  };

  const handleAdminUnlockAll = () => {
    const allLevels: LevelId[] = [1, 2, 3, 4, 5, 6, 7];
    const allBadges: BadgeId[] = [
      'golden_broom',
      'silver_gloves',
      'golden_bowl',
      'health_shield',
      'master_title',
      'golden_key',
      'master_crown',
    ];
    onUpdateProgress({
      completedLevels: allLevels,
      unlockedBadges: allBadges,
      activeLevelId: 7,
      tariff: 'master_pro',
      isPaid: true,
      isAdmin: true,
    });
    playSuccessChime(progress.soundEnabled);
  };

  const handleAdminResetProgress = () => {
    if (confirm('Сбросить весь прогресс до начального состояния для тестирования?')) {
      onUpdateProgress({
        completedLevels: [],
        unlockedBadges: [],
        activeLevelId: 1,
        xp: 100,
      });
      playWoodTap(progress.soundEnabled);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-3xl border border-amber-600/40 bg-stone-950 text-stone-100 shadow-2xl overflow-hidden flex flex-col my-auto max-h-[94vh]">
        
        {/* Header Bar */}
        <div className="relative bg-gradient-to-r from-amber-950/80 via-stone-900 to-amber-950/80 border-b border-stone-800 p-5 sm:p-6 shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-stone-900/80 hover:bg-stone-800 text-stone-400 hover:text-stone-100 transition-colors border border-stone-700/60 cursor-pointer"
            title="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3.5">
            <div className="relative">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={name}
                  className="h-14 w-14 rounded-2xl object-cover border-2 border-amber-500 shadow-md"
                />
              ) : (
                <div className="h-14 w-14 rounded-2xl bg-amber-500/20 border-2 border-amber-500/40 flex items-center justify-center text-2xl font-bold text-amber-300">
                  {name[0] || 'П'}
                </div>
              )}
              {isAdmin && (
                <span className="absolute -top-1.5 -right-1.5 text-base" title="Администратор">
                  👑
                </span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-serif font-bold text-amber-100">
                  {name}
                </h2>
                {isAdmin ? (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-bold">
                    👑 Администратор
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold">
                    Ученик Академии
                  </span>
                )}
              </div>
              <p className="text-xs text-amber-300/80 mt-0.5 font-medium flex items-center gap-1.5">
                <span>{banyaStatus}</span>
                {city && <span className="text-stone-500">· {city}</span>}
              </p>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-stone-800/80 overflow-x-auto scrollbar-thin">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                  : 'bg-stone-900/60 text-stone-400 hover:text-stone-200'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Профиль & Статус</span>
            </button>

            <button
              onClick={() => setActiveTab('stats')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'stats'
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                  : 'bg-stone-900/60 text-stone-400 hover:text-stone-200'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Прогресс & Награды ({progress.unlockedBadges.length})</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'admin'
                    ? 'bg-amber-500 text-stone-950 font-bold shadow-sm ring-1 ring-amber-400'
                    : 'bg-amber-950/40 text-amber-300 border border-amber-500/30 hover:bg-amber-900/50'
                }`}
              >
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>Панель Администратора</span>
              </button>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1">
          
          {/* TAB 1: Profile & Custom Status */}
          {activeTab === 'profile' && (
            <div className="space-y-5 animate-fade-in">
              
              {/* Avatar Chooser & Upload */}
              <div className="p-4 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-stone-200 flex items-center gap-2">
                    <Camera className="w-4 h-4 text-amber-400" />
                    <span>Фотография профиля (Аватар):</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs text-stone-200 font-semibold transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Загрузить фото</span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />

                    <button
                      type="button"
                      onClick={() => setShowUrlInput(!showUrlInput)}
                      className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs text-stone-400 hover:text-stone-200 transition-colors cursor-pointer"
                    >
                      URL
                    </button>
                  </div>
                </div>

                {showUrlInput && (
                  <div className="flex items-center gap-2 pt-1 animate-fade-in">
                    <input
                      type="url"
                      value={customAvatarUrlInput}
                      onChange={(e) => setCustomAvatarUrlInput(e.target.value)}
                      placeholder="Вставьте прямую ссылку на картинку (https://...)"
                      className="flex-1 bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (customAvatarUrlInput.trim()) {
                          setAvatarUrl(customAvatarUrlInput.trim());
                          setShowUrlInput(false);
                        }
                      }}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs cursor-pointer"
                    >
                      Применить
                    </button>
                  </div>
                )}

                {/* Preset Avatars Row */}
                <div>
                  <div className="text-[11px] text-stone-500 mb-2">Или выберите банный аватар:</div>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {PRESET_AVATARS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          setAvatarUrl(preset.url);
                          playWoodTap(progress.soundEnabled);
                        }}
                        className={`p-1.5 rounded-xl border text-center transition-all cursor-pointer group flex flex-col items-center gap-1 ${
                          avatarUrl === preset.url
                            ? 'border-amber-500 bg-amber-500/10 ring-1 ring-amber-500'
                            : 'border-stone-800 hover:border-stone-700 bg-stone-950'
                        }`}
                      >
                        <img
                          src={preset.url}
                          alt={preset.label}
                          className="h-11 w-11 rounded-lg object-cover"
                        />
                        <span className="text-[9px] text-stone-400 group-hover:text-stone-200 truncate w-full">
                          {preset.label.split(' ')[1] || preset.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Name & City Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-bold text-stone-300 block mb-1.5">
                    Ваше имя или никнейм:
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Например: Антон Ирхин"
                    className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3.5 py-2.5 text-xs text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-300 block mb-1.5 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    <span>Город / Регион:</span>
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Например: Москва / Санкт-Петербург"
                    className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3.5 py-2.5 text-xs text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Banya Status Section */}
              <div className="p-4 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-stone-200 flex items-center gap-2">
                    <Flame className="w-4 h-4 text-amber-400" />
                    <span>Банный статус в клубе:</span>
                  </div>
                  <span className="text-xs text-amber-400 font-medium px-2 py-0.5 rounded-full bg-amber-500/10">
                    {banyaStatus}
                  </span>
                </div>

                {/* Preset Status Chips */}
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_STATUSES.map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => {
                        setBanyaStatus(status);
                        playWoodTap(progress.soundEnabled);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer ${
                        banyaStatus === status
                          ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                          : 'bg-stone-950 hover:bg-stone-800 text-stone-400 border border-stone-800 hover:text-stone-200'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>

                {/* Custom Status Input */}
                <div className="pt-2 border-t border-stone-800/80 space-y-1.5">
                  <label className="text-[11px] text-stone-400 block">
                    Или напишите свой собственный статус:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={customStatusInput}
                      onChange={(e) => setCustomStatusInput(e.target.value)}
                      placeholder="Например: В субботу топим по-черному на озере..."
                      className="flex-1 bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (customStatusInput.trim()) {
                          setBanyaStatus(customStatusInput.trim());
                          setCustomStatusInput('');
                          playWoodTap(progress.soundEnabled);
                        }
                      }}
                      className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Установить
                    </button>
                  </div>
                </div>
              </div>

              {/* Bio / About Me */}
              <div>
                <label className="text-xs font-bold text-stone-300 block mb-1.5">
                  О себе и банном опыте:
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Расскажите о себе: сколько лет парите, какие бани любите, какие цели ставите в Академии..."
                  className="w-full bg-stone-900 border border-stone-700 rounded-xl p-3 text-xs text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-amber-500 leading-relaxed"
                />
              </div>

              {/* Favorite Brooms */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
                  <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Любимые веники:</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {BROOM_OPTIONS.map((broom) => {
                    const isSelected = favoriteBrooms.includes(broom);
                    return (
                      <button
                        key={broom}
                        type="button"
                        onClick={() => handleToggleBroom(broom)}
                        className={`px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold'
                            : 'bg-stone-900 text-stone-400 border border-stone-800 hover:text-stone-200'
                        }`}
                      >
                        <span>🌿</span>
                        <span>{broom}</span>
                        {isSelected && <span className="text-emerald-400 text-xs">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Progress & Achievements */}
          {activeTab === 'stats' && (
            <div className="space-y-5 animate-fade-in">
              {/* Stats Counters */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-stone-900/60 border border-stone-800 text-center">
                  <div className="text-2xl font-bold font-mono text-amber-400">{progress.xp}</div>
                  <div className="text-xs text-stone-400 uppercase tracking-wide mt-1">Очков опыта</div>
                </div>

                <div className="p-4 rounded-2xl bg-stone-900/60 border border-stone-800 text-center">
                  <div className="text-2xl font-bold font-mono text-emerald-400">
                    {progress.completedLevels.length} / 7
                  </div>
                  <div className="text-xs text-stone-400 uppercase tracking-wide mt-1">Станций пройдено</div>
                </div>

                <div className="p-4 rounded-2xl bg-stone-900/60 border border-stone-800 text-center">
                  <div className="text-2xl font-bold font-mono text-amber-300">
                    {progress.unlockedBadges.length} / 7
                  </div>
                  <div className="text-xs text-stone-400 uppercase tracking-wide mt-1">Трофеев получено</div>
                </div>
              </div>

              {/* Tariff Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-stone-900 to-amber-950/40 border border-amber-500/30 flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs text-stone-400 uppercase font-mono tracking-wider">
                    Статус обучения:
                  </div>
                  <h4 className="font-serif font-bold text-base text-stone-100 mt-0.5">
                    {isAdmin
                      ? '👑 VIP Бессрочный Доступ (Администратор)'
                      : progress.isPaid || progress.tariff === 'master_pro'
                      ? '⭐ Мастер Пара PRO (Полный доступ)'
                      : 'Вольный Слушатель (Базовый курс)'}
                  </h4>
                </div>

                {onOpenPricing && !isAdmin && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenPricing();
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition-colors cursor-pointer"
                  >
                    Тарифы курса
                  </button>
                )}
              </div>

              {/* Certificate Access */}
              {onOpenCertificate && (
                <div className="p-4 rounded-2xl bg-stone-900/60 border border-stone-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Award className="w-8 h-8 text-amber-400" />
                    <div>
                      <h4 className="font-bold text-sm text-stone-100">Именной Сертификат</h4>
                      <p className="text-xs text-stone-400">
                        {progress.certifiedDate
                          ? `Выдан: ${progress.certifiedDate}`
                          : 'Доступен после сдачи итогового экзамена на 7-й станции'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onClose();
                      onOpenCertificate();
                    }}
                    className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Посмотреть
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ADMIN PANEL (irhinanton@gmail.com) */}
          {activeTab === 'admin' && isAdmin && (
            <div className="space-y-5 animate-fade-in">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-amber-600/10 to-transparent border border-amber-500/40 space-y-2">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                  <Crown className="w-5 h-5 text-amber-400" />
                  <span>Панель Управления Владельца (Антон Ирхин)</span>
                </div>
                <p className="text-xs text-stone-300 leading-relaxed">
                  Ваш аккаунт обладает абсолютными правами на платформе: открыт свободный переход по всем 7 станциям, сняты все лимиты, доступны права модерации чата, удаление спама и проверка домашних заданий учеников.
                </p>
              </div>

              {/* Quick Admin Actions */}
              <div className="space-y-3">
                <div className="text-xs font-mono uppercase text-stone-400 font-semibold tracking-wider">
                  Быстрые команды тестирования:
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleAdminUnlockAll}
                    className="p-3.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-amber-500/40 text-left transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div>
                      <div className="font-bold text-xs text-amber-300 group-hover:text-amber-200">
                        🔓 Открыть все 7 станций и награды
                      </div>
                      <div className="text-[11px] text-stone-400 mt-0.5">
                        Мгновенная разблокировка без ограничений
                      </div>
                    </div>
                    <Unlock className="w-4 h-4 text-amber-400 shrink-0" />
                  </button>

                  <div className="p-3.5 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-xs text-stone-200">Начислить XP:</div>
                      <div className="text-[11px] text-stone-400 mt-0.5">Тестирование уровней</div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleAdminGrantXp(100)}
                        className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-amber-500 hover:text-stone-950 text-xs font-mono font-bold transition-colors cursor-pointer"
                      >
                        +100
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAdminGrantXp(500)}
                        className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-amber-500 hover:text-stone-950 text-xs font-mono font-bold transition-colors cursor-pointer"
                      >
                        +500
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAdminGrantXp(2500)}
                        className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-stone-950 text-xs font-mono font-bold transition-colors cursor-pointer"
                      >
                        +2500
                      </button>
                    </div>
                  </div>
                </div>

                {/* Club Moderation Shortcut */}
                {onOpenClub && (
                  <div className="p-3.5 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-xs text-emerald-300">
                        Модерация Банного Клуба
                      </div>
                      <div className="text-[11px] text-stone-400 mt-0.5">
                        Удаление сообщений в общем чате и проверка видео-ДЗ учеников
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenClub('homework');
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold cursor-pointer"
                    >
                      Проверить ДЗ →
                    </button>
                  </div>
                )}

                {/* Reset Progress */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleAdminResetProgress}
                    className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-red-950/40 text-stone-400 hover:text-red-300 border border-stone-800 hover:border-red-500/30 text-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Сбросить прогресс до начального (для проверки квеста с нуля)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Bottom Actions */}
        <div className="p-4 sm:p-5 border-t border-stone-800 bg-stone-900/90 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs">
            {saveSuccess ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-1.5 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4" />
                <span>Профиль успешно сохранён!</span>
              </span>
            ) : user ? (
              <span className="text-stone-400 flex items-center gap-1.5">
                <Cloud className="w-3.5 h-3.5 text-emerald-400" />
                <span className="truncate max-w-[200px]">{user.email || user.phoneNumber || 'Облако'}</span>
              </span>
            ) : (
              <span className="text-stone-500">Локальный профиль</span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onManualSync && user && (
              <button
                type="button"
                onClick={onManualSync}
                disabled={isSyncing}
                className="px-3 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                title="Синхронизировать с облаком"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Синхронизация</span>
              </button>
            )}

            {user && (
              <button
                type="button"
                onClick={async () => {
                  await signOutUser();
                  onClose();
                }}
                className="p-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-red-400 transition-colors cursor-pointer"
                title="Выйти из аккаунта"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={handleSave}
              className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-stone-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Сохранить профиль</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
