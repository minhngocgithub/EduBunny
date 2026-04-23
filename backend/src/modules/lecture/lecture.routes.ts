import { Router } from 'express';
import { lectureController } from './lecture.controller';
import { UserRole } from '@prisma/client';
import { authMiddleware, requireAdmin, requireRole, requireStudent } from '@/shared/config/passport.config';
import { validateRequest } from '@/shared/middleware/validation.middleware';
import {
    CreateLectureSchema,
    UpdateLectureSchema,
} from './lecture.dto';

const router = Router();

// Lecture list can be read by students (learning flow) and admins (course management).
router.get('/courses/:courseId/lectures', authMiddleware, requireRole(UserRole.STUDENT, UserRole.ADMIN), lectureController.getLecturesByCourse.bind(lectureController));
router.get('/slug/:slug', authMiddleware, requireStudent, lectureController.getLectureBySlug.bind(lectureController));
router.get('/:id', authMiddleware, requireStudent, lectureController.getLectureById.bind(lectureController));

// Admin routes (protected)
router.post(
    '/',
    authMiddleware,
    requireAdmin,
    validateRequest(CreateLectureSchema),
    lectureController.createLecture.bind(lectureController)
);

router.patch(
    '/:id',
    authMiddleware,
    requireAdmin,
    validateRequest(UpdateLectureSchema),
    lectureController.updateLecture.bind(lectureController)
);

router.delete(
    '/:id',
    authMiddleware,
    requireAdmin,
    lectureController.deleteLecture.bind(lectureController)
);

export default router;

