/**
 * Mock data for Instagram provider.
 *
 * In production, this would be replaced by a backend service that fetches
 * public data using tools like:
 * - instagram-private-api (open-source, requires session)
 * - yt-dlp (can extract public Instagram data)
 * - Browser automation with Playwright (for public profiles only)
 * - CrowdTangle API (Meta's public content API, if available)
 *
 * SECURITY: All mock data represents publicly accessible content only.
 * No private content, no authenticated endpoints, no bypass mechanisms.
 */

import type { VideoMetadata, ProfileInfo } from '../types';

const INSTAGRAM_PROFILES: Record<string, ProfileInfo> = {
  natgeo: {
    username: 'natgeo',
    displayName: 'National Geographic',
    avatarUrl: 'https://i.pravatar.cc/150?u=natgeo',
    bio: 'Experience the world through the eyes of National Geographic photographers.',
    followers: 283_000_000,
    following: 120,
    postsCount: 28_400,
    platform: 'instagram',
  },
  chefsteps: {
    username: 'chefsteps',
    displayName: 'ChefSteps',
    avatarUrl: 'https://i.pravatar.cc/150?u=chefsteps',
    bio: 'Modern cooking, beautifully crafted.',
    followers: 1_200_000,
    following: 450,
    postsCount: 2_100,
    platform: 'instagram',
  },
  nasa: {
    username: 'nasa',
    displayName: 'NASA',
    avatarUrl: 'https://i.pravatar.cc/150?u=nasa',
    bio: 'There\'s space for everybody. ✨',
    followers: 112_000_000,
    following: 35,
    postsCount: 4_800,
    platform: 'instagram',
  },
};

function generateInstagramVideos(profile: string, count: number): VideoMetadata[] {
  const titles = [
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
    'Breathtaking aerial view of waterfalls',
    'How we captured the rare eclipse',
    'Exploring the depths of the Amazon',
    'The art of minimalist photography',
    'Time-lapse of a blooming flower',
    'Underwater encounter with whales',
    'Sunrise over misty valley landscape',
    'Desert sand dunes from above',
    'Northern forest autumn colors',
    'Historical documentary short clip',
    'Crafting process from raw to refined',
    'Mountain climbing adventure highlights',
    'Wildlife rescue and rehabilitation',
    'Night sky astrophotography session',
    'Underwater cave exploration footage',
    'Aerial view of city at night',
    'Behind the lens documentary series',
    'Natural phenomenon captured live',
    'Ocean waves crashing on volcanic rocks',
    'Forest morning mist photography',
    'Wild animal behavior documentation',
    'Cultural festival highlights reel',
    'Landscape photography masterclass',
    'Deep sea creature discoveries',
    'Vintage architecture restoration',
  ];

  const now = Date.now();
  return Array.from({ length: count }, (_, i) => ({
    id: `ig_${profile}_${String(i + 1).padStart(4, '0')}`,
    title: titles[i % titles.length],
    description: titles[i % titles.length],
    thumbnailUrl: `https://picsum.photos/seed/${profile}${i}/400/700`,
    videoUrl: `https://example.com/public-content/ig/${profile}/${i + 1}.mp4`,
    duration: 15 + Math.floor(Math.random() * 85),
    views: Math.floor(Math.random() * 10_000_000) + 50_000,
    likes: Math.floor(Math.random() * 500_000) + 10_000,
    comments: Math.floor(Math.random() * 20_000) + 500,
    publishedAt: new Date(now - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000)).toISOString(),
    platform: 'instagram' as const,
    profile,
    permalink: `https://www.instagram.com/p/${profile}_${i + 1}`,
  }));
}

export { INSTAGRAM_PROFILES, generateInstagramVideos };
