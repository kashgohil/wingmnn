import { getCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { CONSTANTS, ROUTES } from "./constants";
import { verifyToken } from "./utils/jwt";

export type AuthenticateEnv = {
  Variables: {
    user: {
      id: string;
      name: string;
      email: string;
    };
  };
};

/**
 * Authentication middleware for protected routes
 * Verifies the JWT token in cookies or Authorization header
 */
export const authenticate = createMiddleware<AuthenticateEnv>(
  async (c, next) => {
    console.log("[AUTH] Authenticating request...");

    try {
      // Get token from Authorization header or cookies
      let accessToken = "";
      const authHeader = c.req.header("Authorization");

      if (authHeader && authHeader.startsWith("Bearer ")) {
        console.log("[AUTH] Found Authorization header");
        accessToken = authHeader.substring(7);
      } else {
        console.log("[AUTH] Checking cookies for token");
        accessToken = getCookie(c, CONSTANTS.ACCESS_TOKEN_COOKIE) || "";
      }

      if (!accessToken) {
        console.log("[AUTH] No access token found");
        return c.json({ message: "Unauthorized" }, 401);
      }

      console.log("[AUTH] Verifying access token");
      const payload = await verifyToken(accessToken, "access");

      // Add user info to context
      c.set("user", {
        id: payload.sub,
        name: payload.name,
        email: payload.email,
      });

      console.log(`[AUTH] Authenticated user: ${payload.sub}`);

      // Continue to the next middleware or handler
      return next();
    } catch (error) {
      console.log(
        `[AUTH] Authentication failed: ${error instanceof Error ? error.message : String(error)}`,
      );

      // Redirect to login page for web requests, return 401 for API requests
      const accept = c.req.header("Accept") || "";
      if (accept.includes("text/html")) {
        return c.redirect(`${ROUTES.UI_URL}${ROUTES.LOGIN_ROUTE}`);
      }

      return c.json({ message: "Unauthorized" }, 401);
    }
  },
);
