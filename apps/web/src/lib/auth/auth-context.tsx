/**
 * Auth Context
 *
 * Provides authentication state and actions throughout the application.
 * Handles login, registration, logout, and automatic session restoration.
 * Uses TanStack Query for efficient data fetching and caching.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { UserProfile } from "@wingmnn/types";
import { catchError } from "@wingmnn/utils/catch-error";
import type { ReactNode } from "react";
import React, { createContext, useContext, useState } from "react";
import { api } from "../eden-client";
import { navigateWithRedirect } from "./redirect-utils";
import { tokenManager } from "./token-manager";

// Auth context value interface
export interface AuthContextValue {
	// State
	isAuthenticated: boolean;
	isLoading: boolean;
	user: UserProfile | null;
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
			// Try to get current user from /me endpoint
			// This will trigger token refresh if needed via the auth middleware
			const [response, responseError] = await catchError(api.auth.me.get());

			if (responseError || response?.error) {
				// Token refresh failed or no valid session
				tokenManager.clearAccessToken();
				return null;
			}

			// Store user data if we got a valid response
			if (response.data) {
				tokenManager.setUserData(response.data);
				return response.data;
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
			const [response, error] = await catchError(
				api.auth.login.post({ email, password }),
			);

			if (error) {
				// Handle network errors
				if (error.message === "Failed to fetch" || error.name === "TypeError") {
					throw new Error("Network error. Please check your connection.");
				}

				// Re-throw other errors
				throw error;
			}

			if (response.error || !response.data) {
				// Handle API errors with proper error messages
				const error = response.error as any;

				// Check for rate limiting (429)
				if (error?.status === 429) {
					throw new Error("Too many login attempts. Please try again later.");
				}

				// Check for validation errors
				if (error?.status === 400 && error?.message) {
					throw new Error(error.message);
				}

				// Default authentication error
				const errorMessage = error?.message || "Invalid email or password";
				throw new Error(errorMessage);
			}

			return response.data;
		},
		onSuccess: (data) => {
			tokenManager.setAccessToken(data.accessToken);
			tokenManager.setUserData(data.user);
			queryClient.setQueryData(["auth", "user"], data.user);
			setError(null);
			
			// Handle redirect to intended destination after successful login
			// Use setTimeout to ensure state updates have been processed
			setTimeout(() => {
				navigateWithRedirect(navigate);
			}, 0);
		},
		onError: (error: Error) => {
			setError(
				error.message || "An unexpected error occurred. Please try again.",
			);
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
			const [response, error] = await catchError(
				api.auth.register.post({
					email,
					password,
					name,
				}),
			);

			if (error) {
				// Handle network errors
				if (error.message === "Failed to fetch" || error.name === "TypeError") {
					throw new Error("Network error. Please check your connection.");
				}

				// Re-throw other errors
				throw error;
			}

			if (response.error || !response.data) {
				// Handle API errors with proper error messages
				const error = response.error as any;

				// Check for rate limiting (429)
				if (error?.status === 429) {
					throw new Error(
						"Too many registration attempts. Please try again later.",
					);
				}

				// Check for validation errors (e.g., email already exists, weak password)
				if (error?.status === 400 || error?.status === 409) {
					const errorMessage = error?.message || "Registration failed";

					// Handle specific validation errors
					if (
						errorMessage.toLowerCase().includes("email") &&
						errorMessage.toLowerCase().includes("already")
					) {
						throw new Error("Email is already registered");
					}

					if (errorMessage.toLowerCase().includes("password")) {
						throw new Error(errorMessage);
					}

					throw new Error(errorMessage);
				}

				// Default registration error
				const errorMessage = error?.message || "Registration failed";
				throw new Error(errorMessage);
			}

			return response.data;
		},
		onSuccess: (data) => {
			tokenManager.setAccessToken(data.accessToken);
			tokenManager.setUserData(data.user);
			queryClient.setQueryData(["auth", "user"], data.user);
			setError(null);
			
			// Handle redirect to intended destination after successful registration
			// Use setTimeout to ensure state updates have been processed
			setTimeout(() => {
				navigateWithRedirect(navigate);
			}, 0);
		},
		onError: (error: Error) => {
			setError(
				error.message || "An unexpected error occurred. Please try again.",
			);
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

			// Navigate to intended destination using redirect helper
			navigateWithRedirect(navigate);
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
			// Redirect is handled in onSuccess callback
		},
		[clearError, loginMutation],
	);

	const register = React.useCallback(
		async (email: string, password: string, name: string) => {
			clearError();
			await registerMutation.mutateAsync({ email, password, name });
			// Redirect is handled in onSuccess callback
		},
		[clearError, registerMutation],
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
