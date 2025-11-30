/**
 * Token Manager
 *
 * Handles storage, retrieval, and validation of authentication tokens.
 * Extends LocalStorageManager for localStorage operations.
 */

import { UserProfile } from "@wingmnn/types";
import {
	LocalStorageManager,
	LocalStorageManagerImpl,
} from "@/lib/storage/local-storage-manager";

export interface TokenPayload {
	userId: string;
	sessionId: string;
	exp: number;
	iat: number;
}

export interface TokenManager {
	// Token Storage
	getAccessToken(): string | null;
	setAccessToken(token: string): void;
	clearAccessToken(): void;

	// User Data Storage
	getUserData(): UserProfile | null;
	setUserData(user: UserProfile): void;
	clearUserData(): void;

	// Token Validation
	isTokenExpired(token: string): boolean;
	decodeToken(token: string): TokenPayload | null;
}

class TokenManagerImpl
	extends LocalStorageManagerImpl
	implements TokenManager
{
	private readonly ACCESS_TOKEN_KEY = "access_token";
	private readonly USER_DATA_KEY = "user_data";

	/**
	 * Retrieves the access token from localStorage
	 * @returns The stored access token or null if not found
	 */
	getAccessToken(): string | null {
		return this.getItem(this.ACCESS_TOKEN_KEY);
	}

	/**
	 * Stores the access token in localStorage
	 * @param token The access token to store
	 */
	setAccessToken(token: string): void {
		this.setItem(this.ACCESS_TOKEN_KEY, token);
	}

	/**
	 * Removes the access token from localStorage
	 */
	clearAccessToken(): void {
		this.removeItem(this.ACCESS_TOKEN_KEY);
		this.clearUserData(); // Also clear user data when clearing token
	}

	/**
	 * Retrieves the user data from localStorage
	 * @returns The stored user data or null if not found
	 */
	getUserData(): UserProfile | null {
		return this.getJSON<UserProfile>(this.USER_DATA_KEY);
	}

	/**
	 * Stores the user data in localStorage
	 * @param user The user data to store
	 */
	setUserData(user: UserProfile): void {
		this.setJSON(this.USER_DATA_KEY, user);
	}

	/**
	 * Removes the user data from localStorage
	 */
	clearUserData(): void {
		this.removeItem(this.USER_DATA_KEY);
	}

	/**
	 * Checks if a token is expired or will expire soon (within 1 minute)
	 * @param token The JWT token to check
	 * @returns true if the token is expired or will expire soon, false otherwise
	 */
	isTokenExpired(token: string): boolean {
		const payload = this.decodeToken(token);
		if (!payload) return true;

		// Check if token expires in less than 1 minute
		const expiresAt = payload.exp * 1000;
		const now = Date.now();
		return expiresAt - now < 60000;
	}

	/**
	 * Decodes a JWT token and extracts the payload
	 * @param token The JWT token to decode
	 * @returns The decoded token payload or null if decoding fails
	 */
	decodeToken(token: string): TokenPayload | null {
		try {
			const parts = token.split(".");
			if (parts.length !== 3) return null;

			const payload = JSON.parse(atob(parts[1]));
			return payload;
		} catch {
			return null;
		}
	}
}

// Export singleton instance
export const tokenManager = new TokenManagerImpl();
