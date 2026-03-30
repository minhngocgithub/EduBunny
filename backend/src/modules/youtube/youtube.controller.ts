/**
 * YouTube Controller
 * 
 * Purpose: Provide endpoints for fetching YouTube video metadata
 * Access: Admin only (used during lecture creation)
 */

import { Request, Response, NextFunction } from 'express';
import { fetchYouTubeVideoInfo } from '../../shared/utils/youtube.util';

/**
 * Get YouTube video information
 * 
 * @route GET /api/youtube/video-info
 * @query url - YouTube video URL
 * @access Private (Admin only)
 * 
 * @example
 * GET /api/youtube/video-info?url=https://www.youtube.com/watch?v=dQw4w9WgXcQ
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "videoId": "dQw4w9WgXcQ",
 *     "title": "Rick Astley - Never Gonna Give You Up",
 *     "duration": 213,
 *     "thumbnail": "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
 *     "channelTitle": "Rick Astley"
 *   }
 * }
 */
export async function getVideoInfo(req: Request, res: Response, next: NextFunction): Promise<void> {
  const { url } = req.query;

  // Validate URL parameter
  if (!url || typeof url !== 'string') {
    res.status(400).json({
      success: false,
      message: 'URL parameter is required',
    });
    return;
  }

  try {
    // Fetch video info from YouTube API
    const videoInfo = await fetchYouTubeVideoInfo(url);

    res.status(200).json({
      success: true,
      data: videoInfo,
    });
  } catch (error) {
    // Pass errors to error handler middleware
    next(error);
  }
}
