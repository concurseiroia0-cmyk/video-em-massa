-- ============================================================
-- BatchPost — Database Schema for Public Content Collector
-- ============================================================
-- Run this in Supabase SQL Editor to create the tables.
-- This schema stores collected public videos and their status
-- in the processing pipeline.
-- ============================================================

-- ── Enums ──────────────────────────────────────────────────────

CREATE TYPE platform_type AS ENUM ('instagram', 'tiktok');

CREATE TYPE content_status AS ENUM (
  'found',        -- Just discovered
  'selected',     -- User selected it
  'queued',       -- In import queue
  'importing',    -- Being downloaded
  'imported',     -- Downloaded to storage
  'processing',   -- Being processed by editor
  'completed',    -- Fully processed
  'failed'        -- Error occurred
);

-- ── Collected Videos Table ─────────────────────────────────────

CREATE TABLE IF NOT EXISTS collected_videos (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Owner
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Platform info
  platform platform_type NOT NULL,
  username TEXT NOT NULL,

  -- Source identification (unique per platform)
  source_id TEXT NOT NULL,

  -- URLs
  source_url TEXT,           -- Original content URL
  share_url TEXT,            -- Shareable URL
  embed_url TEXT,            -- Embed URL for iframe preview
  thumbnail_url TEXT,        -- Video thumbnail
  media_url TEXT,            -- Direct media URL (when available)

  -- Content info
  title TEXT,
  description TEXT,
  duration INTEGER,          -- Duration in seconds
  published_at TIMESTAMPTZ,

  -- Metrics (nullable — may not always be available)
  view_count BIGINT,
  like_count BIGINT,
  comment_count INTEGER,

  -- Status in pipeline
  status content_status DEFAULT 'found',

  -- Processing info
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  storage_path TEXT,         -- Supabase Storage path
  record_id TEXT,            -- Associated editing record

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Prevent duplicates: unique constraint on platform + source_id
  CONSTRAINT unique_platform_source UNIQUE (platform, source_id)
);

-- ── Indexes ────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_collected_videos_user ON collected_videos(user_id);
CREATE INDEX IF NOT EXISTS idx_collected_videos_platform ON collected_videos(platform);
CREATE INDEX IF NOT EXISTS idx_collected_videos_username ON collected_videos(username);
CREATE INDEX IF NOT EXISTS idx_collected_videos_status ON collected_videos(status);
CREATE INDEX IF NOT EXISTS idx_collected_videos_created ON collected_videos(created_at DESC);

-- ── Auto-update updated_at ─────────────────────────────────────

CREATE OR REPLACE FUNCTION update_collected_videos_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_collected_videos_updated
  BEFORE UPDATE ON collected_videos
  FOR EACH ROW
  EXECUTE FUNCTION update_collected_videos_timestamp();

-- ── Row Level Security ─────────────────────────────────────────

ALTER TABLE collected_videos ENABLE ROW LEVEL SECURITY;

-- Users can only see their own videos
CREATE POLICY "Users can view own videos"
  ON collected_videos FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own videos
CREATE POLICY "Users can insert own videos"
  ON collected_videos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own videos
CREATE POLICY "Users can update own videos"
  ON collected_videos FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own videos
CREATE POLICY "Users can delete own videos"
  ON collected_videos FOR DELETE
  USING (auth.uid() = user_id);

-- ── Collection Jobs Table (for tracking batch operations) ──────

CREATE TABLE IF NOT EXISTS collection_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  platform platform_type NOT NULL,
  username TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  sort_by TEXT DEFAULT 'views',
  status TEXT DEFAULT 'pending',  -- pending, running, completed, failed
  videos_found INTEGER DEFAULT 0,
  videos_selected INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_collection_jobs_user ON collection_jobs(user_id);

ALTER TABLE collection_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own jobs"
  ON collection_jobs FOR ALL
  USING (auth.uid() = user_id);
