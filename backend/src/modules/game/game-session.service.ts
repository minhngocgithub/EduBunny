import { randomUUID } from 'crypto';
import { redisService } from '@/shared/services/redis.service';
import { logger } from '@/shared/utils/logger.utils';

interface GameSessionState {
    sessionId: string;
    studentId: string;
    gameId: string;
    gameType: string;
    startedAt: string;
    timeLimitSeconds: number;
    currentQuestion: number;
    score: number;
    answers: Array<{
        questionId: string;
        answer: string;
        answeredAt: string;
    }>;
}

export class GameSessionService {
    private getSessionKey(sessionId: string): string {
        return `game:session:${sessionId}`;
    }

    async startSession(params: {
        studentId: string;
        gameId: string;
        gameType: string;
        timeLimitSeconds: number;
    }): Promise<{ sessionId: string; session: GameSessionState }> {
        const sessionId = randomUUID();
        const sessionKey = this.getSessionKey(sessionId);

        const session: GameSessionState = {
            sessionId,
            studentId: params.studentId,
            gameId: params.gameId,
            gameType: params.gameType,
            startedAt: new Date().toISOString(),
            timeLimitSeconds: params.timeLimitSeconds,
            currentQuestion: 0,
            score: 0,
            answers: [],
        };

        await redisService.set(sessionKey, JSON.stringify(session), params.timeLimitSeconds + 60);

        logger.info('Game session created', {
            sessionId,
            studentId: params.studentId,
            gameId: params.gameId,
        });

        return { sessionId, session };
    }

    async getSession(sessionId: string): Promise<GameSessionState | null> {
        return redisService.get<GameSessionState>(this.getSessionKey(sessionId));
    }

    async updateSession(
        sessionId: string,
        patch: Partial<Pick<GameSessionState, 'currentQuestion' | 'score' | 'answers'>>
    ): Promise<GameSessionState> {
        const sessionKey = this.getSessionKey(sessionId);
        const session = await this.getSession(sessionId);

        if (!session) {
            throw new Error('Game session not found');
        }

        const updated: GameSessionState = {
            ...session,
            ...patch,
        };

        const ttl = await redisService.ttl(sessionKey);
        if (ttl > 0) {
            await redisService.set(sessionKey, JSON.stringify(updated), ttl);
        } else {
            await redisService.set(sessionKey, JSON.stringify(updated), session.timeLimitSeconds + 60);
        }

        return updated;
    }

    async endSession(sessionId: string): Promise<GameSessionState | null> {
        const session = await this.getSession(sessionId);

        await redisService.delete(this.getSessionKey(sessionId));

        logger.info('Game session ended', { sessionId });

        return session;
    }
}

export const gameSessionService = new GameSessionService();
