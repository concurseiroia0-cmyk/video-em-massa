/**
 * yt-dlp Wrapper
 *
 * Uses yt-dlp (open-source, Unlicense) to fetch PUBLIC video data.
 * No authentication, no cookies, no login required.
 *
 * SECURITY: Only accesses publicly viewable content.
 * No bypass of CAPTCHA, DRM, or anti-bot mechanisms.
 *
 * Dependencies:
 * - yt-dlp must be installed on the system
 *   macOS: brew install yt-dlp
 *   Linux: pip install yt-dlp
 *   Windows: winget install yt-dlp
 */

import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

export interface YtdlpVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  url: string;
  webpage_url: string;
  duration: number | null;
  view_count: number | null;
  like_count: number | null;
  comment_count: number | null;
  upload_date: string | null;
  uploader: string | null;
  uploader_id: string | null;
  webpage_url_domain: string;
  ext: string;
}

export interface CollectResult {
  success: boolean;
  videos: YtdlpVideo[];
  totalFound: number;
  error?: string;
  command?: string;
}

/**
 * Collect videos from a public Instagram profile using yt-dlp.
 * Fetches Reels from the profile page.
 */
export async function collectInstagram(
  username: string,
  quantity: number
): Promise<CollectResult> {
  const url = `https://www.instagram.com/${username}/reels/`;
  return collectWithYtdlp(url, quantity, 'instagram');
}

/**
 * Collect videos from a public TikTok profile using yt-dlp.
 * Fetches videos from the user's page.
 */
export async function collectTiktok(
  username: string,
  quantity: number
): Promise<CollectResult> {
  const url = `https://www.tiktok.com/@${username}`;
  return collectWithYtdlp(url, quantity, 'tiktok');
}

/**
 * Core collection function using yt-dlp.
 *
 * Flags used:
 * --dump-json          Output video metadata as JSON
 * --flat-playlist      Don't download, just list videos
 * --playlist-items     Limit number of videos
 * --no-warnings        Suppress warnings
 * --no-check-certificates  Don't validate SSL
 */
async function collectWithYtdlp(
  url: string,
  quantity: number,
  platform: string
): Promise<CollectResult> {
  const args = [
    '--dump-json',
    '--flat-playlist',
    '--playlist-items', `1:${quantity}`,
    '--no-warnings',
    '--no-check-certificates',
    url,
  ];

  const command = `yt-dlp ${args.join(' ')}`;

  try {
    const { stdout, stderr } = await execFileAsync('yt-dlp', args, {
      timeout: 120_000, // 2 minutes timeout
      maxBuffer: 50 * 1024 * 1024, // 50MB buffer
      encoding: 'utf-8',
    });

    if (!stdout || stdout.trim() === '') {
      return {
        success: false,
        videos: [],
        totalFound: 0,
        error: stderr || 'No data returned from yt-dlp',
        command,
      };
    }

    // Parse JSON lines (yt-dlp outputs one JSON per line)
    const lines = stdout.trim().split('\n').filter(Boolean);
    const videos: YtdlpVideo[] = [];

    for (const line of lines) {
      try {
        const data = JSON.parse(line);
        videos.push({
          id: data.id || data.display_id || `${platform}_${videos.length}`,
          title: data.title || data.fulltitle || data.description?.substring(0, 100) || 'Sem título',
          description: data.description || '',
          thumbnail: data.thumbnail || data.thumbnails?.[0]?.url || '',
          url: data.url || data.webpage_url || '',
          webpage_url: data.webpage_url || data.url || '',
          duration: data.duration || null,
          view_count: data.view_count || null,
          like_count: data.like_count || null,
          comment_count: data.comment_count || null,
          upload_date: data.upload_date || null,
          uploader: data.uploader || data.channel || null,
          uploader_id: data.uploader_id || data.channel_id || null,
          webpage_url_domain: platform,
          ext: data.ext || 'mp4',
        });
      } catch {
        // Skip malformed JSON lines
        continue;
      }
    }

    return {
      success: true,
      videos,
      totalFound: videos.length,
      command,
    };
  } catch (error: unknown) {
    const err = error as { message?: string; code?: number; stderr?: string };
    return {
      success: false,
      videos: [],
      totalFound: 0,
      error: err.stderr || err.message || 'yt-dlp execution failed',
      command,
    };
  }
}

/**
 * Get yt-dlp version info for debugging.
 */
export async function getYtdlpVersion(): Promise<string> {
  try {
    const { stdout } = await execFileAsync('yt-dlp', ['--version'], {
      timeout: 5000,
    });
    return stdout.trim();
  } catch {
    return 'NOT_INSTALLED';
  }
}
