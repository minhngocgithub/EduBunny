
import { Router } from 'express';
import { rewardController } from './reward.controller';
import { authMiddleware, requireAdmin } from '@/shared/config/passport.config';

const router = Router();

// ==================== Reward Routes ====================

// Grant rewards (internal or admin only)
router.post(
  '/rewards/grant',
  authMiddleware,
  requireAdmin,
  (req, res) => rewardController.grantReward(req, res)
);

// Get reward summary for a student
router.get(
  '/rewards/student/:id',
  authMiddleware,
  (req, res) => rewardController.getRewardSummary(req, res)
);

// Get transaction history
router.get(
  '/rewards/transactions',
  authMiddleware,
  (req, res) => rewardController.getTransactionHistory(req, res)
);

// Get level progress
router.get(
  '/rewards/level/:studentId',
  authMiddleware,
  (req, res) => rewardController.getLevelProgress(req, res)
);

// ==================== Streak Routes ====================

// Get streak status
router.get(
  '/rewards/streak/:studentId',
  authMiddleware,
  (req, res) => rewardController.getStreakStatus(req, res)
);

// Update streak (on activity)
router.post(
  '/rewards/streak/update',
  authMiddleware,
  (req, res) => rewardController.updateStreak(req, res)
);

// Use streak shield
router.post(
  '/rewards/streak/shield/use',
  authMiddleware,
  (req, res) => rewardController.useStreakShield(req, res)
);

// ==================== Shop Routes ====================

// Get shop items
router.get(
  '/shop/items',
  authMiddleware,
  (req, res) => rewardController.getShopItems(req, res)
);

// Purchase item
router.post(
  '/shop/purchase',
  authMiddleware,
  (req, res) => rewardController.purchaseItem(req, res)
);

// Get student inventory
router.get(
  '/shop/inventory/:studentId',
  authMiddleware,
  (req, res) => rewardController.getInventory(req, res)
);

// ==================== Admin Shop Management Routes ====================

// Create shop item (admin only)
router.post(
  '/shop/items',
  authMiddleware,
  requireAdmin,
  (req, res) => rewardController.createShopItem(req, res)
);

// Update shop item (admin only)
router.patch(
  '/shop/items/:id',
  authMiddleware,
  requireAdmin,
  (req, res) => rewardController.updateShopItem(req, res)
);

// Delete (deactivate) shop item (admin only)
router.delete(
  '/shop/items/:id',
  authMiddleware,
  requireAdmin,
  (req, res) => rewardController.deleteShopItem(req, res)
);

export default router;
