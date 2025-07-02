import { Job, JobStatus, Queue, QueueOptions } from "../types";

export class InMemoryQueue implements Queue {
  private jobs: Map<string, Job> = new Map();
  private pendingJobs: Array<string> = [];
  private processingJobs: Set<string> = new Set();
  private options: Required<QueueOptions>;

  constructor(options?: QueueOptions) {
    this.options = {
      maxConcurrentJobs: options?.maxConcurrentJobs || 5,
      maxRetries: options?.maxRetries || 3,
      retryDelayInMs: options?.retryDelayInMs || 5000,
    };
  }

  async enqueue<T extends Job>(
    job: Omit<Job, "id" | "attempts" | "createdAt" | "updatedAt" | "status">,
  ): Promise<T> {
    const newJob: Job = {
      id: crypto.randomUUID(),
      status: JobStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
      attempts: 0,
      maxAttempts: this.options.maxRetries,
      ...job,
    } as T;

    this.jobs.set(newJob.id, newJob);
    this.pendingJobs.push(newJob.id);

    console.log(`[QUEUE] Added job ${job.type} with jobID: ${newJob.id}`);

    return newJob as T;
  }

  async next(): Promise<Job | null> {
    // Don't process new job if we're at max concurrency
    if (this.processingJobs.size >= this.options.maxConcurrentJobs) {
      return null;
    }

    // Get the next job
    const jobID = this.pendingJobs.shift();
    if (!jobID) {
      return null;
    }

    const job = this.jobs.get(jobID);
    if (!job) {
      console.warn(`[QUEUE] Job ${jobID} not found`);
      return this.next();
    }

    // Mark as processing
    await this.markProcessing(jobID);
    return job;
  }

  async getJob(jobId: string): Promise<Job | undefined> {
    return this.jobs.get(jobId);
  }

  async markCancelled(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job) {
      console.warn(`[QUEUE] Job ${jobId} not found`);
      return;
    }

    job.status = JobStatus.CANCELLED;
    job.updatedAt = new Date();
    this.processingJobs.delete(jobId);

    console.log(`[QUEUE] job ${jobId} is cancelled`);
  }

  async markCompleted(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job) {
      console.warn(`[QUEUE] Job ${jobId} not found`);
      return;
    }

    job.status = JobStatus.COMPLETED;
    job.updatedAt = new Date();
    job.completedAt = new Date();
    this.processingJobs.delete(jobId);

    console.log(`[QUEUE] job ${jobId} is completed`);
  }

  async markFailed(jobId: string, error: string): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job) {
      console.warn(`[QUEUE] Job ${jobId} not found`);
      return;
    }

    job.error = error;
    job.updatedAt = new Date();
    job.attempts += 1;

    this.processingJobs.delete(jobId);

    const maxAttempts = job.maxAttempts || this.options.maxRetries;

    // Retry if we haven't exceeded the maximum attempts
    if (job.attempts < maxAttempts) {
      job.status = JobStatus.RETRYING;

      // Add delay before retrying
      setTimeout(() => {
        this.retry(jobId);
      }, this.options.retryDelayInMs);

      console.log(
        `[QUEUE] job ${jobId} failed, retrying (attempt ${job.attempts}/${maxAttempts})`,
      );
    } else {
      job.status = JobStatus.FAILED;
      console.log(`[QUEUE] job ${jobId} failed permanently: `, error);
    }
  }

  async markProcessing(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job) {
      console.warn(`[QUEUE] Job ${jobId} not found`);
      return;
    }

    job.status = JobStatus.PROCESSING;
    job.updatedAt = new Date();

    this.processingJobs.add(jobId);

    console.log(`[QUEUE] job ${jobId} is processing`);
  }

  async retry(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job) {
      console.warn(`[QUEUE] Job ${jobId} not found`);
      return;
    }

    if (job.status === JobStatus.RETRYING) {
      job.attempts++;
      job.status = JobStatus.PENDING;
      job.updatedAt = new Date();

      this.pendingJobs.push(jobId);

      console.log(`[QUEUE] job ${jobId} is retried`);
    }
  }

  async clear(): Promise<void> {
    this.jobs.clear();
    this.pendingJobs.length = 0;
    this.processingJobs.clear();
    console.log("[QUEUE] all jobs are cleared");
  }

  async getStats(): Promise<{
    pending: number;
    total: number;
    processing: number;
    completed: number;
    failed: number;
    cancelled: number;
    retrying: number;
  }> {
    const stats = {
      total: this.jobs.size,
      pending: this.pendingJobs.length,
      processing: this.processingJobs.size,
      completed: 0,
      failed: 0,
      cancelled: 0,
      retrying: 0,
    };

    this.jobs.forEach((job) => {
      switch (job.status) {
        case JobStatus.CANCELLED:
          stats.cancelled++;
          break;
        case JobStatus.COMPLETED:
          stats.completed++;
          break;
        case JobStatus.FAILED:
          stats.failed++;
          break;
        case JobStatus.RETRYING:
          stats.retrying++;
          break;
      }
    });

    return stats;
  }

  async getUserJobs(userId: string): Promise<Array<Job>> {
    const jobs: Array<Job> = [];
    this.jobs.forEach((job) => {
      if (job.data.userId === userId) jobs.push(job);
    });
    return jobs;
  }

  /**
   * Clean up Completed, Cancelled or Failed jobs before this time
   * @param olderThanMs All Completed, Cancelled or Failed jobs before this time will be cleaned up
   * @default 24 * 60 * 1000 (24 Hours)
   */
  cleanup(olderThanMs: number = 24 * 60 * 1000): void {
    const cutoff = new Date(Date.now() - olderThanMs);

    const idsToBeCleaned: Array<string> = [];

    this.jobs.forEach((job, jobId) => {
      if (job.updatedAt < cutoff) {
        if (
          job.status === JobStatus.COMPLETED ||
          job.status === JobStatus.CANCELLED ||
          job.status === JobStatus.FAILED
        ) {
          idsToBeCleaned.push(jobId);
        }
      }
    });

    idsToBeCleaned.forEach((id) => this.jobs.delete(id));
    console.log(`[QUEUE] ${idsToBeCleaned.length} jobs are cleaned up`);
  }
}
