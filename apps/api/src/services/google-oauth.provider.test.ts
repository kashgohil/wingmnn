/**
 * Google OAuth Provider Tests
 */

import { beforeEach, describe, expect, it } from "bun:test";
import { GoogleOAuthProvider } from "./google-oauth.provider";

describe("GoogleOAuthProvider", () => {
  let provider: GoogleOAuthProvider;
  const mockClientId = "test-client-id";
  const mockClientSecret = "test-client-secret";
  const mockRedirectUri = "http://localhost:3000/auth/google/callback";

  beforeEach(() => {
    provider = new GoogleOAuthProvider(mockClientId, mockClientSecret);
  });

  describe("getAuthorizationUrl", () => {
    it("should generate authorization URL with correct parameters", () => {
      const state = "test-state-123";
      const url = provider.getAuthorizationUrl(state, mockRedirectUri);

      expect(url).toContain("https://accounts.google.com/o/oauth2/v2/auth");
      expect(url).toContain(`client_id=${mockClientId}`);
      expect(url).toContain(
        `redirect_uri=${encodeURIComponent(mockRedirectUri)}`
      );
      expect(url).toContain("response_type=code");
      expect(url).toContain("scope=openid+email+profile");
      expect(url).toContain("access_type=offline");
      expect(url).toContain("prompt=consent");
      expect(url).toContain(`state=${state}`);
    });

    it("should include offline access for refresh token", () => {
      const state = "test-state";
      const url = provider.getAuthorizationUrl(state, mockRedirectUri);

      expect(url).toContain("access_type=offline");
    });

    it("should force consent prompt to ensure refresh token", () => {
      const state = "test-state";
      const url = provider.getAuthorizationUrl(state, mockRedirectUri);

      expect(url).toContain("prompt=consent");
    });
  });

  describe("exchangeCodeForTokens", () => {
    it("should throw error with invalid code", async () => {
      const invalidCode = "invalid-code";

      await expect(
        provider.exchangeCodeForTokens(invalidCode, mockRedirectUri)
      ).rejects.toThrow();
    });
  });

  describe("refreshAccessToken", () => {
    it("should throw error with invalid refresh token", async () => {
      const invalidRefreshToken = "invalid-refresh-token";

      await expect(
        provider.refreshAccessToken(invalidRefreshToken)
      ).rejects.toThrow();
    });
  });

  describe("getUserInfo", () => {
    it("should throw error with invalid access token", async () => {
      const invalidAccessToken = "invalid-access-token";

      await expect(provider.getUserInfo(invalidAccessToken)).rejects.toThrow();
    });
  });

  describe("verifyIdToken", () => {
    it("should throw error with invalid ID token", async () => {
      const invalidIdToken = "invalid-id-token";

      await expect(provider.verifyIdToken(invalidIdToken)).rejects.toThrow();
    });
  });
});
