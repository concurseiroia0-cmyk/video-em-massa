/**
 * Common interface that all platform providers must implement.
 * Providers are independent modules — Instagram and TikTok never share code.
 *
 * SECURITY: Providers only access PUBLIC content. No credentials, no auth bypass,
 * no CAPTCHA circumvention, no DRM circumvention. Only open-source tools are used.
 */

export type Platform = 'instagram' | 'tiktok';

export type SortOption = 'views' | 'recent' | 'likes';

/** Status of collected content in the pipeline */
export type ContentStatus =
  | 'found'        // Just discovered
  | 'selected'     // User selected it
  | 'queued'       // In import queue
  | 'importing'    // Being downloaded
  | 'imported'     // Downloaded to storage
  | 'processing'   // Being processed by editor
  | 'completed'    // Fully processed
  | 'failed';      // Error occurred

export interface ProfileInfo {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  bio: string;
  followers: number;
  following: number;
  postsCount: number;
  platform: Platform;
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
  duration: number | null;
  /** View count (null if unavailable) */
  views: number | null;
  /** Like count (null if unavailable) */
  likes: number | null;
  /** Comment count (null if unavailable) */
  comments: number | null;
  /** ISO date string of when it was published (null if unavailable) */
  publishedAt: string | null;
  /** Source platform */
  platform: Platform;
  /** Owner profile username */
  ownerUsername: string;
  /** Owner profile ID */
  ownerId: string;
  /** Permanent link to the original content on the platform */
  permalink: string;
  /** Shareable URL for the content (may differ from permalink) */
  shareUrl: string;
  /** Embed URL for iframe preview (null if not available) */
  embedUrl: string | null;
  /** Whether the ownership has been validated */
  ownershipValidated: boolean;
  /** Current status in the pipeline */
  status: ContentStatus;
}

export interface SearchOptions {
  username: string;
  platform: Platform;
  quantity: number;
  sortBy: SortOption;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  returned: number;
  page: number;
  hasMore: boolean;
  debug: ResolutionDebug;
}

export interface ResolutionDebug {
  requestedUsername: string;
  normalizedUsername: string;
  resolvedProfile: ProfileInfo | null;
  totalFetched: number;
  ownershipPassed: number;
  ownershipRejected: number;
  warnings: string[];
  steps: string[];
  /** Backend source: 'api' | 'mock' */
  dataSource: 'api' | 'mock';
  /** Elapsed time in ms */
  elapsed?: number;
}

export type ProfileResolutionResult =
  | { success: true; profile: ProfileInfo; debug: ResolutionDebug }
  | { success: false; error: string; debug: ResolutionDebug };

/**
 * All providers must implement this interface.
 */
export interface ContentProvider {
  readonly platform: Platform;

  resolveProfile(username: string): Promise<ProfileResolutionResult>;

  getVideos(options: SearchOptions, profile: ProfileInfo): Promise<PaginatedResult<VideoMetadata>>;

  getVideoMetadata(videoId: string): Promise<VideoMetadata>;

  getMedia(video: VideoMetadata): Promise<Blob>;
}
