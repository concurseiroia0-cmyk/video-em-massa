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
  /** Must match the exact requested username (case-insensitive match) */
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  bio: string;
  followers: number;
  following: number;
  postsCount: number;
  platform: Platform;
  /** Direct profile URL on the platform */
  profileUrl: string;
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
  /** Owner profile username — must match the resolved profile exactly */
  ownerUsername: string;
  /** Owner profile ID — must match the resolved profile ID */
  ownerId: string;
  /** Direct link to the content on the platform */
  permalink: string;
  /** Whether the ownership has been validated */
  ownershipValidated: boolean;
}

export interface SearchOptions {
  /** The exact username to search for (will be normalized) */
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
  /** Debug information about the resolution process */
  debug: ResolutionDebug;
}

/**
 * Debug information for profile resolution and video collection.
 * Visible in the UI for verification.
 */
export interface ResolutionDebug {
  /** The original input from the user */
  requestedUsername: string;
  /** The normalized username after cleanup */
  normalizedUsername: string;
  /** The resolved profile (null if resolution failed) */
  resolvedProfile: ProfileInfo | null;
  /** Total videos fetched from the platform */
  totalFetched: number;
  /** Videos that passed ownership validation */
  ownershipPassed: number;
  /** Videos rejected due to owner mismatch */
  ownershipRejected: number;
  /** Any warnings during the process */
  warnings: string[];
  /** Resolution steps taken */
  steps: string[];
}

/**
 * Result of profile resolution.
 * Either succeeds with a ProfileInfo or fails with an error message.
 */
export type ProfileResolutionResult =
  | { success: true; profile: ProfileInfo; debug: ResolutionDebug }
  | { success: false; error: string; debug: ResolutionDebug };

/**
 * All providers must implement this interface.
 * Each platform has its own independent implementation.
 */
export interface ContentProvider {
  /** The platform this provider handles */
  readonly platform: Platform;

  /**
   * Resolve and validate a profile by username.
   *
   * This is the CRITICAL first step. It must:
   * 1. Normalize the input (remove @, spaces, etc.)
   * 2. Look up the exact profile (not approximate)
   * 3. Validate that the resolved profile matches the requested username
   * 4. Return success with validated profile, or failure with error
   *
   * MUST NOT return an approximate or similar profile.
   * If the exact profile cannot be found, return failure.
   */
  resolveProfile(username: string): Promise<ProfileResolutionResult>;

  /**
   * Fetch videos from a public profile.
   *
   * CRITICAL RULES:
   * - Only return videos that belong to the exact profile
   * - Every video must have ownerUsername === profile.username
   * - Every video must have ownerId === profile.id
   * - Reject any video where ownership cannot be confirmed
   * - Log all rejections in the debug output
   */
  getVideos(options: SearchOptions, profile: ProfileInfo): Promise<PaginatedResult<VideoMetadata>>;

  /** Fetch metadata for a single video by ID */
  getVideoMetadata(videoId: string): Promise<VideoMetadata>;

  /**
   * Fetch the media file for a video.
   * Returns a Blob that can be stored (e.g., Supabase Storage).
   * Only works with publicly accessible media URLs.
   */
  getMedia(video: VideoMetadata): Promise<Blob>;
}
