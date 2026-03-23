/**
 * YouTube API Types
 * 
 * Types for YouTube Data API v3 integration
 */

export interface YouTubeVideoInfo {
  videoId: string
  title: string
  duration: number // Duration in seconds
  thumbnail: string
  channelTitle: string
}

export interface FetchVideoInfoParams {
  url: string
}
