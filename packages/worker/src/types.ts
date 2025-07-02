export enum JobType {
  FETCH_EMAILS = "FETCH_EMAILS",
  PROCESS_EMAIL_BATCH = "PROCESS_EMAIL_BATCH",
}

export enum JobStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  RETRYING = "RETRYING",
  CANCELLED = "CANCELLED",
}

export interface BaseJob {
  id: string;
  type: JobType;
  status: JobStatus;
  error?: string;
  attempts: number;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  maxAttempts?: number;
}

export interface FetchEmailsJob extends BaseJob {
  type: JobType.FETCH_EMAILS;
  data: {
    userId: string;
    pageToken?: string;
    initSync: boolean;
  };
}

export interface ProcessEmailBatchJob extends BaseJob {
  type: JobType.PROCESS_EMAIL_BATCH;
  data: {
    userId: string;
    emailIds: string[];
    batchNumber: number;
    totalBatches: number;
  };
}

export type Job = FetchEmailsJob | ProcessEmailBatchJob;

export interface JobProcessor<T extends Job = Job> {
  process(job: T): Promise<void>;
}

export interface QueueOptions {
  maxConcurrentJobs?: number;
  maxRetries?: number;
  retryDelayInMs?: number;
}

export interface Queue {
  enqueue<T extends Job>(
    item: Omit<T, "id" | "status" | "createdAt" | "updatedAt" | "attempts">,
  ): Promise<T>;

  next(): Promise<Job | null>;

  markFailed(jobId: string, error: string): Promise<void>;
  markCompleted(jobId: string): Promise<void>;
  markProcessing(jobId: string): Promise<void>;
  markCancelled(jobId: string): Promise<void>;

  retry(jobId: string): Promise<void>;

  clear(): Promise<void>;

  getJob(jobId: string): Promise<Job | undefined>;
  getUserJobs(userId: string): Promise<Array<Job>>;

  getStats(): Promise<{
    total: number;
    pending: number;
    processing: number;
    completed: number;
    failed: number;
    cancelled: number;
    retrying: number;
  }>;

  cleanup(olderThanMs: number): void;
}
