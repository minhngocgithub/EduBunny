import { Prisma, PrismaClient, QuestionType } from '@prisma/client';
import { redisService } from '@/shared/services/redis.service';
import { rewardService } from '../reward/reward.service';
import { RewardTrigger } from '../reward/reward.types';
import {
  AdminQuizQueryDTO,
  CreateQuizDTO,
  SubmitAnswersDTO,
  UpdateQuizDTO,
} from './quiz.dto';
import { quizSessionService } from './quiz-session.service';
import { courseAccessService } from '../course/course-access.service';

const prisma = new PrismaClient();

type SubmittedAnswer = {
  questionId: string;
  answer: string;
};

export class QuizService {
  private readonly START_LOCK_TTL = 5;

  async getAdminQuizzes(query: AdminQuizQueryDTO) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where = {
      ...(query.courseId && { courseId: query.courseId }),
      ...(query.isActive !== undefined && { isActive: query.isActive }),
    };

    const [items, total] = await Promise.all([
      prisma.quiz.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ courseId: 'asc' }, { order: 'asc' }],
        include: {
          course: {
            select: {
              id: true,
              title: true,
            },
          },
          questions: {
            select: { id: true },
          },
          attempts: {
            select: {
              score: true,
              id: true,
            },
          },
        },
      }),
      prisma.quiz.count({ where }),
    ]);

    const quizzes = items.map((quiz) => {
      const attempts = quiz.attempts.length;
      const avgScore =
        attempts > 0
          ? Math.round(
              (quiz.attempts.reduce((sum, attempt) => sum + attempt.score, 0) / attempts) * 100
            ) / 100
          : 0;

      return {
        id: quiz.id,
        courseId: quiz.courseId,
        courseTitle: quiz.course.title,
        title: quiz.title,
        description: quiz.description,
        duration: quiz.duration,
        passingScore: quiz.passingScore,
        maxAttempts: quiz.maxAttempts,
        order: quiz.order,
        isActive: quiz.isActive,
        attempts,
        questionCount: quiz.questions.length,
        avgScore,
        createdAt: quiz.createdAt,
        updatedAt: quiz.updatedAt,
      };
    });

    return {
      quizzes,
      pagination: {
        page,
        limit,
        total,
      },
    };
  }

  async getQuizById(quizId: string, includeAnswers: boolean) {
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
        course: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!quiz) {
      throw new Error('Quiz not found');
    }

    return {
      ...quiz,
      questions: quiz.questions.map((question) => ({
        id: question.id,
        type: question.type,
        question: question.question,
        options: question.options,
        points: question.points,
        order: question.order,
        explanation: includeAnswers ? question.explanation : undefined,
        correctAnswer: includeAnswers ? question.correctAnswer : undefined,
      })),
    };
  }

  async getQuizzesByCourse(courseId: string, studentUserId?: string) {
    const quizzes = await prisma.quiz.findMany({
      where: {
        courseId,
        isActive: true,
      },
      orderBy: { order: 'asc' },
      include: {
        questions: {
          select: { id: true },
        },
      },
    });

    if (!studentUserId) {
      return quizzes.map((quiz) => ({
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        duration: quiz.duration,
        passingScore: quiz.passingScore,
        maxAttempts: quiz.maxAttempts,
        order: quiz.order,
        questionCount: quiz.questions.length,
      }));
    }

    const studentId = await courseAccessService.requireStudentIdByUserId(studentUserId);
    const attempts = await prisma.quizAttempt.findMany({
      where: {
        studentId,
        quizId: { in: quizzes.map((quiz) => quiz.id) },
      },
      select: {
        id: true,
        quizId: true,
        score: true,
        isPassed: true,
        completedAt: true,
      },
      orderBy: { startedAt: 'desc' },
    });

    const attemptsByQuiz = attempts.reduce<Record<string, typeof attempts>>((acc, attempt) => {
      if (!acc[attempt.quizId]) {
        acc[attempt.quizId] = [];
      }
      acc[attempt.quizId].push(attempt);
      return acc;
    }, {});

    return quizzes.map((quiz) => ({
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      duration: quiz.duration,
      passingScore: quiz.passingScore,
      maxAttempts: quiz.maxAttempts,
      order: quiz.order,
      questionCount: quiz.questions.length,
      attemptsUsed: attemptsByQuiz[quiz.id]?.length ?? 0,
      lastAttempt: attemptsByQuiz[quiz.id]?.[0] ?? null,
    }));
  }

  async createQuiz(input: CreateQuizDTO) {
    const course = await prisma.course.findUnique({ where: { id: input.courseId } });
    if (!course) {
      throw new Error('Course not found');
    }

    return prisma.quiz.create({
      data: {
        courseId: input.courseId,
        title: input.title,
        description: input.description,
        duration: input.duration,
        passingScore: input.passingScore,
        maxAttempts: input.maxAttempts,
        order: input.order,
        isActive: input.isActive,
        ...(input.settings !== undefined && { settings: input.settings as Prisma.InputJsonValue }),
      },
    });
  }

  async updateQuiz(quizId: string, input: UpdateQuizDTO) {
    const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });
    if (!quiz) {
      throw new Error('Quiz not found');
    }

    const inProgress = await prisma.quizAttempt.count({
      where: {
        quizId,
        completedAt: null,
      },
    });

    if (inProgress > 0) {
      throw new Error('Cannot edit quiz while attempts are in progress');
    }

    return prisma.quiz.update({
      where: { id: quizId },
      data: {
        ...(input.title !== undefined && { title: input.title }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.duration !== undefined && { duration: input.duration }),
        ...(input.passingScore !== undefined && { passingScore: input.passingScore }),
        ...(input.maxAttempts !== undefined && { maxAttempts: input.maxAttempts }),
        ...(input.order !== undefined && { order: input.order }),
        ...(input.isActive !== undefined && { isActive: input.isActive }),
        ...(input.settings !== undefined && { settings: input.settings as Prisma.InputJsonValue }),
      },
    });
  }

  async deleteQuiz(quizId: string) {
    const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });
    if (!quiz) {
      throw new Error('Quiz not found');
    }

    const inProgress = await prisma.quizAttempt.count({
      where: {
        quizId,
        completedAt: null,
      },
    });

    if (inProgress > 0) {
      throw new Error('Cannot delete quiz while attempts are in progress');
    }

    await prisma.quiz.delete({ where: { id: quizId } });
  }

  async startAttempt(quizId: string, userId: string) {
    const studentId = await courseAccessService.requireStudentIdByUserId(userId);

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          select: {
            id: true,
            points: true,
          },
        },
      },
    });

    if (!quiz) {
      throw new Error('Quiz not found');
    }

    if (!quiz.isActive) {
      throw new Error('Quiz is not active');
    }

    const canStartQuiz = await courseAccessService.canStartQuizByCourseId(studentId, quiz.courseId);
    if (!canStartQuiz) {
      throw new Error('Active entitlement required for this quiz');
    }

    const attemptsUsed = await prisma.quizAttempt.count({
      where: {
        quizId,
        studentId,
      },
    });

    if (attemptsUsed >= quiz.maxAttempts) {
      throw new Error('Maximum attempts exceeded for this quiz');
    }

    const lockKey = `quiz:lock:${quizId}:${studentId}`;
    const lock = await redisService
      .getClient()
      .set(lockKey, '1', 'EX', this.START_LOCK_TTL, 'NX');

    if (!lock) {
      throw new Error('Quiz is being started, please retry in a moment');
    }

    try {
      const existingInProgress = await prisma.quizAttempt.findFirst({
        where: {
          quizId,
          studentId,
          completedAt: null,
        },
        orderBy: { startedAt: 'desc' },
      });

      if (existingInProgress) {
        const session = await quizSessionService.getSession(existingInProgress.id);
        if (!session) {
          await quizSessionService.startQuizSession(
            existingInProgress.id,
            quizId,
            studentId,
            quiz.duration * 60
          );
        }

        return {
          attemptId: existingInProgress.id,
          alreadyInProgress: true,
          duration: quiz.duration,
        };
      }

      const totalPoints = quiz.questions.reduce((sum, question) => sum + question.points, 0);

      const attempt = await prisma.quizAttempt.create({
        data: {
          quizId,
          studentId,
          score: 0,
          totalPoints,
          earnedPoints: 0,
          isPassed: false,
        },
      });

      const session = await quizSessionService.startQuizSession(
        attempt.id,
        quizId,
        studentId,
        quiz.duration * 60
      );

      return {
        attemptId: attempt.id,
        alreadyInProgress: false,
        duration: quiz.duration,
        expiresAt: session.expiresAt,
      };
    } finally {
      await redisService.delete(lockKey);
    }
  }

  async saveAnswer(attemptId: string, userId: string, questionId: string, answer: string) {
    const studentId = await courseAccessService.requireStudentIdByUserId(userId);

    const attempt = await prisma.quizAttempt.findUnique({
      where: { id: attemptId },
      select: {
        id: true,
        studentId: true,
        completedAt: true,
        quizId: true,
      },
    });

    if (!attempt || attempt.studentId !== studentId) {
      throw new Error('Quiz attempt not found');
    }

    if (attempt.completedAt) {
      throw new Error('Quiz attempt is already completed');
    }

    const question = await prisma.question.findUnique({ where: { id: questionId } });
    if (!question || question.quizId !== attempt.quizId) {
      throw new Error('Question not found in this quiz');
    }

    await quizSessionService.saveAnswer(attemptId, questionId, answer);

    return {
      success: true,
      attemptId,
      questionId,
    };
  }

  async submitAttempt(quizId: string, userId: string, input: SubmitAnswersDTO) {
    const studentId = await courseAccessService.requireStudentIdByUserId(userId);
    return this.submitAttemptInternal(quizId, input.attemptId, input.answers, studentId);
  }

  async gracefulTimeout(attemptId: string) {
    const session = await quizSessionService.getSession(attemptId);
    if (!session) {
      return null;
    }

    const attempt = await prisma.quizAttempt.findUnique({
      where: { id: attemptId },
      select: {
        id: true,
        quizId: true,
        studentId: true,
        completedAt: true,
      },
    });

    if (!attempt || attempt.completedAt) {
      return null;
    }

    const fallbackAnswers: SubmittedAnswer[] = session.answers.map((answer) => ({
      questionId: answer.questionId,
      answer: answer.answer,
    }));

    return this.submitAttemptInternal(attempt.quizId, attempt.id, fallbackAnswers, attempt.studentId);
  }

  async getAttemptResult(attemptId: string, userId: string) {
    const studentId = await courseAccessService.requireStudentIdByUserId(userId);

    const attempt = await prisma.quizAttempt.findUnique({
      where: { id: attemptId },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            passingScore: true,
          },
        },
        answers: {
          include: {
            question: {
              select: {
                id: true,
                question: true,
                explanation: true,
                points: true,
                correctAnswer: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!attempt || attempt.studentId !== studentId) {
      throw new Error('Quiz attempt not found');
    }

    return {
      id: attempt.id,
      quizId: attempt.quizId,
      quizTitle: attempt.quiz.title,
      score: attempt.score,
      totalPoints: attempt.totalPoints,
      earnedPoints: attempt.earnedPoints,
      isPassed: attempt.isPassed,
      passingScore: attempt.quiz.passingScore,
      startedAt: attempt.startedAt,
      completedAt: attempt.completedAt,
      timeSpent: attempt.timeSpent,
      answers: attempt.answers.map((answer) => ({
        questionId: answer.questionId,
        question: answer.question.question,
        answer: answer.answer,
        isCorrect: answer.isCorrect,
        pointsEarned: answer.pointsEarned,
        maxPoints: answer.question.points,
        explanation: answer.question.explanation,
        correctAnswer: answer.question.correctAnswer,
      })),
    };
  }

  private async submitAttemptInternal(
    quizId: string,
    attemptId: string,
    rawAnswers: SubmittedAnswer[],
    studentId: string
  ) {
    const attempt = await prisma.quizAttempt.findUnique({
      where: { id: attemptId },
      include: {
        quiz: {
          include: {
            questions: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });

    if (!attempt || attempt.quizId !== quizId || attempt.studentId !== studentId) {
      throw new Error('Quiz attempt not found');
    }

    if (attempt.completedAt) {
      throw new Error('Quiz attempt is already completed');
    }

    const canSubmitQuiz = await courseAccessService.canSubmitQuizByCourseId(
      studentId,
      attempt.quiz.courseId
    );

    if (!canSubmitQuiz) {
      throw new Error('Active entitlement required for this quiz');
    }

    const answerMap = new Map(rawAnswers.map((answer) => [answer.questionId, answer.answer]));

    const gradedAnswers = attempt.quiz.questions.map((question) => {
      const raw = answerMap.get(question.id) ?? '';
      const isCorrect = this.isCorrectAnswer(question.type, question.correctAnswer, raw);
      const pointsEarned = isCorrect ? question.points : 0;

      return {
        questionId: question.id,
        answer: raw,
        isCorrect,
        pointsEarned,
      };
    });

    const totalPoints = attempt.quiz.questions.reduce((sum, question) => sum + question.points, 0);
    const earnedPoints = gradedAnswers.reduce((sum, answer) => sum + answer.pointsEarned, 0);
    const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 10000) / 100 : 0;
    const isPassed = score >= attempt.quiz.passingScore;

    const session = await quizSessionService.getSession(attemptId);
    const timeSpent = session
      ? Math.max(0, Math.floor((Date.now() - new Date(session.startedAt).getTime()) / 1000))
      : Math.max(0, Math.floor((Date.now() - new Date(attempt.startedAt).getTime()) / 1000));

    const submitted = await prisma.$transaction(async (tx) => {
      await tx.answer.deleteMany({ where: { attemptId } });

      if (gradedAnswers.length > 0) {
        await tx.answer.createMany({
          data: gradedAnswers.map((answer) => ({
            attemptId,
            questionId: answer.questionId,
            answer: answer.answer,
            isCorrect: answer.isCorrect,
            pointsEarned: answer.pointsEarned,
          })),
        });
      }

      return tx.quizAttempt.update({
        where: { id: attemptId },
        data: {
          score,
          totalPoints,
          earnedPoints,
          isPassed,
          completedAt: new Date(),
          timeSpent,
        },
      });
    });

    await quizSessionService.deleteSession(attemptId);

    if (isPassed) {
      const stars = score >= 100 ? 3 : score >= 80 ? 2 : 1;
      const trigger = score >= 100 ? RewardTrigger.QUIZ_PERFECT : RewardTrigger.QUIZ_PASS;

      await rewardService.grantByTrigger(studentId, trigger, {
        quizId,
        quizTitle: attempt.quiz.title,
        score,
        stars,
      });
    }

    return {
      attemptId: submitted.id,
      quizId,
      score,
      totalPoints,
      earnedPoints,
      isPassed,
      timeSpent,
      passedThreshold: attempt.quiz.passingScore,
    };
  }

  private isCorrectAnswer(type: QuestionType, correct: string, actual: string): boolean {
    const normalizedCorrect = correct.trim().toLowerCase();
    const normalizedActual = actual.trim().toLowerCase();

    if (type === QuestionType.FILL_BLANK) {
      return normalizedActual === normalizedCorrect;
    }

    if (type === QuestionType.TRUE_FALSE) {
      const trueValues = ['true', '1', 'yes'];
      const falseValues = ['false', '0', 'no'];

      if (trueValues.includes(normalizedCorrect)) {
        return trueValues.includes(normalizedActual);
      }
      if (falseValues.includes(normalizedCorrect)) {
        return falseValues.includes(normalizedActual);
      }
    }

    return normalizedActual === normalizedCorrect;
  }
}

export const quizService = new QuizService();
