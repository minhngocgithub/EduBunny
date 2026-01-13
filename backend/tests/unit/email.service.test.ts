import { EmailService } from '@/shared/services/email.service';
import nodemailer from 'nodemailer';

// Mock nodemailer
jest.mock('nodemailer', () => ({
    createTransport: jest.fn(() => ({
        verify: jest.fn().mockResolvedValue(true),
        sendMail: jest.fn().mockResolvedValue({
            messageId: 'test-message-id',
            accepted: ['test@example.com'],
            rejected: [],
        }),
    })),
}));

// Mock logger
jest.mock('@/shared/utils/logger.utils', () => ({
    logger: {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
    },
}));

describe('Email Service Unit Tests', () => {
    let emailService: EmailService;
    let mockTransporter: any;

    beforeEach(() => {
        jest.clearAllMocks();

        // Set up environment variables for testing
        process.env.SMTP_HOST = 'smtp.test.com';
        process.env.SMTP_PORT = '587';
        process.env.SMTP_USER = 'test@example.com';
        process.env.SMTP_PASS = 'test-password';
        process.env.SMTP_FROM = 'EduBunny <test@edubunny.com>';
        process.env.FRONTEND_URL = 'http://localhost:3000';

        // Create new instance to reset state
        emailService = new EmailService();
        mockTransporter = (nodemailer.createTransport as jest.Mock).mock.results[0].value;
    });

    afterEach(() => {
        delete process.env.SMTP_HOST;
        delete process.env.SMTP_PORT;
        delete process.env.SMTP_USER;
        delete process.env.SMTP_PASS;
        delete process.env.SMTP_FROM;
        delete process.env.FRONTEND_URL;
    });

    describe('sendVerificationEmail', () => {
        it('should send verification email successfully', async () => {
            const email = 'test@example.com';
            const token = 'verification-token-123';
            const userName = 'Test User';

            await emailService.sendVerificationEmail(email, token, userName);

            expect(mockTransporter.sendMail).toHaveBeenCalledTimes(1);
            const sendMailCall = mockTransporter.sendMail.mock.calls[0][0];

            expect(sendMailCall.to).toBe(email);
            expect(sendMailCall.subject).toBe('🎓 Xác thực email - EduBunny');
            expect(sendMailCall.html).toContain(userName);
            expect(sendMailCall.html).toContain(token);
            expect(sendMailCall.html).toContain('Xác thực email');
            expect(sendMailCall.text).toBeDefined();
        });

        it('should send verification email without userName', async () => {
            const email = 'test@example.com';
            const token = 'verification-token-456';

            await emailService.sendVerificationEmail(email, token);

            expect(mockTransporter.sendMail).toHaveBeenCalledTimes(1);
            const sendMailCall = mockTransporter.sendMail.mock.calls[0][0];

            expect(sendMailCall.to).toBe(email);
            expect(sendMailCall.html).toContain('bạn'); // Default greeting
            expect(sendMailCall.html).toContain(token);
        });

        it('should include verification URL with token', async () => {
            const email = 'test@example.com';
            const token = 'test-verification-token';
            const expectedUrl = `${process.env.FRONTEND_URL}/auth/verify-email?token=${token}`;

            await emailService.sendVerificationEmail(email, token);

            const sendMailCall = mockTransporter.sendMail.mock.calls[0][0];
            expect(sendMailCall.html).toContain(expectedUrl);
            expect(sendMailCall.text).toContain(expectedUrl);
        });

        it('should handle email sending failure', async () => {
            const email = 'test@example.com';
            const token = 'verification-token';
            const errorMessage = 'SMTP connection failed';

            mockTransporter.sendMail.mockRejectedValueOnce(new Error(errorMessage));

            await expect(
                emailService.sendVerificationEmail(email, token)
            ).rejects.toThrow('Failed to send email');
        });
    });

    describe('sendPasswordResetEmail', () => {
        it('should send password reset email successfully', async () => {
            const email = 'reset@example.com';
            const token = 'reset-token-123';
            const userName = 'Reset User';

            await emailService.sendPasswordResetEmail(email, token, userName);

            expect(mockTransporter.sendMail).toHaveBeenCalledTimes(1);
            const sendMailCall = mockTransporter.sendMail.mock.calls[0][0];

            expect(sendMailCall.to).toBe(email);
            expect(sendMailCall.subject).toBe('🔐 Đặt lại mật khẩu - EduBunny');
            expect(sendMailCall.html).toContain(userName);
            expect(sendMailCall.html).toContain(token);
            expect(sendMailCall.html).toContain('Đặt lại mật khẩu');
            expect(sendMailCall.text).toBeDefined();
        });

        it('should include reset URL with token', async () => {
            const email = 'reset@example.com';
            const token = 'test-reset-token';
            const expectedUrl = `${process.env.FRONTEND_URL}/auth/reset-password?token=${token}`;

            await emailService.sendPasswordResetEmail(email, token);

            const sendMailCall = mockTransporter.sendMail.mock.calls[0][0];
            expect(sendMailCall.html).toContain(expectedUrl);
            expect(sendMailCall.text).toContain(expectedUrl);
        });

        it('should include expiration warning', async () => {
            const email = 'reset@example.com';
            const token = 'reset-token';

            await emailService.sendPasswordResetEmail(email, token);

            const sendMailCall = mockTransporter.sendMail.mock.calls[0][0];
            expect(sendMailCall.html).toContain('1 giờ');
            expect(sendMailCall.text).toContain('1 giờ');
        });

        it('should handle email sending failure', async () => {
            const email = 'reset@example.com';
            const token = 'reset-token';

            mockTransporter.sendMail.mockRejectedValueOnce(new Error('SMTP error'));

            await expect(
                emailService.sendPasswordResetEmail(email, token)
            ).rejects.toThrow('Failed to send email');
        });
    });

    describe('sendWelcomeEmail', () => {
        it('should send welcome email successfully', async () => {
            const email = 'welcome@example.com';
            const userName = 'Welcome User';

            await emailService.sendWelcomeEmail(email, userName);

            expect(mockTransporter.sendMail).toHaveBeenCalledTimes(1);
            const sendMailCall = mockTransporter.sendMail.mock.calls[0][0];

            expect(sendMailCall.to).toBe(email);
            expect(sendMailCall.subject).toBe('🎉 Chào mừng đến với EduBunny 🐰!');
            expect(sendMailCall.html).toContain(userName);
            expect(sendMailCall.html).toContain('Chào mừng');
            expect(sendMailCall.html).toContain('Khóa học đa dạng');
            expect(sendMailCall.html).toContain('Học qua trò chơi');
            expect(sendMailCall.html).toContain('Hệ thống thành tích');
            expect(sendMailCall.text).toBeDefined();
        });

        it('should include dashboard URL', async () => {
            const email = 'welcome@example.com';
            const userName = 'Test User';
            const expectedUrl = `${process.env.FRONTEND_URL}/dashboard`;

            await emailService.sendWelcomeEmail(email, userName);

            const sendMailCall = mockTransporter.sendMail.mock.calls[0][0];
            expect(sendMailCall.html).toContain(expectedUrl);
            expect(sendMailCall.text).toContain(expectedUrl);
        });

        it('should handle email sending failure', async () => {
            const email = 'welcome@example.com';
            const userName = 'Test User';

            mockTransporter.sendMail.mockRejectedValueOnce(new Error('SMTP error'));

            await expect(
                emailService.sendWelcomeEmail(email, userName)
            ).rejects.toThrow('Failed to send email');
        });
    });

    describe('sendPasswordChangedNotification', () => {
        it('should send password changed notification successfully', async () => {
            const email = 'changed@example.com';
            const userName = 'Changed User';

            await emailService.sendPasswordChangedNotification(email, userName);

            expect(mockTransporter.sendMail).toHaveBeenCalledTimes(1);
            const sendMailCall = mockTransporter.sendMail.mock.calls[0][0];

            expect(sendMailCall.to).toBe(email);
            expect(sendMailCall.subject).toBe('✅ Mật khẩu đã được thay đổi - EduBunny');
            expect(sendMailCall.html).toContain(userName);
            expect(sendMailCall.html).toContain('Mật khẩu đã được thay đổi');
            expect(sendMailCall.text).toBeDefined();
        });

        it('should send notification without userName', async () => {
            const email = 'changed@example.com';

            await emailService.sendPasswordChangedNotification(email);

            const sendMailCall = mockTransporter.sendMail.mock.calls[0][0];
            expect(sendMailCall.to).toBe(email);
            expect(sendMailCall.html).toContain('bạn');
        });

        it('should include security warning', async () => {
            const email = 'changed@example.com';

            await emailService.sendPasswordChangedNotification(email);

            const sendMailCall = mockTransporter.sendMail.mock.calls[0][0];
            expect(sendMailCall.html).toContain('Lưu ý bảo mật');
        });

        it('should handle email sending failure', async () => {
            const email = 'changed@example.com';

            mockTransporter.sendMail.mockRejectedValueOnce(new Error('SMTP error'));

            await expect(
                emailService.sendPasswordChangedNotification(email)
            ).rejects.toThrow('Failed to send email');
        });
    });

    describe('Email Service Configuration', () => {
        it('should use default SMTP settings when env vars not set', () => {
            delete process.env.SMTP_HOST;
            delete process.env.SMTP_PORT;
            delete process.env.SMTP_USER;
            delete process.env.SMTP_PASS;
            delete process.env.SMTP_FROM;

            new EmailService(); // Test default configuration

            expect(nodemailer.createTransport).toHaveBeenCalled();
        });

        it('should use custom SMTP settings from env vars', () => {
            process.env.SMTP_HOST = 'smtp.custom.com';
            process.env.SMTP_PORT = '465';
            process.env.SMTP_SECURE = 'true';
            process.env.SMTP_USER = 'custom@example.com';
            process.env.SMTP_PASS = 'custom-password';
            process.env.SMTP_FROM = 'Custom <custom@example.com>';

            new EmailService(); // Test custom configuration

            expect(nodemailer.createTransport).toHaveBeenCalledWith(
                expect.objectContaining({
                    host: 'smtp.custom.com',
                    port: 465,
                    secure: true,
                    auth: {
                        user: 'custom@example.com',
                        pass: 'custom-password',
                    },
                })
            );
        });

        it('should verify connection on initialization', async () => {
            await new Promise(resolve => setTimeout(resolve, 100)); // Wait for async verify

            expect(mockTransporter.verify).toHaveBeenCalled();
        });
    });
});

