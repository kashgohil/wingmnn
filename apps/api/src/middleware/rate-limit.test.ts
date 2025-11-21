import { beforeEach, describe, expect, it } from "bun:test";
import { rateLimit } from "./rate-limit";

describe("Rate Limiting Middleware", () => {
  beforeEach(() => {
    // Clear rate limit store between tests
    // Note: In a real implementation, we'd expose a method to clear the store
  });

  it("should allow requests within rate limit", () => {
    const middleware = rateLimit({
      max: 5,
      window: "15m",
      endpoint: "test",
    });

    const mockRequest = {
      headers: {
        get: (name: string) => {
          if (name === "x-forwarded-for") return "192.168.1.1";
          return null;
        },
      },
    };

    const mockSet = {
      status: 200,
      headers: {} as Record<string, string>,
    };

    const context = {
      request: mockRequest,
      set: mockSet,
    };

    // First request should succeed
    const result = middleware(context);
    expect(result).toBeUndefined();
    expect(mockSet.headers["X-RateLimit-Limit"]).toBe("5");
    expect(mockSet.headers["X-RateLimit-Remaining"]).toBe("4");
  });

  it("should block requests exceeding rate limit", () => {
    const middleware = rateLimit({
      max: 2,
      window: "15m",
      endpoint: "test-block",
    });

    const mockRequest = {
      headers: {
        get: (name: string) => {
          if (name === "x-forwarded-for") return "192.168.1.2";
          return null;
        },
      },
    };

    const mockSet = {
      status: 200,
      headers: {} as Record<string, string>,
    };

    const context = {
      request: mockRequest,
      set: mockSet,
    };

    // First two requests should succeed
    middleware(context);
    middleware(context);

    // Third request should be blocked
    const result = middleware(context);
    expect(result).toBeDefined();
    expect((result as any).error).toBe("RATE_LIMIT_EXCEEDED");
    expect(mockSet.status).toBe(429);
    expect(mockSet.headers["X-RateLimit-Remaining"]).toBe("0");
  });

  it("should use IP address as default identifier", () => {
    const middleware = rateLimit({
      max: 3,
      window: "15m",
      endpoint: "test-ip",
    });

    const mockRequest1 = {
      headers: {
        get: (name: string) => {
          if (name === "x-forwarded-for") return "192.168.1.3";
          return null;
        },
      },
    };

    const mockRequest2 = {
      headers: {
        get: (name: string) => {
          if (name === "x-forwarded-for") return "192.168.1.4";
          return null;
        },
      },
    };

    const mockSet = {
      status: 200,
      headers: {} as Record<string, string>,
    };

    // Different IPs should have separate rate limits
    middleware({ request: mockRequest1, set: mockSet });
    middleware({ request: mockRequest1, set: mockSet });
    middleware({ request: mockRequest1, set: mockSet });

    // Fourth request from same IP should be blocked
    const result1 = middleware({ request: mockRequest1, set: mockSet });
    expect(result1).toBeDefined();
    expect((result1 as any).error).toBe("RATE_LIMIT_EXCEEDED");

    // But first request from different IP should succeed
    const result2 = middleware({ request: mockRequest2, set: mockSet });
    expect(result2).toBeUndefined();
  });
});
