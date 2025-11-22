/**
 * Token Refresh Integration Tests
 *
 * Tests for automatic token refresh functionality including:
 * - Token updates from API responses
 * - localStorage synchronization
 * - Complete request/response flow
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock localStorage before importing tokenManager
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(globalThis, "localStorage", {
  value: localStorageMock,
  writable: true,
  configurable: true,
});

// Mock the @elysiajs/eden treaty function
const mockTreaty = vi.fn();
vi.mock("@elysiajs/eden", () => ({
  treaty: mockTreaty,
}));

// Mock the types package
vi.mock("@wingmnn/types", () => ({
  App: {},
}));

// Import after mocks are set up
import { tokenManager } from "./token-manager";

describe("Automatic Token Refresh Integration", () => {
  let capturedConfig: any;
  let onRequestHandler: any;
  let onResponseHandler: any;

  beforeEach(async () => {
    // Clear localStorage before each test
    localStorageMock.clear();

    // Clear all mocks
    vi.clearAllMocks();

    // Capture the configuration passed to treaty
    mockTreaty.mockImplementation((baseURL: string, config: any) => {
      capturedConfig = { baseURL, ...config };
      onRequestHandler = config.onRequest;
      onResponseHandler = config.onResponse;
      return {}; // Return mock client
    });

    // Reset environment variable
    import.meta.env.VITE_API_BASE_URL = undefined;

    // Import the eden client to set up handlers
    await import("../eden-client");
  });

  describe("Token Update from Response Headers", () => {
    it("should store new token from X-Access-Token header in localStorage", () => {
      const newToken = "new-access-token-123";
      const mockResponse = {
        headers: {
          get: vi.fn((headerName: string) => {
            if (headerName === "X-Access-Token") {
              return newToken;
            }
            return null;
          }),
        },
      };

      // Verify no token initially
      expect(tokenManager.getAccessToken()).toBeNull();

      // Process response
      onResponseHandler(mockResponse);

      // Verify token is stored in localStorage
      expect(tokenManager.getAccessToken()).toBe(newToken);
      expect(localStorageMock.getItem("access_token")).toBe(newToken);
    });

    it("should update existing token in localStorage when new token is received", () => {
      const oldToken = "old-token-456";
      const newToken = "new-token-789";

      // Set initial token
      tokenManager.setAccessToken(oldToken);
      expect(tokenManager.getAccessToken()).toBe(oldToken);

      // Simulate response with new token
      const mockResponse = {
        headers: {
          get: vi.fn((headerName: string) => {
            if (headerName === "X-Access-Token") {
              return newToken;
            }
            return null;
          }),
        },
      };

      onResponseHandler(mockResponse);

      // Verify token is updated
      expect(tokenManager.getAccessToken()).toBe(newToken);
      expect(localStorageMock.getItem("access_token")).toBe(newToken);
      expect(tokenManager.getAccessToken()).not.toBe(oldToken);
    });

    it("should not modify localStorage when no X-Access-Token header is present", () => {
      const existingToken = "existing-token-abc";

      // Set initial token
      tokenManager.setAccessToken(existingToken);

      // Simulate response without new token
      const mockResponse = {
        headers: {
          get: vi.fn(() => null),
        },
      };

      onResponseHandler(mockResponse);

      // Verify token remains unchanged
      expect(tokenManager.getAccessToken()).toBe(existingToken);
      expect(localStorageMock.getItem("access_token")).toBe(existingToken);
    });
  });

  describe("Complete Request/Response Flow with Token Refresh", () => {
    it("should use current token for request and update with new token from response", () => {
      const currentToken = "current-token-request";
      const refreshedToken = "refreshed-token-response";

      // Set initial token
      tokenManager.setAccessToken(currentToken);

      // Simulate request
      const requestOptions = { headers: {} };
      const modifiedRequest = onRequestHandler(
        "/api/protected",
        requestOptions
      );

      // Verify current token is used in request
      expect(modifiedRequest.headers.Authorization).toBe(
        `Bearer ${currentToken}`
      );

      // Simulate response with refreshed token
      const mockResponse = {
        headers: {
          get: vi.fn((headerName: string) => {
            if (headerName === "X-Access-Token") {
              return refreshedToken;
            }
            return null;
          }),
        },
        status: 200,
        ok: true,
      };

      onResponseHandler(mockResponse);

      // Verify token is updated in localStorage
      expect(tokenManager.getAccessToken()).toBe(refreshedToken);
      expect(localStorageMock.getItem("access_token")).toBe(refreshedToken);
    });

    it("should handle token refresh on 401 response", () => {
      const expiredToken = "expired-token";
      const newToken = "new-valid-token";

      // Set expired token
      tokenManager.setAccessToken(expiredToken);

      // Simulate request with expired token
      const requestOptions = { headers: {} };
      const modifiedRequest = onRequestHandler("/api/data", requestOptions);

      expect(modifiedRequest.headers.Authorization).toBe(
        `Bearer ${expiredToken}`
      );

      // Simulate 401 response with new token (backend refreshed it)
      const mockResponse = {
        headers: {
          get: vi.fn((headerName: string) => {
            if (headerName === "X-Access-Token") {
              return newToken;
            }
            return null;
          }),
        },
        status: 401,
        ok: false,
      };

      onResponseHandler(mockResponse);

      // Verify new token is stored
      expect(tokenManager.getAccessToken()).toBe(newToken);
      expect(localStorageMock.getItem("access_token")).toBe(newToken);
    });

    it("should handle multiple sequential requests with token updates", () => {
      const tokens = ["token-1", "token-2", "token-3"];

      // First request
      tokenManager.setAccessToken(tokens[0]);
      let requestOptions = { headers: {} };
      let modifiedRequest = onRequestHandler("/api/endpoint1", requestOptions);
      expect(modifiedRequest.headers.Authorization).toBe(`Bearer ${tokens[0]}`);

      // First response updates token
      let mockResponse = {
        headers: {
          get: vi.fn((headerName: string) => {
            if (headerName === "X-Access-Token") {
              return tokens[1];
            }
            return null;
          }),
        },
      };
      onResponseHandler(mockResponse);
      expect(tokenManager.getAccessToken()).toBe(tokens[1]);

      // Second request uses updated token
      requestOptions = { headers: {} };
      modifiedRequest = onRequestHandler("/api/endpoint2", requestOptions);
      expect(modifiedRequest.headers.Authorization).toBe(`Bearer ${tokens[1]}`);

      // Second response updates token again
      mockResponse = {
        headers: {
          get: vi.fn((headerName: string) => {
            if (headerName === "X-Access-Token") {
              return tokens[2];
            }
            return null;
          }),
        },
      };
      onResponseHandler(mockResponse);
      expect(tokenManager.getAccessToken()).toBe(tokens[2]);
    });

    it("should handle login flow where initial request has no token but response provides one", () => {
      // No token initially (user not logged in)
      expect(tokenManager.getAccessToken()).toBeNull();

      // Login request without token
      const requestOptions = { headers: {} };
      const modifiedRequest = onRequestHandler("/auth/login", requestOptions);

      expect(modifiedRequest.headers.Authorization).toBeUndefined();

      // Login response provides token
      const loginToken = "new-login-token";
      const mockResponse = {
        headers: {
          get: vi.fn((headerName: string) => {
            if (headerName === "X-Access-Token") {
              return loginToken;
            }
            return null;
          }),
        },
        status: 200,
        ok: true,
      };

      onResponseHandler(mockResponse);

      // Verify token is now stored
      expect(tokenManager.getAccessToken()).toBe(loginToken);
      expect(localStorageMock.getItem("access_token")).toBe(loginToken);

      // Subsequent request should use the new token
      const nextRequestOptions = { headers: {} };
      const nextModifiedRequest = onRequestHandler(
        "/api/user",
        nextRequestOptions
      );

      expect(nextModifiedRequest.headers.Authorization).toBe(
        `Bearer ${loginToken}`
      );
    });
  });

  describe("Token Persistence Across Page Loads", () => {
    it("should persist token in localStorage for retrieval after page reload", () => {
      const token = "persistent-token";

      // Simulate receiving token from API
      const mockResponse = {
        headers: {
          get: vi.fn((headerName: string) => {
            if (headerName === "X-Access-Token") {
              return token;
            }
            return null;
          }),
        },
      };

      onResponseHandler(mockResponse);

      // Verify token is in localStorage
      expect(localStorageMock.getItem("access_token")).toBe(token);

      // Simulate page reload by getting token from localStorage
      const retrievedToken = tokenManager.getAccessToken();
      expect(retrievedToken).toBe(token);

      // Verify token can be used in subsequent requests
      const requestOptions = { headers: {} };
      const modifiedRequest = onRequestHandler("/api/data", requestOptions);

      expect(modifiedRequest.headers.Authorization).toBe(`Bearer ${token}`);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty string token in response header", () => {
      const existingToken = "existing-token";
      tokenManager.setAccessToken(existingToken);

      const mockResponse = {
        headers: {
          get: vi.fn((headerName: string) => {
            if (headerName === "X-Access-Token") {
              return "";
            }
            return null;
          }),
        },
      };

      onResponseHandler(mockResponse);

      // Token should remain unchanged
      expect(tokenManager.getAccessToken()).toBe(existingToken);
    });

    it("should handle response with null headers.get method", () => {
      const existingToken = "existing-token";
      tokenManager.setAccessToken(existingToken);

      const mockResponse = {
        headers: {
          get: vi.fn(() => null),
        },
      };

      onResponseHandler(mockResponse);

      // Should not throw error and token should remain unchanged
      expect(tokenManager.getAccessToken()).toBe(existingToken);
    });

    it("should handle concurrent responses with different tokens", () => {
      const token1 = "token-from-response-1";
      const token2 = "token-from-response-2";

      // Simulate first response
      const mockResponse1 = {
        headers: {
          get: vi.fn((headerName: string) => {
            if (headerName === "X-Access-Token") {
              return token1;
            }
            return null;
          }),
        },
      };

      onResponseHandler(mockResponse1);
      expect(tokenManager.getAccessToken()).toBe(token1);

      // Simulate second response (could arrive out of order)
      const mockResponse2 = {
        headers: {
          get: vi.fn((headerName: string) => {
            if (headerName === "X-Access-Token") {
              return token2;
            }
            return null;
          }),
        },
      };

      onResponseHandler(mockResponse2);

      // Last response wins
      expect(tokenManager.getAccessToken()).toBe(token2);
    });
  });
});
