import { Elysia } from "elysia";
import { isProduction } from "../config";
import { sessionService } from "../services/session.service";
import { tokenService, type TokenPayload } from "../services/token.service";

const REFRESH_TOKEN_COOKIE_NAME = "refresh_token";
const ACCESS_TOKEN_HEADER_NAME = "authorization";

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
	  }
	| {
			authenticated: false;
			userId: null;
			sessionId: null;
			accessToken: null;
			error?: string;
	  };

/**
 * Authentication middleware
 * Handles bearer token extraction, refresh token handling, automatic token refresh,
 * session validation, and activity tracking
 */
export const auth = () =>
	new Elysia({ name: "auth" }).derive(
		{ as: "global" },
		async ({ cookie, headers, request, set }) => {
			try {
				// Extract bearer token from Authorization header
				const authHeader =
					headers[ACCESS_TOKEN_HEADER_NAME] || headers["Authorization"];
				let accessToken: string | null = null;

				if (authHeader && typeof authHeader === "string") {
					// Support both "Bearer <token>" and just "<token>" formats
					const parts = authHeader.trim().split(" ");
					accessToken =
						parts.length === 2 && parts[0].toLowerCase() === "bearer"
							? parts[1]
							: parts.length === 1
							? parts[0]
							: null;
				}

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
					try {
						const verificationResult = await tokenService.verifyAccessToken(
							accessToken,
						);

						// Check if token is expired
						if ("expired" in verificationResult && verificationResult.expired) {
							// Token is expired, need to refresh
							shouldRefresh = true;
						} else {
							// Token is valid
							tokenPayload = verificationResult as TokenPayload;

							// Check if token is near expiration (< 5 minutes)
							const isNearExpiration =
								tokenService.isTokenNearExpiration(accessToken);
							if (isNearExpiration) {
								shouldRefresh = true;
							}
						}
					} catch (error) {
						// Token verification failed, try to refresh if refresh token is available
						if (refreshToken) {
							shouldRefresh = true;
						} else {
							// No refresh token, authentication failed
							set.status = 401;
							return {
								authenticated: false as const,
								userId: null,
								sessionId: null,
								accessToken: null,
								error: "Invalid access token",
							};
						}
					}
				} else {
					// No access token, but we have refresh token - need to refresh
					shouldRefresh = true;
				}

				// Refresh tokens if needed
				if (shouldRefresh) {
					if (!refreshToken) {
						set.status = 401;
						return {
							authenticated: false as const,
							userId: null,
							sessionId: null,
							accessToken: null,
							error: "Access token expired and no refresh token provided",
						};
					}

					try {
						// Refresh tokens using refresh token (refreshToken is guaranteed to be non-null here)
						newTokenPair = await tokenService.refreshTokens(refreshToken);

						// Verify the new access token to get payload
						tokenPayload = (await tokenService.verifyAccessToken(
							newTokenPair.accessToken,
						)) as TokenPayload;

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
					} catch (error) {
						// Refresh failed - invalid or expired refresh token
						set.status = 401;

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
							error:
								error instanceof Error ? error.message : "Token refresh failed",
						};
					}
				}

				// At this point, we should have a valid token payload
				if (!tokenPayload) {
					set.status = 401;
					return {
						authenticated: false as const,
						userId: null,
						sessionId: null,
						accessToken: null,
						error: "Failed to authenticate",
					};
				}

				// Validate session
				const session = await sessionService.getSession(tokenPayload.sessionId);

				if (!session) {
					set.status = 401;
					return {
						authenticated: false as const,
						userId: null,
						sessionId: null,
						accessToken: null,
						error: "Session not found",
					};
				}

				// Check if session is revoked
				if (session.isRevoked) {
					set.status = 401;

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
						error: "Session revoked",
					};
				}

				// Check if session is expired
				if (session.expiresAt < new Date()) {
					set.status = 401;

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
						error: "Session expired",
					};
				}

				// Update last activity
				await sessionService.updateLastActivity(session.id);

				// Extend session if needed (within 7 days of expiration)
				await sessionService.extendSessionIfNeeded(session.id);

				// Return authenticated context
				const finalAccessToken = newTokenPair?.accessToken || accessToken!;

				return {
					authenticated: true as const,
					userId: tokenPayload.userId,
					sessionId: tokenPayload.sessionId,
					accessToken: finalAccessToken,
				};
			} catch (error) {
				// If any unexpected error occurs, return unauthenticated state
				return {
					authenticated: false as const,
					userId: null,
					sessionId: null,
					accessToken: null,
					error:
						error instanceof Error ? error.message : "Authentication error",
				};
			}
		},
	);

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
		({ authenticated, set }: { authenticated?: boolean; set: any }) => {
			if (!authenticated) {
				set.status = 401;
				return {
					error: "Unauthorized",
					message: "Authentication required",
				};
			}
		},
	);
