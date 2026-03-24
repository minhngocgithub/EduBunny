import { Router } from 'express';
import { achievementController } from './achievement.controller';
import { authMiddleware, requireAdmin, requireStudent } from '@/shared/config/passport.config';
import { validateRequest } from '@/shared/middleware/validation.middleware';
import {
  checkAchievementSchema,
  createAchievementSchema,
  updateAchievementSchema,
} from './achievement.dto';

const router = Router();

router.use(authMiddleware);

router.get('/achievements', (req, res, next) => achievementController.getAllAchievements(req, res, next));
router.get('/achievements/me', requireStudent, (req, res, next) => achievementController.getMyAchievements(req, res, next));
router.post('/achievements/check', requireStudent, (req, res, next) => achievementController.checkMyAchievements(req, res, next));

router.post(
  '/achievements/admin/check',
  requireAdmin,
  validateRequest(checkAchievementSchema),
  (req, res, next) => achievementController.checkStudentAchievements(req, res, next)
);

router.post(
  '/achievements',
  requireAdmin,
  validateRequest(createAchievementSchema),
  (req, res, next) => achievementController.createAchievement(req, res, next)
);

router.patch(
  '/achievements/:id',
  requireAdmin,
  validateRequest(updateAchievementSchema),
  (req, res, next) => achievementController.updateAchievement(req, res, next)
);

export default router;
