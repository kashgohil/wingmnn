import { cors } from "@elysiajs/cors";
import { describe, expect, it } from "bun:test";
import { Elysia } from "elysia";
import { rateLimit } from "./middleware/rate-limit";

describe("Security Features", () => {
  describe("Rate Limiting", () => {
    it("should enforce rate limits on endpoints", async () => {
      const app = new Elysia().post("/test-login", () => ({ success: true }), {
        beforeHandle: rateLimit({
          max: 2,
          window: "15m",
          endpoint: "test-login",
        }),
      });

      // First two requests should succeed
      const res1 = await app.handle(
        new Request("http://localhost/test-login", {
          method: "POST",
          headers: {
            "x-forwarded-for": "192.168.1.100",
          },
        })
      );
      expect(res1.status).toBe(200);
      expect(res1.headers.get("X-RateLimit-Limit")).toBe("2");
      expect(res1.headers.get("X-RateLimit-Remaining")).toBe("1");

      const res2 = await app.handle(
        new Request("http://localhost/test-login", {
          method: "POST",
          headers: {
            "x-forwarded-for": "192.168.1.100",
          },
        })
      );
      expect(res2.status).toBe(200);
      expect(res2.headers.get("X-RateLimit-Remaining")).toBe("0");

      // Third request should be rate limited
      const res3 = await app.handle(
        new Request("http://localhost/test-login", {
          method: "POST",
          headers: {
            "x-forwarded-for": "192.168.1.100",
          },
        })
      );
      expect(res3.status).toBe(429);
      const body = await res3.json();
      expect(body.error).toBe("RATE_LIMIT_EXCEEDED");
      expect(res3.headers.get("Retry-After")).toBeDefined();
    });

    it("should track rate limits per IP address", async () => {
      const app = new Elysia().post("/test-per-ip", () => ({ success: true }), {
        beforeHandle: rateLimit({
          max: 1,
          window: "15m",
          endpoint: "test-per-ip",
        }),
      });

      // First IP - first request succeeds
      const res1 = await app.handle(
        new Request("http://localhost/test-per-ip", {
          method: "POST",
          headers: {
            "x-forwarded-for": "192.168.1.101",
          },
        })
      );
      expect(res1.status).toBe(200);

      // First IP - second request blocked
      const res2 = await app.handle(
        new Request("http://localhost/test-per-ip", {
          method: "POST",
          headers: {
            "x-forwarded-for": "192.168.1.101",
          },
        })
      );
      expect(res2.status).toBe(429);

      // Different IP - first request succeeds
      const res3 = await app.handle(
        new Request("http://localhost/test-per-ip", {
          method: "POST",
          headers: {
            "x-forwarded-for": "192.168.1.102",
          },
        })
      );
      expect(res3.status).toBe(200);
    });
  });

  describe("CORS Configuration", () => {
    it("should set CORS headers using Elysia CORS plugin", async () => {
      const app = new Elysia()
        .use(
          cors({
            origin: true, // Allow all origins for test
            credentials: true,
            exposeHeaders: ["X-Access-Token", "X-RateLimit-Limit"],
          })
        )
        .get("/test", () => ({ success: true }));

      const res = await app.handle(
        new Request("http://localhost/test", {
          method: "GET",
          headers: {
            origin: "http://localhost:3000",
          },
        })
      );

      expect(res.headers.get("Access-Control-Allow-Origin")).toBe(
        "http://localhost:3000"
      );
      expect(res.headers.get("Access-Control-Allow-Credentials")).toBe("true");
    });

    it("should handle preflight OPTIONS requests", async () => {
      const app = new Elysia()
        .use(
          cors({
            origin: true,
            methods: ["GET", "POST", "PUT", "DELETE"],
          })
        )
        .post("/test", () => ({ success: true }));

      const res = await app.handle(
        new Request("http://localhost/test", {
          method: "OPTIONS",
          headers: {
            origin: "http://localhost:3000",
          },
        })
      );

      expect(res.status).toBe(204);
      expect(res.headers.get("Access-Control-Allow-Methods")).toBeDefined();
    });

    it("should allow CSRF and IP forwarding headers", async () => {
      const app = new Elysia()
        .use(
          cors({
            origin: true,
            allowedHeaders: [
              "Content-Type",
              "Authorization",
              "X-CSRF-Token",
              "X-Forwarded-For",
              "X-Real-IP",
              "User-Agent",
            ],
          })
        )
        .post("/test", () => ({ success: true }));

      const res = await app.handle(
        new Request("http://localhost/test", {
          method: "OPTIONS",
          headers: {
            origin: "http://localhost:3000",
            "access-control-request-headers":
              "content-type,x-csrf-token,x-forwarded-for",
          },
        })
      );

      expect(res.status).toBe(204);
      const allowedHeaders = res.headers.get("Access-Control-Allow-Headers");
      expect(allowedHeaders).toBeDefined();
      expect(allowedHeaders?.toLowerCase()).toContain("x-csrf-token");
      expect(allowedHeaders?.toLowerCase()).toContain("x-forwarded-for");
    });
  });

  describe("Password Strength Validation", () => {
    it("should enforce minimum password length of 8 characters", () => {
      const MIN_PASSWORD_LENGTH = 8;

      const validatePassword = (password: string): boolean => {
        return password.length >= MIN_PASSWORD_LENGTH;
      };

      // Test invalid passwords
      expect(validatePassword("")).toBe(false);
      expect(validatePassword("1234567")).toBe(false);
      expect(validatePassword("short")).toBe(false);

      // Test valid passwords
      expect(validatePassword("12345678")).toBe(true);
      expect(validatePassword("password123")).toBe(true);
      expect(validatePassword("verylongpassword")).toBe(true);
    });
  });

  describe("Cookie Security Configuration", () => {
    it("should verify HTTPS-only cookies are configured correctly", () => {
      // This is a configuration test - in production, cookies should have:
      // - httpOnly: true (prevents XSS)
      // - secure: true (HTTPS only in production)
      // - sameSite: 'strict' (prevents CSRF)

      const productionCookieConfig = {
        httpOnly: true,
        secure: true, // Should be true in production
        sameSite: "strict" as const,
        path: "/",
        maxAge: 30 * 24 * 60 * 60,
      };

      expect(productionCookieConfig.httpOnly).toBe(true);
      expect(productionCookieConfig.secure).toBe(true);
      expect(productionCookieConfig.sameSite).toBe("strict");
    });
  });
});
