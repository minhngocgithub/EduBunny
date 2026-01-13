import { Router } from 'express';
import { monitoringController } from './monitoring.controller';
import { authMiddleware, requireParent } from '@/shared/config/passport.config';
import { validateRequest } from '@/shared/middleware/validation.middleware';
import { SubscribeReportSchema } from './monitoring.dto';

const router = Router();

// All monitoring routes require authentication and parent role
router.use(authMiddleware);
router.use(requireParent);

// Real-time activity (SSE)
router.get('/realtime/:childId', monitoringController.getRealtimeActivity.bind(monitoringController));

// Reports
router.get('/children/:childId/activity', monitoringController.getActivityLog.bind(monitoringController));
router.get('/children/:childId/daily', monitoringController.getDailyReport.bind(monitoringController));
router.get('/children/:childId/weekly', monitoringController.getWeeklyReport.bind(monitoringController));
router.get('/children/progress', monitoringController.getChildrenProgress.bind(monitoringController));

// Subscriptions
router.post(
    '/daily-report/subscribe',
    validateRequest(SubscribeReportSchema),
    monitoringController.subscribeDailyReport.bind(monitoringController)
);
router.post(
    '/weekly-report/subscribe',
    validateRequest(SubscribeReportSchema),
    monitoringController.subscribeWeeklyReport.bind(monitoringController)
);

export default router;

