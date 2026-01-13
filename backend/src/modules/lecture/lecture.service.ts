import { PrismaClient, Lecture } from '@prisma/client';
import { CreateLectureInput, UpdateLectureInput, LectureDetail, LectureListItem } from './lecture.types';
import { createSlug } from './lecture.dto';

const prisma = new PrismaClient();

export class LectureService {
    async getLecturesByCourse(courseId: string, studentId?: string): Promise<LectureListItem[]> {
        const lectures = await prisma.lecture.findMany({
            where: {
                courseId,
            },
            orderBy: { order: 'asc' },
        });

        // Get progress for student if provided
        let progressMap: Map<string, { isCompleted: boolean; watchedSeconds: number; completionRate: number }> = new Map();
        if (studentId) {
            const progress = await prisma.progress.findMany({
                where: {
                    studentId,
                    lectureId: { in: lectures.map(l => l.id) },
                },
            });

            progress.forEach(p => {
                progressMap.set(p.lectureId, {
                    isCompleted: p.isCompleted,
                    watchedSeconds: p.watchedSeconds,
                    completionRate: p.completionRate,
                });
            });
        }

        return lectures.map(lecture => {
            const progress = progressMap.get(lecture.id);
            return {
                ...lecture,
                isCompleted: progress?.isCompleted || false,
                watchedSeconds: progress?.watchedSeconds || 0,
                completionRate: progress?.completionRate || 0,
            };
        });
    }

    async getLectureById(id: string, studentId?: string): Promise<LectureDetail | null> {
        const lecture = await prisma.lecture.findUnique({
            where: { id },
            include: {
                course: true,
            },
        });

        if (!lecture) {
            return null;
        }

        // Get progress for student if provided
        let progress = null;
        if (studentId) {
            progress = await prisma.progress.findUnique({
                where: {
                    studentId_lectureId: {
                        studentId,
                        lectureId: id,
                    },
                },
            });
        }

        return {
            ...lecture,
            isCompleted: progress?.isCompleted || false,
            watchedSeconds: progress?.watchedSeconds || 0,
            completionRate: progress?.completionRate || 0,
        };
    }

    async getLectureBySlug(slug: string, studentId?: string): Promise<LectureDetail | null> {
        const lecture = await prisma.lecture.findUnique({
            where: { slug },
            include: {
                course: true,
            },
        });

        if (!lecture) {
            return null;
        }

        // Get progress for student if provided
        let progress = null;
        if (studentId) {
            progress = await prisma.progress.findUnique({
                where: {
                    studentId_lectureId: {
                        studentId,
                        lectureId: lecture.id,
                    },
                },
            });
        }

        return {
            ...lecture,
            isCompleted: progress?.isCompleted || false,
            watchedSeconds: progress?.watchedSeconds || 0,
            completionRate: progress?.completionRate || 0,
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

