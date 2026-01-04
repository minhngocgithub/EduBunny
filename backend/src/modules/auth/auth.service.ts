import { PrismaClient, User, Student, Parent } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { RegisterInput } from './auth.types';
import { Grade } from '@prisma/client';
import { generateAccessToken, generateRefreshToken } from '../../shared/utils/jwt.utils';
import { emailService } from '../../shared/services/email.service';
const prisma = new PrismaClient();

interface UserProfile {
  id: string;
  email: string;
  role: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  student: Student | null;
  parent: Parent | null;
}

export class AuthService {
  async register(input: RegisterInput): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(input.password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: input.email,
        password: hashedPassword,
        role: input.role,
        isActive: true,
        emailVerified: false,
      },
    });

    // Create profile based on role
    if (input.role === 'STUDENT') {
      if (!input.dateOfBirth) {
        throw new Error('Date of birth is required for students');
      }
      await prisma.student.create({
        data: {
          userId: user.id,
          firstName: input.firstName || '',
          lastName: input.lastName || '',
          dateOfBirth: input.dateOfBirth,
          grade: (input.grade as Grade) || Grade.GRADE_1,
        },
      });
    } else if (input.role === 'PARENT') {
      await prisma.parent.create({
        data: {
          userId: user.id,
          firstName: input.firstName || '',
          lastName: input.lastName || '',
        },
      });
    }

    // Generate tokens
    const accessToken = this.generateToken(user);
    const refreshToken = await generateRefreshToken(user.id);

    // Send verification email
    try {
      await this.sendVerificationEmail(user.id);
    } catch (emailError) {
      // Log email error but don't fail registration
      console.error('Failed to send verification email:', emailError);
    }

    return { user, accessToken, refreshToken };
  }

  async login(email: string, password: string): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check if user used Google OAuth (no password)
    if (!user.password) {
      throw new Error('Please sign in with Google');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    if (!user.isActive) {
      throw new Error('Account is deactivated');
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate tokens
    const accessToken = this.generateToken(user);
    const refreshToken = await generateRefreshToken(user.id);

    return { user, accessToken, refreshToken };
  }

  async getProfile(userId: string): Promise<UserProfile | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        student: true,
        parent: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const userWithoutPassword = await prisma.user.findUnique({
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
    });

    return userWithoutPassword;
  }
  async logout(userId: string, refreshToken?: string): Promise<void> {
    if (refreshToken) {
      await prisma.refreshToken.deleteMany({
        where: {
          userId,
          token: refreshToken,
        }
      })
    } else {
      await prisma.refreshToken.deleteMany({
        where: {
          userId,
        }
      })
    }

  }
  async refreshToken(refreshToken: string): Promise<{ token: string; refreshToken: string }> {
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!storedToken) {
      throw new Error('Invalid refresh token');
    }

    if (storedToken.expiresAt < new Date()) {
      await prisma.refreshToken.delete({
        where: { id: storedToken.id },
      });
      throw new Error('Refresh token expired');
    }

    // Generate new tokens
    const newAccessToken = this.generateToken(storedToken.user);
    const newRefreshToken = await generateRefreshToken(storedToken.user.id);

    // Delete old refresh token
    await prisma.refreshToken.delete({
      where: { id: storedToken.id },
    });

    return {
      token: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }
  async forgotPassword(email: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        student: true,
        parent: true,
      },
    });
    
    // Don't reveal if user exists or not (security best practice)
    if (!user) {
      return;
    }
    
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const tokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    // Delete any existing password reset tokens for this user
    await prisma.passwordReset.deleteMany({
      where: { userId: user.id },
    });

    // Create new password reset token
    await prisma.passwordReset.create({
      data: {
        token: hashedToken,
        userId: user.id,
        expiresAt: tokenExpiry,
      },
    });

    // Get user name
    const userName = user.student ? `${user.student.firstName} ${user.student.lastName}` :
                     user.parent ? `${user.parent.firstName} ${user.parent.lastName}` : undefined;

    // Send password reset email
    await emailService.sendPasswordResetEmail(user.email, resetToken, userName);
  }
  async resetPassword(token: string, newPassword: string): Promise<void> {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find token in PasswordReset table
    const resetRecord = await prisma.passwordReset.findUnique({
      where: { token: hashedToken },
      include: { user: true },
    });

    if (!resetRecord) {
      throw new Error('Invalid or expired reset token');
    }

    if (resetRecord.usedAt) {
      throw new Error('Reset token has already been used');
    }

    if (resetRecord.expiresAt < new Date()) {
      await prisma.passwordReset.delete({
        where: { id: resetRecord.id },
      });
      throw new Error('Reset token has expired');
    }

    // Validate password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!passwordRegex.test(newPassword) || newPassword.length < 8) {
      throw new Error('Password must be at least 8 characters with uppercase, lowercase, and number');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    await prisma.user.update({
      where: { id: resetRecord.userId },
      data: { password: hashedPassword },
    });

    // Mark reset token as used
    await prisma.passwordReset.update({
      where: { id: resetRecord.id },
      data: { usedAt: new Date() },
    });

    // Invalidate all refresh tokens (force re-login on all devices)
    await prisma.refreshToken.deleteMany({
      where: { userId: resetRecord.userId },
    });
  }
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (!user.password) {
      throw new Error('Cannot change password for OAuth users');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    // Validate new password
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!passwordRegex.test(newPassword) || newPassword.length < 8) {
      throw new Error('New password must be at least 8 characters with uppercase, lowercase, and number');
    }

    // Check if new password is same as current
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      throw new Error('New password must be different from current password');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    // Invalidate all refresh tokens (force re-login on all devices)
    await prisma.refreshToken.deleteMany({
      where: { userId },
    });

    // Get user name for email
    const userWithProfile = await prisma.user.findUnique({
      where: { id: userId },
      include: { student: true, parent: true },
    });
    
    if (userWithProfile) {
      const userName = userWithProfile.student ? 
        `${userWithProfile.student.firstName} ${userWithProfile.student.lastName}` :
        userWithProfile.parent ? 
        `${userWithProfile.parent.firstName} ${userWithProfile.parent.lastName}` : undefined;
      
      // Send password changed notification
      try {
        await emailService.sendPasswordChangedNotification(userWithProfile.email, userName);
      } catch (emailError) {
        console.error('Failed to send password changed notification:', emailError);
      }
    }
  }
  async verifyEmail(token: string): Promise<void> {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find token in EmailVerification table
    const verificationRecord = await prisma.emailVerification.findUnique({
      where: { token: hashedToken },
      include: { user: true },
    });

    if (!verificationRecord) {
      throw new Error('Invalid verification token');
    }

    if (verificationRecord.verifiedAt) {
      throw new Error('Email has already been verified');
    }

    if (verificationRecord.expiresAt < new Date()) {
      await prisma.emailVerification.delete({
        where: { id: verificationRecord.id },
      });
      throw new Error('Verification token has expired');
    }

    // Update user email verification status
    await prisma.user.update({
      where: { id: verificationRecord.userId },
      data: { emailVerified: true },
    });

    // Mark verification token as used
    await prisma.emailVerification.update({
      where: { id: verificationRecord.id },
      data: { verifiedAt: new Date() },
    });

    // Send welcome email after successful verification
    const userWithProfile = await prisma.user.findUnique({
      where: { id: verificationRecord.userId },
      include: { student: true, parent: true },
    });
    
    if (userWithProfile) {
      const userName = userWithProfile.student ? 
        `${userWithProfile.student.firstName} ${userWithProfile.student.lastName}` :
        userWithProfile.parent ? 
        `${userWithProfile.parent.firstName} ${userWithProfile.parent.lastName}` : 'User';
      
      try {
        await emailService.sendWelcomeEmail(userWithProfile.email, userName);
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
      }
    }
  }

  async sendVerificationEmail(userId: string): Promise<string> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (user.emailVerified) {
      throw new Error('Email is already verified');
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Delete any existing verification tokens for this user
    await prisma.emailVerification.deleteMany({
      where: { userId },
    });

    // Create new verification token
    await prisma.emailVerification.create({
      data: {
        token: hashedToken,
        userId,
        expiresAt: tokenExpiry,
      },
    });

    // Return the unhashed token to send via email
    return verificationToken;
  }

  private generateToken(user: User): string {
    return generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
  }
}

export const authService = new AuthService();
