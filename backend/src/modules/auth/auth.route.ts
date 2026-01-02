import { Router } from 'express';
import { authController } from './auth.controller';

const router = Router();

// Traditional auth
router.post('/register', authController.register.bind(authController));
router.post('/login', authController.login.bind(authController));

// Google OAuth
router.get('/google', authController.googleAuth.bind(authController));
router.get('/google/callback', authController.googleCallback.bind(authController));

// Get profile (protected route - add auth middleware later)
router.get('/profile', authController.getProfile.bind(authController));

export default router;
