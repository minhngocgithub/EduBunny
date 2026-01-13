/**
 * Level Progression Configuration
 * Cấu hình hệ thống cấp độ (leveling)
 */

// XP required for each level
export const XP_PER_LEVEL = 1000;

// Calculate XP required for a specific level
export const calculateXPForLevel = (level: number): number => {
  return level * XP_PER_LEVEL;
};

// Calculate level from total XP
export const calculateLevelFromXP = (totalXP: number): number => {
  return Math.floor(totalXP / XP_PER_LEVEL) + 1;
};

// Calculate progress to next level (0-100%)
export const calculateLevelProgress = (totalXP: number): number => {
  const currentLevel = calculateLevelFromXP(totalXP);
  const xpForCurrentLevel = (currentLevel - 1) * XP_PER_LEVEL;
  const xpInCurrentLevel = totalXP - xpForCurrentLevel;
  return (xpInCurrentLevel / XP_PER_LEVEL) * 100;
};

// Items unlocked at each level
export const LEVEL_UNLOCKS = {
  1: {
    items: ['basic_avatar_pack'],
    features: ['chat_bot', 'basic_games'],
  },
  5: {
    items: ['cool_avatar_pack', 'basic_sticker_pack'],
    features: ['advanced_games', 'leaderboard'],
  },
  10: {
    items: ['premium_avatar_pack', 'theme_pack_1'],
    features: ['custom_themes', 'special_badges'],
  },
  15: {
    items: ['legendary_avatar_pack', 'premium_sticker_pack'],
    features: ['exclusive_content'],
  },
  20: {
    items: ['ultimate_pack'],
    features: ['vip_status', 'priority_support'],
  },
} as const;

// Reward multiplier by level tier
export const LEVEL_REWARD_MULTIPLIERS = {
  1: 1.0,   // Level 1-4: 100% rewards
  5: 1.1,   // Level 5-9: 110% rewards
  10: 1.2,  // Level 10-14: 120% rewards
  15: 1.3,  // Level 15-19: 130% rewards
  20: 1.5,  // Level 20+: 150% rewards
} as const;

// Get reward multiplier for a specific level
export const getLevelMultiplier = (level: number): number => {
  if (level >= 20) return LEVEL_REWARD_MULTIPLIERS[20];
  if (level >= 15) return LEVEL_REWARD_MULTIPLIERS[15];
  if (level >= 10) return LEVEL_REWARD_MULTIPLIERS[10];
  if (level >= 5) return LEVEL_REWARD_MULTIPLIERS[5];
  return LEVEL_REWARD_MULTIPLIERS[1];
};

// Level titles/ranks
export const LEVEL_TITLES = {
  1: 'Người Mới',
  5: 'Học Sinh Chăm Chỉ',
  10: 'Học Sinh Giỏi',
  15: 'Học Sinh Xuất Sắc',
  20: 'Thiên Tài',
  25: 'Huyền Thoại',
  30: 'Siêu Sao',
} as const;

// Get title for a specific level
export const getLevelTitle = (level: number): string => {
  const levels = Object.keys(LEVEL_TITLES)
    .map(Number)
    .sort((a, b) => b - a);
  
  for (const lvl of levels) {
    if (level >= lvl) {
      return LEVEL_TITLES[lvl as keyof typeof LEVEL_TITLES];
    }
  }
  
  return LEVEL_TITLES[1];
};
