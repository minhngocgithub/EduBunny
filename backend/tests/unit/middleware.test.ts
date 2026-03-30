import {
  authMiddleware,
  optionalAuthMiddleware,
  requireRole,
} from '@/shared/middleware/auth.middleware';
import { verifyToken } from '@/shared/utils/jwt.utils';
import { errorResponse } from '@/shared/utils/response.utils';

jest.mock('@/shared/utils/jwt.utils', () => ({
  verifyToken: jest.fn(),
}));

jest.mock('@/shared/utils/response.utils', () => ({
  errorResponse: jest.fn(),
}));

describe('auth.middleware', () => {
  const next = jest.fn();

  const createReq = (overrides: Partial<any> = {}) => ({
    headers: {},
    cookies: {},
    ...overrides,
  }) as any;

  const res = {} as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call next and attach req.user when bearer token is valid', () => {
    const req = createReq({
      headers: { authorization: 'Bearer token-123' },
    });

    (verifyToken as jest.Mock).mockReturnValue({
      userId: 'user-1',
      role: 'STUDENT',
      email: 'student@test.dev',
    });

    authMiddleware(req as any, res, next);

    expect(verifyToken).toHaveBeenCalledWith('token-123');
    expect(req.user).toEqual(expect.objectContaining({ userId: 'user-1' }));
    expect(next).toHaveBeenCalled();
  });

  it('should prefer cookie token if present', () => {
    const req = createReq({
      cookies: { accessToken: 'cookie-token' },
      headers: { authorization: 'Bearer header-token' },
    });

    (verifyToken as jest.Mock).mockReturnValue({
      userId: 'user-1',
      role: 'STUDENT',
      email: 'student@test.dev',
    });

    authMiddleware(req as any, res, next);

    expect(verifyToken).toHaveBeenCalledWith('cookie-token');
    expect(next).toHaveBeenCalled();
  });

  it('should return 401 when token is missing', () => {
    const req = createReq();

    authMiddleware(req as any, res, next);

    expect(errorResponse).toHaveBeenCalledWith(
      res,
      { message: 'No token provided' },
      401
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 when token verification fails', () => {
    const req = createReq({
      headers: { authorization: 'Bearer invalid-token' },
    });

    (verifyToken as jest.Mock).mockImplementation(() => {
      throw new Error('Invalid token');
    });

    authMiddleware(req as any, res, next);

    expect(errorResponse).toHaveBeenCalledWith(
      res,
      { message: 'Invalid token' },
      401
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('optionalAuthMiddleware should continue without token', () => {
    const req = createReq();

    optionalAuthMiddleware(req as any, res, next);

    expect(next).toHaveBeenCalled();
    expect(verifyToken).not.toHaveBeenCalled();
  });

  it('optionalAuthMiddleware should hydrate req.user when token is valid', () => {
    const req = createReq({
      headers: { authorization: 'Bearer token-123' },
    });

    (verifyToken as jest.Mock).mockReturnValue({
      userId: 'user-1',
      role: 'PARENT',
      email: 'parent@test.dev',
    });

    optionalAuthMiddleware(req as any, res, next);

    expect(req.user).toEqual(expect.objectContaining({ role: 'PARENT' }));
    expect(next).toHaveBeenCalled();
  });

  it('requireRole should return 401 when req.user is missing', () => {
    const req = createReq();
    const handler = requireRole('ADMIN' as any);

    handler(req as any, res, next);

    expect(errorResponse).toHaveBeenCalledWith(
      res,
      { message: 'Authentication required' },
      401
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('requireRole should return 403 for insufficient role', () => {
    const req = createReq({
      user: { role: 'STUDENT' },
    });
    const handler = requireRole('ADMIN' as any);

    handler(req as any, res, next);

    expect(errorResponse).toHaveBeenCalledWith(
      res,
      { message: 'Insufficient permissions' },
      403
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('requireRole should call next for allowed role', () => {
    const req = createReq({
      user: { role: 'ADMIN' },
    });
    const handler = requireRole('ADMIN' as any, 'PARENT' as any);

    handler(req as any, res, next);

    expect(next).toHaveBeenCalled();
    expect(errorResponse).not.toHaveBeenCalled();
  });
});
