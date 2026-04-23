import { PrismaClient, Lecture } from '@prisma/client';
import { CreateLectureInput, UpdateLectureInput, LectureDetail, LectureListItem } from './lecture.types';
import { createSlug } from './lecture.dto';
import { courseAccessService } from '../course/course-access.service';

const prisma = new PrismaClient();

export class LectureService {
    async getLecturesByCourseForAdmin(courseId: string): Promise<LectureListItem[]> {
        const lectures = await prisma.lecture.findMany({
            where: {
                courseId,
            },
            orderBy: { order: 'asc' },
        });

        return lectures.map((lecture) => ({
            ...lecture,
            canPlay: true,
            isLocked: false,
        }));
    }

    async getLecturesByCourse(courseId: string, userId?: string): Promise<LectureListItem[]> {
        if (!userId) {
            throw new Error('Authentication required');
        }

        const studentId = await courseAccessService.requireStudentIdByUserId(userId);

        const lectures = await prisma.lecture.findMany({
            where: {
                courseId,
            },
            orderBy: { order: 'asc' },
        });

        const [progressRecords, hasCourseAccess] = await Promise.all([
            prisma.progress.findMany({
                where: {
                    studentId,
                    lectureId: { in: lectures.map(l => l.id) },
                },
                select: {
                    lectureId: true,
                    isCompleted: true,
                    completedAt: true,
                    watchedSeconds: true,
                    completionRate: true,
                },
            }),
            courseAccessService.hasCourseAccessByStudentId(studentId, courseId),
        ]);

        const progressMap = new Map<string, { isCompleted: boolean; completedAt: Date | null; watchedSeconds: number; completionRate: number }>();
        progressRecords.forEach((progress) => {
            progressMap.set(progress.lectureId, {
                isCompleted: progress.isCompleted,
                completedAt: progress.completedAt,
                watchedSeconds: progress.watchedSeconds,
                completionRate: progress.completionRate,
            });
        });

        return lectures.map(lecture => {
            const progress = progressMap.get(lecture.id);
            const canPlay = hasCourseAccess || Boolean(progress?.isCompleted || progress?.completedAt);

            return {
                ...lecture,
                videoUrl: canPlay ? lecture.videoUrl : null,
                isCompleted: progress?.isCompleted || false,
                watchedSeconds: progress?.watchedSeconds || 0,
                completionRate: progress?.completionRate || 0,
                canPlay,
                isLocked: !canPlay,
            };
        });
    }

    async getLectureById(id: string, userId?: string): Promise<LectureDetail | null> {
        if (!userId) {
            throw new Error('Authentication required');
        }

        const studentId = await courseAccessService.requireStudentIdByUserId(userId);

        const lecture = await prisma.lecture.findUnique({
            where: { id },
            include: {
                course: true,
            },
        });

        if (!lecture) {
            return null;
        }

        const canViewLecture = await courseAccessService.canViewLectureByStudentId(studentId, lecture.id);
        if (!canViewLecture) {
            throw new Error('Lecture access denied');
        }

        // Get progress for student if provided
        let progress = null;
        progress = await prisma.progress.findUnique({
            where: {
                studentId_lectureId: {
                    studentId,
                    lectureId: id,
                },
            },
        });

        return {
            ...lecture,
            isCompleted: progress?.isCompleted || false,
            watchedSeconds: progress?.watchedSeconds || 0,
            completionRate: progress?.completionRate || 0,
            canPlay: true,
            isLocked: false,
        };
    }

    async getLectureBySlug(slug: string, userId?: string): Promise<LectureDetail | null> {
        if (!userId) {
            throw new Error('Authentication required');
        }

        const studentId = await courseAccessService.requireStudentIdByUserId(userId);

        const lecture = await prisma.lecture.findUnique({
            where: { slug },
            include: {
                course: true,
            },
        });

        if (!lecture) {
            return null;
        }

        const canViewLecture = await courseAccessService.canViewLectureByStudentId(studentId, lecture.id);
        if (!canViewLecture) {
            throw new Error('Lecture access denied');
        }

        // Get progress for student if provided
        let progress = null;
        progress = await prisma.progress.findUnique({
            where: {
                studentId_lectureId: {
                    studentId,
                    lectureId: lecture.id,
                },
            },
        });

        return {
            ...lecture,
            isCompleted: progress?.isCompleted || false,
            watchedSeconds: progress?.watchedSeconds || 0,
            completionRate: progress?.completionRate || 0,
            canPlay: true,
            isLocked: false,
        };
    }

    async createLecture(input: CreateLectureInput): Promise<Lecture> {
        // Verify course exists
        const course = await prisma.course.findFirst({
            where: {
                id: input.courseId,
                deletedAt: null,
            },
        });

        if (!course) {
            throw new Error('Course not found');
        }

        // Generate slug if not provided
        const slug = input.slug || createSlug(input.title);

        // Check if slug already exists
        const existingLecture = await prisma.lecture.findUnique({
            where: { slug },
        });

        if (existingLecture) {
            throw new Error('Lecture with this slug already exists');
        }

        // Get max order if not provided
        let order = input.order;
        if (order === undefined) {
            const maxOrderLecture = await prisma.lecture.findFirst({
                where: { courseId: input.courseId },
                orderBy: { order: 'desc' },
            });
            order = maxOrderLecture ? maxOrderLecture.order + 1 : 0;
        }

        const lecture = await prisma.lecture.create({
            data: {
                courseId: input.courseId,
                title: input.title,
                slug,
                description: input.description || null,
                videoUrl: input.videoUrl || null,
                duration: input.duration,
                order,
                isPreview: input.isPreview || false,
            },
        });

        // Update course duration (sum of all lectures)
        await this.updateCourseDuration(input.courseId);

        return lecture;
    }

    async updateLecture(id: string, input: UpdateLectureInput): Promise<Lecture> {
        // Check if lecture exists
        const existingLecture = await prisma.lecture.findUnique({
            where: { id },
        });

        if (!existingLecture) {
            throw new Error('Lecture not found');
        }

        // Check slug uniqueness if slug is being updated
        if (input.slug && input.slug !== existingLecture.slug) {
            const slugExists = await prisma.lecture.findUnique({
                where: { slug: input.slug },
            });

            if (slugExists) {
                throw new Error('Lecture with this slug already exists');
            }
        }

        const lecture = await prisma.lecture.update({
            where: { id },
            data: {
                ...(input.title && { title: input.title }),
                ...(input.slug && { slug: input.slug }),
                ...(input.description !== undefined && { description: input.description }),
                ...(input.videoUrl !== undefined && { videoUrl: input.videoUrl }),
                ...(input.duration !== undefined && { duration: input.duration }),
                ...(input.order !== undefined && { order: input.order }),
                ...(input.isPreview !== undefined && { isPreview: input.isPreview }),
            },
        });

        // Update course duration if duration changed
        if (input.duration !== undefined) {
            await this.updateCourseDuration(existingLecture.courseId);
        }

        return lecture;
    }

    async deleteLecture(id: string): Promise<void> {
        const lecture = await prisma.lecture.findUnique({
            where: { id },
        });

        if (!lecture) {
            throw new Error('Lecture not found');
        }

        const courseId = lecture.courseId;

        await prisma.lecture.delete({
            where: { id },
        });

        // Update course duration
        await this.updateCourseDuration(courseId);
    }

    private async updateCourseDuration(courseId: string): Promise<void> {
        const totalDuration = await prisma.lecture.aggregate({
            where: { courseId },
            _sum: { duration: true },
        });

        await prisma.course.update({
            where: { id: courseId },
            data: {
                duration: totalDuration._sum.duration || 0,
            },
        });
    }
}

export const lectureService = new LectureService();

