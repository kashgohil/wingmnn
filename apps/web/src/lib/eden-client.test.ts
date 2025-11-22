/**
 * Eden Client Unit Tests
 *
 * Tests for authentication header injection, token updates from response headers,
 * and credentials configuration.
 * Requirements: 10.1, 10.2, 10.3
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { tokenManager } from "./auth/token-manager";

// Mock the token manager
vi.mock("./auth/token-manager", () => ({
  tokenManager: {
    getAccessToken: vi.fn(),
    setAccessToken: vi.fn(),
    clearAccessToken: vi.fn(),
    isTokenExpired: vi.fn(),
    decodeToken: vi.fn(),
  },
}));

// Mock the @elysiajs/eden treaty function
const mockTreaty = vi.fn();
vi.mock("@elysiajs/eden", () => ({
  treaty: mockTreaty,
}));

// Mock the types package
vi.mock("@wingmnn/types", () => ({
  App: {},
}));

describe("Eden Client", () => {
  let capturedConfig: any;
  let onRequestHandler: any;
  let onResponseHandler: any;

  beforeEach(() => {
    // Clear all mocks before each test
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
  });

  describe("Client Configuration", () => {
    it("should configure client with credentials: include", async () => {
      // Import the module to trigger client creation
      await import("./eden-client");

      expect(mockTreaty).toHaveBeenCalled();
      expect(capturedConfig.fetch.credentials).toBe("include");

      // Verify base URL is configured
      const baseURL = capturedConfig.baseURL;
      expect(typeof baseURL).toBe("string");
      expect(baseURL.length).toBeGreaterThan(0);
    });
  });

  describe("Auth Header Injection (onRequest)", () => {
    beforeEach(async () => {
      // Import to set up handlers
      await import("./eden-client");
    });

    it("should add Authorization header when token exists", () => {
      const testToken = "test-access-token";
      (tokenManager.getAccessToken as any).mockReturnValue(testToken);

      const options = {
        headers: {},
      };

      const result = onRequestHandler("/test/path", options);

      expect(tokenManager.getAccessToken).toHaveBeenCalled();
      expect(result.headers.Authorization).toBe(`Bearer ${testToken}`);
    });

    it("should not add Authorization header when token is null", () => {
      (tokenManager.getAccessToken as any).mockReturnValue(null);

      const options = {
        headers: {},
      };

      const result = onRequestHandler("/test/path", options);

      expect(tokenManager.getAccessToken).toHaveBeenCalled();
      expect(result.headers.Authorization).toBeUndefined();
    });

    it("should preserve existing headers when adding Authorization", () => {
      const testToken = "test-access-token";
      (tokenManager.getAccessToken as any).mockReturnValue(testToken);

      const options = {
        headers: {
          "Content-Type": "application/json",
          "X-Custom-Header": "custom-value",
        },
      };

      const result = onRequestHandler("/test/path", options);

      expect(result.headers["Content-Type"]).toBe("application/json");
      expect(result.headers["X-Custom-Header"]).toBe("custom-value");
      expect(result.headers.Authorization).toBe(`Bearer ${testToken}`);
    });

    it("should overwrite existing Authorization header with current token", () => {
      const newToken = "new-access-token";
      (tokenManager.getAccessToken as any).mockReturnValue(newToken);

      const options = {
        headers: {
          Authorization: "Bearer old-token",
        },
      };

      const result = onRequestHandler("/test/path", options);

      expect(result.headers.Authorization).toBe(`Bearer ${newToken}`);
      expect(result.headers.Authorization).not.toContain("old-token");
    });

    it("should handle empty headers object", () => {
      const testToken = "test-access-token";
      (tokenManager.getAccessToken as any).mockReturnValue(testToken);

      const options = {
        headers: {},
      };

      const result = onRequestHandler("/test/path", options);

      expect(result.headers).toBeDefined();
      expect(result.headers.Authorization).toBe(`Bearer ${testToken}`);
    });

    it("should return modified options object", () => {
      (tokenManager.getAccessToken as any).mockReturnValue(null);

      const options = {
        headers: {},
        method: "POST",
        body: { test: "data" },
      };

      const result = onRequestHandler("/test/path", options);

      expect(result).toBe(options);
      expect(result.method).toBe("POST");
      expect(result.body).toEqual({ test: "data" });
    });
  });

  describe("Token Update from Response Headers (onResponse)", () => {
    beforeEach(async () => {
      // Import to set up handlers
      await import("./eden-client");
    });

    it("should extract and store new access token from X-Access-Token header", () => {
      const newToken = "new-access-token-from-response";
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

      const result = onResponseHandler(mockResponse);

      expect(mockResponse.headers.get).toHaveBeenCalledWith("X-Access-Token");
      expect(tokenManager.setAccessToken).toHaveBeenCalledWith(newToken);
      expect(result).toBe(mockResponse);
    });

    it("should not call setAccessToken when X-Access-Token header is missing", () => {
      const mockResponse = {
        headers: {
          get: vi.fn(() => null),
        },
      };

      const result = onResponseHandler(mockResponse);

      expect(mockResponse.headers.get).toHaveBeenCalledWith("X-Access-Token");
      expect(tokenManager.setAccessToken).not.toHaveBeenCalled();
      expect(result).toBe(mockResponse);
    });

    it("should not call setAccessToken when X-Access-Token header is empty string", () => {
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

      expect(mockResponse.headers.get).toHaveBeenCalledWith("X-Access-Token");
      expect(tokenManager.setAccessToken).not.toHaveBeenCalled();
    });

    it("should handle response with multiple headers", () => {
      const newToken = "refreshed-token";
      const mockResponse = {
        headers: {
          get: vi.fn((headerName: string) => {
            const headers: Record<string, string> = {
              "Content-Type": "application/json",
              "X-Access-Token": newToken,
              "X-Custom-Header": "value",
            };
            return headers[headerName] || null;
          }),
        },
      };

      const result = onResponseHandler(mockResponse);

      expect(mockResponse.headers.get).toHaveBeenCalledWith("X-Access-Token");
      expect(tokenManager.setAccessToken).toHaveBeenCalledWith(newToken);
      expect(result).toBe(mockResponse);
    });

    it("should return the response object unchanged", () => {
      const mockResponse = {
        headers: {
          get: vi.fn(() => null),
        },
        status: 200,
        data: { test: "data" },
      };

      const result = onResponseHandler(mockResponse);

      expect(result).toBe(mockResponse);
      expect(result.status).toBe(200);
      expect(result.data).toEqual({ test: "data" });
    });

    it("should handle token update on successful API response", () => {
      const newToken = "jwt.token.signature";
      const mockResponse = {
        headers: {
          get: vi.fn((headerName: string) => {
            if (headerName === "X-Access-Token") {
              return newToken;
            }
            return null;
          }),
        },
        status: 200,
        ok: true,
      };

      onResponseHandler(mockResponse);

      expect(tokenManager.setAccessToken).toHaveBeenCalledWith(newToken);
      expect(tokenManager.setAccessToken).toHaveBeenCalledTimes(1);
    });

    it("should handle token update on error response with new token", () => {
      const newToken = "refreshed-after-error";
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

      // Should still update token even on error response
      expect(tokenManager.setAccessToken).toHaveBeenCalledWith(newToken);
    });
  });

  describe("Integration: Request and Response Flow", () => {
    beforeEach(async () => {
      await import("./eden-client");
    });

    it("should add auth header on request and update token on response", () => {
      const requestToken = "current-token";
      const responseToken = "new-token";

      // Setup: token exists for request
      (tokenManager.getAccessToken as any).mockReturnValue(requestToken);

      // Simulate request
      const requestOptions = { headers: {} };
      const modifiedRequest = onRequestHandler("/api/test", requestOptions);

      expect(modifiedRequest.headers.Authorization).toBe(
        `Bearer ${requestToken}`
      );

      // Simulate response with new token
      const mockResponse = {
        headers: {
          get: vi.fn((headerName: string) => {
            if (headerName === "X-Access-Token") {
              return responseToken;
            }
            return null;
          }),
        },
      };

      onResponseHandler(mockResponse);

      expect(tokenManager.setAccessToken).toHaveBeenCalledWith(responseToken);
    });

    it("should handle unauthenticated request followed by authenticated response", () => {
      // No token initially
      (tokenManager.getAccessToken as any).mockReturnValue(null);

      // Request without token
      const requestOptions = { headers: {} };
      const modifiedRequest = onRequestHandler("/api/login", requestOptions);

      expect(modifiedRequest.headers.Authorization).toBeUndefined();

      // Response provides token (e.g., after login)
      const newToken = "token-after-login";
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

      expect(tokenManager.setAccessToken).toHaveBeenCalledWith(newToken);
    });
  });
});
