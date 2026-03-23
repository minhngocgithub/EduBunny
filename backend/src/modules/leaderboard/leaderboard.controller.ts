import { Request, Response } from 'express';
import { leaderboardService } from './leaderboard.service';
import { successResponse, errorResponse } from '@/shared/utils/response.utils';
import { Grade, Subject } from '@prisma/client';

export class LeaderboardController {
    /**
     * GET /api/leaderboard
     * Get top students from leaderboard with optional filters
     */
    async getLeaderboard(req: Request, res: Response): Promise<void> {
        try {
            const { limit, grade, subject, timeframe } = req.query;

            const filters: Partial<{ grade: Grade; subject: Subject; timeframe: 'alltime' | 'monthly' | 'weekly' }> = {};
            if (grade) filters.grade = grade as Grade;
            if (subject) filters.subject = subject as Subject;
            if (timeframe) filters.timeframe = timeframe as 'alltime' | 'monthly' | 'weekly';

            const leaderboard = await leaderboardService.getTopStudents(
                limit ? parseInt(limit as string) : 10,
                filters
            );

            const total = await leaderboardService.getLeaderboardSize(filters);

            successResponse(res, {
                data: {
                    leaderboard,
                    total,
                    filters,
                },
            });
            return;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            errorResponse(res, { message }, 500);
            return;
        }
    }

    /**
     * GET /api/leaderboard/me
     * Get current student's leaderboard info and surrounding context
     */
    async getMyLeaderboard(req: Request, res: Response): Promise<void> {
        try {
            if (!req.user) {
                errorResponse(res, { message: 'Unauthorized' }, 401);
                return;
            }

            const studentId = req.user.userId;
            const { grade, subject, timeframe } = req.query;

            const filters: Partial<{ grade: Grade; subject: Subject; timeframe: 'alltime' | 'monthly' | 'weekly' }> = {};
            if (grade) filters.grade = grade as Grade;
            if (subject) filters.subject = subject as Subject;
            if (timeframe) filters.timeframe = timeframe as 'alltime' | 'monthly' | 'weekly';

            // Get student's rank and score
            const myRank = await leaderboardService.getStudentRank(studentId, filters);

            if (!myRank) {
                successResponse(res, {
                    data: {
                        myRank: null,
                        surrounding: [],
                    },
                    message: 'Not ranked yet. Start learning to earn points!',
                });
                return;
            }

            // Get students around current student
            const surrounding = await leaderboardService.getStudentsAroundRank(
                studentId,
                5,
                filters
            );

            successResponse(res, {
                data: {
                    myRank,
                    surrounding,
                },
            });
            return;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            errorResponse(res, { message }, 500);
            return;
        }
    }

    /**
     * GET /api/leaderboard/rank/:studentId
     * Get specific student's rank
     */
    async getStudentRank(req: Request, res: Response): Promise<void> {
        try {
            const { studentId } = req.params;
            const { grade, subject, timeframe } = req.query;

            const filters: Partial<{ grade: Grade; subject: Subject; timeframe: 'alltime' | 'monthly' | 'weekly' }> = {};
            if (grade) filters.grade = grade as Grade;
            if (subject) filters.subject = subject as Subject;
            if (timeframe) filters.timeframe = timeframe as 'alltime' | 'monthly' | 'weekly';

            const rank = await leaderboardService.getStudentRank(studentId, filters);

            if (!rank) {
                errorResponse(res, { message: 'Student not found in leaderboard' }, 404);
                return;
            }

            successResponse(res, { data: rank });
            return;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            errorResponse(res, { message }, 500);
            return;
        }
    }

    /**
     * POST /api/leaderboard/rebuild
     * Rebuild leaderboard from database (Admin only)
     */
    async rebuildLeaderboard(req: Request, res: Response): Promise<void> {
        try {
            const { grade, subject, timeframe } = req.body;

            const filters: Partial<{ grade: Grade; subject: Subject; timeframe: 'alltime' | 'monthly' | 'weekly' }> = {};
            if (grade) filters.grade = grade as Grade;
            if (subject) filters.subject = subject as Subject;
            if (timeframe) filters.timeframe = timeframe as 'alltime' | 'monthly' | 'weekly';

            const count = await leaderboardService.rebuildLeaderboard(filters);

            successResponse(res, {
                message: 'Leaderboard rebuilt successfully',
                data: {
                    studentsAdded: count,
                    filters,
                },
            });
            return;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            errorResponse(res, { message }, 500);
            return;
        }
    }
}

export const leaderboardController = new LeaderboardController();
