import { Achievement, AchievementType } from '@prisma/client';

export type AchievementCondition = {
  required: number;
};

export type AchievementProgress = {
  xp: number;
  level: number;
  streak: number;
  totalCoursesCompleted: number;
  totalQuizAttempts: number;
  perfectQuizCount: number;
  totalGamesPlayed?: number;
  bestGameScore?: number;
};

export type AchievementWithCondition = Omit<Achievement, 'condition'> & {
  condition: AchievementCondition;
};

export type UnlockedAchievement = {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: AchievementType;
  xpReward: number;
  unlockedAt: Date;
};
