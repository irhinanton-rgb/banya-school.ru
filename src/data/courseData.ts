import { LevelData } from '../types/banya';
import { LEVELS_PART_1 } from './levelsPart1';
import { LEVELS_PART_2, FINAL_EXAM_QUESTIONS } from './levelsPart2';
import {
  BADGES,
  HERBS_DATA,
  BROOM_TECHNIQUES,
  GUEST_CASES,
  EMERGENCY_EVENTS,
  LEADERBOARD_CREW,
} from './referenceData';

export const COURSE_LEVELS: LevelData[] = [...LEVELS_PART_1, ...LEVELS_PART_2];

export {
  BADGES,
  HERBS_DATA,
  BROOM_TECHNIQUES,
  GUEST_CASES,
  EMERGENCY_EVENTS,
  FINAL_EXAM_QUESTIONS,
  LEADERBOARD_CREW,
};
