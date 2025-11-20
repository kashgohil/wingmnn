import { db, eq, oauthAccounts, sessions, users } from "@wingmnn/db";
import { beforeEach, describe, expect, it, mock } from "bun:test";
import { AuthError, AuthErrorCode, authService } from "./auth.service";
import type { OAuthTokens } from "./oauth.service";
import { oauthService } from "./oauth.service";
import type { RequestMetadata } from "./session.service";

// Test helpers
const createTestMetadata = (): RequestMetadata => ({
  ipAddress: "127.0.0.1",
  userAgent: "test-agent",
});

const createTestOAuthTokens = (): OAuthTokens => ({
  accessToken: "test-access-token",
  refreshToken: "test-refresh-token",
  idToken: "test-id-token",
  expiresIn: 3600,
  tokenType: "Bearer",
  scope: "openid email profile",
});

// Cleanup helper - delete sessions first due to foreign key constraints
const cleanupTestUser = async (email: string) => {
  const user = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (user[0]) {
    // Delete sessions first (foreign key constraint)
    await db.delete(sessions).where(eq(sessions.userId, user[0].id));
    // Delete OAuth accounts (foreign key constraint)
    await db.delete(oauthAccounts).where(eq(oauthAccounts.userId, user[0].id));
    // Now delete the user
    await db.delete(users).where(eq(users.id, user[0].id));
  }
};

describe("AuthService", () => {
  const testEmail = "test@example.com";
  const testPassword = "testpassword123";
  const testName = "Test User";
  const metadata = createTestMetadata();

  beforeEach(async () => {
    // Clean up test user before each test
    await cleanupTestUser(testEmail);
  });

  describe("register", () => {
    it("should register a new user with valid credentials", async () => {
      const result = await authService.register(
        testEmail,
        testPassword,
        testName,
        metadata
      );

      expect(result).toBeDefined();
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.expiresIn).toBe(15 * 60);
      expect(result.user.email).toBe(testEmail);
      expect(result.user.name).toBe(testName);

      // Verify user was created in database
      const user = await authService.findUserByEmail(testEmail);
      expect(user).toBeDefined();
      expect(user?.email).toBe(testEmail);
      expect(user?.passwordHash).toBeDefined();
    });

    it("should reject registration with invalid email", async () => {
      await expect(
        authService.register("invalid-email", testPassword, testName, metadata)
      ).rejects.toThrow(AuthError);

      try {
        await authService.register(
          "invalid-email",
          testPassword,
          testName,
          metadata
        );
      } catch (error) {
        expect(error).toBeInstanceOf(AuthError);
        expect((error as AuthError).code).toBe(AuthErrorCode.INVALID_EMAIL);
      }
    });

    it("should reject registration with weak password", async () => {
      await expect(
        authService.register(testEmail, "short", testName, metadata)
      ).rejects.toThrow(AuthError);

      try {
        await authService.register(testEmail, "short", testName, metadata);
      } catch (error) {
        expect(error).toBeInstanceOf(AuthError);
        expect((error as AuthError).code).toBe(AuthErrorCode.WEAK_PASSWORD);
      }
    });

    it("should reject registration with existing email", async () => {
      // Register first user
      await authService.register(testEmail, testPassword, testName, metadata);

      // Try to register again with same email
      await expect(
        authService.register(testEmail, testPassword, testName, metadata)
      ).rejects.toThrow(AuthError);

      try {
        await authService.register(testEmail, testPassword, testName, metadata);
      } catch (error) {
        expect(error).toBeInstanceOf(AuthError);
        expect((error as AuthError).code).toBe(
          AuthErrorCode.EMAIL_ALREADY_EXISTS
        );
      }
    });
  });

  describe("login", () => {
    beforeEach(async () => {
      // Register a user for login tests
      await authService.register(testEmail, testPassword, testName, metadata);
    });

    it("should login with valid credentials", async () => {
      const result = await authService.login(testEmail, testPassword, metadata);

      expect(result).toBeDefined();
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.expiresIn).toBe(15 * 60);
      expect(result.user.email).toBe(testEmail);
    });

    it("should reject login with invalid email", async () => {
      await expect(
        authService.login("wrong@example.com", testPassword, metadata)
      ).rejects.toThrow(AuthError);

      try {
        await authService.login("wrong@example.com", testPassword, metadata);
      } catch (error) {
        expect(error).toBeInstanceOf(AuthError);
        expect((error as AuthError).code).toBe(
          AuthErrorCode.INVALID_CREDENTIALS
        );
        expect((error as AuthError).statusCode).toBe(401);
      }
    });

    it("should reject login with invalid password", async () => {
      await expect(
        authService.login(testEmail, "wrongpassword", metadata)
      ).rejects.toThrow(AuthError);

      try {
        await authService.login(testEmail, "wrongpassword", metadata);
      } catch (error) {
        expect(error).toBeInstanceOf(AuthError);
        expect((error as AuthError).code).toBe(
          AuthErrorCode.INVALID_CREDENTIALS
        );
      }
    });
  });

  describe("findUserByEmail", () => {
    it("should find existing user by email", async () => {
      await authService.register(testEmail, testPassword, testName, metadata);

      const user = await authService.findUserByEmail(testEmail);

      expect(user).toBeDefined();
      expect(user?.email).toBe(testEmail);
      expect(user?.name).toBe(testName);
    });

    it("should return null for non-existent email", async () => {
      const user = await authService.findUserByEmail("nonexistent@example.com");

      expect(user).toBeNull();
    });
  });

  describe("OAuth authentication", () => {
    const provider = "google";
    const providerAccountId = "google-user-123";
    const oauthUserInfo = {
      id: providerAccountId,
      email: "oauth@example.com",
      name: "OAuth User",
      emailVerified: true,
    };

    beforeEach(async () => {
      await cleanupTestUser("oauth@example.com");
    });

    it("should get OAuth authorization URL", () => {
      // Mock the OAuth provider
      const mockProvider = {
        getAuthorizationUrl: mock((state: string, redirectUri: string) => {
          return `https://accounts.google.com/o/oauth2/v2/auth?state=${state}`;
        }),
        exchangeCodeForTokens: mock(),
        refreshAccessToken: mock(),
        getUserInfo: mock(),
      };

      oauthService.registerProvider(provider, mockProvider);

      const url = authService.getOAuthUrl(provider, "test-state");

      expect(url).toContain("https://accounts.google.com");
      expect(url).toContain("state=test-state");
      expect(mockProvider.getAuthorizationUrl).toHaveBeenCalled();
    });

    it("should create new user from OAuth callback", async () => {
      // Mock the OAuth provider
      const mockProvider = {
        getAuthorizationUrl: mock(),
        exchangeCodeForTokens: mock(async () => createTestOAuthTokens()),
        refreshAccessToken: mock(),
        getUserInfo: mock(async () => oauthUserInfo),
      };

      oauthService.registerProvider(provider, mockProvider);

      const result = await authService.handleOAuthCallback(
        provider,
        "auth-code",
        metadata
      );

      expect(result).toBeDefined();
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.user.email).toBe(oauthUserInfo.email);
      expect(result.user.name).toBe(oauthUserInfo.name);

      // Verify user was created
      const user = await authService.findUserByEmail(oauthUserInfo.email);
      expect(user).toBeDefined();
      expect(user?.passwordHash).toBeNull(); // OAuth-only user

      // Verify OAuth account was created
      const oauthAccount = await authService.getOAuthAccount(
        user!.id,
        provider
      );
      expect(oauthAccount).toBeDefined();
      expect(oauthAccount?.providerAccountId).toBe(providerAccountId);
      expect(oauthAccount?.refreshToken).toBeDefined();
    });

    it("should link OAuth account to existing user with same email", async () => {
      // Create user with email/password first
      await authService.register(
        oauthUserInfo.email,
        testPassword,
        oauthUserInfo.name,
        metadata
      );

      // Mock the OAuth provider
      const mockProvider = {
        getAuthorizationUrl: mock(),
        exchangeCodeForTokens: mock(async () => createTestOAuthTokens()),
        refreshAccessToken: mock(),
        getUserInfo: mock(async () => oauthUserInfo),
      };

      oauthService.registerProvider(provider, mockProvider);

      const result = await authService.handleOAuthCallback(
        provider,
        "auth-code",
        metadata
      );

      expect(result).toBeDefined();
      expect(result.user.email).toBe(oauthUserInfo.email);

      // Verify OAuth account was linked
      const user = await authService.findUserByEmail(oauthUserInfo.email);
      const oauthAccount = await authService.getOAuthAccount(
        user!.id,
        provider
      );
      expect(oauthAccount).toBeDefined();
      expect(oauthAccount?.providerAccountId).toBe(providerAccountId);
    });

    it("should update existing OAuth account on re-authentication", async () => {
      // Mock the OAuth provider
      const mockProvider = {
        getAuthorizationUrl: mock(),
        exchangeCodeForTokens: mock(async () => createTestOAuthTokens()),
        refreshAccessToken: mock(),
        getUserInfo: mock(async () => oauthUserInfo),
      };

      oauthService.registerProvider(provider, mockProvider);

      // First authentication
      const result1 = await authService.handleOAuthCallback(
        provider,
        "auth-code-1",
        metadata
      );

      const user = await authService.findUserByEmail(oauthUserInfo.email);
      const account1 = await authService.getOAuthAccount(user!.id, provider);

      // Second authentication with new tokens
      const newTokens = {
        ...createTestOAuthTokens(),
        accessToken: "new-access-token",
      };
      mockProvider.exchangeCodeForTokens = mock(async () => newTokens);

      const result2 = await authService.handleOAuthCallback(
        provider,
        "auth-code-2",
        metadata
      );

      const account2 = await authService.getOAuthAccount(user!.id, provider);

      // Verify account was updated, not duplicated
      expect(account1?.id).toBe(account2?.id);
      expect(account2?.accessToken).not.toBe(account1?.accessToken);
    });

    it("should find user by OAuth provider", async () => {
      // Mock the OAuth provider
      const mockProvider = {
        getAuthorizationUrl: mock(),
        exchangeCodeForTokens: mock(async () => createTestOAuthTokens()),
        refreshAccessToken: mock(),
        getUserInfo: mock(async () => oauthUserInfo),
      };

      oauthService.registerProvider(provider, mockProvider);

      // Create user via OAuth
      await authService.handleOAuthCallback(provider, "auth-code", metadata);

      // Find user by OAuth provider
      const user = await authService.findUserByOAuthProvider(
        provider,
        providerAccountId
      );

      expect(user).toBeDefined();
      expect(user?.email).toBe(oauthUserInfo.email);
    });

    it("should encrypt OAuth tokens before storage", async () => {
      // Mock the OAuth provider
      const mockProvider = {
        getAuthorizationUrl: mock(),
        exchangeCodeForTokens: mock(async () => createTestOAuthTokens()),
        refreshAccessToken: mock(),
        getUserInfo: mock(async () => oauthUserInfo),
      };

      oauthService.registerProvider(provider, mockProvider);

      await authService.handleOAuthCallback(provider, "auth-code", metadata);

      const user = await authService.findUserByEmail(oauthUserInfo.email);
      const account = await authService.getOAuthAccount(user!.id, provider);

      // Verify tokens are encrypted (not plain text)
      expect(account?.refreshToken).toBeDefined();
      expect(account?.refreshToken).not.toBe("test-refresh-token");
      expect(account?.accessToken).not.toBe("test-access-token");

      // Verify we can decrypt the refresh token
      const decryptedToken = await authService.getDecryptedOAuthRefreshToken(
        user!.id,
        provider
      );
      expect(decryptedToken).toBe("test-refresh-token");
    });
  });
});
