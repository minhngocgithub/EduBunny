/**
 * YouTube Routes
 * 
 * Purpose: API endpoints for fetching YouTube video metadata
 * Access: Admin only
 */

import { Router } from 'express';
import { getVideoInfo } from './youtube.controller';
import { authMiddleware, requireAdmin } from '@/shared/config/passport.config';

const router = Router();

/**
 * GET /api/youtube/video-info?url=<youtube-url>
 * 
 * Fetch video metadata from YouTube Data API v3
 * Protected: Admin only
 */
router.get(
  '/video-info',
  authMiddleware,
  requireAdmin,
  getVideoInfo
);

export default router;
