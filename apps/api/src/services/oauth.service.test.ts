import { beforeEach, describe, expect, it } from "bun:test";
import {
  OAuthService,
  type OAuthAccessToken,
  type OAuthProviderImplementation,
  type OAuthTokens,
  type OAuthUserInfo,
} from "./oauth.service";

// Mock OAuth provider implementation for testing
class MockOAuthProvider implements OAuthProviderImplementation {
  constructor(private providerName: string) {}

  getAuthorizationUrl(state: string, redirectUri: string): string {
    return `https://${this.providerName}.com/auth?state=${state}&redirect_uri=${redirectUri}`;
  }

  async exchangeCodeForTokens(
    code: string,
    redirectUri: string
  ): Promise<OAuthTokens> {
    return {
      accessToken: `access_token_${code}`,
      refreshToken: `refresh_token_${code}`,
      expiresIn: 3600,
      tokenType: "Bearer",
      scope: "profile email",
    };
  }

  async refreshAccessToken(refreshToken: string): Promise<OAuthAccessToken> {
    return {
      accessToken: `new_access_token_${refreshToken}`,
      expiresIn: 3600,
      tokenType: "Bearer",
    };
  }

  async getUserInfo(accessToken: string): Promise<OAuthUserInfo> {
    return {
      id: "user123",
      email: "user@example.com",
      name: "Test User",
      emailVerified: true,
    };
  }
}

describe("OAuthService", () => {
  let oauthService: OAuthService;
  let mockProvider: MockOAuthProvider;

  beforeEach(() => {
    oauthService = new OAuthService();
    mockProvider = new MockOAuthProvider("google");
  });

  describe("Provider Registration", () => {
    it("should register a provider", () => {
      oauthService.registerProvider("google", mockProvider);
      expect(oauthService.hasProvider("google")).toBe(true);
    });

    it("should retrieve a registered provider", () => {
      oauthService.registerProvider("google", mockProvider);
      const provider = oauthService.getProvider("google");
      expect(provider).toBe(mockProvider);
    });

    it("should throw error when getting unregistered provider", () => {
      expect(() => oauthService.getProvider("google")).toThrow(
        "OAuth provider 'google' is not registered"
      );
    });

    it("should return false for unregistered provider", () => {
      expect(oauthService.hasProvider("google")).toBe(false);
    });

    it("should list all registered providers", () => {
      const googleProvider = new MockOAuthProvider("google");
      const githubProvider = new MockOAuthProvider("github");

      oauthService.registerProvider("google", googleProvider);
      oauthService.registerProvider("github", githubProvider);

      const providers = oauthService.getRegisteredProviders();
      expect(providers).toContain("google");
      expect(providers).toContain("github");
      expect(providers.length).toBe(2);
    });

    it("should unregister a provider", () => {
      oauthService.registerProvider("google", mockProvider);
      expect(oauthService.hasProvider("google")).toBe(true);

      const removed = oauthService.unregisterProvider("google");
      expect(removed).toBe(true);
      expect(oauthService.hasProvider("google")).toBe(false);
    });

    it("should return false when unregistering non-existent provider", () => {
      const removed = oauthService.unregisterProvider("google");
      expect(removed).toBe(false);
    });

    it("should clear all providers", () => {
      oauthService.registerProvider("google", new MockOAuthProvider("google"));
      oauthService.registerProvider("github", new MockOAuthProvider("github"));

      expect(oauthService.getRegisteredProviders().length).toBe(2);

      oauthService.clearProviders();
      expect(oauthService.getRegisteredProviders().length).toBe(0);
    });
  });

  describe("Provider Operations", () => {
    beforeEach(() => {
      oauthService.registerProvider("google", mockProvider);
    });

    it("should generate authorization URL through provider", () => {
      const provider = oauthService.getProvider("google");
      const url = provider.getAuthorizationUrl(
        "state123",
        "http://localhost/callback"
      );
      expect(url).toContain("state=state123");
      expect(url).toContain("redirect_uri=http://localhost/callback");
    });

    it("should exchange code for tokens through provider", async () => {
      const provider = oauthService.getProvider("google");
      const tokens = await provider.exchangeCodeForTokens(
        "auth_code",
        "http://localhost/callback"
      );

      expect(tokens.accessToken).toBe("access_token_auth_code");
      expect(tokens.refreshToken).toBe("refresh_token_auth_code");
      expect(tokens.expiresIn).toBe(3600);
      expect(tokens.tokenType).toBe("Bearer");
    });

    it("should refresh access token through provider", async () => {
      const provider = oauthService.getProvider("google");
      const newToken = await provider.refreshAccessToken("old_refresh_token");

      expect(newToken.accessToken).toBe("new_access_token_old_refresh_token");
      expect(newToken.expiresIn).toBe(3600);
    });

    it("should get user info through provider", async () => {
      const provider = oauthService.getProvider("google");
      const userInfo = await provider.getUserInfo("access_token");

      expect(userInfo.id).toBe("user123");
      expect(userInfo.email).toBe("user@example.com");
      expect(userInfo.name).toBe("Test User");
      expect(userInfo.emailVerified).toBe(true);
    });
  });

  describe("Multiple Providers", () => {
    it("should support multiple providers simultaneously", () => {
      const googleProvider = new MockOAuthProvider("google");
      const githubProvider = new MockOAuthProvider("github");
      const microsoftProvider = new MockOAuthProvider("microsoft");

      oauthService.registerProvider("google", googleProvider);
      oauthService.registerProvider("github", githubProvider);
      oauthService.registerProvider("microsoft", microsoftProvider);

      expect(oauthService.getProvider("google")).toBe(googleProvider);
      expect(oauthService.getProvider("github")).toBe(githubProvider);
      expect(oauthService.getProvider("microsoft")).toBe(microsoftProvider);
    });

    it("should allow overwriting a provider registration", () => {
      const provider1 = new MockOAuthProvider("google_v1");
      const provider2 = new MockOAuthProvider("google_v2");

      oauthService.registerProvider("google", provider1);
      expect(oauthService.getProvider("google")).toBe(provider1);

      oauthService.registerProvider("google", provider2);
      expect(oauthService.getProvider("google")).toBe(provider2);
    });
  });
});
