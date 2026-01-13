
import { PrismaClient, Currency, RewardType, RewardCategory, Prisma } from '@prisma/client';
import {
  RewardResult,
  RewardBreakdown,
  GrantRewardInput,
  LevelUpResult,
  StreakStatus,
  StreakBonusResult,
  PurchaseItemInput,
  PurchaseResult,
  ShopItemData,
  InventoryItem,
  ShopFilters,
  TransactionFilters,
  TransactionHistory,
  RewardSummary,
  LevelProgress,
} from './reward.types';
import { REWARD_RULES, SHOP_ITEMS_CONFIG } from './constants/reward-rules';
import {
  XP_PER_LEVEL,
  calculateLevelFromXP,
  calculateLevelProgress,
  getLevelMultiplier,
  getLevelTitle,
  LEVEL_UNLOCKS,
} from './constants/level-config';
import { notificationService } from '../../shared/services/notification.service';

const prisma = new PrismaClient();

export class RewardService {
  // ==================== Core Reward Methods ====================

  /**
   * Grant rewards to a student based on activity
   */
  async grantReward(input: GrantRewardInput): Promise<RewardResult> {
    const { studentId, category, metadata = {} } = input;

    // Get current student data
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      throw new Error('Student not found');
    }

    // Calculate rewards based on category
    const rewards = await this.calculateRewards(category, metadata, student);

    // Check for streak bonus
    const streakBonus = await this.calculateStreakBonus(student);
    if (streakBonus.multiplierActive) {
      rewards.xp = Math.floor(rewards.xp * streakBonus.multiplier);
      rewards.details.bonus.push({
        xp: Math.floor(rewards.details.base.xp * (streakBonus.multiplier - 1)),
        coins: 0,
        source: `streak_${student.streak}d_multiplier`,
      });
    }

    // Apply level multiplier
    const levelMultiplier = getLevelMultiplier(student.level);
    if (levelMultiplier > 1) {
      const bonusXP = Math.floor(rewards.details.base.xp * (levelMultiplier - 1));
      rewards.xp += bonusXP;
      rewards.details.bonus.push({
        xp: bonusXP,
        coins: 0,
        source: `level_${student.level}_multiplier`,
      });
    }

    // Update student balances
    const newXP = student.xp + rewards.xp;
    const newCoins = student.coins + rewards.coins;
    const newStars = student.stars + rewards.stars;

    await prisma.student.update({
      where: { id: studentId },
      data: {
        xp: newXP,
        coins: newCoins,
        stars: newStars,
      },
    });

    // Create transaction record
    const mainCurrency = rewards.xp > 0 ? Currency.XP : rewards.coins > 0 ? Currency.COIN : Currency.STAR;
    const mainAmount = mainCurrency === Currency.XP ? rewards.xp : mainCurrency === Currency.COIN ? rewards.coins : rewards.stars;

    const transaction = await prisma.rewardTransaction.create({
      data: {
        studentId,
        type: RewardType.EARN,
        category,
        amount: mainAmount,
        currency: mainCurrency,
        metadata: {
          ...metadata,
          breakdown: rewards.details,
        },
      },
    });

    // Check for level up
    const levelUpResult = await this.checkAndGrantLevelUp(studentId, student.xp, newXP);

    return {
      success: true,
      rewards,
      levelUp: levelUpResult || undefined,
      streakBonus: streakBonus.multiplierActive ? streakBonus : undefined,
      transaction: {
        id: transaction.id,
        type: transaction.type,
        category: transaction.category,
        amount: transaction.amount,
        currency: transaction.currency,
      },
    };
  }

  private async calculateRewards(
    category: RewardCategory,
    metadata: Record<string, unknown>,
    student: { id: string; level: number; streak: number; userId: string }
  ): Promise<RewardBreakdown> {
    let baseXP = 0;
    let baseCoins = 0;
    let stars = 0;
    const bonus: Array<{ xp: number; coins: number; source: string }> = [];

    switch (category) {
      case RewardCategory.LESSON_COMPLETE:
        baseXP = REWARD_RULES.LESSON_COMPLETE.baseXP;
        baseCoins = REWARD_RULES.LESSON_COMPLETE.baseCoins;
        break;

      case RewardCategory.QUIZ_COMPLETE:
        baseXP = REWARD_RULES.QUIZ_COMPLETE.baseXP;
        baseCoins = REWARD_RULES.QUIZ_COMPLETE.baseCoins;

        // Add star-based bonus
        if (metadata.stars && typeof metadata.stars === 'number') {
          const starBonus = REWARD_RULES.QUIZ_COMPLETE.starBonus[metadata.stars as 1 | 2 | 3];
          if (starBonus) {
            bonus.push({
              xp: starBonus.xp,
              coins: starBonus.coins,
              source: `${metadata.stars}_star_bonus`,
            });
            stars = metadata.stars;
          }
        }

        // Perfect score bonus
        if (metadata.isPerfect) {
          bonus.push({
            xp: 100,
            coins: 50,
            source: 'perfect_score',
          });

          // Send perfect quiz notification
          if (metadata.quizTitle && typeof metadata.quizTitle === 'string') {
            notificationService.notifyPerfectQuiz(student.userId, metadata.quizTitle, {
              xp: baseXP + 100,
              coins: baseCoins + 50,
              stars: 3,
            }).catch(err => console.error('Failed to send perfect quiz notification:', err));
          }
        }
        break;

      case RewardCategory.GAME_PLAY:
        baseXP = REWARD_RULES.GAME_PLAY.baseXP;
        baseCoins = REWARD_RULES.GAME_PLAY.baseCoins;

        // Score-based bonus
        if (metadata.score && typeof metadata.score === 'number') {
          const scoreBonus = Math.min(
            Math.floor(metadata.score * REWARD_RULES.GAME_PLAY.scoreMultiplier),
            REWARD_RULES.GAME_PLAY.maxBonusCoins
          );
          bonus.push({
            xp: 0,
            coins: scoreBonus,
            source: 'game_score',
          });
        }
        break;

      case RewardCategory.ACHIEVEMENT_UNLOCK:
        baseXP = REWARD_RULES.ACHIEVEMENT_UNLOCK.baseXP;
        baseCoins = REWARD_RULES.ACHIEVEMENT_UNLOCK.baseCoins;
        break;

      case RewardCategory.AI_CHAT: {
        // Check daily limit
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const todayChatXP = await prisma.rewardTransaction.aggregate({
          where: {
            studentId: student.id,
            category: RewardCategory.AI_CHAT,
            currency: Currency.XP,
            createdAt: { gte: todayStart },
          },
          _sum: { amount: true },
        });

        const earnedToday = todayChatXP._sum.amount || 0;
        if (earnedToday < REWARD_RULES.AI_CHAT.dailyLimit) {
          baseXP = Math.min(
            REWARD_RULES.AI_CHAT.xpPerMessage,
            REWARD_RULES.AI_CHAT.dailyLimit - earnedToday
          );
        }
        break;
      }

      case RewardCategory.DAILY_LOGIN: {
        baseXP = REWARD_RULES.DAILY_LOGIN.xp;
        baseCoins = REWARD_RULES.DAILY_LOGIN.coins;
        break;
      }

      default:
        break;
    }

    // Calculate totals
    const bonusXP = bonus.reduce((sum, b) => sum + b.xp, 0);
    const bonusCoins = bonus.reduce((sum, b) => sum + b.coins, 0);

    return {
      xp: baseXP + bonusXP,
      coins: baseCoins + bonusCoins,
      stars,
      details: {
        base: { xp: baseXP, coins: baseCoins },
        bonus,
      },
    };
  }

  // ==================== Level System Methods ====================

  /**
   * Check if student leveled up and grant level-up rewards
   */
  private async checkAndGrantLevelUp(
    studentId: string,
    oldXP: number,
    newXP: number
  ): Promise<LevelUpResult | null> {
    const oldLevel = calculateLevelFromXP(oldXP);
    const newLevel = calculateLevelFromXP(newXP);

    if (newLevel > oldLevel) {
      // Update student level
      const updatedStudent = await prisma.student.update({
        where: { id: studentId },
        data: {
          level: newLevel,
          coins: { increment: REWARD_RULES.LEVEL_UP.coinReward },
        },
        include: { user: true },
      });

      // Create level-up transaction
      await prisma.rewardTransaction.create({
        data: {
          studentId,
          type: RewardType.BONUS,
          category: RewardCategory.LEVEL_UP,
          amount: REWARD_RULES.LEVEL_UP.coinReward,
          currency: Currency.COIN,
          metadata: { oldLevel, newLevel },
        },
      });

      // Send level up notification
      notificationService.notifyLevelUp(
        updatedStudent.userId,
        newLevel,
        REWARD_RULES.LEVEL_UP.coinReward
      ).catch(err => console.error('Failed to send level up notification:', err));

      // Get unlocks for new level
      const unlocks: string[] = [];
      for (const [level, data] of Object.entries(LEVEL_UNLOCKS)) {
        if (parseInt(level) === newLevel) {
          unlocks.push(...data.items, ...data.features);
        }
      }

      return {
        occurred: true,
        oldLevel,
        newLevel,
        rewards: {
          coins: REWARD_RULES.LEVEL_UP.coinReward,
        },
        unlocks,
        title: getLevelTitle(newLevel),
      };
    }

    return null;
  }

  /**
   * Get student's level progress
   */
  async getLevelProgress(studentId: string): Promise<LevelProgress> {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { xp: true, level: true },
    });

    if (!student) {
      throw new Error('Student not found');
    }

    const progressPercent = calculateLevelProgress(student.xp);
    const xpForNextLevel = student.level * XP_PER_LEVEL;

    return {
      currentLevel: student.level,
      currentXP: student.xp,
      xpForNextLevel,
      progressPercent,
      title: getLevelTitle(student.level),
    };
  }

  // ==================== Streak Methods ====================

  /**
   * Update student's streak based on activity
   */
  async updateStreak(studentId: string): Promise<StreakStatus> {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        streakShields: {
          where: {
            usedAt: null,
            expiresAt: { gt: new Date() },
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!student) {
      throw new Error('Student not found');
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastActive = student.lastActiveDate
      ? new Date(student.lastActiveDate.getFullYear(), student.lastActiveDate.getMonth(), student.lastActiveDate.getDate())
      : null;

    let newStreak = student.streak;
    let streakBroken = false;

    if (!lastActive) {
      // First activity ever
      newStreak = 1;
    } else {
      const daysDiff = Math.floor((today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff === 0) {
        // Same day - no change
        newStreak = student.streak;
      } else if (daysDiff === 1) {
        // Consecutive day - increment
        newStreak = student.streak + 1;
      } else {
        // Streak broken
        if (student.streakShields.length > 0) {
          // Use shield
          await prisma.streakShield.update({
            where: { id: student.streakShields[0].id },
            data: { usedAt: new Date() },
          });
          newStreak = student.streak; // Maintain streak
        } else {
          newStreak = 1;
          streakBroken = true;
        }
      }
    }

    // Update student
    await prisma.student.update({
      where: { id: studentId },
      data: {
        streak: newStreak,
        lastActiveDate: now,
      },
    });

    // Check for streak milestone
    if (!streakBroken && REWARD_RULES.STREAK_MILESTONES[newStreak as keyof typeof REWARD_RULES.STREAK_MILESTONES]) {
      await this.grantStreakMilestoneReward(studentId, newStreak);
    }

    return this.getStreakStatus(studentId);
  }

  /**
   * Grant streak milestone rewards
   */
  private async grantStreakMilestoneReward(studentId: string, streak: number): Promise<void> {
    const milestone = REWARD_RULES.STREAK_MILESTONES[streak as keyof typeof REWARD_RULES.STREAK_MILESTONES];
    if (!milestone) return;

    // Get student with user info
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { user: true },
    });

    if (!student) return;

    // Grant coins
    await prisma.student.update({
      where: { id: studentId },
      data: {
        coins: { increment: milestone.coins },
      },
    });

    // Create transaction
    await prisma.rewardTransaction.create({
      data: {
        studentId,
        type: RewardType.BONUS,
        category: RewardCategory.STREAK_BONUS,
        amount: milestone.coins,
        currency: Currency.COIN,
        metadata: { streak, badge: milestone.badge },
      },
    });

    // Send streak milestone notification
    notificationService.notifyStreakMilestone(
      student.userId,
      streak,
      milestone.coins,
      milestone.badge
    ).catch(err => console.error('Failed to send streak milestone notification:', err));

    // TODO: Grant badge/achievement
  }

  /**
   * Get current streak status
   */
  async getStreakStatus(studentId: string): Promise<StreakStatus> {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        streakShields: {
          where: {
            usedAt: null,
            expiresAt: { gt: new Date() },
          },
        },
      },
    });

    if (!student) {
      throw new Error('Student not found');
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastActive = student.lastActiveDate
      ? new Date(student.lastActiveDate.getFullYear(), student.lastActiveDate.getMonth(), student.lastActiveDate.getDate())
      : null;

    let isActive = false;
    let daysUntilBreak = 0;

    if (lastActive) {
      const daysDiff = Math.floor((today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));
      isActive = daysDiff === 0;
      daysUntilBreak = isActive ? 1 : 0;
    }

    // Find next milestone
    const nextMilestone = Object.keys(REWARD_RULES.STREAK_MILESTONES)
      .map(Number)
      .sort((a, b) => a - b)
      .find(m => m > student.streak);

    return {
      currentStreak: student.streak,
      lastActiveDate: student.lastActiveDate,
      isActive,
      daysUntilBreak,
      hasShield: student.streakShields.length > 0,
      nextMilestone: nextMilestone ? {
        days: nextMilestone,
        rewards: REWARD_RULES.STREAK_MILESTONES[nextMilestone as keyof typeof REWARD_RULES.STREAK_MILESTONES],
      } : undefined,
    };
  }

  /**
   * Calculate streak bonus for current activity
   */
  private async calculateStreakBonus(student: { streak: number }): Promise<StreakBonusResult> {
    const { streak } = student;
    const { minStreak, multiplier } = REWARD_RULES.STREAK_MULTIPLIER;

    // Check if milestone was just reached
    const milestone = REWARD_RULES.STREAK_MILESTONES[streak as keyof typeof REWARD_RULES.STREAK_MILESTONES];

    return {
      milestoneReached: !!milestone,
      milestone: milestone ? streak : undefined,
      rewards: milestone,
      multiplierActive: streak >= minStreak,
      multiplier: streak >= minStreak ? multiplier : 1,
    };
  }

  /**
   * Use a streak shield
   */
  async useStreakShield(studentId: string): Promise<boolean> {
    const shield = await prisma.streakShield.findFirst({
      where: {
        studentId,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!shield) {
      return false;
    }

    await prisma.streakShield.update({
      where: { id: shield.id },
      data: { usedAt: new Date() },
    });

    return true;
  }

  // ==================== Shop Methods ====================

  /**
   * Get all shop items with filters
   */
  async getShopItems(filters: ShopFilters, studentId?: string): Promise<ShopItemData[]> {
    const where: Prisma.ShopItemWhereInput = {
      isActive: true,
    };

    if (filters.type) where.type = filters.type;
    if (filters.currency) where.currency = filters.currency;
    if (filters.maxPrice) where.price = { lte: filters.maxPrice };
    if (filters.minLevel) where.requiredLevel = { lte: filters.minLevel };

    const items = await prisma.shopItem.findMany({
      where,
      orderBy: [{ type: 'asc' }, { price: 'asc' }],
    });

    // If studentId provided, mark owned items
    if (studentId) {
      const purchases = await prisma.shopPurchase.findMany({
        where: { studentId },
        select: { itemId: true },
      });
      const ownedIds = new Set(purchases.map(p => p.itemId));

      return items.map(item => ({
        ...item,
        owned: ownedIds.has(item.id),
      }));
    }

    return items;
  }

  /**
   * Purchase an item from shop
   */
  async purchaseItem(input: PurchaseItemInput): Promise<PurchaseResult> {
    const { studentId, itemId } = input;

    // Get item
    const item = await prisma.shopItem.findUnique({
      where: { id: itemId },
    });

    if (!item || !item.isActive) {
      return {
        success: false,
        message: 'Item not found or not available',
      };
    }

    // Get student
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      return {
        success: false,
        message: 'Student not found',
      };
    }

    // Check level requirement
    if (item.requiredLevel && student.level < item.requiredLevel) {
      return {
        success: false,
        message: `Requires level ${item.requiredLevel}`,
      };
    }

    // Check if already owned (for non-consumable items)
    if (item.type !== 'STREAK_SHIELD') {
      const existing = await prisma.shopPurchase.findFirst({
        where: { studentId, itemId },
      });

      if (existing) {
        return {
          success: false,
          message: 'Item already owned',
        };
      }
    }

    // Check balance
    const balance = item.currency === Currency.COIN ? student.coins : student.stars;
    if (balance < item.price) {
      return {
        success: false,
        message: `Insufficient ${item.currency.toLowerCase()}s`,
      };
    }

    // Perform transaction
    const purchase = await prisma.$transaction(async (tx) => {
      // Deduct currency
      await tx.student.update({
        where: { id: studentId },
        data: {
          [item.currency === Currency.COIN ? 'coins' : 'stars']: {
            decrement: item.price,
          },
        },
      });

      // Create purchase record
      const newPurchase = await tx.shopPurchase.create({
        data: {
          studentId,
          itemId,
          price: item.price,
          currency: item.currency,
        },
        include: { item: true },
      });

      // Create transaction record
      await tx.rewardTransaction.create({
        data: {
          studentId,
          type: RewardType.SPEND,
          category: RewardCategory.SHOP_PURCHASE,
          amount: item.price,
          currency: item.currency,
          metadata: { itemId, itemName: item.name },
        },
      });

      // If streak shield, create shield record
      if (item.type === 'STREAK_SHIELD') {
        const expiresAt = new Date(Date.now() + SHOP_ITEMS_CONFIG.STREAK_SHIELD.duration);
        await tx.streakShield.create({
          data: {
            studentId,
            expiresAt,
          },
        });
      }

      return newPurchase;
    });

    // Get updated balance
    const updatedStudent = await prisma.student.findUnique({
      where: { id: studentId },
      select: { coins: true, stars: true, user: { select: { id: true } } },
    });

    // Send shop purchase notification
    if (updatedStudent?.user) {
      notificationService.notifyShopPurchase(
        updatedStudent.user.id,
        item.name,
        item.price,
        item.currency
      ).catch(err => console.error('Failed to send shop purchase notification:', err));
    }

    return {
      success: true,
      message: 'Purchase successful',
      purchase: {
        id: purchase.id,
        item: purchase.item as ShopItemData,
        price: purchase.price,
        currency: purchase.currency,
        purchasedAt: purchase.purchasedAt,
      },
      newBalance: updatedStudent!,
    };
  }

  /**
   * Get student's inventory
   */
  async getStudentInventory(studentId: string): Promise<InventoryItem[]> {
    const purchases = await prisma.shopPurchase.findMany({
      where: { studentId },
      include: { item: true },
      orderBy: { purchasedAt: 'desc' },
    });

    return purchases.map(p => ({
      purchaseId: p.id,
      item: p.item as ShopItemData,
      purchasedAt: p.purchasedAt,
    }));
  }

  // ==================== Transaction & Summary Methods ====================

  /**
   * Get transaction history
   */
  async getTransactionHistory(filters: TransactionFilters): Promise<TransactionHistory> {
    const { studentId, type, category, currency, startDate, endDate, limit = 20, offset = 0 } = filters;

    const where: Prisma.RewardTransactionWhereInput = { studentId };
    if (type) where.type = type;
    if (category) where.category = category;
    if (currency) where.currency = currency;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const [transactions, totalCount] = await Promise.all([
      prisma.rewardTransaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.rewardTransaction.count({ where }),
    ]);

    // Calculate summary
    const allTransactions = await prisma.rewardTransaction.findMany({ where: { studentId } });

    const summary = {
      totalEarned: {
        xp: 0,
        coins: 0,
        stars: 0,
      },
      totalSpent: {
        coins: 0,
        stars: 0,
      },
    };

    allTransactions.forEach(t => {
      if (t.type === RewardType.EARN || t.type === RewardType.BONUS) {
        if (t.currency === Currency.XP) summary.totalEarned.xp += t.amount;
        if (t.currency === Currency.COIN) summary.totalEarned.coins += t.amount;
        if (t.currency === Currency.STAR) summary.totalEarned.stars += t.amount;
      } else if (t.type === RewardType.SPEND) {
        if (t.currency === Currency.COIN) summary.totalSpent.coins += t.amount;
        if (t.currency === Currency.STAR) summary.totalSpent.stars += t.amount;
      }
    });

    return {
      transactions,
      totalCount,
      summary,
    };
  }

  /**
   * Get comprehensive reward summary for student
   */
  async getRewardSummary(studentId: string): Promise<RewardSummary> {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        xp: true,
        level: true,
        coins: true,
        stars: true,
        streak: true,
      },
    });

    if (!student) {
      throw new Error('Student not found');
    }

    const [levelProgress, streakStatus, recentTransactions, transactionHistory] = await Promise.all([
      this.getLevelProgress(studentId),
      this.getStreakStatus(studentId),
      prisma.rewardTransaction.findMany({
        where: { studentId },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      this.getTransactionHistory({ studentId }),
    ]);

    return {
      student,
      levelProgress,
      streakStatus,
      recentTransactions,
      statistics: {
        totalEarned: transactionHistory.summary.totalEarned,
        totalSpent: transactionHistory.summary.totalSpent,
        lifetimeXP: student.xp,
      },
    };
  }
}

export const rewardService = new RewardService();
