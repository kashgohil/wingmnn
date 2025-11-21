/**
 * Example usage of the cleanup service
 * This file demonstrates how to manually trigger cleanup operations
 *
 * In production, cleanup runs automatically every 24 hours via the scheduled job in index.ts
 */

import { cleanupService } from "./cleanup.service";

async function runManualCleanup() {
  console.log("Running manual cleanup...");

  try {
    const result = await cleanupService.runCleanup();

    console.log("\nCleanup completed successfully:");
    console.log(`- Sessions deleted: ${result.sessionsDeleted}`);
    console.log(`- Used refresh tokens deleted: ${result.tokensDeleted}`);
  } catch (error) {
    console.error("Error running cleanup:", error);
  }
}

// Uncomment to run manually:
// runManualCleanup();
