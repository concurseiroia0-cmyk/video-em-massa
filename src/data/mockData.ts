import type { Video, Campaign, SocialAccount, Template, ScheduleSlot, Stats } from './types';

export const stats: Stats = {
  videosInQueue: 247,
  publishedToday: 38,
  activeCampaigns: 6,
  successRate: 96.8,
  weeklyVolume: [
    { day: 'Seg', count: 42 },
    { day: 'Ter', count: 55 },
    { day: 'Qua', count: 38 },
    { day: 'Qui', count: 67 },
    { day: 'Sex', count: 72 },
    { day: 'Sáb', count: 45 },
    { day: 'Dom', count: 28 },
  ],
};

export const mockVideos: Video[] = [
  { id: '001', title: 'Cat Compilation #42', thumbnail: '', source: 'tiktok', profile: '@funnycats', views: 2_500_000, likes: 180_000, duration: 32, status: 'ready', campaignId: 'c1', createdAt: '2026-08-20T10:00:00Z', retryCount: 0 },
  { id: '002', title: 'Dog Does Parkour', thumbnail: '', source: 'instagram', profile: '@doglife', views: 1_800_000, likes: 120_000, duration: 28, status: 'processing', campaignId: 'c1', createdAt: '2026-08-20T10:05:00Z', retryCount: 0 },
  { id: '003', title: 'Baby Laughing at Mirror', thumbnail: '', source: 'tiktok', profile: '@babyfun', views: 3_200_000, likes: 250_000, duration: 15, status: 'published', campaignId: 'c2', publishedAt: '2026-08-20T09:00:00Z', createdAt: '2026-08-19T14:00:00Z', retryCount: 0 },
  { id: '004', title: 'Cooking Disaster #12', thumbnail: '', source: 'tiktok', profile: '@chefnoob', views: 890_000, likes: 65_000, duration: 45, status: 'error', campaignId: 'c3', errorMessage: 'FFmpeg encoding failed: unsupported codec', createdAt: '2026-08-20T11:00:00Z', retryCount: 3 },
  { id: '005', title: 'Beach Sunset Timelapse', thumbnail: '', source: 'instagram', profile: '@travelvibes', views: 5_100_000, likes: 400_000, duration: 20, status: 'found', createdAt: '2026-08-20T11:30:00Z', retryCount: 0 },
  { id: '006', title: 'Gym Fails Compilation', thumbnail: '', source: 'tiktok', profile: '@gymlife', views: 4_300_000, likes: 310_000, duration: 58, status: 'downloading', campaignId: 'c1', createdAt: '2026-08-20T12:00:00Z', retryCount: 0 },
  { id: '007', title: 'Magic Trick Revealed', thumbnail: '', source: 'instagram', profile: '@magicman', views: 7_200_000, likes: 520_000, duration: 22, status: 'ready', campaignId: 'c2', createdAt: '2026-08-20T08:00:00Z', retryCount: 0 },
  { id: '008', title: 'Skateboard Trick Shot', thumbnail: '', source: 'tiktok', profile: '@sk8rboi', views: 1_900_000, likes: 140_000, duration: 12, status: 'published', campaignId: 'c1', publishedAt: '2026-08-20T12:00:00Z', createdAt: '2026-08-19T16:00:00Z', retryCount: 0 },
  { id: '009', title: 'ASMR Cooking Ramen', thumbnail: '', source: 'instagram', profile: '@asmrcooking', views: 9_800_000, likes: 750_000, duration: 90, status: 'processing', campaignId: 'c4', createdAt: '2026-08-20T12:30:00Z', retryCount: 0 },
  { id: '010', title: 'Parrot Mimics Phone', thumbnail: '', source: 'tiktok', profile: '@parrotlife', views: 6_500_000, likes: 480_000, duration: 18, status: 'ready', campaignId: 'c4', createdAt: '2026-08-20T07:00:00Z', retryCount: 0 },
  { id: '011', title: 'Car Detailing Satisfying', thumbnail: '', source: 'instagram', profile: '@carcare', views: 3_100_000, likes: 230_000, duration: 35, status: 'found', createdAt: '2026-08-20T13:00:00Z', retryCount: 0 },
  { id: '012', title: 'Tiny House Tour', thumbnail: '', source: 'tiktok', profile: '@tinyhome', views: 4_700_000, likes: 350_000, duration: 60, status: 'downloading', campaignId: 'c5', createdAt: '2026-08-20T13:15:00Z', retryCount: 0 },
  { id: '013', title: 'Stress Ball Cutting', thumbnail: '', source: 'tiktok', profile: '@satisfying', views: 12_000_000, likes: 900_000, duration: 25, status: 'ready', campaignId: 'c5', createdAt: '2026-08-20T06:00:00Z', retryCount: 0 },
  { id: '014', title: 'DIY Phone Case', thumbnail: '', source: 'instagram', profile: '@diycraft', views: 2_800_000, likes: 200_000, duration: 40, status: 'published', campaignId: 'c3', publishedAt: '2026-08-20T15:00:00Z', createdAt: '2026-08-19T10:00:00Z', retryCount: 0 },
  { id: '015', title: 'Pizza Making Process', thumbnail: '', source: 'tiktok', profile: '@pizzaartisan', views: 8_400_000, likes: 630_000, duration: 50, status: 'processing', campaignId: 'c6', createdAt: '2026-08-20T14:00:00Z', retryCount: 0 },
  { id: '016', title: 'Cat vs Cucumber', thumbnail: '', source: 'instagram', profile: '@funnycats', views: 15_000_000, likes: 1_100_000, duration: 8, status: 'ready', campaignId: 'c1', createdAt: '2026-08-19T20:00:00Z', retryCount: 0 },
  { id: '017', title: 'Hair Transformation', thumbnail: '', source: 'tiktok', profile: '@hairart', views: 3_500_000, likes: 260_000, duration: 30, status: 'found', createdAt: '2026-08-20T14:30:00Z', retryCount: 0 },
  { id: '018', title: 'Plant Growing Timelapse', thumbnail: '', source: 'instagram', profile: '@gardening', views: 1_200_000, likes: 90_000, duration: 45, status: 'error', campaignId: 'c2', errorMessage: 'Download timeout after 3 retries', createdAt: '2026-08-20T09:00:00Z', retryCount: 3 },
  { id: '019', title: 'Dance Challenge Viral', thumbnail: '', source: 'tiktok', profile: '@danceking', views: 22_000_000, likes: 1_800_000, duration: 15, status: 'published', campaignId: 'c1', publishedAt: '2026-08-20T18:00:00Z', createdAt: '2026-08-18T12:00:00Z', retryCount: 0 },
  { id: '020', title: 'Baking Bread Satisfying', thumbnail: '', source: 'instagram', profile: '@bakingpro', views: 6_100_000, likes: 460_000, duration: 55, status: 'ready', campaignId: 'c3', createdAt: '2026-08-20T05:00:00Z', retryCount: 0 },
];

export const mockCampaigns: Campaign[] = [
  { id: 'c1', name: 'Remix Meme - Agosto', description: 'Compilação viral de memes para engajamento', videoCount: 8, publishedCount: 3, scheduledCount: 4, status: 'active', platform: 'both', createdAt: '2026-08-15' },
  { id: 'c2', name: 'Lifestyle & Travel', description: 'Conteúdo de estilo de vida e viagens', videoCount: 5, publishedCount: 2, scheduledCount: 2, status: 'active', platform: 'instagram', createdAt: '2026-08-16' },
  { id: 'c3', name: 'Food & Recipes', description: 'Receitas e food content viral', videoCount: 6, publishedCount: 4, scheduledCount: 1, status: 'active', platform: 'tiktok', createdAt: '2026-08-17' },
  { id: 'c4', name: 'ASMR Weekly', description: 'Conteúdo ASMR semanal para noites', videoCount: 4, publishedCount: 1, scheduledCount: 2, status: 'active', platform: 'both', createdAt: '2026-08-18' },
  { id: 'c5', name: 'Satisfying Content', description: 'Vídeos satisfatórios para alto engajamento', videoCount: 3, publishedCount: 0, scheduledCount: 2, status: 'paused', platform: 'tiktok', createdAt: '2026-08-19' },
  { id: 'c6', name: 'Artisan Showcase', description: 'Artesanato e processos criativos', videoCount: 2, publishedCount: 0, scheduledCount: 1, status: 'active', platform: 'instagram', createdAt: '2026-08-20' },
];

export const mockAccounts: SocialAccount[] = [
  { id: 'a1', platform: 'tiktok', username: '@viralpages_br', displayName: 'Viral Pages BR', avatar: '', status: 'connected', followers: 2_400_000, connectedAt: '2026-07-01' },
  { id: 'a2', platform: 'instagram', username: '@daily_memes_br', displayName: 'Daily Memes BR', avatar: '', status: 'connected', followers: 890_000, connectedAt: '2026-07-15' },
  { id: 'a3', platform: 'tiktok', username: '@satisfying_br', displayName: 'Satisfying BR', avatar: '', status: 'expired', followers: 1_200_000, connectedAt: '2026-06-01' },
  { id: 'a4', platform: 'instagram', username: '@curiosity_feed', displayName: 'Curiosity Feed', avatar: '', status: 'connected', followers: 3_100_000, connectedAt: '2026-08-01' },
  { id: 'a5', platform: 'tiktok', username: '@foodie_clips', displayName: 'Foodie Clips', avatar: '', status: 'error', followers: 560_000, connectedAt: '2026-07-20' },
];

export const mockTemplates: Template[] = [
  {
    id: 't1',
    name: 'Padrão Viral',
    format: '9:16 (1080x1920)',
    thumbnail: '',
    layers: [
      { type: 'crop', name: 'Crop Vertical Auto', enabled: true, config: { mode: 'center' } },
      { type: 'logo', name: 'Logo Watermark', enabled: true, config: { position: 'top-right', opacity: 0.7 } },
      { type: 'caption', name: 'Legendas Dinâmicas', enabled: true, config: { font: 'Montserrat Bold', size: 48, position: 'bottom', animation: 'pop-in' } },
      { type: 'cta', name: 'CTA Final', enabled: true, config: { text: 'Siga para mais!', duration: 3, animation: 'slide-up' } },
    ],
  },
  {
    id: 't2',
    name: 'Reels Minimalista',
    format: '9:16 (1080x1920)',
    thumbnail: '',
    layers: [
      { type: 'crop', name: 'Crop Vertical', enabled: true, config: { mode: 'smart' } },
      { type: 'watermark', name: 'Marca d\'água Sutil', enabled: true, config: { text: '@brand', opacity: 0.3 } },
      { type: 'intro', name: 'Intro 2s', enabled: false, config: { type: 'fade', text: '' } },
      { type: 'caption', name: 'Legendas Limpas', enabled: true, config: { font: 'Inter', size: 36, position: 'center', animation: 'fade-in' } },
    ],
  },
  {
    id: 't3',
    name: 'Meme Turbo',
    format: '9:16 (1080x1920)',
    thumbnail: '',
    layers: [
      { type: 'crop', name: 'Crop Vertical', enabled: true, config: { mode: 'center' } },
      { type: 'logo', name: 'Logo Grande', enabled: true, config: { position: 'top-center', opacity: 0.9 } },
      { type: 'watermark', name: 'Watermark', enabled: true, config: { text: '@mempages', opacity: 0.5 } },
      { type: 'caption', name: 'Legendas com Sombra', enabled: true, config: { font: 'Impact', size: 52, position: 'top', animation: 'bounce' } },
      { type: 'cta', name: 'CTA Agressivo', enabled: true, config: { text: 'LIKE + FOLLOW 🔥', duration: 4, animation: 'pulse' } },
      { type: 'intro', name: 'Intro Explosiva', enabled: true, config: { type: 'zoom', text: 'PREPARE-SE' } },
    ],
  },
];

export const mockScheduleSlots: ScheduleSlot[] = [
  { id: 's1', videoId: '001', campaignId: 'c1', accountId: 'a1', date: '2026-08-20', time: '09:00', status: 'published' },
  { id: 's2', videoId: '003', campaignId: 'c2', accountId: 'a2', date: '2026-08-20', time: '12:00', status: 'published' },
  { id: 's3', videoId: '008', campaignId: 'c1', accountId: 'a1', date: '2026-08-20', time: '15:00', status: 'published' },
  { id: 's4', videoId: '007', campaignId: 'c2', accountId: 'a4', date: '2026-08-20', time: '18:00', status: 'publishing' },
  { id: 's5', videoId: '010', campaignId: 'c4', accountId: 'a1', date: '2026-08-20', time: '21:00', status: 'scheduled' },
  { id: 's6', videoId: '016', campaignId: 'c1', accountId: 'a1', date: '2026-08-21', time: '09:00', status: 'scheduled' },
  { id: 's7', videoId: '002', campaignId: 'c1', accountId: 'a2', date: '2026-08-21', time: '12:00', status: 'scheduled' },
  { id: 's8', videoId: '013', campaignId: 'c5', accountId: 'a1', date: '2026-08-21', time: '15:00', status: 'scheduled' },
  { id: 's9', videoId: '009', campaignId: 'c4', accountId: 'a4', date: '2026-08-21', time: '18:00', status: 'scheduled' },
  { id: 's10', videoId: '020', campaignId: 'c3', accountId: 'a1', date: '2026-08-21', time: '21:00', status: 'scheduled' },
  { id: 's11', videoId: '019', campaignId: 'c1', accountId: 'a1', date: '2026-08-22', time: '09:00', status: 'scheduled' },
  { id: 's12', videoId: '014', campaignId: 'c3', accountId: 'a2', date: '2026-08-22', time: '12:00', status: 'scheduled' },
];
