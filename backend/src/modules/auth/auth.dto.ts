import { z } from 'zod';
import { UserRole, Grade } from '@prisma/client'


export const RegisterSchema = z.object({
    email: z.string()
        .email('Invalid email format')
        .min(1, 'Email is required'),
    password: z.string()
        .min(6, 'Password must be at least 6 characters long')
        .max(12, 'Password must be at most 12 characters long')
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            'Password must contain at least one uppercase, one lowercase, and one number'
        ),
    role: z.nativeEnum(UserRole, {
        errorMap: () => ({ message: 'Invalid role' }),
    }),

    // Optional fields for STUDENT registration
    firstName: z.string().min(1).max(50).optional(),
    lastName: z.string().min(1).max(50).optional(),
    dateOfBirth: z.coerce.date().optional(),
    grade: z.nativeEnum(Grade).optional(),
})
export const LoginSchema = z.object({
    email: z.string()
    .email('Invalid email format')
    .min(1, 'Email is required'),
    passport: z.string()
    .min(6, 'Password must be at least 6 characters long')
    .max(12, 'Password must be at most 12 characters long'),
})
export const refreshTokenSchema = z.object({
  refreshToken: z
    .string()
    .min(1, 'Refresh token is required'),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .email('Invalid email format')
    .min(1, 'Email is required'),
});

export const resetPasswordSchema = z.object({
  token: z
    .string()
    .min(1, 'Reset token is required'),
  
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password is too long')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase, one lowercase, and one number'
    ),
});

export const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, 'Current password is required'),
  
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password is too long')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase, one lowercase, and one number'
    ),
});
export type RegisterDTO = z.infer<typeof RegisterSchema>;
export type LoginDTO = z.infer<typeof LoginSchema>;
export type RefreshTokenDTO = z.infer<typeof refreshTokenSchema>;
export type ForgotPasswordDTO = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordDTO = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordDTO = z.infer<typeof changePasswordSchema>;