import { Subject, Grade, CourseLevel, Course, Lecture, Enrollment, CourseReview } from '@prisma/client';

// Course with relations
export interface CourseWithRelations extends Course {
    lectures?: Lecture[];
    enrollments?: Enrollment[];
    reviews?: CourseReview[];
}

// Course detail response
export interface CourseDetail extends Course {
    lectures?: Lecture[];
    enrollmentCount?: number;
    reviewCount?: number;
    avgRating?: number;
    isEnrolled?: boolean;
}

// Course list item (summary)
export interface CourseListItem {
    id: string;
    title: string;
    slug: string;
    description: string;
    thumbnail: string | null;
    subject: Subject;
    grade: Grade;
    level: CourseLevel;
    duration: number;
    isFree: boolean;
    avgRating: number | null;
    reviewCount: number;
    enrollmentCount?: number;
    isEnrolled?: boolean;
}

// Course filters for listing
export interface CourseFilters {
    grade?: Grade;
    subject?: Subject;
    level?: CourseLevel;
    isFree?: boolean;
    isPublished?: boolean;
    search?: string;
    minRating?: number;
    page?: number;
    limit?: number;
}

// Create course input
export interface CreateCourseInput {
    title: string;
    slug?: string; // Auto-generated if not provided
    description: string;
    thumbnail?: string | null;
    subject: Subject;
    grade: Grade;
    level?: CourseLevel;
    duration: number;
    isPublished?: boolean;
    isFree?: boolean;
    order?: number;
    metadata?: Record<string, unknown> | null;
}

// Update course input
export interface UpdateCourseInput {
    title?: string;
    slug?: string;
    description?: string;
    thumbnail?: string | null;
    subject?: Subject;
    grade?: Grade;
    level?: CourseLevel;
    duration?: number;
    isPublished?: boolean;
    isFree?: boolean;
    order?: number;
    metadata?: Record<string, unknown> | null;
}

// Course statistics
export interface CourseStatistics {
    totalCourses: number;
    publishedCourses: number;
    totalEnrollments: number;
    averageRating: number;
    coursesBySubject: Record<Subject, number>;
    coursesByGrade: Record<Grade, number>;
}

// Enrollment info for course
export interface CourseEnrollmentInfo {
    isEnrolled: boolean;
    enrolledAt?: Date;
    completedAt?: Date | null;
    progress?: number;
    lastAccessAt?: Date;
}

