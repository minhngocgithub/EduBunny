import { UserRole, Grade, Subject } from "@prisma/client";

// User Profile Types
export interface UserProfile {
    id: string;
    email: string;
    role: UserRole;
    isActive: boolean;
    emailVerified: boolean;
    lastLoginAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    student?: StudentProfile;
    parent?: ParentProfile;
}

export interface StudentProfile {
    id: string;
    userId: string;
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    grade: Grade;
    avatar: string | null;
    avatarSeed: string | null;
    bio: string | null;
    preferences: StudentPreferences | null;
    xp: number;
    level: number;
    stars: number;
    streak: number;
    lastActiveDate: Date | null;
    createdAt: Date;
    updatedAt: Date;
    parent?: ParentProfile | null;
}

export interface ParentProfile {
    id: string;
    userId: string;
    firstName: string;
    lastName: string;
    email: string | null;
    phone: string | null;
    createdAt: Date;
    updatedAt: Date;
    children?: StudentProfile[];
}

// Update Inputs
export interface UpdateUserInput {
    email?: string;
    isActive?: boolean;
}

export interface UpdateStudentInput {
    firstName?: string;
    lastName?: string;
    dateOfBirth?: Date;
    grade?: Grade;
    avatar?: string | null;
    avatarSeed?: string | null;
    bio?: string | null;
    preferences?: StudentPreferences | null;
}

export interface UpdateParentInput {
    firstName?: string;
    lastName?: string;
    email?: string | null;
    phone?: string | null;
}

export interface StudentPreferences {
    [key: string]: unknown;
    favoriteSubjects?: Subject[];
    learningGoals?: string[];
    studyTimePreference?: 'morning' | 'afternoon' | 'evening';
    notificationEnabled?: boolean;
    theme?: 'light' | 'dark' | 'auto';
}

// Statistics Types
export interface StudentStatistics {
    totalXp: number;
    currentLevel: number;
    currentStreak: number;
    coursesEnrolled: number;
    coursesCompleted: number;
    quizzesTaken: number;
    averageQuizScore: number;
    gamesPlayed: number;
    achievementsUnlocked: number;
    totalStudyTime: number; // in minutes
    lastActiveDate: Date | null;
}

export interface LevelProgress {
    currentLevel: number;
    currentXp: number;
    xpForNextLevel: number;
    progressPercentage: number;
}

// Activity Types
export interface RecentActivity {
    id: string;
    type: string;
    description: string;
    metadata: Record<string, unknown> | null;
    createdAt: Date;
}

// Parent Dashboard Types
export interface ChildProgress {
    student: {
        id: string;
        firstName: string;
        lastName: string;
        avatar: string | null;
        grade: Grade;
    };
    statistics: {
        level: number;
        xp: number;
        streak: number;
        coursesCompleted: number;
        averageQuizScore: number;
    };
    recentActivities: RecentActivity[];
}

// Service Response Types
export interface UserServiceResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    statusCode?: number;
}

// Leaderboard Types
export interface LeaderboardEntry {
    rank: number;
    student: {
        id: string;
        firstName: string;
        lastName: string;
        avatar: string | null;
    };
    score: number; // Generic score based on metric type
    xp?: number;
    level?: number;
    stars?: number;
    streak?: number;
    achievements?: number;
    isCurrentUser?: boolean;
}

export type LeaderboardMetric = 'xp' | 'stars' | 'streak' | 'achievements';

export interface LeaderboardFilters {
    grade?: Grade;
    timeframe?: 'weekly' | 'monthly' | 'all-time';
    metric?: LeaderboardMetric;
    limit?: number;
}

// Admin Types
export interface AdminUserListItem {
    id: string;
    email: string;
    role: UserRole;
    isActive: boolean;
    emailVerified: boolean;
    lastLoginAt: Date | null;
    createdAt: Date;
    student?: {
        id: string;
        firstName: string;
        lastName: string;
        avatar: string | null;
        grade: Grade;
        level: number;
        xp: number;
        stars: number;
    } | null;
    parent?: {
        id: string;
        firstName: string;
        lastName: string;
    } | null;
}

export interface AdminUsersListResponse {
    users: AdminUserListItem[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}