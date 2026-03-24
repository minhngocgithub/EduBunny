import { z } from 'zod';
import { UserRole } from '@prisma/client';

/**
 * Toggle user active status (Admin only)
 */
export const ToggleUserActiveSchema = z.object({
    isActive: z.boolean(),
});

/**
 * Change user role (Admin only)
 */
export const ChangeUserRoleSchema = z.object({
    role: z.nativeEnum(UserRole, {
        errorMap: () => ({ message: 'Invalid user role' }),
    }),
});

/**
 * Admin delete user (soft delete)
 */
export const AdminDeleteUserSchema = z.object({
    reason: z.string().min(10, 'Reason must be at least 10 characters').max(500).optional(),
});

// Export types
export type ToggleUserActiveDTO = z.infer<typeof ToggleUserActiveSchema>;
export type ChangeUserRoleDTO = z.infer<typeof ChangeUserRoleSchema>;
export type AdminDeleteUserDTO = z.infer<typeof AdminDeleteUserSchema>;
