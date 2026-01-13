import { PrismaClient, Grade, Subject } from '@prisma/client';
import {
    RecommendationResult,
    CourseRecommendation,
    NextLearningItem,
    ReinforcementRecommendation,
} from './recommendation.types';
import {
    filterGradeMatchingCourses,
    filterPopularCourses,
    filterChallengeCourses,
    apply602020Rule,
    getNextGrade,
} from './recommendation.utils';

const prisma = new PrismaClient();

export class RecommendationService {
    async getCourseRecommendations(studentId: string, limit: number = 10): Promise<RecommendationResult> {
        // Get student info
        const student = await prisma.student.findUnique({
            where: { userId: studentId },
            include: {
                enrollments: {
                    select: { courseId: true },
                },
            },
        });

        if (!student) {
            throw new Error('Student not found');
        }

        const enrolledCourseIds = new Set(student.enrollments.map(e => e.courseId));

        // Get all published courses with enrollment counts
        const allCourses = await prisma.course.findMany({
            where: {
                isPublished: true,
                deletedAt: null,
            },
            include: {
                _count: {
                    select: {
                        enrollments: true,
                    },
                },
            },
        });

        // Filter out enrolled courses
        const availableCourses = allCourses.filter(c => !enrolledCourseIds.has(c.id));

        // Apply 60-20-20 rule
        const gradeMatchCourses = filterGradeMatchingCourses(availableCourses, student.grade, limit);
        const popularCourses = filterPopularCourses(availableCourses, limit);
        const challengeCourses = filterChallengeCourses(availableCourses, student.grade, limit);

        const recommendations = apply602020Rule(
            gradeMatchCourses,
            popularCourses,
            challengeCourses,
            limit
        );

        return {
            recommendations,
            total: recommendations.length,
        };
    }

    async getNextLearningItem(studentId: string): Promise<NextLearningItem | null> {
        // Get student's current progress
        const student = await prisma.student.findUnique({
            where: { userId: studentId },
        });

        if (!student) {
            throw new Error('Student not found');
        }

        // Get enrollments with progress
        const enrollments = await prisma.enrollment.findMany({
            where: {
                studentId,
                completedAt: null, // Not completed
            },
            include: {
                course: {
                    include: {
                        lectures: {
                            orderBy: { order: 'asc' },
                        },
                    },
                },
            },
            orderBy: { lastAccessAt: 'desc' },
            take: 5, // Check top 5 most recently accessed courses
        });

        // Find next lecture in progress courses
        for (const enrollment of enrollments) {
            const course = enrollment.course;
            const lectures = course.lectures;

            // Get progress for all lectures
            const progress = await prisma.progress.findMany({
                where: {
                    studentId,
                    lectureId: { in: lectures.map(l => l.id) },
                },
            });

            const completedLectureIds = new Set(
                progress.filter(p => p.isCompleted).map(p => p.lectureId)
            );

            // Find first incomplete lecture
            for (const lecture of lectures) {
                if (!completedLectureIds.has(lecture.id)) {
                    return {
                        type: 'lecture',
                        item: {
                            id: lecture.id,
                            title: lecture.title,
                            description: lecture.description || undefined,
                            courseId: course.id,
                            courseTitle: course.title,
                            order: lecture.order,
                        },
                        reason: 'Tiếp tục học khóa học đang học',
                        priority: 'high',
                    };
                }
            }
        }

        // If all courses are completed, suggest next course in series
        const completedEnrollments = await prisma.enrollment.findMany({
            where: {
                studentId,
                completedAt: { not: null },
            },
            include: {
                course: true,
            },
            orderBy: { completedAt: 'desc' },
            take: 1,
        });

        if (completedEnrollments.length > 0) {
            const lastCompleted = completedEnrollments[0].course;
            
            // Find similar courses (same subject, next level or same level)
            const nextCourses = await prisma.course.findMany({
                where: {
                    subject: lastCompleted.subject,
                    grade: lastCompleted.grade,
                    isPublished: true,
                    deletedAt: null,
                    id: { not: lastCompleted.id },
                },
                include: {
                    _count: {
                        select: {
                            enrollments: true,
                        },
                    },
                },
                orderBy: { order: 'asc' },
                take: 1,
            });

            if (nextCourses.length > 0) {
                const nextCourse = nextCourses[0];
                return {
                    type: 'course',
                    item: {
                        id: nextCourse.id,
                        title: nextCourse.title,
                        description: nextCourse.description,
                    },
                    reason: `Hoàn thành khóa học ${lastCompleted.title}, hãy tiếp tục với khóa học tương tự`,
                    priority: 'high',
                };
            }
        }

        // If no specific next item, suggest based on recommendations
        const recommendations = await this.getCourseRecommendations(studentId, 1);
        if (recommendations.recommendations.length > 0) {
            const recommended = recommendations.recommendations[0].course;
            return {
                type: 'course',
                item: {
                    id: recommended.id,
                    title: recommended.title,
                    description: recommended.description,
                },
                reason: recommendations.recommendations[0].reason,
                priority: 'medium',
            };
        }

        return null;
    }

    async getPopularCourses(grade: Grade, limit: number = 10): Promise<CourseRecommendation[]> {
        const courses = await prisma.course.findMany({
            where: {
                isPublished: true,
                deletedAt: null,
            },
            include: {
                _count: {
                    select: {
                        enrollments: true,
                    },
                },
            },
            orderBy: [
                { avgRating: 'desc' },
                { reviewCount: 'desc' },
                { enrollments: { _count: 'desc' } },
            ],
            take: limit * 2, // Get more to filter by grade
        });

        // Filter and sort
        const filtered = courses
            .filter(course => {
                // Prefer courses for this grade, but also include others
                return course.grade === grade || Math.random() < 0.3; // 30% chance for other grades
            })
            .slice(0, limit);

        return filtered.map(course => ({
            course,
            reason: 'Khóa học phổ biến',
            score: (course.avgRating || 0) * 20,
            category: 'popular',
        }));
    }

    async getChallengeCourses(grade: Grade, limit: number = 10): Promise<CourseRecommendation[]> {
        const nextGrade = getNextGrade(grade);
        if (!nextGrade) {
            return [];
        }

        const courses = await prisma.course.findMany({
            where: {
                grade: nextGrade,
                isPublished: true,
                deletedAt: null,
            },
            include: {
                _count: {
                    select: {
                        enrollments: true,
                    },
                },
            },
            orderBy: [
                { avgRating: 'desc' },
                { order: 'asc' },
            ],
            take: limit,
        });

        return courses.map(course => ({
            course,
            reason: `Khóa học thử thách cho lớp ${nextGrade}`,
            score: 20,
            category: 'challenge',
        }));
    }

    async getReinforcementCourses(
        studentId: string,
        weakSubjects: Subject[]
    ): Promise<ReinforcementRecommendation[]> {
        // Get student info
        const student = await prisma.student.findUnique({
            where: { userId: studentId },
        });

        if (!student) {
            throw new Error('Student not found');
        }

        // If no weak subjects provided, analyze from quiz performance
        let subjectsToImprove = weakSubjects;
        if (subjectsToImprove.length === 0) {
            // Get quiz attempts with low scores
            const weakQuizAttempts = await prisma.quizAttempt.findMany({
                where: {
                    studentId,
                    score: { lt: 70 }, // Below 70%
                },
                include: {
                    quiz: {
                        include: {
                            course: true,
                        },
                    },
                },
                take: 10,
            });

            // Extract subjects from weak quizzes
            const subjectMap = new Map<Subject, number>();
            weakQuizAttempts.forEach(attempt => {
                const subject = attempt.quiz.course.subject;
                subjectMap.set(subject, (subjectMap.get(subject) || 0) + 1);
            });

            // Get top weak subjects
            subjectsToImprove = Array.from(subjectMap.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3)
                .map(([subject]) => subject);
        }

        // Get reinforcement courses for weak subjects
        const recommendations: ReinforcementRecommendation[] = [];

        for (const subject of subjectsToImprove) {
            const courses = await prisma.course.findMany({
                where: {
                    subject,
                    grade: student.grade, // Same grade for reinforcement
                    isPublished: true,
                    deletedAt: null,
                    level: 'BEGINNER', // Start with beginner level
                },
                orderBy: { order: 'asc' },
                take: 5,
            });

            if (courses.length > 0) {
                recommendations.push({
                    subject,
                    weakAreas: [`Cần cải thiện kiến thức ${subject}`],
                    recommendedCourses: courses,
                });
            }
        }

        return recommendations;
    }
}

export const recommendationService = new RecommendationService();

