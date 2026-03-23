import { PrismaClient } from '@prisma/client';
import { redisService } from '@/shared/services/redis.service';
import { websocketService } from '@/shared/services/websocket.service';
import { logger } from '@/shared/utils/logger.utils';

const prisma = new PrismaClient();

const ACHIEVEMENT_PROGRESS_TTL = 3600;

type AchievementProgress = {
    xp: number;
    level: number;
    streak: number;
    totalCoursesCompleted: number;
    totalQuizAttempts: number;
    perfectQuizCount: number;
    totalGamesPlayed: number;
    bestGameScore: number;
};

export class AchievementCacheService {
    private getProgressKey(studentId: string): string {
        return `achievement:progress:${studentId}`;
    }

    async getProgress(studentId: string): Promise<AchievementProgress> {
        const cacheKey = this.getProgressKey(studentId);

        try {
            const cached = await redisService.get<AchievementProgress>(cacheKey);
            if (cached) {
                return cached;
            }
        } catch (error) {
            logger.warn('Achievement progress cache read failed, fallback to DB', { studentId, error });
        }

        const progress = await this.buildProgressFromDb(studentId);

        try {
            await redisService.set(cacheKey, progress, ACHIEVEMENT_PROGRESS_TTL);
        } catch (error) {
            logger.warn('Achievement progress cache write failed', { studentId, error });
        }

        return progress;
    }

    async invalidateProgress(studentId: string): Promise<void> {
        const cacheKey = this.getProgressKey(studentId);

        try {
            await redisService.delete(cacheKey);
        } catch (error) {
            logger.warn('Achievement progress cache invalidation failed', { studentId, error });
        }
    }

    async emitUnlocked(studentId: string, achievement: {
        id: string;
        name: string;
        description: string;
        icon?: string | null;
        xpReward?: number;
    }): Promise<void> {
        const student = await prisma.student.findUnique({
            where: { id: studentId },
            select: { userId: true },
        });

        if (!student) {
            logger.warn('Cannot emit achievement unlocked event: student not found', { studentId });
            return;
        }

        websocketService.emitAchievementUnlocked(student.userId, achievement);
    }

    private async buildProgressFromDb(studentId: string): Promise<AchievementProgress> {
        const [student, enrollments, quizAttempts, gameStats] = await Promise.all([
            prisma.student.findUnique({
                where: { id: studentId },
                select: {
                    xp: true,
                    level: true,
                    streak: true,
                },
            }),
            prisma.enrollment.count({
                where: {
                    studentId,
                    completedAt: { not: null },
                },
            }),
            prisma.quizAttempt.findMany({
                where: { studentId },
                select: { score: true },
            }),
            prisma.gameScore.aggregate({
                where: { studentId },
                _count: { _all: true },
                _max: { score: true },
            }),
        ]);

        if (!student) {
            throw new Error('Student not found');
        }

        return {
            xp: student.xp,
            level: student.level,
            streak: student.streak,
            totalCoursesCompleted: enrollments,
            totalQuizAttempts: quizAttempts.length,
            perfectQuizCount: quizAttempts.filter((attempt) => attempt.score === 100).length,
            totalGamesPlayed: gameStats._count._all,
            bestGameScore: gameStats._max.score || 0,
        };
    }
}

export const achievementCacheService = new AchievementCacheService();
