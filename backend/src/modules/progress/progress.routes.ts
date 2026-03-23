import { Router } from 'express';
import { progressController } from './progress.controller';
import { authMiddleware, requireStudent } from '@/shared/config/passport.config';
import { validateRequest } from '@/shared/middleware/validation.middleware';
import {
    TrackViewingSchema,
} from './progress.dto';

const router = Router();

// All progress routes require authentication and student role
router.use(authMiddleware);
router.use(requireStudent);

router.get('/', progressController.getProgressSummary.bind(progressController));
router.get('/courses/:courseId', progressController.getCourseProgress.bind(progressController));
router.get('/lectures/:lectureId', progressController.getLectureProgress.bind(progressController));
router.post('/lectures/:lectureId/track', validateRequest(TrackViewingSchema), progressController.trackViewing.bind(progressController));
router.patch('/lectures/:lectureId/complete', progressController.markAsCompleted.bind(progressController));
router.get('/statistics', progressController.getStatistics.bind(progressController));

export default router;

