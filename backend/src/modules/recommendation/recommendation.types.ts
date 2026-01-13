import { Course, Subject, Grade } from '@prisma/client';

// Course recommendation result
export interface CourseRecommendation {
    course: Course;
    reason: string; // Why this course is recommended
    score: number; // Recommendation score (0-100)
    category: 'grade_match' | 'popular' | 'challenge' | 'reinforcement';
}

// Recommendation result
export interface RecommendationResult {
    recommendations: CourseRecommendation[];
    total: number;
}

// Next learning item
export interface NextLearningItem {
    type: 'lecture' | 'course';
    item: {
        id: string;
        title: string;
        description?: string;
        courseId?: string;
        courseTitle?: string;
        order?: number;
    };
    reason: string;
    priority: 'high' | 'medium' | 'low';
}

// Reinforcement recommendation
export interface ReinforcementRecommendation {
    subject: Subject;
    weakAreas: string[];
    recommendedCourses: Course[];
}

