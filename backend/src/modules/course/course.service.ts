import { PrismaClient, Course, Subject, Grade, CourseLevel, EntitlementStatus } from '@prisma/client/index';
import { CreateCourseInput, UpdateCourseInput, CourseFilters, CourseListItem, CourseDetail } from './course.types';
import { createSlug } from './course.dto';
import { Prisma } from '@prisma/client';
import { courseAccessService } from './course-access.service';

const prisma = new PrismaClient();

export class CourseService {
    async getCourses(filters: CourseFilters, userId?: string): Promise<{ courses: CourseListItem[]; total: number }> {
        const {
            grade,
            subject,
            level,
            isFree,
            isPublished = true, // Default to published only for public access
            search,
            minRating,
            page = 1,
            limit = 10,
        } = filters;

        const skip = (page - 1) * limit;

        // Build where clause
        const where: Prisma.CourseWhereInput = {
            deletedAt: null,
        };

        if (isPublished !== undefined) {
            where.isPublished = isPublished;
        }

        if (grade) {
            where.grade = grade;
        }

        if (subject) {
            where.subject = subject;
        }

        if (level) {
            where.level = level;
        }

        if (isFree !== undefined) {
            where.isFree = isFree;
        }

        if (search) {
            where.OR = [
                { title: { contains: search } },
                { description: { contains: search } },
            ];
        }

        if (minRating !== undefined) {
            where.avgRating = { gte: minRating };
        }

        // Get courses with enrollment count
        const [courses, total] = await Promise.all([
            prisma.course.findMany({
                where,
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    description: true,
                    thumbnail: true,
                    subject: true,
                    grade: true,
                    level: true,
                    duration: true,
                    isPublished: true,
                    isFree: true,
                    avgRating: true,
                    reviewCount: true,
                    _count: {
                        select: {
                            enrollments: true,
                        },
                    },
                },
                orderBy: [
                    { order: 'asc' },
                    { createdAt: 'desc' },
                ],
                skip,
                take: limit,
            }),
            prisma.course.count({ where }),
        ]);

        let studentId: string | null = null;
        if (userId) {
            studentId = await courseAccessService.getStudentIdByUserId(userId);
        }

        let enrollments: Array<{ courseId: string; progress: number }> = [];
        let activeEntitlements: Array<{ courseId: string }> = [];

        if (studentId && courses.length > 0) {
            const courseIds = courses.map((course) => course.id);
            const now = new Date();

            [enrollments, activeEntitlements] = await Promise.all([
                prisma.enrollment.findMany({
                    where: {
                        studentId,
                        courseId: { in: courseIds },
                    },
                    select: {
                        courseId: true,
                        progress: true,
                    },
                }),
                prisma.courseEntitlement.findMany({
                    where: {
                        studentId,
                        courseId: { in: courseIds },
                        status: EntitlementStatus.ACTIVE,
                        startsAt: { lte: now },
                        OR: [
                            { expiresAt: null },
                            { expiresAt: { gt: now } },
                        ],
                    },
                    select: { courseId: true },
                }),
            ]);
        }

        const enrolledCourseIds = new Set(enrollments.map(e => e.courseId));
        const entitledCourseIds = new Set(activeEntitlements.map(e => e.courseId));
        const enrollmentProgressByCourseId = new Map(
            enrollments.map((enrollment) => [enrollment.courseId, enrollment.progress])
        );

        const courseList: CourseListItem[] = courses.map(course => ({
            id: course.id,
            title: course.title,
            slug: course.slug,
            description: course.description,
            thumbnail: course.thumbnail,
            subject: course.subject,
            grade: course.grade,
            level: course.level,
            duration: course.duration,
            isPublished: course.isPublished,
            isFree: course.isFree,
            avgRating: course.avgRating,
            reviewCount: course.reviewCount,
            enrollmentCount: course._count.enrollments,
            isEnrolled: (course.isFree && Boolean(studentId)) || enrolledCourseIds.has(course.id) || entitledCourseIds.has(course.id),
            hasActiveEntitlement: entitledCourseIds.has(course.id),
            canAccessLearningContent: (course.isFree && Boolean(studentId)) || enrolledCourseIds.has(course.id) || entitledCourseIds.has(course.id),
            learningProgress: enrollmentProgressByCourseId.has(course.id)
                ? Math.max(0, Math.min(100, Math.round(enrollmentProgressByCourseId.get(course.id) || 0)))
                : undefined,
        }));

        return { courses: courseList, total };
    }

    async getCourseById(id: string, userId?: string): Promise<CourseDetail | null> {
        const course = await prisma.course.findFirst({
            where: {
                id,
                deletedAt: null,
            },
            include: {
                lectures: {
                    orderBy: { order: 'asc' },
                },
            },
        });

        if (!course) {
            return null;
        }

        const [enrollmentCount, accessState] = await Promise.all([
            prisma.enrollment.count({ where: { courseId: id } }),
            courseAccessService.getCourseAccessState(userId, id),
        ]);

        let completedLectureIds = new Set<string>();
        if (accessState.studentId && course.lectures.length > 0) {
            completedLectureIds = await this.getCompletedLectureIds(
                accessState.studentId,
                course.lectures.map((lecture) => lecture.id)
            );
        }

        const lectures = course.lectures.map((lecture) => {
            const canPlay = accessState.canAccessLearningContent || completedLectureIds.has(lecture.id);

            return {
                ...lecture,
                videoUrl: canPlay ? lecture.videoUrl : null,
                canPlay,
                isLocked: !canPlay,
            };
        });

        return {
            ...course,
            enrollmentCount,
            isEnrolled: accessState.isEnrolled,
            hasActiveEntitlement: accessState.hasActiveEntitlement,
            canAccessLearningContent: accessState.canAccessLearningContent,
            accessSource: accessState.accessSource,
            lectures,
        };
    }

    async getCourseBySlug(slug: string, userId?: string): Promise<CourseDetail | null> {
        const course = await prisma.course.findFirst({
            where: {
                slug,
                deletedAt: null,
            },
            include: {
                lectures: {
                    orderBy: { order: 'asc' },
                },
            },
        });

        if (!course) {
            return null;
        }

        const [enrollmentCount, accessState] = await Promise.all([
            prisma.enrollment.count({ where: { courseId: course.id } }),
            courseAccessService.getCourseAccessState(userId, course.id),
        ]);

        let completedLectureIds = new Set<string>();
        if (accessState.studentId && course.lectures.length > 0) {
            completedLectureIds = await this.getCompletedLectureIds(
                accessState.studentId,
                course.lectures.map((lecture) => lecture.id)
            );
        }

        const lectures = course.lectures.map((lecture) => {
            const canPlay = accessState.canAccessLearningContent || completedLectureIds.has(lecture.id);

            return {
                ...lecture,
                videoUrl: canPlay ? lecture.videoUrl : null,
                canPlay,
                isLocked: !canPlay,
            };
        });

        return {
            ...course,
            enrollmentCount,
            isEnrolled: accessState.isEnrolled,
            hasActiveEntitlement: accessState.hasActiveEntitlement,
            canAccessLearningContent: accessState.canAccessLearningContent,
            accessSource: accessState.accessSource,
            lectures,
        };
    }

    async createCourse(input: CreateCourseInput): Promise<Course> {
        // Generate slug if not provided
        const slug = input.slug || createSlug(input.title);

        // Check if slug already exists (only for non-deleted courses)
        const existingCourse = await prisma.course.findFirst({
            where: {
                slug,
                deletedAt: null, // Allow reusing slug from deleted courses
            },
        });

        if (existingCourse) {
            throw new Error('Course with this slug already exists');
        }

        const course = await prisma.course.create({
            data: {
                title: input.title,
                slug,
                description: input.description,
                thumbnail: input.thumbnail || null,
                subject: input.subject,
                grade: input.grade,
                level: input.level || CourseLevel.BEGINNER,
                duration: 0, // Will be auto-calculated from lectures
                isPublished: input.isPublished ?? false,
                isFree: input.isFree ?? true,
                order: input.order || 0,
                metadata: input.metadata ? (input.metadata as Prisma.InputJsonValue) : Prisma.JsonNull,
            },
        });


        return course;
    }

    async updateCourse(id: string, input: UpdateCourseInput): Promise<Course> {
        // Check if course exists
        const existingCourse = await prisma.course.findFirst({
            where: {
                id,
                deletedAt: null,
            },
        });

        if (!existingCourse) {
            throw new Error('Course not found');
        }

        // Check slug uniqueness if slug is being updated
        if (input.slug && input.slug !== existingCourse.slug) {
            const slugExists = await prisma.course.findFirst({
                where: {
                    slug: input.slug,
                    deletedAt: null, // Allow reusing slug from deleted courses
                },
            });

            if (slugExists) {
                throw new Error('Course with this slug already exists');
            }
        }

        const course = await prisma.course.update({
            where: { id },
            data: {
                ...(input.title && { title: input.title }),
                ...(input.slug && { slug: input.slug }),
                ...(input.description !== undefined && { description: input.description }),
                ...(input.thumbnail !== undefined && { thumbnail: input.thumbnail }),
                ...(input.subject && { subject: input.subject }),
                ...(input.grade && { grade: input.grade }),
                ...(input.level && { level: input.level }),
                // duration is auto-calculated from lectures, ignore manual input
                ...(input.isPublished !== undefined && { isPublished: input.isPublished }),
                ...(input.isFree !== undefined && { isFree: input.isFree }),
                ...(input.order !== undefined && { order: input.order }),
                ...(input.metadata !== undefined && { metadata: input.metadata === null ? Prisma.JsonNull : (input.metadata as Prisma.InputJsonValue) }),
            },
        });


        return course;
    }

    async deleteCourse(id: string): Promise<void> {
        const course = await prisma.course.findFirst({
            where: {
                id,
                deletedAt: null,
            },
        });

        if (!course) {
            throw new Error('Course not found');
        }

        // Soft delete: append timestamp to slug to free it up for reuse
        const timestamp = Date.now();
        const deletedSlug = `${course.slug}-deleted-${timestamp}`;

        await prisma.course.update({
            where: { id },
            data: {
                slug: deletedSlug, // Free up the original slug
                deletedAt: new Date(),
                isPublished: false, // Unpublish when deleting
            },
        });

    }

    async getCourseReviews(courseId: string, page: number = 1, limit: number = 10) {
        const skip = (page - 1) * limit;

        const [reviews, total] = await Promise.all([
            prisma.courseReview.findMany({
                where: { courseId },
                include: {
                    student: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            avatar: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.courseReview.count({ where: { courseId } }),
        ]);

        // Calculate average rating
        const avgRating = await prisma.courseReview.aggregate({
            where: { courseId },
            _avg: { rating: true },
        });

        // Update course avgRating
        await prisma.course.update({
            where: { id: courseId },
            data: {
                avgRating: avgRating._avg.rating || 0,
                reviewCount: total,
            },
        });

        return {
            reviews,
            total,
            avgRating: avgRating._avg.rating || 0,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    // ==================== Admin Methods ====================

    async getAllCoursesForAdmin(filters: {
        search?: string;
        subject?: Subject;
        grade?: Grade;
        level?: CourseLevel;
        isPublished?: boolean;
        isFree?: boolean;
        page?: number;
        limit?: number;
    }): Promise<{
        courses: Array<{
            id: string;
            title: string;
            slug: string;
            description: string | null;
            thumbnail: string | null;
            subject: Subject;
            grade: Grade;
            level: CourseLevel;
            duration: number;
            isPublished: boolean;
            isFree: boolean;
            order: number;
            avgRating: number | null;
            reviewCount: number;
            lectureCount: number;
            enrollmentCount: number;
            createdAt: Date;
            updatedAt: Date;
        }>;
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }> {
        const { search, subject, grade, level, isPublished, isFree, page = 1, limit = 20 } = filters;

        // Build where clause
        const where: Prisma.CourseWhereInput = {
            deletedAt: null, // Exclude soft-deleted courses
        };

        if (search) {
            where.OR = [
                { title: { contains: search } },
                { description: { contains: search } },
            ];
        }

        if (subject) {
            where.subject = subject;
        }

        if (grade) {
            where.grade = grade;
        }

        if (level) {
            where.level = level;
        }

        if (isPublished !== undefined) {
            where.isPublished = isPublished;
        }

        if (isFree !== undefined) {
            where.isFree = isFree;
        }

        // Get total count
        const total = await prisma.course.count({ where });

        // Get courses with counts
        const courses = await prisma.course.findMany({
            where,
            select: {
                id: true,
                title: true,
                slug: true,
                description: true,
                thumbnail: true,
                subject: true,
                grade: true,
                level: true,
                duration: true,
                isPublished: true,
                isFree: true,
                order: true,
                avgRating: true,
                reviewCount: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: {
                        lectures: true,
                        enrollments: true,
                    },
                },
            },
            orderBy: [
                { createdAt: 'desc' },
            ],
            skip: (page - 1) * limit,
            take: limit,
        });

        // Map to response format
        const coursesWithCounts = courses.map((course) => ({
            id: course.id,
            title: course.title,
            slug: course.slug,
            description: course.description,
            thumbnail: course.thumbnail,
            subject: course.subject,
            grade: course.grade,
            level: course.level,
            duration: course.duration,
            isPublished: course.isPublished,
            isFree: course.isFree,
            order: course.order,
            avgRating: course.avgRating,
            reviewCount: course.reviewCount,
            lectureCount: course._count.lectures,
            enrollmentCount: course._count.enrollments,
            createdAt: course.createdAt,
            updatedAt: course.updatedAt,
        }));

        return {
            courses: coursesWithCounts,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    private async getCompletedLectureIds(studentId: string, lectureIds: string[]): Promise<Set<string>> {
        if (lectureIds.length === 0) {
            return new Set<string>();
        }

        const progressRecords = await prisma.progress.findMany({
            where: {
                studentId,
                lectureId: { in: lectureIds },
                OR: [
                    { isCompleted: true },
                    { completedAt: { not: null } },
                ],
            },
            select: {
                lectureId: true,
            },
        });

        return new Set(progressRecords.map((record) => record.lectureId));
    }
}

export const courseService = new CourseService();

