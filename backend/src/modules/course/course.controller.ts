import { Request, Response, NextFunction } from 'express';
import { courseService } from './course.service';
import { CreateCourseDTO, UpdateCourseDTO, CourseQueryDTO } from './course.dto';
import { successResponse, paginatedResponse } from '@/shared/utils/response.utils';

export class CourseController {
    async getCourses(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const query = req.query as unknown as CourseQueryDTO;
            const studentId = req.user?.userId; // Optional: get student ID if authenticated

            const { courses, total } = await courseService.getCourses(query, studentId);

            paginatedResponse(res, {
                items: courses,
                page: query.page || 1,
                limit: query.limit || 10,
                total,
                message: 'Courses retrieved successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    async getCourseById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const studentId = req.user?.userId;

            const course = await courseService.getCourseById(id, studentId);

            if (!course) {
                res.status(404).json({
                    success: false,
                    message: 'Course not found',
                });
                return;
            }

            successResponse(res, {
                data: course,
                message: 'Course retrieved successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    async getCourseBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { slug } = req.params;
            const studentId = req.user?.userId;

            const course = await courseService.getCourseBySlug(slug, studentId);

            if (!course) {
                res.status(404).json({
                    success: false,
                    message: 'Course not found',
                });
                return;
            }

            successResponse(res, {
                data: course,
                message: 'Course retrieved successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    async createCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const input: CreateCourseDTO = req.body;
            const course = await courseService.createCourse(input);

            successResponse(res, {
                data: course,
                message: 'Course created successfully',
            }, 201);
        } catch (error) {
            next(error);
        }
    }

    async updateCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const input: UpdateCourseDTO = req.body;

            const course = await courseService.updateCourse(id, input);

            successResponse(res, {
                data: course,
                message: 'Course updated successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    async deleteCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;

            await courseService.deleteCourse(id);

            successResponse(res, {
                message: 'Course deleted successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    async getCourseReviews(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            const result = await courseService.getCourseReviews(id, page, limit);

            paginatedResponse(res, {
                items: result.reviews,
                page: result.page,
                limit: result.limit,
                total: result.total,
                message: 'Course reviews retrieved successfully',
            });
        } catch (error) {
            next(error);
        }
    }
}

export const courseController = new CourseController();

