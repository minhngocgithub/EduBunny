import jwt, { SignOptions } from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import type { JwtPayload, JwtRefreshPayload } from '../../modules/auth/auth.types';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-min-32-chars';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-min-32-chars';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

export const generateAccessToken = (payload: JwtPayload): string => {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
    } as SignOptions);
};

export async function generateRefreshToken(userId: string): Promise<string> {
    const refreshTokenRecord = await prisma.refreshToken.create({
        data: {
            userId,
            token: '',
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
    });
    const payload: JwtRefreshPayload = {
        userId,
        tokenId: refreshTokenRecord.id
    };
    const token = jwt.sign(payload, JWT_REFRESH_SECRET, {
        expiresIn: JWT_REFRESH_EXPIRES_IN,
    } as SignOptions);
    await prisma.refreshToken.update({
        where: { id: refreshTokenRecord.id },
        data: { token },
    });
    return token;
}

export function verifyToken(token: string): JwtPayload {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
        return decoded;
    } catch (error: unknown) {
        if (error instanceof Error) {
            if (error.name === 'TokenExpiredError') {
                throw new Error('Token expired');
            }
            if (error.name === 'JsonWebTokenError') {
                throw new Error('Invalid token');
            }
        }
        throw new Error('Token verification failed');
    }
}
export function verifyRefreshToken(token: string): JwtRefreshPayload {
    try {
        const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as JwtRefreshPayload;
        return decoded;
    } catch (error: unknown) {
        if (error instanceof Error) {
            if (error.name === 'TokenExpiredError') {
                throw new Error('Refresh token expired');
            }
            if (error.name === 'JsonWebTokenError') {
                throw new Error('Invalid refresh token');
            }
        }
        throw new Error('Refresh token verification failed');
    }
}

export function decodeToken(token: string): JwtPayload | null {
    try {
        return jwt.decode(token) as JwtPayload;
    } catch {
        return null;
    }
}
