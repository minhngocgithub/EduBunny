/**
 * Reward Rules Configuration
 * Định nghĩa các quy tắc thưởng/phạt trong hệ thống
 */

export const REWARD_RULES = {
  // Thưởng khi hoàn thành bài học
  LESSON_COMPLETE: {
    baseXP: 100,
    baseCoins: 50,
  },

  // Thưởng khi hoàn thành quiz (base + star bonus)
  QUIZ_COMPLETE: {
    baseXP: 150,
    baseCoins: 100,
    starBonus: {
      1: { coins: 10, xp: 0 },
      2: { coins: 30, xp: 50 },
      3: { coins: 60, xp: 100 },
    },
  },

  // Thưởng khi chơi game
  GAME_PLAY: {
    baseXP: 80,
    baseCoins: 40,
    scoreMultiplier: 0.1, // +0.1 coin per score point
    maxBonusCoins: 100, // Max 100 coins từ score
  },

  // Milestone thưởng khi đạt streak
  STREAK_MILESTONES: {
    3: { 
      coins: 100, 
      badge: 'STREAK_3_DAYS',
      notification: '🔥 Streak 3 ngày! Bạn nhận được 100 coins!' 
    },
    7: { 
      coins: 300, 
      badge: 'STREAK_WARRIOR',
      notification: '🔥 Chiến binh bền bỉ! 7 ngày streak - nhận 300 coins!' 
    },
    14: { 
      coins: 700, 
      badge: 'STREAK_MASTER',
      notification: '🔥 Bậc thầy streak! 14 ngày liên tiếp - nhận 700 coins!' 
    },
    30: { 
      coins: 2000, 
      badge: 'STREAK_LEGEND',
      notification: '🔥 Huyền thoại! 30 ngày streak - nhận 2000 coins!' 
    },
  },

  // Hệ số nhân XP khi có streak cao
  STREAK_MULTIPLIER: {
    minStreak: 5, // Tối thiểu 5 ngày streak
    multiplier: 1.2, // Nhân 1.2x XP (bonus 20%)
  },

  // Thưởng khi level up
  LEVEL_UP: {
    coinReward: 500,
    notificationTemplate: '🎉 Chúc mừng! Bạn đã lên level {level}! Nhận 500 coins!',
  },

  // Thưởng khi tương tác AI chatbot
  AI_CHAT: {
    xpPerMessage: 5,
    dailyLimit: 50, // Max 50 XP/day từ chat
  },

  // Thưởng đăng nhập hàng ngày
  DAILY_LOGIN: {
    xp: 20,
    coins: 10,
  },

  // Thưởng khi unlock achievement
  ACHIEVEMENT_UNLOCK: {
    baseXP: 200,
    baseCoins: 150,
  },
} as const;

// Shop items configuration
export const SHOP_ITEMS_CONFIG = {
  STREAK_SHIELD: {
    price: 500,
    currency: 'COIN' as const,
    duration: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    description: 'Bảo vệ streak của bạn trong 24 giờ nếu quên học',
  },
  
  AVATAR: {
    priceRange: { min: 100, max: 1000 },
    currency: 'COIN' as const,
  },
  
  STICKER: {
    priceRange: { min: 50, max: 300 },
    currency: 'COIN' as const,
  },
  
  BADGE: {
    priceRange: { min: 200, max: 2000 },
    currency: 'STAR' as const,
  },
  
  THEME: {
    priceRange: { min: 500, max: 2000 },
    currency: 'COIN' as const,
  },
} as const;

// Streak penalty (soft - educational approach)
export const STREAK_PENALTY = {
  // Đứt streak sẽ reset về 0
  resetStreak: true,
  // Không trừ XP/Coins (approach giáo dục, không phạt nặng)
  deductPoints: false,
} as const;

// Transaction limits
export const TRANSACTION_LIMITS = {
  MAX_COINS_PER_DAY: 5000,
  MAX_XP_PER_DAY: 10000,
  MAX_STARS_PER_DAY: 50,
} as const;
