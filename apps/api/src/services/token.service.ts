import { jwt as jwtPlugin } from "@elysiajs/jwt";
import crypto from "crypto";
import { config } from "../config";

// Import everything from the db package using workspace alias
import { db, eq, sessions, usedRefreshTokens } from "@wingmnn/db";
import { catchError, catchErrorSync } from "@wingmnn/utils";
import { AuthError, AuthErrorCode } from "./auth.service";
import { sessionService } from "./session.service";

// Token payload interfaces
export interface TokenPayload {
	userId: string;
	sessionId: string;
	jti: string; // JWT ID
	iat: number; // Issued at
	exp: number; // Expiration
}

export interface TokenExpiredPayload {
	expired: true;
	sessionId: string;
	userId: string;
}

export interface TokenPair {
	accessToken: string;
	refreshToken: string;
	expiresIn: number;
}

export interface Session {
	id: string;
	userId: string;
	refreshTokenHash: string;
	accessTokenJti: string;
	createdAt: Date;
	expiresAt: Date;
	lastActivityAt: Date;
	ipAddress: string | null;
	userAgent: string | null;
	isRevoked: boolean;
}

// Token expiration constants
const ACCESS_TOKEN_EXPIRATION_SECONDS = 15 * 60; // 15 minutes
const NEAR_EXPIRATION_THRESHOLD_SECONDS = 5 * 60; // 5 minutes

// Initialize JWT helper once; expose decorator directly
const jwtPluginInstance = jwtPlugin({
	name: "jwt",
	secret: config.JWT_SECRET,
});
const jwtHelper = jwtPluginInstance.decorator.jwt;

export class TokenService {
	private readonly jwt = jwtHelper;
	private pendingRefreshes = new Map<string, Promise<TokenPair>>();

	/**
	 * Generate a JWT access token with 15-minute expiration
	 */
	async generateAccessToken(
		userId: string,
		sessionId: string,
	): Promise<string> {
		const jti = crypto.randomUUID();
		const iat = Math.floor(Date.now() / 1000);
		const exp = iat + ACCESS_TOKEN_EXPIRATION_SECONDS;

		// Create payload with proper JWT claims
		const payload: Record<string, any> = {
			userId,
			sessionId,
			jti,
			iat,
			exp,
		};

		return await this.jwt.sign(payload);
	}

	/**
	 * Generate a cryptographically random refresh token (256-bit)
	 */
	generateRefreshToken(): string {
		// Generate 32 bytes (256 bits) of random data
		const buffer = crypto.randomBytes(32);
		// Convert to base64url for safe transmission
		return buffer.toString("base64url");
	}

	/**
	 * Hash a token using SHA-256
	 */
	hashToken(token: string): string {
		return crypto.createHash("sha256").update(token).digest("hex");
	}

	/**
	 * Decode an access token and return its payload
	 */
	decodeAccessToken(
		token: string,
	): ReturnType<typeof catchErrorSync<TokenPayload>> {
		return catchErrorSync(() => {
			const parts = token.split(".");
			if (parts.length !== 3) {
				throw new Error("Invalid token structure");
			}
			const payloadStr = Buffer.from(parts[1], "base64url").toString();
			return JSON.parse(payloadStr) as TokenPayload;
		});
	}

	/**
	 * Verify an access token and return its payload
	 * Returns TokenExpiredPayload if token is expired but otherwise valid
	 */
	async verifyAccessToken(
		token: string,
	): Promise<TokenPayload | TokenExpiredPayload> {
		const [verifiedPayload, verifyError] = await catchError(
			this.jwt.verify(token) as Promise<TokenPayload | false>,
		);

		if (verifyError instanceof AuthError) {
			throw verifyError;
		}

		if (verifyError) {
			const [decodedPayload] = this.decodeAccessToken(token);

			if (decodedPayload) {
				const now = Math.floor(Date.now() / 1000);
				if (decodedPayload.exp < now) {
					return {
						expired: true,
						sessionId: decodedPayload.sessionId,
						userId: decodedPayload.userId,
					};
				}
			}

			throw new AuthError(
				AuthErrorCode.INVALID_TOKEN,
				"Invalid access token",
				401,
			);
		}

		if (!verifiedPayload) {
			throw new AuthError(
				AuthErrorCode.INVALID_TOKEN,
				"Invalid access token",
				401,
			);
		}

		const now = Math.floor(Date.now() / 1000);
		if (verifiedPayload.exp < now) {
			return {
				expired: true,
				sessionId: verifiedPayload.sessionId,
				userId: verifiedPayload.userId,
			};
		}

		return verifiedPayload;
	}

	/**
	 * Check if a token is near expiration (< 5 minutes remaining)
	 */
	isTokenNearExpiration(token: string): boolean {
		const [payload, decodeError] = this.decodeAccessToken(token);

		if (decodeError || !payload) {
			return false;
		}

		const now = Math.floor(Date.now() / 1000);
		const timeRemaining = payload.exp - now;

		return timeRemaining < NEAR_EXPIRATION_THRESHOLD_SECONDS;
	}

	/**
	 * Validate a refresh token and return the associated session
	 * Throws error if token is invalid, expired, or revoked
	 */
	async validateRefreshToken(token: string): Promise<Session> {
		const tokenHash = this.hashToken(token);

		// Find session by refresh token hash
		const [result, error] = await catchError(
			db
				.select()
				.from(sessions)
				.where(eq(sessions.refreshTokenHash, tokenHash))
				.limit(1),
		);

		if (error) {
			throw error;
		}

		if (!result || result.length === 0) {
			throw new AuthError(
				AuthErrorCode.INVALID_TOKEN,
				"Invalid refresh token",
				401,
			);
		}

		const session = result[0]!;

		// Check if session is revoked
		if (session.isRevoked) {
			throw new AuthError(
				AuthErrorCode.SESSION_REVOKED,
				"Session has been revoked",
				401,
			);
		}

		// Check if session is expired
		if (session.expiresAt < new Date()) {
			throw new AuthError(
				AuthErrorCode.SESSION_EXPIRED,
				"Session has expired",
				401,
			);
		}

		return session;
	}

	/**
	 * Refresh tokens with rotation and reuse detection
	 * Issues new access and refresh tokens, invalidates old refresh token
	 */
	async refreshTokens(refreshToken: string): Promise<TokenPair> {
		const tokenHash = this.hashToken(refreshToken);

		if (this.pendingRefreshes.has(tokenHash)) {
			return this.pendingRefreshes.get(tokenHash)!;
		}

		const performRefresh = async (): Promise<TokenPair> => {
			// Validate the refresh token and get session. If it fails because the token
			// no longer matches any session, treat it as a possible reuse attempt.
			const [session, validationError] = await catchError(
				this.validateRefreshToken(refreshToken),
			);

			if (validationError || !session) {
				if (
					validationError instanceof AuthError &&
					validationError.code === AuthErrorCode.INVALID_TOKEN
				) {
					const [usedTokenResult, reuseLookupError] = await catchError(
						db
							.select()
							.from(usedRefreshTokens)
							.where(eq(usedRefreshTokens.tokenHash, tokenHash))
							.limit(1),
					);

					if (reuseLookupError) throw reuseLookupError;
					if (!usedTokenResult || usedTokenResult.length === 0) {
						throw new AuthError(
							AuthErrorCode.INVALID_TOKEN,
							"cannot verify token reuse",
							401,
						);
					}

					const usedToken = usedTokenResult[0];

					if (usedToken) {
						await sessionService.revokeSession(usedToken.sessionId);
						throw new AuthError(
							AuthErrorCode.TOKEN_REUSE_DETECTED,
							"Token reuse detected - session has been revoked for security",
							401,
						);
					}
				}

				throw (
					validationError ??
					new AuthError(
						AuthErrorCode.INVALID_TOKEN,
						"Invalid refresh token",
						401,
					)
				);
			}

			// Mark the old token as used
			await db.insert(usedRefreshTokens).values({
				tokenHash,
				sessionId: session.id,
				usedAt: new Date(),
			});

			// Generate new tokens
			const newAccessToken = await this.generateAccessToken(
				session.userId,
				session.id,
			);
			const newRefreshToken = this.generateRefreshToken();
			const newRefreshTokenHash = this.hashToken(newRefreshToken);

			// Generate new JTI for tracking
			const jti = crypto.randomUUID();

			// Update session with new refresh token hash and JTI
			await db
				.update(sessions)
				.set({
					refreshTokenHash: newRefreshTokenHash,
					accessTokenJti: jti,
					lastActivityAt: new Date(),
				})
				.where(eq(sessions.id, session.id));

			return {
				accessToken: newAccessToken,
				refreshToken: newRefreshToken,
				expiresIn: ACCESS_TOKEN_EXPIRATION_SECONDS,
			};
		};

		const refreshPromise = performRefresh();
		this.pendingRefreshes.set(tokenHash, refreshPromise);

		const [refreshResult, refreshError] = await catchError(refreshPromise);
		this.pendingRefreshes.delete(tokenHash);

		if (refreshError) throw refreshError;
		if (!refreshResult) {
			throw new AuthError(
				AuthErrorCode.INVALID_TOKEN,
				"failed to refresh tokens",
				401,
			);
		}
		return refreshResult;
	}

	/**
	 * Revoke a session by marking it as revoked
	 */
	async revokeSession(sessionId: string): Promise<void> {
		await db
			.update(sessions)
			.set({ isRevoked: true })
			.where(eq(sessions.id, sessionId));
	}
}

// Export singleton instance
export const tokenService = new TokenService();
