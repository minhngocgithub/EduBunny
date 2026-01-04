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
        // 1. Get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            errorResponse(
                res,
                { message: 'No token provided' },
                401
            );
            return;
        }

        const token = authHeader.substring(7);

        // 2. Verify token
        const decoded = verifyToken(token);

        // 3. Attach decoded JWT payload to request
        req.user = decoded;

        // 4. Continue
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
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
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