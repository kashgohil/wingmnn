/**
 * Google OAuth Provider Implementation
 * Implements OAuth 2.0 flow for Google authentication with offline access support
 */

import { OAuth2Client } from "google-auth-library";
import type {
  OAuthAccessToken,
  OAuthProviderImplementation,
  OAuthTokenPayload,
  OAuthTokens,
  OAuthUserInfo,
} from "./oauth.service";

/**
 * Google OAuth Provider
 * Handles Google-specific OAuth 2.0 authentication flow
 */
export class GoogleOAuthProvider implements OAuthProviderImplementation {
  private client: OAuth2Client;

  constructor(private clientId: string, private clientSecret: string) {
    this.client = new OAuth2Client(clientId, clientSecret);
  }

  /**
   * Generate Google OAuth authorization URL with offline access scope
   * Requirements: 2.1, 8.1
   */
  getAuthorizationUrl(state: string, redirectUri: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid email profile",
      access_type: "offline", // Request refresh token (Requirement 8.1)
      prompt: "consent", // Force consent to ensure refresh token is provided
      state,
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  }

  /**
   * Exchange authorization code for tokens
   * Requirements: 2.2, 8.2
   */
  async exchangeCodeForTokens(
    code: string,
    redirectUri: string
  ): Promise<OAuthTokens> {
    try {
      const { tokens } = await this.client.getToken({
        code,
        redirect_uri: redirectUri,
      });

      if (!tokens.access_token) {
        throw new Error("No access token received from Google");
      }

      return {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token ?? undefined,
        idToken: tokens.id_token ?? undefined,
        expiresIn: tokens.expiry_date
          ? Math.floor((tokens.expiry_date - Date.now()) / 1000)
          : 3600, // Default to 1 hour if not provided
        tokenType: tokens.token_type ?? "Bearer",
        scope: tokens.scope,
      };
    } catch (error) {
      throw new Error(
        `Failed to exchange code for tokens: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Refresh access token using stored refresh token
   * Requirements: 8.4, 8.5
   */
  async refreshAccessToken(refreshToken: string): Promise<OAuthAccessToken> {
    try {
      this.client.setCredentials({
        refresh_token: refreshToken,
      });

      const { credentials } = await this.client.refreshAccessToken();

      if (!credentials.access_token) {
        throw new Error("No access token received from refresh");
      }

      return {
        accessToken: credentials.access_token,
        expiresIn: credentials.expiry_date
          ? Math.floor((credentials.expiry_date - Date.now()) / 1000)
          : 3600,
        tokenType: credentials.token_type ?? "Bearer",
      };
    } catch (error) {
      // Handle invalid refresh token errors gracefully (Requirement 8.5)
      throw new Error(
        `Failed to refresh access token: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Retrieve user information from Google
   * Requirements: 2.3, 2.4
   */
  async getUserInfo(accessToken: string): Promise<OAuthUserInfo> {
    try {
      const response = await fetch(
        "https://www.googleapis.com/oauth2/v2/userinfo",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch user info: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        id: data.id,
        email: data.email,
        name: data.name,
        picture: data.picture,
        emailVerified: data.verified_email ?? false,
      };
    } catch (error) {
      throw new Error(
        `Failed to get user info: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Verify and decode Google ID token
   * Requirements: 2.3, 2.4
   */
  async verifyIdToken(idToken: string): Promise<OAuthTokenPayload> {
    try {
      const ticket = await this.client.verifyIdToken({
        idToken,
        audience: this.clientId,
      });

      const payload = ticket.getPayload();

      if (!payload) {
        throw new Error("No payload in ID token");
      }

      if (!payload.sub || !payload.email || !payload.name) {
        throw new Error("Missing required fields in ID token payload");
      }

      return {
        sub: payload.sub,
        email: payload.email,
        emailVerified: payload.email_verified ?? false,
        name: payload.name,
        picture: payload.picture,
      };
    } catch (error) {
      throw new Error(
        `Failed to verify ID token: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}
