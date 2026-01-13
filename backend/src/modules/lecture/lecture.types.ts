import { Lecture, Course } from '@prisma/client';

// Lecture with course relation
export interface LectureWithCourse extends Lecture {
    course: Course;
}

// Lecture detail response
export interface LectureDetail extends Lecture {
    course?: Course;
    isCompleted?: boolean;
    watchedSeconds?: number;
    completionRate?: number;
}

// Create lecture input
export interface CreateLectureInput {
    courseId: string;
    title: string;
    slug?: string; // Auto-generated if not provided
    description?: string | null;
    videoUrl?: string | null;
    duration: number;
    order?: number;
    isPreview?: boolean;
}

// Update lecture input
export interface UpdateLectureInput {
    title?: string;
    slug?: string;
    description?: string | null;
    videoUrl?: string | null;
    duration?: number;
    order?: number;
    isPreview?: boolean;
}

// Lecture list item
export interface LectureListItem {
    id: string;
    courseId: string;
    title: string;
    slug: string;
    description: string | null;
    videoUrl: string | null;
    duration: number;
    order: number;
    isPreview: boolean;
    isCompleted?: boolean;
    watchedSeconds?: number;
    completionRate?: number;
}

