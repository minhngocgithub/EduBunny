import { z } from 'zod';

// Helper function to create slug from title (same as in course.dto)
export function createSlug(title: string): string {
    return title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with dash
        .replace(/^-+|-+$/g, ''); // Remove leading/trailing dashes
}

// Create Lecture Schema
export const CreateLectureSchema = z.object({
    courseId: z.string().uuid('Invalid course ID'),
    title: z.string()
        .min(1, 'Title is required')
        .max(200, 'Title must be at most 200 characters'),
    slug: z.string()
        .min(1, 'Slug is required')
        .max(200, 'Slug must be at most 200 characters')
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format')
        .optional(),
    description: z.string()
        .max(5000, 'Description must be at most 5000 characters')
        .nullable()
        .optional(),
    videoUrl: z.string()
        .url('Invalid video URL')
        .nullable()
        .optional(),
    duration: z.number()
        .int('Duration must be an integer')
        .positive('Duration must be positive')
        .max(14400, 'Duration must be at most 14400 seconds (4 hours)'),
    order: z.number()
        .int('Order must be an integer')
        .nonnegative('Order must be non-negative')
        .optional()
        .default(0),
    isPreview: z.boolean().optional().default(false),
});

// Update Lecture Schema
export const UpdateLectureSchema = z.object({
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
        .max(5000, 'Description must be at most 5000 characters')
        .nullable()
        .optional(),
    videoUrl: z.string()
        .url('Invalid video URL')
        .nullable()
        .optional(),
    duration: z.number()
        .int('Duration must be an integer')
        .positive('Duration must be positive')
        .max(14400, 'Duration must be at most 14400 seconds (4 hours)')
        .optional(),
    order: z.number()
        .int('Order must be an integer')
        .nonnegative('Order must be non-negative')
        .optional(),
    isPreview: z.boolean().optional(),
});

// Export types
export type CreateLectureDTO = z.infer<typeof CreateLectureSchema>;
export type UpdateLectureDTO = z.infer<typeof UpdateLectureSchema>;

