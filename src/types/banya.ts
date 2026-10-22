export type BadgeId = 
  | 'golden_broom' 
  | 'silver_gloves' 
  | 'golden_bowl' 
  | 'health_shield' 
  | 'physio_hourglass'
  | 'master_title' 
  | 'golden_key' 
  | 'master_crown'
  | 'stove_master_artifact';

export interface Badge {
  id: BadgeId;
  name: string;
  description: string;
  icon: string;
  unlockedAtLevel: number;
  toolType?: 'equipment' | 'key' | 'trophy';
  howToUse?: string;
  nextLevelSynergy?: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
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
  tasks?: { id: string; title: string }[];
  rewardBadge: BadgeId;
  rewardXp: number;
  interestingFact: string;
  proTip: string;
  summary: string;
  learningPoints: {
    title: string;
    description: string;
    highlight?: string;
    isSpecialSafetyBlock?: boolean;
    isBroomPrepBlock?: boolean;
  }[];
  interactiveType: 'first_steam' | 'broom_techniques' | 'herbal_bar' | 'safety_triage' | 'emergency_cases' | 'master_growth' | 'final_exam' | 'biomechanics_steam' | 'physiology_thermal' | 'guest_service';
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
  purpose: string; // Для чего и на что направлен
  execution: string; // Как выполняют
  guestSensations: string; // Ощущения гостя
  zone: string;
  frequency: number; // beats per minute for rhythm simulation
  videoUrl?: string; // Video URL or path
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

export type XpPerkId =
  | 'course_discount_250'
  | 'course_discount_300'
  | 'course_discount_500'
  | 'course_discount_800'
  | 'bonus_recipes_pack'
  | 'shop_voucher_500'
  | 'pro_gift_1000'
  | 'simulators_trial_pass';

export interface UserProgress {
  name: string;
  xp: number;
  spentXp?: number;
  xpDiscountRub?: number;
  unlockedPerks?: XpPerkId[];
  referralCount?: number;
  referralShareCount?: number;
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
  avatarUrl?: string;
  bio?: string;
  banyaStatus?: string;
  city?: string;
  favoriteBrooms?: string[];
  isAdmin?: boolean;
}

