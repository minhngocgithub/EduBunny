import { Request, Response, NextFunction } from 'express';
import { userService } from './user.service';
import {
    UpdateUserDTO,
    UpdateStudentDTO,
    UpdateParentDTO,
    LinkChildDTO,
    LeaderboardQueryDTO,
    DeleteAccountDTO,
} from './user.dto';

export class UserController {
    // ==================== User Profile ====================

    async getUserProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                });
                return;
            }

            const userId = req.user.userId;
            const profile = await userService.getUserProfile(userId);

            res.json({
                success: true,
                data: profile,
            });
        } catch (error) {
            next(error);
        }
    }

    async updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                });
                return;
            }

            const userId = req.user.userId;
            const input: UpdateUserDTO = req.body;
            const updatedUser = await userService.updateUser(userId, input);

            res.json({
                success: true,
                message: 'User profile updated successfully',
                data: updatedUser,
            });
        } catch (error) {
            next(error);
        }
    }

    // ==================== Student Profile ====================

    async getStudentProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                });
                return;
            }

            const userId = req.user.userId;
            const student = await userService.getStudentProfile(userId);

            res.json({
                success: true,
                data: student,
            });
        } catch (error) {
            next(error);
        }
    }

    async updateStudentProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                });
                return;
            }

            const userId = req.user.userId;
            const input: UpdateStudentDTO = req.body;
            const updatedStudent = await userService.updateStudentProfile(userId, input);

            res.json({
                success: true,
                message: 'Student profile updated successfully',
                data: updatedStudent,
            });
        } catch (error) {
            next(error);
        }
    }

    async getStudentStatistics(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                });
                return;
            }

            const userId = req.user.userId;
            const statistics = await userService.getStudentStatistics(userId);

            res.json({
                success: true,
                data: statistics,
            });
        } catch (error) {
            next(error);
        }
    }

    async getLevelProgress(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                });
                return;
            }

            const userId = req.user.userId;
            const progress = await userService.getLevelProgress(userId);

            res.json({
                success: true,
                data: progress,
            });
        } catch (error) {
            next(error);
        }
    }

    async addXp(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                });
                return;
            }

            const userId = req.user.userId;
            const { xpAmount } = req.body;
            const updatedStudent = await userService.addXp(userId, xpAmount);

            res.json({
                success: true,
                message: `Successfully added ${xpAmount} XP`,
                data: updatedStudent,
            });
        } catch (error) {
            next(error);
        }
    }

    // ==================== Parent Profile ====================

    async getParentProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                });
                return;
            }

            const userId = req.user.userId;
            const parent = await userService.getParentProfile(userId);

            res.json({
                success: true,
                data: parent,
            });
        } catch (error) {
            next(error);
        }
    }

    async updateParentProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                });
                return;
            }

            const userId = req.user.userId;
            const input: UpdateParentDTO = req.body;
            const updatedParent = await userService.updateParentProfile(userId, input);

            res.json({
                success: true,
                message: 'Parent profile updated successfully',
                data: updatedParent,
            });
        } catch (error) {
            next(error);
        }
    }

    async linkChild(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                });
                return;
            }

            const parentUserId = req.user.userId;
            const { childId }: LinkChildDTO = req.body;
            await userService.linkChild(parentUserId, childId);

            res.json({
                success: true,
                message: 'Child linked successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    async unlinkChild(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                });
                return;
            }

            const parentUserId = req.user.userId;
            const { childId }: LinkChildDTO = req.body;
            await userService.unlinkChild(parentUserId, childId);

            res.json({
                success: true,
                message: 'Child unlinked successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    async getChildrenProgress(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                });
                return;
            }

            const parentUserId = req.user.userId;
            const progress = await userService.getChildrenProgress(parentUserId);

            res.json({
                success: true,
                data: progress,
            });
        } catch (error) {
            next(error);
        }
    }

    // ==================== Leaderboard ====================

    async getLeaderboard(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const leaderboard = await userService.getLeaderboard(req.query as unknown as LeaderboardQueryDTO);

            res.json({
                success: true,
                data: leaderboard,
            });
        } catch (error) {
            next(error);
        }
    }

    // ==================== Account Management ====================
    async deleteAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                });
                return;
            }

            const userId = req.user.userId;
            const { password }: DeleteAccountDTO = req.body;
            await userService.deleteAccount(userId, password);

            res.json({
                success: true,
                message: 'Account deleted successfully',
            });
        } catch (error) {
            next(error);
        }
    }
}

export const userController = new UserController();
