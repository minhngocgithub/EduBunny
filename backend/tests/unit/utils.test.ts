import jwt from 'jsonwebtoken';
import {
  decodeToken,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  verifyToken,
} from '@/shared/utils/jwt.utils';
import { errorResponse, paginatedResponse, successResponse } from '@/shared/utils/response.utils';

jest.mock('@prisma/client', () => ({
  __esModule: true,
  __mock: {
    refreshTokenCreate: jest.fn(),
  },
  PrismaClient: jest.fn(() => ({
    refreshToken: {
      create: (jest.requireMock('@prisma/client').__mock.refreshTokenCreate as jest.Mock),
    },
  })),
}));

const refreshTokenCreate = (jest.requireMock('@prisma/client').__mock
  .refreshTokenCreate as jest.Mock);

describe('jwt.utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should generate and verify access token payload', () => {
    const token = generateAccessToken({
      userId: 'user-1',
      role: 'STUDENT',
      email: 'student@test.dev',
    });

    const decoded = verifyToken(token);
    expect(decoded.userId).toBe('user-1');
    expect(decoded.role).toBe('STUDENT');
    expect(decoded.email).toBe('student@test.dev');
  });

  it('should throw Invalid token for malformed token', () => {
    expect(() => verifyToken('not-a-token')).toThrow('Invalid token');
  });

  it('should throw Token expired for expired token', () => {
    const secret = process.env.JWT_SECRET || 'your-secret-key-min-32-chars';
    const expiredToken = jwt.sign(
      { userId: 'user-1', role: 'STUDENT', email: 'student@test.dev' },
      secret,
      { expiresIn: '-1s' }
    );

    expect(() => verifyToken(expiredToken)).toThrow('Token expired');
  });

  it('should generate refresh token and persist it', async () => {
    refreshTokenCreate.mockResolvedValue({ id: 'token-id-1' });

    const token = await generateRefreshToken('user-1');
    const decoded = verifyRefreshToken(token);

    expect(decoded.userId).toBe('user-1');
    expect(decoded.tokenId).toBeDefined();
    expect(refreshTokenCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: 'user-1',
          token,
        }),
      })
    );
  });

  it('should decode token and return null for invalid token', () => {
    const token = generateAccessToken({
      userId: 'user-1',
      role: 'STUDENT',
      email: 'student@test.dev',
    });

    expect(decodeToken(token)).toEqual(expect.objectContaining({ userId: 'user-1' }));
    expect(decodeToken('bad-token')).toBeNull();
  });
});

describe('response.utils', () => {
  const createRes = () => {
    const json = jest.fn();
    const status = jest.fn(() => ({ json }));
    return { status, json };
  };

  it('should build success response payload', () => {
    const res = createRes();

    successResponse(res as any, { message: 'OK', data: { id: 1 } }, 201);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: 'OK',
        data: { id: 1 },
      })
    );
  });

  it('should build error response payload', () => {
    const res = createRes();

    errorResponse(res as any, { message: 'Forbidden' }, 403);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Forbidden',
      })
    );
  });

  it('should build paginated response metadata', () => {
    const res = createRes();

    paginatedResponse(res as any, {
      items: [{ id: 1 }, { id: 2 }],
      page: 2,
      limit: 2,
      total: 5,
      message: 'List',
    });

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: 'List',
        data: [{ id: 1 }, { id: 2 }],
        meta: {
          page: 2,
          limit: 2,
          total: 5,
          totalPages: 3,
        },
      })
    );
  });
});
