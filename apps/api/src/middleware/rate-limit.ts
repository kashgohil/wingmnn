/**
 * Rate Limiting Middleware
 * Implements in-memory rate limiting for authentication endpoints
 * In production, this should be replaced with Redis-based rate limiting
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

/**
 * In-memory store for rate limiting
 * Key format: "endpoint:identifier" (e.g., "login:192.168.1.1")
 */
const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Clean up expired rate limit entries every 5 minutes
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Parse time window string to milliseconds
 * Supports formats like "15m", "1h", "30s"
 */
function parseTimeWindow(window: string): number {
  const match = window.match(/^(\d+)([smh])$/);
  if (!match) {
    throw new Error(`Invalid time window format: ${window}`);
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case "s":
      return value * 1000;
    case "m":
      return value * 60 * 1000;
    case "h":
      return value * 60 * 60 * 1000;
    default:
      throw new Error(`Invalid time unit: ${unit}`);
  }
}

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  /** Maximum number of requests allowed in the time window */
  max: number;
  /** Time window (e.g., "15m", "1h", "30s") */
  window: string;
  /** Endpoint identifier for rate limiting */
  endpoint: string;
  /** Custom identifier function (defaults to IP address) */
  identifier?: (request: Request) => string;
}

/**
 * Create a rate limiting middleware
 * @param config - Rate limit configuration
 * @returns Elysia middleware function
 */
export function rateLimit(config: RateLimitConfig) {
  const windowMs = parseTimeWindow(config.window);

  return ({ request, set }: any) => {
    // Get identifier (IP address by default)
    const identifier = config.identifier
      ? config.identifier(request)
      : request.headers.get("x-forwarded-for") ||
        request.headers.get("x-real-ip") ||
        "unknown";

    // Create rate limit key
    const key = `${config.endpoint}:${identifier}`;

    // Get or create rate limit entry
    const now = Date.now();
    let entry = rateLimitStore.get(key);

    if (!entry || now > entry.resetAt) {
      // Create new entry
      entry = {
        count: 1,
        resetAt: now + windowMs,
      };
      rateLimitStore.set(key, entry);
    } else {
      // Increment count
      entry.count++;
    }

    // Check if rate limit exceeded
    if (entry.count > config.max) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);

      set.status = 429;
      set.headers["Retry-After"] = retryAfter.toString();
      set.headers["X-RateLimit-Limit"] = config.max.toString();
      set.headers["X-RateLimit-Remaining"] = "0";
      set.headers["X-RateLimit-Reset"] = entry.resetAt.toString();

      return {
        error: "RATE_LIMIT_EXCEEDED",
        message: `Too many requests. Please try again in ${retryAfter} seconds.`,
        retryAfter,
      };
    }

    // Set rate limit headers
    set.headers["X-RateLimit-Limit"] = config.max.toString();
    set.headers["X-RateLimit-Remaining"] = (
      config.max - entry.count
    ).toString();
    set.headers["X-RateLimit-Reset"] = entry.resetAt.toString();
  };
}

/**
 * Create a user-based rate limiter (uses userId instead of IP)
 * @param config - Rate limit configuration
 * @returns Elysia middleware function
 */
export function userRateLimit(config: Omit<RateLimitConfig, "identifier">) {
  return rateLimit({
    ...config,
    identifier: (request: Request) => {
      // Extract userId from Authorization header
      const authHeader = request.headers.get("authorization");
      if (!authHeader) return "anonymous";

      // Parse JWT to get userId (simplified - in production use proper JWT verification)
      try {
        const token = authHeader.replace("Bearer ", "");
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.userId || "anonymous";
      } catch {
        return "anonymous";
      }
    },
  });
}
