import { cookie } from "@elysiajs/cookie";
import { cors } from "@elysiajs/cors";
import { jwt } from "@elysiajs/jwt";
import { swagger } from "@elysiajs/swagger";
import { Elysia } from "elysia";
import { config, isProduction } from "./config";
import { auth } from "./middleware/auth";
import { csrf } from "./middleware/csrf";
import { errorHandler } from "./middleware/error-handler";
import {
  activityLogRoutes,
  projectActivityRoutes,
  taskActivityRoutes,
} from "./routes/activity-logs";
import { attachmentRoutes } from "./routes/attachments";
import { authRoutes } from "./routes/auth";
import { commentRoutes } from "./routes/comments";
import { notificationRoutes } from "./routes/notifications";
import { projectRoutes } from "./routes/projects";
import { subtaskRoutes } from "./routes/subtasks";
import { tagRoutes, taskTagRoutes } from "./routes/tags";
import { taskRoutes } from "./routes/tasks";
import { timeEntryRoutes } from "./routes/time-entries";
import { workflowRoutes } from "./routes/workflows";
import { cleanupService } from "./services/cleanup.service";
import { initializeOAuthProviders } from "./services/oauth.service";

// Initialize OAuth providers (async)
await initializeOAuthProviders({
  google: {
    clientId: config.GOOGLE_CLIENT_ID,
    clientSecret: config.GOOGLE_CLIENT_SECRET,
  },
});

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
          {
            name: "Notifications",
            description:
              "Notification management for assignments, status changes, and mentions",
          },
          {
            name: "Tags",
            description:
              "Tag management and task-tag associations for categorizing and filtering work items",
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
  .use(errorHandler())
  .use(authRoutes)
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
  .use(notificationRoutes)
  .use(tagRoutes)
  .use(taskTagRoutes)
  .get("/", () => "Hello Elysia")
  .listen(config.PORT);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

// Export the app type for use in frontend (via @wingmnn/types package)
export type App = typeof app;
