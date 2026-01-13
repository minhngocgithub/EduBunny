import { z } from 'zod';

// Subscribe to report schema
export const SubscribeReportSchema = z.object({
    childId: z.string().uuid('Invalid child ID'),
});

export type SubscribeReportDTO = z.infer<typeof SubscribeReportSchema>;

