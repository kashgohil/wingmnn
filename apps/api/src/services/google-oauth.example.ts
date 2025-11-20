/**
 * Google OAuth Provider Usage Example
 * This file demonstrates how to use the Google OAuth provider with the OAuth service
 */

import { config } from "../config";
import { GoogleOAuthProvider } from "./google-oauth.provider";
import { oauthService } from "./oauth.service";

/**
 * Example: Initialize Google OAuth provider
 */
export function initializeGoogleOAuth() {
  const googleProvider = new GoogleOAuthProvider(
    config.GOOGLE_CLIENT_ID,
    config.GOOGLE_CLIENT_SECRET
  );

  oauthService.registerProvider("google", googleProvider);
}

/**
 * Example: Generate Google OAuth authorization URL
 */
export function getGoogleAuthUrl(state: string): string {
  const provider = oauthService.getProvider("google");
  return provider.getAuthorizationUrl(state, config.GOOGLE_REDIRECT_URI);
}

/**
 * Example: Handle Google OAuth callback
 */
export async function handleGoogleCallback(code: string) {
  const provider = oauthService.getProvider("google");

  // Exchange code for tokens
  const tokens = await provider.exchangeCodeForTokens(
    code,
    config.GOOGLE_REDIRECT_URI
  );

  // Verify ID token if present
  let userInfo;
  if (tokens.idToken && provider.verifyIdToken) {
    userInfo = await provider.verifyIdToken(tokens.idToken);
  } else {
    // Fallback to getUserInfo if no ID token
    userInfo = await provider.getUserInfo(tokens.accessToken);
  }

  return {
    tokens,
    userInfo,
  };
}

/**
 * Example: Refresh Google access token
 */
export async function refreshGoogleAccessToken(refreshToken: string) {
  const provider = oauthService.getProvider("google");
  return await provider.refreshAccessToken(refreshToken);
}
