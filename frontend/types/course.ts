// Course types for frontend

export type Subject = 'MATH' | 'VIETNAMESE' | 'ENGLISH' | 'SCIENCE' | 'ART' | 'MUSIC' | 'PE' | 'HISTORY' | 'GEOGRAPHY' | 'LIFE_SKILLS';
export type Grade = 'GRADE_1' | 'GRADE_2' | 'GRADE_3' | 'GRADE_4' | 'GRADE_5';
export type CourseLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

// Public course list item (for students/guests)
export interface CourseListItem {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    thumbnail: string | null;
    subject: Subject;
    grade: Grade;
    level: CourseLevel;
    duration: number;
    isFree: boolean;
    avgRating: number | null;
    reviewCount: number;
    enrollmentCount: number;
    isEnrolled: boolean;
    isPublished?: boolean;
}

// Admin course list item
export interface AdminCourseListItem {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    thumbnail: string | null;
    subject: Subject;
    grade: Grade;
    level: CourseLevel;
    duration: number;
    isPublished: boolean;
    isFree: boolean;
    order: number;
    avgRating: number | null;
    reviewCount: number;
    lectureCount: number;
    enrollmentCount: number;
    createdAt: string;
    updatedAt: string;
}

// Admin courses list response
export interface AdminCoursesListResponse {
    courses: AdminCourseListItem[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

// Admin courses query params
export interface AdminCoursesQueryParams {
    search?: string;
    subject?: Subject;
    grade?: Grade;
    level?: CourseLevel;
    isPublished?: boolean;
    isFree?: boolean;
    page?: number;
    limit?: number;
}

// Create course input
export interface CreateCourseInput {
    title: string;
    description: string;
    subject: Subject;
    grade: Grade;
    level?: CourseLevel;
    duration: number;
    thumbnail?: string;
    isPublished?: boolean;
    isFree?: boolean;
}
