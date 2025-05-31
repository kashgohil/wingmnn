import { CONSTANTS } from "@auth/constants";
import { generateTokens, revokeToken, verifyToken } from "@auth/jwt";
import { auth } from "@auth/router";
import { userQuery } from "@users/utils";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { tryCatchAsync } from "utils";

auth.get("/heartbeat", async (c) => {
  try {
    const refreshToken = getCookie(c, CONSTANTS.REFRESH_TOKEN_COOKIE);

    if (!refreshToken) {
      console.log(`[AUTH] Refresh token missing`);
      return c.json({ success: false, message: "Refresh token missing" }, 401);
    }

    // Verify refresh token
    const payload = await verifyToken(refreshToken, "refresh");
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
    const { accessToken, refreshToken: newRefreshToken } =
      await generateTokens(user);

    // Revoke old refresh token (optional - for added security)
    await revokeToken(refreshToken);

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
  } catch (error) {
    console.error(`[AUTH] Refresh token error:`, error);

    // Clear cookies on error
    deleteCookie(c, CONSTANTS.AUTHENTICATED);
    deleteCookie(c, CONSTANTS.ACCESS_TOKEN_COOKIE);
    deleteCookie(c, CONSTANTS.REFRESH_TOKEN_COOKIE);

    return c.json({ success: false, message: "Invalid refresh token" }, 401);
  }
});
