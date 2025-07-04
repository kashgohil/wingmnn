import { CONSTANTS, ROUTES } from "@auth/constants";
import { auth } from "@auth/router";
import { clearAuthCookies } from "@auth/utils/auth";
import { revokeToken } from "@auth/utils/jwt";
import { getCookie } from "hono/cookie";

auth.post("/logout", async (c) => {
  try {
    const refreshToken = getCookie(c, CONSTANTS.REFRESH_TOKEN_COOKIE);

    // Revoke refresh token if it exists
    if (refreshToken) {
      await revokeToken(refreshToken);
    }

    // Clear cookies
    clearAuthCookies(c);

    console.log(`[AUTH] User logged out successfully`);

    return c.json({
      success: true,
      message: "Logged out successfully",
      redirectUrl: ROUTES.LOGIN_PAGE,
    });
  } catch (error) {
    console.error(`[AUTH] Logout error:`, error);
    return c.json({ success: true, message: "Logged out successfully" });
  }
});
