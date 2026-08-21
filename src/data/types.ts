export type Video = {
  id: string;
  title: string;
  thumbnail: string;
  source: 'tiktok' | 'instagram';
  profile: string;
  views: number;
  likes: number;
  duration: number;
  status: 'found' | 'downloading' | 'processing' | 'ready' | 'error' | 'published';
  campaignId?: string;
  scheduledAt?: string;
  publishedAt?: string;
  errorMessage?: string;
  retryCount: number;
  createdAt: string;
}

export type Campaign = {
  id: string;
  name: string;
  description: string;
  videoCount: number;
  publishedCount: number;
  scheduledCount: number;
  status: 'active' | 'paused' | 'completed';
  platform: 'tiktok' | 'instagram' | 'both';
  createdAt: string;
}

export type SocialAccount = {
  id: string;
  platform: 'tiktok' | 'instagram';
  username: string;
  displayName: string;
  avatar: string;
  status: 'connected' | 'expired' | 'error';
  followers: number;
  connectedAt: string;
}

export type Template = {
  id: string;
  name: string;
  format: string;
  layers: TemplateLayer[];
  thumbnail: string;
}

export type TemplateLayer = {
  type: 'crop' | 'logo' | 'watermark' | 'caption' | 'intro' | 'cta';
  name: string;
  enabled: boolean;
  config: Record<string, unknown>;
}

export type ScheduleSlot = {
  id: string;
  videoId: string;
  campaignId: string;
  accountId: string;
  date: string;
  time: string;
  status: 'scheduled' | 'publishing' | 'published' | 'failed';
}

export type Stats = {
  videosInQueue: number;
  publishedToday: number;
  activeCampaigns: number;
  successRate: number;
  weeklyVolume: { day: string; count: number }[];
}

export type ViewMode = 'grid' | 'list';

export type FilterStatus = 'all' | 'found' | 'downloading' | 'processing' | 'ready' | 'error' | 'published';
