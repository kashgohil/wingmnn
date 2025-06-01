import { CONSTANTS } from "@auth/constants";
import { generateTokens, revokeToken, verifyToken } from "@auth/jwt";
import { auth } from "@auth/router";
import { userQuery } from "@users/utils";
import { getCookie, setCookie } from "hono/cookie";
import { tryCatchAsync } from "utils";

auth.get("/heartbeat", async (c) => {
  const refreshToken = getCookie(c, CONSTANTS.REFRESH_TOKEN_COOKIE);

  if (!refreshToken) {
    console.log(`[AUTH] Refresh token missing`);
    return c.json({ success: false, message: "Refresh token missing" }, 401);
  }

  // Verify refresh token
  const { result: payload, error: tokenError } = await tryCatchAsync(
    verifyToken(refreshToken, "refresh"),
  );

  if (tokenError) {
    console.error(
      "[AUTH][HEARTBEAT] something went wrong while verifying token: ",
      tokenError,
    );
    return c.json({ success: false, message: "Invalid Token" }, 401);
  }

  const userId = payload.sub;

  // Get user from database
  const { result: user, error } = await tryCatchAsync(
    userQuery.get("id", userId),
  );

  if (error) {
    console.error("[AUTH][HEARTBEAT] Something went wrong: ", error);
    return c.json({ success: false, message: "User not found" }, 401);
  }

  if (!user) {
    console.log(`[AUTH] User not found for refresh token: ${userId}`);
    return c.json({ success: false, message: "User not found" }, 401);
  }

  // Generate new tokens
  const { result: generatedTokens, error: generateTokenError } =
    await tryCatchAsync(generateTokens(user));

  if (generateTokenError) {
    console.log(
      `[AUTH] something went wrong while generating tokens: `,
      generateTokenError,
    );
    return c.json({ success: false, message: "Something went wrong" }, 401);
  }

  const { accessToken, refreshToken: newRefreshToken } = generatedTokens;

  // Revoke old refresh token (optional - for added security)
  const isRevoked = await revokeToken(refreshToken);

  // Set new cookies
  setCookie(c, CONSTANTS.ACCESS_TOKEN_COOKIE, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: CONSTANTS.ACCESS_TOKEN_EXPIRES_IN,
    path: "/",
  });

  setCookie(c, CONSTANTS.REFRESH_TOKEN_COOKIE, newRefreshToken, {
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

  console.log(`[AUTH] Token refreshed for user: ${userId}`);

  return c.json({
    success: true,
    message: "Token refreshed successfully",
  });
});
