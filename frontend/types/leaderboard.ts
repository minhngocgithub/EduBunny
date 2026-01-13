// Leaderboard Types
export type LeaderboardMetric = 'xp' | 'stars' | 'streak' | 'achievements';
export type LeaderboardTimeframe = 'weekly' | 'monthly' | 'all-time';

export interface LeaderboardEntry {
    rank: number;
    student: {
        id: string;
        firstName: string;
        lastName: string;
        avatar: string | null;
        avatarSeed?: string | null;
    };
    score: number;
    xp?: number;
    level?: number;
    stars?: number;
    streak?: number;
    achievements?: number;
    isCurrentUser?: boolean;
}

export interface LeaderboardFilters {
    grade?: string;
    timeframe?: LeaderboardTimeframe;
    metric?: LeaderboardMetric;
    limit?: number;
}
