/**
 * Collection Routes
 *
 * POST /api/collect
 *
 * Collects public videos from Instagram or TikTok profiles
 * using yt-dlp (open-source, no authentication required).
 *
 * SECURITY:
 * - Only public content
 * - No credentials stored or passed
 * - Username is sanitized before use
 * - All URLs are validated
 */

import { Router } from 'express';
import { collectInstagram, collectTiktok, getYtdlpVersion } from '../utils/ytdlp.js';

const router = Router();

// ── Input Validation ───────────────────────────────────────────

function sanitizeUsername(input: string): string | null {
  if (!input || typeof input !== 'string') return null;
  const cleaned = input
    .trim()
    .replace(/^@/, '')
    .replace(/\//g, '')
    .replace(/\s+/g, '')
    .toLowerCase();
  // Only allow alphanumeric, dots, underscores
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
    const { platform, username, quantity, sortBy } = req.body;

    // Validate inputs
    const validPlatform = validatePlatform(platform);
    if (!validPlatform) {
      return res.status(400).json({
        success: false,
        error: 'Plataforma inválida. Use "instagram" ou "tiktok".',
      });
    }

    const validUsername = sanitizeUsername(username);
    if (!validUsername) {
      return res.status(400).json({
        success: false,
        error: 'Username inválido. Use apenas letras, números, pontos e underlines.',
      });
    }

    const validQuantity = validateQuantity(quantity);

    console.log(`[Collect] Platform: ${validPlatform}, Username: @${validUsername}, Quantity: ${validQuantity}, Sort: ${sortBy}`);

    // Collect videos
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
    console.log(`[Collect] Success: ${sorted.length} videos in ${elapsed}ms`);

    res.json({
      success: true,
      videos: sorted,
      totalFound: sorted.length,
      elapsed,
      username: validUsername,
      platform: validPlatform,
    });
  } catch (error) {
    console.error('[Collect] Unexpected error:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor.',
    });
  }
});

// ── GET /api/health ────────────────────────────────────────────

router.get('/health', async (_req, res) => {
  const ytdlpVersion = await getYtdlpVersion();
  res.json({
    status: 'ok',
    ytdlp: ytdlpVersion,
    timestamp: new Date().toISOString(),
  });
});

export default router;
