/**
 * Common interface that all platform providers must implement.
 * Providers are independent modules — Instagram and TikTok never share code.
 *
 * SECURITY: Providers only access PUBLIC content. No credentials, no auth bypass,
 * no CAPTCHA circumvention, no DRM circumvention. Only open-source tools are used.
 */

export type Platform = 'instagram' | 'tiktok';

export type SortOption = 'views' | 'recent' | 'likes';

export interface ProviderConfig {
  /** Maximum results per page */
  pageSize: number;
  /** Timeout per request in milliseconds */
  requestTimeout: number;
}

export interface ProfileInfo {
  username: string;
  displayName: string;
  avatarUrl: string;
  bio: string;
  followers: number;
  following: number;
  postsCount: number;
  platform: Platform;
}

export interface VideoMetadata {
  /** Unique identifier from the platform */
  id: string;
  /** Video title or caption */
  title: string;
  /** Short description / caption text */
  description: string;
  /** Thumbnail URL (publicly accessible) */
  thumbnailUrl: string;
  /** Video URL (publicly accessible) */
  videoUrl: string;
  /** Duration in seconds */
  duration: number;
  /** View count */
  views: number;
  /** Like count */
  likes: number;
  /** Comment count */
  comments: number;
  /** ISO date string of when it was posted */
  publishedAt: string;
  /** Source platform */
  platform: Platform;
  /** Original profile username */
  profile: string;
  /** Direct link to the content on the platform */
  permalink: string;
}

export interface SearchOptions {
  username: string;
  platform: Platform;
  /** Number of results to return (10, 50, or 100) */
  quantity: number;
  /** How to sort results */
  sortBy: SortOption;
}

export interface PaginatedResult<T> {
  items: T[];
  /** Total items available (may be an estimate) */
  total: number;
  /** Number of items returned in this page */
  returned: number;
  /** Current page number (0-based) */
  page: number;
  /** Whether more pages are available */
  hasMore: boolean;
}

/**
 * All providers must implement this interface.
 * Each platform has its own independent implementation.
 */
export interface ContentProvider {
  /** The platform this provider handles */
  readonly platform: Platform;

  /** Fetch public profile information */
  getProfile(username: string): Promise<ProfileInfo>;

  /** Fetch videos from a public profile with sorting and pagination */
  getVideos(options: SearchOptions): Promise<PaginatedResult<VideoMetadata>>;

  /** Fetch metadata for a single video by ID */
  getVideoMetadata(videoId: string): Promise<VideoMetadata>;

  /**
   * Fetch the media file for a video.
   * Returns a Blob that can be stored (e.g., Supabase Storage).
   * Only works with publicly accessible media URLs.
   */
  getMedia(video: VideoMetadata): Promise<Blob>;
}
