/**
 * Auth Context
 *
 * Provides authentication state and actions throughout the application.
 * Handles login, registration, logout, and automatic session restoration.
 * Uses TanStack Query for efficient data fetching and caching.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { catchError } from "@wingmnn/utils/catch-error";
import type { ReactNode } from "react";
import React, { createContext, useContext, useState } from "react";
import { api } from "../eden-client";
import { tokenManager } from "./token-manager";

// User interface matching backend response
export interface User {
  id: string;
  email: string;
  name: string;
}

// Auth context value interface
export interface AuthContextValue {
  // State
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  error: string | null;

  // Actions
  login(email: string, password: string): Promise<void>;
  register(email: string, password: string, name: string): Promise<void>;
  logout(): Promise<void>;
  clearError(): void;
}

// Create context
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Hook for using auth context
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

// Auth Provider Props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth Provider Component
export function AuthProvider({ children }: AuthProviderProps) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  /**
   * Query to verify current authentication status
   * Runs on mount and can be manually refetched
   *
   * This query handles automatic token refresh by making an API request
   * even when the access token is expired. The backend will use the
   * refresh token cookie to issue a new access token via X-Access-Token header.
   */
  const { data: user, isLoading } = useQuery({
    queryKey: ["auth", "user"],
    queryFn: async () => {
      const token = tokenManager.getAccessToken();
      const storedUser = tokenManager.getUserData();

      // If no token at all, check if we might have a refresh token cookie
      // by making a request anyway - the backend will refresh if possible
      if (!token) {
        // Try to verify with backend using refresh token cookie
        const [response, responseError] = await catchError(
          api.auth.sessions.get()
        );

        if (responseError || response?.error) {
          // No valid session
          return null;
        }

        // Backend refreshed the token via X-Access-Token header
        // The Eden client onResponse interceptor already stored it
        const newToken = tokenManager.getAccessToken();
        if (newToken && storedUser) {
          return storedUser;
        }

        return null;
      }

      // If token is expired, don't clear it yet - make a request to trigger refresh
      // The backend will automatically refresh using the refresh token cookie
      // and send a new access token in the X-Access-Token header

      // Verify token with backend (will trigger refresh if expired)
      const [response, responseError] = await catchError(
        api.auth.sessions.get()
      );

      if (responseError || response?.error) {
        // Token refresh failed or no valid session
        tokenManager.clearAccessToken();
        return null;
      }

      // If we have stored user data, return it
      if (storedUser) {
        return storedUser;
      }

      // If no stored user data but token is valid, decode token for basic info
      const currentToken = tokenManager.getAccessToken();
      if (currentToken) {
        const payload = tokenManager.decodeToken(currentToken);
        if (payload) {
          return {
            id: payload.userId,
            email: "", // Will be empty until we fetch from API
            name: "", // Will be empty until we fetch from API
          } as User;
        }
      }

      return null;
    },
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    retry: false, // Don't retry failed auth checks
  });

  /**
   * Login mutation
   */
  const loginMutation = useMutation({
    mutationFn: async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) => {
      const response = await api.auth.login.post({ email, password });

      if (response.error || !response.data) {
        const errorMessage = response.error
          ? (response.error as any).message || "Invalid email or password"
          : "No data received from server";
        throw new Error(errorMessage);
      }

      return response.data as {
        accessToken: string;
        user: User;
        expiresIn: number;
      };
    },
    onSuccess: (data: {
      accessToken: string;
      user: User;
      expiresIn: number;
    }) => {
      tokenManager.setAccessToken(data.accessToken);
      tokenManager.setUserData(data.user);
      queryClient.setQueryData(["auth", "user"], data.user);
      setError(null);
    },
    onError: (error: Error) => {
      setError(error.message || "Login failed");
    },
  });

  /**
   * Register mutation
   */
  const registerMutation = useMutation({
    mutationFn: async ({
      email,
      password,
      name,
    }: {
      email: string;
      password: string;
      name: string;
    }) => {
      const response = await api.auth.register.post({ email, password, name });

      if (response.error || !response.data) {
        const errorMessage = response.error
          ? (response.error as any).message || "Registration failed"
          : "No data received from server";
        throw new Error(errorMessage);
      }

      return response.data as {
        accessToken: string;
        user: User;
        expiresIn: number;
      };
    },
    onSuccess: (data: {
      accessToken: string;
      user: User;
      expiresIn: number;
    }) => {
      tokenManager.setAccessToken(data.accessToken);
      tokenManager.setUserData(data.user);
      queryClient.setQueryData(["auth", "user"], data.user);
      setError(null);
    },
    onError: (error: Error) => {
      setError(error.message || "Registration failed");
    },
  });

  /**
   * Logout mutation
   */
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const [, error] = await catchError(api.auth.logout.post());
      if (error) {
        // Continue with logout even if API call fails
        console.error("Logout API call failed:", error);
      }
    },
    onSettled: () => {
      // Always clear local state regardless of API success
      tokenManager.clearAccessToken();
      queryClient.setQueryData(["auth", "user"], null);
      queryClient.invalidateQueries({ queryKey: ["auth"] });
      setError(null);
    },
  });

  /**
   * Wrapper functions for mutations
   */
  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  const login = React.useCallback(
    async (email: string, password: string) => {
      clearError();
      await loginMutation.mutateAsync({ email, password });

      // Handle redirect to intended destination after successful login
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const redirectTo = params.get("redirect");

        if (redirectTo) {
          // Navigate to intended destination using TanStack Router
          navigate({ to: redirectTo });
        }
      }
    },
    [clearError, loginMutation, navigate]
  );

  const register = React.useCallback(
    async (email: string, password: string, name: string) => {
      clearError();
      await registerMutation.mutateAsync({ email, password, name });

      // Handle redirect to intended destination after successful registration
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const redirectTo = params.get("redirect");

        if (redirectTo) {
          // Navigate to intended destination using TanStack Router
          navigate({ to: redirectTo });
        }
      }
    },
    [clearError, registerMutation, navigate]
  );

  const value: AuthContextValue = {
    isAuthenticated: !!user,
    isLoading:
      isLoading ||
      loginMutation.isPending ||
      registerMutation.isPending ||
      logoutMutation.isPending,
    user: user || null,
    error,
    login,
    register,
    logout: logoutMutation.mutateAsync,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
