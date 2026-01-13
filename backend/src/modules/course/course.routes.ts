import { Router } from 'express';
import { courseController } from './course.controller';
import { authMiddleware, requireAdmin } from '@/shared/config/passport.config';
import { validateRequest, validateQuery } from '@/shared/middleware/validation.middleware';
import {
    CreateCourseSchema,
    UpdateCourseSchema,
    CourseQuerySchema,
} from './course.dto';

const router = Router();

// Public routes
router.get('/', validateQuery(CourseQuerySchema), courseController.getCourses.bind(courseController));
router.get('/:id', courseController.getCourseById.bind(courseController));
router.get('/slug/:slug', courseController.getCourseBySlug.bind(courseController));
router.get('/:id/reviews', courseController.getCourseReviews.bind(courseController));

// Admin routes (protected)
router.post(
    '/',
    authMiddleware,
    requireAdmin,
    validateRequest(CreateCourseSchema),
    courseController.createCourse.bind(courseController)
);

router.patch(
    '/:id',
    authMiddleware,
    requireAdmin,
    validateRequest(UpdateCourseSchema),
    courseController.updateCourse.bind(courseController)
);

router.delete(
    '/:id',
    authMiddleware,
    requireAdmin,
    courseController.deleteCourse.bind(courseController)
);

export default router;

