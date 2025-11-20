/**
 * OAuth Service Foundation
 * Provides a provider-agnostic OAuth implementation with a registry/factory pattern
 */

/**
 * OAuth provider types supported by the system
 */
export type OAuthProvider = "google" | "github" | "microsoft" | "facebook";

/**
 * OAuth tokens returned from provider token exchange
 */
export interface OAuthTokens {
  accessToken: string;
  refreshToken?: string; // Only provided on first auth or with offline access
  idToken?: string; // Optional, provider-specific
  expiresIn: number;
  tokenType: string;
  scope?: string;
}

/**
 * OAuth access token returned from token refresh
 */
export interface OAuthAccessToken {
  accessToken: string;
  expiresIn: number;
  tokenType: string;
}

/**
 * User information retrieved from OAuth provider
 */
export interface OAuthUserInfo {
  id: string; // Provider's user ID
  email: string;
  name: string;
  picture?: string;
  emailVerified: boolean;
}

/**
 * Decoded ID token payload (for providers that use ID tokens like Google)
 */
export interface OAuthTokenPayload {
  sub: string; // Subject (user ID)
  email: string;
  emailVerified: boolean;
  name: string;
  picture?: string;
}

/**
 * Provider-specific OAuth implementation interface
 * Each OAuth provider (Google, GitHub, etc.) must implement this interface
 */
export interface OAuthProviderImplementation {
  /**
   * Generate the authorization URL to redirect users to the provider's login page
   * @param state - CSRF protection state parameter
   * @param redirectUri - URI to redirect back to after authorization
   * @returns Authorization URL
   */
  getAuthorizationUrl(state: string, redirectUri: string): string;

  /**
   * Exchange an authorization code for access and refresh tokens
   * @param code - Authorization code from provider callback
   * @param redirectUri - Same redirect URI used in authorization request
   * @returns OAuth tokens from the provider
   */
  exchangeCodeForTokens(
    code: string,
    redirectUri: string
  ): Promise<OAuthTokens>;

  /**
   * Refresh an access token using a refresh token
   * @param refreshToken - Valid refresh token from provider
   * @returns New access token
   */
  refreshAccessToken(refreshToken: string): Promise<OAuthAccessToken>;

  /**
   * Retrieve user information from the provider
   * @param accessToken - Valid access token
   * @returns User profile information
   */
  getUserInfo(accessToken: string): Promise<OAuthUserInfo>;

  /**
   * Verify and decode an ID token (optional, not all providers use ID tokens)
   * @param idToken - ID token to verify
   * @returns Decoded token payload
   */
  verifyIdToken?(idToken: string): Promise<OAuthTokenPayload>;
}

/**
 * OAuth Service
 * Manages OAuth provider implementations using a registry/factory pattern
 */
export class OAuthService {
  private providers: Map<OAuthProvider, OAuthProviderImplementation>;

  constructor() {
    this.providers = new Map();
  }

  /**
   * Register an OAuth provider implementation
   * @param provider - Provider identifier
   * @param implementation - Provider implementation instance
   */
  registerProvider(
    provider: OAuthProvider,
    implementation: OAuthProviderImplementation
  ): void {
    this.providers.set(provider, implementation);
  }

  /**
   * Get a registered OAuth provider implementation
   * @param provider - Provider identifier
   * @returns Provider implementation
   * @throws Error if provider is not registered
   */
  getProvider(provider: OAuthProvider): OAuthProviderImplementation {
    const implementation = this.providers.get(provider);

    if (!implementation) {
      throw new Error(
        `OAuth provider '${provider}' is not registered. Available providers: ${Array.from(
          this.providers.keys()
        ).join(", ")}`
      );
    }

    return implementation;
  }

  /**
   * Check if a provider is registered
   * @param provider - Provider identifier
   * @returns True if provider is registered
   */
  hasProvider(provider: OAuthProvider): boolean {
    return this.providers.has(provider);
  }

  /**
   * Get list of all registered provider names
   * @returns Array of registered provider identifiers
   */
  getRegisteredProviders(): OAuthProvider[] {
    return Array.from(this.providers.keys());
  }

  /**
   * Unregister a provider (useful for testing)
   * @param provider - Provider identifier
   * @returns True if provider was removed, false if it wasn't registered
   */
  unregisterProvider(provider: OAuthProvider): boolean {
    return this.providers.delete(provider);
  }

  /**
   * Clear all registered providers (useful for testing)
   */
  clearProviders(): void {
    this.providers.clear();
  }
}

// Export a singleton instance
export const oauthService = new OAuthService();

/**
 * Initialize OAuth service with configured providers
 * This should be called during application startup
 */
export function initializeOAuthProviders(config: {
  google?: {
    clientId: string;
    clientSecret: string;
  };
  // Future providers can be added here
  // github?: { clientId: string; clientSecret: string };
  // microsoft?: { clientId: string; clientSecret: string };
}): void {
  // Import providers dynamically to avoid circular dependencies
  if (config.google) {
    import("./google-oauth.provider").then(({ GoogleOAuthProvider }) => {
      const googleProvider = new GoogleOAuthProvider(
        config.google!.clientId,
        config.google!.clientSecret
      );
      oauthService.registerProvider("google", googleProvider);
    });
  }

  // Future providers can be initialized here
}
