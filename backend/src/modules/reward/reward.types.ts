/**
 * Reward System Types
 */

import { 
  RewardType, 
  RewardCategory, 
  Currency, 
  ShopItemType,
  Prisma,
} from '@prisma/client';

// ==================== Reward Types ====================

export interface RewardResult {
  success: boolean;
  rewards: RewardBreakdown;
  levelUp?: LevelUpResult;
  streakBonus?: StreakBonusResult;
  transaction: {
    id: string;
    type: RewardType;
    category: RewardCategory;
    amount: number;
    currency: Currency;
  };
}

export interface RewardBreakdown {
  xp: number;
  coins: number;
  stars: number;
  details: {
    base: {
      xp: number;
      coins: number;
    };
    bonus: {
      xp: number;
      coins: number;
      source: string; // 'streak', 'level_multiplier', 'perfect_score', etc.
    }[];
  };
}

export interface GrantRewardInput {
  studentId: string;
  category: RewardCategory;
  metadata?: {
    lectureId?: string;
    courseId?: string;
    quizId?: string;
    gameId?: string;
    score?: number;
    stars?: number;
    achievementId?: string;
    isPerfect?: boolean;
  };
}

// ==================== Level System Types ====================

export interface LevelUpResult {
  occurred: boolean;
  oldLevel: number;
  newLevel: number;
  rewards: {
    coins: number;
  };
  unlocks: string[];
  title: string;
}

export interface LevelProgress {
  currentLevel: number;
  currentXP: number;
  xpForNextLevel: number;
  progressPercent: number;
  title: string;
}

// ==================== Streak Types ====================

export interface StreakStatus {
  currentStreak: number;
  lastActiveDate: Date | null;
  isActive: boolean;
  daysUntilBreak: number;
  hasShield: boolean;
  nextMilestone?: {
    days: number;
    rewards: {
      coins: number;
      badge: string;
    };
  };
}

export interface StreakBonusResult {
  milestoneReached: boolean;
  milestone?: number;
  rewards?: {
    coins: number;
    badge: string;
  };
  multiplierActive: boolean;
  multiplier: number;
}

export interface StreakShieldInfo {
  id: string;
  active: boolean;
  expiresAt: Date;
  used: boolean;
}

// ==================== Shop Types ====================

export interface ShopItemData {
  id: string;
  type: ShopItemType;
  name: string;
  description: string;
  icon: string;
  price: number;
  currency: Currency;
  requiredLevel: number | null;
  isActive: boolean;
  metadata: Prisma.JsonValue;
  owned?: boolean;
}

export interface PurchaseItemInput {
  studentId: string;
  itemId: string;
}

export interface PurchaseResult {
  success: boolean;
  message: string;
  purchase?: {
    id: string;
    item: ShopItemData;
    price: number;
    currency: Currency;
    purchasedAt: Date;
  };
  newBalance?: {
    coins: number;
    stars: number;
  };
}

export interface InventoryItem {
  purchaseId: string;
  item: ShopItemData;
  purchasedAt: Date;
}

export interface ShopFilters {
  type?: ShopItemType;
  currency?: Currency;
  maxPrice?: number;
  minLevel?: number;
}

// ==================== Transaction Types ====================

export interface TransactionHistory {
  transactions: RewardTransactionData[];
  totalCount: number;
  summary: {
    totalEarned: {
      xp: number;
      coins: number;
      stars: number;
    };
    totalSpent: {
      coins: number;
      stars: number;
    };
  };
}

export interface RewardTransactionData {
  id: string;
  type: RewardType;
  category: RewardCategory;
  amount: number;
  currency: Currency;
  metadata: Prisma.JsonValue;
  createdAt: Date;
}

export interface TransactionFilters {
  studentId: string;
  type?: RewardType;
  category?: RewardCategory;
  currency?: Currency;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

// ==================== Summary Types ====================

export interface RewardSummary {
  student: {
    id: string;
    xp: number;
    level: number;
    coins: number;
    stars: number;
    streak: number;
  };
  levelProgress: LevelProgress;
  streakStatus: StreakStatus;
  recentTransactions: RewardTransactionData[];
  statistics: {
    totalEarned: {
      xp: number;
      coins: number;
      stars: number;
    };
    totalSpent: {
      coins: number;
      stars: number;
    };
    lifetimeXP: number;
  };
}

// ==================== Calculation Types ====================

export interface QuizRewardInput {
  studentId: string;
  quizId: string;
  score: number;
  totalQuestions: number;
  isPerfect: boolean;
}

export interface GameRewardInput {
  studentId: string;
  gameId: string;
  score: number;
  level: number;
}
