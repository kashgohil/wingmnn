import { auth } from "@auth";
import { CONSTANTS, ROUTES } from "@auth/constants";
import { revokeToken } from "@auth/jwt";
import { deleteCookie, getCookie } from "hono/cookie";

auth.post("/logout", async (c) => {
  try {
    const refreshToken = getCookie(c, CONSTANTS.REFRESH_TOKEN_COOKIE);

    // Revoke refresh token if it exists
    if (refreshToken) {
      await revokeToken(refreshToken);
    }

    // Clear cookies
    deleteCookie(c, CONSTANTS.AUTHENTICATED);
    deleteCookie(c, CONSTANTS.ACCESS_TOKEN_COOKIE);
    deleteCookie(c, CONSTANTS.REFRESH_TOKEN_COOKIE);

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
