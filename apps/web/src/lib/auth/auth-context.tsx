/**
 * Auth Context
 *
 * Provides authentication state and actions throughout the application.
 * Handles login, registration, logout, and automatic session restoration.
 * Uses TanStack Query for efficient data fetching and caching.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import React, { createContext, useContext, useState } from "react";
import { catchError } from "../catch-error";
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
  const [error, setError] = useState<string | null>(null);

  /**
   * Query to verify current authentication status
   * Runs on mount and can be manually refetched
   */
  const { data: user, isLoading } = useQuery({
    queryKey: ["auth", "user"],
    queryFn: async () => {
      const token = tokenManager.getAccessToken();

      if (!token) {
        return null;
      }

      // Check if token is expired
      if (tokenManager.isTokenExpired(token)) {
        tokenManager.clearAccessToken();
        return null;
      }

      // Verify token with backend
      const [response, responseError] = await catchError(
        api.auth.sessions.get()
      );

      if (responseError || response?.error) {
        tokenManager.clearAccessToken();
        return null;
      }

      // Decode token to get user info
      const payload = tokenManager.decodeToken(token);
      if (payload) {
        return {
          id: payload.userId,
          email: "", // Will be populated from API if needed
          name: "", // Will be populated from API if needed
        } as User;
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
    },
    [clearError]
  );

  const register = React.useCallback(
    async (email: string, password: string, name: string) => {
      clearError();
      await registerMutation.mutateAsync({ email, password, name });
    },
    [clearError]
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
