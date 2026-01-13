import { PrismaClient, ActivityType } from '@prisma/client';
import {
    ActivityLogDetail,
    DailyProgressSummary,
    WeeklyProgressReport,
    ChildrenProgressSummary,
    RealtimeActivityEvent,
} from './monitoring.types';
import { websocketService } from '@/shared/services/websocket.service';
import { notificationService } from '@/shared/services/notification.service';
import { logger } from '@/shared/utils/logger.utils';
import { rewardService } from '../reward/reward.service';
import { RewardCategory } from '@prisma/client';

const prisma = new PrismaClient();

export class MonitoringService {
    /**
     * Get activity log for a child
     */
    async getActivityLog(childId: string, timeRange: 'today' | 'week' | 'month' = 'week'): Promise<ActivityLogDetail[]> {
        const now = new Date();
        let startDate: Date;

        switch (timeRange) {
            case 'today':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                break;
            case 'week':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'month':
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
        }

        const activities = await prisma.activityLog.findMany({
            where: {
                userId: childId,
                createdAt: { gte: startDate },
            },
            orderBy: { createdAt: 'desc' },
            take: 100,
            include: {
                user: {
                    include: {
                        student: {
                            select: {
                                firstName: true,
                                lastName: true,
                            },
                        },
                    },
                },
            },
        });

        return activities.map(activity => ({
            ...activity,
            user: activity.user ? {
                id: activity.user.id,
                email: activity.user.email,
                role: activity.user.role,
                student: activity.user.student ? {
                    firstName: activity.user.student.firstName,
                    lastName: activity.user.student.lastName,
                } : undefined,
            } : undefined,
        }));
    }

    /**
     * Get daily progress summary
     */
    async getDailyProgress(childId: string, date?: Date): Promise<DailyProgressSummary> {
        const targetDate = date || new Date();
        const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
        const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

        // Get activities for the day
        const activities = await prisma.activityLog.findMany({
            where: {
                userId: childId,
                createdAt: {
                    gte: startOfDay,
                    lt: endOfDay,
                },
            },
        });

        // Get progress for the day
        const progress = await prisma.progress.findMany({
            where: {
                studentId: childId,
                completedAt: {
                    gte: startOfDay,
                    lt: endOfDay,
                },
            },
            include: {
                lecture: {
                    include: {
                        course: true,
                    },
                },
            },
        });

        // Get quiz attempts for the day
        const quizAttempts = await prisma.quizAttempt.findMany({
            where: {
                studentId: childId,
                startedAt: {
                    gte: startOfDay,
                    lt: endOfDay,
                },
            },
            include: {
                quiz: true,
            },
        });

        // Get achievements unlocked for the day
        const achievements = await prisma.studentAchievement.findMany({
            where: {
                studentId: childId,
                unlockedAt: {
                    gte: startOfDay,
                    lt: endOfDay,
                },
            },
            include: {
                achievement: true,
            },
        });

        // Calculate time spent (sum of watched seconds / 60)
        const timeSpentLearning = progress.reduce((sum, p) => sum + p.watchedSeconds, 0) / 60;

        // Get unique courses accessed
        const coursesAccessed = new Set(progress.map(p => p.lecture.courseId)).size;

        // Activity breakdown
        const activityBreakdown = new Map<ActivityType, number>();
        activities.forEach(activity => {
            activityBreakdown.set(activity.type, (activityBreakdown.get(activity.type) || 0) + 1);
        });

        return {
            date: targetDate.toISOString().split('T')[0],
            coursesAccessed,
            lecturesCompleted: progress.filter(p => p.isCompleted).length,
            timeSpentLearning,
            quizScores: quizAttempts.map(attempt => ({
                quizId: attempt.quizId,
                quizTitle: attempt.quiz.title,
                score: attempt.score,
            })),
            achievementsUnlocked: achievements.map(a => ({
                id: a.achievementId,
                title: a.achievement.title,
                unlockedAt: a.unlockedAt,
            })),
            activityBreakdown: Array.from(activityBreakdown.entries()).map(([type, count]) => ({
                type,
                count,
            })),
        };
    }

    /**
     * Generate daily report
     */
    async generateDailyReport(childId: string, date?: Date): Promise<DailyProgressSummary> {
        return this.getDailyProgress(childId, date);
    }

    /**
     * Send daily progress email to parent
     */
    async sendDailyProgressEmail(parentId: string, childId: string, date?: Date): Promise<void> {
        // Get parent info
        const parent = await prisma.parent.findUnique({
            where: { userId: parentId },
            include: {
                user: true,
            },
        });

        if (!parent) {
            throw new Error('Parent not found');
        }

        // Get child info
        const child = await prisma.student.findUnique({
            where: { id: childId },
        });

        if (!child || child.parentId !== parent.id) {
            throw new Error('Child not found or not linked to parent');
        }

        const dailyProgress = await this.generateDailyReport(childId, date);

        // Send email
        await notificationService.sendDailyProgressEmail({
            childName: `${child.firstName} ${child.lastName}`,
            parentEmail: parent.user.email,
            date: dailyProgress.date,
            coursesAccessed: dailyProgress.coursesAccessed,
            lecturesCompleted: dailyProgress.lecturesCompleted,
            timeSpentLearning: dailyProgress.timeSpentLearning,
            quizScores: dailyProgress.quizScores,
            achievementsUnlocked: dailyProgress.achievementsUnlocked,
        });
    }

    /**
     * Get weekly progress report
     */
    async getWeeklyReport(childId: string, weekStart?: Date): Promise<WeeklyProgressReport> {
        const start = weekStart || this.getWeekStart(new Date());
        const end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
        const previousWeekStart = new Date(start.getTime() - 7 * 24 * 60 * 60 * 1000);
        const previousWeekEnd = start;

        // Get all progress for the week
        const progress = await prisma.progress.findMany({
            where: {
                studentId: childId,
                lastWatchedAt: {
                    gte: start,
                    lt: end,
                },
            },
            include: {
                lecture: {
                    include: {
                        course: true,
                    },
                },
            },
        });

        // Get enrollments completed this week
        const enrollments = await prisma.enrollment.findMany({
            where: {
                studentId: childId,
                completedAt: {
                    gte: start,
                    lt: end,
                },
            },
        });

        // Get quiz attempts for the week
        const quizAttempts = await prisma.quizAttempt.findMany({
            where: {
                studentId: childId,
                startedAt: {
                    gte: start,
                    lt: end,
                },
            },
        });

        // Get achievements unlocked this week
        const achievements = await prisma.studentAchievement.findMany({
            where: {
                studentId: childId,
                unlockedAt: {
                    gte: start,
                    lt: end,
                },
            },
        });

        // Get student info
        const student = await prisma.student.findUnique({
            where: { id: childId },
        });

        // Calculate statistics
        const totalTimeSpent = progress.reduce((sum, p) => sum + p.watchedSeconds, 0) / 60;
        const lecturesCompleted = progress.filter(p => p.isCompleted).length;
        const quizzesTaken = quizAttempts.length;
        const averageQuizScore = quizAttempts.length > 0
            ? quizAttempts.reduce((sum, a) => sum + a.score, 0) / quizAttempts.length
            : 0;

        // Progress trends (daily breakdown)
        const trendsMap = new Map<string, { timeSpent: number; lecturesCompleted: number }>();
        for (let i = 0; i < 7; i++) {
            const day = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
            const dayStr = day.toISOString().split('T')[0];
            trendsMap.set(dayStr, { timeSpent: 0, lecturesCompleted: 0 });
        }

        progress.forEach(p => {
            const dayStr = p.lastWatchedAt.toISOString().split('T')[0];
            const trend = trendsMap.get(dayStr);
            if (trend) {
                trend.timeSpent += p.watchedSeconds / 60;
                if (p.isCompleted) {
                    trend.lecturesCompleted++;
                }
            }
        });

        const progressTrends = Array.from(trendsMap.entries()).map(([date, data]) => ({
            date,
            ...data,
        }));

        // Subject breakdown for strengths/weaknesses
        const subjectMap = new Map<string, { scores: number[]; coursesCompleted: number }>();
        
        enrollments.forEach(enrollment => {
            const course = enrollment as any; // Will be loaded with course
            // This will be populated by joining with courses
        });

        // Get courses for enrollments
        const courseIds = enrollments.map(e => e.courseId);
        const courses = await prisma.course.findMany({
            where: { id: { in: courseIds } },
        });

        enrollments.forEach(enrollment => {
            const course = courses.find(c => c.id === enrollment.courseId);
            if (course) {
                const existing = subjectMap.get(course.subject) || { scores: [], coursesCompleted: 0 };
                if (enrollment.completedAt) {
                    existing.coursesCompleted++;
                }
                subjectMap.set(course.subject, existing);
            }
        });

        // Add quiz scores by subject
        quizAttempts.forEach(attempt => {
            const quiz = attempt as any; // Will need to join with quiz.course
        });

        const quizIds = quizAttempts.map(a => a.quizId);
        const quizzes = await prisma.quiz.findMany({
            where: { id: { in: quizIds } },
            include: { course: true },
        });

        quizAttempts.forEach(attempt => {
            const quiz = quizzes.find(q => q.id === attempt.quizId);
            if (quiz) {
                const existing = subjectMap.get(quiz.course.subject) || { scores: [], coursesCompleted: 0 };
                existing.scores.push(attempt.score);
                subjectMap.set(quiz.course.subject, existing);
            }
        });

        const strengths: Array<{ subject: string; averageScore: number; coursesCompleted: number }> = [];
        const weaknesses: Array<{ subject: string; averageScore: number; recommendation: string }> = [];

        subjectMap.forEach((data, subject) => {
            const avgScore = data.scores.length > 0
                ? data.scores.reduce((sum, s) => sum + s, 0) / data.scores.length
                : 0;

            if (avgScore >= 80) {
                strengths.push({
                    subject,
                    averageScore: avgScore,
                    coursesCompleted: data.coursesCompleted,
                });
            } else if (avgScore < 70 && data.scores.length > 0) {
                weaknesses.push({
                    subject,
                    averageScore: avgScore,
                    recommendation: `Cần ôn tập thêm về ${subject}`,
                });
            }
        });

        // Get previous week data for comparison
        const previousWeekProgress = await prisma.progress.findMany({
            where: {
                studentId: childId,
                lastWatchedAt: {
                    gte: previousWeekStart,
                    lt: previousWeekEnd,
                },
            },
        });

        const previousWeekTime = previousWeekProgress.reduce((sum, p) => sum + p.watchedSeconds, 0) / 60;
        const previousWeekLectures = previousWeekProgress.filter(p => p.isCompleted).length;
        const previousWeekCourses = await prisma.enrollment.count({
            where: {
                studentId: childId,
                completedAt: {
                    gte: previousWeekStart,
                    lt: previousWeekEnd,
                },
            },
        });

        const timeSpentChange = previousWeekTime > 0
            ? ((totalTimeSpent - previousWeekTime) / previousWeekTime) * 100
            : 0;

        // Generate recommendations
        const recommendations: string[] = [];
        if (timeSpentChange < -10) {
            recommendations.push('Thời gian học tập giảm so với tuần trước. Hãy động viên con học đều đặn hơn.');
        }
        if (weaknesses.length > 0) {
            recommendations.push(`Nên tập trung cải thiện các môn: ${weaknesses.map(w => w.subject).join(', ')}`);
        }
        if (strengths.length > 0) {
            recommendations.push(`Tiếp tục phát huy điểm mạnh ở các môn: ${strengths.map(s => s.subject).join(', ')}`);
        }

        return {
            weekStart: start,
            weekEnd: end,
            statistics: {
                totalTimeSpent,
                coursesCompleted: enrollments.filter(e => e.completedAt).length,
                lecturesCompleted,
                quizzesTaken,
                averageQuizScore,
                achievementsUnlocked: achievements.length,
                currentStreak: student?.streak || 0,
            },
            progressTrends,
            strengths,
            weaknesses,
            recommendations,
            comparison: {
                previousWeek: {
                    timeSpent: previousWeekTime,
                    lecturesCompleted: previousWeekLectures,
                    coursesCompleted: previousWeekCourses,
                },
                change: {
                    timeSpent: timeSpentChange,
                    lecturesCompleted: lecturesCompleted - previousWeekLectures,
                    coursesCompleted: enrollments.filter(e => e.completedAt).length - previousWeekCourses,
                },
            },
        };
    }

    /**
     * Generate and send weekly report
     */
    async sendWeeklyProgressEmail(parentId: string, childId: string, weekStart?: Date): Promise<void> {
        // Get parent info
        const parent = await prisma.parent.findUnique({
            where: { userId: parentId },
            include: {
                user: true,
            },
        });

        if (!parent) {
            throw new Error('Parent not found');
        }

        // Get child info
        const child = await prisma.student.findUnique({
            where: { id: childId },
        });

        if (!child || child.parentId !== parent.id) {
            throw new Error('Child not found or not linked to parent');
        }

        const weeklyReport = await this.getWeeklyReport(childId, weekStart);

        // Send email
        await notificationService.sendWeeklyProgressEmail({
            childName: `${child.firstName} ${child.lastName}`,
            parentEmail: parent.user.email,
            weekStart: weeklyReport.weekStart.toISOString().split('T')[0],
            weekEnd: weeklyReport.weekEnd.toISOString().split('T')[0],
            statistics: weeklyReport.statistics,
            progressTrends: weeklyReport.progressTrends,
            strengths: weeklyReport.strengths,
            weaknesses: weeklyReport.weaknesses,
            recommendations: weeklyReport.recommendations,
            comparison: weeklyReport.comparison,
        });
    }

    /**
     * Get all children progress for a parent
     */
    async getChildrenProgress(parentId: string): Promise<ChildrenProgressSummary> {
        // Get parent
        const parent = await prisma.parent.findUnique({
            where: { userId: parentId },
            include: {
                children: true,
            },
        });

        if (!parent) {
            throw new Error('Parent not found');
        }

        const childrenData = await Promise.all(
            parent.children.map(async (child) => {
                // Get recent activities (last 10)
                const activities = await this.getActivityLog(child.id, 'week');

                // Get statistics
                const enrollments = await prisma.enrollment.findMany({
                    where: { studentId: child.id },
                });

                const completedEnrollments = enrollments.filter(e => e.completedAt);

                const quizAttempts = await prisma.quizAttempt.findMany({
                    where: { studentId: child.id },
                });

                const averageQuizScore = quizAttempts.length > 0
                    ? quizAttempts.reduce((sum, a) => sum + a.score, 0) / quizAttempts.length
                    : 0;

                return {
                    id: child.id,
                    firstName: child.firstName,
                    lastName: child.lastName,
                    avatar: child.avatar,
                    grade: child.grade,
                    statistics: {
                        level: child.level,
                        xp: child.xp,
                        streak: child.streak,
                        coursesCompleted: completedEnrollments.length,
                        averageQuizScore,
                    },
                    recentActivity: activities.slice(0, 10),
                };
            })
        );

        return {
            children: childrenData,
        };
    }

    /**
     * Log activity and emit real-time event
     */
    async logActivity(
        userId: string,
        type: ActivityType,
        metadata?: Record<string, unknown>
    ): Promise<void> {
        // Create activity log
        const activity = await prisma.activityLog.create({
            data: {
                userId,
                type,
                metadata: metadata || null,
            },
        });

        // Update streak on any activity (will handle logic internally)
        try {
            await rewardService.updateStreak(userId);
            
            // Grant daily login reward if this is first activity today
            if (type === ActivityType.LOGIN) {
                await rewardService.grantReward({
                    studentId: userId,
                    category: RewardCategory.DAILY_LOGIN,
                });
            }
        } catch (error) {
            logger.error('Failed to update streak or grant daily reward:', error);
        }

        // Get student info to find parent
        const student = await prisma.student.findUnique({
            where: { id: userId },
            include: {
                parent: {
                    include: {
                        user: true,
                    },
                },
            },
        });

        // If student has parent, emit real-time event
        if (student?.parent) {
            websocketService.emitActivityEvent(student.parent.userId, userId, {
                type,
                metadata: metadata || null,
                timestamp: activity.createdAt,
            });
        }

        logger.info(`Activity logged: ${type} for user ${userId}`);
    }

    /**
     * Subscribe parent to child activity (for SSE)
     */
    subscribeToChildActivity(parentId: string, childId: string): void {
        // WebSocket subscription is handled in websocket service
        // This method is for compatibility
        logger.info(`Parent ${parentId} subscribed to child ${childId} activity`);
    }

    /**
     * Get week start (Monday)
     */
    private getWeekStart(date: Date): Date {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
        return new Date(d.setDate(diff));
    }
}

export const monitoringService = new MonitoringService();

