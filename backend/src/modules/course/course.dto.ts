import { z } from 'zod';
import { Subject, Grade, CourseLevel } from '@prisma/client';

/**
 * Custom boolean coercion for query params
 * Handles string "true"/"false" correctly
 */
const booleanQueryParam = z
    .union([z.boolean(), z.string(), z.number()])
    .optional()
    .transform((val) => {
        if (val === undefined || val === null) return undefined;
        if (typeof val === 'boolean') return val;
        if (typeof val === 'string') {
            const lower = val.toLowerCase();
            if (lower === 'true' || lower === '1') return true;
            if (lower === 'false' || lower === '0') return false;
            return undefined;
        }
        if (typeof val === 'number') return val !== 0;
        return undefined;
    });

const thumbnailSchema = z.string()
    .trim()
    .refine((value) => {
        if (!value) {
            return false;
        }

        try {
            const url = new URL(value);
            if (url.protocol === 'http:' || url.protocol === 'https:') {
                return true;
            }
        } catch {
            // Not an absolute URL, continue validating as relative asset path.
        }

        // Allow relative paths such as /images/course.jpg, images/course.jpg, ./images/course.jpg
        return /^\.?\/?[A-Za-z0-9_\-./%]+$/.test(value);
    }, 'Invalid thumbnail URL');

// Helper function to create slug from title
export function createSlug(title: string): string {
    return title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with dash
        .replace(/^-+|-+$/g, ''); // Remove leading/trailing dashes
}

// Create Course Schema
export const CreateCourseSchema = z.object({
    title: z.string()
        .min(1, 'Title is required')
        .max(200, 'Title must be at most 200 characters'),
    slug: z.string()
        .min(1, 'Slug is required')
        .max(200, 'Slug must be at most 200 characters')
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format (use lowercase letters, numbers, and hyphens)')
        .optional(),
    description: z.string()
        .min(10, 'Description must be at least 10 characters')
        .max(5000, 'Description must be at most 5000 characters'),
    thumbnail: thumbnailSchema.nullable().optional(),
    subject: z.nativeEnum(Subject, {
        errorMap: () => ({ message: 'Invalid subject' }),
    }),
    grade: z.nativeEnum(Grade, {
        errorMap: () => ({ message: 'Invalid grade' }),
    }),
    level: z.nativeEnum(CourseLevel, {
        errorMap: () => ({ message: 'Invalid course level' }),
    }).optional().default(CourseLevel.BEGINNER),
    duration: z.number()
        .int('Duration must be an integer')
        .nonnegative('Duration must be non-negative')
        .max(10000, 'Duration must be at most 10000 minutes')
        .optional()
        .default(0), // Auto-calculated from lectures
    isPublished: z.boolean().optional().default(false),
    isFree: z.boolean().optional().default(true),
    order: z.number()
        .int('Order must be an integer')
        .nonnegative('Order must be non-negative')
        .optional()
        .default(0),
    metadata: z.record(z.unknown()).nullable().optional(),
});

// Update Course Schema
export const UpdateCourseSchema = z.object({
    title: z.string()
        .min(1, 'Title is required')
        .max(200, 'Title must be at most 200 characters')
        .optional(),
    slug: z.string()
        .min(1, 'Slug is required')
        .max(200, 'Slug must be at most 200 characters')
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format')
        .optional(),
    description: z.string()
        .min(10, 'Description must be at least 10 characters')
        .max(5000, 'Description must be at most 5000 characters')
        .optional(),
    thumbnail: thumbnailSchema.nullable().optional(),
    subject: z.nativeEnum(Subject, {
        errorMap: () => ({ message: 'Invalid subject' }),
    }).optional(),
    grade: z.nativeEnum(Grade, {
        errorMap: () => ({ message: 'Invalid grade' }),
    }).optional(),
    level: z.nativeEnum(CourseLevel, {
        errorMap: () => ({ message: 'Invalid course level' }),
    }).optional(),
    duration: z.number()
        .int('Duration must be an integer')
        .positive('Duration must be positive')
        .max(10000, 'Duration must be at most 10000 minutes')
        .optional(),
    isPublished: z.boolean().optional(),
    isFree: z.boolean().optional(),
    order: z.number()
        .int('Order must be an integer')
        .nonnegative('Order must be non-negative')
        .optional(),
    metadata: z.record(z.unknown()).nullable().optional(),
});

// Course Query Schema (for filtering)
export const CourseQuerySchema = z.object({
    grade: z.nativeEnum(Grade).optional(),
    subject: z.nativeEnum(Subject).optional(),
    level: z.nativeEnum(CourseLevel).optional(),
    isFree: booleanQueryParam,
    isPublished: booleanQueryParam,
    search: z.string().min(1).max(100).optional(),
    minRating: z.coerce.number().min(0).max(5).optional(),
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(10),
});

// Admin List Courses Query Schema (for admin dashboard)
export const AdminListCoursesQuerySchema = z.object({
    search: z.string().optional(),
    subject: z.nativeEnum(Subject).optional(),
    grade: z.nativeEnum(Grade).optional(),
    level: z.nativeEnum(CourseLevel).optional(),
    isPublished: booleanQueryParam,
    isFree: booleanQueryParam,
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

// Export types
export type CreateCourseDTO = z.infer<typeof CreateCourseSchema>;
export type UpdateCourseDTO = z.infer<typeof UpdateCourseSchema>;
export type CourseQueryDTO = z.infer<typeof CourseQuerySchema>;
export type AdminListCoursesQueryDTO = z.infer<typeof AdminListCoursesQuerySchema>;

