/**
 * YouTube Data API v3 Utility
 * 
 * Purpose: Fetch video metadata (duration, title, thumbnail) from YouTube
 * API Docs: https://developers.google.com/youtube/v3/docs
 * Quota: 10,000 units/day (1 video info = 1 unit)
 */

/**
 * YouTube video information returned from API
 */
export interface YouTubeVideoInfo {
  videoId: string;
  title: string;
  duration: number; // Duration in seconds
  thumbnail: string;
  channelTitle: string;
}

/**
 * Extract video ID from various YouTube URL formats
 * 
 * Supported formats:
 * - https://www.youtube.com/watch?v=dQw4w9WgXcQ
 * - https://youtu.be/dQw4w9WgXcQ
 * - https://www.youtube.com/embed/dQw4w9WgXcQ
 * - https://www.youtube.com/v/dQw4w9WgXcQ
 * - https://m.youtube.com/watch?v=dQw4w9WgXcQ
 * 
 * @param url - YouTube video URL
 * @returns Video ID or null if not found
 */
export function extractVideoId(url: string): string | null {
  if (!url || typeof url !== 'string') {
    return null;
  }

  // Remove whitespace
  url = url.trim();

  // Pattern 1: youtube.com/watch?v=VIDEO_ID
  const watchPattern = /[?&]v=([a-zA-Z0-9_-]{11})/;
  let match = url.match(watchPattern);
  if (match) {
    return match[1];
  }

  // Pattern 2: youtu.be/VIDEO_ID
  const shortPattern = /youtu\.be\/([a-zA-Z0-9_-]{11})/;
  match = url.match(shortPattern);
  if (match) {
    return match[1];
  }

  // Pattern 3: youtube.com/embed/VIDEO_ID
  const embedPattern = /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/;
  match = url.match(embedPattern);
  if (match) {
    return match[1];
  }

  // Pattern 4: youtube.com/v/VIDEO_ID
  const vPattern = /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/;
  match = url.match(vPattern);
  if (match) {
    return match[1];
  }

  // If URL is just the video ID (11 characters)
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
    return url;
  }

  return null;
}

/**
 * Parse ISO 8601 duration format to seconds
 * 
 * Examples:
 * - PT15M33S → 933 seconds (15 * 60 + 33)
 * - PT1H2M10S → 3730 seconds (1 * 3600 + 2 * 60 + 10)
 * - PT45S → 45 seconds
 * - PT2H → 7200 seconds
 * - PT8M → 480 seconds
 * 
 * @param duration - ISO 8601 duration string
 * @returns Duration in seconds
 */
export function parseDuration(duration: string): number {
  if (!duration || typeof duration !== 'string') {
    return 0;
  }

  // Remove PT prefix
  const time = duration.replace('PT', '');

  // Extract hours, minutes, seconds
  const hours = time.match(/(\d+)H/);
  const minutes = time.match(/(\d+)M/);
  const seconds = time.match(/(\d+)S/);

  const h = hours ? parseInt(hours[1]) : 0;
  const m = minutes ? parseInt(minutes[1]) : 0;
  const s = seconds ? parseInt(seconds[1]) : 0;

  return h * 3600 + m * 60 + s;
}

/**
 * Fetch video information from YouTube Data API v3
 * 
 * API Endpoint: https://www.googleapis.com/youtube/v3/videos
 * Required parts: contentDetails (duration), snippet (title, thumbnail)
 * Cost: 1 quota unit per request
 * 
 * @param videoUrl - YouTube video URL
 * @returns Video information or null if not found
 * @throws Error if API key is missing or API request fails
 */
export async function fetchYouTubeVideoInfo(
  videoUrl: string
): Promise<YouTubeVideoInfo | null> {
  // Get API key from environment
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey || apiKey === 'your-youtube-api-key-here') {
    throw new Error(
      'YouTube API key not configured. Please add YOUTUBE_API_KEY to .env file'
    );
  }

  // Extract video ID from URL
  const videoId = extractVideoId(videoUrl);
  if (!videoId) {
    throw new Error(
      'Invalid YouTube URL. Please provide a valid YouTube video link'
    );
  }

  try {
    // Build API URL
    const apiUrl = new URL('https://www.googleapis.com/youtube/v3/videos');
    apiUrl.searchParams.set('part', 'contentDetails,snippet');
    apiUrl.searchParams.set('id', videoId);
    apiUrl.searchParams.set('key', apiKey);

    // Call YouTube Data API v3 using native fetch
    const response = await fetch(apiUrl.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    // Handle HTTP errors
    if (!response.ok) {
      if (response.status === 403) {
        throw new Error(
          'YouTube API quota exceeded or API key is invalid. Please check your API key'
        );
      }
      
      if (response.status === 400) {
        const errorData = await response.json().catch(() => ({ error: { message: 'Bad request' } })) as { error?: { message: string } };
        const message = errorData?.error?.message || 'Bad request';
        throw new Error(`YouTube API error: ${message}`);
      }

      throw new Error(`Failed to fetch video info: HTTP ${response.status}`);
    }

    const data = await response.json() as { items?: Array<{
      contentDetails: { duration: string };
      snippet: {
        title: string;
        thumbnails: {
          high?: { url: string };
          default: { url: string };
        };
        channelTitle: string;
      };
    }> };

    // Check if video exists
    if (!data.items || data.items.length === 0) {
      throw new Error(
        'Video not found. The video may be private or deleted'
      );
    }

    const video = data.items[0];
    const duration = parseDuration(video.contentDetails.duration);

    return {
      videoId,
      title: video.snippet.title,
      duration,
      thumbnail: video.snippet.thumbnails.high?.url || video.snippet.thumbnails.default.url,
      channelTitle: video.snippet.channelTitle,
    };
  } catch (error: unknown) {
    // Network or timeout error
    if (error instanceof Error) {
      if (error.name === 'AbortError' || error.name === 'TimeoutError') {
        throw new Error('YouTube API request timed out. Please try again');
      }
      
      // Re-throw Error as-is
      throw error;
    }

    // Unknown error
    throw new Error('Failed to fetch video information from YouTube');
  }
}
