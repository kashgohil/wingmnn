/**
 * Elysia Eden Client
 *
 * Type-safe API client configured with authentication interceptors.
 * Automatically handles:
 * - Adding Authorization headers to requests
 * - Extracting and storing new access tokens from responses
 * - Including credentials for cookie-based refresh tokens
 */

import { treaty } from "@elysiajs/eden";
import type { App } from "@wingmnn/types";
import { tokenManager } from "./auth/token-manager";

/**
 * Creates a configured Eden client with authentication interceptors
 * @param baseURL The base URL of the API server
 * @returns Configured Eden client with type-safe API methods
 */
const createEdenClient = (baseURL: string) => {
  return treaty<App>(baseURL, {
    fetch: {
      credentials: "include", // Send cookies with requests
    },
    onRequest: (_path, options) => {
      // Add Authorization header if token exists
      const token = tokenManager.getAccessToken();
      if (token) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${token}`,
        };
      }
      return options;
    },
    onResponse: (response) => {
      // Check for new access token in response headers
      const newAccessToken = response.headers.get("X-Access-Token");
      if (newAccessToken) {
        tokenManager.setAccessToken(newAccessToken);
      }

      // Handle rate limiting errors
      if (response.status === 429) {
        console.warn("[API] Rate limit exceeded");
      }

      // Handle authentication errors
      if (response.status === 401) {
        console.warn("[API] Authentication failed - token may be invalid");
      }

      return response;
    },
  });
};

// Export configured client instance
export const api = createEdenClient(
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"
);
