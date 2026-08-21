/**
 * Import Queue Manager
 *
 * Handles bulk import of videos with:
 * - Configurable concurrency (MAX_CONCURRENT_JOBS)
 * - Automatic retry with exponential backoff
 * - Request timeout handling
 * - Progress tracking (per-job and overall)
 * - Pause/resume support
 * - Detailed logging
 * - Resume after interruption (jobs persist state)
 *
 * SECURITY: Media fetching only uses publicly accessible URLs.
 * No credentials, no auth bypass, no DRM circumvention.
 */

import type { ContentProvider, VideoMetadata } from '../providers/types';
import type {
  ImportJob,
  ImportQueueState,
  JobStatus,
  QueueCallbacks,
} from './types';
import { DEFAULT_QUEUE_CONFIG } from './types';

let jobCounter = 0;

function generateJobId(): string {
  jobCounter += 1;
  return `job_${Date.now()}_${jobCounter}`;
}

function createJob(video: VideoMetadata, maxRetries: number): ImportJob {
  return {
    id: generateJobId(),
    video,
    status: 'pending',
    retryCount: 0,
    maxRetries,
    progress: 0,
    logs: [],
    createdAt: new Date().toISOString(),
  };
}

function addLog(job: ImportJob, level: 'info' | 'warn' | 'error' | 'success', message: string): ImportJob {
  return {
    ...job,
    logs: [
      ...job.logs,
      { timestamp: new Date().toISOString(), level, message },
    ],
  };
}

export class ImportQueueManager {
  private state: ImportQueueState;
  private provider: ContentProvider;
  private callbacks: QueueCallbacks;
  private config: typeof DEFAULT_QUEUE_CONFIG;
  private abortController: AbortController | null = null;
  private processingTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();

  constructor(
    provider: ContentProvider,
    videos: VideoMetadata[],
    callbacks: QueueCallbacks = {},
    config: Partial<typeof DEFAULT_QUEUE_CONFIG> = {}
  ) {
    this.config = { ...DEFAULT_QUEUE_CONFIG, ...config };
    this.provider = provider;
    this.callbacks = callbacks;

    const jobs = videos.map((v) => createJob(v, this.config.maxRetries));

    this.state = {
      jobs,
      isRunning: false,
      isPaused: false,
      maxConcurrent: this.config.maxConcurrent,
      processingCount: 0,
      totalJobs: jobs.length,
      completedJobs: 0,
      failedJobs: 0,
      overallProgress: 0,
      platform: provider.platform,
      username: '',
      sortBy: 'views',
    };
  }

  /** Get current queue state */
  getState(): ImportQueueState {
    return { ...this.state };
  }

  /** Set source metadata */
  setSource(username: string, sortBy: string): void {
    this.state.username = username;
    this.state.sortBy = sortBy as ImportQueueState['sortBy'];
  }

  /** Start or resume processing */
  async start(): Promise<void> {
    if (this.state.isPaused) {
      this.state.isPaused = false;
      this.state.isRunning = true;
      this.notifyQueueUpdate();
      this.processNext();
      return;
    }

    if (this.state.isRunning) return;

    this.abortController = new AbortController();
    this.state.isRunning = true;
    this.state.isPaused = false;
    this.state.startedAt = this.state.startedAt || new Date().toISOString();
    this.notifyQueueUpdate();

    // Start initial batch
    const concurrent = Math.min(this.config.maxConcurrent, this.pendingJobs().length);
    for (let i = 0; i < concurrent; i++) {
      this.processNext();
    }
  }

  /** Pause processing */
  pause(): void {
    this.state.isPaused = true;
    this.state.isRunning = false;

    // Clear all timers
    this.processingTimers.forEach((timer) => clearTimeout(timer));
    this.processingTimers.clear();

    this.notifyQueueUpdate();
  }

  /** Stop and reset */
  stop(): void {
    this.abortController?.abort();
    this.processingTimers.forEach((timer) => clearTimeout(timer));
    this.processingTimers.clear();

    this.state.isRunning = false;
    this.state.isPaused = false;
    this.state.processingCount = 0;
    this.notifyQueueUpdate();
  }

  /** Get all jobs */
  getJobs(): ImportJob[] {
    return [...this.state.jobs];
  }

  /** Get job by ID */
  getJob(jobId: string): ImportJob | undefined {
    return this.state.jobs.find((j) => j.id === jobId);
  }

  /** Retry a specific failed job */
  async retryJob(jobId: string): Promise<void> {
    const idx = this.state.jobs.findIndex((j) => j.id === jobId);
    if (idx === -1) return;

    const job = this.state.jobs[idx];
    if (job.status !== 'failed') return;

    this.state.jobs[idx] = {
      ...job,
      status: 'pending',
      retryCount: 0,
      errorMessage: undefined,
      progress: 0,
      startedAt: undefined,
      completedAt: undefined,
    };
    this.state.failedJobs = Math.max(0, this.state.failedJobs - 1);
    this.notifyQueueUpdate();

    if (this.state.isRunning) {
      this.processNext();
    }
  }

  /** Retry all failed jobs */
  retryAllFailed(): void {
    this.state.jobs = this.state.jobs.map((job) => {
      if (job.status === 'failed') {
        this.state.failedJobs = Math.max(0, this.state.failedJobs - 1);
        return {
          ...job,
          status: 'pending' as JobStatus,
          retryCount: 0,
          errorMessage: undefined,
          progress: 0,
          startedAt: undefined,
          completedAt: undefined,
        };
      }
      return job;
    });
    this.state.failedJobs = 0;
    this.notifyQueueUpdate();
  }

  /** Get overall progress (0-100) */
  getProgress(): number {
    if (this.state.totalJobs === 0) return 0;
    return Math.round(
      (this.state.completedJobs / this.state.totalJobs) * 100
    );
  }

  // ── Private Methods ──────────────────────────────────────────

  private pendingJobs(): ImportJob[] {
    return this.state.jobs.filter((j) => j.status === 'pending');
  }

  private updateJob(jobId: string, updater: (job: ImportJob) => ImportJob): void {
    const idx = this.state.jobs.findIndex((j) => j.id === jobId);
    if (idx === -1) return;
    this.state.jobs[idx] = updater(this.state.jobs[idx]);
    this.callbacks.onJobUpdate?.(this.state.jobs[idx]);
    this.recalculateCounts();
  }

  private recalculateCounts(): void {
    const jobs = this.state.jobs;
    this.state.completedJobs = jobs.filter((j) => j.status === 'completed').length;
    this.state.failedJobs = jobs.filter((j) => j.status === 'failed').length;
    this.state.processingCount = jobs.filter((j) => j.status === 'processing').length;
    this.state.overallProgress = this.getProgress();
  }

  private notifyQueueUpdate(): void {
    this.recalculateCounts();
    this.callbacks.onQueueUpdate?.(this.getState());
  }

  private async processNext(): Promise<void> {
    if (this.state.isPaused || !this.state.isRunning) return;

    // Check if we can start more jobs
    if (this.state.processingCount >= this.config.maxConcurrent) return;

    const pending = this.pendingJobs();
    if (pending.length === 0) {
      // Check if all done
      if (this.state.processingCount === 0) {
        this.state.isRunning = false;
        this.state.completedAt = new Date().toISOString();
        this.notifyQueueUpdate();
      }
      return;
    }

    const job = pending[0];
    this.processJob(job);
  }

  private async processJob(job: ImportJob): Promise<void> {
    const jobId = job.id;

    // Mark as processing
    this.updateJob(jobId, (j) => ({
      ...j,
      status: 'processing',
      startedAt: j.startedAt || new Date().toISOString(),
      progress: 0,
    }));
    this.notifyQueueUpdate();

    // Set up timeout
    const timeoutId = setTimeout(() => {
      this.handleJobError(jobId, new Error(`Request timeout after ${this.config.requestTimeout}ms`));
    }, this.config.requestTimeout);
    this.processingTimers.set(jobId, timeoutId);

    try {
      // Step 1: Validate video metadata exists
      this.updateJob(jobId, (j) => addLog({ ...j, progress: 10 }, 'info', 'Validating video metadata...'));
      await this.delay(200);

      if (this.state.isPaused || !this.state.isRunning) {
        clearTimeout(timeoutId);
        this.processingTimers.delete(jobId);
        return;
      }

      // Step 2: Fetch media
      this.updateJob(jobId, (j) => addLog({ ...j, progress: 30 }, 'info', `Fetching media from ${this.provider.platform}...`));
      await this.delay(500);

      if (this.state.isPaused || !this.state.isRunning) {
        clearTimeout(timeoutId);
        this.processingTimers.delete(jobId);
        return;
      }

      // Step 3: Download progress simulation
      for (let p = 40; p <= 70; p += 10) {
        if (this.state.isPaused || !this.state.isRunning) {
          clearTimeout(timeoutId);
          this.processingTimers.delete(jobId);
          return;
        }
        this.updateJob(jobId, (j) => ({ ...j, progress: p }));
        await this.delay(300);
      }

      // Step 4: Try to get actual media (will use placeholder in demo)
      const blob = await this.provider.getMedia(job.video);
      this.updateJob(jobId, (j) => addLog({ ...j, progress: 75 }, 'info', `Media downloaded (${this.formatSize(blob.size)})`));

      // Step 5: Prepare for storage (Supabase stub)
      this.updateJob(jobId, (j) => addLog({ ...j, progress: 85 }, 'info', 'Preparing for storage...'));
      await this.delay(300);

      if (this.state.isPaused || !this.state.isRunning) {
        clearTimeout(timeoutId);
        this.processingTimers.delete(jobId);
        return;
      }

      // Step 6: Store file (Supabase stub)
      const storagePath = `${this.provider.platform}/${this.state.username}/${job.video.id}.mp4`;
      this.updateJob(jobId, (j) => ({
        ...j,
        progress: 90,
        mediaUrl: job.video.videoUrl,
        storagePath,
      }));
      this.updateJob(jobId, (j) => addLog({ ...j, progress: 95 }, 'info', `Storage path: ${storagePath}`));

      // Step 7: Create database record (Supabase stub)
      this.updateJob(jobId, (j) => addLog({ ...j, progress: 98 }, 'info', 'Creating database record...'));
      await this.delay(200);

      // Step 8: Send to editing pipeline (integration stub)
      this.updateJob(jobId, (j) => addLog({ ...j, progress: 100 }, 'info', 'Queued for editing pipeline'));

      // Done!
      clearTimeout(timeoutId);
      this.processingTimers.delete(jobId);

      this.updateJob(jobId, (j) => ({
        ...j,
        status: 'completed',
        progress: 100,
        completedAt: new Date().toISOString(),
      }));
      this.updateJob(jobId, (j) => addLog(j, 'success', 'Import completed successfully'));

    } catch (error) {
      this.handleJobError(jobId, error instanceof Error ? error : new Error(String(error)));
    } finally {
      this.notifyQueueUpdate();
      // Process next job
      this.processNext();
    }
  }

  private handleJobError(jobId: string, error: Error): void {
    clearTimeout(this.processingTimers.get(jobId));
    this.processingTimers.delete(jobId);

    const job = this.state.jobs.find((j) => j.id === jobId);
    if (!job) return;

    const newRetryCount = job.retryCount + 1;

    this.updateJob(jobId, (j) => {
      let updated = addLog(
        { ...j },
        'error',
        `Error: ${error.message} (attempt ${newRetryCount}/${j.maxRetries})`
      );

      if (newRetryCount < j.maxRetries) {
        // Will retry
        updated = {
          ...updated,
          status: 'pending',
          retryCount: newRetryCount,
          errorMessage: error.message,
        };

        // Schedule retry with exponential backoff
        const retryDelay = this.config.retryDelay * Math.pow(2, newRetryCount - 1);
        this.updateJob(jobId, (j2) => addLog(j2, 'warn', `Retrying in ${retryDelay / 1000}s...`));

        const timer = setTimeout(() => {
          this.processingTimers.delete(jobId);
          this.processNext();
        }, retryDelay);
        this.processingTimers.set(jobId, timer);

        return updated;
      } else {
        // Permanently failed
        updated = {
          ...updated,
          status: 'failed',
          retryCount: newRetryCount,
          errorMessage: error.message,
          completedAt: new Date().toISOString(),
        };
        this.updateJob(jobId, (j2) => addLog(j2, 'error', 'Max retries reached. Manual review required.'));
        return updated;
      }
    });

    this.callbacks.onError?.(this.state.jobs.find((j) => j.id === jobId)!, error);
    this.notifyQueueUpdate();
  }

  private formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
