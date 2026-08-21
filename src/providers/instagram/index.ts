/**
 * Instagram Content Provider
 *
 * Fetches publicly accessible content from Instagram profiles.
 * Uses mock data for demonstration; in production, replace with:
 *   - Backend API calls to public endpoints
 *   - yt-dlp --dump-json for public Reels
 *   - Playwright-based public scraping (TOS consideration)
 *   - CrowdTangle / Meta Content Library APIs
 *
 * SECURITY RULES:
 * - Only public content (no login required to view)
 * - No credential storage
 * - No CAPTCHA bypass
 * - No anti-bot circumvention
 * - No DRM circumvention
 * - Only open-source tools
 */

import type {
  ContentProvider,
  ProfileInfo,
  VideoMetadata,
  PaginatedResult,
  SearchOptions,
} from '../types';
import { INSTAGRAM_PROFILES, generateInstagramVideos } from './mockData';

export class InstagramProvider implements ContentProvider {
  readonly platform = 'instagram' as const;

  async getProfile(username: string): Promise<ProfileInfo> {
    // Simulate network delay
    await this.delay(800);

    const profile = INSTAGRAM_PROFILES[username.toLowerCase()];
    if (!profile) {
      // Generate a generic profile for unknown usernames
      return {
        username: username.toLowerCase(),
        displayName: username,
        avatarUrl: `https://i.pravatar.cc/150?u=${username}`,
        bio: `Public profile: @${username}`,
        followers: Math.floor(Math.random() * 1_000_000) + 10_000,
        following: Math.floor(Math.random() * 2_000) + 100,
        postsCount: Math.floor(Math.random() * 5_000) + 50,
        platform: 'instagram',
      };
    }
    return profile;
  }

  async getVideos(options: SearchOptions): Promise<PaginatedResult<VideoMetadata>> {
    const { username, quantity } = options;

    // Simulate network delay for fetching profile data
    await this.delay(1200);

    // Generate realistic video metadata
    const allVideos = generateInstagramVideos(username, quantity);

    // Sort based on the selected criterion
    const sorted = this.sortVideos(allVideos, options.sortBy);

    return {
      items: sorted,
      total: sorted.length,
      returned: sorted.length,
      page: 0,
      hasMore: false,
    };
  }

  async getVideoMetadata(videoId: string): Promise<VideoMetadata> {
    await this.delay(400);

    // Extract profile from video ID pattern
    const parts = videoId.split('_');
    const profile = parts.length >= 3 ? parts.slice(1, -1).join('_') : 'unknown';

    return {
      id: videoId,
      title: `Video ${videoId}`,
      description: `Public video ${videoId}`,
      thumbnailUrl: `https://picsum.photos/seed/${videoId}/400/700`,
      videoUrl: `https://example.com/public-content/ig/${videoId}.mp4`,
      duration: 30,
      views: 100_000,
      likes: 10_000,
      comments: 500,
      publishedAt: new Date().toISOString(),
      platform: 'instagram',
      profile,
      permalink: `https://www.instagram.com/p/${videoId}`,
    };
  }

  async getMedia(video: VideoMetadata): Promise<Blob> {
    // In production, this fetches the actual video file from the public URL
    // For demo, we simulate by fetching a small placeholder
    try {
      const response = await fetch(video.videoUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch media: ${response.status}`);
      }
      return await response.blob();
    } catch {
      // Simulate a small placeholder blob for demo
      const placeholder = new Blob(
        [JSON.stringify({ id: video.id, title: video.title, simulated: true })],
        { type: 'application/json' }
      );
      return placeholder;
    }
  }

  private sortVideos(videos: VideoMetadata[], sortBy: string): VideoMetadata[] {
    const sorted = [...videos];
    switch (sortBy) {
      case 'views':
        return sorted.sort((a, b) => b.views - a.views);
      case 'likes':
        return sorted.sort((a, b) => b.likes - a.likes);
      case 'recent':
        return sorted.sort(
          (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        );
      default:
        return sorted;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
