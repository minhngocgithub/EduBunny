import { NextFunction, Request, Response } from 'express';
import { achievementService } from './achievement.service';
import { successResponse } from '@/shared/utils/response.utils';

export class AchievementController {
  async createAchievement(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const achievement = await achievementService.createAchievement(req.body);

      successResponse(res, {
        message: 'Achievement created successfully',
        data: achievement,
      }, 201);
    } catch (error) {
      next(error);
    }
  }

  async updateAchievement(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const achievement = await achievementService.updateAchievement(req.params.id, req.body);

      successResponse(res, {
        message: 'Achievement updated successfully',
        data: achievement,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllAchievements(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const studentId = typeof req.query.studentId === 'string' ? req.query.studentId : undefined;
      const achievements = await achievementService.getAllAchievements(studentId);

      successResponse(res, {
        message: 'Achievements retrieved successfully',
        data: achievements,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMyAchievements(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const achievements = await achievementService.getStudentAchievements(req.user.userId);

      successResponse(res, {
        message: 'Student achievements retrieved successfully',
        data: achievements,
      });
    } catch (error) {
      next(error);
    }
  }

  async checkMyAchievements(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const unlocked = await achievementService.checkAndUnlock(req.user.userId);

      successResponse(res, {
        message: 'Achievement check completed',
        data: unlocked,
      });
    } catch (error) {
      next(error);
    }
  }

  async checkStudentAchievements(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const unlocked = await achievementService.checkAndUnlock(req.body.studentId);

      successResponse(res, {
        message: 'Achievement check completed',
        data: unlocked,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const achievementController = new AchievementController();
