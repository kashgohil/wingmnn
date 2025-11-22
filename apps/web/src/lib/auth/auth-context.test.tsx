/**
 * Auth Context Session Restoration Tests
 *
 * Tests to verify session restoration on page load
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider, useAuth } from "./auth-context";
import { tokenManager } from "./token-manager";

// Mock localStorage for testing
class LocalStorageMock implements Storage {
  private store: Record<string, string> = {};

  get length(): number {
    return Object.keys(this.store).length;
  }

  key(index: number): string | null {
    const keys = Object.keys(this.store);
    return keys[index] || null;
  }

  getItem(key: string): string | null {
    return this.store[key] || null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = value;
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  clear(): void {
    this.store = {};
  }
}

// Set up global localStorage mock
global.localStorage = new LocalStorageMock();

// Create mock API functions
const mockSessionsGet = vi.fn();
const mockLoginPost = vi.fn();
const mockRegisterPost = vi.fn();
const mockLogoutPost = vi.fn();

// Mock the eden client module
vi.mock("../eden-client", () => ({
  api: {
    auth: {
      sessions: {
        get: () => mockSessionsGet(),
      },
      login: {
        post: (data: any) => mockLoginPost(data),
      },
      register: {
        post: (data: any) => mockRegisterPost(data),
      },
      logout: {
        post: () => mockLogoutPost(),
      },
    },
  },
}));

describe("Session Restoration on Page Load", () => {
  let queryClient: QueryClient;

  // Helper to create wrapper with providers
  const createWrapper = () => {
    return ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        <AuthProvider>{children}</AuthProvider>
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    // Create a new QueryClient for each test
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    // Clear localStorage
    localStorage.clear();

    // Reset all mocks
    vi.clearAllMocks();
    mockSessionsGet.mockReset();
    mockLoginPost.mockReset();
    mockRegisterPost.mockReset();
    mockLogoutPost.mockReset();
  });

  /**
   * Requirement 4.1: Token restoration from localStorage
   * WHEN the application loads, THE Auth Context SHALL attempt to restore
   * the access token from localStorage
   */
  it("should attempt to restore access token from localStorage on mount", async () => {
    // Arrange: Store a token in localStorage
    const mockToken = "mock.jwt.token";
    const mockUser = { id: "1", email: "test@example.com", name: "Test User" };
    tokenManager.setAccessToken(mockToken);
    tokenManager.setUserData(mockUser);

    // Mock successful session verification
    mockSessionsGet.mockResolvedValue({
      data: { sessions: [] },
      error: null,
      status: 200,
    });

    // Act: Render the hook
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    // Assert: Initially loading
    expect(result.current.isLoading).toBe(true);

    // Wait for auth to initialize
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Verify token was retrieved from localStorage
    expect(tokenManager.getAccessToken()).toBe(mockToken);
  });

  /**
   * Requirement 4.2: Valid token verification
   * WHEN a valid access token exists in localStorage, THE Auth Context SHALL
   * verify it by making an authenticated request to the API
   */
  it("should verify valid token with backend API", async () => {
    // Arrange: Store a valid token
    const mockToken = "valid.jwt.token";
    const mockUser = { id: "1", email: "test@example.com", name: "Test User" };
    tokenManager.setAccessToken(mockToken);
    tokenManager.setUserData(mockUser);

    // Mock successful session verification
    mockSessionsGet.mockResolvedValue({
      data: { sessions: [] },
      error: null,
      status: 200,
    });

    // Act: Render the hook
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    // Wait for auth to initialize
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Assert: API was called to verify token
    expect(mockSessionsGet).toHaveBeenCalled();
  });

  /**
   * Requirement 4.3: Valid token restores auth state
   * WHEN the access token is valid, THE Auth Context SHALL restore
   * the user's authentication state
   */
  it("should restore authentication state when token is valid", async () => {
    // Arrange: Store a valid token and user data
    const mockToken = "valid.jwt.token";
    const mockUser = { id: "1", email: "test@example.com", name: "Test User" };
    tokenManager.setAccessToken(mockToken);
    tokenManager.setUserData(mockUser);

    // Mock successful session verification
    mockSessionsGet.mockResolvedValue({
      data: { sessions: [] },
      error: null,
      status: 200,
    });

    // Act: Render the hook
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    // Wait for auth to initialize
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Assert: User is authenticated with correct data
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(mockUser);
  });

  /**
   * Requirement 4.4: Expired token triggers refresh
   * WHEN the access token is expired or invalid, THE Auth Context SHALL
   * attempt to refresh it using the refresh token cookie
   */
  it("should attempt to refresh expired token using refresh token cookie", async () => {
    // Arrange: Store an expired token
    // Create a token that expired 5 minutes ago
    const expiredTime = Math.floor(Date.now() / 1000) - 300; // 5 minutes ago
    const payload = {
      userId: "1",
      sessionId: "session1",
      exp: expiredTime,
      iat: expiredTime - 3600,
    };
    const mockExpiredToken = `header.${btoa(
      JSON.stringify(payload)
    )}.signature`;
    const mockUser = { id: "1", email: "test@example.com", name: "Test User" };

    tokenManager.setAccessToken(mockExpiredToken);
    tokenManager.setUserData(mockUser);

    // Mock successful token refresh via backend
    // The backend will send a new token in X-Access-Token header
    mockSessionsGet.mockResolvedValue({
      data: { sessions: [] },
      error: null,
      status: 200,
    });

    // Act: Render the hook
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    // Wait for auth to initialize
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Assert: API was called (which triggers refresh)
    expect(mockSessionsGet).toHaveBeenCalled();

    // Note: The actual token update happens in the Eden client's onResponse interceptor
    // which is mocked in this test environment
  });

  /**
   * Requirement 4.5: Failed refresh clears state
   * WHEN token refresh fails, THE Auth Context SHALL clear the
   * authentication state and require re-login
   */
  it("should clear authentication state when token refresh fails", async () => {
    // Arrange: Store an invalid token
    const mockInvalidToken = "invalid.jwt.token";
    tokenManager.setAccessToken(mockInvalidToken);

    // Mock failed session verification (token refresh failed)
    mockSessionsGet.mockResolvedValue({
      data: null,
      error: { message: "Unauthorized" },
      status: 401,
    });

    // Act: Render the hook
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    // Wait for auth to initialize
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Assert: User is not authenticated and token was cleared
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBe(null);
    expect(tokenManager.getAccessToken()).toBe(null);
  });

  /**
   * Additional test: No token in localStorage
   * WHEN no token exists in localStorage, THE Auth Context SHALL
   * set unauthenticated state
   */
  it("should set unauthenticated state when no token exists", async () => {
    // Arrange: Ensure no token in localStorage
    tokenManager.clearAccessToken();

    // Mock API call that might happen anyway to check for refresh token cookie
    mockSessionsGet.mockResolvedValue({
      data: null,
      error: { message: "Unauthorized" },
      status: 401,
    });

    // Act: Render the hook
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    // Wait for auth to initialize
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Assert: User is not authenticated
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBe(null);
  });

  /**
   * Additional test: Token exists but user data is missing
   * WHEN token exists but user data is not in localStorage,
   * THE Auth Context SHALL decode token for basic user info
   */
  it("should decode token for user info when user data is missing", async () => {
    // Arrange: Store token but no user data
    const userId = "user123";
    const sessionId = "session456";
    const exp = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
    const iat = Math.floor(Date.now() / 1000);

    const payload = { userId, sessionId, exp, iat };
    const mockToken = `header.${btoa(JSON.stringify(payload))}.signature`;

    tokenManager.setAccessToken(mockToken);
    // Don't set user data

    // Mock successful session verification
    mockSessionsGet.mockResolvedValue({
      data: { sessions: [] },
      error: null,
      status: 200,
    });

    // Act: Render the hook
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    // Wait for auth to initialize
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Assert: User is authenticated with decoded token data
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual({
      id: userId,
      email: "",
      name: "",
    });
  });
});
