import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { logger } from '../utils/logger.utils';
import { ActivityType } from '@prisma/client';

export class WebSocketService {
    private io: SocketIOServer | null = null;
    private parentRooms: Map<string, Set<string>> = new Map(); // parentId -> Set of socketIds

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

            // Handle parent subscription to child activity
            socket.on('subscribe:child-activity', (data: { parentId: string; childId: string }) => {
                const { parentId, childId } = data;
                
                // Join room for this parent-child pair
                const roomName = `parent:${parentId}:child:${childId}`;
                socket.join(roomName);

                // Track parent connections
                if (!this.parentRooms.has(parentId)) {
                    this.parentRooms.set(parentId, new Set());
                }
                this.parentRooms.get(parentId)?.add(socket.id);

                logger.info(`Parent ${parentId} subscribed to child ${childId} activity`);
                socket.emit('subscribed', { room: roomName });
            });

            // Handle unsubscribe
            socket.on('unsubscribe:child-activity', (data: { parentId: string; childId: string }) => {
                const { parentId, childId } = data;
                const roomName = `parent:${parentId}:child:${childId}`;
                socket.leave(roomName);
                
                this.parentRooms.get(parentId)?.delete(socket.id);
                if (this.parentRooms.get(parentId)?.size === 0) {
                    this.parentRooms.delete(parentId);
                }

                logger.info(`Parent ${parentId} unsubscribed from child ${childId} activity`);
            });

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

    /**
     * Emit activity event to parent monitoring a child
     */
    emitActivityEvent(parentId: string, childId: string, activity: {
        type: ActivityType;
        metadata: Record<string, unknown> | null;
        timestamp: Date;
    }): void {
        if (!this.io) {
            logger.warn('WebSocket server not initialized');
            return;
        }

        const roomName = `parent:${parentId}:child:${childId}`;
        this.io.to(roomName).emit('activity:new', {
            ...activity,
            childId,
        });

        logger.debug(`Emitted activity event to room: ${roomName}`);
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
        if (!this.io) {
            logger.warn('WebSocket server not initialized');
            return;
        }

        const roomName = `parent:${parentId}:child:${childId}`;
        this.io.to(roomName).emit('progress:update', {
            ...progress,
            childId,
        });
    }

    /**
     * Emit achievement unlock event
     */
    emitAchievementUnlock(parentId: string, childId: string, achievement: {
        id: string;
        title: string;
        unlockedAt: Date;
    }): void {
        if (!this.io) {
            logger.warn('WebSocket server not initialized');
            return;
        }

        const roomName = `parent:${parentId}:child:${childId}`;
        this.io.to(roomName).emit('achievement:unlock', {
            ...achievement,
            childId,
        });
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
}

export const websocketService = new WebSocketService();

