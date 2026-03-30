import { AchievementType } from '@prisma/client';
import { z } from 'zod';

export const achievementConditionSchema = z.object({
  required: z.number().int().positive(),
});

export const createAchievementSchema = z.object({
  type: z.nativeEnum(AchievementType),
  title: z.string().min(1).max(120),
  description: z.string().min(1).max(2000),
  icon: z.string().min(1).max(255),
  xpReward: z.number().int().nonnegative().default(0),
  condition: achievementConditionSchema,
});

export const updateAchievementSchema = createAchievementSchema.partial();

export const checkAchievementSchema = z.object({
  studentId: z.string().uuid(),
});

export const studentIdParamSchema = z.object({
  studentId: z.string().uuid(),
});

export const achievementIdParamSchema = z.object({
  id: z.string().uuid(),
});

export type CreateAchievementDTO = z.infer<typeof createAchievementSchema>;
export type UpdateAchievementDTO = z.infer<typeof updateAchievementSchema>;
