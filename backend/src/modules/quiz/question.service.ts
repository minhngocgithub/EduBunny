import { Prisma, PrismaClient } from '@prisma/client';
import { CreateQuestionDTO, UpdateQuestionDTO } from './quiz.dto';

const prisma = new PrismaClient();

export class QuestionService {
  async listByQuiz(quizId: string) {
    return prisma.question.findMany({
      where: { quizId },
      orderBy: { order: 'asc' },
    });
  }

  async create(quizId: string, input: CreateQuestionDTO) {
    const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });
    if (!quiz) {
      throw new Error('Quiz not found');
    }

    return prisma.question.create({
      data: {
        quizId,
        type: input.type,
        question: input.question,
        ...(input.options !== undefined && { options: input.options as Prisma.InputJsonValue }),
        correctAnswer: input.correctAnswer,
        explanation: input.explanation,
        points: input.points,
        order: input.order,
      },
    });
  }

  async update(quizId: string, questionId: string, input: UpdateQuestionDTO) {
    const existing = await prisma.question.findUnique({ where: { id: questionId } });
    if (!existing || existing.quizId !== quizId) {
      throw new Error('Question not found');
    }

    return prisma.question.update({
      where: { id: questionId },
      data: {
        ...(input.type && { type: input.type }),
        ...(input.question !== undefined && { question: input.question }),
        ...(input.options !== undefined && { options: input.options as Prisma.InputJsonValue }),
        ...(input.correctAnswer !== undefined && { correctAnswer: input.correctAnswer }),
        ...(input.explanation !== undefined && { explanation: input.explanation }),
        ...(input.points !== undefined && { points: input.points }),
        ...(input.order !== undefined && { order: input.order }),
      },
    });
  }

  async remove(quizId: string, questionId: string) {
    const existing = await prisma.question.findUnique({ where: { id: questionId } });
    if (!existing || existing.quizId !== quizId) {
      throw new Error('Question not found');
    }

    await prisma.question.delete({ where: { id: questionId } });
  }
}

export const questionService = new QuestionService();
