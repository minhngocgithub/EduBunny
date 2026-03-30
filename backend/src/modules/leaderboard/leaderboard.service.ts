import { redisService } from '@/shared/services/redis.service';
import { PrismaClient, Grade, Subject } from '@prisma/client';
import { logger } from '@/shared/utils/logger.utils';

const prisma = new PrismaClient();

interface LeaderboardEntry {
    studentId: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
    totalPoints: number;
    rank: number;
}

interface LeaderboardFilters {
    grade?: Grade;
    subject?: Subject;
    timeframe?: 'alltime' | 'monthly' | 'weekly';
}

export class LeaderboardService {
    /**
     * Generate Redis key for leaderboard
     * Pattern: leaderboard:{grade}:{subject}:{timeframe}
     */
    private getLeaderboardKey(filters: LeaderboardFilters): string {
        const grade = filters.grade || 'all';
        const subject = filters.subject || 'all';
        const timeframe = filters.timeframe || 'alltime';
        return `leaderboard:${grade}:${subject}:${timeframe}`;
    }

    /**
     * Add or update student score in leaderboard
     * Uses Redis Sorted Set for efficient ranking
     */
    async updateStudentScore(
        studentId: string,
        points: number,
        filters: LeaderboardFilters = {}
    ): Promise<void> {
        const key = this.getLeaderboardKey(filters);

        // Add score to sorted set (ZADD automatically updates if exists)
        await redisService.zAdd(key, points, studentId);

        logger.info(`Leaderboard updated: ${studentId} with ${points} points in ${key}`);
    }

    /**
     * Increment student score in leaderboard
     * Use this when student earns additional points
     */
    async incrementStudentScore(
        studentId: string,
        pointsToAdd: number,
        filters: LeaderboardFilters = {}
    ): Promise<number> {
        const key = this.getLeaderboardKey(filters);

        // Increment score (ZINCRBY)
        const newScore = await redisService.zIncrBy(key, pointsToAdd, studentId);

        logger.info(`Student ${studentId} earned ${pointsToAdd} points, new score: ${newScore}`);

        return parseFloat(newScore);
    }

    /**
     * Get top N students from leaderboard
     * Returns students sorted by score (highest to lowest)
     */
    async getTopStudents(
        limit: number = 10,
        filters: LeaderboardFilters = {}
    ): Promise<LeaderboardEntry[]> {
        const key = this.getLeaderboardKey(filters);

        // Get top N students with scores (ZREVRANGE with WITHSCORES)
        const results = await redisService.zRevRange(key, 0, limit - 1, true);

        // Parse results (format: [member1, score1, member2, score2, ...])
        const leaderboard: LeaderboardEntry[] = [];
        for (let i = 0; i < results.length; i += 2) {
            const studentId = results[i];
            const totalPoints = parseFloat(results[i + 1]);

            // Fetch student details from database
            const student = await prisma.student.findUnique({
                where: { id: studentId },
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    avatar: true,
                },
            });

            if (student) {
                leaderboard.push({
                    studentId: student.id,
                    firstName: student.firstName,
                    lastName: student.lastName,
                    avatar: student.avatar,
                    totalPoints,
                    rank: Math.floor(i / 2) + 1, // Calculate rank (1-indexed)
                });
            }
        }

        return leaderboard;
    }

    /**
     * Get student rank in leaderboard
     * Returns null if student not in leaderboard
     */
    async getStudentRank(
        studentId: string,
        filters: LeaderboardFilters = {}
    ): Promise<{ rank: number; totalPoints: number } | null> {
        const key = this.getLeaderboardKey(filters);

        // Get rank (0-indexed, so add 1 for human-readable rank)
        const rank = await redisService.zRevRank(key, studentId);
        if (rank === null) {
            return null;
        }

        // Get score
        const score = await redisService.zScore(key, studentId);
        if (score === null) {
            return null;
        }

        return {
            rank: rank + 1, // Convert to 1-indexed
            totalPoints: parseFloat(score),
        };
    }

    /**
     * Get students around a specific student (for context)
     * Example: If student is rank 50, return ranks 45-55
     */
    async getStudentsAroundRank(
        studentId: string,
        range: number = 5,
        filters: LeaderboardFilters = {}
    ): Promise<LeaderboardEntry[]> {
        const key = this.getLeaderboardKey(filters);

        // Get student's rank
        const studentRank = await redisService.zRevRank(key, studentId);
        if (studentRank === null) {
            return [];
        }

        // Calculate range
        const start = Math.max(0, studentRank - range);
        const end = studentRank + range;

        // Get students in range
        const results = await redisService.zRevRange(key, start, end, true);

        // Parse results
        const leaderboard: LeaderboardEntry[] = [];
        for (let i = 0; i < results.length; i += 2) {
            const sid = results[i];
            const totalPoints = parseFloat(results[i + 1]);

            const student = await prisma.student.findUnique({
                where: { id: sid },
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    avatar: true,
                },
            });

            if (student) {
                leaderboard.push({
                    studentId: student.id,
                    firstName: student.firstName,
                    lastName: student.lastName,
                    avatar: student.avatar,
                    totalPoints,
                    rank: start + Math.floor(i / 2) + 1,
                });
            }
        }

        return leaderboard;
    }

    /**
     * Get total number of students in leaderboard
     */
    async getLeaderboardSize(filters: LeaderboardFilters = {}): Promise<number> {
        const key = this.getLeaderboardKey(filters);
        return await redisService.zCard(key);
    }

    /**
     * Rebuild leaderboard from database
     * Use this for initial setup or when Redis data is lost
     */
    async rebuildLeaderboard(filters: LeaderboardFilters = {}): Promise<number> {
        const key = this.getLeaderboardKey(filters);

        logger.info(`Rebuilding leaderboard: ${key}`);

        // Delete existing leaderboard
        await redisService.delete(key);

        // Build query filters
        const whereClause: { grade?: Grade } = {};
        if (filters.grade) {
            whereClause.grade = filters.grade;
        }

        // Fetch all students with their points
        const students = await prisma.student.findMany({
            where: whereClause,
            select: {
                id: true,
                xp: true,
            },
        });

        // Add all students to sorted set
        let count = 0;
        for (const student of students) {
            if (student.xp > 0) {
                await redisService.zAdd(key, student.xp, student.id);
                count++;
            }
        }

        logger.info(`Leaderboard rebuilt: ${count} students added to ${key}`);

        return count;
    }

    /**
     * Remove student from leaderboard
     */
    async removeStudent(studentId: string, filters: LeaderboardFilters = {}): Promise<boolean> {
        const key = this.getLeaderboardKey(filters);
        const result = await redisService.zRem(key, studentId);
        return result > 0;
    }

    /**
     * Clear entire leaderboard
     */
    async clearLeaderboard(filters: LeaderboardFilters = {}): Promise<void> {
        const key = this.getLeaderboardKey(filters);
        await redisService.delete(key);
        logger.info(`Leaderboard cleared: ${key}`);
    }
}

export const leaderboardService = new LeaderboardService();
