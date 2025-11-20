import { and, db, eq, sessions } from "@wingmnn/db";
import crypto from "crypto";

/**
 * Request metadata for session creation
 */
export interface RequestMetadata {
  ipAddress: string;
  userAgent: string;
}

/**
 * Session model interface
 */
export interface Session {
  id: string;
  userId: string;
  refreshTokenHash: string;
  accessTokenJti: string;
  createdAt: Date;
  expiresAt: Date;
  lastActivityAt: Date;
  ipAddress: string | null;
  userAgent: string | null;
  isRevoked: boolean;
}

/**
 * Session service for managing user sessions
 * Handles session creation, retrieval, activity tracking, extension, and revocation
 */
export class SessionService {
  // Session expiration: 30 days
  private readonly SESSION_EXPIRATION_DAYS = 30;
  // Extend session when within 7 days of expiration
  private readonly SESSION_EXTENSION_THRESHOLD_DAYS = 7;

  /**
   * Create a new session with 30-day expiration
   * @param userId - User ID for the session
   * @param refreshTokenHash - Hashed refresh token
   * @param metadata - Request metadata (IP address, user agent)
   * @returns Promise resolving to the created session
   */
  async createSession(
    userId: string,
    refreshTokenHash: string,
    metadata: RequestMetadata
  ): Promise<Session> {
    const now = new Date();
    const expiresAt = new Date(
      now.getTime() + this.SESSION_EXPIRATION_DAYS * 24 * 60 * 60 * 1000
    );

    // Generate a unique JTI for the access token
    const accessTokenJti = crypto.randomUUID();

    const result = await db
      .insert(sessions)
      .values({
        userId,
        refreshTokenHash,
        accessTokenJti,
        expiresAt,
        ipAddress: metadata.ipAddress,
        userAgent: metadata.userAgent,
      })
      .returning();

    return result[0];
  }

  /**
   * Get a session by ID
   * @param sessionId - Session ID to retrieve
   * @returns Promise resolving to the session or null if not found
   */
  async getSession(sessionId: string): Promise<Session | null> {
    const result = await db
      .select()
      .from(sessions)
      .where(eq(sessions.id, sessionId))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Get all active (non-revoked, non-expired) sessions for a user
   * @param userId - User ID to get sessions for
   * @returns Promise resolving to array of sessions
   */
  async getUserSessions(userId: string): Promise<Session[]> {
    const now = new Date();

    const result = await db
      .select()
      .from(sessions)
      .where(
        and(
          eq(sessions.userId, userId),
          eq(sessions.isRevoked, false)
          // Only return non-expired sessions
          // Note: Using SQL comparison for dates
        )
      );

    // Filter expired sessions in application code
    return result.filter((session) => session.expiresAt > now);
  }

  /**
   * Update the last activity timestamp for a session
   * @param sessionId - Session ID to update
   * @returns Promise resolving when update is complete
   */
  async updateLastActivity(sessionId: string): Promise<void> {
    await db
      .update(sessions)
      .set({ lastActivityAt: new Date() })
      .where(eq(sessions.id, sessionId));
  }

  /**
   * Extend session expiration if within threshold (7 days of expiration)
   * @param sessionId - Session ID to potentially extend
   * @returns Promise resolving to true if session was extended, false otherwise
   */
  async extendSessionIfNeeded(sessionId: string): Promise<boolean> {
    const session = await this.getSession(sessionId);

    if (!session || session.isRevoked) {
      return false;
    }

    const now = new Date();
    const timeUntilExpiration = session.expiresAt.getTime() - now.getTime();
    const thresholdMs =
      this.SESSION_EXTENSION_THRESHOLD_DAYS * 24 * 60 * 60 * 1000;

    // Check if session is within 7 days of expiration
    if (timeUntilExpiration <= thresholdMs && timeUntilExpiration > 0) {
      // Extend session by 30 days from now
      const newExpiresAt = new Date(
        now.getTime() + this.SESSION_EXPIRATION_DAYS * 24 * 60 * 60 * 1000
      );

      await db
        .update(sessions)
        .set({ expiresAt: newExpiresAt })
        .where(eq(sessions.id, sessionId));

      return true;
    }

    return false;
  }

  /**
   * Revoke a specific session
   * @param sessionId - Session ID to revoke
   * @returns Promise resolving when revocation is complete
   */
  async revokeSession(sessionId: string): Promise<void> {
    await db
      .update(sessions)
      .set({ isRevoked: true })
      .where(eq(sessions.id, sessionId));
  }

  /**
   * Revoke all sessions for a user, optionally excluding one session
   * @param userId - User ID whose sessions to revoke
   * @param exceptSessionId - Optional session ID to exclude from revocation
   * @returns Promise resolving when revocation is complete
   */
  async revokeAllUserSessions(
    userId: string,
    exceptSessionId?: string
  ): Promise<void> {
    if (exceptSessionId) {
      // Revoke all sessions except the specified one
      await db
        .update(sessions)
        .set({ isRevoked: true })
        .where(
          and(
            eq(sessions.userId, userId)
            // Use SQL to exclude the session
            // Note: Drizzle doesn't have a direct "not equal" operator in the same way
            // We'll use a workaround with raw SQL or multiple conditions
          )
        );

      // Workaround: Get all sessions and update individually
      const userSessions = await db
        .select()
        .from(sessions)
        .where(eq(sessions.userId, userId));

      for (const session of userSessions) {
        if (session.id !== exceptSessionId) {
          await this.revokeSession(session.id);
        }
      }
    } else {
      // Revoke all sessions for the user
      await db
        .update(sessions)
        .set({ isRevoked: true })
        .where(eq(sessions.userId, userId));
    }
  }

  /**
   * Delete expired sessions from the database
   * This should be run periodically as a cleanup job
   * @returns Promise resolving to the number of sessions deleted
   */
  async deleteExpiredSessions(): Promise<number> {
    const now = new Date();

    // Get all sessions and filter expired ones in application code
    const allSessions = await db.select().from(sessions);

    const sessionsToDelete = allSessions.filter(
      (session) => session.expiresAt < now
    );

    // Delete expired sessions
    for (const session of sessionsToDelete) {
      await db.delete(sessions).where(eq(sessions.id, session.id));
    }

    return sessionsToDelete.length;
  }
}

// Export singleton instance
export const sessionService = new SessionService();
