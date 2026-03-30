import { PrismaClient } from '@prisma/client';
import { QuizService } from '@modules/quiz/quiz.service';
import { rewardService } from '@modules/reward/reward.service';
import { quizSessionService } from '@modules/quiz/quiz-session.service';
import { redisService } from '@shared/services/redis.service';
import { RewardTrigger } from '@modules/reward/reward.types';

jest.mock('@prisma/client', () => {
  const mockPrisma = {
    student: { findUnique: jest.fn() },
    quiz: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    question: { findUnique: jest.fn(), findMany: jest.fn() },
    enrollment: { findUnique: jest.fn() },
    quizAttempt: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  return {
    PrismaClient: jest.fn(() => mockPrisma),
    QuestionType: {
      MULTIPLE_CHOICE: 'MULTIPLE_CHOICE',
      TRUE_FALSE: 'TRUE_FALSE',
      FILL_BLANK: 'FILL_BLANK',
      SHORT_ANSWER: 'SHORT_ANSWER',
    },
  };
});

jest.mock('@modules/reward/reward.service', () => ({
  rewardService: { grantByTrigger: jest.fn() },
}));

jest.mock('@modules/quiz/quiz-session.service', () => ({
  quizSessionService: {
    getSession: jest.fn(),
    startQuizSession: jest.fn(),
    deleteSession: jest.fn(),
    saveAnswer: jest.fn(),
  },
}));

jest.mock('@shared/services/redis.service', () => ({
  redisService: {
    getClient: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('QuizService', () => {
  let service: QuizService;
  const prismaMock = new PrismaClient() as any;
  const lockSet = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    service = new QuizService();

    prismaMock.student.findUnique.mockResolvedValue({ id: 'student-1' });
    (redisService.getClient as jest.Mock).mockReturnValue({ set: lockSet });
    lockSet.mockResolvedValue('OK');
    (redisService.delete as jest.Mock).mockResolvedValue(1);
  });

  it('starts a quiz attempt successfully', async () => {
    prismaMock.quiz.findUnique.mockResolvedValue({
      id: 'quiz-1',
      courseId: 'course-1',
      isActive: true,
      maxAttempts: 3,
      duration: 30,
      questions: [{ id: 'q1', points: 5 }],
    });
    prismaMock.enrollment.findUnique.mockResolvedValue({ id: 'enroll-1' });
    prismaMock.quizAttempt.count.mockResolvedValue(0);
    prismaMock.quizAttempt.findFirst.mockResolvedValue(null);
    prismaMock.quizAttempt.create.mockResolvedValue({ id: 'attempt-1' });
    (quizSessionService.startQuizSession as jest.Mock).mockResolvedValue({
      expiresAt: new Date('2026-03-28T12:30:00.000Z'),
    });

    const result = await service.startAttempt('quiz-1', 'user-1');

    expect(result.attemptId).toBe('attempt-1');
    expect(result.alreadyInProgress).toBe(false);
  });

  it('rejects start attempt when student is not enrolled', async () => {
    prismaMock.quiz.findUnique.mockResolvedValue({
      id: 'quiz-1',
      courseId: 'course-1',
      isActive: true,
      maxAttempts: 3,
      duration: 30,
      questions: [],
    });
    prismaMock.enrollment.findUnique.mockResolvedValue(null);

    await expect(service.startAttempt('quiz-1', 'user-1')).rejects.toThrow(
      'Student is not enrolled in this course'
    );
  });

  it('submits attempt and grants perfect reward', async () => {
    prismaMock.quizAttempt.findUnique.mockResolvedValue({
      id: 'attempt-1',
      quizId: 'quiz-1',
      studentId: 'student-1',
      startedAt: new Date('2026-03-28T12:00:00.000Z'),
      completedAt: null,
      quiz: {
        title: 'Math Quiz',
        passingScore: 70,
        questions: [
          {
            id: 'q1',
            type: 'MULTIPLE_CHOICE',
            correctAnswer: '4',
            points: 10,
            order: 1,
          },
        ],
      },
    });

    (quizSessionService.getSession as jest.Mock).mockResolvedValue({
      startedAt: new Date('2026-03-28T12:00:00.000Z').toISOString(),
      answers: [],
    });

    prismaMock.$transaction.mockImplementation(async (callback: any) =>
      callback({
        answer: {
          deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
          createMany: jest.fn().mockResolvedValue({ count: 1 }),
        },
        quizAttempt: {
          update: jest.fn().mockResolvedValue({ id: 'attempt-1' }),
        },
      })
    );

    (quizSessionService.deleteSession as jest.Mock).mockResolvedValue(true);
    (rewardService.grantByTrigger as jest.Mock).mockResolvedValue({ id: 'reward-1' });

    const result = await service.submitAttempt('quiz-1', 'user-1', {
      attemptId: 'attempt-1',
      answers: [{ questionId: 'q1', answer: '4' }],
    });

    expect(result.score).toBe(100);
    expect(result.isPassed).toBe(true);
    expect(rewardService.grantByTrigger).toHaveBeenCalledWith(
      'student-1',
      RewardTrigger.QUIZ_PERFECT,
      expect.objectContaining({ quizId: 'quiz-1', score: 100, stars: 3 })
    );
  });
});
