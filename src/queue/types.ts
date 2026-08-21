/**
 * Import Queue Types
 *
 * Each video goes through: pending → processing → completed/failed
 * Failed jobs can be retried up to MAX_RETRIES times.
 * The queue supports concurrency control, progress tracking, and pause/resume.
 */

import type { VideoMetadata, Platform, SortOption } from '../providers/types';

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface ImportJob {
  /** Unique job identifier */
  id: string;
  /** The video metadata to import */
  video: VideoMetadata;
  /** Current status */
  status: JobStatus;
  /** Number of retry attempts (0 = first attempt) */
  retryCount: number;
  /** Maximum retries before marking as permanently failed */
  maxRetries: number;
  /** Error message if status is 'failed' */
  errorMessage?: string;
  /** When the job was created */
  createdAt: string;
  /** When processing started */
  startedAt?: string;
  /** When processing completed or failed */
  completedAt?: string;
  /** Download progress 0-100 */
  progress: number;
  /** Execution logs */
  logs: JobLog[];
  /** URL of the downloaded media (if available) */
  mediaUrl?: string;
  /** Supabase Storage path (if stored) */
  storagePath?: string;
  /** Associated Supabase record ID (if created) */
  recordId?: string;
}

export interface JobLog {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
}

export interface ImportQueueState {
  /** All jobs in the queue */
  jobs: ImportJob[];
  /** Whether the queue is currently running */
  isRunning: boolean;
  /** Whether the queue is paused */
  isPaused: boolean;
  /** Number of concurrent jobs allowed */
  maxConcurrent: number;
  /** Currently processing count */
  processingCount: number;
  /** Total jobs */
  totalJobs: number;
  /** Completed jobs */
  completedJobs: number;
  /** Failed jobs */
  failedJobs: number;
  /** Overall progress (0-100) */
  overallProgress: number;
  /** Source platform */
  platform: Platform;
  /** Source username */
  username: string;
  /** Sort criterion used */
  sortBy: SortOption;
  /** Queue started at */
  startedAt?: string;
  /** Queue completed at */
  completedAt?: string;
}

export interface QueueCallbacks {
  onJobUpdate?: (job: ImportJob) => void;
  onQueueUpdate?: (state: ImportQueueState) => void;
  onError?: (job: ImportJob, error: Error) => void;
}

/** Default queue configuration */
export const DEFAULT_QUEUE_CONFIG = {
  maxConcurrent: 3,      // Process 3 videos simultaneously
  maxRetries: 3,         // Retry up to 3 times
  requestTimeout: 30_000, // 30 seconds per request
  retryDelay: 2_000,     // 2 seconds between retries
} as const;
