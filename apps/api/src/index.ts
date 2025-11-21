import { cookie } from "@elysiajs/cookie";
import { cors } from "@elysiajs/cors";
import { jwt } from "@elysiajs/jwt";
import { Elysia, t } from "elysia";
import { config, isProduction } from "./config";
import { auth } from "./middleware/auth";
import { csrf } from "./middleware/csrf";
import { rateLimit } from "./middleware/rate-limit";
import { AuthError, AuthErrorCode, authService } from "./services/auth.service";
import { cleanupService } from "./services/cleanup.service";
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

// Run cleanup job for expired sessions and old used refresh tokens
// Run daily (every 24 hours)
const CLEANUP_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours

// Run cleanup on startup (after a short delay to ensure DB is ready)
setTimeout(async () => {
  try {
    await cleanupService.runCleanup();
  } catch (error) {
    console.error("[Cleanup] Error running initial cleanup:", error);
  }
}, 5000); // 5 second delay

// Schedule cleanup to run daily
setInterval(async () => {
  try {
    await cleanupService.runCleanup();
  } catch (error) {
    console.error("[Cleanup] Error running scheduled cleanup:", error);
  }
}, CLEANUP_INTERVAL_MS);

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
    cors({
      origin: isProduction
        ? process.env.ALLOWED_ORIGINS?.split(",").map((o) => o.trim()) || []
        : true, // Allow all origins in development
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: [
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "X-CSRF-Token", // CSRF protection
        "X-Forwarded-For", // IP forwarding (proxy support)
        "X-Real-IP", // Alternative IP header
        "User-Agent", // Client identification
      ],
      exposeHeaders: [
        "X-Access-Token", // New access token after refresh
        "X-RateLimit-Limit", // Rate limit maximum
        "X-RateLimit-Remaining", // Rate limit remaining
        "X-RateLimit-Reset", // Rate limit reset time
        "Retry-After", // Retry after rate limit
      ],
      maxAge: 86400, // 24 hours
    })
  )
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
  .onError(({ code, error, set }) => {
    // Handle AuthError
    if ((error as any) instanceof AuthError) {
      const authError = error as unknown as AuthError;
      set.status = authError.statusCode;
      return {
        error: authError.code,
        message: authError.message,
      };
    }

    // Handle Elysia validation errors
    if (code === "VALIDATION") {
      set.status = 400;
      return {
        error: "VALIDATION_ERROR",
        message: "Invalid request data",
      };
    }

    // Handle NOT_FOUND errors (using string comparison to avoid type issues)
    if (String(code) === "NOT_FOUND") {
      set.status = 404;
      return {
        error: "NOT_FOUND",
        message: "Resource not found",
      };
    }

    // Handle PARSE errors (invalid JSON, etc.)
    if (String(code) === "PARSE") {
      set.status = 400;
      return {
        error: "PARSE_ERROR",
        message: "Invalid request format",
      };
    }

    // Log unexpected errors
    console.error("Unexpected error:", error);
    set.status = 500;
    return {
      error: AuthErrorCode.INTERNAL_ERROR,
      message: "An unexpected error occurred",
    };
  })
  .get("/", () => "Hello Elysia")
  // POST /auth/register - Register new user with email/password
  .post(
    "/auth/register",
    async ({ body, request, cookie }) => {
      const { email, password, name } = body;

      // Extract request metadata
      const metadata = {
        ipAddress:
          request.headers.get("x-forwarded-for") ||
          request.headers.get("x-real-ip") ||
          "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
      };

      // Register user (validation happens in service)
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
    },
    {
      body: t.Object({
        email: t.String({ minLength: 1 }),
        password: t.String({ minLength: 1 }),
        name: t.String({ minLength: 1 }),
      }),
    }
  )
  // POST /auth/login - Login with email/password
  .post(
    "/auth/login",
    async ({ body, request, cookie }) => {
      const { email, password } = body;

      // Extract request metadata
      const metadata = {
        ipAddress:
          request.headers.get("x-forwarded-for") ||
          request.headers.get("x-real-ip") ||
          "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
      };

      // Login user (validation happens in service)
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
    },
    {
      body: t.Object({
        email: t.String({ minLength: 1 }),
        password: t.String({ minLength: 1 }),
      }),
      beforeHandle: rateLimit({
        max: config.LOGIN_RATE_LIMIT,
        window: config.LOGIN_RATE_WINDOW,
        endpoint: "login",
      }),
    }
  )
  // POST /auth/logout - Logout current session
  .post("/auth/logout", async ({ authenticated, sessionId, cookie }) => {
    // Check if user is authenticated
    if (!authenticated || !sessionId) {
      throw new AuthError(
        AuthErrorCode.INVALID_TOKEN,
        "Authentication required",
        401
      );
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
  })
  // GET /auth/sessions - List user's active sessions
  .get("/auth/sessions", async ({ authenticated, userId }) => {
    // Check if user is authenticated
    if (!authenticated || !userId) {
      throw new AuthError(
        AuthErrorCode.INVALID_TOKEN,
        "Authentication required",
        401
      );
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
  })
  // DELETE /auth/sessions/:id - Revoke a specific session
  .delete(
    "/auth/sessions/:id",
    async ({ authenticated, userId, params }) => {
      // Check if user is authenticated
      if (!authenticated || !userId) {
        throw new AuthError(
          AuthErrorCode.INVALID_TOKEN,
          "Authentication required",
          401
        );
      }

      const { id: targetSessionId } = params;

      // Get the target session to verify ownership
      const targetSession = await sessionService.getSession(targetSessionId);

      if (!targetSession) {
        throw new AuthError(
          AuthErrorCode.SESSION_NOT_FOUND,
          "Session not found",
          404
        );
      }

      // Verify that the session belongs to the authenticated user
      if (targetSession.userId !== userId) {
        throw new AuthError(
          AuthErrorCode.SESSION_NOT_FOUND,
          "Cannot revoke sessions belonging to other users",
          403
        );
      }

      // Revoke the session
      await sessionService.revokeSession(targetSessionId);

      return {
        message: "Session revoked successfully",
      };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    }
  )
  // DELETE /auth/sessions - Revoke all other sessions (except current)
  .delete("/auth/sessions", async ({ authenticated, userId, sessionId }) => {
    // Check if user is authenticated
    if (!authenticated || !userId || !sessionId) {
      throw new AuthError(
        AuthErrorCode.INVALID_TOKEN,
        "Authentication required",
        401
      );
    }

    // Revoke all sessions except the current one
    await sessionService.revokeAllUserSessions(userId, sessionId);

    return {
      message: "All other sessions revoked successfully",
    };
  })
  // GET /auth/:provider - Initiate OAuth flow
  .get(
    "/auth/:provider",
    async ({ params, set }) => {
      const { provider } = params;

      // Validate provider is supported
      const validProviders = ["google", "github", "microsoft", "facebook"];
      if (!validProviders.includes(provider)) {
        throw new AuthError(
          AuthErrorCode.INVALID_PROVIDER,
          `Provider '${provider}' is not supported`,
          400
        );
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
    async ({ params, query, request, cookie }) => {
      const { provider } = params;
      const { code, state, error: oauthError, error_description } = query;

      // Validate provider is supported
      const validProviders = ["google", "github", "microsoft", "facebook"];
      if (!validProviders.includes(provider)) {
        throw new AuthError(
          AuthErrorCode.INVALID_PROVIDER,
          `Provider '${provider}' is not supported`,
          400
        );
      }

      // Handle OAuth errors from provider
      if (oauthError) {
        throw new AuthError(
          AuthErrorCode.OAUTH_ERROR,
          error_description || `OAuth error: ${oauthError}`,
          400
        );
      }

      // Validate required parameters
      if (!code || !state) {
        throw new AuthError(
          AuthErrorCode.OAUTH_ERROR,
          "Missing required OAuth parameters",
          400
        );
      }

      // Validate state parameter for CSRF protection
      if (!validateOAuthState(state)) {
        throw new AuthError(
          AuthErrorCode.OAUTH_STATE_MISMATCH,
          "Invalid or expired OAuth state parameter",
          400
        );
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
