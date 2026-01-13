import { Router } from 'express';
import { lectureController } from './lecture.controller';
import { authMiddleware, requireAdmin } from '@/shared/config/passport.config';
import { validateRequest } from '@/shared/middleware/validation.middleware';
import {
    CreateLectureSchema,
    UpdateLectureSchema,
} from './lecture.dto';

const router = Router();

// Public routes
router.get('/courses/:courseId/lectures', lectureController.getLecturesByCourse.bind(lectureController));
router.get('/:id', lectureController.getLectureById.bind(lectureController));
router.get('/slug/:slug', lectureController.getLectureBySlug.bind(lectureController));

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

