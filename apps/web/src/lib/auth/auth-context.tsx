/**
 * Auth Context
 *
 * Provides authentication state and actions throughout the application.
 * Handles login, registration, logout, and automatic session restoration.
 */

import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../eden-client";
import { tokenManager } from "./token-manager";

// User interface matching backend response
export interface User {
  id: string;
  email: string;
  name: string;
}

// Auth state interface
interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  error: string | null;
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
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    error: null,
  });

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  /**
   * Initialize authentication state by checking for stored token
   * and verifying it with the backend
   */
  async function initializeAuth() {
    const token = tokenManager.getAccessToken();

    if (!token) {
      setState((prev) => ({ ...prev, isLoading: false }));
      return;
    }

    // Check if token is expired
    if (tokenManager.isTokenExpired(token)) {
      tokenManager.clearAccessToken();
      setState((prev) => ({ ...prev, isLoading: false }));
      return;
    }

    // Verify token with backend by making an authenticated request
    try {
      const response = await api.auth.sessions.get();

      if (response.error) {
        throw new Error("Token verification failed");
      }

      // Token is valid, decode it to get user info
      const payload = tokenManager.decodeToken(token);
      if (payload) {
        setState({
          isAuthenticated: true,
          isLoading: false,
          user: {
            id: payload.userId,
            email: "", // Will be populated from API if needed
            name: "", // Will be populated from API if needed
          },
          error: null,
        });
      } else {
        // Token couldn't be decoded
        tokenManager.clearAccessToken();
        setState({
          isAuthenticated: false,
          isLoading: false,
          user: null,
          error: null,
        });
      }
    } catch (error) {
      // Token is invalid, clear it
      tokenManager.clearAccessToken();
      setState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        error: null,
      });
    }
  }

  /**
   * Login with email and password
   * @param email User's email address
   * @param password User's password
   */
  async function login(email: string, password: string) {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await api.auth.login.post({ email, password });

      if (response.error || !response.data) {
        const errorMessage = response.error
          ? (response.error as any).message || "Invalid email or password"
          : "No data received from server";
        throw new Error(errorMessage);
      }

      // Type narrowing: at this point we know response.data exists
      const data = response.data as {
        accessToken: string;
        user: User;
        expiresIn: number;
      };
      tokenManager.setAccessToken(data.accessToken);

      setState({
        isAuthenticated: true,
        isLoading: false,
        user: data.user,
        error: null,
      });
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error.message || "Login failed",
      }));
      throw error;
    }
  }

  /**
   * Register a new user with email and password
   * @param email User's email address
   * @param password User's password
   * @param name User's full name
   */
  async function register(email: string, password: string, name: string) {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await api.auth.register.post({
        email,
        password,
        name,
      });

      if (response.error || !response.data) {
        const errorMessage = response.error
          ? (response.error as any).message || "Registration failed"
          : "No data received from server";
        throw new Error(errorMessage);
      }

      // Type narrowing: at this point we know response.data exists
      const data = response.data as {
        accessToken: string;
        user: User;
        expiresIn: number;
      };
      tokenManager.setAccessToken(data.accessToken);

      setState({
        isAuthenticated: true,
        isLoading: false,
        user: data.user,
        error: null,
      });
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error.message || "Registration failed",
      }));
      throw error;
    }
  }

  /**
   * Logout the current user
   * Clears authentication state even if API call fails
   */
  async function logout() {
    try {
      await api.auth.logout.post();
    } catch (error) {
      // Continue with logout even if API call fails
      console.error("Logout API call failed:", error);
    } finally {
      tokenManager.clearAccessToken();
      setState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        error: null,
      });
    }
  }

  /**
   * Clear any error messages
   */
  function clearError() {
    setState((prev) => ({ ...prev, error: null }));
  }

  const value: AuthContextValue = {
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    user: state.user,
    error: state.error,
    login,
    register,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
