import { redisService } from '@/shared/services/redis.service';
import { websocketService } from '@/shared/services/websocket.service';
import { logger } from '@/shared/utils/logger.utils';

interface QuizSession {
    attemptId: string;
    quizId: string;
    studentId: string;
    startedAt: string;
    duration: number; // Duration in seconds
    expiresAt: string;
    answers: {
        questionId: string;
        answerId: string;
        answeredAt: string;
    }[];
}

class QuizSessionService {
    /**
     * Generate Redis key for quiz session
     * Pattern: quiz:session:{attemptId}
     */
    private getSessionKey(attemptId: string): string {
        return `quiz:session:${attemptId}`;
    }

    /**
     * Start a new quiz session
     * Creates session in Redis with TTL and emits WebSocket event
     */
    async startQuizSession(
        attemptId: string,
        quizId: string,
        studentId: string,
        duration: number // Duration in seconds
    ): Promise<QuizSession> {
        const sessionKey = this.getSessionKey(attemptId);

        // Check if session already exists
        const existingSession = await this.getSession(attemptId);
        if (existingSession) {
            logger.warn(`Quiz session already exists: attempt ${attemptId} for student ${studentId}`);
            return existingSession;
        }

        // Create new session
        const now = new Date();
        const session: QuizSession = {
            attemptId,
            quizId,
            studentId,
            startedAt: now.toISOString(),
            duration,
            expiresAt: new Date(now.getTime() + duration * 1000).toISOString(),
            answers: [],
        };

        // Save to Redis with TTL using standard buffer from skill file.
        await redisService.set(sessionKey, JSON.stringify(session), duration + 30);

        // Start timer heartbeat
        this.startTimerHeartbeat(attemptId, duration);

        logger.info(`Quiz session started: attempt ${attemptId}, duration: ${duration}s`);

        return session;
    }

    /**
     * Get quiz session from Redis
     */
    async getSession(attemptId: string): Promise<QuizSession | null> {
        const sessionKey = this.getSessionKey(attemptId);
        return await redisService.get<QuizSession>(sessionKey);
    }

    /**
     * Save answer to quiz session
     * Updates session in Redis with new answer
     */
    async saveAnswer(
        attemptId: string,
        questionId: string,
        answerId: string
    ): Promise<void> {
        const session = await this.getSession(attemptId);
        
        if (!session) {
            throw new Error('Quiz session not found');
        }

        // Check if session has expired
        if (new Date() > new Date(session.expiresAt)) {
            throw new Error('Quiz session has expired');
        }

        // Add answer to session
        session.answers.push({
            questionId,
            answerId,
            answeredAt: new Date().toISOString(),
        });

        // Update session in Redis
        const sessionKey = this.getSessionKey(attemptId);
        const remainingTTL = await redisService.ttl(sessionKey);
        if (remainingTTL > 0) {
            await redisService.set(sessionKey, JSON.stringify(session), remainingTTL);
        }

        logger.info(`Answer saved: attempt ${attemptId}, student ${session.studentId}, question ${questionId}`);
    }

    /**
     * Complete quiz session
     * Calculates results and emits completion event
     */
    async completeQuizSession(
        attemptId: string,
        score: number,
        totalQuestions: number
    ): Promise<void> {
        const session = await this.getSession(attemptId);
        
        if (!session) {
            throw new Error('Quiz session not found');
        }

        // Calculate time taken
        const timeTaken = Math.floor(
            (new Date().getTime() - new Date(session.startedAt).getTime()) / 1000
        );

        // Delete session from Redis
        await this.deleteSession(attemptId);

        logger.info(`Quiz completed: attempt ${attemptId} by student ${session.studentId}, score: ${score}/${totalQuestions}, timeTaken: ${timeTaken}s`);
    }

    /**
     * Delete quiz session
     */
    async deleteSession(attemptId: string): Promise<void> {
        const sessionKey = this.getSessionKey(attemptId);
        await redisService.delete(sessionKey);
        logger.info(`Quiz session deleted: attempt ${attemptId}`);
    }

    /**
     * Check if session is expired
     */
    async isSessionExpired(attemptId: string): Promise<boolean> {
        const session = await this.getSession(attemptId);
        
        if (!session) {
            return true;
        }

        return new Date() > new Date(session.expiresAt);
    }

    /**
     * Get remaining time for session
     */
    async getRemainingTime(attemptId: string): Promise<number> {
        const session = await this.getSession(attemptId);
        
        if (!session) {
            return 0;
        }

        const remaining = Math.floor(
            (new Date(session.expiresAt).getTime() - new Date().getTime()) / 1000
        );

        return Math.max(0, remaining);
    }

    /**
     * Start timer heartbeat
     * Emits time updates every second and timeout when time is up
     */
    private startTimerHeartbeat(attemptId: string, duration: number): void {
        let elapsed = 0;
        const interval = 1;

        const timer = setInterval(async () => {
            elapsed += interval;
            const remaining = duration - elapsed;

            // Check if session still exists
            const session = await this.getSession(attemptId);
            if (!session) {
                clearInterval(timer);
                return;
            }

            websocketService.emitQuizTick(attemptId, Math.max(0, remaining));

            // Stop timer when time is up
            if (remaining <= 0) {
                clearInterval(timer);

                const stillExists = await this.getSession(attemptId);
                if (stillExists) {
                    websocketService.emitQuizTimeout(attemptId);
                    logger.warn(`Quiz timed out: attempt ${attemptId}`);
                }
            }
        }, interval * 1000);
    }

    /**
     * Get all active sessions for a student
     * Useful for preventing multiple concurrent quizzes
     */
    async getActiveSessionsForStudent(studentId: string): Promise<string[]> {
        const pattern = 'quiz:session:*';
        const keys = await redisService.keys(pattern);

        const sessions = await Promise.all(
            keys.map((key) => redisService.get<QuizSession>(key))
        );

        return sessions
            .filter((session): session is QuizSession => Boolean(session && session.studentId === studentId))
            .map((session) => session.attemptId);
    }

    /**
     * Cleanup expired sessions
     * This is automatically handled by Redis TTL, but can be called manually
     */
    async cleanupExpiredSessions(): Promise<number> {
        const pattern = 'quiz:session:*';
        const keys = await redisService.keys(pattern);
        
        let deletedCount = 0;
        for (const key of keys) {
            const ttl = await redisService.ttl(key);
            if (ttl === -2) {
                // Key doesn't exist
                deletedCount++;
            } else if (ttl === -1) {
                // Key exists but has no expiration (shouldn't happen)
                await redisService.delete(key);
                deletedCount++;
            }
        }

        logger.info(`Cleaned up ${deletedCount} expired quiz sessions`);
        return deletedCount;
    }
}

export const quizSessionService = new QuizSessionService();
