import { jwt as jwtPlugin } from "@elysiajs/jwt";
import crypto from "crypto";
import { config } from "../config";

// Import everything from the db package using workspace alias
import { db, eq, sessions, usedRefreshTokens } from "@wingmnn/db";

// Token payload interfaces
export interface TokenPayload {
  userId: string;
  sessionId: string;
  jti: string; // JWT ID
  iat: number; // Issued at
  exp: number; // Expiration
}

export interface TokenExpiredPayload {
  expired: true;
  sessionId: string;
  userId: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

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

// Token expiration constants
const ACCESS_TOKEN_EXPIRATION_SECONDS = 15 * 60; // 15 minutes
const NEAR_EXPIRATION_THRESHOLD_SECONDS = 5 * 60; // 5 minutes

// Initialize JWT helper - we'll use it as a utility
const createJwtHelper = async () => {
  const helper = await jwtPlugin({
    name: "jwt",
    secret: config.JWT_SECRET,
  });
  return helper.decorator.jwt;
};

let jwtHelper: Awaited<ReturnType<typeof createJwtHelper>>;

export class TokenService {
  private jwt: Awaited<ReturnType<typeof createJwtHelper>> | null = null;
  private initPromise: Promise<void> | null = null;

  constructor() {
    // Initialize JWT in constructor
    this.initPromise = this.initializeJwt();
  }

  private async initializeJwt() {
    if (!jwtHelper) {
      jwtHelper = await createJwtHelper();
    }
    this.jwt = jwtHelper;
  }

  private async ensureInitialized() {
    if (this.initPromise) {
      await this.initPromise;
    }
  }

  /**
   * Generate a JWT access token with 15-minute expiration
   */
  async generateAccessToken(
    userId: string,
    sessionId: string
  ): Promise<string> {
    await this.ensureInitialized();

    const jti = crypto.randomUUID();
    const iat = Math.floor(Date.now() / 1000);
    const exp = iat + ACCESS_TOKEN_EXPIRATION_SECONDS;

    // Create payload with proper JWT claims
    const payload: Record<string, any> = {
      userId,
      sessionId,
      jti,
      iat,
      exp,
    };

    const token = await this.jwt!.sign(payload);
    return token;
  }

  /**
   * Generate a cryptographically random refresh token (256-bit)
   */
  generateRefreshToken(): string {
    // Generate 32 bytes (256 bits) of random data
    const buffer = crypto.randomBytes(32);
    // Convert to base64url for safe transmission
    return buffer.toString("base64url");
  }

  /**
   * Hash a token using SHA-256
   */
  hashToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex");
  }

  /**
   * Verify an access token and return its payload
   * Returns TokenExpiredPayload if token is expired but otherwise valid
   */
  async verifyAccessToken(
    token: string
  ): Promise<TokenPayload | TokenExpiredPayload> {
    await this.ensureInitialized();

    try {
      const payload = (await this.jwt!.verify(token)) as TokenPayload | false;

      if (!payload) {
        throw new Error("Invalid token");
      }

      // Check if token is expired
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp < now) {
        return {
          expired: true,
          sessionId: payload.sessionId,
          userId: payload.userId,
        };
      }

      return payload;
    } catch (error) {
      // If verification fails, try to decode without verification to get session info
      // This helps with expired tokens
      try {
        const parts = token.split(".");
        if (parts.length === 3) {
          const payloadStr = Buffer.from(parts[1], "base64url").toString();
          const payload = JSON.parse(payloadStr) as TokenPayload;

          const now = Math.floor(Date.now() / 1000);
          if (payload.exp < now) {
            return {
              expired: true,
              sessionId: payload.sessionId,
              userId: payload.userId,
            };
          }
        }
      } catch {
        // If decoding fails, throw the original error
      }

      throw new Error("Invalid token");
    }
  }

  /**
   * Check if a token is near expiration (< 5 minutes remaining)
   */
  isTokenNearExpiration(token: string): boolean {
    try {
      const parts = token.split(".");
      if (parts.length !== 3) {
        return false;
      }

      const payloadStr = Buffer.from(parts[1], "base64url").toString();
      const payload = JSON.parse(payloadStr) as TokenPayload;

      const now = Math.floor(Date.now() / 1000);
      const timeRemaining = payload.exp - now;

      return timeRemaining < NEAR_EXPIRATION_THRESHOLD_SECONDS;
    } catch {
      return false;
    }
  }

  /**
   * Validate a refresh token and return the associated session
   * Throws error if token is invalid, expired, or revoked
   */
  async validateRefreshToken(token: string): Promise<Session> {
    const tokenHash = this.hashToken(token);

    // Find session by refresh token hash
    const result = await db
      .select()
      .from(sessions)
      .where(eq(sessions.refreshTokenHash, tokenHash))
      .limit(1);

    const session = result[0];

    if (!session) {
      throw new Error("Invalid refresh token");
    }

    // Check if session is revoked
    if (session.isRevoked) {
      throw new Error("Session revoked");
    }

    // Check if session is expired
    if (session.expiresAt < new Date()) {
      throw new Error("Session expired");
    }

    return session;
  }

  /**
   * Refresh tokens with rotation and reuse detection
   * Issues new access and refresh tokens, invalidates old refresh token
   */
  async refreshTokens(refreshToken: string): Promise<TokenPair> {
    const tokenHash = this.hashToken(refreshToken);

    // Check if token has been used before (reuse detection)
    const usedTokenResult = await db
      .select()
      .from(usedRefreshTokens)
      .where(eq(usedRefreshTokens.tokenHash, tokenHash))
      .limit(1);

    const usedToken = usedTokenResult[0];

    if (usedToken) {
      // Token reuse detected - revoke the entire session
      await this.revokeSession(usedToken.sessionId);
      throw new Error("Token reuse detected - session revoked");
    }

    // Validate the refresh token and get session
    const session = await this.validateRefreshToken(refreshToken);

    // Mark the old token as used
    await db.insert(usedRefreshTokens).values({
      tokenHash,
      sessionId: session.id,
      usedAt: new Date(),
    });

    // Generate new tokens
    const newAccessToken = await this.generateAccessToken(
      session.userId,
      session.id
    );
    const newRefreshToken = this.generateRefreshToken();
    const newRefreshTokenHash = this.hashToken(newRefreshToken);

    // Generate new JTI for tracking
    const jti = crypto.randomUUID();

    // Update session with new refresh token hash and JTI
    await db
      .update(sessions)
      .set({
        refreshTokenHash: newRefreshTokenHash,
        accessTokenJti: jti,
        lastActivityAt: new Date(),
      })
      .where(eq(sessions.id, session.id));

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresIn: ACCESS_TOKEN_EXPIRATION_SECONDS,
    };
  }

  /**
   * Revoke a session by marking it as revoked
   */
  async revokeSession(sessionId: string): Promise<void> {
    await db
      .update(sessions)
      .set({ isRevoked: true })
      .where(eq(sessions.id, sessionId));
  }
}

// Export singleton instance
export const tokenService = new TokenService();
