import { Progress, Lecture, Course, Enrollment } from '@prisma/client';

// Progress with relations
export interface ProgressWithRelations extends Progress {
    lecture: Lecture;
    student: {
        id: string;
        firstName: string;
        lastName: string;
    };
}

// Progress summary for a course
export interface CourseProgressSummary {
    courseId: string;
    courseTitle: string;
    totalLectures: number;
    completedLectures: number;
    inProgressLectures: number;
    notStartedLectures: number;
    overallProgress: number; // percentage 0-100
    totalWatchedTime: number; // in seconds
    lastAccessedAt: Date | null;
    enrollment: Enrollment | null;
}

// Progress summary for student
export interface ProgressSummary {
    totalCourses: number;
    totalLectures: number;
    completedLectures: number;
    inProgressLectures: number;
    totalWatchedTime: number; // in seconds
    courses: CourseProgressSummary[];
}

// Learning statistics
export interface LearningStatistics {
    totalWatchTime: number; // in minutes
    totalLecturesCompleted: number;
    totalCoursesCompleted: number;
    averageCompletionRate: number; // percentage
    currentStreak: number; // days
    longestStreak: number; // days
    lastActiveDate: Date | null;
    weeklyActivity: {
        date: string;
        watchTime: number; // in minutes
        lecturesCompleted: number;
    }[];
    subjectBreakdown: {
        subject: string;
        coursesCompleted: number;
        lecturesCompleted: number;
        watchTime: number; // in minutes
    }[];
}

// Track viewing input
export interface TrackViewingInput {
    lectureId: string;
    watchedSeconds: number;
}

