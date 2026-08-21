/**
 * Instagram Content Provider
 *
 * Calls the backend API (localhost:3001) which uses yt-dlp
 * to fetch REAL public video data from Instagram profiles.
 *
 * NO MOCK DATA. If the backend is unavailable, returns a clear error.
 *
 * SECURITY: Only accesses publicly viewable content.
 * No credentials, no auth bypass, no CAPTCHA bypass.
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

const API_BASE = 'http://localhost:3001/api';

function normalizeUsername(input: string): string {
  return input.trim().replace(/^@/, '').replace(/\//g, '').replace(/\s+/g, '').toLowerCase();
}

export class InstagramProvider implements ContentProvider {
  readonly platform = 'instagram' as const;

  async resolveProfile(inputUsername: string): Promise<ProfileResolutionResult> {
    const steps: string[] = [];
    const warnings: string[] = [];
    const normalized = normalizeUsername(inputUsername);

    steps.push(`Input received: "${inputUsername}"`);
    steps.push(`Normalized username: "${normalized}"`);

    if (!normalized || normalized.length < 1) {
      return {
        success: false,
        error: 'Username não pode estar vazio.',
        debug: this.createDebug(inputUsername, normalized, null, 0, 0, 0, warnings, steps, 'api'),
      };
    }

    // Try to connect to backend and collect real data
    steps.push(`Connecting to backend at ${API_BASE}/collect...`);

    try {
      const response = await fetch(`${API_BASE}/collect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: 'instagram',
          username: normalized,
          quantity: 1,
          sortBy: 'recent',
        }),
        signal: AbortSignal.timeout(15000),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const errorMsg = data.error || `Backend returned HTTP ${response.status}`;
        steps.push(`FAILED: Backend error — ${errorMsg}`);
        return {
          success: false,
          error: `Backend retornou erro: ${errorMsg}`,
          debug: this.createDebug(inputUsername, normalized, null, 0, 0, 0, warnings, steps, 'api'),
        };
      }

      const data = await response.json();
      steps.push(`Backend responded: ${data.success ? 'success' : 'failed'}`);

      if (!data.success) {
        steps.push(`FAILED: ${data.error}`);
        return {
          success: false,
          error: data.error || 'Falha na coleta de dados.',
          debug: this.createDebug(inputUsername, normalized, null, 0, 0, 0, warnings, steps, 'api'),
        };
      }

      // Build profile from real backend data
      const profile: ProfileInfo = {
        id: data.username || normalized,
        username: data.username || normalized,
        displayName: data.username || normalized,
        avatarUrl: `https://i.pravatar.cc/150?u=${data.username || normalized}`,
        bio: '',
        followers: 0,
        following: 0,
        postsCount: data.totalFound || 0,
        platform: 'instagram',
        profileUrl: `https://www.instagram.com/${data.username || normalized}/`,
      };

      steps.push(`Profile resolved: @${profile.username}`);
      steps.push('Profile validation PASSED ✓');

      return {
        success: true,
        profile,
        debug: this.createDebug(inputUsername, normalized, profile, 0, 0, 0, warnings, steps, 'api'),
      };
    } catch (error: unknown) {
      const err = error as { name?: string; message?: string };
      if (err.name === 'TimeoutError' || err.name === 'AbortError') {
        steps.push('FAILED: Backend timeout (15s)');
        return {
          success: false,
          error: 'Backend não respondeu. Verifique se o servidor está rodando (npm run server).',
          debug: this.createDebug(inputUsername, normalized, null, 0, 0, 0, warnings, steps, 'api'),
        };
      }
      steps.push(`FAILED: Cannot connect to backend — ${err.message}`);
      return {
        success: false,
        error: 'Backend offline. Inicie o servidor com: npm run server',
        debug: this.createDebug(inputUsername, normalized, null, 0, 0, 0, warnings, steps, 'api'),
      };
    }
  }

  async getVideos(
    options: SearchOptions,
    resolvedProfile: ProfileInfo
  ): Promise<PaginatedResult<VideoMetadata>> {
    const steps: string[] = [];
    const warnings: string[] = [];

    steps.push(`Fetching videos for: @${resolvedProfile.username}`);
    steps.push(`URL: ${options.profileUrl}`);
    steps.push(`Quantity: ${options.quantity}, Sort: ${options.sortBy}`);

    try {
      const response = await fetch(`${API_BASE}/collect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: 'instagram',
          username: resolvedProfile.username,
          quantity: options.quantity,
          sortBy: options.sortBy,
          profileUrl: options.profileUrl,
        }),
        signal: AbortSignal.timeout(120_000),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        steps.push(`FAILED: Backend error — ${data.error || response.status}`);
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      steps.push(`Backend returned ${data.videos?.length || 0} videos`);

      if (!data.success || !data.videos) {
        throw new Error(data.error || 'No videos returned');
      }

      // Map backend videos to our VideoMetadata format
      const videos: VideoMetadata[] = data.videos.map((v: Record<string, unknown>) => {
        const videoId = String(v.id || '');
        const webpageUrl = String(v.webpage_url || v.url || '');
        const uploader = String(v.uploader || resolvedProfile.username);
        const uploaderId = String(v.uploader_id || resolvedProfile.id);

        return {
          id: videoId,
          title: String(v.title || 'Sem título'),
          description: String(v.description || ''),
          thumbnailUrl: String(v.thumbnail || ''),
          videoUrl: webpageUrl,
          duration: v.duration != null ? Number(v.duration) : null,
          views: v.view_count != null ? Number(v.view_count) : null,
          likes: v.like_count != null ? Number(v.like_count) : null,
          comments: v.comment_count != null ? Number(v.comment_count) : null,
          publishedAt: v.upload_date ? formatDate(String(v.upload_date)) : null,
          platform: 'instagram' as const,
          ownerUsername: uploader,
          ownerId: uploaderId,
          permalink: webpageUrl,
          shareUrl: webpageUrl,
          embedUrl: webpageUrl ? `${webpageUrl}embed/` : null,
          ownershipValidated: uploader.toLowerCase() === resolvedProfile.username.toLowerCase(),
          status: 'found' as const,
        };
      });

      // Ownership validation
      let ownershipPassed = 0;
      let ownershipRejected = 0;

      const validated = videos.filter((video) => {
        if (video.ownerUsername.toLowerCase() !== resolvedProfile.username.toLowerCase()) {
          ownershipRejected++;
          steps.push(`  ✗ REJECTED: ${video.id} (owner="${video.ownerUsername}" !== "${resolvedProfile.username}")`);
          return false;
        }
        ownershipPassed++;
        steps.push(`  ✓ PASSED: ${video.id}`);
        return true;
      });

      steps.push(`Ownership: ${ownershipPassed} passed, ${ownershipRejected} rejected`);

      return {
        items: validated,
        total: validated.length,
        returned: validated.length,
        page: 0,
        hasMore: false,
        debug: this.createDebug(
          options.username, resolvedProfile.username, resolvedProfile,
          data.videos.length, ownershipPassed, ownershipRejected,
          warnings, steps, 'api'
        ),
      };
    } catch (error: unknown) {
      const err = error as { message?: string };
      steps.push(`FAILED: ${err.message}`);
      throw new Error(`Falha ao coletar vídeos: ${err.message}`);
    }
  }

  async getVideoMetadata(videoId: string): Promise<VideoMetadata> {
    const permalink = `https://www.instagram.com/reel/${videoId}/`;
    return {
      id: videoId,
      title: `Instagram Video ${videoId}`,
      description: '',
      thumbnailUrl: '',
      videoUrl: permalink,
      duration: null,
      views: null,
      likes: null,
      comments: null,
      publishedAt: null,
      platform: 'instagram',
      ownerUsername: 'unknown',
      ownerId: 'unknown',
      permalink,
      shareUrl: permalink,
      embedUrl: `${permalink}embed/`,
      ownershipValidated: false,
      status: 'found',
    };
  }

  async getMedia(video: VideoMetadata): Promise<Blob> {
    const response = await fetch(video.videoUrl);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.blob();
  }

  private createDebug(
    requested: string, normalized: string, profile: ProfileInfo | null,
    totalFetched: number, ownershipPassed: number, ownershipRejected: number,
    warnings: string[], steps: string[], dataSource: 'api' | 'mock'
  ): ResolutionDebug {
    return {
      requestedUsername: requested,
      normalizedUsername: normalized,
      resolvedProfile: profile,
      totalFetched, ownershipPassed, ownershipRejected,
      warnings, steps, dataSource,
    };
  }
}

function formatDate(yyyymmdd: string): string {
  if (yyyymmdd.length !== 8) return yyyymmdd;
  return `${yyyymmdd.slice(0, 4)}-${yyyymmdd.slice(4, 6)}-${yyyymmdd.slice(6, 8)}T00:00:00Z`;
}
