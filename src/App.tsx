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
import { COURSE_LEVELS, BADGES } from './data/courseData';
import { UserProgress, LevelId, BadgeId } from './types/banya';

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

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // ignore
    }
  }, [progress]);

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
            />

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

      {/* Quiet Footer */}
      <footer className="w-full border-t border-stone-800/80 bg-stone-950 py-6 print:hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <div>
            © {new Date().getFullYear()} Квест Пармастера: Путь к Мастерству · Академия Банного Искусства
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('quest')}
              className="hover:text-stone-300 transition-colors"
            >
              Карта Квеста
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setActiveTab('simulators')}
              className="hover:text-stone-300 transition-colors"
            >
              Тренажеры
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setActiveTab('handbook')}
              className="hover:text-stone-300 transition-colors"
            >
              Справочник
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setShowEmergencyModal(true)}
              className="hover:text-amber-400 transition-colors"
            >
              ЧП в парной
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
