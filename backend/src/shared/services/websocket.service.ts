import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { logger } from '../utils/logger.utils';
import { ActivityType } from '@prisma/client';

export class WebSocketService {
    private io: SocketIOServer | null = null;
    private parentRooms: Map<string, Set<string>> = new Map(); // parentUserId -> Set of socketIds

    initialize(server: HTTPServer): void {
        this.io = new SocketIOServer(server, {
            cors: {
                origin: process.env.ALLOWED_ORIGINS?.split(',') || 'http://localhost:3000',
                methods: ['GET', 'POST'],
                credentials: true,
            },
            path: '/ws',
        });

        this.io.on('connection', (socket) => {
            logger.info(`WebSocket client connected: ${socket.id}`);

            // Preferred monitoring contract from skill file
            socket.on('monitoring:subscribe', (data: { parentUserId: string; childId: string }) => {
                this.handleMonitoringSubscribe(socket.id, data.parentUserId, data.childId);
                socket.join(`user:${data.parentUserId}`);
                socket.emit('monitoring:subscribed', { childId: data.childId });
            });

            socket.on('monitoring:unsubscribe', (data: { parentUserId: string; childId: string }) => {
                this.handleMonitoringUnsubscribe(socket.id, data.parentUserId, data.childId);
                socket.leave(`user:${data.parentUserId}`);
                socket.emit('monitoring:unsubscribed', { childId: data.childId });
            });

            // Backward-compatible aliases
            socket.on('subscribe:child-activity', (data: { parentId: string; childId: string }) => {
                this.handleMonitoringSubscribe(socket.id, data.parentId, data.childId);
                socket.join(`user:${data.parentId}`);
                socket.emit('monitoring:subscribed', { childId: data.childId });
            });

            socket.on('unsubscribe:child-activity', (data: { parentId: string; childId: string }) => {
                this.handleMonitoringUnsubscribe(socket.id, data.parentId, data.childId);
                socket.leave(`user:${data.parentId}`);
                socket.emit('monitoring:unsubscribed', { childId: data.childId });
            });

            // Quiz real-time events
            this.handleQuizJoin(socket);
            this.handleQuizLeave(socket);

            socket.on('disconnect', () => {
                logger.info(`WebSocket client disconnected: ${socket.id}`);
                
                // Clean up parent rooms
                for (const [parentId, socketIds] of this.parentRooms.entries()) {
                    socketIds.delete(socket.id);
                    if (socketIds.size === 0) {
                        this.parentRooms.delete(parentId);
                    }
                }
            });
        });

        logger.info('WebSocket service initialized');
    }

    private handleMonitoringSubscribe(socketId: string, parentUserId: string, childId: string): void {
        if (!this.parentRooms.has(parentUserId)) {
            this.parentRooms.set(parentUserId, new Set());
        }
        this.parentRooms.get(parentUserId)?.add(socketId);
        logger.info(`Parent ${parentUserId} subscribed to child ${childId} activity`);
    }

    private handleMonitoringUnsubscribe(socketId: string, parentUserId: string, childId: string): void {
        this.parentRooms.get(parentUserId)?.delete(socketId);
        if (this.parentRooms.get(parentUserId)?.size === 0) {
            this.parentRooms.delete(parentUserId);
        }
        logger.info(`Parent ${parentUserId} unsubscribed from child ${childId} activity`);
    }

    emitToUser(userId: string, event: string, data: unknown): void {
        if (!this.io) {
            logger.warn('WebSocket server not initialized');
            return;
        }

        this.io.to(`user:${userId}`).emit(event, data);
    }

    emitToRoom(roomName: string, event: string, data: unknown): void {
        if (!this.io) {
            logger.warn('WebSocket server not initialized');
            return;
        }

        this.io.to(roomName).emit(event, data);
    }

    broadcast(event: string, data: unknown): void {
        if (!this.io) {
            logger.warn('WebSocket server not initialized');
            return;
        }

        this.io.emit(event, data);
    }

    /**
     * Emit activity event to parent monitoring a child
     */
    emitActivityEvent(parentUserId: string, childId: string, activity: {
        type: ActivityType;
        metadata: Record<string, unknown> | null;
        timestamp: Date;
    }): void {
        this.emitToUser(parentUserId, 'child:activity', {
            ...activity,
            childId,
        });

        logger.debug(`Emitted child:activity event to parent user room: ${parentUserId}`);
    }

    /**
     * Emit progress update event
     */
    emitProgressUpdate(parentId: string, childId: string, progress: {
        courseId: string;
        courseTitle: string;
        progress: number;
        timestamp: Date;
    }): void {
        this.emitToUser(parentId, 'progress:update', {
            ...progress,
            childId,
        });
    }

    /**
     * Emit achievement unlock event
     */
    emitAchievementUnlock(parentUserId: string, childId: string, achievement: {
        id: string;
        title: string;
        unlockedAt: Date;
    }): void {
        this.emitToUser(parentUserId, 'achievement:unlocked', {
            ...achievement,
            childId,
        });
    }

    emitAchievementUnlocked(userId: string, payload: {
        id: string;
        name: string;
        description: string;
        icon?: string | null;
        xpReward?: number;
    }): void {
        this.emitToUser(userId, 'achievement:unlocked', payload);
    }

    /**
     * Get connected parents count
     */
    getConnectedParentsCount(): number {
        return this.parentRooms.size;
    }

    /**
     * Check if parent is connected
     */
    isParentConnected(parentId: string): boolean {
        return this.parentRooms.has(parentId) && (this.parentRooms.get(parentId)?.size || 0) > 0;
    }

    /**
     * Handle quiz join event
     * Student joins quiz room for real-time updates
     */
    private handleQuizJoin(socket: Socket): void {
        socket.on('quiz:join', async (data: { attemptId: string }) => {
            const { attemptId } = data;
            const roomName = `quiz:${attemptId}`;
            
            socket.join(roomName);
            socket.emit('quiz:joined', { attemptId, roomName });
            
            logger.info(`Joined quiz room for attempt ${attemptId}`);
        });
    }

    /**
     * Handle quiz leave event
     */
    private handleQuizLeave(socket: Socket): void {
        socket.on('quiz:leave', (data: { attemptId: string }) => {
            const { attemptId } = data;
            const roomName = `quiz:${attemptId}`;
            
            socket.leave(roomName);
            logger.info(`Left quiz room for attempt ${attemptId}`);
        });
    }

    emitQuizTick(attemptId: string, remaining: number): void {
        this.emitToRoom(`quiz:${attemptId}`, 'quiz:tick', { remaining });
    }

    emitQuizTimeout(attemptId: string): void {
        this.emitToRoom(`quiz:${attemptId}`, 'quiz:timeout', { attemptId });
        logger.info(`Quiz timeout emitted for attempt ${attemptId}`);
    }
}

export const websocketService = new WebSocketService();

