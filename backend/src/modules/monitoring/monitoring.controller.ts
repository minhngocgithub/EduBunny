import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { monitoringService } from './monitoring.service';
import { successResponse } from '@/shared/utils/response.utils';

const prisma = new PrismaClient();

export class MonitoringController {
    async getActivityLog(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                });
                return;
            }

            const parentId = req.user.userId;
            const { childId } = req.params;
            const timeRange = (req.query.timeRange as 'today' | 'week' | 'month') || 'week';

            // Verify parent has access to this child
            const parent = await prisma.parent.findUnique({
                where: { userId: parentId },
                include: { children: true },
            });

            if (!parent || !parent.children.some((c: { id: string }) => c.id === childId)) {
                res.status(403).json({
                    success: false,
                    message: 'Access denied',
                });
                return;
            }

            const activities = await monitoringService.getActivityLog(childId, timeRange);

            successResponse(res, {
                data: activities,
                message: 'Activity log retrieved successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    async getDailyReport(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                });
                return;
            }

            const parentId = req.user.userId;
            const { childId } = req.params;

            // Verify parent has access
            const parent = await prisma.parent.findUnique({
                where: { userId: parentId },
                include: { children: true },
            });

            if (!parent || !parent.children.some((c: { id: string }) => c.id === childId)) {
                res.status(403).json({
                    success: false,
                    message: 'Access denied',
                });
                return;
            }

            const report = await monitoringService.getActivityLog(childId, 'today');

            successResponse(res, {
                data: report,
                message: 'Daily report retrieved successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    async getWeeklyReport(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                });
                return;
            }

            const parentId = req.user.userId;
            const { childId } = req.params;
            const weekStart = req.query.weekStart ? new Date(req.query.weekStart as string) : undefined;

            // Verify parent has access
            const parent = await prisma.parent.findUnique({
                where: { userId: parentId },
                include: { children: true },
            });

            if (!parent || !parent.children.some((c: { id: string }) => c.id === childId)) {
                res.status(403).json({
                    success: false,
                    message: 'Access denied',
                });
                return;
            }

            const report = await monitoringService.getWeeklyReport(childId, weekStart);

            successResponse(res, {
                data: report,
                message: 'Weekly report retrieved successfully',
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

            const parentId = req.user.userId;
            const summary = await monitoringService.getChildrenProgress(parentId);

            successResponse(res, {
                data: summary,
                message: 'Children progress retrieved successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * SSE endpoint for real-time activity updates
     */
    async getRealtimeActivity(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                });
                return;
            }

            const parentId = req.user.userId;
            const { childId } = req.params;

            // Verify parent has access
            const parent = await prisma.parent.findUnique({
                where: { userId: parentId },
                include: { children: true },
            });

            if (!parent || !parent.children.some((c: { id: string }) => c.id === childId)) {
                res.status(403).json({
                    success: false,
                    message: 'Access denied',
                });
                return;
            }

            // Set up SSE headers
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');
            res.setHeader('X-Accel-Buffering', 'no'); // Disable buffering in nginx

            // Send initial connection message
            res.write(`data: ${JSON.stringify({ type: 'connected', message: 'Real-time monitoring started' })}\n\n`);

            // For real SSE, we would need to store connections and emit events
            // For now, this is a basic implementation
            // Full implementation would require storing res objects and emitting to them

            // Keep connection alive
            const keepAlive = setInterval(() => {
                res.write(`data: ${JSON.stringify({ type: 'ping', timestamp: new Date().toISOString() })}\n\n`);
            }, 30000); // Send ping every 30 seconds

            // Clean up on disconnect
            req.on('close', () => {
                clearInterval(keepAlive);
                res.end();
            });
        } catch (error) {
            next(error);
        }
    }

    async subscribeDailyReport(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                });
                return;
            }

            const parentId = req.user.userId;
            const { childId } = req.body;

            const parent = await prisma.parent.findUnique({
                where: { userId: parentId },
                include: { children: true },
            });

            if (!parent || !parent.children.some((c: { id: string }) => c.id === childId)) {
                res.status(403).json({
                    success: false,
                    message: 'Access denied',
                });
                return;
            }

            // Upsert subscription
            await prisma.monitoringSubscription.upsert({
                where: {
                    parentId_childId_reportType: {
                        parentId: parent.id,
                        childId,
                        reportType: 'DAILY',
                    },
                },
                create: {
                    parentId: parent.id,
                    childId,
                    reportType: 'DAILY',
                    isActive: true,
                },
                update: {
                    isActive: true,
                },
            });

            successResponse(res, {
                message: 'Subscribed to daily reports successfully',
            });
        } catch (error) {
            next(error);
        }
    }

    async subscribeWeeklyReport(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                });
                return;
            }

            const parentId = req.user.userId;
            const { childId } = req.body;

            const parent = await prisma.parent.findUnique({
                where: { userId: parentId },
                include: { children: true },
            });

            if (!parent || !parent.children.some((c: { id: string }) => c.id === childId)) {
                res.status(403).json({
                    success: false,
                    message: 'Access denied',
                });
                return;
            }

            // Upsert subscription
            await prisma.monitoringSubscription.upsert({
                where: {
                    parentId_childId_reportType: {
                        parentId: parent.id,
                        childId,
                        reportType: 'WEEKLY',
                    },
                },
                create: {
                    parentId: parent.id,
                    childId,
                    reportType: 'WEEKLY',
                    isActive: true,
                },
                update: {
                    isActive: true,
                },
            });

            successResponse(res, {
                message: 'Subscribed to weekly reports successfully',
            });
        } catch (error) {
            next(error);
        }
    }
}

export const monitoringController = new MonitoringController();

