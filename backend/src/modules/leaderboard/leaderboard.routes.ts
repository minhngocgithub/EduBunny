import { Router } from 'express';
import { leaderboardController } from './leaderboard.controller';
import { authMiddleware, requireAdmin } from '@/shared/middleware/auth.middleware';

const router = Router();

// Public routes - anyone can view leaderboard
router.get('/', leaderboardController.getLeaderboard.bind(leaderboardController));

// Student routes - authenticated students only
router.get(
    '/me',
    authMiddleware,
    leaderboardController.getMyLeaderboard.bind(leaderboardController)
);

router.get(
    '/rank/:studentId',
    authMiddleware,
    leaderboardController.getStudentRank.bind(leaderboardController)
);

// Admin routes - rebuild leaderboard
router.post(
    '/rebuild',
    authMiddleware,
    requireAdmin,
    leaderboardController.rebuildLeaderboard.bind(leaderboardController)
);

export default router;
