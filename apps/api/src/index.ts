import { cookie } from "@elysiajs/cookie";
import { cors } from "@elysiajs/cors";
import { jwt } from "@elysiajs/jwt";
import { swagger } from "@elysiajs/swagger";
import { Elysia, t } from "elysia";
import { config, isProduction } from "./config";
import { auth } from "./middleware/auth";
import { csrf } from "./middleware/csrf";
import { rateLimit } from "./middleware/rate-limit";
import {
  activityLogRoutes,
  projectActivityRoutes,
  taskActivityRoutes,
} from "./routes/activity-logs";
import { attachmentRoutes } from "./routes/attachments";
import { commentRoutes } from "./routes/comments";
import { projectRoutes } from "./routes/projects";
import { subtaskRoutes } from "./routes/subtasks";
import { taskRoutes } from "./routes/tasks";
import { timeEntryRoutes } from "./routes/time-entries";
import { workflowRoutes } from "./routes/workflows";
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
    swagger({
      documentation: {
        info: {
          title: "Authentication API",
          version: "1.0.0",
          description: `
# Authentication System API

A comprehensive authentication system supporting both email/password authentication and OAuth-based Single Sign-On (SSO) with Google.

## Features

- **Email/Password Authentication**: Traditional registration and login
- **OAuth SSO**: Google authentication (extensible to other providers)
- **Secure Session Management**: 30-day sessions with automatic extension
- **Token Rotation**: Automatic refresh token rotation for enhanced security
- **Multi-Device Support**: Manage sessions across multiple devices
- **CSRF Protection**: State parameter validation for OAuth flows
- **Rate Limiting**: Protection against brute force attacks

## Authentication Flow

### Access Tokens
- **Format**: JWT (JSON Web Token)
- **Expiration**: 15 minutes
- **Storage**: Client-side (memory or localStorage)
- **Usage**: Sent in \`Authorization: Bearer <token>\` header

### Refresh Tokens
- **Format**: Cryptographically random 256-bit string
- **Expiration**: 30 days (tied to session)
- **Storage**: HTTP-only secure cookie
- **Usage**: Automatically sent with requests for token refresh

### Automatic Token Refresh
The authentication middleware automatically refreshes tokens when:
- Access token is expired
- Access token is near expiration (< 5 minutes remaining)

When tokens are refreshed:
- New access token is returned in \`X-Access-Token\` response header
- New refresh token is set in HTTP-only cookie
- Client should update stored access token from response header

## Client-Side Implementation

### Making Authenticated Requests

\`\`\`typescript
async function apiRequest(url: string, options: RequestInit = {}) {
  const response = await fetch(url, {
    ...options,
    credentials: 'include', // Important: Send cookies
    headers: {
      ...options.headers,
      'Authorization': \`Bearer \${getAccessToken()}\`,
    },
  });

  // Check for new access token in response
  const newAccessToken = response.headers.get('X-Access-Token');
  if (newAccessToken) {
    setAccessToken(newAccessToken); // Update stored token
  }

  return response;
}
\`\`\`

### Token Storage Strategy

\`\`\`typescript
// Store access token in memory or localStorage
let accessToken: string | null = null;

function setAccessToken(token: string) {
  accessToken = token;
  // Optional: persist to localStorage for page refreshes
  localStorage.setItem('accessToken', token);
}

function getAccessToken(): string | null {
  if (!accessToken) {
    // Try to restore from localStorage
    accessToken = localStorage.getItem('accessToken');
  }
  return accessToken;
}

function clearAccessToken() {
  accessToken = null;
  localStorage.removeItem('accessToken');
}
\`\`\`

### Handling Authentication

\`\`\`typescript
// Login
async function login(email: string, password: string) {
  const response = await fetch('/auth/login', {
    method: 'POST',
    credentials: 'include', // Important: Receive cookies
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  setAccessToken(data.accessToken);
  return data.user;
}

// Logout
async function logout() {
  await fetch('/auth/logout', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Authorization': \`Bearer \${getAccessToken()}\` },
  });
  clearAccessToken();
}
\`\`\`

## Security Considerations

- **HTTPS Only**: All authentication endpoints must use HTTPS in production
- **HTTP-Only Cookies**: Refresh tokens are stored in HTTP-only cookies to prevent XSS attacks
- **Token Rotation**: Refresh tokens are rotated on every use to prevent replay attacks
- **Reuse Detection**: If a refresh token is reused, all session tokens are revoked
- **Rate Limiting**: Login endpoint is rate-limited to 5 attempts per 15 minutes
- **CSRF Protection**: OAuth flows use state parameter for CSRF protection
- **Password Security**: Passwords are hashed with bcrypt (work factor 12)

## Error Handling

All errors follow a consistent format:

\`\`\`json
{
  "error": "ERROR_CODE",
  "message": "Human-readable error message"
}
\`\`\`

Common error codes:
- \`INVALID_CREDENTIALS\`: Invalid email or password
- \`EMAIL_ALREADY_EXISTS\`: Email is already registered
- \`INVALID_TOKEN\`: Token is invalid or expired
- \`TOKEN_REUSE_DETECTED\`: Refresh token was reused (security violation)
- \`SESSION_EXPIRED\`: Session has expired
- \`OAUTH_ERROR\`: OAuth provider returned an error
- \`OAUTH_STATE_MISMATCH\`: OAuth state parameter is invalid (CSRF protection)
          `,
        },
        tags: [
          {
            name: "Authentication",
            description: "Email/password authentication endpoints",
          },
          {
            name: "OAuth",
            description: "OAuth SSO authentication endpoints",
          },
          {
            name: "Session Management",
            description: "Session management and revocation endpoints",
          },
          {
            name: "Workflows",
            description: "Workflow and status management endpoints",
          },
          {
            name: "Projects",
            description:
              "Project management, status updates, and member management endpoints",
          },
          {
            name: "Tasks",
            description:
              "Task management, status updates, assignments, progress tracking, and task linking endpoints",
          },
          {
            name: "Subtasks",
            description:
              "Subtask management, status updates, and assignment endpoints",
          },
          {
            name: "Time Tracking",
            description:
              "Time entry management and time summary calculation endpoints",
          },
          {
            name: "Comments",
            description:
              "Comment management with threading support for tasks and subtasks",
          },
          {
            name: "Attachments",
            description:
              "File attachment management for tasks and subtasks with secure download URLs",
          },
          {
            name: "Activity Logs",
            description:
              "Activity log viewing and filtering for audit trails and change history",
          },
        ],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: "http",
              scheme: "bearer",
              bearerFormat: "JWT",
              description:
                "JWT access token obtained from login or registration",
            },
            cookieAuth: {
              type: "apiKey",
              in: "cookie",
              name: "refresh_token",
              description:
                "HTTP-only refresh token cookie (automatically sent by browser)",
            },
          },
        },
      },
    })
  )
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
  .use(workflowRoutes)
  .use(projectRoutes)
  .use(taskRoutes)
  .use(subtaskRoutes)
  .use(timeEntryRoutes)
  .use(commentRoutes)
  .use(attachmentRoutes)
  .use(activityLogRoutes)
  .use(projectActivityRoutes)
  .use(taskActivityRoutes)
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
      detail: {
        tags: ["Authentication"],
        summary: "Register a new user",
        description: `
Register a new user account with email and password.

**Requirements:**
- Email must be unique (not already registered)
- Password must be at least 8 characters
- Password is hashed with bcrypt (work factor 12) before storage

**Response:**
- Access token (JWT) valid for 15 minutes
- Refresh token set in HTTP-only cookie valid for 30 days
- User profile information

**Security:**
- Password is securely hashed before storage
- Refresh token is stored in HTTP-only cookie to prevent XSS attacks
- Session is created with 30-day expiration
        `,
        responses: {
          200: {
            description: "User registered successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    accessToken: {
                      type: "string",
                      description: "JWT access token (valid for 15 minutes)",
                      example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                    },
                    expiresIn: {
                      type: "number",
                      description: "Token expiration time in seconds",
                      example: 900,
                    },
                    user: {
                      type: "object",
                      properties: {
                        id: { type: "string", example: "user_123" },
                        email: { type: "string", example: "user@example.com" },
                        name: { type: "string", example: "John Doe" },
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "Validation error or email already exists",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: {
                      type: "string",
                      example: "EMAIL_ALREADY_EXISTS",
                    },
                    message: {
                      type: "string",
                      example: "Email is already registered",
                    },
                  },
                },
              },
            },
          },
        },
      },
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
      detail: {
        tags: ["Authentication"],
        summary: "Login with email and password",
        description: `
Authenticate a user with email and password credentials.

**Rate Limiting:**
- Maximum 5 attempts per 15 minutes per IP address
- Returns 429 status code when rate limit is exceeded

**Response:**
- Access token (JWT) valid for 15 minutes
- Refresh token set in HTTP-only cookie valid for 30 days
- User profile information

**Security:**
- Credentials are verified against securely hashed passwords
- Generic error messages prevent user enumeration
- Session is created with IP address and user agent tracking
        `,
        responses: {
          200: {
            description: "Login successful",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    accessToken: {
                      type: "string",
                      description: "JWT access token (valid for 15 minutes)",
                      example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                    },
                    expiresIn: {
                      type: "number",
                      description: "Token expiration time in seconds",
                      example: 900,
                    },
                    user: {
                      type: "object",
                      properties: {
                        id: { type: "string", example: "user_123" },
                        email: { type: "string", example: "user@example.com" },
                        name: { type: "string", example: "John Doe" },
                      },
                    },
                  },
                },
              },
            },
          },
          401: {
            description: "Invalid credentials",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: {
                      type: "string",
                      example: "INVALID_CREDENTIALS",
                    },
                    message: {
                      type: "string",
                      example: "Invalid email or password",
                    },
                  },
                },
              },
            },
          },
          429: {
            description: "Rate limit exceeded",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "string", example: "RATE_LIMIT_EXCEEDED" },
                    message: {
                      type: "string",
                      example:
                        "Too many login attempts. Please try again later.",
                    },
                  },
                },
              },
            },
          },
        },
      },
    }
  )
  // POST /auth/logout - Logout current session
  .post(
    "/auth/logout",
    async ({ authenticated, sessionId, cookie }) => {
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
    },
    {
      detail: {
        tags: ["Authentication"],
        summary: "Logout current session",
        description: `
Logout the current user session and revoke all associated tokens.

**Authentication Required:**
- Must include valid access token in Authorization header

**Actions:**
- Revokes the current session
- Invalidates all tokens associated with the session
- Clears the refresh token cookie

**Note:** This only logs out the current session. To logout from all devices, use the \`DELETE /auth/sessions\` endpoint.
        `,
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Logout successful",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "Logged out successfully",
                    },
                  },
                },
              },
            },
          },
          401: {
            description: "Authentication required",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "string", example: "INVALID_TOKEN" },
                    message: {
                      type: "string",
                      example: "Authentication required",
                    },
                  },
                },
              },
            },
          },
        },
      },
    }
  )
  // GET /auth/sessions - List user's active sessions
  .get(
    "/auth/sessions",
    async ({ authenticated, userId }) => {
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
    },
    {
      detail: {
        tags: ["Session Management"],
        summary: "List active sessions",
        description: `
Get a list of all active sessions for the authenticated user.

**Authentication Required:**
- Must include valid access token in Authorization header

**Response:**
- Array of session objects with metadata
- Each session includes creation date, last activity, expiration, IP address, and user agent
- Sensitive data (tokens) is excluded from the response

**Use Cases:**
- View all devices/locations where you're logged in
- Monitor account security
- Identify sessions to revoke
        `,
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "List of active sessions",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    sessions: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: {
                            type: "string",
                            example: "session_123",
                          },
                          createdAt: {
                            type: "string",
                            format: "date-time",
                            example: "2024-01-15T10:30:00Z",
                          },
                          lastActivityAt: {
                            type: "string",
                            format: "date-time",
                            example: "2024-01-20T14:22:00Z",
                          },
                          expiresAt: {
                            type: "string",
                            format: "date-time",
                            example: "2024-02-14T10:30:00Z",
                          },
                          ipAddress: {
                            type: "string",
                            example: "192.168.1.1",
                          },
                          userAgent: {
                            type: "string",
                            example:
                              "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          401: {
            description: "Authentication required",
          },
        },
      },
    }
  )
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
      detail: {
        tags: ["Session Management"],
        summary: "Revoke a specific session",
        description: `
Revoke a specific session by ID, logging out that device/location.

**Authentication Required:**
- Must include valid access token in Authorization header

**Security:**
- Users can only revoke their own sessions
- Attempting to revoke another user's session returns 403 Forbidden

**Use Cases:**
- Logout from a specific device
- Revoke access from a lost or stolen device
- Remove suspicious sessions

**Note:** You can revoke your current session (equivalent to logout) or any other session.
        `,
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Session revoked successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "Session revoked successfully",
                    },
                  },
                },
              },
            },
          },
          401: {
            description: "Authentication required",
          },
          403: {
            description: "Cannot revoke sessions belonging to other users",
          },
          404: {
            description: "Session not found",
          },
        },
      },
    }
  )
  // DELETE /auth/sessions - Revoke all other sessions (except current)
  .delete(
    "/auth/sessions",
    async ({ authenticated, userId, sessionId }) => {
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
    },
    {
      detail: {
        tags: ["Session Management"],
        summary: "Revoke all other sessions",
        description: `
Revoke all sessions except the current one, logging out from all other devices.

**Authentication Required:**
- Must include valid access token in Authorization header

**Actions:**
- Revokes all sessions for the authenticated user
- Keeps the current session active
- Invalidates all tokens for revoked sessions

**Use Cases:**
- Logout from all other devices while staying logged in on current device
- Security measure after password change
- Remove all sessions when suspicious activity is detected

**Note:** This is useful for "logout everywhere else" functionality.
        `,
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "All other sessions revoked successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "All other sessions revoked successfully",
                    },
                  },
                },
              },
            },
          },
          401: {
            description: "Authentication required",
          },
        },
      },
    }
  )
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
      detail: {
        tags: ["OAuth"],
        summary: "Initiate OAuth authentication",
        description: `
Initiate OAuth authentication flow with a supported provider.

**Supported Providers:**
- \`google\` - Google OAuth 2.0
- \`github\` - GitHub OAuth (coming soon)
- \`microsoft\` - Microsoft OAuth (coming soon)
- \`facebook\` - Facebook OAuth (coming soon)

**Flow:**
1. Client redirects user to this endpoint
2. Server generates CSRF protection state parameter
3. Server redirects user to OAuth provider's authorization page
4. User authorizes the application
5. OAuth provider redirects back to callback endpoint with authorization code

**Security:**
- State parameter is generated for CSRF protection
- State expires after 5 minutes
- State is validated in the callback endpoint

**Example:**
\`\`\`typescript
// Redirect user to OAuth provider
window.location.href = '/auth/google';
\`\`\`
        `,
        responses: {
          302: {
            description: "Redirect to OAuth provider authorization page",
            headers: {
              Location: {
                schema: { type: "string" },
                description: "OAuth provider authorization URL",
              },
            },
          },
          400: {
            description: "Invalid or unsupported provider",
          },
        },
      },
    }
  )
  // GET /auth/:provider/callback - Handle OAuth callback
  .get(
    "/auth/:provider/callback",
    async ({ params, query, request, cookie, set }) => {
      const { provider } = params;
      const { code, state, error: oauthError, error_description } = query;

      // Get frontend URL from environment or use default
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3001";

      // Validate provider is supported
      const validProviders = ["google", "github", "microsoft", "facebook"];
      if (!validProviders.includes(provider)) {
        // Redirect to frontend with error
        set.status = 302;
        set.headers[
          "Location"
        ] = `${frontendUrl}/auth/${provider}/callback?error=invalid_provider`;
        return;
      }

      // Handle OAuth errors from provider
      if (oauthError) {
        // Redirect to frontend with error
        set.status = 302;
        set.headers[
          "Location"
        ] = `${frontendUrl}/auth/${provider}/callback?error=${oauthError}&error_description=${encodeURIComponent(
          error_description || ""
        )}`;
        return;
      }

      // Validate required parameters
      if (!code || !state) {
        // Redirect to frontend with error
        set.status = 302;
        set.headers[
          "Location"
        ] = `${frontendUrl}/auth/${provider}/callback?error=missing_parameters`;
        return;
      }

      // Validate state parameter for CSRF protection
      if (!validateOAuthState(state)) {
        // Redirect to frontend with error
        set.status = 302;
        set.headers[
          "Location"
        ] = `${frontendUrl}/auth/${provider}/callback?error=state_mismatch`;
        return;
      }

      try {
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
          sameSite: "lax", // Changed from "strict" to "lax" to allow cross-site redirects
          path: "/",
          maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
        });

        // Redirect to frontend with success, access token, and user data
        const userData = encodeURIComponent(JSON.stringify(result.user));
        set.status = 302;
        set.headers[
          "Location"
        ] = `${frontendUrl}/auth/${provider}/callback?success=true&access_token=${result.accessToken}&user=${userData}`;
        return;
      } catch (error) {
        // Redirect to frontend with error
        const errorMessage =
          error instanceof Error ? error.message : "authentication_failed";
        set.status = 302;
        set.headers[
          "Location"
        ] = `${frontendUrl}/auth/${provider}/callback?error=${encodeURIComponent(
          errorMessage
        )}`;
        return;
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
      detail: {
        tags: ["OAuth"],
        summary: "Handle OAuth callback",
        description: `
Handle OAuth provider callback after user authorization.

**Flow:**
1. OAuth provider redirects user to this endpoint with authorization code
2. Server validates state parameter for CSRF protection
3. Server exchanges authorization code for access token and user info
4. Server creates or links user account
5. Server encrypts and stores OAuth refresh token (for Google API access)
6. Server creates session and returns authentication tokens

**Security:**
- State parameter is validated to prevent CSRF attacks
- OAuth tokens are encrypted before storage (AES-256-GCM)
- Refresh token is stored in HTTP-only cookie
- Session is created with IP address and user agent tracking

**Account Linking:**
- If user with same email exists, OAuth account is linked
- If no user exists, new user account is created
- Users can have multiple OAuth providers linked to one account

**Google Refresh Token:**
- Requested with \`offline_access\` scope
- Encrypted and stored for future Google API access
- Updated when user re-authenticates

**Note:** This endpoint is called automatically by the OAuth provider. Clients should not call this directly.
        `,
        responses: {
          200: {
            description: "OAuth authentication successful",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    accessToken: {
                      type: "string",
                      description: "JWT access token (valid for 15 minutes)",
                      example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                    },
                    expiresIn: {
                      type: "number",
                      description: "Token expiration time in seconds",
                      example: 900,
                    },
                    user: {
                      type: "object",
                      properties: {
                        id: { type: "string", example: "user_123" },
                        email: { type: "string", example: "user@example.com" },
                        name: { type: "string", example: "John Doe" },
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "OAuth error or invalid parameters",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: {
                      type: "string",
                      example: "OAUTH_STATE_MISMATCH",
                    },
                    message: {
                      type: "string",
                      example: "Invalid or expired OAuth state parameter",
                    },
                  },
                },
              },
            },
          },
        },
      },
    }
  )
  .listen(config.PORT);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

// Export the app type for use in frontend (via @wingmnn/types package)
export type App = typeof app;
