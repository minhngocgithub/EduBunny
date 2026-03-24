import { Request, Response, NextFunction } from 'express';
import { successResponse } from '@/shared/utils/response.utils';
import { quizService } from './quiz.service';
import { questionService } from './question.service';
import {
  AdminQuizQueryDTO,
  CreateQuestionDTO,
  CreateQuizDTO,
  SaveAnswerDTO,
  SubmitAnswersDTO,
  UpdateQuestionDTO,
  UpdateQuizDTO,
} from './quiz.dto';

export class QuizController {
  async getAdminQuizzes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query as unknown as AdminQuizQueryDTO;
      const result = await quizService.getAdminQuizzes(query);

      successResponse(res, {
        message: 'Quizzes retrieved successfully',
        data: {
          quizzes: result.quizzes,
          pagination: result.pagination,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getQuizById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const quiz = await quizService.getQuizById(req.params.id, req.user?.role === 'ADMIN');
      successResponse(res, {
        message: 'Quiz retrieved successfully',
        data: quiz,
      });
    } catch (error) {
      next(error);
    }
  }

  async getQuizzesByCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await quizService.getQuizzesByCourse(req.params.courseId, req.user?.userId);
      successResponse(res, {
        message: 'Course quizzes retrieved successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async createQuiz(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const payload = req.body as CreateQuizDTO;
      const quiz = await quizService.createQuiz(payload);
      successResponse(res, {
        message: 'Quiz created successfully',
        data: quiz,
      }, 201);
    } catch (error) {
      next(error);
    }
  }

  async updateQuiz(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const payload = req.body as UpdateQuizDTO;
      const quiz = await quizService.updateQuiz(req.params.id, payload);
      successResponse(res, {
        message: 'Quiz updated successfully',
        data: quiz,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteQuiz(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await quizService.deleteQuiz(req.params.id);
      successResponse(res, {
        message: 'Quiz deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async startAttempt(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.userId) {
        throw new Error('Unauthorized');
      }

      const result = await quizService.startAttempt(req.params.id, req.user.userId);
      successResponse(res, {
        message: 'Quiz attempt started successfully',
        data: result,
      }, 201);
    } catch (error) {
      next(error);
    }
  }

  async saveAnswer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.userId) {
        throw new Error('Unauthorized');
      }

      const payload = req.body as SaveAnswerDTO;
      const result = await quizService.saveAnswer(
        req.params.attemptId,
        req.user.userId,
        payload.questionId,
        payload.answer
      );

      successResponse(res, {
        message: 'Answer saved successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async submitAttempt(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.userId) {
        throw new Error('Unauthorized');
      }

      const payload = req.body as SubmitAnswersDTO;
      const result = await quizService.submitAttempt(req.params.id, req.user.userId, payload);

      successResponse(res, {
        message: 'Quiz submitted successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAttemptResult(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.userId) {
        throw new Error('Unauthorized');
      }

      const result = await quizService.getAttemptResult(req.params.attemptId, req.user.userId);
      successResponse(res, {
        message: 'Attempt result retrieved successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async timeoutAttempt(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await quizService.gracefulTimeout(req.params.attemptId);
      successResponse(res, {
        message: 'Timeout processing completed',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getQuestions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await questionService.listByQuiz(req.params.id);
      successResponse(res, {
        message: 'Questions retrieved successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async createQuestion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const payload = req.body as CreateQuestionDTO;
      const created = await questionService.create(req.params.id, payload);
      successResponse(res, {
        message: 'Question created successfully',
        data: created,
      }, 201);
    } catch (error) {
      next(error);
    }
  }

  async updateQuestion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const payload = req.body as UpdateQuestionDTO;
      const updated = await questionService.update(req.params.id, req.params.questionId, payload);
      successResponse(res, {
        message: 'Question updated successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteQuestion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await questionService.remove(req.params.id, req.params.questionId);
      successResponse(res, {
        message: 'Question deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const quizController = new QuizController();
