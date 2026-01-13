import { PrismaClient, User, Student, Parent } from '@prisma/client'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { RegisterInput } from './auth.types'
import { Grade } from '@prisma/client'
import { generateAccessToken, generateRefreshToken } from '../../shared/utils/jwt.utils'
import { emailService } from '../../shared/services/email.service'

const prisma = new PrismaClient()

interface UserProfile {
  id: string
  email: string
  role: string
  isActive: boolean
  emailVerified: boolean
  createdAt: Date
  updatedAt: Date
  student: Student | null
  parent: Parent | null
}

export class AuthService {
  async register(input: RegisterInput): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    })

    if (existingUser) {
      throw new Error('User already exists')
    }

    const hashedPassword = await bcrypt.hash(input.password, 10)

    const user = await prisma.user.create({
      data: {
        email: input.email,
        password: hashedPassword,
        role: input.role,
        isActive: true,
        emailVerified: false,
      },
    })

    if (input.role === 'STUDENT') {
      if (!input.dateOfBirth) {
        throw new Error('Date of birth is required for students')
      }

      await prisma.student.create({
        data: {
          userId: user.id,
          firstName: input.firstName || '',
          lastName: input.lastName || '',
          dateOfBirth: input.dateOfBirth,
          grade: (input.grade as Grade) || Grade.GRADE_1,
        },
      })
    } else if (input.role === 'PARENT') {
      await prisma.parent.create({
        data: {
          userId: user.id,
          firstName: input.firstName || '',
          lastName: input.lastName || '',
        },
      })
    }

    const accessToken = this.generateToken(user)
    const refreshToken = await generateRefreshToken(user.id)

    try {
      const verificationToken = await this.createVerificationToken(user.id)
      const userName = input.firstName || user.email
      await emailService.sendVerificationEmail(user.email, verificationToken, userName)
    } catch (error) {
      console.error('Failed to send verification email:', error)
    }

    return { user, accessToken, refreshToken }
  }

  async login(email: string, password: string): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    const user = await prisma.user.findUnique({ where: { email } })

    if (!user || !user.password) {
      throw new Error('Invalid credentials')
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      throw new Error('Invalid credentials')
    }

    if (!user.isActive) {
      throw new Error('Account is deactivated')
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    })

    const accessToken = this.generateToken(user)
    const refreshToken = await generateRefreshToken(user.id)

    return { user, accessToken, refreshToken }
  }

  async getProfile(userId: string): Promise<UserProfile | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { student: true, parent: true },
    })

    if (!user) {
      throw new Error('User not found')
    }

    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        student: true,
        parent: true,
      },
    })
  }

  async logout(userId: string, refreshToken?: string): Promise<void> {
    if (refreshToken) {
      await prisma.refreshToken.deleteMany({ where: { userId, token: refreshToken } })
    } else {
      await prisma.refreshToken.deleteMany({ where: { userId } })
    }
  }

  async refreshToken(refreshToken: string): Promise<{ token: string; refreshToken: string }> {
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    })

    if (!storedToken) {
      throw new Error('Invalid refresh token')
    }

    if (storedToken.expiresAt < new Date()) {
      await prisma.refreshToken.delete({ where: { id: storedToken.id } })
      throw new Error('Refresh token expired')
    }

    const newAccessToken = this.generateToken(storedToken.user)
    await prisma.refreshToken.delete({ where: { id: storedToken.id } })
    const newRefreshToken = await generateRefreshToken(storedToken.user.id)

    return {
      token: newAccessToken,
      refreshToken: newRefreshToken,
    }
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { student: true, parent: true },
    })

    if (!user) return

    const resetToken = crypto.randomBytes(32).toString('hex')
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex')
    const tokenExpiry = new Date(Date.now() + 60 * 60 * 1000)

    await prisma.passwordReset.deleteMany({ where: { userId: user.id } })

    await prisma.passwordReset.create({
      data: {
        token: hashedToken,
        userId: user.id,
        expiresAt: tokenExpiry,
      },
    })

    const userName = user.student
      ? `${user.student.firstName} ${user.student.lastName}`
      : user.parent
        ? `${user.parent.firstName} ${user.parent.lastName}`
        : undefined

    await emailService.sendPasswordResetEmail(user.email, resetToken, userName)
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

    const resetRecord = await prisma.passwordReset.findUnique({
      where: { token: hashedToken },
      include: { user: true },
    })

    if (!resetRecord || resetRecord.usedAt || resetRecord.expiresAt < new Date()) {
      throw new Error('Invalid or expired reset token')
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/
    if (!passwordRegex.test(newPassword) || newPassword.length < 8 || newPassword.length > 100) {
      throw new Error('Password must be 8-100 characters with uppercase, lowercase, and number')
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: resetRecord.userId },
        data: { password: hashedPassword },
      })

      await tx.passwordReset.update({
        where: { id: resetRecord.id },
        data: { usedAt: new Date() },
      })

      await tx.refreshToken.deleteMany({
        where: { userId: resetRecord.userId },
      })
    })
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await prisma.user.findUnique({ where: { id: userId } })

    if (!user || !user.password) {
      throw new Error('Invalid user')
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password)
    if (!isPasswordValid) {
      throw new Error('Current password is incorrect')
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/
    if (!passwordRegex.test(newPassword) || newPassword.length < 8 || newPassword.length > 100) {
      throw new Error('Password must be 8-100 characters with uppercase, lowercase, and number')
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password)
    if (isSamePassword) {
      throw new Error('New password must be different from current password')
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    })

    await prisma.refreshToken.deleteMany({ where: { userId } })

    const userWithProfile = await prisma.user.findUnique({
      where: { id: userId },
      include: { student: true, parent: true },
    })

    if (userWithProfile) {
      const userName = userWithProfile.student
        ? `${userWithProfile.student.firstName} ${userWithProfile.student.lastName}`
        : userWithProfile.parent
          ? `${userWithProfile.parent.firstName} ${userWithProfile.parent.lastName}`
          : undefined

      try {
        await emailService.sendPasswordChangedNotification(userWithProfile.email, userName)
      } catch (error) {
        console.error('Failed to send password changed notification:', error)
      }
    }
  }

  async verifyEmail(token: string): Promise<void> {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

    const verificationRecord = await prisma.emailVerification.findUnique({
      where: { token: hashedToken },
      include: { user: true },
    })

    if (!verificationRecord || verificationRecord.verifiedAt || verificationRecord.expiresAt < new Date()) {
      throw new Error('Invalid verification token')
    }

    await prisma.user.update({
      where: { id: verificationRecord.userId },
      data: { emailVerified: true },
    })

    await prisma.emailVerification.update({
      where: { id: verificationRecord.id },
      data: { verifiedAt: new Date() },
    })

    const userWithProfile = await prisma.user.findUnique({
      where: { id: verificationRecord.userId },
      include: { student: true, parent: true },
    })

    if (userWithProfile) {
      const userName = userWithProfile.student
        ? `${userWithProfile.student.firstName} ${userWithProfile.student.lastName}`
        : userWithProfile.parent
          ? `${userWithProfile.parent.firstName} ${userWithProfile.parent.lastName}`
          : 'User'

      try {
        await emailService.sendWelcomeEmail(userWithProfile.email, userName)
      } catch (error) {
        console.error('Failed to send welcome email:', error)
      }
    }
  }

  async createVerificationToken(userId: string): Promise<string> {
    const user = await prisma.user.findUnique({ where: { id: userId } })

    if (!user || user.emailVerified) {
      throw new Error('Invalid user state')
    }

    const verificationToken = crypto.randomBytes(32).toString('hex')
    const hashedToken = crypto.createHash('sha256').update(verificationToken).digest('hex')
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000)

    await prisma.emailVerification.deleteMany({ where: { userId } })

    await prisma.emailVerification.create({
      data: {
        token: hashedToken,
        userId,
        expiresAt: tokenExpiry,
      },
    })

    return verificationToken
  }

  public generateToken(user: User): string {
    return generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })
  }

  async getUserById(userId: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { id: userId },
    })
  }

  async handleOAuthLogin(user: User): Promise<{ accessToken: string; refreshToken: string }> {
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    })

    const accessToken = this.generateToken(user)
    const refreshToken = await generateRefreshToken(user.id)

    return { accessToken, refreshToken }
  }

  async cleanupExpiredTokens(): Promise<void> {
    const now = new Date()

    await prisma.$transaction([
      prisma.refreshToken.deleteMany({ where: { expiresAt: { lt: now } } }),
      prisma.passwordReset.deleteMany({ where: { expiresAt: { lt: now } } }),
      prisma.emailVerification.deleteMany({ where: { expiresAt: { lt: now } } }),
    ])
  }
}

export const authService = new AuthService()
