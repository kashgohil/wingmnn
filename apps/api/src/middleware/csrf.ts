import { randomBytes } from "crypto";
import { Elysia } from "elysia";

const CSRF_TOKEN_LENGTH = 32;
const CSRF_COOKIE_NAME = "csrf_token";
const CSRF_HEADER_NAME = "x-csrf-token";

// Methods that require CSRF protection
const PROTECTED_METHODS = ["POST", "PUT", "PATCH", "DELETE"];

export const csrf = () =>
  new Elysia({ name: "csrf" })
    .derive(({ cookie, headers, request }) => {
      // Generate or retrieve CSRF token
      let csrfToken = cookie[CSRF_COOKIE_NAME]?.value;

      if (!csrfToken) {
        csrfToken = randomBytes(CSRF_TOKEN_LENGTH).toString("hex");
        cookie[CSRF_COOKIE_NAME].set({
          value: csrfToken,
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          path: "/",
        });
      }

      return {
        csrfToken,
      };
    })
    .onBeforeHandle(({ request, cookie, headers, set }) => {
      // Skip CSRF check for safe methods
      if (!PROTECTED_METHODS.includes(request.method)) {
        return;
      }

      const cookieToken = cookie[CSRF_COOKIE_NAME]?.value;
      const headerToken = headers[CSRF_HEADER_NAME];

      // Validate CSRF token
      if (!cookieToken || !headerToken || cookieToken !== headerToken) {
        set.status = 403;
        return {
          error: "Invalid CSRF token",
          message: "CSRF token validation failed",
        };
      }
    });
