import { EntitlementStatus, PrismaClient } from '@prisma/client/index';

const prisma = new PrismaClient();

export interface CourseAccessState {
    studentId: string | null;
    isEnrolled: boolean;
    hasActiveEntitlement: boolean;
    canAccessLearningContent: boolean;
    accessSource: 'free_course' | 'entitlement' | 'legacy_enrollment' | null;
}

export class CourseAccessService {
    async getStudentIdByUserId(userId: string): Promise<string | null> {
        const student = await prisma.student.findUnique({
            where: { userId },
            select: { id: true },
        });

        return student?.id ?? null;
    }

    async requireStudentIdByUserId(userId: string): Promise<string> {
        const studentId = await this.getStudentIdByUserId(userId);

        if (!studentId) {
            throw new Error('Student profile not found');
        }

        return studentId;
    }

    async getCourseAccessState(userId: string | undefined, courseId: string): Promise<CourseAccessState> {
        if (!userId) {
            return {
                studentId: null,
                isEnrolled: false,
                hasActiveEntitlement: false,
                canAccessLearningContent: false,
                accessSource: null,
            };
        }

        const studentId = await this.getStudentIdByUserId(userId);
        if (!studentId) {
            return {
                studentId: null,
                isEnrolled: false,
                hasActiveEntitlement: false,
                canAccessLearningContent: false,
                accessSource: null,
            };
        }

        const course = await prisma.course.findUnique({
            where: { id: courseId },
            select: { isFree: true },
        });

        if (!course) {
            throw new Error('Course not found');
        }

        if (course.isFree) {
            return {
                studentId,
                isEnrolled: true,
                hasActiveEntitlement: false,
                canAccessLearningContent: true,
                accessSource: 'free_course',
            };
        }

        const [hasLegacyEnrollment, hasActiveEntitlement] = await Promise.all([
            this.hasLegacyEnrollment(studentId, courseId),
            this.hasActiveEntitlement(studentId, courseId),
        ]);

        if (hasActiveEntitlement) {
            return {
                studentId,
                isEnrolled: true,
                hasActiveEntitlement: true,
                canAccessLearningContent: true,
                accessSource: 'entitlement',
            };
        }

        if (hasLegacyEnrollment) {
            return {
                studentId,
                isEnrolled: true,
                hasActiveEntitlement: false,
                canAccessLearningContent: true,
                accessSource: 'legacy_enrollment',
            };
        }

        return {
            studentId,
            isEnrolled: false,
            hasActiveEntitlement: false,
            canAccessLearningContent: false,
            accessSource: null,
        };
    }

    async hasCourseAccessByStudentId(studentId: string, courseId: string): Promise<boolean> {
        const course = await prisma.course.findUnique({
            where: { id: courseId },
            select: { isFree: true },
        });

        if (!course) {
            throw new Error('Course not found');
        }

        if (course.isFree) {
            return true;
        }

        const [hasLegacyEnrollment, hasActiveEntitlement] = await Promise.all([
            this.hasLegacyEnrollment(studentId, courseId),
            this.hasActiveEntitlement(studentId, courseId),
        ]);

        return hasLegacyEnrollment || hasActiveEntitlement;
    }

    async canViewLectureByStudentId(studentId: string, lectureId: string): Promise<boolean> {
        const lecture = await prisma.lecture.findUnique({
            where: { id: lectureId },
            select: {
                id: true,
                courseId: true,
                course: {
                    select: {
                        isFree: true,
                    },
                },
            },
        });

        if (!lecture) {
            throw new Error('Lecture not found');
        }

        if (lecture.course.isFree) {
            return true;
        }

        const hasCourseAccess = await this.hasCourseAccessByStudentId(studentId, lecture.courseId);
        if (hasCourseAccess) {
            return true;
        }

        const progress = await prisma.progress.findUnique({
            where: {
                studentId_lectureId: {
                    studentId,
                    lectureId,
                },
            },
            select: {
                isCompleted: true,
                completedAt: true,
            },
        });

        return Boolean(progress?.isCompleted || progress?.completedAt);
    }

    async canWriteProgressByStudentId(studentId: string, lectureId: string): Promise<boolean> {
        const lecture = await prisma.lecture.findUnique({
            where: { id: lectureId },
            select: {
                courseId: true,
                course: {
                    select: {
                        isFree: true,
                    },
                },
            },
        });

        if (!lecture) {
            throw new Error('Lecture not found');
        }

        if (lecture.course.isFree) {
            return true;
        }

        return this.hasCourseAccessByStudentId(studentId, lecture.courseId);
    }

    async canStartQuizByCourseId(studentId: string, courseId: string): Promise<boolean> {
        return this.hasCourseAccessByStudentId(studentId, courseId);
    }

    async canSubmitQuizByCourseId(studentId: string, courseId: string): Promise<boolean> {
        return this.hasCourseAccessByStudentId(studentId, courseId);
    }

    private async hasLegacyEnrollment(studentId: string, courseId: string): Promise<boolean> {
        const enrollment = await prisma.enrollment.findUnique({
            where: {
                studentId_courseId: {
                    studentId,
                    courseId,
                },
            },
            select: { id: true },
        });

        return Boolean(enrollment);
    }

    private async hasActiveEntitlement(studentId: string, courseId: string): Promise<boolean> {
        const now = new Date();

        const entitlement = await prisma.courseEntitlement.findFirst({
            where: {
                studentId,
                courseId,
                status: EntitlementStatus.ACTIVE,
                startsAt: { lte: now },
                OR: [
                    { expiresAt: null },
                    { expiresAt: { gt: now } },
                ],
            },
            select: { id: true },
        });

        return Boolean(entitlement);
    }
}

export const courseAccessService = new CourseAccessService();
