import { PrismaClient, Achievement, AchievementType } from '@prisma/client';
import { logger } from '@/shared/utils/logger.utils';
import { achievementCacheService } from './achievement-cache.service';
import {
  AchievementCondition,
  AchievementWithCondition,
  UnlockedAchievement,
} from './achievement.types';
import { CreateAchievementDTO, UpdateAchievementDTO } from './achievement.dto';
import { notificationService } from '@/shared/services/notification.service';
import { RewardTrigger } from '../reward/reward.types';

const prisma = new PrismaClient();

export class AchievementService {
  async createAchievement(input: CreateAchievementDTO): Promise<Achievement> {
    return prisma.achievement.create({
      data: {
        ...input,
        condition: input.condition,
      },
    });
  }

  async updateAchievement(id: string, input: UpdateAchievementDTO): Promise<Achievement> {
    return prisma.achievement.update({
      where: { id },
      data: {
        ...input,
        ...(input.condition ? { condition: input.condition } : {}),
      },
    });
  }

  async getAllAchievements(studentId?: string): Promise<Array<Achievement & { unlocked: boolean }>> {
    const achievements = await prisma.achievement.findMany({
      orderBy: [{ type: 'asc' }, { createdAt: 'asc' }],
    });

    if (!studentId) {
      return achievements.map((item) => ({
        ...item,
        unlocked: false,
      }));
    }

    const unlocked = await prisma.studentAchievement.findMany({
      where: { studentId },
      select: { achievementId: true },
    });

    const unlockedSet = new Set(unlocked.map((item) => item.achievementId));

    return achievements.map((item) => ({
      ...item,
      unlocked: unlockedSet.has(item.id),
    }));
  }

  async getStudentAchievements(studentId: string): Promise<UnlockedAchievement[]> {
    const unlocked = await prisma.studentAchievement.findMany({
      where: { studentId },
      include: { achievement: true },
      orderBy: { unlockedAt: 'desc' },
    });

    return unlocked.map((item) => ({
      id: item.achievement.id,
      title: item.achievement.title,
      description: item.achievement.description,
      icon: item.achievement.icon,
      type: item.achievement.type,
      xpReward: item.achievement.xpReward,
      unlockedAt: item.unlockedAt,
    }));
  }

  async checkAndUnlock(studentId: string): Promise<UnlockedAchievement[]> {
    const [progress, unlockedRows, allAchievements] = await Promise.all([
      achievementCacheService.getProgress(studentId),
      prisma.studentAchievement.findMany({
        where: { studentId },
        select: { achievementId: true },
      }),
      prisma.achievement.findMany(),
    ]);

    const unlockedSet = new Set(unlockedRows.map((item) => item.achievementId));

    const candidates = allAchievements.filter((achievement) => !unlockedSet.has(achievement.id));

    const toUnlock = candidates.filter((achievement) => this.isAchievementMet(achievement, progress));

    if (toUnlock.length === 0) {
      return [];
    }

    await prisma.$transaction(async (tx) => {
      for (const achievement of toUnlock) {
        await tx.studentAchievement.create({
          data: {
            studentId,
            achievementId: achievement.id,
          },
        });
      }
    });

    // Invalidate because counters/rewards can change right after unlock.
    await achievementCacheService.invalidateProgress(studentId);

    const now = new Date();
    const unlockedAchievements: UnlockedAchievement[] = toUnlock.map((achievement) => ({
      id: achievement.id,
      title: achievement.title,
      description: achievement.description,
      icon: achievement.icon,
      type: achievement.type,
      xpReward: achievement.xpReward,
      unlockedAt: now,
    }));

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { userId: true },
    });

    for (const achievement of unlockedAchievements) {
      await achievementCacheService.emitUnlocked(studentId, {
        id: achievement.id,
        name: achievement.title,
        description: achievement.description,
        icon: achievement.icon,
        xpReward: achievement.xpReward,
      });

      if (student?.userId) {
        notificationService.notifyAchievementUnlock(
          student.userId,
          achievement.title,
          achievement.xpReward
        ).catch((error) => logger.error('Failed to send achievement notification', { error, studentId }));
      }

      if (achievement.xpReward > 0) {
        const { rewardService } = await import('../reward/reward.service');
        await rewardService.grantByTrigger(studentId, RewardTrigger.ACHIEVEMENT_UNLOCK, {
          achievementId: achievement.id,
          achievementTitle: achievement.title,
        });
      }
    }

    return unlockedAchievements;
  }

  private isAchievementMet(
    achievement: Achievement,
    progress: {
      xp: number;
      level: number;
      streak: number;
      totalCoursesCompleted: number;
      totalQuizAttempts: number;
      perfectQuizCount: number;
      totalGamesPlayed?: number;
      bestGameScore?: number;
    }
  ): boolean {
    const normalized = achievement as AchievementWithCondition;
    const required = this.getRequiredValue(normalized.condition);

    switch (achievement.type) {
      case AchievementType.COURSE_COMPLETION:
        return progress.totalCoursesCompleted >= required;
      case AchievementType.QUIZ_MASTER:
        return progress.perfectQuizCount >= required;
      case AchievementType.STREAK_KEEPER:
        return progress.streak >= required;
      case AchievementType.LEVEL_UP:
        return progress.level >= required;
      case AchievementType.GAME_CHAMPION:
        return (progress.totalGamesPlayed || 0) >= required;
      default:
        logger.warn('Unknown achievement type, skipping', { achievementType: achievement.type, achievementId: achievement.id });
        return false;
    }
  }

  private getRequiredValue(condition: AchievementCondition): number {
    return Number(condition?.required || 0);
  }
}

export const achievementService = new AchievementService();
