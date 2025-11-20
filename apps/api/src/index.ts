import { cookie } from "@elysiajs/cookie";
import { jwt } from "@elysiajs/jwt";
import { Elysia, t } from "elysia";
import { config, isProduction } from "./config";
import { auth } from "./middleware/auth";
import { csrf } from "./middleware/csrf";
import { AuthError, authService } from "./services/auth.service";
import { initializeOAuthProviders } from "./services/oauth.service";
import { sessionService } from "./services/session.service";

const REFRESH_TOKEN_COOKIE_NAME = "refresh_token";

// Initialize OAuth providers (async)
await initializeOAuthProviders({
  google: {
    clientId: config.GOOGLE_CLIENT_ID,
    clientSecret: config.GOOGLE_CLIENT_SECRET,
  },
});

// In-memory state store for OAuth CSRF protection
// In production, this should be Redis or a database
const oauthStateStore = new Map<string, { createdAt: number }>();

// Clean up expired states every 10 minutes
setInterval(() => {
  const now = Date.now();
  const FIVE_MINUTES = 5 * 60 * 1000;

  for (const [state, data] of oauthStateStore.entries()) {
    if (now - data.createdAt > FIVE_MINUTES) {
      oauthStateStore.delete(state);
    }
  }
}, 10 * 60 * 1000);

/**
 * Generate a cryptographically secure random state parameter for OAuth CSRF protection
 */
function generateOAuthState(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
    ""
  );
}

/**
 * Validate OAuth state parameter
 */
function validateOAuthState(state: string): boolean {
  const stateData = oauthStateStore.get(state);

  if (!stateData) {
    return false;
  }

  // Check if state is not expired (5 minutes)
  const FIVE_MINUTES = 5 * 60 * 1000;
  if (Date.now() - stateData.createdAt > FIVE_MINUTES) {
    oauthStateStore.delete(state);
    return false;
  }

  // Delete state after validation (one-time use)
  oauthStateStore.delete(state);
  return true;
}

const app = new Elysia()
  .use(
    jwt({
      name: "jwt",
      secret: config.JWT_SECRET,
      exp: config.JWT_EXPIRATION,
    })
  )
  .use(cookie())
  .use(csrf())
  .use(auth())
  .get("/", () => "Hello Elysia")
  // POST /auth/register - Register new user with email/password
  .post(
    "/auth/register",
    async ({ body, request, cookie, set }) => {
      try {
        const { email, password, name } = body;

        // Extract request metadata
        const metadata = {
          ipAddress:
            request.headers.get("x-forwarded-for") ||
            request.headers.get("x-real-ip") ||
            "unknown",
          userAgent: request.headers.get("user-agent") || "unknown",
        };

        // Register user
        const result = await authService.register(
          email,
          password,
          name,
          metadata
        );

        // Set refresh token in HTTP-only cookie
        cookie[REFRESH_TOKEN_COOKIE_NAME].set({
          value: result.refreshToken,
          httpOnly: true,
          secure: isProduction,
          sameSite: "strict",
          path: "/",
          maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
        });

        // Return access token in response body
        return {
          accessToken: result.accessToken,
          expiresIn: result.expiresIn,
          user: result.user,
        };
      } catch (error) {
        if (error instanceof AuthError) {
          set.status = error.statusCode;
          return {
            error: error.code,
            message: error.message,
          };
        }

        // Internal server error
        set.status = 500;
        return {
          error: "INTERNAL_ERROR",
          message: "An unexpected error occurred",
        };
      }
    },
    {
      body: t.Object({
        email: t.String({ format: "email" }),
        password: t.String({ minLength: 8 }),
        name: t.String({ minLength: 1 }),
      }),
    }
  )
  // POST /auth/login - Login with email/password
  .post(
    "/auth/login",
    async ({ body, request, cookie, set }) => {
      try {
        const { email, password } = body;

        // Extract request metadata
        const metadata = {
          ipAddress:
            request.headers.get("x-forwarded-for") ||
            request.headers.get("x-real-ip") ||
            "unknown",
          userAgent: request.headers.get("user-agent") || "unknown",
        };

        // Login user
        const result = await authService.login(email, password, metadata);

        // Set refresh token in HTTP-only cookie
        cookie[REFRESH_TOKEN_COOKIE_NAME].set({
          value: result.refreshToken,
          httpOnly: true,
          secure: isProduction,
          sameSite: "strict",
          path: "/",
          maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
        });

        // Return access token in response body
        return {
          accessToken: result.accessToken,
          expiresIn: result.expiresIn,
          user: result.user,
        };
      } catch (error) {
        if (error instanceof AuthError) {
          set.status = error.statusCode;
          return {
            error: error.code,
            message: error.message,
          };
        }

        // Internal server error
        set.status = 500;
        return {
          error: "INTERNAL_ERROR",
          message: "An unexpected error occurred",
        };
      }
    },
    {
      body: t.Object({
        email: t.String({ format: "email" }),
        password: t.String({ minLength: 1 }),
      }),
    }
  )
  // POST /auth/logout - Logout current session
  .post("/auth/logout", async ({ authenticated, sessionId, cookie, set }) => {
    try {
      // Check if user is authenticated
      if (!authenticated || !sessionId) {
        set.status = 401;
        return {
          error: "UNAUTHORIZED",
          message: "Authentication required",
        };
      }

      // Revoke the current session
      await sessionService.revokeSession(sessionId);

      // Clear refresh token cookie
      cookie[REFRESH_TOKEN_COOKIE_NAME].set({
        value: "",
        httpOnly: true,
        secure: isProduction,
        sameSite: "strict",
        path: "/",
        maxAge: 0, // Expire immediately
      });

      return {
        message: "Logged out successfully",
      };
    } catch (error) {
      // Internal server error
      set.status = 500;
      return {
        error: "INTERNAL_ERROR",
        message: "An unexpected error occurred",
      };
    }
  })
  // GET /auth/sessions - List user's active sessions
  .get("/auth/sessions", async ({ authenticated, userId, set }) => {
    try {
      // Check if user is authenticated
      if (!authenticated || !userId) {
        set.status = 401;
        return {
          error: "UNAUTHORIZED",
          message: "Authentication required",
        };
      }

      // Get all active sessions for the user
      const sessions = await sessionService.getUserSessions(userId);

      // Format sessions for response (exclude sensitive data)
      const formattedSessions = sessions.map((session) => ({
        id: session.id,
        createdAt: session.createdAt,
        lastActivityAt: session.lastActivityAt,
        expiresAt: session.expiresAt,
        ipAddress: session.ipAddress,
        userAgent: session.userAgent,
      }));

      return {
        sessions: formattedSessions,
      };
    } catch (error) {
      // Internal server error
      set.status = 500;
      return {
        error: "INTERNAL_ERROR",
        message: "An unexpected error occurred",
      };
    }
  })
  // DELETE /auth/sessions/:id - Revoke a specific session
  .delete(
    "/auth/sessions/:id",
    async ({
      authenticated,
      userId,
      sessionId: currentSessionId,
      params,
      set,
    }) => {
      try {
        // Check if user is authenticated
        if (!authenticated || !userId) {
          set.status = 401;
          return {
            error: "UNAUTHORIZED",
            message: "Authentication required",
          };
        }

        const { id: targetSessionId } = params;

        // Get the target session to verify ownership
        const targetSession = await sessionService.getSession(targetSessionId);

        if (!targetSession) {
          set.status = 404;
          return {
            error: "SESSION_NOT_FOUND",
            message: "Session not found",
          };
        }

        // Verify that the session belongs to the authenticated user
        if (targetSession.userId !== userId) {
          set.status = 403;
          return {
            error: "FORBIDDEN",
            message: "Cannot revoke sessions belonging to other users",
          };
        }

        // Revoke the session
        await sessionService.revokeSession(targetSessionId);

        return {
          message: "Session revoked successfully",
        };
      } catch (error) {
        // Internal server error
        set.status = 500;
        return {
          error: "INTERNAL_ERROR",
          message: "An unexpected error occurred",
        };
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    }
  )
  // DELETE /auth/sessions - Revoke all other sessions (except current)
  .delete(
    "/auth/sessions",
    async ({ authenticated, userId, sessionId, set }) => {
      try {
        // Check if user is authenticated
        if (!authenticated || !userId || !sessionId) {
          set.status = 401;
          return {
            error: "UNAUTHORIZED",
            message: "Authentication required",
          };
        }

        // Revoke all sessions except the current one
        await sessionService.revokeAllUserSessions(userId, sessionId);

        return {
          message: "All other sessions revoked successfully",
        };
      } catch (error) {
        // Internal server error
        set.status = 500;
        return {
          error: "INTERNAL_ERROR",
          message: "An unexpected error occurred",
        };
      }
    }
  )
  // GET /auth/:provider - Initiate OAuth flow
  .get(
    "/auth/:provider",
    async ({ params, set }) => {
      try {
        const { provider } = params;

        // Validate provider is supported
        const validProviders = ["google", "github", "microsoft", "facebook"];
        if (!validProviders.includes(provider)) {
          set.status = 400;
          return {
            error: "INVALID_PROVIDER",
            message: `Provider '${provider}' is not supported`,
          };
        }

        // Generate CSRF protection state parameter
        const state = generateOAuthState();
        oauthStateStore.set(state, { createdAt: Date.now() });

        // Get OAuth authorization URL
        const authUrl = authService.getOAuthUrl(
          provider as "google" | "github" | "microsoft" | "facebook",
          state
        );

        // Redirect to OAuth provider
        set.status = 302;
        set.headers["Location"] = authUrl;
        return;
      } catch (error) {
        if (error instanceof AuthError) {
          set.status = error.statusCode;
          return {
            error: error.code,
            message: error.message,
          };
        }

        // Internal server error
        set.status = 500;
        return {
          error: "OAUTH_ERROR",
          message: "Failed to initiate OAuth flow",
        };
      }
    },
    {
      params: t.Object({
        provider: t.String(),
      }),
    }
  )
  // GET /auth/:provider/callback - Handle OAuth callback
  .get(
    "/auth/:provider/callback",
    async ({ params, query, request, cookie, set }) => {
      try {
        const { provider } = params;
        const { code, state, error: oauthError, error_description } = query;

        // Handle OAuth errors from provider
        if (oauthError) {
          set.status = 400;
          return {
            error: "OAUTH_ERROR",
            message: error_description || `OAuth error: ${oauthError}`,
          };
        }

        // Validate required parameters
        if (!code || !state) {
          set.status = 400;
          return {
            error: "OAUTH_ERROR",
            message: "Missing required OAuth parameters",
          };
        }

        // Validate provider is supported
        const validProviders = ["google", "github", "microsoft", "facebook"];
        if (!validProviders.includes(provider)) {
          set.status = 400;
          return {
            error: "INVALID_PROVIDER",
            message: `Provider '${provider}' is not supported`,
          };
        }

        // Validate state parameter for CSRF protection
        if (!validateOAuthState(state)) {
          set.status = 400;
          return {
            error: "OAUTH_STATE_MISMATCH",
            message: "Invalid or expired OAuth state parameter",
          };
        }

        // Extract request metadata
        const metadata = {
          ipAddress:
            request.headers.get("x-forwarded-for") ||
            request.headers.get("x-real-ip") ||
            "unknown",
          userAgent: request.headers.get("user-agent") || "unknown",
        };

        // Handle OAuth callback and authenticate user
        const result = await authService.handleOAuthCallback(
          provider as "google" | "github" | "microsoft" | "facebook",
          code,
          metadata
        );

        // Set refresh token in HTTP-only cookie
        cookie[REFRESH_TOKEN_COOKIE_NAME].set({
          value: result.refreshToken,
          httpOnly: true,
          secure: isProduction,
          sameSite: "strict",
          path: "/",
          maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
        });

        // Return access token in response body
        return {
          accessToken: result.accessToken,
          expiresIn: result.expiresIn,
          user: result.user,
        };
      } catch (error) {
        if (error instanceof AuthError) {
          set.status = error.statusCode;
          return {
            error: error.code,
            message: error.message,
          };
        }

        // Internal server error
        set.status = 500;
        return {
          error: "OAUTH_ERROR",
          message: "OAuth authentication failed",
        };
      }
    },
    {
      params: t.Object({
        provider: t.String(),
      }),
      query: t.Object({
        code: t.Optional(t.String()),
        state: t.Optional(t.String()),
        error: t.Optional(t.String()),
        error_description: t.Optional(t.String()),
      }),
    }
  )
  .listen(config.PORT);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
