import { Request, Response, NextFunction } from 'express';
import { userService } from './user.service';
import {
    UpdateUserDTO,
    UpdateStudentDTO,
    UpdateParentDTO,
    LinkChildDTO,
    LeaderboardQueryDTO,
    DeleteAccountDTO,
    AdminListUsersQueryDTO,
} from './user.dto';
import { ToggleUserActiveDTO, ChangeUserRoleDTO, AdminDeleteUserDTO } from './user.admin.dto';

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

    // ==================== Admin Methods ====================
    async getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const query: AdminListUsersQueryDTO = req.query as unknown as AdminListUsersQueryDTO;
            const result = await userService.getAllUsers(query);

            res.json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    }

    async getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const user = await userService.getUserById(id);

            res.json({
                success: true,
                data: user,
            });
        } catch (error) {
            next(error);
        }
    }

    async toggleUserActive(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const input: ToggleUserActiveDTO = req.body;
            const user = await userService.toggleUserActive(id, input.isActive);

            res.json({
                success: true,
                data: user,
                message: `User ${input.isActive ? 'activated' : 'deactivated'} successfully`,
            });
        } catch (error) {
            next(error);
        }
    }

    async changeUserRole(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const input: ChangeUserRoleDTO = req.body;
            const user = await userService.changeUserRole(id, input.role);

            res.json({
                success: true,
                data: user,
                message: 'User role changed successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    async adminDeleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const input: AdminDeleteUserDTO = req.body;
            await userService.adminDeleteUser(id, input.reason);

            res.json({
                success: true,
                message: 'User deleted successfully',
            });
        } catch (error) {
            next(error);
        }
    }
}

export const userController = new UserController();
