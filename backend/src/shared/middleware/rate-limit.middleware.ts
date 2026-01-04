import rateLimit from "express-rate-limit";
import { errorResponse } from "../utils/response.utils";
import { Request, Response, NextFunction } from "express";

interface RateLimitOptions {
    maxRequests?: number;
    windowMs?: number;
    message?: string;
}

export function rateLimitMiddleware(options: RateLimitOptions = {}) {
    const {
        maxRequests = 100,
        windowMs = 15 * 60 * 1000, // 15 minutes
        message = 'Too many requests from this IP, please try again later.',
    } = options;
    return rateLimit({
        windowMs,
        max: maxRequests,
        standardHeaders: true,
        legacyHeaders: false,
        handler: (_req: Request, res: Response, _next: NextFunction) => {
            return errorResponse(
                res,
                { message },
                429
            );
        }
    })
}
// API thông thường: 100 requests / 15 phút
export const apiLimiter = rateLimitMiddleware({
    maxRequests: 100,
    windowMs: 15 * 60 * 1000, // 15 minutes
});

export const authLimiter = rateLimitMiddleware({
    maxRequests: 10,
    windowMs: 15 * 60 * 1000, // 10 requests per 15 minutes
    message: 'Too many authentication attempts, please try again later',
});

export const passwordResetLimiter = rateLimitMiddleware({
    maxRequests: 3,
    windowMs: 60 * 60 * 1000, // 3 requests per hour
    message: 'Too many password reset attempts, please try again later',
});
export const registerLimiter = rateLimitMiddleware({
  maxRequests: 5, // Chỉ cho phép 5 lần đăng ký / IP / giờ
  windowMs: 60 * 60 * 1000, // 1 giờ
  message: 'Too many registration attempts, please try again later',
});
//Rate limit nghiêm ngặt hơn cho các endpoint nhạy cảm
export const strictLimiter = rateLimitMiddleware({
  maxRequests: 3,
  windowMs: 5 * 60 * 1000, // 3 requests / 5 phút
  message: 'Too many requests, please slow down',
});