import { PrismaClient, User, Student, Parent } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { RegisterInput } from './auth.types';
import { Grade } from '@prisma/client';
import { generateAccessToken } from '../../shared/utils/jwt.utils';
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
  async register(input: RegisterInput): Promise<{ user: User; token: string }> {
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

    // Generate JWT
    const token = this.generateToken(user);

    return { user, token };
  }

  async login(email: string, password: string): Promise<{ user: User; token: string }> {
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

    // Generate JWT
    const token = this.generateToken(user);

    return { user, token };
  }

  private generateToken(user: User): string {
    return generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
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
}

export const authService = new AuthService();
