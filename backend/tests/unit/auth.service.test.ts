import { UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// Mock Prisma Client - must be defined before mocking
const mockPrismaInstance = {
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
        findUnique: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn(),
    },
    passwordReset: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn(),
    },
    emailVerification: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn(),
    },
};

// Mock dependencies
jest.mock('bcryptjs');
jest.mock('crypto');
jest.mock('nodemailer', () => ({
    createTransport: jest.fn(() => ({
        sendMail: jest.fn(),
        verify: jest.fn(),
    })),
}));
jest.mock('@prisma/client', () => ({
    PrismaClient: jest.fn(() => mockPrismaInstance),
    UserRole: {
        STUDENT: 'STUDENT',
        PARENT: 'PARENT',
        ADMIN: 'ADMIN',
    },
}));
jest.mock('../../src/shared/utils/jwt.utils');
jest.mock('../../src/shared/services/email.service');

import { AuthService } from '../../src/modules/auth/auth.service';
import { generateAccessToken, generateRefreshToken } from '../../src/shared/utils/jwt.utils';
import { emailService } from '../../src/shared/services/email.service';

describe('AuthService', () => {
    let authService: AuthService;

    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();
        authService = new AuthService();
    });

    describe('register', () => {
        const registerInput = {
            email: 'test@example.com',
            password: 'Password123',
            role: UserRole.STUDENT,
            firstName: 'John',
            lastName: 'Doe',
            dateOfBirth: new Date('2010-01-01'),
            grade: 'GRADE_1',
        };

        it('should successfully register a new student user', async () => {
            const mockUser = {
                id: 'user-123',
                email: registerInput.email,
                password: 'hashed_password',
                role: 'STUDENT',
                isActive: true,
                emailVerified: false,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            const mockStudent = {
                id: 'student-123',
                userId: mockUser.id,
                firstName: 'John',
                lastName: 'Doe',
                dateOfBirth: registerInput.dateOfBirth,
                grade: 'GRADE_1',
            };

            mockPrismaInstance.user.findUnique.mockResolvedValue(null);
            (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
            mockPrismaInstance.user.create.mockResolvedValue(mockUser);
            mockPrismaInstance.student.create.mockResolvedValue(mockStudent);
            (generateAccessToken as jest.Mock).mockReturnValue('access_token');
            (generateRefreshToken as jest.Mock).mockResolvedValue('refresh_token');
            (emailService.sendVerificationEmail as jest.Mock).mockResolvedValue(undefined);

            const result = await authService.register(registerInput);

            expect(mockPrismaInstance.user.findUnique).toHaveBeenCalledWith({
                where: { email: registerInput.email },
            });
            expect(bcrypt.hash).toHaveBeenCalledWith(registerInput.password, 10);
            expect(mockPrismaInstance.user.create).toHaveBeenCalledWith({
                data: {
                    email: registerInput.email,
                    password: 'hashed_password',
                    role: 'STUDENT',
                    isActive: true,
                    emailVerified: false,
                },
            });
            expect(mockPrismaInstance.student.create).toHaveBeenCalled();
            expect(result).toEqual({
                user: mockUser,
                accessToken: 'access_token',
                refreshToken: 'refresh_token',
            });
        });

        it('should successfully register a new parent user', async () => {
            const parentInput = {
                email: 'parent@example.com',
                password: 'Password123',
                role: UserRole.PARENT,
                firstName: 'Jane',
                lastName: 'Smith',
            };

            const mockUser = {
                id: 'user-456',
                email: parentInput.email,
                password: 'hashed_password',
                role: 'PARENT',
                isActive: true,
                emailVerified: false,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            mockPrismaInstance.user.findUnique.mockResolvedValue(null);
            (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
            mockPrismaInstance.user.create.mockResolvedValue(mockUser);
            mockPrismaInstance.parent.create.mockResolvedValue({});
            (generateAccessToken as jest.Mock).mockReturnValue('access_token');
            (generateRefreshToken as jest.Mock).mockResolvedValue('refresh_token');

            const result = await authService.register(parentInput);

            expect(mockPrismaInstance.parent.create).toHaveBeenCalledWith({
                data: {
                    userId: mockUser.id,
                    firstName: parentInput.firstName,
                    lastName: parentInput.lastName,
                },
            });
            expect(result.user).toEqual(mockUser);
        });

        it('should throw error if user already exists', async () => {
            const existingUser = { id: 'user-123', email: registerInput.email };
            mockPrismaInstance.user.findUnique.mockResolvedValue(existingUser as any);

            await expect(authService.register(registerInput)).rejects.toThrow('User already exists');
            expect(mockPrismaInstance.user.create).not.toHaveBeenCalled();
        });

        it('should throw error if student registration missing dateOfBirth', async () => {
            const inputWithoutDOB = { ...registerInput, dateOfBirth: undefined };
            mockPrismaInstance.user.findUnique.mockResolvedValue(null);
            (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
            mockPrismaInstance.user.create.mockResolvedValue({ id: 'user-123' } as any);

            await expect(authService.register(inputWithoutDOB)).rejects.toThrow(
                'Date of birth is required for students'
            );
        });

        it('should continue registration even if verification email fails', async () => {
            const mockUser = { id: 'user-123', email: registerInput.email } as any;

            mockPrismaInstance.user.findUnique.mockResolvedValue(null);
            (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
            mockPrismaInstance.user.create.mockResolvedValue(mockUser);
            mockPrismaInstance.student.create.mockResolvedValue({} as any);
            (generateAccessToken as jest.Mock).mockReturnValue('access_token');
            (generateRefreshToken as jest.Mock).mockResolvedValue('refresh_token');
            (emailService.sendVerificationEmail as jest.Mock).mockRejectedValue(
                new Error('Email service error')
            );

            const result = await authService.register(registerInput);

            expect(result.user).toEqual(mockUser);
            expect(result.accessToken).toBe('access_token');
        });
    });

    describe('login', () => {
        const email = 'test@example.com';
        const password = 'Password123';

        it('should successfully login with valid credentials', async () => {
            const mockUser = {
                id: 'user-123',
                email,
                password: 'hashed_password',
                role: 'STUDENT',
                isActive: true,
            };

            mockPrismaInstance.user.findUnique.mockResolvedValue(mockUser as any);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            mockPrismaInstance.user.update.mockResolvedValue(mockUser as any);
            (generateAccessToken as jest.Mock).mockReturnValue('access_token');
            (generateRefreshToken as jest.Mock).mockResolvedValue('refresh_token');

            const result = await authService.login(email, password);

            expect(mockPrismaInstance.user.findUnique).toHaveBeenCalledWith({
                where: { email },
            });
            expect(bcrypt.compare).toHaveBeenCalledWith(password, 'hashed_password');
            expect(mockPrismaInstance.user.update).toHaveBeenCalledWith({
                where: { id: mockUser.id },
                data: { lastLoginAt: expect.any(Date) },
            });
            expect(result).toEqual({
                user: mockUser,
                accessToken: 'access_token',
                refreshToken: 'refresh_token',
            });
        });

        it('should throw error if user not found', async () => {
            mockPrismaInstance.user.findUnique.mockResolvedValue(null);

            await expect(authService.login(email, password)).rejects.toThrow('Invalid credentials');
        });

        it('should throw error if user has no password (OAuth user)', async () => {
            const mockUser = {
                id: 'user-123',
                email,
                password: null,
            };

            mockPrismaInstance.user.findUnique.mockResolvedValue(mockUser as any);

            await expect(authService.login(email, password)).rejects.toThrow(
                'Please sign in with Google'
            );
        });

        it('should throw error if password is invalid', async () => {
            const mockUser = {
                id: 'user-123',
                email,
                password: 'hashed_password',
            };

            mockPrismaInstance.user.findUnique.mockResolvedValue(mockUser as any);
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            await expect(authService.login(email, password)).rejects.toThrow('Invalid credentials');
        });

        it('should throw error if account is deactivated', async () => {
            const mockUser = {
                id: 'user-123',
                email,
                password: 'hashed_password',
                isActive: false,
            };

            mockPrismaInstance.user.findUnique.mockResolvedValue(mockUser as any);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);

            await expect(authService.login(email, password)).rejects.toThrow(
                'Account is deactivated'
            );
        });
    });

    describe('getProfile', () => {
        it('should return user profile without password', async () => {
            const userId = 'user-123';
            const mockUserWithRelations = {
                id: userId,
                email: 'test@example.com',
                role: 'STUDENT',
                isActive: true,
                emailVerified: true,
                createdAt: new Date(),
                updatedAt: new Date(),
                student: { id: 'student-123', firstName: 'John' },
                parent: null,
            };

            mockPrismaInstance.user.findUnique
                .mockResolvedValueOnce({ id: userId } as any)
                .mockResolvedValueOnce(mockUserWithRelations as any);

            const result = await authService.getProfile(userId);

            expect(result).toEqual(mockUserWithRelations);
            expect(mockPrismaInstance.user.findUnique).toHaveBeenCalledTimes(2);
        });

        it('should throw error if user not found', async () => {
            mockPrismaInstance.user.findUnique.mockResolvedValue(null);

            await expect(authService.getProfile('invalid-id')).rejects.toThrow('User not found');
        });
    });

    describe('logout', () => {
        const userId = 'user-123';

        it('should delete specific refresh token when provided', async () => {
            const refreshToken = 'specific-token';
            mockPrismaInstance.refreshToken.deleteMany.mockResolvedValue({ count: 1 } as any);

            await authService.logout(userId, refreshToken);

            expect(mockPrismaInstance.refreshToken.deleteMany).toHaveBeenCalledWith({
                where: {
                    userId,
                    token: refreshToken,
                },
            });
        });

        it('should delete all refresh tokens when token not provided', async () => {
            mockPrismaInstance.refreshToken.deleteMany.mockResolvedValue({ count: 2 } as any);

            await authService.logout(userId);

            expect(mockPrismaInstance.refreshToken.deleteMany).toHaveBeenCalledWith({
                where: { userId },
            });
        });
    });

    describe('refreshToken', () => {
        const refreshToken = 'valid-refresh-token';

        it('should successfully refresh tokens', async () => {
            const mockStoredToken = {
                id: 'token-123',
                token: refreshToken,
                userId: 'user-123',
                expiresAt: new Date(Date.now() + 86400000), // 1 day from now
                user: {
                    id: 'user-123',
                    email: 'test@example.com',
                    role: 'STUDENT',
                },
            };

            mockPrismaInstance.refreshToken.findUnique.mockResolvedValue(mockStoredToken as any);
            (generateAccessToken as jest.Mock).mockReturnValue('new_access_token');
            (generateRefreshToken as jest.Mock).mockResolvedValue('new_refresh_token');
            mockPrismaInstance.refreshToken.delete.mockResolvedValue(mockStoredToken as any);

            const result = await authService.refreshToken(refreshToken);

            expect(mockPrismaInstance.refreshToken.findUnique).toHaveBeenCalledWith({
                where: { token: refreshToken },
                include: { user: true },
            });
            expect(mockPrismaInstance.refreshToken.delete).toHaveBeenCalledWith({
                where: { id: mockStoredToken.id },
            });
            expect(result).toEqual({
                token: 'new_access_token',
                refreshToken: 'new_refresh_token',
            });
        });

        it('should throw error if token not found', async () => {
            mockPrismaInstance.refreshToken.findUnique.mockResolvedValue(null);

            await expect(authService.refreshToken('invalid-token')).rejects.toThrow(
                'Invalid refresh token'
            );
        });

        it('should throw error and delete token if expired', async () => {
            const expiredToken = {
                id: 'token-123',
                token: refreshToken,
                expiresAt: new Date(Date.now() - 1000), // 1 second ago
            };

            mockPrismaInstance.refreshToken.findUnique.mockResolvedValue(expiredToken as any);
            mockPrismaInstance.refreshToken.delete.mockResolvedValue(expiredToken as any);

            await expect(authService.refreshToken(refreshToken)).rejects.toThrow(
                'Refresh token expired'
            );
            expect(mockPrismaInstance.refreshToken.delete).toHaveBeenCalled();
        });
    });

    describe('forgotPassword', () => {
        const email = 'test@example.com';

        it('should create password reset token and send email', async () => {
            const mockUser = {
                id: 'user-123',
                email,
                student: { firstName: 'John', lastName: 'Doe' },
                parent: null,
            };

            const mockToken = 'random_token_hex';
            const mockHashedToken = 'hashed_token';

            mockPrismaInstance.user.findUnique.mockResolvedValue(mockUser as any);
            (crypto.randomBytes as jest.Mock).mockReturnValue({
                toString: jest.fn().mockReturnValue(mockToken),
            });
            (crypto.createHash as jest.Mock).mockReturnValue({
                update: jest.fn().mockReturnThis(),
                digest: jest.fn().mockReturnValue(mockHashedToken),
            } as any);
            mockPrismaInstance.passwordReset.deleteMany.mockResolvedValue({ count: 0 } as any);
            mockPrismaInstance.passwordReset.create.mockResolvedValue({} as any);
            (emailService.sendPasswordResetEmail as jest.Mock).mockResolvedValue(undefined);

            await authService.forgotPassword(email);

            expect(mockPrismaInstance.passwordReset.deleteMany).toHaveBeenCalledWith({
                where: { userId: mockUser.id },
            });
            expect(mockPrismaInstance.passwordReset.create).toHaveBeenCalledWith({
                data: {
                    token: mockHashedToken,
                    userId: mockUser.id,
                    expiresAt: expect.any(Date),
                },
            });
            expect(emailService.sendPasswordResetEmail).toHaveBeenCalledWith(
                email,
                mockToken,
                'John Doe'
            );
        });

        it('should not reveal if user does not exist', async () => {
            mockPrismaInstance.user.findUnique.mockResolvedValue(null);

            await authService.forgotPassword('nonexistent@example.com');

            expect(mockPrismaInstance.passwordReset.create).not.toHaveBeenCalled();
            expect(emailService.sendPasswordResetEmail).not.toHaveBeenCalled();
        });
    });

    describe('resetPassword', () => {
        const token = 'reset_token';
        const newPassword = 'NewPassword123';
        const hashedToken = 'hashed_reset_token';

        beforeEach(() => {
            (crypto.createHash as jest.Mock).mockReturnValue({
                update: jest.fn().mockReturnThis(),
                digest: jest.fn().mockReturnValue(hashedToken),
            } as any);
        });

        it('should successfully reset password', async () => {
            const mockResetRecord = {
                id: 'reset-123',
                token: hashedToken,
                userId: 'user-123',
                expiresAt: new Date(Date.now() + 3600000),
                usedAt: null,
                user: { id: 'user-123', email: 'test@example.com' },
            };

            mockPrismaInstance.passwordReset.findUnique.mockResolvedValue(mockResetRecord as any);
            (bcrypt.hash as jest.Mock).mockResolvedValue('new_hashed_password');
            mockPrismaInstance.user.update.mockResolvedValue({} as any);
            mockPrismaInstance.passwordReset.update.mockResolvedValue({} as any);
            mockPrismaInstance.refreshToken.deleteMany.mockResolvedValue({ count: 1 } as any);

            await authService.resetPassword(token, newPassword);

            expect(mockPrismaInstance.user.update).toHaveBeenCalledWith({
                where: { id: mockResetRecord.userId },
                data: { password: 'new_hashed_password' },
            });
            expect(mockPrismaInstance.passwordReset.update).toHaveBeenCalledWith({
                where: { id: mockResetRecord.id },
                data: { usedAt: expect.any(Date) },
            });
            expect(mockPrismaInstance.refreshToken.deleteMany).toHaveBeenCalledWith({
                where: { userId: mockResetRecord.userId },
            });
        });

        it('should throw error if token not found', async () => {
            mockPrismaInstance.passwordReset.findUnique.mockResolvedValue(null);

            await expect(authService.resetPassword(token, newPassword)).rejects.toThrow(
                'Invalid or expired reset token'
            );
        });

        it('should throw error if token already used', async () => {
            const mockResetRecord = {
                id: 'reset-123',
                usedAt: new Date(),
                expiresAt: new Date(Date.now() + 3600000),
            };

            mockPrismaInstance.passwordReset.findUnique.mockResolvedValue(mockResetRecord as any);

            await expect(authService.resetPassword(token, newPassword)).rejects.toThrow(
                'Reset token has already been used'
            );
        });

        it('should throw error if token expired', async () => {
            const mockResetRecord = {
                id: 'reset-123',
                usedAt: null,
                expiresAt: new Date(Date.now() - 1000),
            };

            mockPrismaInstance.passwordReset.findUnique.mockResolvedValue(mockResetRecord as any);
            mockPrismaInstance.passwordReset.delete.mockResolvedValue(mockResetRecord as any);

            await expect(authService.resetPassword(token, newPassword)).rejects.toThrow(
                'Reset token has expired'
            );
            expect(mockPrismaInstance.passwordReset.delete).toHaveBeenCalled();
        });

        it('should throw error if password does not meet requirements', async () => {
            const mockResetRecord = {
                id: 'reset-123',
                usedAt: null,
                expiresAt: new Date(Date.now() + 3600000),
            };

            mockPrismaInstance.passwordReset.findUnique.mockResolvedValue(mockResetRecord as any);

            await expect(authService.resetPassword(token, 'weak')).rejects.toThrow(
                'Password must be at least 8 characters with uppercase, lowercase, and number'
            );
        });
    });

    describe('changePassword', () => {
        const userId = 'user-123';
        const currentPassword = 'CurrentPassword123';
        const newPassword = 'NewPassword456';

        it('should successfully change password', async () => {
            const mockUser = {
                id: userId,
                email: 'test@example.com',
                password: 'hashed_current_password',
                student: { firstName: 'John', lastName: 'Doe' },
                parent: null,
            };

            mockPrismaInstance.user.findUnique
                .mockResolvedValueOnce(mockUser as any)
                .mockResolvedValueOnce(mockUser as any);
            (bcrypt.compare as jest.Mock)
                .mockResolvedValueOnce(true) // current password valid
                .mockResolvedValueOnce(false); // new password is different
            (bcrypt.hash as jest.Mock).mockResolvedValue('new_hashed_password');
            mockPrismaInstance.user.update.mockResolvedValue({} as any);
            mockPrismaInstance.refreshToken.deleteMany.mockResolvedValue({ count: 1 } as any);
            (emailService.sendPasswordChangedNotification as jest.Mock).mockResolvedValue(undefined);

            await authService.changePassword(userId, currentPassword, newPassword);

            expect(bcrypt.compare).toHaveBeenCalledWith(currentPassword, mockUser.password);
            expect(mockPrismaInstance.user.update).toHaveBeenCalledWith({
                where: { id: userId },
                data: { password: 'new_hashed_password' },
            });
            expect(mockPrismaInstance.refreshToken.deleteMany).toHaveBeenCalled();
            expect(emailService.sendPasswordChangedNotification).toHaveBeenCalledWith(
                mockUser.email,
                'John Doe'
            );
        });

        it('should throw error if user not found', async () => {
            mockPrismaInstance.user.findUnique.mockResolvedValue(null);

            await expect(
                authService.changePassword(userId, currentPassword, newPassword)
            ).rejects.toThrow('User not found');
        });

        it('should throw error for OAuth users with no password', async () => {
            mockPrismaInstance.user.findUnique.mockResolvedValue({ id: userId, password: null } as any);

            await expect(
                authService.changePassword(userId, currentPassword, newPassword)
            ).rejects.toThrow('Cannot change password for OAuth users');
        });

        it('should throw error if current password is incorrect', async () => {
            mockPrismaInstance.user.findUnique.mockResolvedValue({
                id: userId,
                password: 'hashed_password',
            } as any);
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            await expect(
                authService.changePassword(userId, currentPassword, newPassword)
            ).rejects.toThrow('Current password is incorrect');
        });

        it('should throw error if new password is same as current', async () => {
            mockPrismaInstance.user.findUnique.mockResolvedValue({
                id: userId,
                password: 'hashed_password',
            } as any);
            (bcrypt.compare as jest.Mock)
                .mockResolvedValueOnce(true)
                .mockResolvedValueOnce(true);

            await expect(
                authService.changePassword(userId, currentPassword, newPassword)
            ).rejects.toThrow('New password must be different from current password');
        });

        it('should throw error if new password does not meet requirements', async () => {
            mockPrismaInstance.user.findUnique.mockResolvedValue({
                id: userId,
                password: 'hashed_password',
            } as any);
            (bcrypt.compare as jest.Mock)
                .mockResolvedValueOnce(true)
                .mockResolvedValueOnce(false);

            await expect(authService.changePassword(userId, currentPassword, 'weak')).rejects.toThrow(
                'New password must be at least 8 characters with uppercase, lowercase, and number'
            );
        });
    });

    describe('verifyEmail', () => {
        const token = 'verification_token';
        const hashedToken = 'hashed_verification_token';

        beforeEach(() => {
            (crypto.createHash as jest.Mock).mockReturnValue({
                update: jest.fn().mockReturnThis(),
                digest: jest.fn().mockReturnValue(hashedToken),
            } as any);
        });

        it('should successfully verify email', async () => {
            const mockVerificationRecord = {
                id: 'verification-123',
                token: hashedToken,
                userId: 'user-123',
                expiresAt: new Date(Date.now() + 86400000),
                verifiedAt: null,
                user: { id: 'user-123', email: 'test@example.com' },
            };

            const mockUserWithProfile = {
                id: 'user-123',
                email: 'test@example.com',
                student: { firstName: 'John', lastName: 'Doe' },
                parent: null,
            };

            mockPrismaInstance.emailVerification.findUnique.mockResolvedValue(mockVerificationRecord as any);
            mockPrismaInstance.user.update.mockResolvedValue({} as any);
            mockPrismaInstance.emailVerification.update.mockResolvedValue({} as any);
            mockPrismaInstance.user.findUnique.mockResolvedValue(mockUserWithProfile as any);
            (emailService.sendWelcomeEmail as jest.Mock).mockResolvedValue(undefined);

            await authService.verifyEmail(token);

            expect(mockPrismaInstance.user.update).toHaveBeenCalledWith({
                where: { id: mockVerificationRecord.userId },
                data: { emailVerified: true },
            });
            expect(mockPrismaInstance.emailVerification.update).toHaveBeenCalledWith({
                where: { id: mockVerificationRecord.id },
                data: { verifiedAt: expect.any(Date) },
            });
            expect(emailService.sendWelcomeEmail).toHaveBeenCalledWith(
                mockUserWithProfile.email,
                'John Doe'
            );
        });

        it('should throw error if token not found', async () => {
            mockPrismaInstance.emailVerification.findUnique.mockResolvedValue(null);

            await expect(authService.verifyEmail(token)).rejects.toThrow('Invalid verification token');
        });

        it('should throw error if already verified', async () => {
            mockPrismaInstance.emailVerification.findUnique.mockResolvedValue({
                verifiedAt: new Date(),
            } as any);

            await expect(authService.verifyEmail(token)).rejects.toThrow(
                'Email has already been verified'
            );
        });

        it('should throw error if token expired', async () => {
            const expiredRecord = {
                id: 'verification-123',
                verifiedAt: null,
                expiresAt: new Date(Date.now() - 1000),
            };

            mockPrismaInstance.emailVerification.findUnique.mockResolvedValue(expiredRecord as any);
            mockPrismaInstance.emailVerification.delete.mockResolvedValue(expiredRecord as any);

            await expect(authService.verifyEmail(token)).rejects.toThrow(
                'Verification token has expired'
            );
            expect(mockPrismaInstance.emailVerification.delete).toHaveBeenCalled();
        });
    });

    describe('createVerificationToken', () => {
        const userId = 'user-123';

        it('should create verification token and return it', async () => {
            const mockUser = {
                id: userId,
                email: 'test@example.com',
                emailVerified: false,
            };

            const mockToken = 'verification_token_hex';

            mockPrismaInstance.user.findUnique.mockResolvedValue(mockUser as any);
            (crypto.randomBytes as jest.Mock).mockReturnValue({
                toString: jest.fn().mockReturnValue(mockToken),
            });
            (crypto.createHash as jest.Mock).mockReturnValue({
                update: jest.fn().mockReturnThis(),
                digest: jest.fn().mockReturnValue('hashed_token'),
            } as any);
            mockPrismaInstance.emailVerification.deleteMany.mockResolvedValue({ count: 0 } as any);
            mockPrismaInstance.emailVerification.create.mockResolvedValue({} as any);

            const result = await authService.createVerificationToken(userId);

            expect(result).toBe(mockToken);
            expect(mockPrismaInstance.emailVerification.deleteMany).toHaveBeenCalledWith({
                where: { userId },
            });
            expect(mockPrismaInstance.emailVerification.create).toHaveBeenCalled();
        });

        it('should throw error if user not found or already verified', async () => {
            mockPrismaInstance.user.findUnique.mockResolvedValue(null);

            await expect(authService.createVerificationToken(userId)).rejects.toThrow('Invalid user state');
        });

        it('should throw error if email already verified', async () => {
            mockPrismaInstance.user.findUnique.mockResolvedValue({
                id: userId,
                emailVerified: true,
            } as any);

            await expect(authService.createVerificationToken(userId)).rejects.toThrow(
                'Invalid user state'
            );
        });
    });
});
