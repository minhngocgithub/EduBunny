import { RateLimiterRedis } from 'rate-limiter-flexible';
import { Request, Response, NextFunction } from 'express';
import { redisService } from '../services/redis.service';
import { errorResponse } from '../utils/response.utils';
import { logger } from '../utils/logger.utils';

interface RateLimitOptions {
    points?: number; // Number of requests allowed
    duration?: number; // Time window in seconds
    blockDuration?: number; // Block duration in seconds after limit exceeded
    keyPrefix?: string; // Prefix for Redis keys
}

/**
 * Middleware factory for rate limiting
 * Uses Redis to track request counts per IP address
 */
export function rateLimitMiddleware(options: RateLimitOptions = {}) {
    let limiter: RateLimiterRedis | null = null;

    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            // Lazy initialization - create limiter on first request
            if (!limiter) {
                if (!redisService.isReady()) {
                    logger.warn('Redis not ready, skipping rate limiting');
                    return next();
                }

                const {
                    points = 100,
                    duration = 60,
                    blockDuration = 0,
                    keyPrefix = 'rate_limit',
                } = options;

                limiter = new RateLimiterRedis({
                    storeClient: redisService.getClient(),
                    keyPrefix,
                    points,
                    duration,
                    blockDuration,
                });
            }

            // Use IP address as the key
            const key = req.ip || req.connection.remoteAddress || 'unknown';

            // Consume 1 point
            await limiter.consume(key);

            // Request allowed, continue
            next();
            return;
        } catch (error: unknown) {
            // Rate limit exceeded
            if (
                typeof error === 'object' &&
                error !== null &&
                'msBeforeNext' in error &&
                typeof (error as { msBeforeNext: unknown }).msBeforeNext === 'number'
            ) {
                const msBeforeNext = (error as { msBeforeNext: number }).msBeforeNext;
                const retryAfter = Math.ceil(msBeforeNext / 1000);

                res.setHeader('Retry-After', String(retryAfter));
                res.setHeader('X-RateLimit-Limit', String(options.points || 100));
                res.setHeader('X-RateLimit-Remaining', '0');
                res.setHeader('X-RateLimit-Reset', String(Date.now() + msBeforeNext));

                logger.warn(`Rate limit exceeded for IP: ${req.ip}`);

                errorResponse(
                    res,
                    { message: 'Too many requests, please try again later.' },
                    429
                );
                return;
            }

            // Other errors, log and pass through
            logger.error('Rate limiter error:', error);
            next();
            return;
        }
    };
}

// API endpoints: 100 requests per minute
export const apiLimiter = rateLimitMiddleware({
    points: 100,
    duration: 60,
    keyPrefix: 'api_limit',
});

// Auth endpoints: 10 requests per 15 minutes
export const authLimiter = rateLimitMiddleware({
    points: 10,
    duration: 15 * 60,
    blockDuration: 15 * 60,
    keyPrefix: 'auth_limit',
});

// Register endpoint: 5 requests per hour
export const registerLimiter = rateLimitMiddleware({
    points: 5,
    duration: 60 * 60,
    blockDuration: 60 * 60,
    keyPrefix: 'register_limit',
});

// Password reset: 3 requests per hour
export const passwordResetLimiter = rateLimitMiddleware({
    points: 3,
    duration: 60 * 60,
    blockDuration: 60 * 60,
    keyPrefix: 'pwd_reset_limit',
});

// Strict limiter for sensitive endpoints: 20 requests per 5 minutes
export const strictLimiter = rateLimitMiddleware({
    points: 20,
    duration: 5 * 60,
    blockDuration: 5 * 60,
    keyPrefix: 'strict_limit',
});