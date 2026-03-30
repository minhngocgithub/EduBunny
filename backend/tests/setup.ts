// Global test setup and utilities
import { PrismaClient } from '@prisma/client';

// Mock console methods to reduce test output noise
global.console = {
    ...console,
    error: jest.fn(),
    warn: jest.fn(),
    log: jest.fn(),
};

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key-for-testing-only';
process.env.FRONTEND_URL = 'http://localhost:3000';

// Mock Prisma Client globally
jest.mock('@prisma/client', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mockPrismaClient: any = {
        user: {
            findUnique: jest.fn(),
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            deleteMany: jest.fn(),
        },
        student: {
            findUnique: jest.fn(),
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            deleteMany: jest.fn(),
        },
        parent: {
            findUnique: jest.fn(),
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            deleteMany: jest.fn(),
        },
        refreshToken: {
            findUnique: jest.fn(),
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            deleteMany: jest.fn(),
        },
        passwordReset: {
            findUnique: jest.fn(),
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            deleteMany: jest.fn(),
        },
        emailVerification: {
            findUnique: jest.fn(),
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            deleteMany: jest.fn(),
        },
        course: {
            findUnique: jest.fn(),
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
        lecture: {
            findUnique: jest.fn(),
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
        quiz: {
            findUnique: jest.fn(),
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
        game: {
            findUnique: jest.fn(),
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
        $connect: jest.fn(),
        $disconnect: jest.fn(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        $transaction: jest.fn((callback: any): any => callback(mockPrismaClient)),
    };

    return {
        PrismaClient: jest.fn(() => mockPrismaClient),
        UserRole: {
            ADMIN: 'ADMIN',
            STUDENT: 'STUDENT',
            PARENT: 'PARENT',
        },
        QuestionType: {
            MULTIPLE_CHOICE: 'MULTIPLE_CHOICE',
            TRUE_FALSE: 'TRUE_FALSE',
            FILL_BLANK: 'FILL_BLANK',
            SHORT_ANSWER: 'SHORT_ANSWER',
        },
    };
});

// Utility function to create mock dates
export const mockDate = (dateString: string): Date => {
    return new Date(dateString);
};

// Utility function to create mock user
export const createMockUser = (overrides = {}) => ({
    id: 'user-123',
    email: 'test@example.com',
    password: 'hashed_password',
    role: 'STUDENT',
    isActive: true,
    emailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastLoginAt: null,
    deletedAt: null,
    googleId: null,
    ...overrides,
});

// Utility function to create mock student
export const createMockStudent = (overrides = {}) => ({
    id: 'student-123',
    userId: 'user-123',
    firstName: 'John',
    lastName: 'Doe',
    dateOfBirth: new Date('2010-01-01'),
    grade: 'GRADE_1',
    avatar: null,
    xp: 0,
    level: 1,
    streak: 0,
    lastActiveDate: null,
    preferences: null,
    parentId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
});

// Utility function to create mock parent
export const createMockParent = (overrides = {}) => ({
    id: 'parent-123',
    userId: 'user-123',
    firstName: 'Jane',
    lastName: 'Doe',
    email: null,
    phone: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
});

// Utility to reset all mocks between tests
export const resetAllMocks = () => {
    jest.clearAllMocks();
};

// Type helper for mocking Prisma
export type MockPrisma = {
    [K in keyof PrismaClient]: PrismaClient[K] extends { findUnique: any }
    ? jest.Mocked<PrismaClient[K]>
    : PrismaClient[K];
};

