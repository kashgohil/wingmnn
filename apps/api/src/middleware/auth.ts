import bearer from "@elysiajs/bearer";
import { catchError } from "@wingmnn/utils";
import { Elysia } from "elysia";
import { isProduction } from "../config";
import { AuthError, AuthErrorCode } from "../services/auth.service";
import { sessionService } from "../services/session.service";
import { tokenService, type TokenPayload } from "../services/token.service";

const REFRESH_TOKEN_COOKIE_NAME = "refresh_token";
/**
 * Authentication context added to request
 * This is a discriminated union - TypeScript can narrow based on `authenticated`
 */
export type AuthContext =
	| {
			authenticated: true;
			userId: string;
			sessionId: string;
			accessToken: string;
			authError: null;
	  }
	| {
			authenticated: false;
			userId: null;
			sessionId: null;
			accessToken: null;
			authError: AuthError | null;
	  };

/**
 * Authentication middleware
 * Handles bearer token extraction, refresh token handling, automatic token refresh,
 * session validation, and activity tracking
 */

export const auth = () =>
	new Elysia({ name: "auth" })
		.use(bearer())
		.derive({ as: "global" }, async (context) => {
			const { cookie, set } = context;
			const accessToken = context.bearer;

			// Value provided by @elysiajs/bearer plugin
			// Extract refresh token from HTTP-only cookie
			const refreshToken =
				(cookie[REFRESH_TOKEN_COOKIE_NAME]?.value as string | undefined) ||
				null;

			// If no tokens provided, return unauthenticated state
			if (!accessToken && !refreshToken) {
				return {
					authenticated: false as const,
					userId: null,
					sessionId: null,
					accessToken: null,
					authError: null,
				};
			}

			let tokenPayload: TokenPayload | null = null;
			let shouldRefresh = false;
			let newTokenPair: {
				accessToken: string;
				refreshToken: string;
				expiresIn: number;
			} | null = null;

			// Verify access token if present
			if (accessToken) {
				const [verificationResult, verifyError] = await catchError(
					tokenService.verifyAccessToken(accessToken),
				);

				if (verifyError) {
					// Token verification failed, try to refresh if refresh token is available
					if (refreshToken) {
						shouldRefresh = true;
					} else {
						// No refresh token, authentication failed
						const authError =
							verifyError instanceof AuthError
								? verifyError
								: new AuthError(
										AuthErrorCode.INVALID_TOKEN,
										"Invalid access token",
										401,
								  );
						return {
							authenticated: false as const,
							userId: null,
							sessionId: null,
							accessToken: null,
							authError,
						};
					}
				} else {
					// Check if token is expired
					if (
						verificationResult &&
						"expired" in verificationResult &&
						verificationResult.expired
					) {
						// Token is expired, need to refresh
						shouldRefresh = true;
					} else if (verificationResult) {
						// Token is valid
						tokenPayload = verificationResult as TokenPayload;

						// Check if token is near expiration (< 5 minutes)
						if (tokenService.isTokenNearExpiration(accessToken)) {
							shouldRefresh = true;
						}
					}
				}
			} else {
				// No access token, but we have refresh token - need to refresh
				shouldRefresh = true;
			}

			// Refresh tokens if needed
			if (shouldRefresh) {
				if (!refreshToken) {
					return {
						authenticated: false as const,
						userId: null,
						sessionId: null,
						accessToken: null,
						authError: new AuthError(
							AuthErrorCode.EXPIRED_TOKEN,
							"Access token expired and no refresh token provided",
							401,
						),
					};
				}

				const [refreshResult, refreshError] = await catchError(
					tokenService.refreshTokens(refreshToken),
				);

				if (refreshError) {
					// Refresh failed - invalid or expired refresh token
					// Clear refresh token cookie by setting it with empty value and expired date
					cookie[REFRESH_TOKEN_COOKIE_NAME].set({
						value: "",
						httpOnly: true,
						secure: isProduction,
						sameSite: "strict",
						path: "/",
						maxAge: 0,
					});

					const authError =
						refreshError instanceof AuthError
							? refreshError
							: new AuthError(
									AuthErrorCode.INVALID_TOKEN,
									refreshError instanceof Error
										? refreshError.message
										: "Token refresh failed",
									401,
							  );
					return {
						authenticated: false as const,
						userId: null,
						sessionId: null,
						accessToken: null,
						authError,
					};
				}

				if (!refreshResult) {
					return {
						authenticated: false as const,
						userId: null,
						sessionId: null,
						accessToken: null,
						authError: new AuthError(
							AuthErrorCode.INVALID_TOKEN,
							"Token refresh failed",
							401,
						),
					};
				}

				newTokenPair = refreshResult;

				// Verify the new access token to get payload
				const [newTokenPayload, newTokenError] = await catchError(
					tokenService.verifyAccessToken(newTokenPair.accessToken),
				);

				if (newTokenError || !newTokenPayload) {
					return {
						authenticated: false as const,
						userId: null,
						sessionId: null,
						accessToken: null,
						authError: new AuthError(
							AuthErrorCode.INVALID_TOKEN,
							"Failed to verify refreshed token",
							401,
						),
					};
				}

				tokenPayload = newTokenPayload as TokenPayload;

				// Set new tokens in response
				// Access token in Authorization header (for client to read)
				set.headers["X-Access-Token"] = newTokenPair.accessToken;

				// Refresh token in HTTP-only cookie
				cookie[REFRESH_TOKEN_COOKIE_NAME].set({
					value: newTokenPair.refreshToken,
					httpOnly: true,
					secure: isProduction,
					sameSite: "strict",
					path: "/",
					maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
				});
			}

			// At this point, we should have a valid token payload
			if (!tokenPayload) {
				return {
					authenticated: false as const,
					userId: null,
					sessionId: null,
					accessToken: null,
					authError: new AuthError(
						AuthErrorCode.INVALID_TOKEN,
						"Failed to authenticate",
						401,
					),
				};
			}

			// Validate session - use catchError to handle database errors gracefully
			const [session, sessionError] = await catchError(
				sessionService.getSession(tokenPayload.sessionId),
			);

			if (sessionError) {
				// Database error during session lookup - treat as authentication failure
				console.error(
					"[Auth] Database error during session lookup:",
					sessionError,
				);
				return {
					authenticated: false as const,
					userId: null,
					sessionId: null,
					accessToken: null,
					authError: new AuthError(
						AuthErrorCode.SESSION_NOT_FOUND,
						"Unable to verify session",
						401,
					),
				};
			}

			if (!session) {
				return {
					authenticated: false as const,
					userId: null,
					sessionId: null,
					accessToken: null,
					authError: new AuthError(
						AuthErrorCode.SESSION_NOT_FOUND,
						"Session not found",
						401,
					),
				};
			}

			// Check if session is revoked
			if (session.isRevoked) {
				// Clear refresh token cookie by setting it with empty value and expired date
				cookie[REFRESH_TOKEN_COOKIE_NAME].set({
					value: "",
					httpOnly: true,
					secure: isProduction,
					sameSite: "strict",
					path: "/",
					maxAge: 0,
				});

				return {
					authenticated: false as const,
					userId: null,
					sessionId: null,
					accessToken: null,
					authError: new AuthError(
						AuthErrorCode.SESSION_REVOKED,
						"Session revoked",
						401,
					),
				};
			}

			// Check if session is expired
			if (session.expiresAt < new Date()) {
				// Clear refresh token cookie by setting it with empty value and expired date
				cookie[REFRESH_TOKEN_COOKIE_NAME].set({
					value: "",
					httpOnly: true,
					secure: isProduction,
					sameSite: "strict",
					path: "/",
					maxAge: 0,
				});

				return {
					authenticated: false as const,
					userId: null,
					sessionId: null,
					accessToken: null,
					authError: new AuthError(
						AuthErrorCode.SESSION_EXPIRED,
						"Session expired",
						401,
					),
				};
			}

			// Update last activity - don't fail authentication if this fails
			const [, activityError] = await catchError(
				sessionService.updateLastActivity(session.id),
			);
			if (activityError) {
				// Log but don't fail authentication for activity tracking errors
				console.warn("[Auth] Failed to update last activity:", activityError);
			}

			// Extend session if needed - don't fail authentication if this fails
			const [, extendError] = await catchError(
				sessionService.extendSessionIfNeeded(session.id),
			);
			if (extendError) {
				// Log but don't fail authentication for session extension errors
				console.warn("[Auth] Failed to extend session:", extendError);
			}

			// Return authenticated context
			const finalAccessToken = newTokenPair?.accessToken || accessToken!;

			return {
				authenticated: true as const,
				userId: tokenPayload.userId,
				sessionId: tokenPayload.sessionId,
				accessToken: finalAccessToken,
				authError: null,
			};
		});
/**
 * Guard function to require authentication
 * Use this in routes that require authentication
 *
 * @example
 * ```ts
 * app.use(auth())
 *   .use(requireAuth())
 *   .get("/protected", ({ userId }) => {
 *     return { message: `Hello user ${userId}` };
 *   })
 * ```
 */
export const requireAuth = () =>
	new Elysia({ name: "requireAuth" }).onBeforeHandle(
		{ as: "global" },
		({
			authenticated,
			authError,
			set,
		}: {
			authenticated?: boolean;
			authError?: AuthError | null;
			set: any;
		}) => {
			if (!authenticated) {
				// If there's a specific auth error, throw it so the error handler can format it properly
				if (authError) {
					throw authError;
				}
				// Otherwise, return generic unauthorized error
				set.status = 401;
				return {
					error: "Unauthorized",
					message: "Authentication required",
				};
			}
		},
	);
