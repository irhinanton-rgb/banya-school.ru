/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HeroIntro } from './components/HeroIntro';
import { QuestMap } from './components/QuestMap';
import { LevelViewer } from './components/LevelViewer';
import { BadgesShowcase } from './components/BadgesShowcase';
import { SimulatorsHub } from './components/SimulatorsHub';
import { HandbookView } from './components/HandbookView';
import { EmergencyEventModal } from './components/simulators/EmergencyEventModal';
import { FinalExamModal } from './components/FinalExamModal';
import { CertificateModal } from './components/CertificateModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { AuthModal } from './components/AuthModal';
import { PricingModal } from './components/PricingModal';
import { LegalModal } from './components/LegalModal';
import { CommunityClubModal } from './components/CommunityClubModal';
import { UserProfileModal } from './components/profile/UserProfileModal';
import { COURSE_LEVELS, BADGES } from './data/courseData';
import { UserProgress, LevelId, BadgeId } from './types/banya';
import { useAuth } from './firebase/AuthContext';
import {
  syncProgressToCloud,
  fetchProgressFromCloud,
  mergeUserProgress,
} from './firebase/progressSync';

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

  const [activeTab, setActiveTab] = useState<'quest' | 'simulators' | 'handbook'>('quest');
  const [showHero, setShowHero] = useState<boolean>(() => (progress?.completedLevels?.length ?? 0) === 0);
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

  const handleOpenClub = (tab: 'chat' | 'webinar' | 'homework' = 'chat') => {
    setClubInitialTab(tab);
    setShowClubModal(true);
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
    setProgress((prev) => ({
      ...prev,
      activeLevelId: levelId,
    }));
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
        activeLevelId: Math.min(7, levelId + 1) as LevelId,
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

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col justify-between selection:bg-amber-600/30 selection:text-amber-200">
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
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Tab 1: Quest Journey */}
        {activeTab === 'quest' && (
          <div className="space-y-10">
            {/* Hero Prologue Banner */}
            {showHero && (
              <HeroIntro
                progress={progress}
                onStartQuest={() => {
                  setShowHero(false);
                  handleSelectLevel(1);
                }}
                onSelectLevel={handleSelectLevel}
              />
            )}

            {/* Level Viewer (Current Selected Station) */}
            <LevelViewer
              level={currentLevelData}
              progress={progress}
              onCompleteLevel={handleCompleteLevel}
              onStartExam={() => setShowExamModal(true)}
              soundEnabled={progress.soundEnabled}
              onGrantXp={handleGrantXp}
              onOpenPricing={() => setShowPricingModal(true)}
            />

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
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-semibold">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Live
                    </span>
                  </div>
                  <p className="text-xs text-stone-400 mt-1 max-w-xl leading-relaxed">
                    Единое окно: живое общение с учениками и наставником, субботние созвоны с разбором техники веников прямо в браузере и сдача видео-заданий.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                <button
                  onClick={() => handleOpenClub('chat')}
                  className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition-all shadow-md cursor-pointer text-center"
                >
                  Общий Чат 💬
                </button>
                <button
                  onClick={() => handleOpenClub('webinar')}
                  className="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 text-xs font-semibold transition-colors cursor-pointer text-center"
                >
                  Видеокомната 📹
                </button>
              </div>
            </div>

            {/* Quest Roadmap Map */}
            <QuestMap
              progress={progress}
              onSelectLevel={handleSelectLevel}
              activeLevelId={progress.activeLevelId}
            />

            {/* Badges / Trophies Shelf */}
            <BadgesShowcase unlockedBadges={progress.unlockedBadges} />
          </div>
        )}

        {/* Tab 2: Free Simulators Hub */}
        {activeTab === 'simulators' && (
          <SimulatorsHub
            soundEnabled={progress.soundEnabled}
            onGrantXp={handleGrantXp}
          />
        )}

        {/* Tab 3: Pocket Handbook */}
        {activeTab === 'handbook' && <HandbookView />}
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

      {/* Community Club Modal (Single hub with Chat, Video Webroom, and Homework Review) */}
      <CommunityClubModal
        isOpen={showClubModal}
        onClose={() => setShowClubModal(false)}
        progress={progress}
        onGrantXp={handleGrantXp}
        initialTab={clubInitialTab}
      />

      {/* Footer */}
      <footer className="w-full border-t border-stone-800/80 bg-stone-950 py-6 print:hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <div>
            © {new Date().getFullYear()} Квест Пармастера: Путь к Мастерству · banya-school.ru
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            <button
              onClick={() => handleOpenClub('chat')}
              className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>🌿 Банный Клуб & Эфиры</span>
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setShowPricingModal(true)}
              className="text-amber-400 hover:text-amber-300 font-semibold transition-colors cursor-pointer"
            >
              ⭐ Тарифы и оплата
            </button>
            <span aria-hidden="true">·</span>
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
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setShowEmergencyModal(true)}
              className="hover:text-amber-400 transition-colors cursor-pointer"
            >
              ЧП в парной
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
