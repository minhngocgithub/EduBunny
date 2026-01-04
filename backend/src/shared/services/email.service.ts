import nodemailer, { Transporter } from 'nodemailer';
import { logger } from '../utils/logger.utils';

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}

export class EmailService {
    private transporter: Transporter;
    private from: string;

    constructor() {
        // Create transporter with SMTP configuration
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        this.from = process.env.SMTP_FROM || 'EduForKids <noreply@eduforkids.com>';

        // Verify connection configuration
        this.verifyConnection();
    }

    private async verifyConnection(): Promise<void> {
        try {
            await this.transporter.verify();
            logger.info('Email service is ready to send emails');
        } catch (error) {
            logger.error('Email service connection failed:', error);
        }
    }

    private async sendEmail(options: EmailOptions): Promise<void> {
        try {
            const info = await this.transporter.sendMail({
                from: this.from,
                to: options.to,
                subject: options.subject,
                html: options.html,
                text: options.text,
            });

            logger.info(`Email sent successfully to ${options.to}. MessageId: ${info.messageId}`);
        } catch (error) {
            logger.error(`Failed to send email to ${options.to}:`, error);
            throw new Error('Failed to send email');
        }
    }

    async sendVerificationEmail(email: string, token: string, userName?: string): Promise<void> {
        const verificationUrl = `${process.env.FRONTEND_URL}/auth/verify-email?token=${token}`;

        const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: #ffffff; }
            .header h1 { margin: 0; font-size: 28px; }
            .content { padding: 40px 30px; }
            .content h2 { color: #667eea; margin-top: 0; }
            .button { display: inline-block; padding: 14px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
            .button:hover { opacity: 0.9; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
            .divider { border-top: 1px solid #eee; margin: 20px 0; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin: 20px 0; border-radius: 4px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎓 EduBunny </h1>
            </div>
            <div class="content">
              <h2>Xác thực email của bạn</h2>
              <p>Xin chào ${userName || 'bạn'},</p>
              <p>Cảm ơn bạn đã đăng ký tài khoản EduBunny 🐰 ! Để hoàn tất quá trình đăng ký, vui lòng xác thực địa chỉ email của bạn.</p>
              <p style="text-align: center;">
                <a href="${verificationUrl}" class="button">Xác thực Email</a>
              </p>
              <div class="divider"></div>
              <p>Hoặc copy và paste link sau vào trình duyệt:</p>
              <p style="word-break: break-all; background: #f8f9fa; padding: 10px; border-radius: 4px; font-size: 14px;">
                ${verificationUrl}
              </p>
              <div class="warning">
                <strong>⏰ Lưu ý:</strong> Link xác thực này sẽ hết hạn sau 24 giờ.
              </div>
              <p>Nếu bạn không tạo tài khoản này, vui lòng bỏ qua email này.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} EduBunny. All rights reserved.</p>
              <p>Email này được gửi tự động, vui lòng không trả lời.</p>
            </div>
          </div>
        </body>
      </html>
    `;

        const text = `
      Xác thực email của bạn
      
      Xin chào ${userName || 'bạn'},
      
      Cảm ơn bạn đã đăng ký tài khoản EduBunny 🐰!
      
      Để hoàn tất quá trình đăng ký, vui lòng click vào link sau:
      ${verificationUrl}
      
      Link này sẽ hết hạn sau 24 giờ.
      
      Nếu bạn không tạo tài khoản này, vui lòng bỏ qua email này.
      
      © ${new Date().getFullYear()} EduBunny
    `;

        await this.sendEmail({
            to: email,
            subject: '🎓 Xác thực email - EduBunny',
            html,
            text,
        });
    }

    async sendPasswordResetEmail(email: string, token: string, userName?: string): Promise<void> {
        const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password?token=${token}`;

        const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px; text-align: center; color: #ffffff; }
            .header h1 { margin: 0; font-size: 28px; }
            .content { padding: 40px 30px; }
            .content h2 { color: #f5576c; margin-top: 0; }
            .button { display: inline-block; padding: 14px 30px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
            .button:hover { opacity: 0.9; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
            .divider { border-top: 1px solid #eee; margin: 20px 0; }
            .warning { background: #f8d7da; border-left: 4px solid #dc3545; padding: 12px; margin: 20px 0; border-radius: 4px; }
            .info { background: #d1ecf1; border-left: 4px solid #17a2b8; padding: 12px; margin: 20px 0; border-radius: 4px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 EduBunny</h1>
            </div>
            <div class="content">
              <h2>Đặt lại mật khẩu</h2>
              <p>Xin chào ${userName || 'bạn'},</p>
              <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
              <p style="text-align: center;">
                <a href="${resetUrl}" class="button">Đặt lại mật khẩu</a>
              </p>
              <div class="divider"></div>
              <p>Hoặc copy và paste link sau vào trình duyệt:</p>
              <p style="word-break: break-all; background: #f8f9fa; padding: 10px; border-radius: 4px; font-size: 14px;">
                ${resetUrl}
              </p>
              <div class="warning">
                <strong>⏰ Lưu ý:</strong> Link đặt lại mật khẩu này sẽ hết hạn sau 1 giờ.
              </div>
              <div class="info">
                <strong>🔒 Bảo mật:</strong> Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này. Tài khoản của bạn vẫn an toàn.
              </div>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} EduBunny. All rights reserved.</p>
              <p>Email này được gửi tự động, vui lòng không trả lời.</p>
            </div>
          </div>
        </body>
      </html>
    `;

        const text = `
      Đặt lại mật khẩu
      
      Xin chào ${userName || 'bạn'},
      
      Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.
      
      Để đặt lại mật khẩu, vui lòng click vào link sau:
      ${resetUrl}
      
      Link này sẽ hết hạn sau 1 giờ.
      
      Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.
      
      © ${new Date().getFullYear()} EduBunny
    `;

        await this.sendEmail({
            to: email,
            subject: '🔐 Đặt lại mật khẩu - EduBunny',
            html,
            text,
        });
    }

    async sendWelcomeEmail(email: string, userName: string): Promise<void> {
        const dashboardUrl = `${process.env.FRONTEND_URL}/dashboard`;

        const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to EduBunny</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 40px; text-align: center; color: #ffffff; }
            .header h1 { margin: 0; font-size: 32px; }
            .content { padding: 40px 30px; }
            .content h2 { color: #4facfe; margin-top: 0; }
            .button { display: inline-block; padding: 14px 30px; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
            .button:hover { opacity: 0.9; }
            .features { margin: 30px 0; }
            .feature { padding: 15px; margin: 10px 0; background: #f8f9fa; border-radius: 5px; }
            .feature h3 { margin-top: 0; color: #4facfe; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Chào mừng đến với EduBunny!</h1>
            </div>
            <div class="content">
              <h2>Xin chào ${userName}!</h2>
              <p>Chào mừng bạn đến với cộng đồng học tập EduBunny 🐰! Chúng tôi rất vui khi bạn tham gia.</p>
              <p>EduBunny là nền tảng học tập trực tuyến dành cho trẻ em với nhiều khóa học thú vị và trò chơi giáo dục.</p>
              
              <div class="features">
                <div class="feature">
                  <h3>📚 Khóa học đa dạng</h3>
                  <p>Hàng trăm khóa học về Toán, Tiếng Việt, Tiếng Anh, Khoa học và nhiều môn học khác.</p>
                </div>
                <div class="feature">
                  <h3>🎮 Học qua trò chơi</h3>
                  <p>Trải nghiệm học tập vui vẻ qua các trò chơi giáo dục tương tác.</p>
                </div>
                <div class="feature">
                  <h3>🏆 Hệ thống thành tích</h3>
                  <p>Nhận điểm kinh nghiệm, huy chương và leo rank khi hoàn thành bài học.</p>
                </div>
              </div>

              <p style="text-align: center;">
                <a href="${dashboardUrl}" class="button">Bắt đầu học ngay</a>
              </p>
              
              <p>Nếu bạn có bất kỳ câu hỏi nào, đừng ngần ngại liên hệ với chúng tôi!</p>
              <p>Chúc bạn có những trải nghiệm học tập tuyệt vời! 🌟</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} EduBunny. All rights reserved.</p>
              <p>Liên hệ: support@edubunny.com</p>
            </div>
          </div>
        </body>
      </html>
    `;

        const text = `
      Chào mừng đến với EduBunny 🐰!
      
      Xin chào ${userName}!
      
      Chào mừng bạn đến với cộng đồng học tập EduBunny 🐰!
      
      EduForKids là nền tảng học tập trực tuyến dành cho trẻ em với nhiều khóa học thú vị và trò chơi giáo dục.
      
      Bắt đầu học ngay: ${dashboardUrl}
      
      Chúc bạn có những trải nghiệm học tập tuyệt vời!
      
      © ${new Date().getFullYear()} EduBunny
    `;

        await this.sendEmail({
            to: email,
            subject: '🎉 Chào mừng đến với EduBunny 🐰!',
            html,
            text,
        });
    }

    async sendPasswordChangedNotification(email: string, userName?: string): Promise<void> {
        const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Changed</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); padding: 30px; text-align: center; color: #ffffff; }
            .header h1 { margin: 0; font-size: 28px; }
            .content { padding: 40px 30px; }
            .content h2 { color: #43e97b; margin-top: 0; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin: 20px 0; border-radius: 4px; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1> EduBunny 🐰</h1>
            </div>
            <div class="content">
              <h2>Mật khẩu đã được thay đổi</h2>
              <p>Xin chào ${userName || 'bạn'},</p>
              <p>Mật khẩu cho tài khoản của bạn đã được thay đổi thành công vào lúc ${new Date().toLocaleString('vi-VN')}.</p>
              <div class="warning">
                <strong>⚠️ Lưu ý bảo mật:</strong> Nếu bạn không thực hiện thay đổi này, vui lòng liên hệ với chúng tôi ngay lập tức để bảo vệ tài khoản của bạn.
              </div>
              <p>Email: support@eduforkids.com</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} EduBunny. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

        const text = `
      Mật khẩu đã được thay đổi
      
      Xin chào ${userName || 'bạn'},
      
      Mật khẩu cho tài khoản của bạn đã được thay đổi thành công.
      
      Nếu bạn không thực hiện thay đổi này, vui lòng liên hệ ngay: support@edubunny.com
      
      © ${new Date().getFullYear()} EduBunny
    `;

        await this.sendEmail({
            to: email,
            subject: '✅ Mật khẩu đã được thay đổi - EduBunny',
            html,
            text,
        });
    }
}

export const emailService = new EmailService();
