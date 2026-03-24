export interface User {
    id: string;
    email: string;
    name: string;
    role: 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT';
    avatar?: string;
    emailVerified: boolean;
    createdAt: string;
    updatedAt: string;
    // Optional relationships
    student?: StudentProfile;
    parent?: ParentProfile;
}

export interface StudentProfile {
    id: string;
    userId: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    grade: string;
    avatar?: string;
    avatarSeed?: string;
    bio?: string;
    xp: number;
    level: number;
    stars: number;
    streak: number;
    coins: number;
    lastActiveDate?: string;
    parentId?: string;
    createdAt: string;
    updatedAt: string;
}

export interface ParentProfile {
    id: string;
    userId: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    createdAt: string;
    updatedAt: string;
}

export interface UpdateProfileRequest {
    email?: string;
    isActive?: boolean;
}

export interface UpdateStudentProfileRequest {
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string | Date;
    grade?: string; // Grade enum: GRADE_1, GRADE_2, etc.
    avatar?: string | null;
    avatarSeed?: string | null;
    bio?: string | null;
    preferences?: StudentPreferences | null;
}

export interface StudentPreferences {
    favoriteSubjects?: string[]; // Subject enum array
    learningGoals?: string[];
    studyTimePreference?: 'morning' | 'afternoon' | 'evening';
    notificationEnabled?: boolean;
    theme?: 'light' | 'dark' | 'auto';
    [key: string]: unknown;
}

export interface UserStats {
    totalCourses: number;
    completedCourses: number;
    totalXP: number;
    level: number;
    stars: number;
    achievements: number;
}
// Admin Types
export interface AdminUserListItem {
    id: string;
    email: string;
    role: 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT';
    isActive: boolean;
    emailVerified: boolean;
    lastLoginAt: string | null;
    createdAt: string;
    student?: {
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

export interface AdminUsersQueryParams {
    search?: string;
    role?: 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT';
    isActive?: boolean;
    page?: number;
    limit?: number;
}