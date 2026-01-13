import { Request, Response, NextFunction } from 'express';
import { lectureService } from './lecture.service';
import { CreateLectureDTO, UpdateLectureDTO } from './lecture.dto';
import { successResponse } from '@/shared/utils/response.utils';

export class LectureController {
    async getLecturesByCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { courseId } = req.params;
            const studentId = req.user?.userId;

            const lectures = await lectureService.getLecturesByCourse(courseId, studentId);

            successResponse(res, {
                data: lectures,
                message: 'Lectures retrieved successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    async getLectureById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const studentId = req.user?.userId;

            const lecture = await lectureService.getLectureById(id, studentId);

            if (!lecture) {
                res.status(404).json({
                    success: false,
                    message: 'Lecture not found',
                });
                return;
            }

            successResponse(res, {
                data: lecture,
                message: 'Lecture retrieved successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    async getLectureBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { slug } = req.params;
            const studentId = req.user?.userId;

            const lecture = await lectureService.getLectureBySlug(slug, studentId);

            if (!lecture) {
                res.status(404).json({
                    success: false,
                    message: 'Lecture not found',
                });
                return;
            }

            successResponse(res, {
                data: lecture,
                message: 'Lecture retrieved successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    async createLecture(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const input: CreateLectureDTO = req.body;
            const lecture = await lectureService.createLecture(input);

            successResponse(res, {
                data: lecture,
                message: 'Lecture created successfully',
            }, 201);
        } catch (error) {
            next(error);
        }
    }

    async updateLecture(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const input: UpdateLectureDTO = req.body;

            const lecture = await lectureService.updateLecture(id, input);

            successResponse(res, {
                data: lecture,
                message: 'Lecture updated successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    async deleteLecture(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;

            await lectureService.deleteLecture(id);

            successResponse(res, {
                message: 'Lecture deleted successfully',
            });
        } catch (error) {
            next(error);
        }
    }
}

export const lectureController = new LectureController();

