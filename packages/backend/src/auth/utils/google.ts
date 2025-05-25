import { CONSTANTS } from "@auth/constants";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";

// Scopes needed for Google OAuth
const SCOPES = [
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
  // Calendar access
  "https://www.googleapis.com/auth/calendar",

  // Drive access
  // ref: https://www.googleapis.com/discovery/v1/apis/drive/v3/rest
  "https://www.googleapis.com/auth/drive",
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/drive.metadata",
  "https://www.googleapis.com/auth/drive.photos.readonly",

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

  "openid", // OpenID Connect
  "profile", // Basic profile
  "email",
].join(" ");

/**
 * Generates the Google OAuth authorization URL
 * @param state Optional state parameter for security
 * @returns URL to redirect the user to for Google authentication
 */
export function getGoogleAuthUrl(state?: string): string {
  const params = new URLSearchParams({
    client_id: CONSTANTS.GOOGLE_CLIENT_ID,
    redirect_uri: CONSTANTS.GOOGLE_REDIRECT_URI,
    response_type: "code",
    scope: SCOPES,
    access_type: "offline",
    prompt: "consent", // Force to get refresh token
  });

  if (state) {
    params.append("state", state);
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

  return await response.json();
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

  return await response.json();
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

  return await response.json();
}
