import { Request, Response, NextFunction } from 'express';
import { progressService } from './progress.service';
import { TrackViewingDTO } from './progress.dto';
import { successResponse } from '@/shared/utils/response.utils';

export class ProgressController {
    async getProgressSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                });
                return;
            }

            const studentId = req.user.userId;
            const summary = await progressService.getProgressSummary(studentId);

            successResponse(res, {
                data: summary,
                message: 'Progress summary retrieved successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    async getCourseProgress(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                });
                return;
            }

            const studentId = req.user.userId;
            const { courseId } = req.params;

            const progress = await progressService.getCourseProgress(studentId, courseId);

            if (!progress) {
                res.status(404).json({
                    success: false,
                    message: 'Course progress not found',
                });
                return;
            }

            successResponse(res, {
                data: progress,
                message: 'Course progress retrieved successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    async getLectureProgress(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                });
                return;
            }

            const studentId = req.user.userId;
            const { lectureId } = req.params;

            const progress = await progressService.getLectureProgress(studentId, lectureId);

            if (!progress) {
                res.status(404).json({
                    success: false,
                    message: 'Lecture progress not found',
                });
                return;
            }

            successResponse(res, {
                data: progress,
                message: 'Lecture progress retrieved successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    async trackViewing(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                });
                return;
            }

            const studentId = req.user.userId;
            const input: TrackViewingDTO = req.body;

            await progressService.trackViewing(studentId, input);

            successResponse(res, {
                message: 'Viewing progress tracked successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    async markAsCompleted(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                });
                return;
            }

            const studentId = req.user.userId;
            const { lectureId } = req.params;

            await progressService.markAsCompleted(studentId, lectureId);

            successResponse(res, {
                message: 'Lecture marked as completed successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    async getStatistics(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                });
                return;
            }

            const studentId = req.user.userId;
            const statistics = await progressService.getStatistics(studentId);

            successResponse(res, {
                data: statistics,
                message: 'Learning statistics retrieved successfully',
            });
        } catch (error) {
            next(error);
        }
    }
}

export const progressController = new ProgressController();

