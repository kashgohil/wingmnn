import { db, eq, tokensTable } from "@wingmnn/db";
import { CONSTANTS } from "./constants";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";

export const GMAIL_SCOPES = [
  // Gmail access
  // ref: https://gmail.googleapis.com/$discovery/rest?version=v1
  "https://mail.google.com/",
  "https://www.googleapis.com/auth/gmail.compose",
  "https://www.googleapis.com/auth/gmail.insert",
  "https://www.googleapis.com/auth/gmail.labels",
  "https://www.googleapis.com/auth/gmail.metadata",
  "https://www.googleapis.com/auth/gmail.modify",
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/gmail.settings.basic",
  "https://www.googleapis.com/auth/gmail.settings.sharing",
].join(" ");

export const CALENDAR_SCOPES = [
  // Calendar access
  "https://www.googleapis.com/auth/calendar",
].join(" ");

export const DRIVE_SCOPES = [
  // Drive access
  // ref: https://www.googleapis.com/discovery/v1/apis/drive/v3/rest
  "https://www.googleapis.com/auth/drive",
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/drive.metadata",
  "https://www.googleapis.com/auth/drive.photos.readonly",
].join(" ");

// Scopes needed for Google OAuth
export const PROFILE_SCOPES = [
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",

  "openid", // OpenID Connect
  "profile", // Basic profile
  "email",
].join(" ");

/**
 * Generates the Google OAuth authorization URL
 * @param state Optional state parameter for security
 * @returns URL to redirect the user to for Google authentication
 */
export function getGoogleAuthUrl(urlParams: {
  state?: string;
  scope?: string;
}): string {
  const params = new URLSearchParams({
    client_id: CONSTANTS.GOOGLE_CLIENT_ID,
    redirect_uri: CONSTANTS.GOOGLE_REDIRECT_URI,
    response_type: "code",
    scope: urlParams.scope || PROFILE_SCOPES,
    access_type: "offline",
    prompt: "consent", // Force to get refresh token
  });

  if (urlParams.state) {
    params.append("state", urlParams.state);
  }

  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

/**
 * Exchanges an authorization code for access and refresh tokens
 * @param code Authorization code from Google redirect
 * @returns Object containing access and refresh tokens
 */
export async function getGoogleTokens(code: string): Promise<{
  access_token: string;
  refresh_token?: string;
  id_token: string;
  expires_in: number;
}> {
  const params = new URLSearchParams({
    code,
    grant_type: "authorization_code",
    client_id: CONSTANTS.GOOGLE_CLIENT_ID,
    redirect_uri: CONSTANTS.GOOGLE_REDIRECT_URI,
    client_secret: CONSTANTS.GOOGLE_CLIENT_SECRET,
  });

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to get Google tokens: ${JSON.stringify(error)}`);
  }

  return (await response.json()) as any;
}

/**
 * Refreshes an access token using a refresh token
 * @param refreshToken The refresh token
 * @returns New access token and expiration
 */
export async function refreshGoogleToken(refreshToken: string): Promise<{
  access_token: string;
  expires_in: number;
}> {
  const params = new URLSearchParams({
    client_id: CONSTANTS.GOOGLE_CLIENT_ID,
    client_secret: CONSTANTS.GOOGLE_CLIENT_SECRET,
    refresh_token: refreshToken,
    grant_type: "refresh_token",
  });

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to refresh Google token: ${JSON.stringify(error)}`);
  }

  return (await response.json()) as any;
}

/**
 * Gets user info from Google using an access token
 * @param accessToken The access token
 * @returns User profile information
 */
export async function getGoogleUserInfo(accessToken: string): Promise<{
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
}> {
  const response = await fetch(GOOGLE_USERINFO_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to get Google user info: ${JSON.stringify(error)}`);
  }

  return (await response.json()) as any;
}

/**
 * Store Google OAuth tokens in the database
 *
 * @param userId The ID of the user
 * @param tokens The Google OAuth tokens
 * @returns The stored token record
 */
export async function storeGoogleTokens(
  userId: string,
  tokens: {
    access_token: string;
    refresh_token?: string;
    id_token: string;
    expires_in: number;
    scope?: string;
  },
) {
  try {
    console.log(`[AUTH] Storing Google tokens for user: ${userId}`);

    // Calculate expiry date
    const expiryDate = new Date(Date.now() + tokens.expires_in * 1000);

    // Store the tokens
    const [tokenRecord] = await db
      .insert(tokensTable)
      .values({
        userId,
        type: "google",
        value: tokens.id_token, // Using ID token as the unique identifier
        expiresAt: expiryDate,
        googleAccessToken: tokens.access_token,
        googleRefreshToken: tokens.refresh_token,
        googleTokenExpiry: expiryDate,
        googleTokenScopes: tokens.scope,
        lastUsed: new Date(),
      })
      .returning();

    console.log(`[AUTH] Successfully stored Google tokens for user: ${userId}`);

    return tokenRecord;
  } catch (error) {
    console.error(`[AUTH] Error storing Google tokens:`, error);
    throw error;
  }
}

/**
 * Gets a valid Google access token for a user
 * If the current token is expired, it will automatically refresh it
 *
 * @param userId The ID of the user
 * @returns A valid Google access token or null if not available
 */
export async function getValidGoogleAccessToken(
  userId: string,
): Promise<string | null> {
  try {
    console.log(`[AUTH] Getting valid access token for user: ${userId}`);

    // Find the most recent Google token for this user
    const googleToken = await db.query.tokensTable.findFirst({
      where: (tokens) =>
        eq(tokens.userId, userId) &&
        eq(tokens.type, "google") &&
        eq(tokens.isRevoked, false),
      orderBy: (tokens, { desc }) => [desc(tokens.createdAt)],
    });

    if (!googleToken || !googleToken.googleAccessToken) {
      console.log(`[AUTH] No Google token found for user: ${userId}`);
      return null;
    }

    // Check if the token is expired
    const now = new Date();
    if (googleToken.googleTokenExpiry && googleToken.googleTokenExpiry > now) {
      console.log(
        `[AUTH] Using existing Google access token (expires: ${googleToken.googleTokenExpiry})`,
      );
      return googleToken.googleAccessToken;
    }

    // Token is expired, refresh it if we have a refresh token
    if (!googleToken.googleRefreshToken) {
      console.log(
        `[AUTH] Access token expired and no refresh token available for user: ${userId}`,
      );
      return null;
    }

    console.log(
      `[AUTH] Refreshing expired Google access token for user: ${userId}`,
    );

    // Refresh the token
    const refreshedTokens = await refreshGoogleToken(
      googleToken.googleRefreshToken,
    );

    if (!refreshedTokens) {
      console.log(
        `[AUTH] Failed to refresh Google access token for user: ${userId}`,
      );
      return null;
    }

    // Update the token in the database
    const newExpiryDate = new Date(
      Date.now() + refreshedTokens.expires_in * 1000,
    );

    await db
      .update(tokensTable)
      .set({
        googleAccessToken: refreshedTokens.access_token,
        googleTokenExpiry: newExpiryDate,
        lastUsed: new Date(),
      })
      .where(eq(tokensTable.id, googleToken.id));

    console.log(
      `[AUTH] Successfully refreshed Google access token (expires: ${newExpiryDate})`,
    );

    return refreshedTokens.access_token;
  } catch (error) {
    console.error(`[AUTH] Error getting valid access token:`, error);
    return null;
  }
}
