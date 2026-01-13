import { Router } from 'express';
import { recommendationController } from './recommendation.controller';
import { authMiddleware, requireStudent } from '@/shared/config/passport.config';

const router = Router();

// All recommendation routes require authentication and student role
router.use(authMiddleware);
router.use(requireStudent);

router.get('/', recommendationController.getCourseRecommendations.bind(recommendationController));
router.get('/next', recommendationController.getNextLearningItem.bind(recommendationController));
router.get('/popular', recommendationController.getPopularCourses.bind(recommendationController));
router.get('/challenge', recommendationController.getChallengeCourses.bind(recommendationController));
router.get('/reinforcement', recommendationController.getReinforcementCourses.bind(recommendationController));

export default router;

