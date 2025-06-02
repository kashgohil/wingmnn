import { db, tokensTable } from "@wingmnn/db";
import { eq } from "drizzle-orm";
import { tokensQuery } from "src/tokens/utils";
import { CONSTANTS } from "./constants";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";

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
    const googleToken = await tokensQuery.findFirst({
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
    const refreshedTokens = await refreshGoogleAccessToken(
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

/**
 * Refreshes a Google access token using a refresh token
 *
 * @param refreshToken The Google refresh token
 * @returns The new access token and expiration information or null if failed
 */
export async function refreshGoogleAccessToken(refreshToken: string): Promise<{
  access_token: string;
  expires_in: number;
  scope?: string;
  token_type?: string;
} | null> {
  try {
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
      console.error(`[AUTH] Failed to refresh Google token:`, error);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error(`[AUTH] Error refreshing Google access token:`, error);
    return null;
  }
}

/**
 * Makes an authenticated Google API request
 *
 * @param userId The ID of the user making the request
 * @param url The Google API URL
 * @param options Fetch options (excluding Authorization header)
 * @returns The response data or null if the request failed
 */
export async function makeGoogleApiRequest<T>(
  userId: string,
  url: string,
  options: RequestInit = {},
): Promise<T | null> {
  try {
    const accessToken = await getValidGoogleAccessToken(userId);

    if (!accessToken) {
      console.error(
        `[AUTH] No valid access token available for user: ${userId}`,
      );
      return null;
    }

    const requestOptions: RequestInit = {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${accessToken}`,
      },
    };

    console.log(`[AUTH] Making request to: ${url}`);

    const response = await fetch(url, requestOptions);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[AUTH] Request failed (${response.status}):`, errorText);
      return null;
    }

    return (await response.json()) as T;
  } catch (error) {
    console.error(`[AUTH] Error making Google API request:`, error);
    return null;
  }
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
 * API wrappers for Google services
 */

// Gmail API
export const GmailApi = {
  /**
   * Gets a list of messages from the user's Gmail inbox
   *
   * @param userId The ID of the user
   * @param maxResults Maximum number of messages to return
   * @returns List of Gmail messages or null if failed
   */
  async listMessages(userId: string, maxResults = 10) {
    return makeGoogleApiRequest(
      userId,
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}`,
    );
  },

  /**
   * Gets details of a specific Gmail message
   *
   * @param userId The ID of the user
   * @param messageId The ID of the Gmail message
   * @returns Message details or null if failed
   */
  async getMessage(userId: string, messageId: string) {
    return makeGoogleApiRequest(
      userId,
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}`,
    );
  },
};

// Calendar API
export const CalendarApi = {
  /**
   * Gets a list of events from the user's Google Calendar
   *
   * @param userId The ID of the user
   * @param timeMin Minimum start time (ISO string)
   * @param timeMax Maximum start time (ISO string)
   * @param maxResults Maximum number of events to return
   * @returns List of calendar events or null if failed
   */
  async listEvents(
    userId: string,
    timeMin = new Date().toISOString(),
    timeMax?: string,
    maxResults = 10,
  ) {
    let url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(timeMin)}&maxResults=${maxResults}`;

    if (timeMax) {
      url += `&timeMax=${encodeURIComponent(timeMax)}`;
    }

    return makeGoogleApiRequest(userId, url);
  },
};

// Drive API
export const DriveApi = {
  /**
   * Gets a list of files from the user's Google Drive
   *
   * @param userId The ID of the user
   * @param maxResults Maximum number of files to return
   * @returns List of Drive files or null if failed
   */
  async listFiles(userId: string, maxResults = 10) {
    return makeGoogleApiRequest(
      userId,
      `https://www.googleapis.com/drive/v3/files?pageSize=${maxResults}`,
    );
  },

  /**
   * Gets details of a specific Google Drive file
   *
   * @param userId The ID of the user
   * @param fileId The ID of the Drive file
   * @returns File details or null if failed
   */
  async getFile(userId: string, fileId: string) {
    return makeGoogleApiRequest(
      userId,
      `https://www.googleapis.com/drive/v3/files/${fileId}`,
    );
  },
};
