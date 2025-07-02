import { tryCatchAsync } from "@wingmnn/utils";
import { Job, JobProcessor, JobType, Queue } from "../types";

export class QueueWorker {
  private queue: Queue;
  private processors: Map<string, JobProcessor> = new Map();
  private processingPromises: Set<Promise<void>> = new Set();
  private isRunning: boolean = false;
  private shutdownRequest: boolean = false;

  constructor(queue: Queue) {
    this.queue = queue;
  }

  /**
   * Register a job processor for a specific job type
   */
  registerProcessor(jobType: JobType, processor: JobProcessor): void {
    this.processors.set(jobType, processor);
    console.log("[WORKER] Registered processor for job type: ", jobType);
  }

  /**
   * Start the worker to begin processing jobs
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.warn("[WORKER] Worker is already running");
      return;
    }

    this.isRunning = true;
    this.shutdownRequest = false;
    console.log("[WORKER] Starting queue worker");

    this.processLoop();
  }

  /**
   * Stop the worker
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      console.warn("[WORKER] Worker is not running");
      return;
    }

    console.log("[WORKER] Stopping the queue worker gracefully...");
    this.shutdownRequest = true;

    // Wait for all the processing jobs to complete
    await Promise.all(Array.from(this.processingPromises));

    this.isRunning = false;
    console.log("[WORKER] Queue worker stopped");
  }

  /**
   * Get worker status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      processingJobs: this.processingPromises.size,
      registeredProcessors: Array.from(this.processors.keys()),
      shutdownRequested: this.shutdownRequest,
    };
  }

  /**
   * Get queue statistics
   */
  async getQueueStats() {
    return this.queue.getStats();
  }

  /**
   * Process the Queue
   */
  private async processLoop(): Promise<void> {
    while (this.isRunning && !this.shutdownRequest) {
      const job = await this.queue.next();

      if (job) {
        // Process job in background
        const processingPromise = this.processJob(job);
        this.processingPromises.add(processingPromise);

        // Cleanup processing promise when it's done
        processingPromise.finally(() => {
          this.processingPromises.delete(processingPromise);
        });
      } else {
        // No jobs available, sleep for a bit before checking again
        await this.sleep(1000);
      }
    }
  }

  /**
   * Process a job from the queue
   */
  private async processJob(job: Job): Promise<void> {
    const processor = this.processors.get(job.type);
    if (!processor) {
      const error = `No processor registered for job type: ${job.type}`;
      console.error(`[WORKER] ${error}`);
      await this.queue.markFailed(job.id, error);
      return;
    }

    const startTime = Date.now();
    console.log(`[WORKER] Processing job ${job.id} (${job.type})`);

    const { error } = await tryCatchAsync(processor.process(job));

    if (error) {
      this.queue.markFailed(job.id, error?.message || "Unknown error");
      console.error(`[WORKER] Error processing job ${job.id}: ${error}`);
    } else {
      const duration = Date.now() - startTime;
      this.queue.markCompleted(job.id);
      console.log(
        `[WORKER] Job ${job.id} processed successfully in ${duration}ms`,
      );
    }
  }

  /**
   * Sleep for a specified amount of time
   */
  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
