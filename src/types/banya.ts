export type BadgeId = 
  | 'golden_broom' 
  | 'silver_gloves' 
  | 'golden_bowl' 
  | 'health_shield' 
  | 'master_title' 
  | 'golden_key' 
  | 'master_crown';

export interface Badge {
  id: BadgeId;
  name: string;
  description: string;
  icon: string;
  unlockedAtLevel: number;
}

export type LevelId = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  proTip?: string;
}

export interface InteractiveStep {
  title: string;
  subtitle: string;
  description: string;
  keyRule: string;
  iconName: string;
}

export interface LevelData {
  id: LevelId;
  number: number;
  slug: string;
  title: string;
  questName: string;
  taskTitle: string;
  rewardBadge: BadgeId;
  rewardXp: number;
  interestingFact: string;
  proTip: string;
  summary: string;
  learningPoints: {
    title: string;
    description: string;
    highlight?: string;
  }[];
  interactiveType: 'first_steam' | 'broom_techniques' | 'herbal_bar' | 'safety_triage' | 'emergency_cases' | 'master_growth' | 'final_exam';
  quiz: QuizQuestion[];
}

export interface HerbInfo {
  id: string;
  name: string;
  botanicalName: string;
  properties: string;
  usage: string;
  category: 'relax' | 'detox' | 'respiratory' | 'tonus';
  icon: string;
  contraindicatedFor?: string;
}

export interface BroomTechnique {
  id: string;
  name: string;
  tempo: 'Медленный' | 'Средний' | 'Ритмичный' | 'Пульсирующий';
  description: string;
  execution: string;
  purpose: string;
  zone: string;
  frequency: number; // beats per minute for rhythm simulation
  videoUrl?: string; // YouTube embed or watch URL
}

export interface GuestCase {
  id: string;
  guestName: string;
  avatarText: string;
  age: number;
  request: string;
  symptoms: string[];
  bloodPressure: string;
  medicalConditions: string[];
  correctDecision: 'allow_standard' | 'allow_gentle_adapted' | 'strictly_prohibited';
  reasoning: string;
}

export interface RandomEmergencyEvent {
  id: string;
  title: string;
  situation: string;
  options: {
    text: string;
    isCorrect: boolean;
    feedback: string;
  }[];
  safetyRule: string;
}

export type UserTariff = 'free' | 'master_pro';

export interface UserProgress {
  name: string;
  xp: number;
  completedLevels: LevelId[];
  unlockedBadges: BadgeId[];
  quizScores: Record<LevelId, number>;
  activeLevelId: LevelId;
  examScore?: number;
  certifiedDate?: string;
  soundEnabled: boolean;
  tariff?: UserTariff;
  isPaid?: boolean;
  paidAt?: string;
  orderId?: string;
}
