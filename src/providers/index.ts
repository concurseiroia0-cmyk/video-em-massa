/**
 * Provider Factory
 *
 * Creates the appropriate ContentProvider for each platform.
 * Instagram and TikTok are independent modules with no shared implementation code.
 *
 * Usage:
 *   const provider = createProvider('instagram');
 *   const profile = await provider.getProfile('natgeo');
 *   const videos = await provider.getVideos({ username: 'natgeo', platform: 'instagram', quantity: 100, sortBy: 'views' });
 */

import type { Platform, ContentProvider } from './types';
import { InstagramProvider } from './instagram';
import { TikTokProvider } from './tiktok';

const providers: Record<Platform, () => ContentProvider> = {
  instagram: () => new InstagramProvider(),
  tiktok: () => new TikTokProvider(),
};

export function createProvider(platform: Platform): ContentProvider {
  const factory = providers[platform];
  if (!factory) {
    throw new Error(`No provider available for platform: ${platform}`);
  }
  return factory();
}

export type { Platform, ContentProvider, VideoMetadata, ProfileInfo, SearchOptions, PaginatedResult, SortOption } from './types';
