import { Router } from 'express';
import { authController } from './auth.controller';
import { authLimiter, registerLimiter } from '../../shared/middleware/rate-limit.middleware';
import { validateRequest } from '@/shared/middleware/validation.middleware';
import {
    RegisterSchema, LoginSchema
} from './auth.dto';
import { authMiddleware } from '@/shared/config/passport.config';
const router = Router();

// Traditional auth
router.post('/register', registerLimiter, validateRequest(RegisterSchema), authController.register.bind(authController));
router.post('/login', authLimiter, validateRequest(LoginSchema), authController.login.bind(authController));

// Google OAuth
router.get('/google', authController.googleAuth.bind(authController));
router.get('/google/callback', authController.googleCallback.bind(authController));

// Get profile (protected route - add auth middleware later)
router.get('/profile', authMiddleware, authController.getProfile.bind(authController));

router.post('/logout', authMiddleware, authController.logout.bind(authController));

export default router;
