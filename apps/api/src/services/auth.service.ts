import { and, db, eq, oauthAccounts, users } from "@wingmnn/db";
import { encryptionService } from "./encryption.service";
import type { OAuthProvider, OAuthTokens } from "./oauth.service";
import { oauthService } from "./oauth.service";
import type { RequestMetadata } from "./session.service";
import { sessionService } from "./session.service";
import { tokenService } from "./token.service";

/**
 * Authentication result returned after successful authentication
 */
export interface AuthResult {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: UserProfile;
}

/**
 * User profile information
 */
export interface UserProfile {
  id: string;
  email: string | null;
  name: string;
  bio: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * OAuth account information
 */
export interface OAuthAccount {
  id: string;
  userId: string;
  provider: string;
  providerAccountId: string;
  refreshToken: string | null;
  accessToken: string | null;
  expiresAt: Date | null;
  tokenType: string | null;
  scope: string | null;
  idToken: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Authentication error codes
 */
export enum AuthErrorCode {
  // Authentication Errors
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
  USER_NOT_FOUND = "USER_NOT_FOUND",
  EMAIL_ALREADY_EXISTS = "EMAIL_ALREADY_EXISTS",

  // Validation Errors
  INVALID_EMAIL = "INVALID_EMAIL",
  WEAK_PASSWORD = "WEAK_PASSWORD",

  // OAuth Errors
  OAUTH_ERROR = "OAUTH_ERROR",
  OAUTH_STATE_MISMATCH = "OAUTH_STATE_MISMATCH",
  OAUTH_TOKEN_INVALID = "OAUTH_TOKEN_INVALID",

  // Server Errors
  INTERNAL_ERROR = "INTERNAL_ERROR",
}

/**
 * Authentication error class
 */
export class AuthError extends Error {
  constructor(
    public code: AuthErrorCode,
    message: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = "AuthError";
  }
}

/**
 * Authentication Service
 * Handles user registration, login, and OAuth authentication
 */
export class AuthService {
  private readonly MIN_PASSWORD_LENGTH = 8;

  /**
   * Validate email format
   */
  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate password strength
   */
  private validatePassword(password: string): void {
    if (password.length < this.MIN_PASSWORD_LENGTH) {
      throw new AuthError(
        AuthErrorCode.WEAK_PASSWORD,
        `Password must be at least ${this.MIN_PASSWORD_LENGTH} characters`,
        400
      );
    }
  }

  /**
   * Convert database user to UserProfile
   */
  private toUserProfile(user: typeof users.$inferSelect): UserProfile {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      bio: user.bio,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /**
   * Create authentication result with tokens
   */
  private async createAuthResult(
    user: typeof users.$inferSelect,
    metadata: RequestMetadata
  ): Promise<AuthResult> {
    // Generate refresh token
    const refreshToken = tokenService.generateRefreshToken();
    const refreshTokenHash = tokenService.hashToken(refreshToken);

    // Create session
    const session = await sessionService.createSession(
      user.id,
      refreshTokenHash,
      metadata
    );

    // Generate access token
    const accessToken = await tokenService.generateAccessToken(
      user.id,
      session.id
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: 15 * 60, // 15 minutes in seconds
      user: this.toUserProfile(user),
    };
  }

  /**
   * Register a new user with email and password
   * @param email - User email address
   * @param password - User password (plain text)
   * @param name - User display name
   * @param metadata - Request metadata
   * @returns Authentication result with tokens
   * @throws AuthError if email is invalid, password is weak, or email already exists
   */
  async register(
    email: string,
    password: string,
    name: string,
    metadata: RequestMetadata
  ): Promise<AuthResult> {
    // Validate email format
    if (!this.validateEmail(email)) {
      throw new AuthError(
        AuthErrorCode.INVALID_EMAIL,
        "Invalid email format",
        400
      );
    }

    // Validate password strength
    this.validatePassword(password);

    // Check if email already exists
    const existingUser = await this.findUserByEmail(email);
    if (existingUser) {
      throw new AuthError(
        AuthErrorCode.EMAIL_ALREADY_EXISTS,
        "Email already registered",
        400
      );
    }

    // Hash password
    const passwordHash = await encryptionService.hashPassword(password);

    // Create user
    const result = await db
      .insert(users)
      .values({
        id: crypto.randomUUID(),
        email,
        passwordHash,
        name,
        bio: "", // Default empty bio
      })
      .returning();

    const user = result[0];

    // Create session and tokens
    return this.createAuthResult(user, metadata);
  }

  /**
   * Login with email and password
   * @param email - User email address
   * @param password - User password (plain text)
   * @param metadata - Request metadata
   * @returns Authentication result with tokens
   * @throws AuthError if credentials are invalid
   */
  async login(
    email: string,
    password: string,
    metadata: RequestMetadata
  ): Promise<AuthResult> {
    // Find user by email
    const user = await this.findUserByEmail(email);

    if (!user || !user.passwordHash) {
      // Use generic error message to prevent user enumeration
      throw new AuthError(
        AuthErrorCode.INVALID_CREDENTIALS,
        "Invalid email or password",
        401
      );
    }

    // Verify password
    const isValidPassword = await encryptionService.verifyPassword(
      password,
      user.passwordHash
    );

    if (!isValidPassword) {
      throw new AuthError(
        AuthErrorCode.INVALID_CREDENTIALS,
        "Invalid email or password",
        401
      );
    }

    // Create session and tokens
    return this.createAuthResult(user, metadata);
  }

  /**
   * Find user by email
   * @param email - User email address
   * @returns User or null if not found
   */
  async findUserByEmail(
    email: string
  ): Promise<typeof users.$inferSelect | null> {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Find user by OAuth provider and provider account ID
   * @param provider - OAuth provider name
   * @param providerAccountId - User ID from the OAuth provider
   * @returns User or null if not found
   */
  async findUserByOAuthProvider(
    provider: OAuthProvider,
    providerAccountId: string
  ): Promise<typeof users.$inferSelect | null> {
    const result = await db
      .select({
        user: users,
      })
      .from(oauthAccounts)
      .innerJoin(users, eq(oauthAccounts.userId, users.id))
      .where(
        and(
          eq(oauthAccounts.provider, provider),
          eq(oauthAccounts.providerAccountId, providerAccountId)
        )
      )
      .limit(1);

    return result[0]?.user || null;
  }

  /**
   * Get OAuth authorization URL
   * @param provider - OAuth provider name
   * @param state - CSRF protection state parameter
   * @returns Authorization URL to redirect user to
   * @throws AuthError if provider is not supported
   */
  getOAuthUrl(provider: OAuthProvider, state: string): string {
    try {
      const providerImpl = oauthService.getProvider(provider);
      // Get redirect URI from config based on provider
      const redirectUri = this.getRedirectUri(provider);
      return providerImpl.getAuthorizationUrl(state, redirectUri);
    } catch (error) {
      throw new AuthError(
        AuthErrorCode.OAUTH_ERROR,
        `OAuth provider '${provider}' is not supported`,
        400
      );
    }
  }

  /**
   * Get redirect URI for OAuth provider
   */
  private getRedirectUri(provider: OAuthProvider): string {
    // In a real application, this would come from config
    // For now, we'll construct it based on the provider
    const baseUrl = process.env.GOOGLE_REDIRECT_URI?.replace(
      "/auth/google/callback",
      ""
    );
    return `${baseUrl}/auth/${provider}/callback`;
  }

  /**
   * Handle OAuth callback and authenticate user
   * @param provider - OAuth provider name
   * @param code - Authorization code from provider
   * @param metadata - Request metadata
   * @returns Authentication result with tokens
   * @throws AuthError if OAuth flow fails
   */
  async handleOAuthCallback(
    provider: OAuthProvider,
    code: string,
    metadata: RequestMetadata
  ): Promise<AuthResult> {
    try {
      const providerImpl = oauthService.getProvider(provider);
      const redirectUri = this.getRedirectUri(provider);

      // Exchange code for tokens
      const tokens = await providerImpl.exchangeCodeForTokens(
        code,
        redirectUri
      );

      // Get user info from provider
      const userInfo = await providerImpl.getUserInfo(tokens.accessToken);

      // Find or create user
      let user = await this.findUserByOAuthProvider(provider, userInfo.id);

      if (!user) {
        // Check if user exists with this email
        user = await this.findUserByEmail(userInfo.email);

        if (user) {
          // Link OAuth account to existing user
          await this.linkOAuthAccount(user.id, provider, userInfo.id, tokens);
        } else {
          // Create new user
          user = await this.createUserFromOAuth(userInfo);
          // Create OAuth account
          await this.linkOAuthAccount(user.id, provider, userInfo.id, tokens);
        }
      } else {
        // Update existing OAuth account with new tokens
        await this.updateOAuthAccount(user.id, provider, userInfo.id, tokens);
      }

      // Create session and tokens
      return this.createAuthResult(user, metadata);
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }

      throw new AuthError(
        AuthErrorCode.OAUTH_ERROR,
        `OAuth authentication failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        500
      );
    }
  }

  /**
   * Create a new user from OAuth user info
   */
  private async createUserFromOAuth(userInfo: {
    email: string;
    name: string;
  }): Promise<typeof users.$inferSelect> {
    const result = await db
      .insert(users)
      .values({
        id: crypto.randomUUID(),
        email: userInfo.email,
        name: userInfo.name,
        bio: "", // Default empty bio
        passwordHash: null, // OAuth-only user, no password
      })
      .returning();

    return result[0];
  }

  /**
   * Link OAuth account to user
   */
  private async linkOAuthAccount(
    userId: string,
    provider: OAuthProvider,
    providerAccountId: string,
    tokens: OAuthTokens
  ): Promise<void> {
    // Encrypt tokens before storage
    const encryptedRefreshToken = tokens.refreshToken
      ? encryptionService.encryptRefreshToken(tokens.refreshToken)
      : null;

    const encryptedAccessToken = encryptionService.encryptRefreshToken(
      tokens.accessToken
    );

    const encryptedIdToken = tokens.idToken
      ? encryptionService.encryptRefreshToken(tokens.idToken)
      : null;

    // Calculate expiration time
    const expiresAt = tokens.expiresIn
      ? new Date(Date.now() + tokens.expiresIn * 1000)
      : null;

    await db.insert(oauthAccounts).values({
      id: crypto.randomUUID(),
      userId,
      provider,
      providerAccountId,
      refreshToken: encryptedRefreshToken,
      accessToken: encryptedAccessToken,
      idToken: encryptedIdToken,
      expiresAt,
      tokenType: tokens.tokenType,
      scope: tokens.scope || null,
    });
  }

  /**
   * Update existing OAuth account with new tokens
   */
  private async updateOAuthAccount(
    userId: string,
    provider: OAuthProvider,
    providerAccountId: string,
    tokens: OAuthTokens
  ): Promise<void> {
    // Encrypt tokens before storage
    const encryptedAccessToken = encryptionService.encryptRefreshToken(
      tokens.accessToken
    );

    const encryptedIdToken = tokens.idToken
      ? encryptionService.encryptRefreshToken(tokens.idToken)
      : null;

    // Calculate expiration time
    const expiresAt = tokens.expiresIn
      ? new Date(Date.now() + tokens.expiresIn * 1000)
      : null;

    // Prepare update values
    const updateValues: any = {
      accessToken: encryptedAccessToken,
      idToken: encryptedIdToken,
      expiresAt,
      tokenType: tokens.tokenType,
      scope: tokens.scope || null,
      updatedAt: new Date(),
    };

    // Only update refresh token if a new one is provided
    if (tokens.refreshToken) {
      updateValues.refreshToken = encryptionService.encryptRefreshToken(
        tokens.refreshToken
      );
    }

    await db
      .update(oauthAccounts)
      .set(updateValues)
      .where(
        and(
          eq(oauthAccounts.userId, userId),
          eq(oauthAccounts.provider, provider),
          eq(oauthAccounts.providerAccountId, providerAccountId)
        )
      );
  }

  /**
   * Get OAuth account for a user and provider
   * @param userId - User ID
   * @param provider - OAuth provider name
   * @returns OAuth account or null if not found
   */
  async getOAuthAccount(
    userId: string,
    provider: OAuthProvider
  ): Promise<OAuthAccount | null> {
    const result = await db
      .select()
      .from(oauthAccounts)
      .where(
        and(
          eq(oauthAccounts.userId, userId),
          eq(oauthAccounts.provider, provider)
        )
      )
      .limit(1);

    return result[0] || null;
  }

  /**
   * Get decrypted OAuth refresh token for a user and provider
   * @param userId - User ID
   * @param provider - OAuth provider name
   * @returns Decrypted refresh token or null if not found
   */
  async getDecryptedOAuthRefreshToken(
    userId: string,
    provider: OAuthProvider
  ): Promise<string | null> {
    const account = await this.getOAuthAccount(userId, provider);

    if (!account || !account.refreshToken) {
      return null;
    }

    try {
      return encryptionService.decryptRefreshToken(account.refreshToken);
    } catch (error) {
      // If decryption fails, return null
      return null;
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
