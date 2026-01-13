import { z } from 'zod';

// Track viewing schema
export const TrackViewingSchema = z.object({
    lectureId: z.string().uuid('Invalid lecture ID'),
    watchedSeconds: z.number()
        .int('Watched seconds must be an integer')
        .nonnegative('Watched seconds must be non-negative')
        .max(86400, 'Watched seconds must be at most 86400 (24 hours)'),
});

// Complete lecture schema
export const CompleteLectureSchema = z.object({
    lectureId: z.string().uuid('Invalid lecture ID'),
});

// Export types
export type TrackViewingDTO = z.infer<typeof TrackViewingSchema>;
export type CompleteLectureDTO = z.infer<typeof CompleteLectureSchema>;

