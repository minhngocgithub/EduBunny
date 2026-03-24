import { PrismaClient, Prisma, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import {
  UserProfile,
  StudentProfile,
  ParentProfile,
  UpdateUserInput,
  UpdateStudentInput,
  UpdateParentInput,
  StudentStatistics,
  LevelProgress,
  RecentActivity,
  ChildProgress,
  LeaderboardEntry,
  LeaderboardFilters,
} from './user.types';

// JsonValue type to match Prisma
type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
type JsonObject = { [key: string]: JsonValue };
type JsonArray = JsonValue[];

const prisma = new PrismaClient();

export class UserService {
  // ==================== User Profile ====================

  async getUserProfile(userId: string): Promise<UserProfile> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        student: {
          include: {
            parent: true,
          },
        },
        parent: {
          include: {
            children: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user as unknown as UserProfile;
  }

  async updateUser(userId: string, input: UpdateUserInput): Promise<UserProfile> {
    // Check if email is being updated and already exists
    if (input.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: input.email },
      });

      if (existingUser && existingUser.id !== userId) {
        throw new Error('Email already in use');
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: input,
      include: {
        student: true,
        parent: true,
      },
    });

    return updatedUser as unknown as UserProfile;
  }

  // ==================== Student Profile ====================

  async getStudentProfile(userId: string): Promise<StudentProfile> {
    const student = await prisma.student.findUnique({
      where: { userId },
      include: {
        parent: true,
      },
    });

    if (!student) {
      throw new Error('Student profile not found');
    }

    return student as unknown as StudentProfile;
  }

  async updateStudentProfile(
    userId: string,
    input: UpdateStudentInput
  ): Promise<StudentProfile> {
    const student = await prisma.student.findUnique({
      where: { userId },
    });

    if (!student) {
      throw new Error('Student profile not found');
    }

    const updatedStudent = await prisma.student.update({
      where: { userId },
      data: {
        ...input,
        preferences: input.preferences !== undefined
          ? (input.preferences === null ? Prisma.JsonNull : (input.preferences as Prisma.InputJsonValue))
          : undefined,
      },
      include: {
        parent: true,
      },
    });

    return updatedStudent as unknown as StudentProfile;
  }

  async getStudentStatistics(userId: string): Promise<StudentStatistics> {
    const student = await prisma.student.findUnique({
      where: { userId },
      include: {
        enrollments: {
          include: {
            course: true,
          },
        },
        quizAttempts: true,
        gameScores: true,
        achievements: true,
        progress: true,
      },
    });

    if (!student) {
      throw new Error('Student profile not found');
    }

    // Calculate statistics
    const coursesEnrolled = student.enrollments.length;
    const coursesCompleted = student.enrollments.filter(e => e.completedAt).length;
    const quizzesTaken = student.quizAttempts.length;
    const averageQuizScore = quizzesTaken > 0
      ? student.quizAttempts.reduce((sum, attempt) => sum + attempt.score, 0) / quizzesTaken
      : 0;
    const gamesPlayed = student.gameScores.length;
    const achievementsUnlocked = student.achievements.length;

    // Calculate total study time from progress
    const totalStudyTime = student.progress.reduce(
      (sum, p) => sum + Math.floor(p.watchedSeconds / 60),
      0
    );

    return {
      totalXp: student.xp,
      currentLevel: student.level,
      currentStreak: student.streak,
      coursesEnrolled,
      coursesCompleted,
      quizzesTaken,
      averageQuizScore: Math.round(averageQuizScore * 100) / 100,
      gamesPlayed,
      achievementsUnlocked,
      totalStudyTime,
      lastActiveDate: student.lastActiveDate,
    };
  }

  async getLevelProgress(userId: string): Promise<LevelProgress> {
    const student = await prisma.student.findUnique({
      where: { userId },
    });

    if (!student) {
      throw new Error('Student profile not found');
    }

    // Calculate XP needed for next level (example formula: level * 100)
    const xpForNextLevel = student.level * 100;
    const progressPercentage = Math.min(
      (student.xp / xpForNextLevel) * 100,
      100
    );

    return {
      currentLevel: student.level,
      currentXp: student.xp,
      xpForNextLevel,
      progressPercentage: Math.round(progressPercentage * 100) / 100,
    };
  }

  async updateStreak(userId: string): Promise<void> {
    const student = await prisma.student.findUnique({
      where: { userId },
    });

    if (!student) {
      throw new Error('Student profile not found');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastActiveDate = student.lastActiveDate
      ? new Date(student.lastActiveDate)
      : null;

    if (lastActiveDate) {
      lastActiveDate.setHours(0, 0, 0, 0);
      const daysDiff = Math.floor(
        (today.getTime() - lastActiveDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysDiff === 0) {
        // Already active today, no update needed
        return;
      } else if (daysDiff === 1) {
        // Consecutive day, increment streak
        await prisma.student.update({
          where: { userId },
          data: {
            streak: student.streak + 1,
            lastActiveDate: today,
          },
        });
      } else {
        // Streak broken, reset to 1
        await prisma.student.update({
          where: { userId },
          data: {
            streak: 1,
            lastActiveDate: today,
          },
        });
      }
    } else {
      // First time active, start streak
      await prisma.student.update({
        where: { userId },
        data: {
          streak: 1,
          lastActiveDate: today,
        },
      });
    }
  }

  async addXp(userId: string, xpAmount: number): Promise<StudentProfile> {
    const student = await prisma.student.findUnique({
      where: { userId },
    });

    if (!student) {
      throw new Error('Student profile not found');
    }

    const newXp = student.xp + xpAmount;
    const xpForNextLevel = student.level * 100;
    let newLevel = student.level;

    // Check if leveled up
    if (newXp >= xpForNextLevel) {
      newLevel = student.level + 1;
    }

    const updatedStudent = await prisma.student.update({
      where: { userId },
      data: {
        xp: newXp,
        level: newLevel,
      },
    });

    return updatedStudent as unknown as StudentProfile;
  }

  // ==================== Parent Profile ====================

  async getParentProfile(userId: string): Promise<ParentProfile> {
    const parent = await prisma.parent.findUnique({
      where: { userId },
      include: {
        children: true,
      },
    });

    if (!parent) {
      throw new Error('Parent profile not found');
    }

    return parent as unknown as ParentProfile;
  }

  async updateParentProfile(
    userId: string,
    input: UpdateParentInput
  ): Promise<ParentProfile> {
    const parent = await prisma.parent.findUnique({
      where: { userId },
    });

    if (!parent) {
      throw new Error('Parent profile not found');
    }

    // Check if email is being updated and already exists
    if (input.email) {
      const existingParent = await prisma.parent.findUnique({
        where: { email: input.email },
      });

      if (existingParent && existingParent.id !== parent.id) {
        throw new Error('Email already in use');
      }
    }

    // Check if phone is being updated and already exists
    if (input.phone) {
      const existingParent = await prisma.parent.findUnique({
        where: { phone: input.phone },
      });

      if (existingParent && existingParent.id !== parent.id) {
        throw new Error('Phone number already in use');
      }
    }

    const updatedParent = await prisma.parent.update({
      where: { userId },
      data: input,
      include: {
        children: true,
      },
    });

    return updatedParent as unknown as ParentProfile;
  }

  async linkChild(parentUserId: string, childId: string): Promise<void> {
    const parent = await prisma.parent.findUnique({
      where: { userId: parentUserId },
    });

    if (!parent) {
      throw new Error('Parent profile not found');
    }

    const child = await prisma.student.findUnique({
      where: { id: childId },
    });

    if (!child) {
      throw new Error('Student not found');
    }

    if (child.parentId && child.parentId !== parent.id) {
      throw new Error('Student already has a parent');
    }

    await prisma.student.update({
      where: { id: childId },
      data: {
        parentId: parent.id,
      },
    });
  }

  async unlinkChild(parentUserId: string, childId: string): Promise<void> {
    const parent = await prisma.parent.findUnique({
      where: { userId: parentUserId },
    });

    if (!parent) {
      throw new Error('Parent profile not found');
    }

    const child = await prisma.student.findUnique({
      where: { id: childId },
    });

    if (!child) {
      throw new Error('Student not found');
    }

    if (child.parentId !== parent.id) {
      throw new Error('Student is not linked to this parent');
    }

    await prisma.student.update({
      where: { id: childId },
      data: {
        parentId: null,
      },
    });
  }

  async getChildrenProgress(parentUserId: string): Promise<ChildProgress[]> {
    const parent = await prisma.parent.findUnique({
      where: { userId: parentUserId },
      include: {
        children: {
          include: {
            enrollments: true,
            quizAttempts: true,
            user: {
              include: {
                activityLogs: {
                  orderBy: { createdAt: 'desc' },
                  take: 10,
                },
              },
            },
          },
        },
      },
    });

    if (!parent) {
      throw new Error('Parent profile not found');
    }

    const childrenProgress: ChildProgress[] = await Promise.all(
      parent.children.map(async (child) => {
        const coursesCompleted = child.enrollments.filter(e => e.completedAt).length;
        const averageQuizScore = child.quizAttempts.length > 0
          ? child.quizAttempts.reduce((sum, attempt) => sum + attempt.score, 0) / child.quizAttempts.length
          : 0;

        const recentActivities: RecentActivity[] = child.user.activityLogs.map((log) => ({
          id: log.id,
          type: log.type,
          description: this.formatActivityDescription(log.type),
          metadata: log.metadata as Record<string, unknown> | null,
          createdAt: log.createdAt,
        }));

        return {
          student: {
            id: child.id,
            firstName: child.firstName,
            lastName: child.lastName,
            avatar: child.avatar,
            grade: child.grade,
          },
          statistics: {
            level: child.level,
            xp: child.xp,
            streak: child.streak,
            coursesCompleted,
            averageQuizScore: Math.round(averageQuizScore * 100) / 100,
          },
          recentActivities,
        };
      })
    );

    return childrenProgress;
  }

  // ==================== Leaderboard ====================

  async getLeaderboard(filters: LeaderboardFilters): Promise<LeaderboardEntry[]> {
    const { grade, timeframe = 'all-time', metric = 'xp', limit = 10 } = filters;

    let dateFilter: { gte: Date } | undefined = undefined;
    if (timeframe === 'weekly') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      dateFilter = { gte: weekAgo };
    } else if (timeframe === 'monthly') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      dateFilter = { gte: monthAgo };
    }

    // Base query for students
    const whereClause: Prisma.StudentWhereInput = {
      ...(grade && { grade }),
      ...(dateFilter && { lastActiveDate: dateFilter }),
    };

    let students: Array<{
      id: string;
      firstName: string;
      lastName: string;
      avatar: string | null;
      xp: number;
      level: number;
      stars: number;
      streak: number;
      achievementCount?: number;
      achievements?: Array<{ id: string }>;
    }> = [];

    switch (metric) {
      case 'xp':
        // Siêu Cấp XP - Top XP earners
        students = await prisma.student.findMany({
          where: whereClause,
          orderBy: [{ xp: 'desc' }, { level: 'desc' }],
          take: limit,
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            xp: true,
            level: true,
            stars: true,
            streak: true,
          },
        });
        break;

      case 'stars':
        // Bậc Thầy Ngôi Sao - Top star collectors from quizzes
        students = await prisma.student.findMany({
          where: whereClause,
          orderBy: [{ stars: 'desc' }, { xp: 'desc' }],
          take: limit,
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            xp: true,
            level: true,
            stars: true,
            streak: true,
          },
        });
        break;

      case 'streak':
        // Chiến Binh Bền Bỉ - Longest streaks
        students = await prisma.student.findMany({
          where: whereClause,
          orderBy: [{ streak: 'desc' }, { xp: 'desc' }],
          take: limit,
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            xp: true,
            level: true,
            stars: true,
            streak: true,
          },
        });
        break;

      case 'achievements': {
        // Thợ Săn Danh Hiệu - Most achievements
        const studentsWithAchievements = await prisma.student.findMany({
          where: whereClause,
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            xp: true,
            level: true,
            stars: true,
            streak: true,
            achievements: {
              select: { id: true },
            },
          },
        });

        students = studentsWithAchievements
          .map((student) => ({
            ...student,
            achievementCount: student.achievements.length,
          }))
          .sort((a, b) => {
            if (b.achievementCount !== a.achievementCount) {
              return b.achievementCount - a.achievementCount;
            }
            return b.xp - a.xp;
          })
          .slice(0, limit);
        break;
      }
    }

    return students.map((student, index) => {
      const entry: LeaderboardEntry = {
        rank: index + 1,
        student: {
          id: student.id,
          firstName: student.firstName,
          lastName: student.lastName,
          avatar: student.avatar,
        },
        score: 0,
        xp: student.xp,
        level: student.level,
        stars: student.stars,
        streak: student.streak,
      };

      // Set primary score based on metric
      switch (metric) {
        case 'xp':
          entry.score = student.xp;
          break;
        case 'stars':
          entry.score = student.stars;
          break;
        case 'streak':
          entry.score = student.streak;
          break;
        case 'achievements':
          entry.score = student.achievementCount || 0;
          entry.achievements = student.achievementCount || 0;
          break;
      }

      return entry;
    });
  }

  // ==================== Account Management ====================

  async deleteAccount(userId: string, password: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Verify password for non-OAuth users
    if (user.password) {
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new Error('Invalid password');
      }
    }

    // Soft delete
    await prisma.user.update({
      where: { id: userId },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });
  }

  // ==================== Admin Methods ====================

  async getAllUsers(filters: {
    search?: string;
    role?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{
    users: Array<{
      id: string;
      email: string;
      role: string;
      isActive: boolean;
      emailVerified: boolean;
      lastLoginAt: Date | null;
      createdAt: Date;
      student: {
        id: string;
        firstName: string;
        lastName: string;
        avatar: string | null;
        avatarSeed: string | null;
        grade: string;
        level: number;
        xp: number;
        stars: number;
      } | null;
      parent: {
        id: string;
        firstName: string;
        lastName: string;
      } | null;
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const { search, role, isActive, page = 1, limit = 20 } = filters;

    // Build where clause
    const where: Prisma.UserWhereInput = {
      deletedAt: null, // Exclude soft-deleted users
    };

    if (search) {
      where.OR = [
        { email: { contains: search } },
        {
          student: {
            OR: [
              { firstName: { contains: search } },
              { lastName: { contains: search } },
            ],
          },
        },
        {
          parent: {
            OR: [
              { firstName: { contains: search } },
              { lastName: { contains: search } },
            ],
          },
        },
      ];
    }

    if (role) {
      where.role = role as Prisma.EnumUserRoleFilter | undefined;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    // Get total count
    const total = await prisma.user.count({ where });

    // Get users with pagination
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        emailVerified: true,
        lastLoginAt: true,
        createdAt: true,
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            avatarSeed: true,
            grade: true,
            level: true,
            xp: true,
            stars: true,
          },
        },
        parent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        student: {
          include: {
            parent: true,
          },
        },
        parent: {
          include: {
            children: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  async toggleUserActive(userId: string, isActive: boolean) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isActive },
      include: {
        student: true,
        parent: true,
      },
    });

    return updatedUser;
  }

  async changeUserRole(userId: string, role: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Cannot change role of admin users (for safety)
    if (user.role === 'ADMIN') {
      throw new Error('Cannot change role of admin users');
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: role as UserRole },
      include: {
        student: true,
        parent: true,
      },
    });

    return updatedUser;
  }

  async adminDeleteUser(userId: string, _reason?: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Cannot delete admin users (for safety)
    if (user.role === 'ADMIN') {
      throw new Error('Cannot delete admin users');
    }

    // Soft delete: mark as deleted
    await prisma.user.update({
      where: { id: userId },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });

  }

  // ==================== Helper Methods ====================

  private formatActivityDescription(activityType: string): string {
    const descriptions: Record<string, string> = {
      LOGIN: 'Logged in',
      LOGOUT: 'Logged out',
      COURSE_ENROLLED: 'Enrolled in a course',
      LECTURE_VIEWED: 'Viewed a lecture',
      QUIZ_ATTEMPTED: 'Attempted a quiz',
      GAME_PLAYED: 'Played a game',
      ACHIEVEMENT_UNLOCKED: 'Unlocked an achievement',
    };

    return descriptions[activityType] || 'Activity recorded';
  }
}

export const userService = new UserService();