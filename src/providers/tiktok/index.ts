/**
 * TikTok Content Provider
 *
 * Fetches publicly accessible content from TikTok profiles.
 * Uses mock data for demonstration; in production, replace with:
 *   - yt-dlp --dump-json for public TikTok videos
 *   - cobalt.tools API (open-source video download service)
 *   - Playwright-based public scraping (TOS consideration)
 *   - TikTok embed API (for public video metadata)
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
import { TIKTOK_PROFILES, generateTikTokVideos } from './mockData';

export class TikTokProvider implements ContentProvider {
  readonly platform = 'tiktok' as const;

  async getProfile(username: string): Promise<ProfileInfo> {
    await this.delay(900);

    const cleanUsername = username.replace('@', '').toLowerCase();
    const profile = TIKTOK_PROFILES[cleanUsername];
    if (!profile) {
      return {
        username: cleanUsername,
        displayName: cleanUsername,
        avatarUrl: `https://i.pravatar.cc/150?u=${cleanUsername}`,
        bio: `Public TikTok profile: @${cleanUsername}`,
        followers: Math.floor(Math.random() * 5_000_000) + 50_000,
        following: Math.floor(Math.random() * 1_000) + 50,
        postsCount: Math.floor(Math.random() * 10_000) + 100,
        platform: 'tiktok',
      };
    }
    return profile;
  }

  async getVideos(options: SearchOptions): Promise<PaginatedResult<VideoMetadata>> {
    const { username, quantity } = options;
    const cleanUsername = username.replace('@', '').toLowerCase();

    await this.delay(1000);

    const allVideos = generateTikTokVideos(cleanUsername, quantity);
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
    await this.delay(350);

    return {
      id: videoId,
      title: `TikTok Video ${videoId}`,
      description: `Public TikTok video ${videoId}`,
      thumbnailUrl: `https://picsum.photos/seed/${videoId}/400/700`,
      videoUrl: `https://example.com/public-content/tt/${videoId}.mp4`,
      duration: 20,
      views: 200_000,
      likes: 20_000,
      comments: 1_000,
      publishedAt: new Date().toISOString(),
      platform: 'tiktok',
      profile: 'unknown',
      permalink: `https://www.tiktok.com/video/${videoId}`,
    };
  }

  async getMedia(video: VideoMetadata): Promise<Blob> {
    try {
      const response = await fetch(video.videoUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch media: ${response.status}`);
      }
      return await response.blob();
    } catch {
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
