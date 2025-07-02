import { getValidGoogleAccessToken, GmailService } from "@wingmnn/google";
import { tryCatchAsync } from "@wingmnn/utils";
import {
  FetchEmailsJob,
  Job,
  JobProcessor,
  JobType,
  ProcessEmailBatchJob,
  Queue,
} from "../types";

export class EmailProcessor implements JobProcessor {
  private service: GmailService;
  private queue: Queue;

  private batchSize: number = 100;

  constructor(queue: Queue) {
    this.service = new GmailService();
    this.queue = queue;
  }

  async process(job: Job): Promise<void> {
    switch (job.type) {
      case JobType.FETCH_EMAILS:
        await this.fetchEmailsJob(job);
        break;
      case JobType.PROCESS_EMAIL_BATCH:
        await this.processEmailBatchJob(job);
        break;
      default:
        console.warn(`[EMAIL_PROCESSOR] Unknown job type`);
    }
  }

  async startSync(userId: string, initSync: boolean = false): Promise<void> {
    console.log(`[EMAIL_PROCESSOR] Starting email sync for user ${userId}`);

    await this.queue.enqueue({
      type: JobType.FETCH_EMAILS,
      data: {
        userId,
        initSync,
      },
    });
  }

  /**
   * fetch email metadata and create batches
   */
  private async fetchEmailsJob(job: FetchEmailsJob): Promise<void> {
    const { userId, pageToken, initSync } = job.data;

    // Get valid access token
    const { result: accessToken, error } = await tryCatchAsync(
      getValidGoogleAccessToken(userId),
    );

    if (error || !accessToken) {
      console.error(
        `[EMAIL_PROCESSOR] Failed to fetch valid access token`,
        error,
      );
      return;
    }

    // Fetch email list from GmailService
    const { result: emailList, error: emailError } = await tryCatchAsync(
      this.service.fetchEmailList(accessToken, pageToken, this.batchSize),
    );

    if (emailError) {
      console.error(`[EMAIL_PROCESSOR] Failed to fetch email list`, emailError);
      return;
    }

    if (!emailList.messages || emailList.messages.length === 0) {
      console.log(`[EMAIL_PROCESSOR] No emails found for user ${userId}`);
      return;
    }

    // Create batches
    const emailIds = emailList.messages.map((mail) => mail.id).filter(Boolean);
    const totalBatches = Math.ceil(emailIds.length / this.batchSize);

    for (let i = 0; i < totalBatches; i++) {
      const start = i * this.batchSize;
      const end = Math.min(start + this.batchSize, emailIds.length);
      const batch = emailIds.slice(start, end);

      const { error } = await tryCatchAsync(
        this.queue.enqueue({
          type: JobType.PROCESS_EMAIL_BATCH,
          data: {
            userId,
            initSync,
            emailIds: batch,
            batchNumber: i + 1,
            totalBatches,
          },
          maxAttempts: 3,
        }),
      );

      if (error) {
        console.error(
          `[EMAIL_PROCESSOR] Failed to enqueue email batch job`,
          error,
        );
        return;
      }
    }

    console.log(
      `[EMAIL_PROCESSOR] Created ${totalBatches} batch jobs for user ${userId}`,
    );

    // If there is a next page token, create a job to fetch the next page
    if (emailList.nextPageToken) {
      const { error } = await tryCatchAsync(
        this.queue.enqueue({
          type: JobType.FETCH_EMAILS,
          data: {
            userId,
            initSync,
            pageToken: emailList.nextPageToken,
          },
          maxAttempts: 3,
        }),
      );

      if (error) {
        console.error(
          `[EMAIL_PROCESSOR] Failed to enqueue job to fetch next page emails`,
          error,
        );
        return;
      }

      console.log(
        `[EMAIL_PROCESSOR] Created next page fetch job for user ${userId}`,
      );
    }
  }

  /**
   * Process a batch of emails for a user.
   */
  private async processEmailBatchJob(job: ProcessEmailBatchJob): Promise<void> {
    const { userId, emailIds, batchNumber, totalBatches } = job.data;

    const { result: accessToken, error } = await tryCatchAsync(
      getValidGoogleAccessToken(userId),
    );

    if (error || !accessToken) {
      console.error(
        `[EMAIL_PROCESSOR] Failed to get valid Google access token to fetch emails from ${batchNumber}/${totalBatches} for user ${userId}`,
        error,
      );
      return;
    }

    const emailPromises = emailIds.map((id) =>
      this.service.fetchEmailContent(accessToken, id),
    );

    const { result: emails, error: emailError } = await tryCatchAsync(
      Promise.all(emailPromises),
    );

    if (emailError) {
      console.error(
        `[EMAIL_PROCESSOR] Failed to fetch emails from batch ${batchNumber}/${totalBatches} for user ${userId}`,
        emailError,
      );
      return;
    }

    // Process the fetched emails here
    const emailsToSave = emails
      .filter(Boolean)
      .map((m) => this.service.adapt(m, userId));

    if (emailsToSave.length > 0) {
      const { error: persistError } = await tryCatchAsync(
        this.service.persist(emailsToSave),
      );

      if (persistError) {
        console.error(
          `[EMAIL_PROCESSOR] Failed to persist emails from batch ${batchNumber}/${totalBatches} for user ${userId}`,
          persistError,
        );
        return;
      } else {
        console.log(
          `[EMAIL_PROCESSOR] Saved ${emailsToSave.length} emails from batch ${batchNumber}/${totalBatches} for user ${userId}`,
        );
      }
    } else {
      console.log(
        `[EMAIL_PROCESSOR] No valid emails to save from batch ${batchNumber}/${totalBatches} for user ${userId}`,
      );
    }
  }
}
