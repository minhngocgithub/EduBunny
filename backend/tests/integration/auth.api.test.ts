import request from 'supertest';
import app from '@/server';
import bcrypt from 'bcryptjs';
import { generateAccessToken } from '@/shared/utils/jwt.utils';
import { emailService } from '@/shared/services/email.service';

// Mock Prisma Client
const mockPrisma: any = {
    user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
    },
    student: {
        create: jest.fn(),
    },
    parent: {
        create: jest.fn(),
    },
    refreshToken: {
        create: jest.fn(),
        findUnique: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn(),
    },
    emailVerification: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
    },
    passwordReset: {
        create: jest.fn(),
        findUnique: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn(),
    },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $transaction: jest.fn(),
};

// Setup transaction to call callback with mockPrisma
(mockPrisma.$transaction as jest.Mock).mockImplementation((callback: any) => {
    return Promise.resolve(callback(mockPrisma));
});

jest.mock('@prisma/client', () => ({
    PrismaClient: jest.fn(() => mockPrisma),
}));

// Mock Email Service
jest.mock('@/shared/services/email.service', () => ({
    emailService: {
        sendVerificationEmail: jest.fn(),
        sendPasswordResetEmail: jest.fn(),
        sendWelcomeEmail: jest.fn(),
        sendPasswordChangedNotification: jest.fn(),
    },
}));

describe('Auth API Integration Tests', () => {
    const API_PREFIX = process.env.API_PREFIX || '/api';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /auth/register', () => {
        it('should register a new student successfully', async () => {
            const registerData = {
                email: 'newstudent@test.com',
                password: 'Test1234@',
                role: 'STUDENT',
                firstName: 'John',
                lastName: 'Doe',
                dateOfBirth: '2015-01-01',
                grade: 'GRADE_1',
            };

            const mockUser = {
                id: 'user-123',
                email: registerData.email,
                password: 'hashed_password',
                role: 'STUDENT',
                isActive: true,
                emailVerified: false,
                createdAt: new Date(),
                updatedAt: new Date(),
                lastLoginAt: null,
                deletedAt: null,
                googleId: null,
            };

            const mockStudent = {
                id: 'student-123',
                userId: 'user-123',
                firstName: 'John',
                lastName: 'Doe',
                dateOfBirth: new Date('2015-01-01'),
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
            };

            (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);
            (mockPrisma.user.create as jest.Mock).mockResolvedValue(mockUser);
            (mockPrisma.student.create as jest.Mock).mockResolvedValue(mockStudent);
            (mockPrisma.emailVerification.create as jest.Mock).mockResolvedValue({
                id: 'verification-123',
                userId: 'user-123',
                token: 'verification-token',
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            });
            (mockPrisma.refreshToken.create as jest.Mock).mockResolvedValue({
                id: 'refresh-123',
                userId: 'user-123',
                token: 'refresh-token',
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            });

            const response = await request(app)
                .post(`${API_PREFIX}/auth/register`)
                .send(registerData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data.user.email).toBe(registerData.email);
            expect(response.body.data.user.role).toBe('STUDENT');
            expect(response.body.data.accessToken).toBeDefined();
            expect(response.body.data.refreshToken).toBeDefined();
            expect(emailService.sendVerificationEmail).toHaveBeenCalled();
        });

        it('should register a new parent successfully', async () => {
            const registerData = {
                email: 'newparent@test.com',
                password: 'Test1234@',
                role: 'PARENT',
                firstName: 'Jane',
                lastName: 'Doe',
            };

            const mockUser = {
                id: 'user-456',
                email: registerData.email,
                password: 'hashed_password',
                role: 'PARENT',
                isActive: true,
                emailVerified: false,
                createdAt: new Date(),
                updatedAt: new Date(),
                lastLoginAt: null,
                deletedAt: null,
                googleId: null,
            };

            const mockParent = {
                id: 'parent-123',
                userId: 'user-456',
                firstName: 'Jane',
                lastName: 'Doe',
                email: null,
                phone: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);
            (mockPrisma.user.create as jest.Mock).mockResolvedValue(mockUser);
            (mockPrisma.parent.create as jest.Mock).mockResolvedValue(mockParent);
            (mockPrisma.emailVerification.create as jest.Mock).mockResolvedValue({
                id: 'verification-456',
                userId: 'user-456',
                token: 'verification-token',
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            });
            (mockPrisma.refreshToken.create as jest.Mock).mockResolvedValue({
                id: 'refresh-456',
                userId: 'user-456',
                token: 'refresh-token',
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            });

            const response = await request(app)
                .post(`${API_PREFIX}/auth/register`)
                .send(registerData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data.user.email).toBe(registerData.email);
            expect(response.body.data.user.role).toBe('PARENT');
            expect(emailService.sendVerificationEmail).toHaveBeenCalled();
        });

        it('should fail to register with existing email', async () => {
            const registerData = {
                email: 'existing@test.com',
                password: 'Test1234@',
                role: 'STUDENT',
            };

            (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({
                id: 'user-existing',
                email: registerData.email,
            });

            const response = await request(app)
                .post(`${API_PREFIX}/auth/register`)
                .send(registerData)
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('already exists');
        });

        it('should fail with invalid password', async () => {
            const registerData = {
                email: 'test@test.com',
                password: 'weak',
                role: 'STUDENT',
            };

            const response = await request(app)
                .post(`${API_PREFIX}/auth/register`)
                .send(registerData)
                .expect(400);

            expect(response.body.success).toBe(false);
        });
    });

    describe('POST /auth/login', () => {
        it('should login successfully with correct credentials', async () => {
            const loginData = {
                email: 'student@test.com',
                password: 'Test1234@',
            };

            const hashedPassword = await bcrypt.hash(loginData.password, 10);
            const mockUser = {
                id: 'user-login-123',
                email: loginData.email,
                password: hashedPassword,
                role: 'STUDENT',
                isActive: true,
                emailVerified: true,
                createdAt: new Date(),
                updatedAt: new Date(),
                lastLoginAt: null,
                deletedAt: null,
                googleId: null,
            };

            (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
            (mockPrisma.user.update as jest.Mock).mockResolvedValue({
                ...mockUser,
                lastLoginAt: new Date(),
            });
            (mockPrisma.refreshToken.create as jest.Mock).mockResolvedValue({
                id: 'refresh-login-123',
                userId: 'user-login-123',
                token: 'refresh-token',
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            });

            const response = await request(app)
                .post(`${API_PREFIX}/auth/login`)
                .send(loginData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.user.email).toBe(loginData.email);
            expect(response.body.data.accessToken).toBeDefined();
            expect(response.body.data.refreshToken).toBeDefined();
        });

        it('should fail with incorrect password', async () => {
            const loginData = {
                email: 'student@test.com',
                password: 'WrongPassword123@',
            };

            const hashedPassword = await bcrypt.hash('Test1234@', 10);
            const mockUser = {
                id: 'user-login-123',
                email: loginData.email,
                password: hashedPassword,
                role: 'STUDENT',
                isActive: true,
                emailVerified: true,
                createdAt: new Date(),
                updatedAt: new Date(),
                lastLoginAt: null,
                deletedAt: null,
                googleId: null,
            };

            (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

            const response = await request(app)
                .post(`${API_PREFIX}/auth/login`)
                .send(loginData)
                .expect(401);

            expect(response.body.success).toBe(false);
        });

        it('should fail with non-existent email', async () => {
            const loginData = {
                email: 'nonexistent@test.com',
                password: 'Test1234@',
            };

            (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);

            const response = await request(app)
                .post(`${API_PREFIX}/auth/login`)
                .send(loginData)
                .expect(401);

            expect(response.body.success).toBe(false);
        });
    });

    describe('GET /auth/profile', () => {
        it('should get profile successfully with valid token', async () => {
            const mockUser = {
                id: 'user-profile-123',
                email: 'profile@test.com',
                role: 'STUDENT',
                isActive: true,
                emailVerified: true,
                createdAt: new Date(),
                updatedAt: new Date(),
                lastLoginAt: null,
                deletedAt: null,
                googleId: null,
            };

            const mockStudent = {
                id: 'student-profile-123',
                userId: 'user-profile-123',
                firstName: 'John',
                lastName: 'Doe',
                dateOfBirth: new Date('2015-01-01'),
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
            };

            const token = generateAccessToken({
                userId: mockUser.id,
                email: mockUser.email,
                role: mockUser.role as any,
            });

            (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({
                ...mockUser,
                student: mockStudent,
                parent: null,
            });

            const response = await request(app)
                .get(`${API_PREFIX}/auth/profile`)
                .set('Authorization', `Bearer ${token}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.email).toBe(mockUser.email);
        });

        it('should fail without token', async () => {
            const response = await request(app)
                .get(`${API_PREFIX}/auth/profile`)
                .expect(401);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('token');
        });
    });

    describe('POST /auth/logout', () => {
        it('should logout successfully', async () => {
            const mockUser = {
                id: 'user-logout-123',
                email: 'logout@test.com',
                role: 'STUDENT' as const,
            };

            const token = generateAccessToken({
                userId: mockUser.id,
                email: mockUser.email,
                role: mockUser.role,
            });

            const refreshToken = 'refresh-token-to-delete';
            (mockPrisma.refreshToken.findUnique as jest.Mock).mockResolvedValue({
                id: 'refresh-logout-123',
                userId: mockUser.id,
                token: refreshToken,
            });
            (mockPrisma.refreshToken.delete as jest.Mock).mockResolvedValue({});

            const response = await request(app)
                .post(`${API_PREFIX}/auth/logout`)
                .set('Authorization', `Bearer ${token}`)
                .send({ refreshToken })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain('successfully');
        });
    });

    describe('POST /auth/forgot-password', () => {
        it('should send password reset email for existing user', async () => {
            const email = 'reset@test.com';
            const mockUser = {
                id: 'user-reset-123',
                email,
                role: 'STUDENT',
                isActive: true,
                emailVerified: true,
            };

            (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({
                ...mockUser,
                student: null,
                parent: null,
            });
            (mockPrisma.passwordReset.create as jest.Mock).mockResolvedValue({
                id: 'reset-123',
                userId: mockUser.id,
                token: 'reset-token',
                expiresAt: new Date(Date.now() + 60 * 60 * 1000),
            });

            const response = await request(app)
                .post(`${API_PREFIX}/auth/forgot-password`)
                .send({ email })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(emailService.sendPasswordResetEmail).toHaveBeenCalled();
        });

        it('should not reveal if email does not exist', async () => {
            const email = 'nonexistent@test.com';

            (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);

            const response = await request(app)
                .post(`${API_PREFIX}/auth/forgot-password`)
                .send({ email })
                .expect(200);

            // Should still return success to prevent email enumeration
            expect(response.body.success).toBe(true);
            expect(emailService.sendPasswordResetEmail).not.toHaveBeenCalled();
        });
    });
});

