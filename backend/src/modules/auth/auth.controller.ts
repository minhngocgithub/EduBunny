import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { authService } from './auth.service';
import { RegisterInput } from './auth.types';
import { User } from '@prisma/client';

interface AuthenticatedRequest extends Request {
  user: User;
}

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const input: RegisterInput = req.body;
      const result = await authService.register(input);

      res.status(201).json({
        success: true,
        data: {
          user: {
            id: result.user.id,
            email: result.user.email,
            role: result.user.role,
          },
          token: result.token,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);

      res.json({
        success: true,
        data: {
          user: {
            id: result.user.id,
            email: result.user.email,
            role: result.user.role,
          },
          token: result.token,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Google OAuth
  googleAuth(req: Request, res: Response, next: NextFunction) {
    passport.authenticate('google', {
      scope: ['profile', 'email'],
    })(req, res, next);
  }

  googleCallback(req: Request, res: Response, next: NextFunction) {
    passport.authenticate('google', { session: false }, (err: Error | null, user: User | false) => {
      if (err || !user) {
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
      }

      // Generate JWT for the user
      const token = authService['generateToken'](user);

      // Redirect to frontend with token
      res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
    })(req, res, next);
  }

  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as AuthenticatedRequest).user.id;
      const profile = await authService.getProfile(userId);

      res.json({
        success: true,
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
