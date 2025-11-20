import { cookie } from "@elysiajs/cookie";
import { jwt } from "@elysiajs/jwt";
import { Elysia, t } from "elysia";
import { config, isProduction } from "./config";
import { auth } from "./middleware/auth";
import { csrf } from "./middleware/csrf";
import { AuthError, authService } from "./services/auth.service";
import { sessionService } from "./services/session.service";

const REFRESH_TOKEN_COOKIE_NAME = "refresh_token";

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
  .listen(config.PORT);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
