import { Request, Response, NextFunction } from 'express';
import { recommendationService } from './recommendation.service';
import { PrismaClient } from '@prisma/client';
import { successResponse } from '@/shared/utils/response.utils';

const prisma = new PrismaClient();

export class RecommendationController {
    async getCourseRecommendations(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                });
                return;
            }

            const studentId = req.user.userId;
            const limit = parseInt(req.query.limit as string) || 10;

            const result = await recommendationService.getCourseRecommendations(studentId, limit);

            successResponse(res, {
                data: result,
                message: 'Course recommendations retrieved successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    async getNextLearningItem(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                });
                return;
            }

            const studentId = req.user.userId;
            const item = await recommendationService.getNextLearningItem(studentId);

            if (!item) {
                res.status(404).json({
                    success: false,
                    message: 'No next learning item found',
                });
                return;
            }

            successResponse(res, {
                data: item,
                message: 'Next learning item retrieved successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    async getPopularCourses(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                });
                return;
            }

            const studentId = req.user.userId;
            
            // Get student's grade
            const student = await prisma.student.findUnique({
                where: { userId: studentId },
            });

            if (!student) {
                res.status(404).json({
                    success: false,
                    message: 'Student not found',
                });
                return;
            }

            const limit = parseInt(req.query.limit as string) || 10;
            const courses = await recommendationService.getPopularCourses(student.grade, limit);

            successResponse(res, {
                data: courses,
                message: 'Popular courses retrieved successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    async getChallengeCourses(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                });
                return;
            }

            const studentId = req.user.userId;
            
            // Get student's grade
            const student = await prisma.student.findUnique({
                where: { userId: studentId },
            });

            if (!student) {
                res.status(404).json({
                    success: false,
                    message: 'Student not found',
                });
                return;
            }

            const limit = parseInt(req.query.limit as string) || 10;
            const courses = await recommendationService.getChallengeCourses(student.grade, limit);

            successResponse(res, {
                data: courses,
                message: 'Challenge courses retrieved successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    async getReinforcementCourses(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                });
                return;
            }

            const studentId = req.user.userId;
            const weakSubjects = req.query.subjects 
                ? (req.query.subjects as string).split(',') as any[]
                : [];

            const recommendations = await recommendationService.getReinforcementCourses(
                studentId,
                weakSubjects
            );

            successResponse(res, {
                data: recommendations,
                message: 'Reinforcement courses retrieved successfully',
            });
        } catch (error) {
            next(error);
        }
    }
}

export const recommendationController = new RecommendationController();

