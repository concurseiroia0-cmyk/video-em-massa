/**
 * Instagram Content Provider
 *
 * Fetches publicly accessible content from Instagram profiles.
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
import { INSTAGRAM_PROFILES, generateInstagramVideos } from './mockData';

// ── Normalization ──────────────────────────────────────────────

function normalizeUsername(input: string): string {
  return input
    .trim()
    .replace(/^@/, '')       // Remove leading @
    .replace(/\//g, '')      // Remove slashes
    .replace(/\s+/g, '')    // Remove spaces
    .toLowerCase();          // Case-insensitive
}

// ── Known Profiles Database ────────────────────────────────────
// In production, this would be a real API lookup.
// For the mock, we use the hardcoded profiles as "verified" data.

const KNOWN_PROFILES: Record<string, ProfileInfo> = {
  ...INSTAGRAM_PROFILES,
  // Additional profiles for testing
  'flamengo': {
    id: 'ig_flamengo_12345',
    username: 'flamengo',
    displayName: 'Flamengo',
    avatarUrl: 'https://i.pravatar.cc/150?u=flamengo',
    bio: 'Clube de Regatas do Flamengo ⚽🔥',
    followers: 45_000_000,
    following: 350,
    postsCount: 12_000,
    platform: 'instagram',
    profileUrl: 'https://www.instagram.com/flamengo',
  },
  'corinthians': {
    id: 'ig_corinthians_12346',
    username: 'corinthians',
    displayName: 'Corinthians',
    avatarUrl: 'https://i.pravatar.cc/150?u=corinthians',
    bio: 'Sport Club Corinthians Paulista ⚽',
    followers: 38_000_000,
    following: 280,
    postsCount: 10_000,
    platform: 'instagram',
    profileUrl: 'https://www.instagram.com/corinthians',
  },
  'paulopablo': {
    id: 'ig_paulopablo_12347',
    username: 'paulopablo',
    displayName: 'Paulo Pablo',
    avatarUrl: 'https://i.pravatar.cc/150?u=paulopablo',
    bio: 'Conteúdo criativo',
    followers: 5_000_000,
    following: 200,
    postsCount: 3_000,
    platform: 'instagram',
    profileUrl: 'https://www.instagram.com/paulopablo',
  },
};

export class InstagramProvider implements ContentProvider {
  readonly platform = 'instagram' as const;

  async resolveProfile(inputUsername: string): Promise<ProfileResolutionResult> {
    const steps: string[] = [];
    const warnings: string[] = [];
    const normalized = normalizeUsername(inputUsername);

    steps.push(`Input received: "${inputUsername}"`);
    steps.push(`Normalized username: "${normalized}"`);

    // Step 1: Validate username format
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

    // Step 2: Look up exact profile in known database
    steps.push(`Looking up exact profile: "${normalized}"`);
    const profile = KNOWN_PROFILES[normalized];

    if (!profile) {
      steps.push(`FAILED: Profile "${normalized}" not found in known profiles database`);
      steps.push(`Available profiles: ${Object.keys(KNOWN_PROFILES).join(', ')}`);
      return {
        success: false,
        error: `Não foi possível encontrar o perfil exato @${normalized}. Verifique se o username está correto.`,
        debug: this.createDebug(inputUsername, normalized, null, 0, 0, 0, warnings, steps),
      };
    }

    // Step 3: Validate the resolved profile matches EXACTLY
    steps.push(`Profile found: @${profile.username} (ID: ${profile.id})`);
    steps.push(`Validating: profile.username.toLowerCase() === "${normalized}"`);

    if (profile.username.toLowerCase() !== normalized) {
      steps.push(`FAILED: Username mismatch! profile="${profile.username}" vs requested="${normalized}"`);
      return {
        success: false,
        error: `Resolved profile does not match requested username.`,
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

    // Fetch raw videos from source
    const rawVideos = generateInstagramVideos(resolvedProfile.username, options.quantity);
    steps.push(`Raw videos fetched: ${rawVideos.length}`);

    // OWNERSHIP VALIDATION: Check every single video
    let ownershipPassed = 0;
    let ownershipRejected = 0;

    const validatedVideos = rawVideos.filter((video) => {
      const videoOwner = normalizeUsername(video.ownerUsername);

      // Validate owner matches resolved profile
      if (videoOwner !== resolvedProfile.username.toLowerCase()) {
        ownershipRejected++;
        warnings.push(
          `REJECTED video ${video.id}: owner="${video.ownerUsername}" !== profile="${resolvedProfile.username}"`
        );
        steps.push(`  ✗ REJECTED: ${video.id} (owner mismatch: "${video.ownerUsername}" !== "${resolvedProfile.username}")`);
        return false;
      }

      // Validate owner ID matches
      if (video.ownerId !== resolvedProfile.id) {
        ownershipRejected++;
        warnings.push(
          `REJECTED video ${video.id}: ownerId="${video.ownerId}" !== profileId="${resolvedProfile.id}"`
        );
        steps.push(`  ✗ REJECTED: ${video.id} (ownerId mismatch)`);
        return false;
      }

      ownershipPassed++;
      steps.push(`  ✓ PASSED: ${video.id}`);
      return true;
    });

    steps.push(`Ownership validation: ${ownershipPassed} passed, ${ownershipRejected} rejected`);

    // Sort the validated videos
    const sorted = this.sortVideos(validatedVideos, options.sortBy);

    return {
      items: sorted,
      total: sorted.length,
      returned: sorted.length,
      page: 0,
      hasMore: false,
      debug: this.createDebug(
        options.username,
        normalized,
        resolvedProfile,
        rawVideos.length,
        ownershipPassed,
        ownershipRejected,
        warnings,
        steps
      ),
    };
  }

  async getVideoMetadata(videoId: string): Promise<VideoMetadata> {
    return {
      id: videoId,
      title: `Instagram Video ${videoId}`,
      description: `Public Instagram video ${videoId}`,
      thumbnailUrl: `https://picsum.photos/seed/${videoId}/400/700`,
      videoUrl: `https://example.com/public-content/ig/${videoId}.mp4`,
      duration: 30,
      views: 100_000,
      likes: 10_000,
      comments: 500,
      publishedAt: new Date().toISOString(),
      platform: 'instagram',
      ownerUsername: 'unknown',
      ownerId: 'unknown',
      permalink: `https://www.instagram.com/p/${videoId}`,
      ownershipValidated: false,
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

  // ── Private Helpers ──────────────────────────────────────────

  private sortVideos(videos: VideoMetadata[], sortBy: string): VideoMetadata[] {
    const sorted = [...videos];
    switch (sortBy) {
      case 'views':  return sorted.sort((a, b) => b.views - a.views);
      case 'likes':  return sorted.sort((a, b) => b.likes - a.likes);
      case 'recent': return sorted.sort(
        (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );
      default: return sorted;
    }
  }

  private createDebug(
    requested: string,
    normalized: string,
    profile: ProfileInfo | null,
    totalFetched: number,
    ownershipPassed: number,
    ownershipRejected: number,
    warnings: string[],
    steps: string[]
  ): ResolutionDebug {
    return {
      requestedUsername: requested,
      normalizedUsername: normalized,
      resolvedProfile: profile,
      totalFetched,
      ownershipPassed,
      ownershipRejected,
      warnings,
      steps,
    };
  }
}
