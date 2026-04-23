import { emailService } from './email.service';
import { logger } from '../utils/logger.utils';
import { PrismaClient, NotificationType } from '@prisma/client';

const prisma = new PrismaClient();

interface DailyReportData {
    childName: string;
    parentEmail: string;
    date: string;
    coursesAccessed: number;
    lecturesCompleted: number;
    timeSpentLearning: number; // in minutes
    quizScores: Array<{ quizTitle: string; score: number }>;
    achievementsUnlocked: Array<{ title: string }>;
}

interface WeeklyReportData {
    childName: string;
    parentEmail: string;
    weekStart: string;
    weekEnd: string;
    statistics: {
        totalTimeSpent: number;
        coursesCompleted: number;
        lecturesCompleted: number;
        quizzesTaken: number;
        averageQuizScore: number;
        achievementsUnlocked: number;
        currentStreak: number;
    };
    progressTrends: Array<{ date: string; timeSpent: number; lecturesCompleted: number }>;
    strengths: Array<{ subject: string; averageScore: number }>;
    weaknesses: Array<{ subject: string; averageScore: number }>;
    recommendations: string[];
    comparison: {
        previousWeek: {
            timeSpent: number;
            lecturesCompleted: number;
        };
        change: {
            timeSpent: number;
            lecturesCompleted: number;
        };
    };
}

interface EntitlementExpiryNotificationData {
  userId: string;
  userEmail?: string | null;
  studentName?: string | null;
  courseTitle: string;
  courseSlug?: string | null;
  entitlementId: string;
  expiresAt: Date;
  daysRemaining: number;
}

export class NotificationService {
    async sendDailyProgressEmail(data: DailyReportData): Promise<void> {
        const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Daily Progress Report</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: #ffffff; }
            .header h1 { margin: 0; font-size: 24px; }
            .content { padding: 30px; }
            .stat { background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 5px; display: flex; justify-content: space-between; }
            .stat-label { font-weight: bold; color: #667eea; }
            .stat-value { color: #333; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📊 Báo cáo tiến độ hàng ngày</h1>
            </div>
            <div class="content">
              <h2>Xin chào,</h2>
              <p>Đây là báo cáo tiến độ học tập hàng ngày của <strong>${data.childName}</strong> cho ngày ${data.date}.</p>
              
              <div class="stat">
                <span class="stat-label">Khóa học đã truy cập:</span>
                <span class="stat-value">${data.coursesAccessed}</span>
              </div>
              
              <div class="stat">
                <span class="stat-label">Bài giảng đã hoàn thành:</span>
                <span class="stat-value">${data.lecturesCompleted}</span>
              </div>
              
              <div class="stat">
                <span class="stat-label">Thời gian học tập:</span>
                <span class="stat-value">${data.timeSpentLearning} phút</span>
              </div>
              
              ${data.achievementsUnlocked.length > 0 ? `
              <h3>🏆 Thành tích đã đạt được:</h3>
              <ul>
                ${data.achievementsUnlocked.map(a => `<li>${a.title}</li>`).join('')}
              </ul>
              ` : ''}
              
              ${data.quizScores.length > 0 ? `
              <h3>📝 Điểm kiểm tra:</h3>
              <ul>
                ${data.quizScores.map(q => `<li>${q.quizTitle}: ${q.score}%</li>`).join('')}
              </ul>
              ` : ''}
              
              <p>Tiếp tục động viên ${data.childName} học tập nhé! 🌟</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} EduBunny. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

        const text = `
      Báo cáo tiến độ hàng ngày - ${data.childName}
      Ngày: ${data.date}
      
      Khóa học đã truy cập: ${data.coursesAccessed}
      Bài giảng đã hoàn thành: ${data.lecturesCompleted}
      Thời gian học tập: ${data.timeSpentLearning} phút
      
      ${data.achievementsUnlocked.length > 0 ? `Thành tích: ${data.achievementsUnlocked.map(a => a.title).join(', ')}` : ''}
    `;

        try {
            await emailService.sendEmail({
                to: data.parentEmail,
                subject: `📊 Báo cáo tiến độ hàng ngày - ${data.childName} (${data.date})`,
                html,
                text,
            });
            logger.info(`Daily progress email sent to ${data.parentEmail}`);
        } catch (error) {
            logger.error(`Failed to send daily progress email:`, error);
            throw error;
        }
    }

    async sendWeeklyProgressEmail(data: WeeklyReportData): Promise<void> {
        const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Weekly Progress Report</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
            .container { max-width: 700px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px; text-align: center; color: #ffffff; }
            .header h1 { margin: 0; font-size: 26px; }
            .content { padding: 30px; }
            .section { margin: 20px 0; }
            .stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 15px 0; }
            .stat-card { background: #f8f9fa; padding: 15px; border-radius: 5px; border-left: 4px solid #667eea; }
            .stat-card h4 { margin: 0 0 10px 0; color: #667eea; }
            .stat-value { font-size: 24px; font-weight: bold; color: #333; }
            .comparison { background: #e7f3ff; padding: 15px; border-radius: 5px; margin: 15px 0; }
            .change-positive { color: #28a745; }
            .change-negative { color: #dc3545; }
            .strengths { background: #d4edda; padding: 15px; border-radius: 5px; margin: 15px 0; }
            .weaknesses { background: #f8d7da; padding: 15px; border-radius: 5px; margin: 15px 0; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📈 Báo cáo tiến độ tuần</h1>
              <p>${data.weekStart} - ${data.weekEnd}</p>
            </div>
            <div class="content">
              <h2>Xin chào,</h2>
              <p>Đây là báo cáo tiến độ học tập tuần của <strong>${data.childName}</strong>.</p>
              
              <div class="section">
                <h3>📊 Thống kê tổng quan</h3>
                <div class="stat-grid">
                  <div class="stat-card">
                    <h4>Thời gian học tập</h4>
                    <div class="stat-value">${data.statistics.totalTimeSpent} phút</div>
                  </div>
                  <div class="stat-card">
                    <h4>Khóa học đã hoàn thành</h4>
                    <div class="stat-value">${data.statistics.coursesCompleted}</div>
                  </div>
                  <div class="stat-card">
                    <h4>Bài giảng đã hoàn thành</h4>
                    <div class="stat-value">${data.statistics.lecturesCompleted}</div>
                  </div>
                  <div class="stat-card">
                    <h4>Điểm trung bình</h4>
                    <div class="stat-value">${data.statistics.averageQuizScore.toFixed(1)}%</div>
                  </div>
                </div>
              </div>
              
              ${data.comparison ? `
              <div class="comparison">
                <h3>📈 So sánh với tuần trước</h3>
                <p>Thời gian học tập: 
                  <span class="${data.comparison.change.timeSpent >= 0 ? 'change-positive' : 'change-negative'}">
                    ${data.comparison.change.timeSpent >= 0 ? '+' : ''}${data.comparison.change.timeSpent}%
                  </span>
                </p>
                <p>Bài giảng hoàn thành: 
                  <span class="${data.comparison.change.lecturesCompleted >= 0 ? 'change-positive' : 'change-negative'}">
                    ${data.comparison.change.lecturesCompleted >= 0 ? '+' : ''}${data.comparison.change.lecturesCompleted}
                  </span>
                </p>
              </div>
              ` : ''}
              
              ${data.strengths.length > 0 ? `
              <div class="strengths">
                <h3>💪 Điểm mạnh</h3>
                <ul>
                  ${data.strengths.map(s => `<li>${s.subject}: ${s.averageScore.toFixed(1)}%</li>`).join('')}
                </ul>
              </div>
              ` : ''}
              
              ${data.weaknesses.length > 0 ? `
              <div class="weaknesses">
                <h3>📚 Cần cải thiện</h3>
                <ul>
                  ${data.weaknesses.map(w => `<li>${w.subject}: ${w.averageScore.toFixed(1)}%</li>`).join('')}
                </ul>
              </div>
              ` : ''}
              
              ${data.recommendations.length > 0 ? `
              <div class="section">
                <h3>💡 Gợi ý cho tuần tới</h3>
                <ul>
                  ${data.recommendations.map(r => `<li>${r}</li>`).join('')}
                </ul>
              </div>
              ` : ''}
              
              <p>Tiếp tục động viên ${data.childName} học tập nhé! 🌟</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} EduBunny. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

        const text = `
      Báo cáo tiến độ tuần - ${data.childName}
      Tuần: ${data.weekStart} - ${data.weekEnd}
      
      Thời gian học tập: ${data.statistics.totalTimeSpent} phút
      Khóa học đã hoàn thành: ${data.statistics.coursesCompleted}
      Bài giảng đã hoàn thành: ${data.statistics.lecturesCompleted}
      Điểm trung bình: ${data.statistics.averageQuizScore.toFixed(1)}%
    `;

        try {
            await emailService.sendEmail({
                to: data.parentEmail,
                subject: `📈 Báo cáo tiến độ tuần - ${data.childName}`,
                html,
                text,
            });
            logger.info(`Weekly progress email sent to ${data.parentEmail}`);
        } catch (error) {
            logger.error(`Failed to send weekly progress email:`, error);
            throw error;
        }
    }

    /**
     * Send notification for level up
     */
    async notifyLevelUp(userId: string, level: number, coins: number): Promise<void> {
        try {
            await prisma.notification.create({
                data: {
                    userId,
                    type: NotificationType.SYSTEM,
                    title: '🎉 Chúc mừng lên cấp!',
                    message: `Bạn đã lên Level ${level}! Nhận ${coins} coins thưởng!`,
                    data: { level, coins, event: 'LEVEL_UP' },
                },
            });
            logger.info(`Level up notification sent to user ${userId}`);
        } catch (error) {
            logger.error('Failed to send level up notification:', error);
        }
    }

    /**
     * Send notification for streak milestone
     */
    async notifyStreakMilestone(userId: string, streak: number, coins: number, badge: string): Promise<void> {
        try {
            await prisma.notification.create({
                data: {
                    userId,
                    type: NotificationType.SYSTEM,
                    title: `🔥 Streak ${streak} ngày!`,
                    message: `Xuất sắc! Bạn đã duy trì streak ${streak} ngày liên tiếp! Nhận ${coins} coins và huy hiệu "${badge}"!`,
                    data: { streak, coins, badge, event: 'STREAK_MILESTONE' },
                },
            });
            logger.info(`Streak milestone notification sent to user ${userId}`);
        } catch (error) {
            logger.error('Failed to send streak milestone notification:', error);
        }
    }

    /**
     * Send notification for achievement unlock
     */
    async notifyAchievementUnlock(userId: string, achievementTitle: string, xp: number): Promise<void> {
        try {
            await prisma.notification.create({
                data: {
                    userId,
                    type: NotificationType.ACHIEVEMENT_UNLOCKED,
                    title: '🏆 Thành tích mới!',
                    message: `Bạn đã mở khóa thành tích "${achievementTitle}"! Nhận ${xp} XP!`,
                    data: { achievementTitle, xp, event: 'ACHIEVEMENT_UNLOCK' },
                },
            });
            logger.info(`Achievement unlock notification sent to user ${userId}`);
        } catch (error) {
            logger.error('Failed to send achievement notification:', error);
        }
    }

    /**
     * Send notification for perfect quiz score
     */
    async notifyPerfectQuiz(userId: string, quizTitle: string, rewards: { xp: number; coins: number; stars: number }): Promise<void> {
        try {
            await prisma.notification.create({
                data: {
                    userId,
                    type: NotificationType.QUIZ_GRADED,
                    title: '⭐⭐⭐ Hoàn hảo!',
                    message: `Điểm tuyệt đối! Bạn đạt 3 sao cho "${quizTitle}"! Nhận ${rewards.xp} XP, ${rewards.coins} coins!`,
                    data: { quizTitle, rewards, event: 'PERFECT_QUIZ' },
                },
            });
            logger.info(`Perfect quiz notification sent to user ${userId}`);
        } catch (error) {
            logger.error('Failed to send perfect quiz notification:', error);
        }
    }

    /**
     * Send notification for course completion
     */
    async notifyCourseCompletion(userId: string, courseTitle: string): Promise<void> {
        try {
            await prisma.notification.create({
                data: {
                    userId,
                    type: NotificationType.COURSE_COMPLETED,
                    title: '🎓 Hoàn thành khóa học!',
                    message: `Chúc mừng! Bạn đã hoàn thành khóa học "${courseTitle}"!`,
                    data: { courseTitle, event: 'COURSE_COMPLETION' },
                },
            });
            logger.info(`Course completion notification sent to user ${userId}`);
        } catch (error) {
            logger.error('Failed to send course completion notification:', error);
        }
    }

    /**
     * Send notification for streak break warning
     */
    async notifyStreakBreakWarning(userId: string, currentStreak: number): Promise<void> {
        try {
            await prisma.notification.create({
                data: {
                    userId,
                    type: NotificationType.SYSTEM,
                    title: '⚠️ Nhắc nhở!',
                    message: `Hôm nay bạn chưa học! Streak ${currentStreak} ngày sẽ bị mất nếu bạn không học trong hôm nay.`,
                    data: { currentStreak, event: 'STREAK_WARNING' },
                },
            });
            logger.info(`Streak warning notification sent to user ${userId}`);
        } catch (error) {
            logger.error('Failed to send streak warning notification:', error);
        }
    }

    /**
     * Send notification for shop purchase
     */
    async notifyShopPurchase(userId: string, itemName: string, price: number, currency: string): Promise<void> {
        try {
            await prisma.notification.create({
                data: {
                    userId,
                    type: NotificationType.SYSTEM,
                    title: '✅ Mua hàng thành công!',
                    message: `Bạn đã mua "${itemName}" với ${price} ${currency}!`,
                    data: { itemName, price, currency, event: 'SHOP_PURCHASE' },
                },
            });
            logger.info(`Shop purchase notification sent to user ${userId}`);
        } catch (error) {
            logger.error('Failed to send shop purchase notification:', error);
        }
    }

      /**
       * Send in-app + email notification when an entitlement is close to expiry.
       * Deduplicates per user/course/day to avoid scheduler spam.
       */
      async notifyEntitlementExpiring(payload: EntitlementExpiryNotificationData): Promise<{
        inAppSent: boolean;
        emailSent: boolean;
        skipped: boolean;
      }> {
        const title = '⏳ Quyền học sắp hết hạn';
        const expiresAtLabel = payload.expiresAt.toLocaleDateString('vi-VN');
        const safeDaysRemaining = Math.max(0, payload.daysRemaining);
        const message =
          safeDaysRemaining > 0
            ? `Quyền truy cập khóa "${payload.courseTitle}" sẽ hết hạn vào ${expiresAtLabel} (còn ${safeDaysRemaining} ngày).`
            : `Quyền truy cập khóa "${payload.courseTitle}" sẽ hết hạn vào ${expiresAtLabel}.`;

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const existing = await prisma.notification.findFirst({
          where: {
            userId: payload.userId,
            type: NotificationType.SYSTEM,
            title,
            message,
            createdAt: {
              gte: startOfDay,
            },
          },
          select: {
            id: true,
          },
        });

        if (existing) {
          return {
            inAppSent: false,
            emailSent: false,
            skipped: true,
          };
        }

        let emailSent = false;

        try {
          await prisma.notification.create({
            data: {
              userId: payload.userId,
              type: NotificationType.SYSTEM,
              title,
              message,
              data: {
                event: 'ENTITLEMENT_EXPIRING',
                entitlementId: payload.entitlementId,
                courseSlug: payload.courseSlug,
                expiresAt: payload.expiresAt.toISOString(),
                daysRemaining: safeDaysRemaining,
              },
            },
          });

          if (payload.userEmail) {
            const learnerName = payload.studentName || 'bé';
            const html = `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
              <h2 style="margin-bottom: 8px;">⏳ Nhắc nhở gói học sắp hết hạn</h2>
              <p>Xin chào,</p>
              <p>Quyền truy cập khóa <strong>${payload.courseTitle}</strong> của <strong>${learnerName}</strong> sẽ hết hạn vào <strong>${expiresAtLabel}</strong>.</p>
              <p>Vui lòng gia hạn để tránh gián đoạn việc học.</p>
            </div>
            `;

            const text = `Quyền truy cập khóa "${payload.courseTitle}" sẽ hết hạn vào ${expiresAtLabel}. Vui lòng gia hạn để tránh gián đoạn việc học.`;

            try {
              await emailService.sendEmail({
                to: payload.userEmail,
                subject: `⏳ Nhắc nhở: Gói học "${payload.courseTitle}" sắp hết hạn`,
                html,
                text,
              });
              emailSent = true;
            } catch (error) {
              logger.error('Failed to send entitlement expiry email:', error);
            }
          }

          logger.info(`Entitlement expiry notification sent to user ${payload.userId}`);

          return {
            inAppSent: true,
            emailSent,
            skipped: false,
          };
        } catch (error) {
          logger.error('Failed to send entitlement expiry notification:', error);
          return {
            inAppSent: false,
            emailSent: false,
            skipped: false,
          };
        }
      }

    /**
     * Get unread notifications count
     */
    async getUnreadCount(userId: string): Promise<number> {
        return await prisma.notification.count({
            where: { userId, isRead: false },
        });
    }

    /**
     * Mark notification as read
     */
    async markAsRead(notificationId: string): Promise<void> {
        await prisma.notification.update({
            where: { id: notificationId },
            data: { isRead: true },
        });
    }

    /**
     * Mark all notifications as read
     */
    async markAllAsRead(userId: string): Promise<void> {
        await prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true },
        });
    }
}

export const notificationService = new NotificationService();

