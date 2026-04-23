import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { authService } from './auth.service';
import { RegisterInput } from './auth.types';

export class AuthController {
  private getFrontendUrl(): string {
    return process.env.FRONTEND_URL || 'http://localhost:3000';
  }

  private buildOAuthFailedRedirect(frontendUrl: string, reason: string, debugMessage?: string): string {
    let redirectUrl = `${frontendUrl}/auth?error=auth_failed&reason=${encodeURIComponent(reason)}`;

    // Show debug details only in non-production environments.
    if (process.env.NODE_ENV !== 'production' && debugMessage) {
      redirectUrl += `&debug=${encodeURIComponent(debugMessage.slice(0, 240))}`;
    }

    return redirectUrl;
  }

  private getOAuthFailureReason(err: Error | null, oauthQueryError?: string): string {
    if (oauthQueryError) {
      return oauthQueryError;
    }

    if (!err) {
      return 'unknown_error';
    }

    const message = err.message.toLowerCase();

    if (
      message.includes('failed to obtain access token') ||
      message.includes('tokenerror') ||
      message.includes('invalid_grant') ||
      message.includes('invalid_client') ||
      (message.includes('oauth') && message.includes('token'))
    ) {
      return 'token_exchange_failed';
    }

    if (message.includes('already linked')) {
      return 'google_account_already_linked';
    }

    if (message.includes('no email')) {
      return 'google_email_missing';
    }

    return 'passport_auth_error';
  }

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const input: RegisterInput = req.body;
      const result = await authService.register(input);

      res.status(201).json({
        success: true,
        message: 'Registration successful. Please check your email to verify your account.',
        data: {
          user: {
            id: result.user.id,
            email: result.user.email,
            role: result.user.role,
            emailVerified: result.user.emailVerified,
          },
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
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
        message: 'Login successful',
        data: {
          user: {
            id: result.user.id,
            email: result.user.email,
            role: result.user.role,
            emailVerified: result.user.emailVerified,
          },
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
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
    const frontendUrl = this.getFrontendUrl();
    const oauthQueryError = typeof req.query.error === 'string' ? req.query.error : undefined;
    const oauthErrorDescription =
      typeof req.query.error_description === 'string'
        ? req.query.error_description
        : undefined;

    if (oauthQueryError) {
      const reason = this.getOAuthFailureReason(null, oauthQueryError);
      console.error('Google OAuth query error:', {
        error: oauthQueryError,
        errorDescription: oauthErrorDescription,
      });
      const redirectUrl = this.buildOAuthFailedRedirect(
        frontendUrl,
        reason,
        oauthErrorDescription || oauthQueryError
      );
      return res.redirect(redirectUrl);
    }

    passport.authenticate('google', { session: false }, async (err: Error | null, expressUser: Express.User | false) => {
      if (err || !expressUser) {
        const reason = this.getOAuthFailureReason(err, oauthQueryError);
        const debugMessage = err?.message || 'No user returned from Passport Google callback';
        console.error('Google OAuth passport authentication failed:', {
          reason,
          error: debugMessage,
        });
        const redirectUrl = this.buildOAuthFailedRedirect(frontendUrl, reason, debugMessage);
        return res.redirect(redirectUrl);
      }

      try {
        const user = await authService.getUserById(expressUser.userId);
        
        if (!user) {
          return res.redirect(`${frontendUrl}/auth?error=user_not_found`);
        }

        const result = await authService.handleOAuthLogin(user);

        // QUAN TRỌNG: Redirect đúng đường dẫn
        res.redirect(`${frontendUrl}/auth/callback?token=${result.accessToken}&refreshToken=${result.refreshToken}`);
      } catch (error) {
        console.error('Google OAuth callback error:', error);
        const debugMessage = error instanceof Error ? error.message : 'Unknown OAuth callback processing error';
        const redirectUrl = this.buildOAuthFailedRedirect(
          frontendUrl,
          'callback_processing_failed',
          debugMessage
        );
        return res.redirect(redirectUrl);
      }
    })(req, res, next);
  }

  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
        return;
      }

      // Giờ req.user.userId đã OK vì Express.User đã được extend
      const userId = req.user.userId;
      const profile = await authService.getProfile(userId);

      res.json({
        success: true,
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }
  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
        return;
      }
      const userId = req.user.userId;
      const { refreshToken } = req.body;
      await authService.logout(userId, refreshToken);
      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      next(error);
    }
  }
  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        res.status(400).json({
          success: false,
          message: 'Refresh token is required'
        });
        return;
      }
      const result = await authService.refreshToken(refreshToken);
      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          accessToken: result.token,
          refreshToken: result.refreshToken,
        },
      });

    } catch (error) {
      next(error);
    }
  }
  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;
      await authService.forgotPassword(email);
      res.json({
        success: true,
        message: 'If that email address is in our database, we will send you an email to reset your password.'
      });
    } catch (error) {
      next(error);
    }
  }
  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token, newPassword } = req.body;
      await authService.resetPassword(token, newPassword);
      res.json({
        success: true,
        message: 'Password has been reset successfully'
      });
    } catch (error) {
      next(error);
    }
  }
  async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
        return;
      }
      const userId = req.user.userId;
      const { currentPassword, newPassword } = req.body;
      await authService.changePassword(userId, currentPassword, newPassword);
      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      next(error);
    }
  }
  async verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = req.body;
      if (!token) {
        res.status(400).json({
          success: false,
          message: 'Token is required'
        });
        return;
      }
      await authService.verifyEmail(token);
      res.json({
        success: true,
        message: 'Email verified successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();