/**
 * URL Parser for Profile URLs
 *
 * Extracts platform and username from Instagram/TikTok profile URLs.
 * Does NOT perform any network requests — pure URL parsing only.
 *
 * Supported formats:
 *
 * Instagram:
 *   https://www.instagram.com/username/
 *   https://instagram.com/username/
 *   https://www.instagram.com/username
 *
 * TikTok:
 *   https://www.tiktok.com/@username
 *   https://www.tiktok.com/@username/
 *   https://vt.tiktok.com/XXXXX (redirect URL — not supported, needs real URL)
 */

import type { Platform } from '../providers/types';

export interface ParsedProfileUrl {
  /** Whether the URL was successfully parsed */
  valid: boolean;
  /** Detected platform */
  platform: Platform | null;
  /** Extracted username (without @) */
  username: string | null;
  /** Normalized profile URL */
  normalizedUrl: string | null;
  /** Error message if parsing failed */
  error: string | null;
}

/**
 * Parse a profile URL and extract platform + username.
 *
 * This is a PURE function — no network calls, no side effects.
 */
export function parseProfileUrl(input: string): ParsedProfileUrl {
  const trimmed = input.trim();

  if (!trimmed) {
    return { valid: false, platform: null, username: null, normalizedUrl: null, error: 'URL não pode estar vazia.' };
  }

  // Try to parse as URL
  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    // Not a valid URL — try adding https:// prefix
    try {
      url = new URL(`https://${trimmed}`);
    } catch {
      return { valid: false, platform: null, username: null, normalizedUrl: null, error: 'URL inválida. Cole a URL completa do perfil.' };
    }
  }

  const hostname = url.hostname.toLowerCase().replace(/^www\./, '');
  const pathname = url.pathname;

  // ── Instagram ──────────────────────────────────────────────
  if (hostname === 'instagram.com') {
    // Extract username from path: /username/ or /username
    const match = pathname.match(/^\/([a-zA-Z0-9._]+)\/?$/);
    if (!match) {
      return {
        valid: false,
        platform: 'instagram',
        username: null,
        normalizedUrl: null,
        error: 'URL do Instagram inválida. Formato esperado: https://www.instagram.com/username/',
      };
    }

    const username = match[1].toLowerCase();

    // Validate username format
    if (!/^[a-z0-9._]+$/.test(username) || username.length < 1 || username.length > 30) {
      return {
        valid: false,
        platform: 'instagram',
        username: null,
        normalizedUrl: null,
        error: `Username inválido: "${username}". Use apenas letras, números, pontos e underlines.`,
      };
    }

    return {
      valid: true,
      platform: 'instagram',
      username,
      normalizedUrl: `https://www.instagram.com/${username}/`,
      error: null,
    };
  }

  // ── TikTok ─────────────────────────────────────────────────
  if (hostname === 'tiktok.com') {
    // Extract username from path: /@username or /@username/
    const match = pathname.match(/^\/@([a-zA-Z0-9._]+)\/?$/);
    if (!match) {
      return {
        valid: false,
        platform: 'tiktok',
        username: null,
        normalizedUrl: null,
        error: 'URL do TikTok inválida. Formato esperado: https://www.tiktok.com/@username',
      };
    }

    const username = match[1].toLowerCase();

    if (!/^[a-z0-9._]+$/.test(username) || username.length < 1 || username.length > 30) {
      return {
        valid: false,
        platform: 'tiktok',
        username: null,
        normalizedUrl: null,
        error: `Username inválido: "${username}". Use apenas letras, números, pontos e underlines.`,
      };
    }

    return {
      valid: true,
      platform: 'tiktok',
      username,
      normalizedUrl: `https://www.tiktok.com/@${username}`,
      error: null,
    };
  }

  // ── Unknown platform ───────────────────────────────────────
  return {
    valid: false,
    platform: null,
    username: null,
    normalizedUrl: null,
    error: `Plataforma não suportada: "${hostname}". Use URLs do Instagram ou TikTok.`,
  };
}
