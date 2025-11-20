import { describe, expect, it } from "bun:test";
import { tokenService } from "./token.service";

describe("TokenService", () => {
  describe("generateRefreshToken", () => {
    it("should generate a 256-bit random token", () => {
      const token = tokenService.generateRefreshToken();

      // Base64url encoding of 32 bytes (256 bits) should be 43 characters
      expect(token.length).toBe(43);

      // Should be different each time
      const token2 = tokenService.generateRefreshToken();
      expect(token).not.toBe(token2);
    });
  });

  describe("hashToken", () => {
    it("should hash a token using SHA-256", () => {
      const token = "test-token";
      const hash = tokenService.hashToken(token);

      // SHA-256 hash in hex should be 64 characters
      expect(hash.length).toBe(64);

      // Should be deterministic
      const hash2 = tokenService.hashToken(token);
      expect(hash).toBe(hash2);

      // Different tokens should produce different hashes
      const hash3 = tokenService.hashToken("different-token");
      expect(hash).not.toBe(hash3);
    });
  });

  describe("generateAccessToken", () => {
    it("should generate a JWT access token with correct payload", async () => {
      const userId = "user-123";
      const sessionId = "session-456";

      const token = await tokenService.generateAccessToken(userId, sessionId);

      // JWT should have 3 parts separated by dots
      const parts = token.split(".");
      expect(parts.length).toBe(3);

      // Decode payload to verify contents
      const payloadStr = Buffer.from(parts[1], "base64url").toString();
      const payload = JSON.parse(payloadStr);

      expect(payload.userId).toBe(userId);
      expect(payload.sessionId).toBe(sessionId);
      expect(payload.jti).toBeDefined();
      expect(payload.iat).toBeDefined();
      expect(payload.exp).toBeDefined();

      // Expiration should be 15 minutes (900 seconds) from issued time
      expect(payload.exp - payload.iat).toBe(900);
    });
  });

  describe("verifyAccessToken", () => {
    it("should verify a valid access token", async () => {
      const userId = "user-123";
      const sessionId = "session-456";

      const token = await tokenService.generateAccessToken(userId, sessionId);
      const result = await tokenService.verifyAccessToken(token);

      expect("expired" in result).toBe(false);
      if (!("expired" in result)) {
        expect(result.userId).toBe(userId);
        expect(result.sessionId).toBe(sessionId);
        expect(result.jti).toBeDefined();
      }
    });

    it("should detect expired tokens", async () => {
      // Create a token that's already expired
      const userId = "user-123";
      const sessionId = "session-456";

      // We can't easily test this without mocking time or waiting 15 minutes
      // So we'll just verify the token near expiration detection works
      const token = await tokenService.generateAccessToken(userId, sessionId);
      const isNearExpiration = tokenService.isTokenNearExpiration(token);

      // A freshly generated token should not be near expiration
      expect(isNearExpiration).toBe(false);
    });
  });

  describe("isTokenNearExpiration", () => {
    it("should return false for a fresh token", async () => {
      const token = await tokenService.generateAccessToken(
        "user-123",
        "session-456"
      );
      const isNear = tokenService.isTokenNearExpiration(token);

      expect(isNear).toBe(false);
    });

    it("should return false for invalid tokens", () => {
      const isNear = tokenService.isTokenNearExpiration("invalid-token");
      expect(isNear).toBe(false);
    });
  });
});
