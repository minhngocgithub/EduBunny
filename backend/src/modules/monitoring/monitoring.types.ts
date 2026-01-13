import { ActivityType, ActivityLog } from '@prisma/client';

// Activity log with user info
export interface ActivityLogDetail extends ActivityLog {
    user?: {
        id: string;
        email: string;
        role: string;
        student?: {
            firstName: string;
            lastName: string;
        };
    };
}

// Real-time activity event
export interface RealtimeActivityEvent {
    type: ActivityType;
    userId: string;
    childId?: string;
    metadata: Record<string, unknown> | null;
    timestamp: Date;
}

// Daily progress summary
export interface DailyProgressSummary {
    date: string;
    coursesAccessed: number;
    lecturesCompleted: number;
    timeSpentLearning: number; // in minutes
    quizScores: {
        quizId: string;
        quizTitle: string;
        score: number;
    }[];
    achievementsUnlocked: {
        id: string;
        title: string;
        unlockedAt: Date;
    }[];
    activityBreakdown: {
        type: ActivityType;
        count: number;
    }[];
}

// Weekly comprehensive report
export interface WeeklyProgressReport {
    weekStart: Date;
    weekEnd: Date;
    statistics: {
        totalTimeSpent: number; // in minutes
        coursesCompleted: number;
        lecturesCompleted: number;
        quizzesTaken: number;
        averageQuizScore: number;
        achievementsUnlocked: number;
        currentStreak: number;
    };
    progressTrends: {
        date: string;
        timeSpent: number;
        lecturesCompleted: number;
    }[];
    strengths: {
        subject: string;
        averageScore: number;
        coursesCompleted: number;
    }[];
    weaknesses: {
        subject: string;
        averageScore: number;
        recommendation: string;
    }[];
    recommendations: string[];
    comparison: {
        previousWeek: {
            timeSpent: number;
            lecturesCompleted: number;
            coursesCompleted: number;
        };
        change: {
            timeSpent: number; // percentage change
            lecturesCompleted: number;
            coursesCompleted: number;
        };
    };
}

// Children progress summary for parent
export interface ChildrenProgressSummary {
    children: {
        id: string;
        firstName: string;
        lastName: string;
        avatar: string | null;
        grade: string;
        statistics: {
            level: number;
            xp: number;
            streak: number;
            coursesCompleted: number;
            averageQuizScore: number;
        };
        recentActivity: ActivityLogDetail[];
    }[];
}

