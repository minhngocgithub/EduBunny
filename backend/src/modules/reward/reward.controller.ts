/**
 * Reward Controller
 * HTTP request handlers for reward operations
 */

import { Request, Response } from 'express';
import { rewardService } from './reward.service';
import {
  grantRewardSchema,
  purchaseItemSchema,
  shopFiltersSchema,
  transactionFiltersSchema,
  createShopItemSchema,
  updateShopItemSchema,
} from './reward.validator';
import { RewardCategory, RewardType, Currency, ShopItemType } from '@prisma/client';

export class RewardController {
  // ==================== Reward Endpoints ====================

  /**
   * POST /api/rewards/grant
   * Grant rewards to a student (typically called internally by other services)
   */
  async grantReward(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = grantRewardSchema.validate(req.body);
      if (error) {
        res.status(400).json({ error: error.details[0].message });
        return;
      }

      const result = await rewardService.grantReward(value);
      res.status(200).json(result);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Internal Server Error';
      res.status(500).json({ error: message });
    }
  }

  /**
   * GET /api/rewards/student/:id
   * Get comprehensive reward summary for a student
   */
  async getRewardSummary(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const summary = await rewardService.getRewardSummary(id);
      res.status(200).json(summary);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Internal Server Error';
      res.status(500).json({ error: message });
    }
  }

  /**
   * GET /api/rewards/transactions
   * Get transaction history with filters
   */
  async getTransactionHistory(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        studentId: req.query.studentId as string,
        type: req.query.type as RewardType | undefined,
        category: req.query.category as RewardCategory | undefined,
        currency: req.query.currency as Currency | undefined,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
        offset: req.query.offset ? parseInt(req.query.offset as string) : 0,
      };

      const { error } = transactionFiltersSchema.validate(filters);
      if (error) {
        res.status(400).json({ error: error.details[0].message });
        return;
      }

      const history = await rewardService.getTransactionHistory(filters);
      res.status(200).json(history);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Internal Server Error';
      res.status(500).json({ error: message });
    }
  }

  // ==================== Level Endpoints ====================

  /**
   * GET /api/rewards/level/:studentId
   * Get level progress for a student
   */
  async getLevelProgress(req: Request, res: Response): Promise<void> {
    try {
      const { studentId } = req.params;
      const progress = await rewardService.getLevelProgress(studentId);
      res.status(200).json(progress);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Internal Server Error';
      res.status(500).json({ error: message });
    }
  }

  // ==================== Streak Endpoints ====================

  /**
   * GET /api/rewards/streak/:studentId
   * Get current streak status
   */
  async getStreakStatus(req: Request, res: Response): Promise<void> {
    try {
      const { studentId } = req.params;
      const status = await rewardService.getStreakStatus(studentId);
      res.status(200).json(status);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Internal Server Error';
      res.status(500).json({ error: message });
    }
  }

  /**
   * POST /api/rewards/streak/update
   * Update streak (called on daily activity)
   */
  async updateStreak(req: Request, res: Response): Promise<void> {
    try {
      const { studentId } = req.body;
      if (!studentId) {
        res.status(400).json({ error: 'studentId is required' });
        return;
      }

      const status = await rewardService.updateStreak(studentId);
      res.status(200).json(status);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Internal Server Error';
      res.status(500).json({ error: message });
    }
  }

  /**
   * POST /api/rewards/streak/shield/use
   * Use a streak shield
   */
  async useStreakShield(req: Request, res: Response): Promise<void> {
    try {
      const { studentId } = req.body;
      if (!studentId) {
        res.status(400).json({ error: 'studentId is required' });
        return;
      }

      const success = await rewardService.useStreakShield(studentId);
      res.status(200).json({ success, message: success ? 'Shield used successfully' : 'No shield available' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Internal Server Error';
      res.status(500).json({ error: message });
    }
  }

  // ==================== Shop Endpoints ====================

  /**
   * GET /api/shop/items
   * Get shop items with optional filters
   */
  async getShopItems(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        type: req.query.type as ShopItemType | undefined,
        currency: req.query.currency as Currency | undefined,
        maxPrice: req.query.maxPrice ? parseInt(req.query.maxPrice as string) : undefined,
        minLevel: req.query.minLevel ? parseInt(req.query.minLevel as string) : undefined,
      };

      const { error } = shopFiltersSchema.validate(filters);
      if (error) {
        res.status(400).json({ error: error.details[0].message });
        return;
      }

      const studentId = req.query.studentId as string | undefined;
      const items = await rewardService.getShopItems(filters, studentId);
      res.status(200).json(items);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Internal Server Error';
      res.status(500).json({ error: message });
    }
  }

  /**
   * POST /api/shop/purchase
   * Purchase an item from the shop
   */
  async purchaseItem(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = purchaseItemSchema.validate(req.body);
      if (error) {
        res.status(400).json({ error: error.details[0].message });
        return;
      }

      const result = await rewardService.purchaseItem(value);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Internal Server Error';
      res.status(500).json({ error: message });
    }
  }

  /**
   * GET /api/shop/inventory/:studentId
   * Get student's purchased items
   */
  async getInventory(req: Request, res: Response): Promise<void> {
    try {
      const { studentId } = req.params;
      const inventory = await rewardService.getStudentInventory(studentId);
      res.status(200).json(inventory);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Internal Server Error';
      res.status(500).json({ error: message });
    }
  }

  // ==================== Admin Endpoints ====================

  /**
   * POST /api/shop/items (Admin only)
   * Create a new shop item
   */
  async createShopItem(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = createShopItemSchema.validate(req.body);
      if (error) {
        res.status(400).json({ error: error.details[0].message });
        return;
      }

      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();

      const item = await prisma.shopItem.create({
        data: value,
      });

      res.status(201).json(item);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Internal Server Error';
      res.status(500).json({ error: message });
    }
  }

  /**
   * PATCH /api/shop/items/:id (Admin only)
   * Update a shop item
   */
  async updateShopItem(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { error, value } = updateShopItemSchema.validate(req.body);
      if (error) {
        res.status(400).json({ error: error.details[0].message });
        return;
      }

      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();

      const item = await prisma.shopItem.update({
        where: { id },
        data: value,
      });

      res.status(200).json(item);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Internal Server Error';
      res.status(500).json({ error: message });
    }
  }

  /**
   * DELETE /api/shop/items/:id (Admin only)
   * Soft delete a shop item (set isActive to false)
   */
  async deleteShopItem(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();

      const item = await prisma.shopItem.update({
        where: { id },
        data: { isActive: false },
      });

      res.status(200).json({ message: 'Item deactivated', item });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Internal Server Error';
      res.status(500).json({ error: message });
    }
  }
}

export const rewardController = new RewardController();
