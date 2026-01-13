import { Grade } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Mock Prisma Client - must be defined before mocking
const mockPrismaInstance = {
    user: {
        findUnique: jest.fn(),
        update: jest.fn(),
    },
    student: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
    },
    parent: {
        findUnique: jest.fn(),
        update: jest.fn(),
    },
};

// Mock dependencies
jest.mock('bcryptjs');
jest.mock('@prisma/client', () => ({
    PrismaClient: jest.fn(() => mockPrismaInstance),
    Prisma: {
        JsonNull: null,
    },
    Grade: {
        GRADE_1: 'GRADE_1',
        GRADE_2: 'GRADE_2',
        GRADE_3: 'GRADE_3',
        GRADE_4: 'GRADE_4',
        GRADE_5: 'GRADE_5',
        GRADE_6: 'GRADE_6',
    },
}));

import { UserService } from '../../src/modules/user/user.service';

describe('UserService', () => {
    let userService: UserService;

    beforeEach(() => {
        jest.clearAllMocks();
        userService = new UserService();
    });

    describe('getUserProfile', () => {
        it('should return user profile with relations', async () => {
            const userId = 'user-123';
            const mockUser = {
                id: userId,
                email: 'test@example.com',
                role: 'STUDENT',
                isActive: true,
                emailVerified: true,
                createdAt: new Date(),
                updatedAt: new Date(),
                student: {
                    id: 'student-123',
                    firstName: 'John',
                    lastName: 'Doe',
                    parent: null,
                },
                parent: null,
            };

            mockPrismaInstance.user.findUnique.mockResolvedValue(mockUser as any);

            const result = await userService.getUserProfile(userId);

            expect(mockPrismaInstance.user.findUnique).toHaveBeenCalledWith({
                where: { id: userId },
                include: {
                    student: {
                        include: {
                            parent: true,
                        },
                    },
                    parent: {
                        include: {
                            children: true,
                        },
                    },
                },
            });
            expect(result).toEqual(mockUser);
        });

        it('should throw error if user not found', async () => {
            mockPrismaInstance.user.findUnique.mockResolvedValue(null);

            await expect(userService.getUserProfile('invalid-id')).rejects.toThrow('User not found');
        });
    });

    describe('updateUser', () => {
        const userId = 'user-123';

        it('should successfully update user', async () => {
            const updateInput = { email: 'newemail@example.com' };
            const mockUpdatedUser = {
                id: userId,
                email: updateInput.email,
                student: null,
                parent: null,
            };

            mockPrismaInstance.user.findUnique.mockResolvedValue(null);
            mockPrismaInstance.user.update.mockResolvedValue(mockUpdatedUser as any);

            const result = await userService.updateUser(userId, updateInput);

            expect(mockPrismaInstance.user.findUnique).toHaveBeenCalledWith({
                where: { email: updateInput.email },
            });
            expect(mockPrismaInstance.user.update).toHaveBeenCalledWith({
                where: { id: userId },
                data: updateInput,
                include: {
                    student: true,
                    parent: true,
                },
            });
            expect(result).toEqual(mockUpdatedUser);
        });

        it('should throw error if email already in use by another user', async () => {
            const updateInput = { email: 'existing@example.com' };
            const existingUser = { id: 'other-user-123', email: updateInput.email };

            mockPrismaInstance.user.findUnique.mockResolvedValue(existingUser as any);

            await expect(userService.updateUser(userId, updateInput)).rejects.toThrow(
                'Email already in use'
            );
            expect(mockPrismaInstance.user.update).not.toHaveBeenCalled();
        });

        it('should allow updating email to same email', async () => {
            const updateInput = { email: 'same@example.com' };
            const sameUser = { id: userId, email: updateInput.email };
            const mockUpdatedUser = { ...sameUser, student: null, parent: null };

            mockPrismaInstance.user.findUnique.mockResolvedValue(sameUser as any);
            mockPrismaInstance.user.update.mockResolvedValue(mockUpdatedUser as any);

            const result = await userService.updateUser(userId, updateInput);

            expect(result).toEqual(mockUpdatedUser);
        });
    });

    describe('getStudentProfile', () => {
        const userId = 'user-123';

        it('should return student profile with parent', async () => {
            const mockStudent = {
                id: 'student-123',
                userId,
                firstName: 'John',
                lastName: 'Doe',
                grade: 'GRADE_1',
                xp: 100,
                level: 1,
                streak: 5,
                parent: {
                    id: 'parent-123',
                    firstName: 'Jane',
                    lastName: 'Doe',
                },
            };

            mockPrismaInstance.student.findUnique.mockResolvedValue(mockStudent as any);

            const result = await userService.getStudentProfile(userId);

            expect(mockPrismaInstance.student.findUnique).toHaveBeenCalledWith({
                where: { userId },
                include: {
                    parent: true,
                },
            });
            expect(result).toEqual(mockStudent);
        });

        it('should throw error if student profile not found', async () => {
            mockPrismaInstance.student.findUnique.mockResolvedValue(null);

            await expect(userService.getStudentProfile(userId)).rejects.toThrow(
                'Student profile not found'
            );
        });
    });

    describe('updateStudentProfile', () => {
        const userId = 'user-123';

        it('should successfully update student profile', async () => {
            const updateInput = {
                firstName: 'Jane',
                lastName: 'Smith',
                grade: Grade.GRADE_2,
            };
            const mockStudent = { id: 'student-123', userId };
            const mockUpdatedStudent = {
                ...mockStudent,
                ...updateInput,
                parent: null,
            };

            mockPrismaInstance.student.findUnique.mockResolvedValue(mockStudent as any);
            mockPrismaInstance.student.update.mockResolvedValue(mockUpdatedStudent as any);

            const result = await userService.updateStudentProfile(userId, updateInput);

            expect(mockPrismaInstance.student.update).toHaveBeenCalledWith({
                where: { userId },
                data: {
                    ...updateInput,
                    preferences: undefined,
                },
                include: {
                    parent: true,
                },
            });
            expect(result).toEqual(mockUpdatedStudent);
        });

        it('should throw error if student not found', async () => {
            mockPrismaInstance.student.findUnique.mockResolvedValue(null);

            await expect(
                userService.updateStudentProfile(userId, { firstName: 'Jane' })
            ).rejects.toThrow('Student profile not found');
        });
    });

    describe('getStudentStatistics', () => {
        const userId = 'user-123';

        it('should calculate and return student statistics', async () => {
            const mockStudent = {
                id: 'student-123',
                userId,
                xp: 500,
                level: 5,
                streak: 7,
                lastActiveDate: new Date(),
                enrollments: [
                    { id: '1', completedAt: new Date(), course: { id: 'c1' } },
                    { id: '2', completedAt: null, course: { id: 'c2' } },
                    { id: '3', completedAt: new Date(), course: { id: 'c3' } },
                ],
                quizAttempts: [
                    { id: 'q1', score: 80 },
                    { id: 'q2', score: 90 },
                    { id: 'q3', score: 70 },
                ],
                gameScores: [
                    { id: 'g1', score: 100 },
                    { id: 'g2', score: 150 },
                ],
                achievements: [
                    { id: 'a1' },
                    { id: 'a2' },
                    { id: 'a3' },
                ],
                progress: [
                    { id: 'p1', watchedSeconds: 300 },
                    { id: 'p2', watchedSeconds: 600 },
                ],
            };

            mockPrismaInstance.student.findUnique.mockResolvedValue(mockStudent as any);

            const result = await userService.getStudentStatistics(userId);

            expect(result).toEqual({
                totalXp: 500,
                currentLevel: 5,
                currentStreak: 7,
                coursesEnrolled: 3,
                coursesCompleted: 2,
                quizzesTaken: 3,
                averageQuizScore: 80,
                gamesPlayed: 2,
                achievementsUnlocked: 3,
                totalStudyTime: 15, // (300 + 600) / 60
                lastActiveDate: mockStudent.lastActiveDate,
            });
        });

        it('should handle student with no activities', async () => {
            const mockStudent = {
                id: 'student-123',
                userId,
                xp: 0,
                level: 1,
                streak: 0,
                lastActiveDate: null,
                enrollments: [],
                quizAttempts: [],
                gameScores: [],
                achievements: [],
                progress: [],
            };

            mockPrismaInstance.student.findUnique.mockResolvedValue(mockStudent as any);

            const result = await userService.getStudentStatistics(userId);

            expect(result).toEqual({
                totalXp: 0,
                currentLevel: 1,
                currentStreak: 0,
                coursesEnrolled: 0,
                coursesCompleted: 0,
                quizzesTaken: 0,
                averageQuizScore: 0,
                gamesPlayed: 0,
                achievementsUnlocked: 0,
                totalStudyTime: 0,
                lastActiveDate: null,
            });
        });

        it('should throw error if student not found', async () => {
            mockPrismaInstance.student.findUnique.mockResolvedValue(null);

            await expect(userService.getStudentStatistics(userId)).rejects.toThrow(
                'Student profile not found'
            );
        });
    });

    describe('getLevelProgress', () => {
        const userId = 'user-123';

        it('should calculate level progress correctly', async () => {
            const mockStudent = {
                id: 'student-123',
                userId,
                level: 5,
                xp: 350,
            };

            mockPrismaInstance.student.findUnique.mockResolvedValue(mockStudent as any);

            const result = await userService.getLevelProgress(userId);

            expect(result).toEqual({
                currentLevel: 5,
                currentXp: 350,
                xpForNextLevel: 500, // level * 100
                progressPercentage: 70, // (350 / 500) * 100
            });
        });

        it('should cap progress percentage at 100', async () => {
            const mockStudent = {
                id: 'student-123',
                userId,
                level: 3,
                xp: 500,
            };

            mockPrismaInstance.student.findUnique.mockResolvedValue(mockStudent as any);

            const result = await userService.getLevelProgress(userId);

            expect(result.progressPercentage).toBe(100);
        });

        it('should throw error if student not found', async () => {
            mockPrismaInstance.student.findUnique.mockResolvedValue(null);

            await expect(userService.getLevelProgress(userId)).rejects.toThrow(
                'Student profile not found'
            );
        });
    });

    describe('updateStreak', () => {
        const userId = 'user-123';

        it('should start streak on first activity', async () => {
            const mockStudent = {
                id: 'student-123',
                userId,
                streak: 0,
                lastActiveDate: null,
            };

            mockPrismaInstance.student.findUnique.mockResolvedValue(mockStudent as any);
            mockPrismaInstance.student.update.mockResolvedValue({} as any);

            await userService.updateStreak(userId);

            expect(mockPrismaInstance.student.update).toHaveBeenCalledWith({
                where: { userId },
                data: {
                    streak: 1,
                    lastActiveDate: expect.any(Date),
                },
            });
        });

        it('should increment streak for consecutive day', async () => {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            const mockStudent = {
                id: 'student-123',
                userId,
                streak: 5,
                lastActiveDate: yesterday,
            };

            mockPrismaInstance.student.findUnique.mockResolvedValue(mockStudent as any);
            mockPrismaInstance.student.update.mockResolvedValue({} as any);

            await userService.updateStreak(userId);

            expect(mockPrismaInstance.student.update).toHaveBeenCalledWith({
                where: { userId },
                data: {
                    streak: 6,
                    lastActiveDate: expect.any(Date),
                },
            });
        });

        it('should not update streak if already active today', async () => {
            const today = new Date();

            const mockStudent = {
                id: 'student-123',
                userId,
                streak: 5,
                lastActiveDate: today,
            };

            mockPrismaInstance.student.findUnique.mockResolvedValue(mockStudent as any);

            await userService.updateStreak(userId);

            expect(mockPrismaInstance.student.update).not.toHaveBeenCalled();
        });

        it('should reset streak if broken', async () => {
            const threeDaysAgo = new Date();
            threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

            const mockStudent = {
                id: 'student-123',
                userId,
                streak: 10,
                lastActiveDate: threeDaysAgo,
            };

            mockPrismaInstance.student.findUnique.mockResolvedValue(mockStudent as any);
            mockPrismaInstance.student.update.mockResolvedValue({} as any);

            await userService.updateStreak(userId);

            expect(mockPrismaInstance.student.update).toHaveBeenCalledWith({
                where: { userId },
                data: {
                    streak: 1,
                    lastActiveDate: expect.any(Date),
                },
            });
        });

        it('should throw error if student not found', async () => {
            mockPrismaInstance.student.findUnique.mockResolvedValue(null);

            await expect(userService.updateStreak(userId)).rejects.toThrow(
                'Student profile not found'
            );
        });
    });

    describe('addXp', () => {
        const userId = 'user-123';

        it('should add XP without leveling up', async () => {
            const mockStudent = {
                id: 'student-123',
                userId,
                level: 5,
                xp: 200,
            };

            mockPrismaInstance.student.findUnique.mockResolvedValue(mockStudent as any);
            mockPrismaInstance.student.update.mockResolvedValue({
                ...mockStudent,
                xp: 250,
            } as any);

            await userService.addXp(userId, 50);

            expect(mockPrismaInstance.student.update).toHaveBeenCalledWith({
                where: { userId },
                data: {
                    xp: 250,
                    level: 5,
                },
            });
        });

        it('should add XP and level up', async () => {
            const mockStudent = {
                id: 'student-123',
                userId,
                level: 5,
                xp: 480,
            };

            mockPrismaInstance.student.findUnique.mockResolvedValue(mockStudent as any);
            mockPrismaInstance.student.update.mockResolvedValue({
                ...mockStudent,
                xp: 530,
                level: 6,
            } as any);

            await userService.addXp(userId, 50);

            expect(mockPrismaInstance.student.update).toHaveBeenCalledWith({
                where: { userId },
                data: {
                    xp: 530,
                    level: 6,
                },
            });
        });

        it('should throw error if student not found', async () => {
            mockPrismaInstance.student.findUnique.mockResolvedValue(null);

            await expect(userService.addXp(userId, 50)).rejects.toThrow('Student profile not found');
        });
    });

    describe('getParentProfile', () => {
        const userId = 'user-123';

        it('should return parent profile with children', async () => {
            const mockParent = {
                id: 'parent-123',
                userId,
                firstName: 'Jane',
                lastName: 'Doe',
                children: [
                    { id: 'child-1', firstName: 'John' },
                    { id: 'child-2', firstName: 'Alice' },
                ],
            };

            mockPrismaInstance.parent.findUnique.mockResolvedValue(mockParent as any);

            const result = await userService.getParentProfile(userId);

            expect(mockPrismaInstance.parent.findUnique).toHaveBeenCalledWith({
                where: { userId },
                include: {
                    children: true,
                },
            });
            expect(result).toEqual(mockParent);
        });

        it('should throw error if parent not found', async () => {
            mockPrismaInstance.parent.findUnique.mockResolvedValue(null);

            await expect(userService.getParentProfile(userId)).rejects.toThrow(
                'Parent profile not found'
            );
        });
    });

    describe('updateParentProfile', () => {
        const userId = 'user-123';

        it('should successfully update parent profile', async () => {
            const updateInput = {
                firstName: 'Jane',
                lastName: 'Smith',
            };
            const mockParent = { id: 'parent-123', userId };
            const mockUpdatedParent = {
                ...mockParent,
                ...updateInput,
                children: [],
            };

            mockPrismaInstance.parent.findUnique.mockResolvedValue(mockParent as any);
            mockPrismaInstance.parent.update.mockResolvedValue(mockUpdatedParent as any);

            const result = await userService.updateParentProfile(userId, updateInput);

            expect(mockPrismaInstance.parent.update).toHaveBeenCalledWith({
                where: { userId },
                data: updateInput,
                include: {
                    children: true,
                },
            });
            expect(result).toEqual(mockUpdatedParent);
        });

        it('should throw error if email already in use', async () => {
            const updateInput = { email: 'existing@example.com' };
            const mockParent = { id: 'parent-123', userId };
            const existingParent = { id: 'other-parent', email: updateInput.email };

            mockPrismaInstance.parent.findUnique
                .mockResolvedValueOnce(mockParent as any)
                .mockResolvedValueOnce(existingParent as any);

            await expect(userService.updateParentProfile(userId, updateInput)).rejects.toThrow(
                'Email already in use'
            );
        });

        it('should throw error if phone already in use', async () => {
            const updateInput = { phone: '1234567890' };
            const mockParent = { id: 'parent-123', userId };
            const existingParent = { id: 'other-parent', phone: updateInput.phone };

            mockPrismaInstance.parent.findUnique
                .mockResolvedValueOnce(mockParent as any)
                .mockResolvedValueOnce(existingParent as any);

            await expect(userService.updateParentProfile(userId, updateInput)).rejects.toThrow(
                'Phone number already in use'
            );
        });

        it('should throw error if parent not found', async () => {
            mockPrismaInstance.parent.findUnique.mockResolvedValueOnce(null);

            await expect(
                userService.updateParentProfile(userId, { firstName: 'Jane' })
            ).rejects.toThrow('Parent profile not found');
        });
    });

    describe('linkChild', () => {
        const parentUserId = 'parent-user-123';
        const childId = 'child-123';

        it('should successfully link child to parent', async () => {
            const mockParent = { id: 'parent-123', userId: parentUserId };
            const mockChild = { id: childId, parentId: null };

            mockPrismaInstance.parent.findUnique.mockResolvedValue(mockParent as any);
            mockPrismaInstance.student.findUnique.mockResolvedValue(mockChild as any);
            mockPrismaInstance.student.update.mockResolvedValue({} as any);

            await userService.linkChild(parentUserId, childId);

            expect(mockPrismaInstance.student.update).toHaveBeenCalledWith({
                where: { id: childId },
                data: {
                    parentId: mockParent.id,
                },
            });
        });

        it('should allow linking child already linked to same parent', async () => {
            const mockParent = { id: 'parent-123', userId: parentUserId };
            const mockChild = { id: childId, parentId: 'parent-123' };

            mockPrismaInstance.parent.findUnique.mockResolvedValue(mockParent as any);
            mockPrismaInstance.student.findUnique.mockResolvedValue(mockChild as any);
            mockPrismaInstance.student.update.mockResolvedValue({} as any);

            await userService.linkChild(parentUserId, childId);

            expect(mockPrismaInstance.student.update).toHaveBeenCalled();
        });

        it('should throw error if parent not found', async () => {
            mockPrismaInstance.parent.findUnique.mockResolvedValue(null);

            await expect(userService.linkChild(parentUserId, childId)).rejects.toThrow(
                'Parent profile not found'
            );
        });

        it('should throw error if student not found', async () => {
            mockPrismaInstance.parent.findUnique.mockResolvedValue({ id: 'parent-123' } as any);
            mockPrismaInstance.student.findUnique.mockResolvedValue(null);

            await expect(userService.linkChild(parentUserId, childId)).rejects.toThrow(
                'Student not found'
            );
        });

        it('should throw error if student already has different parent', async () => {
            const mockParent = { id: 'parent-123', userId: parentUserId };
            const mockChild = { id: childId, parentId: 'other-parent-456' };

            mockPrismaInstance.parent.findUnique.mockResolvedValue(mockParent as any);
            mockPrismaInstance.student.findUnique.mockResolvedValue(mockChild as any);

            await expect(userService.linkChild(parentUserId, childId)).rejects.toThrow(
                'Student already has a parent'
            );
        });
    });

    describe('unlinkChild', () => {
        const parentUserId = 'parent-user-123';
        const childId = 'child-123';

        it('should successfully unlink child from parent', async () => {
            const mockParent = { id: 'parent-123', userId: parentUserId };
            const mockChild = { id: childId, parentId: 'parent-123' };

            mockPrismaInstance.parent.findUnique.mockResolvedValue(mockParent as any);
            mockPrismaInstance.student.findUnique.mockResolvedValue(mockChild as any);
            mockPrismaInstance.student.update.mockResolvedValue({} as any);

            await userService.unlinkChild(parentUserId, childId);

            expect(mockPrismaInstance.student.update).toHaveBeenCalledWith({
                where: { id: childId },
                data: {
                    parentId: null,
                },
            });
        });

        it('should throw error if parent not found', async () => {
            mockPrismaInstance.parent.findUnique.mockResolvedValue(null);

            await expect(userService.unlinkChild(parentUserId, childId)).rejects.toThrow(
                'Parent profile not found'
            );
        });

        it('should throw error if student not found', async () => {
            mockPrismaInstance.parent.findUnique.mockResolvedValue({ id: 'parent-123' } as any);
            mockPrismaInstance.student.findUnique.mockResolvedValue(null);

            await expect(userService.unlinkChild(parentUserId, childId)).rejects.toThrow(
                'Student not found'
            );
        });

        it('should throw error if student not linked to parent', async () => {
            const mockParent = { id: 'parent-123', userId: parentUserId };
            const mockChild = { id: childId, parentId: 'other-parent-456' };

            mockPrismaInstance.parent.findUnique.mockResolvedValue(mockParent as any);
            mockPrismaInstance.student.findUnique.mockResolvedValue(mockChild as any);

            await expect(userService.unlinkChild(parentUserId, childId)).rejects.toThrow(
                'Student is not linked to this parent'
            );
        });
    });

    describe('getLeaderboard', () => {
        it('should return leaderboard with default parameters', async () => {
            const mockStudents = [
                { id: 's1', firstName: 'Alice', lastName: 'A', avatar: null, xp: 1000, level: 10 },
                { id: 's2', firstName: 'Bob', lastName: 'B', avatar: null, xp: 900, level: 9 },
                { id: 's3', firstName: 'Charlie', lastName: 'C', avatar: null, xp: 800, level: 8 },
            ];

            mockPrismaInstance.student.findMany.mockResolvedValue(mockStudents as any);

            const result = await userService.getLeaderboard({});

            expect(result).toEqual([
                {
                    rank: 1,
                    student: { id: 's1', firstName: 'Alice', lastName: 'A', avatar: null },
                    xp: 1000,
                    level: 10,
                },
                {
                    rank: 2,
                    student: { id: 's2', firstName: 'Bob', lastName: 'B', avatar: null },
                    xp: 900,
                    level: 9,
                },
                {
                    rank: 3,
                    student: { id: 's3', firstName: 'Charlie', lastName: 'C', avatar: null },
                    xp: 800,
                    level: 8,
                },
            ]);
        });

        it('should filter by grade', async () => {
            mockPrismaInstance.student.findMany.mockResolvedValue([]);

            await userService.getLeaderboard({ grade: 'GRADE_1' });

            expect(mockPrismaInstance.student.findMany).toHaveBeenCalledWith({
                where: { grade: 'GRADE_1' },
                orderBy: [{ xp: 'desc' }, { level: 'desc' }],
                take: 10,
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    avatar: true,
                    xp: true,
                    level: true,
                },
            });
        });

        it('should filter by weekly timeframe', async () => {
            mockPrismaInstance.student.findMany.mockResolvedValue([]);

            await userService.getLeaderboard({ timeframe: 'weekly' });

            const call = (mockPrismaInstance.student.findMany as jest.Mock).mock.calls[0][0];
            expect(call.where.lastActiveDate.gte).toBeInstanceOf(Date);
        });

        it('should filter by monthly timeframe', async () => {
            mockPrismaInstance.student.findMany.mockResolvedValue([]);

            await userService.getLeaderboard({ timeframe: 'monthly' });

            const call = (mockPrismaInstance.student.findMany as jest.Mock).mock.calls[0][0];
            expect(call.where.lastActiveDate.gte).toBeInstanceOf(Date);
        });

        it('should respect custom limit', async () => {
            mockPrismaInstance.student.findMany.mockResolvedValue([]);

            await userService.getLeaderboard({ limit: 5 });

            expect(mockPrismaInstance.student.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    take: 5,
                })
            );
        });
    });

    describe('deleteAccount', () => {
        const userId = 'user-123';
        const password = 'Password123';

        it('should soft delete account with valid password', async () => {
            const mockUser = {
                id: userId,
                email: 'test@example.com',
                password: 'hashed_password',
            };

            mockPrismaInstance.user.findUnique.mockResolvedValue(mockUser as any);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            mockPrismaInstance.user.update.mockResolvedValue({} as any);

            await userService.deleteAccount(userId, password);

            expect(bcrypt.compare).toHaveBeenCalledWith(password, mockUser.password);
            expect(mockPrismaInstance.user.update).toHaveBeenCalledWith({
                where: { id: userId },
                data: {
                    deletedAt: expect.any(Date),
                    isActive: false,
                },
            });
        });

        it('should allow deletion for OAuth users without password verification', async () => {
            const mockUser = {
                id: userId,
                email: 'test@example.com',
                password: null,
            };

            mockPrismaInstance.user.findUnique.mockResolvedValue(mockUser as any);
            mockPrismaInstance.user.update.mockResolvedValue({} as any);

            await userService.deleteAccount(userId, '');

            expect(bcrypt.compare).not.toHaveBeenCalled();
            expect(mockPrismaInstance.user.update).toHaveBeenCalled();
        });

        it('should throw error if user not found', async () => {
            mockPrismaInstance.user.findUnique.mockResolvedValue(null);

            await expect(userService.deleteAccount(userId, password)).rejects.toThrow(
                'User not found'
            );
        });

        it('should throw error if password is invalid', async () => {
            const mockUser = {
                id: userId,
                password: 'hashed_password',
            };

            mockPrismaInstance.user.findUnique.mockResolvedValue(mockUser as any);
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            await expect(userService.deleteAccount(userId, password)).rejects.toThrow(
                'Invalid password'
            );
            expect(mockPrismaInstance.user.update).not.toHaveBeenCalled();
        });
    });
});
