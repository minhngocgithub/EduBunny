import request from 'supertest';
import app from '@/server';
import bcrypt from 'bcryptjs';
import { generateAccessToken } from '@/shared/utils/jwt.utils';

// Mock Prisma Client
const mockPrisma: any = {
    user: {
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
    student: {
        findUnique: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
    },
    parent: {
        findUnique: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
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

describe('User API Integration Tests', () => {
    const API_PREFIX = process.env.API_PREFIX || '/api';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /users/profile', () => {
        it('should get user profile successfully', async () => {
            const mockUser = {
                id: 'user-profile-123',
                email: 'user@test.com',
                role: 'STUDENT' as const,
                isActive: true,
                emailVerified: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            const mockStudent = {
                id: 'student-123',
                userId: 'user-profile-123',
                firstName: 'John',
                lastName: 'Doe',
                dateOfBirth: new Date('2015-01-01'),
                grade: 'GRADE_1',
                avatar: null,
                xp: 100,
                level: 2,
                streak: 5,
                lastActiveDate: new Date(),
                preferences: null,
                parentId: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            const token = generateAccessToken({
                userId: mockUser.id,
                email: mockUser.email,
                role: mockUser.role,
            });

            (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({
                ...mockUser,
                student: mockStudent,
                parent: null,
            });

            const response = await request(app)
                .get(`${API_PREFIX}/users/profile`)
                .set('Authorization', `Bearer ${token}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.email).toBe(mockUser.email);
            expect(response.body.data.student).toBeDefined();
        });

        it('should fail without authentication', async () => {
            const response = await request(app)
                .get(`${API_PREFIX}/users/profile`)
                .expect(401);

            expect(response.body.success).toBe(false);
        });
    });

    describe('PATCH /users/profile', () => {
        it('should update user profile successfully', async () => {
            const mockUser = {
                id: 'user-update-123',
                email: 'update@test.com',
                role: 'STUDENT' as const,
                isActive: true,
                emailVerified: true,
            };

            const token = generateAccessToken({
                userId: mockUser.id,
                email: mockUser.email,
                role: mockUser.role,
            });

            const updateData = {
                email: 'newemail@test.com',
            };

            (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
            (mockPrisma.user.update as jest.Mock).mockResolvedValue({
                ...mockUser,
                ...updateData,
            });

            const response = await request(app)
                .patch(`${API_PREFIX}/users/profile`)
                .set('Authorization', `Bearer ${token}`)
                .send(updateData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain('updated');
        });
    });

    describe('GET /users/student/profile', () => {
        it('should get student profile successfully', async () => {
            const mockUser = {
                id: 'user-student-123',
                email: 'student@test.com',
                role: 'STUDENT' as const,
            };

            const mockStudent = {
                id: 'student-profile-123',
                userId: 'user-student-123',
                firstName: 'John',
                lastName: 'Doe',
                dateOfBirth: new Date('2015-01-01'),
                grade: 'GRADE_1',
                avatar: 'https://example.com/avatar.jpg',
                xp: 500,
                level: 3,
                streak: 10,
                lastActiveDate: new Date(),
                preferences: { theme: 'light' },
                parentId: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            const token = generateAccessToken({
                userId: mockUser.id,
                email: mockUser.email,
                role: mockUser.role,
            });

            (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
            (mockPrisma.student.findUnique as jest.Mock).mockResolvedValue(mockStudent);

            const response = await request(app)
                .get(`${API_PREFIX}/users/student/profile`)
                .set('Authorization', `Bearer ${token}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.firstName).toBe(mockStudent.firstName);
            expect(response.body.data.xp).toBe(mockStudent.xp);
        });

        it('should fail if user is not a student', async () => {
            const mockUser = {
                id: 'user-parent-123',
                email: 'parent@test.com',
                role: 'PARENT' as const,
            };

            const token = generateAccessToken({
                userId: mockUser.id,
                email: mockUser.email,
                role: mockUser.role,
            });

            (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

            const response = await request(app)
                .get(`${API_PREFIX}/users/student/profile`)
                .set('Authorization', `Bearer ${token}`)
                .expect(403);

            expect(response.body.success).toBe(false);
        });
    });

    describe('PATCH /users/student/profile', () => {
        it('should update student profile successfully', async () => {
            const mockUser = {
                id: 'user-student-update-123',
                email: 'student@test.com',
                role: 'STUDENT' as const,
            };

            const mockStudent = {
                id: 'student-update-123',
                userId: 'user-student-update-123',
                firstName: 'John',
                lastName: 'Doe',
                dateOfBirth: new Date('2015-01-01'),
                grade: 'GRADE_1',
                avatar: null,
                xp: 100,
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
                role: mockUser.role,
            });

            const updateData = {
                firstName: 'Jane',
                lastName: 'Smith',
                grade: 'GRADE_2',
            };

            (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
            (mockPrisma.student.findUnique as jest.Mock).mockResolvedValue(mockStudent);
            (mockPrisma.student.update as jest.Mock).mockResolvedValue({
                ...mockStudent,
                ...updateData,
            });

            const response = await request(app)
                .patch(`${API_PREFIX}/users/student/profile`)
                .set('Authorization', `Bearer ${token}`)
                .send(updateData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.firstName).toBe(updateData.firstName);
        });
    });

    describe('GET /users/student/statistics', () => {
        it('should get student statistics successfully', async () => {
            const mockUser = {
                id: 'user-stats-123',
                email: 'stats@test.com',
                role: 'STUDENT' as const,
            };

            const token = generateAccessToken({
                userId: mockUser.id,
                email: mockUser.email,
                role: mockUser.role,
            });

            (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
            (mockPrisma.student.findUnique as jest.Mock).mockResolvedValue({
                id: 'student-stats-123',
                userId: mockUser.id,
                xp: 1000,
                level: 5,
                streak: 15,
            });

            const response = await request(app)
                .get(`${API_PREFIX}/users/student/statistics`)
                .set('Authorization', `Bearer ${token}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
        });
    });

    describe('POST /users/student/xp', () => {
        it('should add XP successfully', async () => {
            const mockUser = {
                id: 'user-xp-123',
                email: 'xp@test.com',
                role: 'STUDENT' as const,
            };

            const mockStudent = {
                id: 'student-xp-123',
                userId: 'user-xp-123',
                xp: 100,
                level: 1,
            };

            const token = generateAccessToken({
                userId: mockUser.id,
                email: mockUser.email,
                role: mockUser.role,
            });

            (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
            (mockPrisma.student.findUnique as jest.Mock).mockResolvedValue(mockStudent);
            (mockPrisma.student.update as jest.Mock).mockResolvedValue({
                ...mockStudent,
                xp: 250, // 100 + 150
            });

            const response = await request(app)
                .post(`${API_PREFIX}/users/student/xp`)
                .set('Authorization', `Bearer ${token}`)
                .send({ xpAmount: 150 })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain('150');
        });
    });

    describe('GET /users/parent/profile', () => {
        it('should get parent profile successfully', async () => {
            const mockUser = {
                id: 'user-parent-123',
                email: 'parent@test.com',
                role: 'PARENT' as const,
            };

            const mockParent = {
                id: 'parent-profile-123',
                userId: 'user-parent-123',
                firstName: 'Jane',
                lastName: 'Doe',
                email: 'parent@example.com',
                phone: '0123456789',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            const token = generateAccessToken({
                userId: mockUser.id,
                email: mockUser.email,
                role: mockUser.role,
            });

            (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
            (mockPrisma.parent.findUnique as jest.Mock).mockResolvedValue(mockParent);

            const response = await request(app)
                .get(`${API_PREFIX}/users/parent/profile`)
                .set('Authorization', `Bearer ${token}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.firstName).toBe(mockParent.firstName);
        });
    });

    describe('PATCH /users/parent/profile', () => {
        it('should update parent profile successfully', async () => {
            const mockUser = {
                id: 'user-parent-update-123',
                email: 'parent@test.com',
                role: 'PARENT' as const,
            };

            const mockParent = {
                id: 'parent-update-123',
                userId: 'user-parent-update-123',
                firstName: 'Jane',
                lastName: 'Doe',
                email: null,
                phone: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            const token = generateAccessToken({
                userId: mockUser.id,
                email: mockUser.email,
                role: mockUser.role,
            });

            const updateData = {
                firstName: 'Jane',
                lastName: 'Smith',
                phone: '0987654321',
            };

            (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
            (mockPrisma.parent.findUnique as jest.Mock).mockResolvedValue(mockParent);
            (mockPrisma.parent.update as jest.Mock).mockResolvedValue({
                ...mockParent,
                ...updateData,
            });

            const response = await request(app)
                .patch(`${API_PREFIX}/users/parent/profile`)
                .set('Authorization', `Bearer ${token}`)
                .send(updateData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.lastName).toBe(updateData.lastName);
        });
    });

    describe('POST /users/parent/link-child', () => {
        it('should link child successfully', async () => {
            const mockUser = {
                id: 'user-parent-link-123',
                email: 'parent@test.com',
                role: 'PARENT' as const,
            };

            const mockParent = {
                id: 'parent-link-123',
                userId: 'user-parent-link-123',
            };

            const childId = 'child-123';

            const token = generateAccessToken({
                userId: mockUser.id,
                email: mockUser.email,
                role: mockUser.role,
            });

            (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
            (mockPrisma.parent.findUnique as jest.Mock).mockResolvedValue(mockParent);
            (mockPrisma.student.findUnique as jest.Mock).mockResolvedValue({
                id: childId,
                parentId: null,
            });
            (mockPrisma.student.update as jest.Mock).mockResolvedValue({
                id: childId,
                parentId: mockParent.id,
            });

            const response = await request(app)
                .post(`${API_PREFIX}/users/parent/link-child`)
                .set('Authorization', `Bearer ${token}`)
                .send({ childId })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain('linked');
        });
    });

    describe('GET /users/leaderboard', () => {
        it('should get leaderboard successfully', async () => {
            const mockLeaderboard = [
                {
                    student: {
                        firstName: 'Student1',
                        lastName: 'Doe',
                        xp: 1000,
                        level: 5,
                    },
                },
                {
                    student: {
                        firstName: 'Student2',
                        lastName: 'Smith',
                        xp: 800,
                        level: 4,
                    },
                },
            ];

            (mockPrisma.student.findMany as jest.Mock).mockResolvedValue(mockLeaderboard);

            const response = await request(app)
                .get(`${API_PREFIX}/users/leaderboard`)
                .query({ limit: 10 })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
        });

        it('should filter leaderboard by grade', async () => {
            (mockPrisma.student.findMany as jest.Mock).mockResolvedValue([]);

            const response = await request(app)
                .get(`${API_PREFIX}/users/leaderboard`)
                .query({ grade: 'GRADE_1', limit: 10 })
                .expect(200);

            expect(response.body.success).toBe(true);
        });
    });

    describe('DELETE /users/account', () => {
        it('should delete account successfully with correct password', async () => {
            const mockUser = {
                id: 'user-delete-123',
                email: 'delete@test.com',
                password: await bcrypt.hash('Test1234@', 10),
                role: 'STUDENT' as const,
            };

            const token = generateAccessToken({
                userId: mockUser.id,
                email: mockUser.email,
                role: mockUser.role,
            });

            (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
            (mockPrisma.user.delete as jest.Mock).mockResolvedValue({});

            const response = await request(app)
                .delete(`${API_PREFIX}/users/account`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    password: 'Test1234@',
                    confirmation: 'DELETE',
                })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain('deleted');
        });

        it('should fail with incorrect password', async () => {
            const mockUser = {
                id: 'user-delete-123',
                email: 'delete@test.com',
                password: await bcrypt.hash('Test1234@', 10),
                role: 'STUDENT' as const,
            };

            const token = generateAccessToken({
                userId: mockUser.id,
                email: mockUser.email,
                role: mockUser.role,
            });

            (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

            const response = await request(app)
                .delete(`${API_PREFIX}/users/account`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    password: 'WrongPassword123@',
                    confirmation: 'DELETE',
                })
                .expect(401);

            expect(response.body.success).toBe(false);
        });
    });
});

