import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '@/shared/utils/jwt.utils';
import { errorResponse } from '@/shared/utils/response.utils';
import { UserRole } from '@prisma/client';

export function authMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
): void {
    try {
        // 1. Get token from cookies first (for Google OAuth httpOnly cookies)
        // Then fallback to Authorization header (for regular login)
        let token: string | undefined;

        // Check cookies first (for Google OAuth)
        if (req.cookies && req.cookies.accessToken) {
            token = req.cookies.accessToken;
        }

        // Fallback to Authorization header if no cookie
        if (!token) {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            }
        }

        // 2. Check if token exists
        if (!token) {
            errorResponse(
                res,
                { message: 'No token provided' },
                401
            );
            return;
        }

        // 3. Verify token
        const decoded = verifyToken(token);

        // 4. Attach decoded JWT payload to request
        req.user = decoded;

        // 5. Continue
        next();
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Invalid token';
        errorResponse(
            res,
            { message },
            401
        );
    }
}

export function optionalAuthMiddleware(
    req: Request,
    _res: Response,
    next: NextFunction
): void {
    try {
        // Check cookies first (for Google OAuth)
        let token: string | undefined;

        if (req.cookies && req.cookies.accessToken) {
            token = req.cookies.accessToken;
        }

        // Fallback to Authorization header
        if (!token) {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            }
        }

        if (token) {
            const decoded = verifyToken(token);
            req.user = decoded;
        }

        next();
    } catch {
        // Ignore errors, continue without user
        next();
    }
}

export function requireRole(...roles: UserRole[]) {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user) {
            errorResponse(
                res,
                { message: 'Authentication required' },
                401
            );
            return;
        }

        const userRole = (req.user).role;

        if (!roles.includes(userRole)) {
            errorResponse(
                res,
                { message: 'Insufficient permissions' },
                403
            );
            return;
        }

        next();
    };
}

/**
 * Middleware to check if user is a student
 */
export const requireStudent = requireRole(UserRole.STUDENT);

/**
 * Middleware to check if user is a parent
 */
export const requireParent = requireRole(UserRole.PARENT);

/**
 * Middleware to check if user is an admin
 */
export const requireAdmin = requireRole(UserRole.ADMIN);