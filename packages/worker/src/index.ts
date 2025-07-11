import { tryCatchAsync } from "@wingmnn/utils";
import { Hono } from "hono";
import { queueService } from "./services/queueService";

export type AuthenticateEnv = {
  Variables: {
    user: {
      id: string;
      name: string;
      email: string;
    };
  };
};

export const queue = new Hono<AuthenticateEnv>().basePath("/queue");

// Initialize the Queue Service
queueService.initialize().catch((error) => {
  console.error("[WORKER] Failed to initialize the Queue Service: ", error);
});

// Gracefully shutdown the Queue Service
process.on("SIGTERM", async () => {
  console.log("[APP] Received SIGTERM signal, shutting down gracefully...");
  await queueService.shutdown();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("[APP] Received SIGINT signal, shutting down gracefully...");
  await queueService.shutdown();
  process.exit(0);
});

// Get queue statistics
queue.get("/stats", async (c) => {
  const { result: stats, error } = await tryCatchAsync(queueService.getStats());

  if (error) {
    console.error("[QUEUE_API] Error getting queue stats:", error);
    return c.json({ error: "Failed to get queue statistics" }, 500);
  }

  return c.json({ stats });
});

// Get jobs for current user
queue.get("/jobs", async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "User not authenticated" }, 401);
  }

  const { result: jobs, error } = await tryCatchAsync(
    queueService.getUserJobs(user.id),
  );

  if (error) {
    console.error(`[QUEUE_API] Error getting jobs for user ${user.id}:`, error);
    return c.json({ error: "Failed to get user jobs" }, 500);
  }

  return c.json({ jobs });
});

// Get specific job by ID
queue.get("/jobs/:jobId", async (c) => {
  const jobId = c.req.param("jobId");
  const user = c.get("user");

  if (!user) {
    return c.json({ error: "User not authenticated" }, 401);
  }

  const { result: job, error } = await tryCatchAsync(
    queueService.getJob(jobId),
  );

  if (error) {
    console.error(`[QUEUE_API] Error getting job ${jobId}:`, error);
    return c.json({ error: "Failed to get job" }, 500);
  }

  if (!job) {
    return c.json({ error: "Job not found" }, 404);
  }

  // Check if user owns this job
  const jobData = job as any;
  if (jobData.data?.userId !== user.id) {
    return c.json({ error: "Access denied" }, 403);
  }

  return c.json({ job });
});

// Trigger email sync for current user
queue.post("/sync-emails", async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "User not authenticated" }, 401);
  }

  const { error } = await tryCatchAsync(
    queueService.startEmailSync(user.id, false), // Not initial sync
  );

  if (error) {
    console.error(
      `[QUEUE_API] Error starting email sync for user ${user.id}:`,
      error,
    );
    return c.json({ error: "Failed to start email sync" }, 500);
  }

  return c.json({
    message: "Email sync started successfully",
    userId: user.id,
  });
});

// Clear all jobs (admin only - for development/debugging)
queue.delete("/jobs", async (c) => {
  // In production, you might want to add admin authentication here
  const { error } = await tryCatchAsync(queueService.clearJobs());

  if (error) {
    console.error("[QUEUE_API] Error clearing jobs:", error);
    return c.json({ error: "Failed to clear jobs" }, 500);
  }

  return c.json({ message: "All jobs cleared successfully" });
});

// Health check for queue service
queue.get("/health", async (c) => {
  const isReady = queueService.isReady();

  if (!isReady) {
    return c.json(
      {
        status: "unhealthy",
        message: "Queue service not initialized",
      },
      503,
    );
  }

  const { result: stats, error } = await tryCatchAsync(queueService.getStats());

  if (error) {
    return c.json(
      {
        status: "unhealthy",
        message: "Failed to get queue stats",
      },
      503,
    );
  }

  return c.json({
    status: "healthy",
    queueReady: true,
    stats,
  });
});
