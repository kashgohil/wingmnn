import { InMemoryQueue } from "../assets/inMemoryQueue";
import { QueueWorker } from "../assets/worker";
import { EmailProcessor } from "../processors/emailProcessor";
import { JobType, Queue } from "../types";

export class QueueService {
  private static instance: QueueService;
  private queue: Queue;
  private worker: QueueWorker;
  private emailProcessor: EmailProcessor;
  private isInitialized: boolean = false;

  private constructor() {
    this.queue = new InMemoryQueue({
      maxConcurrentJobs: 5,
      maxRetries: 3,
      retryDelayInMs: 5000,
    });

    this.worker = new QueueWorker(this.queue);
    this.emailProcessor = new EmailProcessor(this.queue);
  }

  /**
   * Get singleton
   */
  static getInstance(): QueueService {
    if (!QueueService.instance) {
      QueueService.instance = new QueueService();
    }
    return QueueService.instance;
  }

  /**
   * Start the Service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.warn("[QUEUE_SERVICE] Already initialized");
      return;
    }

    console.log("[QUEUE_SERVICE] Initializing queue service...");

    // Register processors
    this.worker.registerProcessor(JobType.FETCH_EMAILS, this.emailProcessor);
    this.worker.registerProcessor(
      JobType.PROCESS_EMAIL_BATCH,
      this.emailProcessor,
    );

    // Start the worker
    await this.worker.start();

    this.isInitialized = true;
  }

  /**
   * Shut down the Service
   */
  async shutdown(): Promise<void> {
    if (!this.isInitialized) {
      console.warn("[QUEUE_SERVICE] Not initialized");
      return;
    }

    console.log("[QUEUE_SERVICE] Shutting down queue service...");

    // Stop the worker
    await this.worker.stop();

    this.isInitialized = false;
    console.log("[QUEUE_SERVICE] Queue service shut down");
  }

  /**
   * Start email sync for a user
   */
  async startEmailSync(userId: string, isInitialSync = true): Promise<void> {
    if (!this.isInitialized) {
      throw new Error("Queue service not initialized");
    }

    await this.emailProcessor.startSync(userId, isInitialSync);
  }

  /**
   * Get statistics
   */
  async getStats() {
    if (!this.isInitialized) {
      throw new Error("Queue service not initialized");
    }

    const queueStats = await this.worker.getQueueStats();
    const workerStatus = this.worker.getStatus();

    return {
      queue: queueStats,
      worker: workerStatus,
      initialized: this.isInitialized,
    };
  }

  /**
   * Get jobs for a specific user
   */
  async getUserJobs(userId: string) {
    if (!this.isInitialized) {
      throw new Error("Queue service not initialized");
    }

    return await this.queue.getUserJobs(userId);
  }

  /**
   * Clear all jobs (for testing/debugging)
   */
  async clearJobs(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error("Queue service not initialized");
    }

    await this.queue.clear();
  }

  /**
   * Get job by ID
   */
  async getJob(jobId: string) {
    if (!this.isInitialized) {
      throw new Error("Queue service not initialized");
    }

    return await this.queue.getJob(jobId);
  }

  /**
   * Check if service is initialized
   */
  isReady(): boolean {
    return this.isInitialized;
  }
}

// Export singleton
export const queueService = QueueService.getInstance();
