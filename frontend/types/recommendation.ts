import type { Subject } from '~/types/course';

export type RecommendationCategory = 'grade_match' | 'popular' | 'challenge' | 'reinforcement';

export interface RecommendationCourse {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnail: string | null;
  subject: Subject;
  grade: string;
  level: string;
  duration: number;
  isPublished: boolean;
  isFree: boolean;
  avgRating: number | null;
  reviewCount: number;
}

export interface CourseRecommendation {
  course: RecommendationCourse;
  reason: string;
  score: number;
  category: RecommendationCategory;
}

export interface RecommendationResult {
  recommendations: CourseRecommendation[];
  total: number;
}

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

export interface ReinforcementRecommendation {
  subject: Subject;
  weakAreas: string[];
  recommendedCourses: RecommendationCourse[];
}
