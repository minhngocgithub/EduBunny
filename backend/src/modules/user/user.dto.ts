import { z } from 'zod';
import { Grade, Subject } from '@prisma/client';

// Update User Schema
export const UpdateUserSchema = z.object({
    email: z.string()
        .email('Invalid email format')
        .optional(),
    isActive: z.boolean().optional(),
});

// Student Preferences Schema
const StudentPreferencesSchema = z.object({
    favoriteSubjects: z.array(z.nativeEnum(Subject)).optional(),
    learningGoals: z.array(z.string()).optional(),
    studyTimePreference: z.enum(['morning', 'afternoon', 'evening']).optional(),
    notificationEnabled: z.boolean().optional(),
    theme: z.enum(['light', 'dark', 'auto']).optional(),
}).passthrough(); // Allow additional properties

// Update Student Profile Schema
export const UpdateStudentSchema = z.object({
    firstName: z.string()
        .min(1, 'First name is required')
        .max(50, 'First name is too long')
        .optional(),

    lastName: z.string()
        .min(1, 'Last name is required')
        .max(50, 'Last name is too long')
        .optional(),

    dateOfBirth: z.coerce.date()
        .refine((date) => {
            const age = new Date().getFullYear() - date.getFullYear();
            return age >= 5 && age <= 18;
        }, 'Student must be between 5 and 18 years old')
        .optional(),

    grade: z.nativeEnum(Grade, {
        errorMap: () => ({ message: 'Invalid grade' }),
    }).optional(),

    avatar: z.string()
        .url('Invalid avatar URL')
        .optional()
        .nullable(),

    avatarSeed: z.string()
        .max(50, 'Avatar seed is too long')
        .optional()
        .nullable(),

    bio: z.string()
        .max(500, 'Bio is too long')
        .optional()
        .nullable(),

    preferences: StudentPreferencesSchema.optional(),
});

// Add XP Schema
export const AddXpSchema = z.object({
    xpAmount: z.number()
        .int('XP amount must be an integer')
        .positive('XP amount must be positive')
        .max(1000, 'XP amount cannot exceed 1000 per action'),
});

// Update Parent Profile Schema
export const UpdateParentSchema = z.object({
    firstName: z.string()
        .min(1, 'First name is required')
        .max(50, 'First name is too long')
        .optional(),

    lastName: z.string()
        .min(1, 'Last name is required')
        .max(50, 'Last name is too long')
        .optional(),

    email: z.string()
        .email('Invalid email format')
        .optional()
        .nullable(),

    phone: z.string()
        .regex(/^[0-9]{10,11}$/, 'Invalid phone number format')
        .optional()
        .nullable(),
});

// Link Child Schema (for parent)
export const LinkChildSchema = z.object({
    childId: z.string()
        .uuid('Invalid child ID'),
});

// Leaderboard Query Schema
export const LeaderboardQuerySchema = z.object({
    grade: z.nativeEnum(Grade).optional(),
    timeframe: z.enum(['weekly', 'monthly', 'all-time']).optional().default('all-time'),
    metric: z.enum(['xp', 'stars', 'streak', 'achievements']).optional().default('xp'),
    limit: z.coerce.number()
        .int()
        .min(1)
        .max(100)
        .optional()
        .default(10),
});

// Delete Account Schema
export const DeleteAccountSchema = z.object({
    password: z.string()
        .min(1, 'Password is required'),
    confirmation: z.literal('DELETE', {
        errorMap: () => ({ message: 'Please type DELETE to confirm' }),
    }),
});

// Export types
export type UpdateUserDTO = z.infer<typeof UpdateUserSchema>;
export type UpdateStudentDTO = z.infer<typeof UpdateStudentSchema>;
export type UpdateParentDTO = z.infer<typeof UpdateParentSchema>;
export type LinkChildDTO = z.infer<typeof LinkChildSchema>;
export type LeaderboardQueryDTO = z.infer<typeof LeaderboardQuerySchema>;
export type DeleteAccountDTO = z.infer<typeof DeleteAccountSchema>;
export type AddXpDTO = z.infer<typeof AddXpSchema>;