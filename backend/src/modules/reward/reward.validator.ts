/**
 * Reward Validators
 * Validation schemas for reward operations
 */

import Joi from 'joi';
import { RewardCategory, Currency, ShopItemType } from '@prisma/client';

// Grant Reward validation
export const grantRewardSchema = Joi.object({
  studentId: Joi.string().uuid().required(),
  category: Joi.string()
    .valid(...Object.values(RewardCategory))
    .required(),
  metadata: Joi.object({
    lectureId: Joi.string().uuid(),
    courseId: Joi.string().uuid(),
    quizId: Joi.string().uuid(),
    gameId: Joi.string().uuid(),
    score: Joi.number().min(0).max(100),
    stars: Joi.number().min(1).max(3),
    achievementId: Joi.string().uuid(),
    isPerfect: Joi.boolean(),
  }).optional(),
});

// Purchase Item validation
export const purchaseItemSchema = Joi.object({
  studentId: Joi.string().uuid().required(),
  itemId: Joi.string().uuid().required(),
});

// Shop Filters validation
export const shopFiltersSchema = Joi.object({
  type: Joi.string().valid(...Object.values(ShopItemType)),
  currency: Joi.string().valid(...Object.values(Currency)),
  maxPrice: Joi.number().min(0),
  minLevel: Joi.number().min(1),
});

// Transaction Filters validation
export const transactionFiltersSchema = Joi.object({
  studentId: Joi.string().uuid().required(),
  type: Joi.string().valid('EARN', 'SPEND', 'BONUS', 'PENALTY', 'REFUND'),
  category: Joi.string().valid(...Object.values(RewardCategory)),
  currency: Joi.string().valid(...Object.values(Currency)),
  startDate: Joi.date(),
  endDate: Joi.date(),
  limit: Joi.number().min(1).max(100).default(20),
  offset: Joi.number().min(0).default(0),
});

// Create Shop Item validation (Admin)
export const createShopItemSchema = Joi.object({
  type: Joi.string()
    .valid(...Object.values(ShopItemType))
    .required(),
  name: Joi.string().min(3).max(100).required(),
  description: Joi.string().min(10).max(1000).required(),
  icon: Joi.string().uri().required(),
  price: Joi.number().min(1).required(),
  currency: Joi.string()
    .valid(...Object.values(Currency))
    .required(),
  requiredLevel: Joi.number().min(1).optional().allow(null),
  isActive: Joi.boolean().default(true),
  metadata: Joi.object().optional(),
});

// Update Shop Item validation (Admin)
export const updateShopItemSchema = Joi.object({
  name: Joi.string().min(3).max(100),
  description: Joi.string().min(10).max(1000),
  icon: Joi.string().uri(),
  price: Joi.number().min(1),
  currency: Joi.string().valid(...Object.values(Currency)),
  requiredLevel: Joi.number().min(1).allow(null),
  isActive: Joi.boolean(),
  metadata: Joi.object(),
}).min(1);
