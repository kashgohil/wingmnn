import bearer from "@elysiajs/bearer";
import { catchError } from "@wingmnn/utils";
import { Cookie, Elysia } from "elysia";
import { isProduction } from "../config";
import { AuthError, AuthErrorCode } from "../services/auth.service";
import {
	sessionService,
	type Session as SessionModel,
} from "../services/session.service";
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

const buildUnauthenticatedContext = (authError: AuthError | null) => ({
	authenticated: false as const,
	userId: null,
	sessionId: null,
	accessToken: null,
	authError,
});

const clearRefreshCookie = (cookie: Record<string, Cookie<unknown>>) => {
	const refreshCookie = cookie[REFRESH_TOKEN_COOKIE_NAME];
	if (refreshCookie) {
		refreshCookie.set({
			value: "",
			httpOnly: true,
			secure: isProduction,
			sameSite: "strict",
			path: "/",
			maxAge: 0,
		});
	}
};

const logout = (
	cookie: Record<string, Cookie<unknown>>,
	authError: AuthError,
) => {
	clearRefreshCookie(cookie);
	return buildUnauthenticatedContext(authError);
};

const buildAuthenticatedContext = async (
	cookie: Record<string, Cookie<unknown>>,
	payload: TokenPayload,
	activeAccessToken: string,
	existingSession?: SessionModel | null,
): Promise<AuthContext> => {
	let session: SessionModel | null | undefined = existingSession;

	if (!session) {
		const [fetchedSession, sessionError] = await catchError(
			sessionService.getSession(payload.sessionId),
		);

		if (sessionError) {
			console.error(
				"[Auth] Database error during session lookup:",
				sessionError,
			);
			return buildUnauthenticatedContext(
				new AuthError(
					AuthErrorCode.SESSION_NOT_FOUND,
					"Unable to verify session",
					401,
				),
			);
		}

		session = fetchedSession;
	}

	if (!session) {
		return logout(
			cookie,
			new AuthError(AuthErrorCode.SESSION_NOT_FOUND, "Session not found", 401),
		);
	}

	if (session.isRevoked) {
		return logout(
			cookie,
			new AuthError(AuthErrorCode.SESSION_REVOKED, "Session revoked", 401),
		);
	}

	if (session.expiresAt < new Date()) {
		return logout(
			cookie,
			new AuthError(AuthErrorCode.SESSION_EXPIRED, "Session expired", 401),
		);
	}

	const [, activityError] = await catchError(
		sessionService.updateLastActivity(session.id),
	);
	if (activityError) {
		console.warn("[Auth] Failed to update last activity:", activityError);
	}

	const [, extendError] = await catchError(
		sessionService.extendSessionIfNeeded(session.id),
	);
	if (extendError) {
		console.warn("[Auth] Failed to extend session:", extendError);
	}

	return {
		authenticated: true as const,
		userId: payload.userId,
		sessionId: payload.sessionId,
		accessToken: activeAccessToken,
		authError: null,
	};
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

			console.log({ accessToken, refreshToken });

			// If no tokens provided, return unauthenticated state
			if (!accessToken && !refreshToken) {
				return buildUnauthenticatedContext(null);
			}

			// Verify access token if present
			if (accessToken) {
				const [verificationResult, verifyError] = await catchError(
					tokenService.verifyAccessToken(accessToken),
				);

				console.log("verificationResult", verificationResult, verifyError);

				// if no refresh token and there's an error, return unauthenticated context
				if (!refreshToken && verifyError) {
					return buildUnauthenticatedContext(
						verifyError instanceof AuthError
							? verifyError
							: new AuthError(
									AuthErrorCode.INVALID_TOKEN,
									"Invalid access token",
									401,
							  ),
					);
				}

				// if no verification result, return unauthenticated context
				if (!verificationResult)
					return buildUnauthenticatedContext(
						new AuthError(
							AuthErrorCode.INVALID_TOKEN,
							"Invalid access token",
							401,
						),
					);

				// if the verification result is not expired, return authenticated context
				if (!("expired" in verificationResult)) {
					return buildAuthenticatedContext(
						cookie,
						verificationResult as TokenPayload,
						accessToken,
					);
				}

				// if no refresh token and the verification result is expired, return unauthenticated context
				if (!refreshToken && verificationResult.expired) {
					return buildUnauthenticatedContext(
						new AuthError(
							AuthErrorCode.EXPIRED_TOKEN,
							"Access token expired and no refresh token provided",
							401,
						),
					);
				}
			}

			if (!refreshToken) {
				return buildUnauthenticatedContext(
					new AuthError(
						AuthErrorCode.EXPIRED_TOKEN,
						"Access token expired and no refresh token provided",
						401,
					),
				);
			}

			const [validatedSession, validationError] = await catchError(
				tokenService.validateRefreshToken(refreshToken),
			);

			// if there's an error or no validated session, return unauthenticated context
			if (validationError || !validatedSession) {
				if (
					validationError instanceof AuthError &&
					validationError.code === AuthErrorCode.INVALID_TOKEN
				) {
					const [usedTokenResult, reuseLookupError] = await catchError(
						tokenService.isUsedRefreshToken(
							tokenService.hashToken(refreshToken),
						),
					);

					if (reuseLookupError) throw reuseLookupError;
					if (!usedTokenResult || usedTokenResult.length === 0) {
						return logout(
							cookie,
							new AuthError(
								AuthErrorCode.INVALID_TOKEN,
								"Token refresh failed",
								401,
							),
						);
					}

					const usedToken = usedTokenResult[0];

					if (usedToken) {
						await sessionService.revokeSession(usedToken.sessionId);
						return logout(
							cookie,
							new AuthError(
								AuthErrorCode.INVALID_TOKEN,
								"Token refresh failed - token reuse detected",
								401,
							),
						);
					}
				}

				return logout(
					cookie,
					validationError instanceof AuthError
						? validationError
						: new AuthError(
								AuthErrorCode.INVALID_TOKEN,
								"Invalid refresh token",
								401,
						  ),
				);
			}

			const [refreshResult, refreshError] = await catchError(
				tokenService.refreshTokens(validatedSession, refreshToken),
			);

			if (refreshError || !refreshResult) {
				const error =
					refreshError instanceof AuthError
						? refreshError
						: new AuthError(
								AuthErrorCode.INVALID_TOKEN,
								"Token refresh failed",
								401,
						  );
				return logout(cookie, error);
			}

			const [newTokenPayload, newTokenError] = await catchError(
				tokenService.verifyAccessToken(refreshResult.accessToken),
			);

			if (
				newTokenError ||
				!newTokenPayload ||
				("expired" in newTokenPayload && newTokenPayload.expired)
			) {
				return logout(
					cookie,
					new AuthError(
						AuthErrorCode.INVALID_TOKEN,
						"Failed to verify refreshed token",
						401,
					),
				);
			}

			set.headers["X-Access-Token"] = refreshResult.accessToken;

			cookie[REFRESH_TOKEN_COOKIE_NAME].set({
				value: refreshResult.refreshToken,
				httpOnly: true,
				secure: isProduction,
				sameSite: "strict",
				path: "/",
				maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
			});

			return buildAuthenticatedContext(
				cookie,
				newTokenPayload as TokenPayload,
				refreshResult.accessToken,
				validatedSession,
			);
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
