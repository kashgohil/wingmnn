import { db, lt, usedRefreshTokens } from "@wingmnn/db";
import { sessionService } from "./session.service";

/**
 * Cleanup service for removing expired sessions and old used refresh tokens
 * This service should be run periodically (e.g., daily) to maintain database hygiene
 */
export class CleanupService {
  // Delete used refresh tokens older than 30 days
  private readonly USED_TOKEN_RETENTION_DAYS = 30;

  /**
   * Delete expired sessions from the database
   * @returns Promise resolving to the number of sessions deleted
   */
  async deleteExpiredSessions(): Promise<number> {
    return await sessionService.deleteExpiredSessions();
  }

  /**
   * Delete used refresh tokens older than 30 days
   * These tokens are kept for reuse detection but can be safely removed after 30 days
   * @returns Promise resolving to the number of tokens deleted
   */
  async deleteOldUsedRefreshTokens(): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.USED_TOKEN_RETENTION_DAYS);

    // Delete used refresh tokens older than the cutoff date
    const result = await db
      .delete(usedRefreshTokens)
      .where(lt(usedRefreshTokens.usedAt, cutoffDate))
      .returning();

    return result.length;
  }

  /**
   * Run all cleanup tasks
   * This is the main method that should be called by the scheduled job
   * @returns Promise resolving to cleanup statistics
   */
  async runCleanup(): Promise<{
    sessionsDeleted: number;
    tokensDeleted: number;
  }> {
    console.log("[Cleanup] Starting cleanup job...");

    const sessionsDeleted = await this.deleteExpiredSessions();
    console.log(`[Cleanup] Deleted ${sessionsDeleted} expired sessions`);

    const tokensDeleted = await this.deleteOldUsedRefreshTokens();
    console.log(`[Cleanup] Deleted ${tokensDeleted} old used refresh tokens`);

    console.log("[Cleanup] Cleanup job completed");

    return {
      sessionsDeleted,
      tokensDeleted,
    };
  }
}

// Export singleton instance
export const cleanupService = new CleanupService();
