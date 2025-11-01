import { CONSTANTS, ROUTES } from "@auth/constants";
import { auth } from "@auth/router";
import { clearAuthCookies } from "@auth/utils/auth";
import { generateTokens } from "@auth/utils/jwt";
import { userQuery } from "@users/utils";
import { eq, or, usersTable } from "@wingmnn/db";
import {
  getGoogleAuthUrl,
  getGoogleTokens,
  getGoogleUserInfo,
  PROFILE_SCOPES,
  storeGoogleTokens,
} from "@wingmnn/google";
import { tryCatchAsync } from "@wingmnn/utils";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";

// Google OAuth login route
auth.post("/sso/google", async (c) => {
  // Generate state parameter for security (prevent CSRF)
  const state = crypto.randomUUID();

  // Set state in cookie to verify on callback
  setCookie(c, "google_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 10, // 10 minutes
    path: "/",
  });

  // Redirect to Google OAuth page
  const authUrl = getGoogleAuthUrl({ state, scope: PROFILE_SCOPES });
  return c.redirect(authUrl);
});

// Google OAuth callback route
auth.get("/sso/google/callback", async (c) => {
  const { code, state, error: callbackError } = c.req.query();

  if (callbackError) {
    console.log(`[AUTH] Google OAuth error: ${callbackError}`);
    clearAuthCookies(c);
    return c.redirect(
      `${ROUTES.UI_URL}/${ROUTES.LOGIN_PAGE}?error=google_oauth_error`,
    );
  }

  // Verify state parameter
  const storedState = getCookie(c, "google_oauth_state");
  if (!state || !storedState || state !== storedState) {
    console.log(
      `[AUTH] Google OAuth state mismatch: ${state} vs ${storedState}`,
    );
    return c.redirect(
      `${ROUTES.UI_URL}/${ROUTES.LOGIN_PAGE}?error=invalid_state`,
    );
  }

  // Clear state cookie
  deleteCookie(c, "google_oauth_state");

  // Exchange code for tokens
  const tokens = await getGoogleTokens(code);

  // Get user info from Google
  const googleUser = await getGoogleUserInfo(tokens.access_token);

  // Find existing user by Google ID or email
  let { result: user, error } = await tryCatchAsync(
    userQuery.findFirst({
      where: or(
        eq(usersTable.googleId, googleUser.id),
        eq(usersTable.email, googleUser.email),
      ),
    }),
  );

  if (error) {
    console.error(`[AUTH] Google OAuth error:`, error);
    return c.redirect(
      `${ROUTES.UI_URL}/${ROUTES.LOGIN_PAGE}?error=oauth_failure`,
    );
  }

  if (user && !user.googleId) {
    // Update existing user with Google ID
    const { result, error } = await tryCatchAsync(
      userQuery.update
        .set({
          googleId: googleUser.id,
          authProvider: "google",
          profilePicture: googleUser.picture || user.profilePicture,
        })
        .where(eq(usersTable.id, user.id))
        .returning(),
    );

    if (error) {
      console.error(`[AUTH] Google OAuth error:`, error);
      return c.redirect(
        `${ROUTES.UI_URL}/${ROUTES.LOGIN_PAGE}?error=oauth_failure`,
      );
    }

    user = result[0];
    console.log(`[AUTH] Added Google ID to existing user: ${user.id}`);
  } else if (!user) {
    // Create new user
    const { result, error } = await tryCatchAsync(
      userQuery.insert
        .values({
          name: googleUser.name,
          email: googleUser.email,
          googleId: googleUser.id,
          authProvider: "google",
          profilePicture: googleUser.picture,
          isOnboarded: false,
        })
        .returning(),
    );

    if (error) {
      console.error(`[AUTH] Google OAuth error:`, error);
      return c.redirect(
        `${ROUTES.UI_URL}/${ROUTES.LOGIN_PAGE}?error=oauth_failure`,
      );
    }

    user = result[0];
    console.log(`[AUTH] Created new user from Google login: ${user.id}`);
  }

  // Store Google tokens
  await storeGoogleTokens(user.id, tokens);

  // Generate our own tokens for API authentication
  const { accessToken, refreshToken } = await generateTokens(user);

  // Set cookies
  setCookie(c, CONSTANTS.ACCESS_TOKEN_COOKIE, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: CONSTANTS.ACCESS_TOKEN_EXPIRES_IN,
    path: "/",
  });

  setCookie(c, CONSTANTS.REFRESH_TOKEN_COOKIE, refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: CONSTANTS.REFRESH_TOKEN_EXPIRES_IN,
    path: "/",
  });

  setCookie(c, CONSTANTS.AUTHENTICATED, "true", {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    maxAge: CONSTANTS.ACCESS_TOKEN_EXPIRES_IN,
    path: "/",
  });

  // Redirect based on onboarding status
  if (!user.isOnboarded) {
    console.log(`[AUTH] Google user needs to complete onboarding: ${user.id}`);
    return c.redirect(`${ROUTES.UI_URL}${ROUTES.ONBOARDING_ROUTE}`);
  }

  console.log(`[AUTH] Google login successful for user: ${user.id}`);
  return c.redirect(`${ROUTES.UI_URL}/${ROUTES.HOME_ROUTE}`);
});
