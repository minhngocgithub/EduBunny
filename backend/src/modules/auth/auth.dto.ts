import { z } from 'zod'
import { UserRole, Grade } from '@prisma/client'

const passwordValidation = z.string()
  .min(8, 'Password must be at least 8 characters long')
  .max(100, 'Password must be at most 100 characters long')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password must contain at least one uppercase, one lowercase, and one number'
  )

export const RegisterSchema = z.object({
  email: z.string()
    .email('Invalid email format')
    .min(1, 'Email is required'),

  password: passwordValidation,

  role: z.nativeEnum(UserRole, {
    errorMap: () => ({ message: 'Invalid role' }),
  }),

  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  dateOfBirth: z.coerce.date().optional(),
  grade: z.nativeEnum(Grade).optional(),
})

export const LoginSchema = z.object({
  email: z.string()
    .email('Invalid email format')
    .min(1, 'Email is required'),

  password: z.string()
    .min(1, 'Password is required'),
})

export const refreshTokenSchema = z.object({
  refreshToken: z.string()
    .min(1, 'Refresh token is required'),
})

export const forgotPasswordSchema = z.object({
  email: z.string()
    .email('Invalid email format')
    .min(1, 'Email is required'),
})

export const resetPasswordSchema = z.object({
  token: z.string()
    .min(1, 'Reset token is required'),

  newPassword: passwordValidation,
})

export const changePasswordSchema = z.object({
  currentPassword: z.string()
    .min(1, 'Current password is required'),

  newPassword: passwordValidation,
})

export const verifyEmailSchema = z.object({
  token: z.string()
    .min(1, 'Verification token is required'),
})

export type RegisterDTO = z.infer<typeof RegisterSchema>
export type LoginDTO = z.infer<typeof LoginSchema>
export type RefreshTokenDTO = z.infer<typeof refreshTokenSchema>
export type ForgotPasswordDTO = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordDTO = z.infer<typeof resetPasswordSchema>
export type ChangePasswordDTO = z.infer<typeof changePasswordSchema>
export type VerifyEmailDTO = z.infer<typeof verifyEmailSchema>
