import { Request, Response, NextFunction } from 'express';
import { adminService } from './admin.service';

export class AdminController {
  /**
   * Get dashboard statistics
   * GET /admin/dashboard/stats
   */
  async getDashboardStats(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await adminService.getDashboardStats();

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user growth chart data
   * GET /admin/dashboard/user-growth?days=7
   */
  async getUserGrowth(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const days = parseInt(req.query.days as string) || 7;
      const growth = await adminService.getUserGrowth(days);

      res.json({
        success: true,
        data: growth,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get subject distribution
   * GET /admin/dashboard/subject-distribution
   */
  async getSubjectDistribution(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const distribution = await adminService.getSubjectDistribution();

      res.json({
        success: true,
        data: distribution,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get recent activities
   * GET /admin/dashboard/recent-activities?limit=10
   */
  async getRecentActivities(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const activities = await adminService.getRecentActivities(limit);

      res.json({
        success: true,
        data: activities,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get top courses
   * GET /admin/dashboard/top-courses?limit=5
   */
  async getTopCourses(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      const courses = await adminService.getTopCourses(limit);

      res.json({
        success: true,
        data: courses,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get analytics data
   * GET /admin/analytics?timeRange=30
   */
  async getAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const timeRange = parseInt(req.query.timeRange as string) || 30;
      const analytics = await adminService.getAnalytics(timeRange);

      res.json({
        success: true,
        data: analytics,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get popular content
   * GET /admin/analytics/popular-content?limit=5
   */
  async getPopularContent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      const content = await adminService.getPopularContent(limit);

      res.json({
        success: true,
        data: content,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get subject progress
   * GET /admin/analytics/subject-progress
   */
  async getSubjectProgress(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const progress = await adminService.getSubjectProgress();

      res.json({
        success: true,
        data: progress,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const adminController = new AdminController();
