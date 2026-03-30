import { QuestionType } from '@prisma/client';
import { z } from 'zod';

export const QuizIdParamSchema = z.object({
  id: z.string().uuid('Invalid quiz ID'),
});

export const CourseIdParamSchema = z.object({
  courseId: z.string().uuid('Invalid course ID'),
});

export const AttemptIdParamSchema = z.object({
  attemptId: z.string().uuid('Invalid attempt ID'),
});

export const QuizQuestionParamSchema = z.object({
  id: z.string().uuid('Invalid quiz ID'),
  questionId: z.string().uuid('Invalid question ID'),
});

export const AdminQuizQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  courseId: z.string().uuid().optional(),
  isActive: z.coerce.boolean().optional(),
});

export const CreateQuizSchema = z.object({
  courseId: z.string().uuid('Invalid course ID'),
  title: z.string().min(1, 'Quiz title is required').max(200),
  description: z.string().max(5000).optional().nullable(),
  duration: z.number().int().positive().max(180), // minutes
  passingScore: z.number().int().min(0).max(100).optional().default(70),
  maxAttempts: z.number().int().min(1).max(10).optional().default(3),
  order: z.number().int().min(0).optional().default(0),
  isActive: z.boolean().optional().default(true),
  settings: z.record(z.unknown()).optional(),
});

export const UpdateQuizSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional().nullable(),
  duration: z.number().int().positive().max(180).optional(),
  passingScore: z.number().int().min(0).max(100).optional(),
  maxAttempts: z.number().int().min(1).max(10).optional(),
  order: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
  settings: z.record(z.unknown()).optional(),
});

export const CreateQuestionSchema = z.object({
  type: z.nativeEnum(QuestionType),
  question: z.string().min(1, 'Question content is required').max(5000),
  options: z.array(z.string()).optional(),
  correctAnswer: z.string().min(1, 'Correct answer is required').max(5000),
  explanation: z.string().max(5000).optional().nullable(),
  points: z.number().int().min(1).max(10).optional().default(1),
  order: z.number().int().min(0).optional().default(0),
});

export const UpdateQuestionSchema = z.object({
  type: z.nativeEnum(QuestionType).optional(),
  question: z.string().min(1).max(5000).optional(),
  options: z.array(z.string()).optional(),
  correctAnswer: z.string().min(1).max(5000).optional(),
  explanation: z.string().max(5000).optional().nullable(),
  points: z.number().int().min(1).max(10).optional(),
  order: z.number().int().min(0).optional(),
});

export const SubmitAnswersSchema = z.object({
  attemptId: z.string().uuid('Invalid attempt ID'),
  answers: z.array(
    z.object({
      questionId: z.string().uuid('Invalid question ID'),
      answer: z.string().min(1, 'Answer is required'),
    })
  ).optional().default([]),
});

export const SaveAnswerSchema = z.object({
  questionId: z.string().uuid('Invalid question ID'),
  answer: z.string().min(1, 'Answer is required'),
});

export type AdminQuizQueryDTO = z.infer<typeof AdminQuizQuerySchema>;
export type CreateQuizDTO = z.infer<typeof CreateQuizSchema>;
export type UpdateQuizDTO = z.infer<typeof UpdateQuizSchema>;
export type CreateQuestionDTO = z.infer<typeof CreateQuestionSchema>;
export type UpdateQuestionDTO = z.infer<typeof UpdateQuestionSchema>;
export type SubmitAnswersDTO = z.infer<typeof SubmitAnswersSchema>;
export type SaveAnswerDTO = z.infer<typeof SaveAnswerSchema>;
