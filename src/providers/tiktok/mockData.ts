/**
 * Mock data for TikTok provider.
 *
 * In production, this would be replaced by a backend service that fetches
 * public data using tools like:
 * - yt-dlp (excellent TikTok support for public videos)
 * - cobalt.tools API (open-source, for public video download)
 * - Playwright-based public scraping (TOS consideration)
 *
 * SECURITY: All mock data represents publicly accessible content only.
 */

import type { VideoMetadata, ProfileInfo } from '../types';

// ── Known Profile Database ─────────────────────────────────────

export const TIKTOK_PROFILES: Record<string, ProfileInfo> = {
  'khaby.lame': {
    id: 'tt_khaby_001',
    username: 'khaby.lame',
    displayName: 'Khabane lame',
    avatarUrl: 'https://i.pravatar.cc/150?u=khaby',
    bio: 'If you wanna laugh you are in the right place 😂',
    followers: 162_000_000,
    following: 120,
    postsCount: 1_800,
    platform: 'tiktok',
    profileUrl: 'https://www.tiktok.com/@khaby.lame',
  },
  'charlidamelio': {
    id: 'tt_charli_002',
    username: 'charlidamelio',
    displayName: "Charli D'Amelio",
    avatarUrl: 'https://i.pravatar.cc/150?u=charli',
    bio: 'founder @beacosmetics 🌿',
    followers: 155_000_000,
    following: 2_400,
    postsCount: 3_200,
    platform: 'tiktok',
    profileUrl: 'https://www.tiktok.com/@charlidamelio',
  },
  'foodtalks': {
    id: 'tt_foodtalks_003',
    username: 'foodtalks',
    displayName: 'Food Talks',
    avatarUrl: 'https://i.pravatar.cc/150?u=foodtalks',
    bio: 'The best food content 🍜🍕🌮',
    followers: 8_500_000,
    following: 300,
    postsCount: 4_100,
    platform: 'tiktok',
    profileUrl: 'https://www.tiktok.com/@foodtalks',
  },
  'flamengo': {
    id: 'tt_flamengo_004',
    username: 'flamengo',
    displayName: 'Flamengo',
    avatarUrl: 'https://i.pravatar.cc/150?u=flamengo',
    bio: 'Clube de Regatas do Flamengo ⚽🔥 Mengão no TikTok',
    followers: 25_000_000,
    following: 150,
    postsCount: 5_000,
    platform: 'tiktok',
    profileUrl: 'https://www.tiktok.com/@flamengo',
  },
  'corinthians': {
    id: 'tt_corinthians_005',
    username: 'corinthians',
    displayName: 'Corinthians',
    avatarUrl: 'https://i.pravatar.cc/150?u=corinthians',
    bio: 'Sport Club Corinthians Paulista ⚽ Fiel',
    followers: 20_000_000,
    following: 180,
    postsCount: 4_000,
    platform: 'tiktok',
    profileUrl: 'https://www.tiktok.com/@corinthians',
  },
};

// ── Content Templates (per-profile) ────────────────────────────

const CONTENT_BY_PROFILE: Record<string, string[]> = {
  'flamengo': [
    'GOLAÇO do Flamengo! ⚽🔥 #flamengo #fyp',
    'Jogadaça do Mengão na Libertadores #mengao',
    'Torcida em festa no Maracanã 🎉 #flamengo',
    'Treino dos jogadores do Flamengo #mengao',
    'Resumo: Flamengo 3 x 0 🔥 #futebol',
    'Artur Arrepiou! Gol de placa #flamengo',
    'Entrevista do técnico #mengao',
    'Melhores jogadas da temporada #flamengo',
    'Flamengo lidera o Brasileirão #mengao',
    'Flamengo campeão! 🏆🔥 #flamengo',
    'Gol olímpico no Maracanã #futebol',
    'Drible que virou viral #flamengo',
    'Cerimônia do troféu 🏆 #mengao',
    'Último jogo da temporada #flamengo',
    'Reação da torcida #mengao',
    'Gol de cabeça #flamengo',
    'Jogador revelação #mengao',
    'Destaque do jogo #flamengo',
    'Comemoração coletiva #mengao',
    'Gols da temporada #flamengo',
  ],
  'khaby.lame': [
    'Wait for the ending 😱 #viral #khaby',
    'This hack will change your life ✨',
    'POV: You discover the truth 💀',
    'The most satisfying thing ever #khaby',
    'Trying this viral trend... #fyp',
    'Life hack 101 🔥',
    'No way this actually worked! #khaby',
    'When you think it\'s over but it\'s not 😂',
    'Replying to @user: here you go! #khaby',
    'Story time: the craziest thing #viral',
    'Rating trending foods: part 42',
    'When common sense wins again #khaby',
    'The face says it all 😂 #fyp',
    'Why do people make it complicated? #khaby',
    'Another one solved 🤌 #viral',
    'Simple is best #khaby #fyp',
    'The universal reaction 😂',
    'When you keep it real #khaby',
    'My new favorite thing #viral',
    'The end is priceless 💀 #khaby',
  ],
  'charlidamelio': [
    'New dance tutorial 💃 #fyp #charli',
    'Get ready with me 🌿 #grwm',
    'Behind the scenes at the shoot ✨',
    'Duet with @markdamerico 💕',
    'My morning routine ☀️ #charli',
    'Trying new trends 🎵 #fyp',
    'Beach day vibes 🌊 #charli',
    'Coffee and content ☕',
    'New day, new fit 👗 #ootd',
    'Studio session 🎤 #charli',
    'Working on something special ✨',
    'The best day ever 💕 #fyp',
    'Family time 👨‍👩‍👧 #charli',
    'Concert night 🎶 #live',
    'Quick Q&A with me 💬 #charli',
  ],
};

// ── Video Generator ────────────────────────────────────────────

export function generateTikTokVideos(profileUsername: string, count: number): VideoMetadata[] {
  const profile = TIKTOK_PROFILES[profileUsername];
  const ownerId = profile?.id ?? `tt_${profileUsername}_unknown`;
  const ownerUsername = profileUsername;

  const templates = CONTENT_BY_PROFILE[profileUsername] || [
    `Conteúdo público de @${profileUsername} #1`,
    `Conteúdo público de @${profileUsername} #2`,
    `Conteúdo público de @${profileUsername} #3`,
    `Conteúdo público de @${profileUsername} #4`,
    `Conteúdo público de @${profileUsername} #5`,
    `Conteúdo público de @${profileUsername} #6`,
    `Conteúdo público de @${profileUsername} #7`,
    `Conteúdo público de @${profileUsername} #8`,
    `Conteúdo público de @${profileUsername} #9`,
    `Conteúdo público de @${profileUsername} #10`,
  ];

  const now = Date.now();
  return Array.from({ length: count }, (_, i) => ({
    id: `tt_${profileUsername}_${String(i + 1).padStart(4, '0')}`,
    title: templates[i % templates.length],
    description: templates[i % templates.length],
    thumbnailUrl: `https://picsum.photos/seed/tt_${profileUsername}_${i}/400/700`,
    videoUrl: `https://example.com/public-content/tt/${profileUsername}/${i + 1}.mp4`,
    duration: 8 + Math.floor(Math.random() * 52),
    views: Math.floor(Math.random() * 50_000_000) + 100_000,
    likes: Math.floor(Math.random() * 2_000_000) + 50_000,
    comments: Math.floor(Math.random() * 100_000) + 1_000,
    publishedAt: new Date(now - Math.floor(Math.random() * 180 * 24 * 60 * 60 * 1000)).toISOString(),
    platform: 'tiktok' as const,
    ownerUsername,
    ownerId,
    permalink: `https://www.tiktok.com/@${profileUsername}/video/${profileUsername}_${i + 1}`,
    ownershipValidated: true,
  }));
}
