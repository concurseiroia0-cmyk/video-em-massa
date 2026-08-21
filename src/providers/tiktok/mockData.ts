/**
 * Mock data for TikTok provider.
 *
 * In production, this would be replaced by a backend service that fetches
 * public data using tools like:
 * - yt-dlp (excellent TikTok support for public videos)
 * - TikTok public web API (for embeds and sharing)
 * - Playwright-based public scraping (TOS consideration)
 * - cobalt.tools API (open-source, for public video download)
 *
 * SECURITY: All mock data represents publicly accessible content only.
 * No private content, no authenticated endpoints, no bypass mechanisms.
 */

import type { VideoMetadata, ProfileInfo } from '../types';

const TIKTOK_PROFILES: Record<string, ProfileInfo> = {
  'khaby.lame': {
    username: 'khaby.lame',
    displayName: 'Khabane lame',
    avatarUrl: 'https://i.pravatar.cc/150?u=khaby',
    bio: 'If you wanna laugh you are in the right place 😂',
    followers: 162_000_000,
    following: 120,
    postsCount: 1_800,
    platform: 'tiktok',
  },
  'charlidamelio': {
    username: 'charlidamelio',
    displayName: 'Charli D\'Amelio',
    avatarUrl: 'https://i.pravatar.cc/150?u=charli',
    bio: 'founder @beacosmetics 🌿',
    followers: 155_000_000,
    following: 2_400,
    postsCount: 3_200,
    platform: 'tiktok',
  },
  'foodtalks': {
    username: 'foodtalks',
    displayName: 'Food Talks',
    avatarUrl: 'https://i.pravatar.cc/150?u=foodtalks',
    bio: 'The best food content 🍜🍕🌮',
    followers: 8_500_000,
    following: 300,
    postsCount: 4_100,
    platform: 'tiktok',
  },
};

function generateTikTokVideos(profile: string, count: number): VideoMetadata[] {
  const titles = [
    'Wait for the ending 😱 #viral',
    'This hack will change your life ✨',
    'POV: You discover the truth 💀',
    'The most satisfying thing ever',
    'Trying this viral trend...',
    'Life hack 101 🔥',
    'No way this actually worked!',
    'When you think it\'s over but it\'s not 😂',
    'Replying to @user: here you go!',
    'Story time: the craziest thing that happened',
    'Rating trending foods: part 42',
    'How to cook the perfect steak 🥩',
    'DIY room makeover in 60 seconds',
    'Cat vs. Cucumber: round 3 🐱',
    'Dancing in different countries 🌍',
    'ASMR: making pottery from scratch',
    'Tiny house tour you need to see',
    'The most viral dance of 2026',
    'This trick saves hours of work',
    'Trying every viral food trend',
    'Satisfying cleaning compilation',
    'Magic trick revealed in slow motion',
    'Underwater photography tips',
    'Street food from 10 countries',
    'The best sunset I\'ve ever filmed',
    'When your pet does something unexpected',
    'Baking the world\'s largest cookie',
    'Extreme sports compilation 2026',
    'How I edit my videos (tutorial)',
    'The most underrated travel destination',
    'Cat compilation that will make your day',
    'Building a tiny house from scratch',
    'World\'s most satisfying things',
    'The best skateboard tricks 2026',
    'Cooking with grandma: Italian edition',
  ];

  const now = Date.now();
  return Array.from({ length: count }, (_, i) => ({
    id: `tt_${profile}_${String(i + 1).padStart(4, '0')}`,
    title: titles[i % titles.length],
    description: titles[i % titles.length],
    thumbnailUrl: `https://picsum.photos/seed/tt${profile}${i}/400/700`,
    videoUrl: `https://example.com/public-content/tt/${profile}/${i + 1}.mp4`,
    duration: 8 + Math.floor(Math.random() * 52),
    views: Math.floor(Math.random() * 50_000_000) + 100_000,
    likes: Math.floor(Math.random() * 2_000_000) + 50_000,
    comments: Math.floor(Math.random() * 100_000) + 1_000,
    publishedAt: new Date(now - Math.floor(Math.random() * 180 * 24 * 60 * 60 * 1000)).toISOString(),
    platform: 'tiktok' as const,
    profile,
    permalink: `https://www.tiktok.com/@${profile}/video/${profile}_${i + 1}`,
  }));
}

export { TIKTOK_PROFILES, generateTikTokVideos };
