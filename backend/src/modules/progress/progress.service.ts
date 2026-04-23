import { PrismaClient, ActivityType } from '@prisma/client';
import {
    ProgressSummary,
    CourseProgressSummary,
    LearningStatistics,
    TrackViewingInput,
} from './progress.types';
import { rewardService } from '../reward/reward.service';
import { RewardTrigger } from '../reward/reward.types';
import { monitoringService } from '../monitoring/monitoring.service';
import { achievementCacheService } from '../achievement/achievement-cache.service';
import { courseAccessService } from '../course/course-access.service';

const prisma = new PrismaClient();

export class ProgressService {
    async getProgressSummary(studentId: string): Promise<ProgressSummary> {
        // Get all enrollments
        const enrollments = await prisma.enrollment.findMany({
            where: { studentId },
            include: {
                course: {
                    include: {
                        lectures: {
                            orderBy: { order: 'asc' },
                        },
                    },
                },
            },
        });

        // Get all progress records
        const allProgress = await prisma.progress.findMany({
            where: { studentId },
        });

        const progressMap = new Map(allProgress.map(p => [p.lectureId, p]));

        let totalLectures = 0;
        let completedLectures = 0;
        let inProgressLectures = 0;
        let totalWatchedTime = 0;

        const courses: CourseProgressSummary[] = enrollments.map(enrollment => {
            const course = enrollment.course;
            const lectures = course.lectures;
            totalLectures += lectures.length;

            let courseCompleted = 0;
            let courseInProgress = 0;
            let courseWatchedTime = 0;

            lectures.forEach(lecture => {
                const progress = progressMap.get(lecture.id);
                if (progress) {
                    courseWatchedTime += progress.watchedSeconds;
                    totalWatchedTime += progress.watchedSeconds;

                    if (progress.isCompleted) {
                        courseCompleted++;
                        completedLectures++;
                    } else if (progress.watchedSeconds > 0) {
                        courseInProgress++;
                        inProgressLectures++;
                    }
                }
            });

            const overallProgress = lectures.length > 0
                ? (courseCompleted / lectures.length) * 100
                : 0;

            return {
                courseId: course.id,
                courseTitle: course.title,
                totalLectures: lectures.length,
                completedLectures: courseCompleted,
                inProgressLectures: courseInProgress,
                notStartedLectures: lectures.length - courseCompleted - courseInProgress,
                overallProgress,
                totalWatchedTime: courseWatchedTime,
                lastAccessedAt: enrollment.lastAccessAt,
                enrollment,
            };
        });

        return {
            totalCourses: enrollments.length,
            totalLectures,
            completedLectures,
            inProgressLectures,
            totalWatchedTime,
            courses,
        };
    }

    async getCourseProgress(studentId: string, courseId: string): Promise<CourseProgressSummary | null> {
        const hasCourseAccess = await courseAccessService.hasCourseAccessByStudentId(studentId, courseId);
        if (!hasCourseAccess) {
            return null;
        }

        await this.ensureEnrollmentRecord(studentId, courseId);

        const enrollment = await prisma.enrollment.findUnique({
            where: {
                studentId_courseId: {
                    studentId,
                    courseId,
                },
            },
        });

        if (!enrollment) {
            return null;
        }

        // Get course with lectures
        const course = await prisma.course.findUnique({
            where: { id: courseId },
            include: {
                lectures: {
                    orderBy: { order: 'asc' },
                },
            },
        });

        if (!course) {
            return null;
        }

        // Get progress for all lectures
        const progressRecords = await prisma.progress.findMany({
            where: {
                studentId,
                lectureId: { in: course.lectures.map(l => l.id) },
            },
        });

        const progressMap = new Map(progressRecords.map(p => [p.lectureId, p]));

        let completed = 0;
        let inProgress = 0;
        let totalWatchedTime = 0;

        course.lectures.forEach(lecture => {
            const progress = progressMap.get(lecture.id);
            if (progress) {
                totalWatchedTime += progress.watchedSeconds;
                if (progress.isCompleted) {
                    completed++;
                } else if (progress.watchedSeconds > 0) {
                    inProgress++;
                }
            }
        });

        const overallProgress = course.lectures.length > 0
            ? (completed / course.lectures.length) * 100
            : 0;

        return {
            courseId: course.id,
            courseTitle: course.title,
            totalLectures: course.lectures.length,
            completedLectures: completed,
            inProgressLectures: inProgress,
            notStartedLectures: course.lectures.length - completed - inProgress,
            overallProgress,
            totalWatchedTime,
            lastAccessedAt: enrollment.lastAccessAt,
            enrollment,
        };
    }

    async getLectureProgress(studentId: string, lectureId: string) {
        const progress = await prisma.progress.findUnique({
            where: {
                studentId_lectureId: {
                    studentId,
                    lectureId,
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

        return progress;
    }

    async trackViewing(studentId: string, input: TrackViewingInput): Promise<void> {
        const { lectureId, watchedSeconds } = input;

        // Verify lecture exists
        const lecture = await prisma.lecture.findUnique({
            where: { id: lectureId },
        });

        if (!lecture) {
            throw new Error('Lecture not found');
        }

        const canWriteProgress = await courseAccessService.canWriteProgressByStudentId(studentId, lectureId);
        if (!canWriteProgress) {
            throw new Error('Active entitlement required to update progress');
        }

        await this.ensureEnrollmentRecord(studentId, lecture.courseId);

        // Calculate completion rate
        const completionRate = lecture.duration > 0
            ? Math.min((watchedSeconds / lecture.duration) * 100, 100)
            : 0;

        // Check if should be marked as completed (>= 90% watched)
        const isCompleted = completionRate >= 90;
        const wasAlreadyCompleted = await this.isCompleted(studentId, lectureId);

        // Upsert progress
        await prisma.progress.upsert({
            where: {
                studentId_lectureId: {
                    studentId,
                    lectureId,
                },
            },
            create: {
                studentId,
                lectureId,
                watchedSeconds,
                completionRate,
                isCompleted,
                lastWatchedAt: new Date(),
                ...(isCompleted && { completedAt: new Date() }),
            },
            update: {
                watchedSeconds,
                completionRate,
                isCompleted,
                lastWatchedAt: new Date(),
                ...(isCompleted && !wasAlreadyCompleted && { completedAt: new Date() }),
            },
        });

        // Grant rewards if just completed
        if (isCompleted && !wasAlreadyCompleted) {
            try {
                await rewardService.grantByTrigger(studentId, RewardTrigger.LECTURE_COMPLETE, {
                    lectureId,
                    courseId: lecture.courseId,
                });
            } catch (error) {
                console.error('Failed to grant lesson completion reward:', error);
            }
        }

        await achievementCacheService.invalidateProgress(studentId);

        // Update enrollment progress
        await this.updateEnrollmentProgress(studentId, lecture.courseId);

        // Update last access time
        await prisma.enrollment.updateMany({
            where: {
                studentId,
                courseId: lecture.courseId,
            },
            data: {
                lastAccessAt: new Date(),
            },
        });

        // Log activity
        try {
            await monitoringService.logActivity(studentId, ActivityType.LECTURE_VIEWED, {
                lectureId,
                watchedSeconds,
                completionRate,
            });
        } catch (error) {
            // Log but don't fail if activity logging fails
            console.error('Failed to log activity:', error);
        }
    }

    async markAsCompleted(studentId: string, lectureId: string): Promise<void> {
        // Verify lecture exists
        const lecture = await prisma.lecture.findUnique({
            where: { id: lectureId },
        });

        if (!lecture) {
            throw new Error('Lecture not found');
        }

        const canWriteProgress = await courseAccessService.canWriteProgressByStudentId(studentId, lectureId);
        if (!canWriteProgress) {
            throw new Error('Active entitlement required to update progress');
        }

        await this.ensureEnrollmentRecord(studentId, lecture.courseId);

        // Get or create progress
        const existingProgress = await prisma.progress.findUnique({
            where: {
                studentId_lectureId: {
                    studentId,
                    lectureId,
                },
            },
        });

        const wasAlreadyCompleted = existingProgress?.isCompleted || false;

        if (existingProgress) {
            // Update to completed
            await prisma.progress.update({
                where: {
                    studentId_lectureId: {
                        studentId,
                        lectureId,
                    },
                },
                data: {
                    isCompleted: true,
                    completionRate: 100,
                    watchedSeconds: lecture.duration, // Set to full duration
                    completedAt: new Date(),
                    lastWatchedAt: new Date(),
                },
            });
        } else {
            // Create as completed
            await prisma.progress.create({
                data: {
                    studentId,
                    lectureId,
                    isCompleted: true,
                    completionRate: 100,
                    watchedSeconds: lecture.duration,
                    completedAt: new Date(),
                    lastWatchedAt: new Date(),
                },
            });
        }

        // Grant rewards if just completed
        if (!wasAlreadyCompleted) {
            try {
                await rewardService.grantByTrigger(studentId, RewardTrigger.LECTURE_COMPLETE, {
                    lectureId,
                    courseId: lecture.courseId,
                });
            } catch (error) {
                console.error('Failed to grant lesson completion reward:', error);
            }
        }

        await achievementCacheService.invalidateProgress(studentId);

        // Update enrollment progress
        await this.updateEnrollmentProgress(studentId, lecture.courseId);

        // Update last access time
        await prisma.enrollment.updateMany({
            where: {
                studentId,
                courseId: lecture.courseId,
            },
            data: {
                lastAccessAt: new Date(),
            },
        });

        // Log activity for completion
        try {
            await monitoringService.logActivity(studentId, ActivityType.LECTURE_VIEWED, {
                lectureId,
                completed: true,
            });
        } catch (error) {
            console.error('Failed to log activity:', error);
        }
    }

    async getStatistics(studentId: string): Promise<LearningStatistics> {
        // Get all progress
        const allProgress = await prisma.progress.findMany({
            where: { studentId },
            include: {
                lecture: {
                    include: {
                        course: true,
                    },
                },
            },
        });

        // Get enrollments
        const enrollments = await prisma.enrollment.findMany({
            where: { studentId },
            include: {
                course: true,
            },
        });

        // Get student info for streak
        const student = await prisma.student.findUnique({
            where: { id: studentId },
        });

        // Calculate totals
        const totalWatchTime = allProgress.reduce((sum, p) => sum + p.watchedSeconds, 0) / 60; // convert to minutes
        const totalLecturesCompleted = allProgress.filter(p => p.isCompleted).length;
        const totalCoursesCompleted = enrollments.filter(e => e.completedAt !== null).length;

        // Calculate average completion rate
        const totalCourses = enrollments.length;
        const averageCompletionRate = totalCourses > 0
            ? enrollments.reduce((sum, e) => sum + e.progress, 0) / totalCourses
            : 0;

        // Calculate weekly activity (last 7 days)
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        const weeklyProgress = allProgress.filter(p => 
            p.lastWatchedAt >= sevenDaysAgo
        );

        const weeklyActivityMap = new Map<string, { watchTime: number; lecturesCompleted: number }>();
        
        weeklyProgress.forEach(p => {
            const date = p.lastWatchedAt.toISOString().split('T')[0];
            const existing = weeklyActivityMap.get(date) || { watchTime: 0, lecturesCompleted: 0 };
            existing.watchTime += p.watchedSeconds / 60; // convert to minutes
            if (p.isCompleted && p.completedAt && p.completedAt >= sevenDaysAgo) {
                existing.lecturesCompleted++;
            }
            weeklyActivityMap.set(date, existing);
        });

        const weeklyActivity = Array.from(weeklyActivityMap.entries()).map(([date, data]) => ({
            date,
            watchTime: data.watchTime,
            lecturesCompleted: data.lecturesCompleted,
        }));

        // Subject breakdown
        const subjectMap = new Map<string, { coursesCompleted: number; lecturesCompleted: number; watchTime: number }>();
        
        enrollments.forEach(enrollment => {
            const subject = enrollment.course.subject;
            const existing = subjectMap.get(subject) || { coursesCompleted: 0, lecturesCompleted: 0, watchTime: 0 };
            
            if (enrollment.completedAt) {
                existing.coursesCompleted++;
            }
            
            const courseProgress = allProgress.filter(p => 
                p.lecture.courseId === enrollment.courseId
            );
            
            existing.lecturesCompleted += courseProgress.filter(p => p.isCompleted).length;
            existing.watchTime += courseProgress.reduce((sum, p) => sum + p.watchedSeconds, 0) / 60;
            
            subjectMap.set(subject, existing);
        });

        const subjectBreakdown = Array.from(subjectMap.entries()).map(([subject, data]) => ({
            subject,
            ...data,
        }));

        return {
            totalWatchTime,
            totalLecturesCompleted,
            totalCoursesCompleted,
            averageCompletionRate,
            currentStreak: student?.streak || 0,
            longestStreak: student?.streak || 0, // TODO: track longest streak separately
            lastActiveDate: student?.lastActiveDate || null,
            weeklyActivity,
            subjectBreakdown,
        };
    }

    private async isCompleted(studentId: string, lectureId: string): Promise<boolean> {
        const progress = await prisma.progress.findUnique({
            where: {
                studentId_lectureId: {
                    studentId,
                    lectureId,
                },
            },
        });
        return progress?.isCompleted || false;
    }

    private async updateEnrollmentProgress(studentId: string, courseId: string): Promise<void> {
        // Get all lectures for the course
        const lectures = await prisma.lecture.findMany({
            where: { courseId },
        });

        if (lectures.length === 0) {
            return;
        }

        // Get progress for all lectures
        const progress = await prisma.progress.findMany({
            where: {
                studentId,
                lectureId: { in: lectures.map(l => l.id) },
            },
        });

        // Calculate overall progress percentage
        const completedCount = progress.filter(p => p.isCompleted).length;
        const progressPercentage = (completedCount / lectures.length) * 100;

        // Update enrollment
        await prisma.enrollment.updateMany({
            where: {
                studentId,
                courseId,
            },
            data: {
                progress: progressPercentage,
            },
        });

        // Check if course is completed (all lectures completed)
        if (completedCount === lectures.length) {
            await prisma.enrollment.updateMany({
                where: {
                    studentId,
                    courseId,
                    completedAt: null, // Only update if not already completed
                },
                data: {
                    completedAt: new Date(),
                },
            });
        }
    }

    private async ensureEnrollmentRecord(studentId: string, courseId: string): Promise<void> {
        await prisma.enrollment.upsert({
            where: {
                studentId_courseId: {
                    studentId,
                    courseId,
                },
            },
            create: {
                studentId,
                courseId,
                progress: 0,
                lastAccessAt: new Date(),
            },
            update: {},
        });
    }
}

export const progressService = new ProgressService();

