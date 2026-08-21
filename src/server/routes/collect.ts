/**
 * Collection Routes
 *
 * POST /api/collect
 *
 * Collects public videos using yt-dlp.
 * Returns REAL data from the platform, or a clear error if yt-dlp is unavailable.
 *
 * SECURITY: Only public content, no credentials, no bypass mechanisms.
 */

import { Router } from 'express';
import { collectInstagram, collectTiktok, getYtdlpVersion } from '../utils/ytdlp.js';

const router = Router();

function sanitizeUsername(input: string): string | null {
  if (!input || typeof input !== 'string') return null;
  const cleaned = input.trim().replace(/^@/, '').replace(/\//g, '').replace(/\s+/g, '').toLowerCase();
  if (!/^[a-z0-9._]+$/.test(cleaned)) return null;
  if (cleaned.length < 1 || cleaned.length > 30) return null;
  return cleaned;
}

function validateQuantity(input: unknown): number {
  const n = Number(input);
  if (isNaN(n) || n < 1) return 10;
  if (n > 200) return 200;
  return Math.floor(n);
}

function validatePlatform(input: unknown): 'instagram' | 'tiktok' | null {
  if (input === 'instagram' || input === 'tiktok') return input;
  return null;
}

// ── POST /api/collect ──────────────────────────────────────────

router.post('/collect', async (req, res) => {
  const startTime = Date.now();

  try {
    // Check yt-dlp availability first
    const ytdlpVersion = await getYtdlpVersion();
    if (ytdlpVersion === 'NOT_INSTALLED') {
      return res.status(503).json({
        success: false,
        error: 'yt-dlp não está instalado. Instale com: pip install yt-dlp',
        details: 'yt-dlp is required for real video collection. Install it and restart the server.',
      });
    }

    const { platform, username, quantity, sortBy } = req.body;

    const validPlatform = validatePlatform(platform);
    if (!validPlatform) {
      return res.status(400).json({ success: false, error: 'Plataforma inválida.' });
    }

    const validUsername = sanitizeUsername(username);
    if (!validUsername) {
      return res.status(400).json({ success: false, error: 'Username inválido.' });
    }

    const validQuantity = validateQuantity(quantity);

    console.log(`[Collect] Platform: ${validPlatform}, Username: @${validUsername}, Quantity: ${validQuantity}, Sort: ${sortBy}`);
    console.log(`[Collect] yt-dlp version: ${ytdlpVersion}`);

    const result = validPlatform === 'instagram'
      ? await collectInstagram(validUsername, validQuantity)
      : await collectTiktok(validUsername, validQuantity);

    if (!result.success) {
      console.error(`[Collect] Failed: ${result.error}`);
      return res.status(500).json({
        success: false,
        error: 'Não foi possível obter os conteúdos públicos deste perfil.',
        details: result.error,
      });
    }

    // Sort videos
    let sorted = [...result.videos];
    switch (sortBy) {
      case 'views':
        sorted.sort((a, b) => (b.view_count || 0) - (a.view_count || 0));
        break;
      case 'likes':
        sorted.sort((a, b) => (b.like_count || 0) - (a.like_count || 0));
        break;
      case 'recent':
        sorted.sort((a, b) => {
          const dateA = a.upload_date ? new Date(a.upload_date).getTime() : 0;
          const dateB = b.upload_date ? new Date(b.upload_date).getTime() : 0;
          return dateB - dateA;
        });
        break;
    }

    const elapsed = Date.now() - startTime;
    console.log(`[Collect] Success: ${sorted.length} REAL videos in ${elapsed}ms`);

    res.json({
      success: true,
      videos: sorted,
      totalFound: sorted.length,
      elapsed,
      username: validUsername,
      platform: validPlatform,
      source: 'yt-dlp',
    });
  } catch (error) {
    console.error('[Collect] Unexpected error:', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor.' });
  }
});

// ── GET /api/health ────────────────────────────────────────────

router.get('/health', async (_req, res) => {
  const ytdlpVersion = await getYtdlpVersion();
  res.json({
    status: ytdlpVersion === 'NOT_INSTALLED' ? 'degraded' : 'ok',
    ytdlp: ytdlpVersion,
    ytdlpAvailable: ytdlpVersion !== 'NOT_INSTALLED',
    timestamp: new Date().toISOString(),
  });
});

export default router;
