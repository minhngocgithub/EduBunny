import { Router } from 'express';
import { quizController } from './quiz.controller';
import {
  AdminQuizQuerySchema,
  AttemptIdParamSchema,
  CourseIdParamSchema,
  CreateQuestionSchema,
  CreateQuizSchema,
  QuizQuestionParamSchema,
  QuizIdParamSchema,
  SaveAnswerSchema,
  SubmitAnswersSchema,
  UpdateQuestionSchema,
  UpdateQuizSchema,
} from './quiz.dto';
import {
  authMiddleware,
  optionalAuthMiddleware,
  requireAdmin,
  requireStudent,
} from '@/shared/config/passport.config';
import {
  validateParams,
  validateQuery,
  validateRequest,
} from '@/shared/middleware/validation.middleware';

const router = Router();

// Admin CRUD routes
router.get(
  '/admin',
  authMiddleware,
  requireAdmin,
  validateQuery(AdminQuizQuerySchema),
  quizController.getAdminQuizzes.bind(quizController)
);

router.post(
  '/',
  authMiddleware,
  requireAdmin,
  validateRequest(CreateQuizSchema),
  quizController.createQuiz.bind(quizController)
);

router.patch(
  '/:id',
  authMiddleware,
  requireAdmin,
  validateParams(QuizIdParamSchema),
  validateRequest(UpdateQuizSchema),
  quizController.updateQuiz.bind(quizController)
);

router.delete(
  '/:id',
  authMiddleware,
  requireAdmin,
  validateParams(QuizIdParamSchema),
  quizController.deleteQuiz.bind(quizController)
);

router.get(
  '/:id/questions',
  authMiddleware,
  requireAdmin,
  validateParams(QuizIdParamSchema),
  quizController.getQuestions.bind(quizController)
);

router.post(
  '/:id/questions',
  authMiddleware,
  requireAdmin,
  validateParams(QuizIdParamSchema),
  validateRequest(CreateQuestionSchema),
  quizController.createQuestion.bind(quizController)
);

router.patch(
  '/:id/questions/:questionId',
  authMiddleware,
  requireAdmin,
  validateParams(QuizQuestionParamSchema),
  validateRequest(UpdateQuestionSchema),
  quizController.updateQuestion.bind(quizController)
);

router.delete(
  '/:id/questions/:questionId',
  authMiddleware,
  requireAdmin,
  validateParams(QuizQuestionParamSchema),
  quizController.deleteQuestion.bind(quizController)
);

// Student flow routes
router.post(
  '/:id/start',
  authMiddleware,
  requireStudent,
  validateParams(QuizIdParamSchema),
  quizController.startAttempt.bind(quizController)
);

router.post(
  '/:id/submit',
  authMiddleware,
  requireStudent,
  validateParams(QuizIdParamSchema),
  validateRequest(SubmitAnswersSchema),
  quizController.submitAttempt.bind(quizController)
);

router.post(
  '/attempts/:attemptId/answers',
  authMiddleware,
  requireStudent,
  validateParams(AttemptIdParamSchema),
  validateRequest(SaveAnswerSchema),
  quizController.saveAnswer.bind(quizController)
);

router.get(
  '/attempts/:attemptId',
  authMiddleware,
  requireStudent,
  validateParams(AttemptIdParamSchema),
  quizController.getAttemptResult.bind(quizController)
);

// Internal timeout route (optional trigger from worker)
router.post(
  '/attempts/:attemptId/timeout',
  authMiddleware,
  requireAdmin,
  validateParams(AttemptIdParamSchema),
  quizController.timeoutAttempt.bind(quizController)
);

// Public / authenticated read routes
router.get(
  '/course/:courseId',
  optionalAuthMiddleware,
  validateParams(CourseIdParamSchema),
  quizController.getQuizzesByCourse.bind(quizController)
);

router.get(
  '/:id',
  optionalAuthMiddleware,
  validateParams(QuizIdParamSchema),
  quizController.getQuizById.bind(quizController)
);

export default router;
