/**
 * TikTok Content Provider
 *
 * Fetches publicly accessible content from TikTok profiles.
 *
 * CRITICAL: Profile resolution must be EXACT. No approximate matching.
 * If the exact profile cannot be found, return failure — never guess.
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
  ProfileResolutionResult,
  ResolutionDebug,
} from '../types';
import { TIKTOK_PROFILES, generateTikTokVideos } from './mockData';

// ── Normalization ──────────────────────────────────────────────

function normalizeUsername(input: string): string {
  return input
    .trim()
    .replace(/^@/, '')
    .replace(/\//g, '')
    .replace(/\s+/g, '')
    .toLowerCase();
}

export class TikTokProvider implements ContentProvider {
  readonly platform = 'tiktok' as const;

  async resolveProfile(inputUsername: string): Promise<ProfileResolutionResult> {
    const steps: string[] = [];
    const warnings: string[] = [];
    const normalized = normalizeUsername(inputUsername);

    steps.push(`Input received: "${inputUsername}"`);
    steps.push(`Normalized username: "${normalized}"`);

    if (!normalized || normalized.length < 1) {
      steps.push('FAILED: Empty username after normalization');
      return {
        success: false,
        error: 'Username não pode estar vazio.',
        debug: this.createDebug(inputUsername, normalized, null, 0, 0, 0, warnings, steps),
      };
    }

    if (!/^[a-z0-9._]+$/.test(normalized)) {
      steps.push(`FAILED: Invalid username format "${normalized}"`);
      return {
        success: false,
        error: `Username inválido: "${normalized}". Use apenas letras, números, pontos e underlines.`,
        debug: this.createDebug(inputUsername, normalized, null, 0, 0, 0, warnings, steps),
      };
    }

    steps.push(`Looking up exact profile: "${normalized}"`);
    const profile = TIKTOK_PROFILES[normalized];

    if (!profile) {
      steps.push(`FAILED: Profile "${normalized}" not found in known profiles database`);
      steps.push(`Available profiles: ${Object.keys(TIKTOK_PROFILES).join(', ')}`);
      return {
        success: false,
        error: `Não foi possível encontrar o perfil exato @${normalized}. Verifique se o username está correto.`,
        debug: this.createDebug(inputUsername, normalized, null, 0, 0, 0, warnings, steps),
      };
    }

    steps.push(`Profile found: @${profile.username} (ID: ${profile.id})`);
    steps.push(`Validating: profile.username.toLowerCase() === "${normalized}"`);

    if (profile.username.toLowerCase() !== normalized) {
      steps.push(`FAILED: Username mismatch! profile="${profile.username}" vs requested="${normalized}"`);
      return {
        success: false,
        error: 'Resolved profile does not match requested username.',
        debug: this.createDebug(inputUsername, normalized, profile, 0, 0, 0, warnings, steps),
      };
    }

    steps.push('Profile validation PASSED ✓');

    return {
      success: true,
      profile,
      debug: this.createDebug(inputUsername, normalized, profile, 0, 0, 0, warnings, steps),
    };
  }

  async getVideos(
    options: SearchOptions,
    resolvedProfile: ProfileInfo
  ): Promise<PaginatedResult<VideoMetadata>> {
    const steps: string[] = [];
    const warnings: string[] = [];
    const normalized = normalizeUsername(options.username);

    steps.push(`Fetching videos for: @${resolvedProfile.username} (ID: ${resolvedProfile.id})`);
    steps.push(`Requested quantity: ${options.quantity}, Sort: ${options.sortBy}`);

    const rawVideos = generateTikTokVideos(resolvedProfile.username, options.quantity);
    steps.push(`Raw videos fetched: ${rawVideos.length}`);

    let ownershipPassed = 0;
    let ownershipRejected = 0;

    const validatedVideos = rawVideos.filter((video) => {
      const videoOwner = normalizeUsername(video.ownerUsername);

      if (videoOwner !== resolvedProfile.username.toLowerCase()) {
        ownershipRejected++;
        warnings.push(`REJECTED video ${video.id}: owner="${video.ownerUsername}" !== profile="${resolvedProfile.username}"`);
        steps.push(`  ✗ REJECTED: ${video.id} (owner mismatch)`);
        return false;
      }

      if (video.ownerId !== resolvedProfile.id) {
        ownershipRejected++;
        warnings.push(`REJECTED video ${video.id}: ownerId mismatch`);
        steps.push(`  ✗ REJECTED: ${video.id} (ownerId mismatch)`);
        return false;
      }

      ownershipPassed++;
      steps.push(`  ✓ PASSED: ${video.id}`);
      return true;
    });

    steps.push(`Ownership validation: ${ownershipPassed} passed, ${ownershipRejected} rejected`);

    const sorted = this.sortVideos(validatedVideos, options.sortBy);

    return {
      items: sorted,
      total: sorted.length,
      returned: sorted.length,
      page: 0,
      hasMore: false,
      debug: this.createDebug(
        options.username, normalized, resolvedProfile,
        rawVideos.length, ownershipPassed, ownershipRejected,
        warnings, steps
      ),
    };
  }

  async getVideoMetadata(videoId: string): Promise<VideoMetadata> {
    const permalink = `https://www.tiktok.com/video/${videoId}`;
    return {
      id: videoId,
      title: `TikTok Video ${videoId}`,
      description: `Public TikTok video ${videoId}`,
      thumbnailUrl: `https://picsum.photos/seed/${videoId}/400/700`,
      videoUrl: permalink,
      duration: 20,
      views: 200_000,
      likes: 20_000,
      comments: 1_000,
      publishedAt: new Date().toISOString(),
      platform: 'tiktok',
      ownerUsername: 'unknown',
      ownerId: 'unknown',
      permalink,
      shareUrl: permalink,
      embedUrl: `https://www.tiktok.com/embed/v2/${videoId}`,
      ownershipValidated: false,
      status: 'found',
    };
  }

  async getMedia(video: VideoMetadata): Promise<Blob> {
    try {
      const response = await fetch(video.videoUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.blob();
    } catch {
      return new Blob(
        [JSON.stringify({ id: video.id, title: video.title, simulated: true })],
        { type: 'application/json' }
      );
    }
  }

  private sortVideos(videos: VideoMetadata[], sortBy: string): VideoMetadata[] {
    const sorted = [...videos];
    switch (sortBy) {
      case 'views':  return sorted.sort((a, b) => (b.views ?? 0) - (a.views ?? 0));
      case 'likes':  return sorted.sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0));
      case 'recent': return sorted.sort(
        (a, b) => new Date(b.publishedAt ?? 0).getTime() - new Date(a.publishedAt ?? 0).getTime()
      );
      default: return sorted;
    }
  }

  private createDebug(
    requested: string, normalized: string, profile: ProfileInfo | null,
    totalFetched: number, ownershipPassed: number, ownershipRejected: number,
    warnings: string[], steps: string[]
  ): ResolutionDebug {
    return {
      requestedUsername: requested,
      normalizedUsername: normalized,
      resolvedProfile: profile,
      totalFetched, ownershipPassed, ownershipRejected,
      warnings, steps,
      dataSource: 'mock',
    };
  }
}
