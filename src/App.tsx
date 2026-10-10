/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HeroIntro } from './components/HeroIntro';
import { ArtifactIntroModal } from './components/ArtifactIntroModal';
import { OwlAssistantModal } from './components/OwlAssistantModal';
import { FloatingBellButton } from './components/FloatingBellButton';
import { QuestMap } from './components/QuestMap';
import { LevelViewer } from './components/LevelViewer';
import { BadgesShowcase } from './components/BadgesShowcase';
import { SimulatorsHub } from './components/SimulatorsHub';
import { HandbookView } from './components/HandbookView';
import { ForumView } from './components/forum/ForumView';
import { EmergencyEventModal } from './components/simulators/EmergencyEventModal';
import { FinalExamModal } from './components/FinalExamModal';
import { CertificateModal } from './components/CertificateModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { AuthModal } from './components/AuthModal';
import { PricingModal } from './components/PricingModal';
import { LegalModal } from './components/LegalModal';
import { RequisitesPage } from './components/legal/RequisitesPage';
import { CommunityClubModal } from './components/CommunityClubModal';
import { UserProfileModal } from './components/profile/UserProfileModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { MobileLevelQuickNav } from './components/MobileLevelQuickNav';
import { InDevelopmentModal, LevelLockModal } from './components/NoticeModal';
import { COURSE_LEVELS, BADGES } from './data/courseData';
import { UserProgress, LevelId, BadgeId } from './types/banya';
import { useAuth } from './firebase/AuthContext';
import confetti from 'canvas-confetti';
import {
  syncProgressToCloud,
  fetchProgressFromCloud,
  mergeUserProgress,
} from './firebase/progressSync';
import { sendCoursePurchaseNotification } from './firebase/adminMessageService';

const STORAGE_KEY = 'banya_quest_master_progress_v1';

const INITIAL_PROGRESS: UserProgress = {
  name: 'Александр Мастеров',
  xp: 100,
  completedLevels: [],
  unlockedBadges: [],
  quizScores: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 },
  activeLevelId: 1,
  soundEnabled: true,
};

export default function App() {
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [isCloudSyncing, setIsCloudSyncing] = useState<boolean>(false);
  const [lastSyncedTime, setLastSyncedTime] = useState<string | null>(null);

  const [progress, setProgress] = useState<UserProgress>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return {
            ...INITIAL_PROGRESS,
            ...parsed,
            completedLevels: Array.isArray(parsed.completedLevels) ? parsed.completedLevels : [],
            unlockedBadges: Array.isArray(parsed.unlockedBadges) ? parsed.unlockedBadges : [],
            quizScores: parsed.quizScores && typeof parsed.quizScores === 'object' ? parsed.quizScores : INITIAL_PROGRESS.quizScores,
            activeLevelId: (typeof parsed.activeLevelId === 'number' && parsed.activeLevelId >= 1 && parsed.activeLevelId <= 7) ? (parsed.activeLevelId as LevelId) : 1,
          };
        }
      }
    } catch {
      // Fallback
    }
    return INITIAL_PROGRESS;
  });

  const [activeTab, setActiveTab] = useState<'quest' | 'simulators' | 'handbook' | 'forum'>('quest');
  const [questViewMode, setQuestViewMode] = useState<'map' | 'lesson'>('map');
  const [showHero, setShowHero] = useState<boolean>(true);
  const [hasStartedLearning, setHasStartedLearning] = useState<boolean>(() => {
    try {
      return localStorage.getItem('pq_has_started_learning') === 'true';
    } catch {
      return false;
    }
  });
  const [showArtifactModal, setShowArtifactModal] = useState<boolean>(false);
  const [showOwlAssistantModal, setShowOwlAssistantModal] = useState<boolean>(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState<boolean>(false);
  const [showExamModal, setShowExamModal] = useState<boolean>(false);
  const [showCertificateModal, setShowCertificateModal] = useState<boolean>(false);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState<boolean>(false);
  const [showPricingModal, setShowPricingModal] = useState<boolean>(false);
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [showLegalModal, setShowLegalModal] = useState<boolean>(false);
  const [legalInitialTab, setLegalInitialTab] = useState<'offer' | 'privacy' | 'requisites'>('offer');
  const [showClubModal, setShowClubModal] = useState<boolean>(false);
  const [clubInitialTab, setClubInitialTab] = useState<'chat' | 'webinar' | 'homework'>('chat');
  const [inDevelopmentFeature, setInDevelopmentFeature] = useState<string | null>(null);
  const [lockedFeatureModal, setLockedFeatureModal] = useState<string | null>(null);

  const [isRequisitesRoute, setIsRequisitesRoute] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const p = window.location.pathname.toLowerCase();
      const s = window.location.search.toLowerCase();
      return p.includes('requisites') || p.includes('inn') || p.includes('legal') || s.includes('requisites');
    }
    return false;
  });

  useEffect(() => {
    const handlePopState = () => {
      const p = window.location.pathname.toLowerCase();
      const s = window.location.search.toLowerCase();
      setIsRequisitesRoute(p.includes('requisites') || p.includes('inn') || p.includes('legal') || s.includes('requisites'));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // YooKassa Payment Return Listener (?payment=success)
  const [showPaymentSuccessModal, setShowPaymentSuccessModal] = useState<boolean>(false);
  const [successfulOrderId, setSuccessfulOrderId] = useState<string>('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get('payment') === 'success') {
        const orderId = searchParams.get('orderId') || `YOOKASSA-${Date.now()}`;
        const amount = searchParams.get('amount') || '3390.00';
        setSuccessfulOrderId(orderId);
        setShowPaymentSuccessModal(true);
        handleActivatePaidTier(orderId);

        // Send instant notification to Telegram bot
        sendCoursePurchaseNotification({
          orderId,
          amount: Number(amount) === 10 ? '10 ₽ (тестовая)' : '3 390 ₽',
          userName: progress.name || user?.displayName || 'Ученик',
          userEmail: user?.email || '',
        }).catch((err) => console.warn('Payment telegram notification warning:', err));

        try {
          confetti({
            particleCount: 90,
            spread: 60,
            origin: { y: 0.6 }
          });
        } catch {
          // ignore
        }

        // Clean query params from URL without refreshing
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      }
    } catch (e) {
      console.error('Error handling payment return:', e);
    }
  }, []);

  // Automatic admin promotion for irhinanton@gmail.com
  useEffect(() => {
    if (user?.email?.toLowerCase() === 'irhinanton@gmail.com') {
      setProgress((prev) => ({
        ...prev,
        isAdmin: true,
        isPaid: true,
        tariff: 'master_pro',
        name: prev.name === 'Александр Мастеров' || !prev.name ? 'Антон Ирхин' : prev.name,
        avatarUrl: prev.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=240&q=80',
        banyaStatus: prev.banyaStatus || '👑 Основатель & Главный Наставник',
      }));
    }
  }, [user]);

  const isAdmin = user?.email?.toLowerCase() === 'irhinanton@gmail.com' || Boolean(progress.isAdmin);
  const isLevel3Unlocked = Boolean(
    isAdmin ||
    progress.activeLevelId >= 3 ||
    (progress.completedLevels && progress.completedLevels.some((l) => l >= 2))
  );

  useEffect(() => {
    if (!isAdmin && activeTab === 'forum') {
      setActiveTab('quest');
      setInDevelopmentFeature('Форум Мастеров');
    }
    if (!isLevel3Unlocked && (activeTab === 'simulators' || activeTab === 'handbook')) {
      setActiveTab('quest');
      setLockedFeatureModal(
        activeTab === 'simulators' ? 'Тренажеры и Симуляторы' : 'Банный Справочник'
      );
    }
  }, [activeTab, isAdmin, isLevel3Unlocked]);

  const handleOpenClub = (tab: 'chat' | 'webinar' | 'homework' = 'chat') => {
    if (!isAdmin) {
      setInDevelopmentFeature('Банный Клуб & Эфиры');
      return;
    }
    setClubInitialTab(tab);
    setShowClubModal(true);
  };

  const handleOpenQuestMap = () => {
    setShowHero(false);
    setActiveTab('quest');
    setQuestViewMode('map');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleScrollToMap = () => {
    handleOpenQuestMap();
  };

  const handleOpenLegal = (tab: 'offer' | 'privacy' | 'requisites' = 'offer') => {
    setLegalInitialTab(tab);
    setShowLegalModal(true);
  };

  const handleActivatePaidTier = async (orderId?: string) => {
    const updated: UserProgress = {
      ...progress,
      tariff: 'master_pro',
      isPaid: true,
      paidAt: new Date().toISOString(),
      orderId: orderId || `ORDER-${Date.now()}`,
    };
    setProgress(updated);
    if (user) {
      await syncProgressToCloud(user, updated);
      setLastSyncedTime(
        new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
      );
    }
  };

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // ignore
    }
  }, [progress]);

  // When user logs in, fetch cloud progress and merge
  useEffect(() => {
    if (!user) return;
    const currentUser = user;

    let isCancelled = false;
    async function loadCloud() {
      setIsCloudSyncing(true);
      try {
        const remote = await fetchProgressFromCloud(currentUser);
        if (isCancelled) return;

        if (remote) {
          setProgress((prev) => {
            const merged = mergeUserProgress(prev, remote);
            // Push merged back to cloud
            syncProgressToCloud(currentUser, merged);
            return merged;
          });
        } else {
          // Push local progress to cloud
          await syncProgressToCloud(currentUser, progress);
        }
        setLastSyncedTime(
          new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
        );
      } catch (err) {
        console.error('Cloud progress fetch failed:', err);
      } finally {
        if (!isCancelled) setIsCloudSyncing(false);
      }
    }

    loadCloud();
    return () => {
      isCancelled = true;
    };
  }, [user]);

  // Auto-save to cloud on progress change when logged in
  useEffect(() => {
    if (!user) return;
    const currentUser = user;

    const timer = setTimeout(async () => {
      try {
        setIsCloudSyncing(true);
        await syncProgressToCloud(currentUser, progress);
        setLastSyncedTime(
          new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
        );
      } catch (err) {
        console.error('Auto cloud save failed:', err);
      } finally {
        setIsCloudSyncing(false);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [progress, user]);

  const handleManualSync = async () => {
    if (!user) return;
    const currentUser = user;
    setIsCloudSyncing(true);
    try {
      await syncProgressToCloud(currentUser, progress);
      setLastSyncedTime(
        new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
      );
    } finally {
      setIsCloudSyncing(false);
    }
  };

  const handleToggleSound = () => {
    setProgress((prev) => ({
      ...prev,
      soundEnabled: !prev.soundEnabled,
    }));
  };

  const handleGrantXp = (amount: number) => {
    setProgress((prev) => ({
      ...prev,
      xp: prev.xp + amount,
    }));
  };

  const handleSelectLevel = (levelId: LevelId) => {
    setShowHero(false);
    setActiveTab('quest');
    setQuestViewMode('lesson');
    setProgress((prev) => ({
      ...prev,
      activeLevelId: levelId,
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCompleteLevel = (levelId: LevelId, xpReward: number) => {
    const currentLevel = COURSE_LEVELS.find((l) => l.id === levelId);
    const newBadge = currentLevel?.rewardBadge;

    setProgress((prev) => {
      const nextCompleted = prev.completedLevels.includes(levelId)
        ? prev.completedLevels
        : [...prev.completedLevels, levelId];

      const nextBadges = newBadge && !prev.unlockedBadges.includes(newBadge)
        ? [...prev.unlockedBadges, newBadge]
        : prev.unlockedBadges;

      return {
        ...prev,
        xp: prev.xp + xpReward,
        completedLevels: nextCompleted,
        unlockedBadges: nextBadges,
      };
    });
  };

  const handleGrantBadge = (badgeId: BadgeId, xpReward: number) => {
    setProgress((prev) => {
      const nextBadges = prev.unlockedBadges.includes(badgeId)
        ? prev.unlockedBadges
        : [...prev.unlockedBadges, badgeId];

      return {
        ...prev,
        xp: prev.xp + xpReward,
        unlockedBadges: nextBadges,
      };
    });
  };

  const handlePassExam = (score: number) => {
    const today = new Date().toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    setProgress((prev) => {
      const nextCompleted = prev.completedLevels.includes(7)
        ? prev.completedLevels
        : [...prev.completedLevels, 7 as LevelId];

      const nextBadges = prev.unlockedBadges.includes('master_crown')
        ? prev.unlockedBadges
        : [...prev.unlockedBadges, 'master_crown' as BadgeId];

      return {
        ...prev,
        xp: prev.xp + 500,
        examScore: score,
        completedLevels: nextCompleted,
        unlockedBadges: nextBadges,
        certifiedDate: today,
      };
    });

    setShowExamModal(false);
    setShowCertificateModal(true);
  };

  const handleUpdateStudentName = (name: string) => {
    setProgress((prev) => ({
      ...prev,
      name,
    }));
  };

  const currentLevelData =
    COURSE_LEVELS.find((l) => l.id === progress.activeLevelId) || COURSE_LEVELS[0];

  if (isRequisitesRoute) {
    return (
      <RequisitesPage
        onBackToMain={() => {
          if (typeof window !== 'undefined') {
            window.history.pushState({}, '', '/');
          }
          setIsRequisitesRoute(false);
        }}
        onOpenLegalModal={handleOpenLegal}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0908] text-stone-100 flex flex-col justify-between selection:bg-amber-600/30 selection:text-amber-200 relative overflow-x-hidden">
      {/* Warm sauna lamp directional ambient glow in top and corners */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[450px] bg-amber-500/[0.04] rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-amber-600/[0.03] rounded-full blur-[160px] pointer-events-none -z-10" />

      {/* Top Navigation Bar */}
      <Header
        progress={progress}
        onToggleSound={handleToggleSound}
        onOpenLeaderboard={() => setShowLeaderboardModal(true)}
        onOpenCertificate={() => setShowCertificateModal(true)}
        onNavigateToLevel={handleSelectLevel}
        onOpenEmergency={() => setShowEmergencyModal(true)}
        onOpenAuth={() => setShowAuthModal(true)}
        onOpenProfile={() => setShowProfileModal(true)}
        onOpenPricing={() => setShowPricingModal(true)}
        onOpenClub={() => handleOpenClub('chat')}
        onOpenAssistant={() => setShowOwlAssistantModal(true)}
        onOpenLegal={(tab) => handleOpenLegal(tab)}
        onShowInDevelopment={(feature) => setInDevelopmentFeature(feature)}
        onRequireLevel3={(feature) => setLockedFeatureModal(feature)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isQuestMapActive={activeTab === 'quest' && questViewMode === 'map' && !showHero}
        onGoToHome={() => {
          setShowHero(true);
          setActiveTab('quest');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onStartLearning={() => {
          setShowHero(false);
          setActiveTab('quest');
          setQuestViewMode('lesson');
        }}
        onOpenQuestMap={handleOpenQuestMap}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 sm:space-y-10 pb-28 md:pb-12">
        {/* Tab 1: Quest Journey */}
        {activeTab === 'quest' && (
          <div className="space-y-8 sm:space-y-10">
            {showHero ? (
              /* Welcome first screen: ONLY the first block with visible background video and glowing start button */
              <HeroIntro
                progress={progress}
                onStartQuest={() => {
                  const isFirstStart = !hasStartedLearning && (!progress.completedLevels || progress.completedLevels.length === 0);
                  setShowHero(false);
                  setHasStartedLearning(true);
                  try {
                    localStorage.setItem('pq_has_started_learning', 'true');
                  } catch (e) {}

                  if (isFirstStart) {
                    setShowArtifactModal(true);
                  }
                  handleSelectLevel(1);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onSelectLevel={(levelId) => {
                  setShowHero(false);
                  handleSelectLevel(levelId);
                }}
              />
            ) : questViewMode === 'map' ? (
              /* ONLY Quest Roadmap Map View */
              <div className="space-y-6 animate-fadeIn">
                {/* Back to welcome screen and Switch to Lesson bars */}
                <div className="flex items-center justify-between pb-3 border-b border-stone-800/80">
                  <button
                    onClick={() => {
                      setShowHero(true);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="inline-flex items-center gap-2 text-xs font-mono text-stone-400 hover:text-amber-300 transition-colors py-1.5 px-3 rounded-xl bg-stone-900/70 hover:bg-stone-900 border border-stone-800 hover:border-amber-500/40 cursor-pointer shadow-sm"
                  >
                    <span>← На главный экран</span>
                  </button>
                  <button
                    onClick={() => {
                      setQuestViewMode('lesson');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="inline-flex items-center gap-2 text-xs font-mono text-amber-300 hover:text-amber-200 transition-colors py-1.5 px-3.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 cursor-pointer shadow-sm"
                  >
                    <span>К текущему уроку (Станция {progress.activeLevelId}) →</span>
                  </button>
                </div>

                {/* Quest Roadmap Map */}
                <div id="quest-roadmap-section">
                  <QuestMap
                    progress={progress}
                    onSelectLevel={handleSelectLevel}
                    activeLevelId={progress.activeLevelId}
                    onOpenPricing={() => setShowPricingModal(true)}
                  />
                </div>
              </div>
            ) : (
              /* Learning Workspace: station viewer, navigation, club and trophies */
              <div className="space-y-8 sm:space-y-10 animate-fadeIn">
                {/* Back to welcome screen and direct Map link bar */}
                <div className="flex items-center justify-between pb-2 border-b border-stone-800/80">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <button
                      onClick={() => {
                        setShowHero(true);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="inline-flex items-center gap-2 text-xs font-mono text-stone-400 hover:text-amber-300 transition-colors py-1.5 px-3 rounded-xl bg-stone-900/70 hover:bg-stone-900 border border-stone-800 hover:border-amber-500/40 cursor-pointer shadow-sm"
                    >
                      <span>← Главная</span>
                    </button>
                    <button
                      onClick={handleOpenQuestMap}
                      className="inline-flex items-center gap-1.5 text-xs font-mono text-amber-300 hover:text-amber-200 transition-colors py-1.5 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 cursor-pointer shadow-sm"
                    >
                      <span>🗺️ Карта Квеста</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono text-stone-400">
                    <span>Станция {progress.activeLevelId} из 7</span>
                    <span className="text-amber-500/60">•</span>
                    <span className="text-amber-300 font-semibold">{currentLevelData.title}</span>
                  </div>
                </div>

                {/* Mobile Horizontal Station Quick Selector */}
                <MobileLevelQuickNav
                  activeLevelId={progress.activeLevelId}
                  onSelectLevel={handleSelectLevel}
                  progress={progress}
                />

                {/* Level Viewer (Current Selected Station) */}
                <div id="level-station-section">
                  <LevelViewer
                    level={currentLevelData}
                    progress={progress}
                    onCompleteLevel={handleCompleteLevel}
                    onStartExam={() => setShowExamModal(true)}
                    soundEnabled={progress.soundEnabled}
                    onGrantXp={handleGrantXp}
                    onOpenPricing={() => setShowPricingModal(true)}
                    onNavigateToMap={handleOpenQuestMap}
                    onSelectLevel={handleSelectLevel}
                    onUnlockBadge={handleGrantBadge}
                  />
                </div>

                {/* Информация ниже мини-теста скрыта на 1-м уровне, но сохранена в коде; сундук перенесен во 2-й уровень */}
                {currentLevelData.id !== 1 && (
                  <>
                    {/* Community Club & Live Hub Interactive Banner */}
                    <div className="rounded-2xl border border-stone-800 bg-gradient-to-r from-stone-900 via-stone-950 to-stone-900 p-5 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-stone-950 shadow-lg shrink-0">
                          <span className="text-2xl">🌿</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-serif text-base sm:text-lg font-bold text-stone-100">
                              Банный Клуб: Чат Сообщества & Онлайн-Эфиры
                            </h3>
                            <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-mono font-semibold ${
                              isAdmin
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                : 'bg-stone-900 border-stone-800 text-stone-400'
                            }`}>
                              {isAdmin ? 'Live' : 'В разработке 🛠️'}
                            </span>
                          </div>
                          <p className="text-xs text-stone-400 mt-1 max-w-xl leading-relaxed">
                            Единое окно: живое общение с учениками и наставником, субботние созвоны с разбором техники веников прямо в браузере и сдача видео-заданий.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                        <button
                          onClick={() => {
                            if (!isAdmin) {
                              setInDevelopmentFeature('Банный Клуб (Чат)');
                            } else {
                              handleOpenClub('chat');
                            }
                          }}
                          className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer text-center ${
                            isAdmin
                              ? 'bg-amber-500 hover:bg-amber-400 text-stone-950'
                              : 'bg-stone-900 hover:bg-stone-850 text-stone-300 border border-stone-800'
                          }`}
                        >
                          {isAdmin ? 'Общий Чат 💬' : 'Чат 💬 (В разработке)'}
                        </button>
                        <button
                          onClick={() => {
                            if (!isAdmin) {
                              setInDevelopmentFeature('Банный Клуб (Видеокомната)');
                            } else {
                              handleOpenClub('webinar');
                            }
                          }}
                          className="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-850 text-stone-300 border border-stone-800 text-xs font-semibold transition-colors cursor-pointer text-center"
                        >
                          {isAdmin ? 'Видеокомната 📹' : 'Видеокомната 📹 (В разработке)'}
                        </button>
                      </div>
                    </div>

                    {/* Badges / Trophies Shelf & Secret Chest (активен со 2-го уровня) */}
                    <BadgesShowcase
                      unlockedBadges={progress.unlockedBadges}
                      onNavigateToLevel={handleSelectLevel}
                      onUnlockBadge={handleGrantBadge}
                      soundEnabled={progress.soundEnabled}
                      isLevel2Active={currentLevelData.id === 2}
                    />
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Free Simulators Hub */}
        {activeTab === 'simulators' && (
          <SimulatorsHub
            soundEnabled={progress.soundEnabled}
            onGrantXp={handleGrantXp}
            progress={progress}
            onNavigateToLevel={handleSelectLevel}
            onUnlockBadge={handleGrantBadge}
            onOpenPricing={() => setShowPricingModal(true)}
          />
        )}

        {/* Tab 3: Pocket Handbook */}
        {activeTab === 'handbook' && <HandbookView />}

        {/* Tab 4: Forum of Masters & Programs Marketplace */}
        {activeTab === 'forum' && (
          <ForumView
            progress={progress}
            onOpenPricing={() => setShowPricingModal(true)}
            onOpenAuth={() => setShowAuthModal(true)}
          />
        )}
      </main>

      {/* Modals */}
      <EmergencyEventModal
        isOpen={showEmergencyModal}
        onClose={() => setShowEmergencyModal(false)}
        soundEnabled={progress.soundEnabled}
        onGrantXp={handleGrantXp}
      />

      <FinalExamModal
        isOpen={showExamModal}
        onClose={() => setShowExamModal(false)}
        onPassExam={handlePassExam}
        soundEnabled={progress.soundEnabled}
      />

      <CertificateModal
        isOpen={showCertificateModal}
        onClose={() => setShowCertificateModal(false)}
        userName={progress.name}
        onUpdateName={handleUpdateStudentName}
        certifiedDate={progress.certifiedDate || '3 октября 2026 г.'}
        isCompleted={Boolean(
          progress.certifiedDate ||
          progress.completedLevels.includes(7) ||
          progress.completedLevels.length >= 7
        )}
        completedLevelsCount={progress.completedLevels.length}
        onContinueCourse={() => {
          setShowHero(false);
          setActiveTab('quest');
        }}
      />

      <LeaderboardModal
        isOpen={showLeaderboardModal}
        onClose={() => setShowLeaderboardModal(false)}
        progress={progress}
      />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        progress={progress}
        onManualSync={handleManualSync}
        isSyncing={isCloudSyncing}
        lastSyncedTime={lastSyncedTime}
        onOpenPricing={() => setShowPricingModal(true)}
        onOpenProfile={() => setShowProfileModal(true)}
        onOpenLegal={handleOpenLegal}
      />

      {/* User Personal Cabinet & Profile Modal */}
      <UserProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        progress={progress}
        onUpdateProgress={(updated) => {
          setProgress((prev) => ({ ...prev, ...updated }));
        }}
        onOpenPricing={() => setShowPricingModal(true)}
        onOpenCertificate={() => setShowCertificateModal(true)}
        onOpenClub={handleOpenClub}
        onManualSync={handleManualSync}
        isSyncing={isCloudSyncing}
      />

      <PricingModal
        isOpen={showPricingModal}
        onClose={() => setShowPricingModal(false)}
        progress={progress}
        onActivatePaidTier={handleActivatePaidTier}
        onOpenLegal={handleOpenLegal}
      />

      <LegalModal
        isOpen={showLegalModal}
        onClose={() => setShowLegalModal(false)}
        initialTab={legalInitialTab}
      />

      {/* Artifact Introduction Modal (triggered upon starting learning) */}
      <ArtifactIntroModal
        isOpen={showArtifactModal}
        onClose={() => setShowArtifactModal(false)}
        onOpenAssistant={() => {
          setShowArtifactModal(false);
          setShowOwlAssistantModal(true);
        }}
      />

      {/* Owl Assistant Modal (PQ owl helper, questions, bug report, feedback) */}
      <OwlAssistantModal
        isOpen={showOwlAssistantModal}
        onClose={() => setShowOwlAssistantModal(false)}
        progress={progress}
      />

      {/* Floating Bell Button: only visible after user has started learning */}
      {hasStartedLearning && !showHero && (
        <FloatingBellButton
          onClick={() => setShowOwlAssistantModal(true)}
        />
      )}

      {/* Community Club Modal (Single hub with Chat, Video Webroom, and Homework Review) */}
      <CommunityClubModal
        isOpen={showClubModal}
        onClose={() => setShowClubModal(false)}
        progress={progress}
        onGrantXp={handleGrantXp}
        initialTab={clubInitialTab}
      />

      {/* YooKassa Payment Success Celebration Modal */}
      {showPaymentSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative max-w-lg w-full rounded-3xl bg-gradient-to-b from-stone-900 via-stone-950 to-stone-900 border border-emerald-500/50 p-6 sm:p-8 shadow-2xl text-center space-y-5">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center text-3xl shadow-inner animate-bounce">
              🎉
            </div>
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
                ЮKassa • Оплата успешно подтверждена
              </span>
              <h3 className="text-2xl font-serif font-bold text-stone-100">
                Добро пожаловать в «Мастер Пара PRO»!
              </h3>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                Ваш доступ к полному курсу, всем 7 станциям квеста, банным симуляторам и итоговой аттестации успешно открыт!
              </p>
            </div>

            {successfulOrderId && (
              <div className="p-3 rounded-xl bg-stone-900/90 border border-stone-800 text-[11px] font-mono text-stone-400">
                Номер операции: <span className="text-amber-300 font-semibold">{successfulOrderId}</span>
              </div>
            )}

            <button
              onClick={() => {
                setShowPaymentSuccessModal(false);
                handleScrollToMap();
              }}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-bold text-sm transition-all shadow-lg shadow-amber-500/25 cursor-pointer"
            >
              Перейти к изучению курса
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full border-t border-stone-800/80 bg-stone-950 py-6 print:hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <div>
            © {new Date().getFullYear()} Пармастер Квест: Путь к Мастерству · banya-school.ru
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            <button
              onClick={() => handleOpenLegal('offer')}
              className="hover:text-stone-300 transition-colors cursor-pointer"
            >
              Публичная оферта
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => handleOpenLegal('privacy')}
              className="hover:text-stone-300 transition-colors cursor-pointer"
            >
              Политика 152-ФЗ
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => handleOpenLegal('requisites')}
              className="hover:text-stone-300 transition-colors cursor-pointer"
            >
              Реквизиты самозанятого
            </button>
          </div>
        </div>

        {/* Official Legal & INN line for YooKassa & Bank Compliance */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-3 pt-3 border-t border-stone-900 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-[11px] text-stone-500 font-mono text-center sm:text-left">
          <div>
            Исполнитель: <strong className="text-stone-300">Самозанятый Ирхин Антон</strong> · ИНН: <strong className="text-amber-300 font-bold">614007827150</strong> · e-mail: <a href="mailto:irhinanton@gmail.com" className="text-amber-400 hover:underline">irhinanton@gmail.com</a>
          </div>
          <div>
            <a
              href="/requisites"
              onClick={(e) => {
                e.preventDefault();
                if (typeof window !== 'undefined') {
                  window.history.pushState({}, '', '/requisites');
                }
                setIsRequisitesRoute(true);
              }}
              className="text-amber-400 hover:underline cursor-pointer"
            >
              Официальная страница реквизитов (banya-school.ru/requisites) →
            </a>
          </div>
        </div>
      </footer>

      {/* Mobile Sticky Bottom Navigation Bar */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenClub={() => handleOpenClub('chat')}
        onOpenProfile={() => setShowProfileModal(true)}
        onScrollToMap={handleScrollToMap}
        onOpenLesson={() => {
          setShowHero(false);
          setActiveTab('quest');
        }}
        onShowInDevelopment={(feature) => setInDevelopmentFeature(feature)}
        onRequireLevel3={(feature) => setLockedFeatureModal(feature)}
        progress={progress}
      />

      {/* Small "In Development" Popup Window (Маленькое окошко «В разработке») */}
      <InDevelopmentModal
        isOpen={Boolean(inDevelopmentFeature)}
        onClose={() => setInDevelopmentFeature(null)}
        featureName={inDevelopmentFeature || ''}
      />

      {/* Small "Locked: Available from Level 3" Popup Window */}
      <LevelLockModal
        isOpen={Boolean(lockedFeatureModal)}
        onClose={() => setLockedFeatureModal(null)}
        onGoToQuest={() => {
          setLockedFeatureModal(null);
          setShowHero(false);
          setActiveTab('quest');
          setQuestViewMode('lesson');
        }}
        featureName={lockedFeatureModal || ''}
      />
    </div>
  );
}
