/**
 * Mock data for Instagram provider.
 *
 * In production, this would be replaced by a backend service that fetches
 * public data using tools like:
 * - yt-dlp (can extract public Instagram Reels data)
 * - Playwright-based public scraping (TOS consideration)
 * - CrowdTangle API (Meta's public content API, if available)
 *
 * SECURITY: All mock data represents publicly accessible content only.
 */

import type { VideoMetadata, ProfileInfo } from '../types';

// ── Known Profile Database ─────────────────────────────────────

export const INSTAGRAM_PROFILES: Record<string, ProfileInfo> = {
  'natgeo': {
    id: 'ig_natgeo_001',
    username: 'natgeo',
    displayName: 'National Geographic',
    avatarUrl: 'https://i.pravatar.cc/150?u=natgeo',
    bio: 'Experience the world through the eyes of National Geographic photographers.',
    followers: 283_000_000,
    following: 120,
    postsCount: 28_400,
    platform: 'instagram',
    profileUrl: 'https://www.instagram.com/natgeo',
  },
  'chefsteps': {
    id: 'ig_chefsteps_002',
    username: 'chefsteps',
    displayName: 'ChefSteps',
    avatarUrl: 'https://i.pravatar.cc/150?u=chefsteps',
    bio: 'Modern cooking, beautifully crafted.',
    followers: 1_200_000,
    following: 450,
    postsCount: 2_100,
    platform: 'instagram',
    profileUrl: 'https://www.instagram.com/chefsteps',
  },
  'nasa': {
    id: 'ig_nasa_003',
    username: 'nasa',
    displayName: 'NASA',
    avatarUrl: 'https://i.pravatar.cc/150?u=nasa',
    bio: "There's space for everybody. ✨",
    followers: 112_000_000,
    following: 35,
    postsCount: 4_800,
    platform: 'instagram',
    profileUrl: 'https://www.instagram.com/nasa',
  },
  'flamengo': {
    id: 'ig_flamengo_004',
    username: 'flamengo',
    displayName: 'Flamengo',
    avatarUrl: 'https://i.pravatar.cc/150?u=flamengo',
    bio: 'Clube de Regatas do Flamengo ⚽🔥 Mengão',
    followers: 45_000_000,
    following: 350,
    postsCount: 12_000,
    platform: 'instagram',
    profileUrl: 'https://www.instagram.com/flamengo',
  },
  'corinthians': {
    id: 'ig_corinthians_005',
    username: 'corinthians',
    displayName: 'Corinthians',
    avatarUrl: 'https://i.pravatar.cc/150?u=corinthians',
    bio: 'Sport Club Corinthians Paulista ⚽ Fiel',
    followers: 38_000_000,
    following: 280,
    postsCount: 10_000,
    platform: 'instagram',
    profileUrl: 'https://www.instagram.com/corinthians',
  },
  'paulopablo': {
    id: 'ig_paulopablo_006',
    username: 'paulopablo',
    displayName: 'Paulo Pablo',
    avatarUrl: 'https://i.pravatar.cc/150?u=paulopablo',
    bio: 'Conteúdo criativo e diversão',
    followers: 5_000_000,
    following: 200,
    postsCount: 3_000,
    platform: 'instagram',
    profileUrl: 'https://www.instagram.com/paulopablo',
  },
};

// ── Content Templates (per-profile) ────────────────────────────

const CONTENT_BY_PROFILE: Record<string, string[]> = {
  'flamengo': [
    'GOLAÇO do Flamengo! ⚽🔥',
    'Jogadaça do Mengão na Libertadores',
    'Torcida organizada em festa 🎉',
    'Treino dos jogadores do Flamengo',
    'Resumo: Flamengo 3 x 0 - Maracanã lotado',
    'Artur Arrepiou! Gol de placa do Mengão',
    'Entrevista do técnico após a vitória',
    'Melhores jogadas da temporada 2026',
    'Classificação do Brasileirão: Flamengo lidera',
    'Flamengo campeão! 🏆🔥',
    'Gol olímpico no Maracanã',
    'Drible que virou viral #Flamengo',
    'Cerimônia de entrega do troféu',
    'Ultimo jogo da temporada no Maracanã',
    'Reação da torcida após o gol',
    'Gol de cabeça em cobrança de escanteio',
    'Jogador revelação do Mengão',
    'Craque do jogo: destaque individual',
    'Comemoração coletiva do elenco',
    'Melhores momentos: Flamengo x Rival',
    'Treino tático antes do clássico',
    'Gol de falta do meio da rua',
    'Defesaça do goleiro do Flamengo',
    'Replay: lance polêmico do jogo',
    'Gol de bicicleta no estadual',
    'Torcida infantil no estádio',
    'Passagem aérea: Flamengo viaja para a final',
    'Jogador faz biscoito e marca gol',
    'Conferência de imprensa do treinador',
    'Flamengo goleou e avançou na Copa',
    'Lance do jogo: assistência perfeita',
    'Os 10 melhores gols do ano',
    'Retro: história do Clássico das Multidões',
    'Gol contra: como reagir?',
    'Comemoração viral do zagueiro',
    'Análise tática: por que o Flamengo venceu',
  ],
  'natgeo': [
    'Amazing sunset timelapse over the mountains',
    'Deep dive into ocean biodiversity',
    'Urban architecture in golden hour',
    'Wildlife photography compilation',
    'Behind the scenes of our latest expedition',
    'Stunning aerial footage of coral reefs',
    'Northern lights captured in 4K',
    'Close-up macro photography of insects',
    'Drone footage of ancient ruins',
    'Street food tour around the world',
  ],
  'nasa': [
    'Journey to the International Space Station',
    'Mars rover latest discoveries',
    'Spacewalk HD footage from ISS',
    'Hubble telescope incredible images',
    'Rocket launch slow motion',
    'Astronaut daily life in space',
    'Earth from space: 4K compilation',
    'James Webb telescope first images',
    'Solar eclipse time-lapse',
    'Space shuttle mission highlights',
  ],
};

// ── Video Generator ────────────────────────────────────────────

export function generateInstagramVideos(profileUsername: string, count: number): VideoMetadata[] {
  const profile = INSTAGRAM_PROFILES[profileUsername];
  const ownerId = profile?.id ?? `ig_${profileUsername}_unknown`;
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
    id: `ig_${profileUsername}_${String(i + 1).padStart(4, '0')}`,
    title: templates[i % templates.length],
    description: templates[i % templates.length],
    thumbnailUrl: `https://picsum.photos/seed/ig_${profileUsername}_${i}/400/700`,
    videoUrl: `https://example.com/public-content/ig/${profileUsername}/${i + 1}.mp4`,
    duration: 15 + Math.floor(Math.random() * 85),
    views: Math.floor(Math.random() * 10_000_000) + 50_000,
    likes: Math.floor(Math.random() * 500_000) + 10_000,
    comments: Math.floor(Math.random() * 20_000) + 500,
    publishedAt: new Date(now - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000)).toISOString(),
    platform: 'instagram' as const,
    ownerUsername,
    ownerId,
    permalink: `https://www.instagram.com/p/${profileUsername}_${i + 1}`,
    ownershipValidated: true,
  }));
}
