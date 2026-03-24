import { Router } from 'express';
import { adminController } from './admin.controller';
import { authMiddleware, requireAdmin } from '@/shared/config/passport.config';

const router = Router();

// All admin routes require authentication and admin role
router.use(authMiddleware);
router.use(requireAdmin);

// Dashboard routes
router.get('/dashboard/stats', adminController.getDashboardStats.bind(adminController));
router.get('/dashboard/user-growth', adminController.getUserGrowth.bind(adminController));
router.get('/dashboard/subject-distribution', adminController.getSubjectDistribution.bind(adminController));
router.get('/dashboard/recent-activities', adminController.getRecentActivities.bind(adminController));
router.get('/dashboard/top-courses', adminController.getTopCourses.bind(adminController));

// Analytics routes
router.get('/analytics', adminController.getAnalytics.bind(adminController));
router.get('/analytics/popular-content', adminController.getPopularContent.bind(adminController));
router.get('/analytics/subject-progress', adminController.getSubjectProgress.bind(adminController));

export default router;
