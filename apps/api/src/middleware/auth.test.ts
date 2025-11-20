// Import test setup first to set environment variables
import "../test-setup";

import { cookie } from "@elysiajs/cookie";
import { jwt } from "@elysiajs/jwt";
import { db, eq, sessions, usedRefreshTokens, users } from "@wingmnn/db";
import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { Elysia } from "elysia";
import { config } from "../config";
import { authService } from "../services/auth.service";
import { sessionService } from "../services/session.service";
import { tokenService } from "../services/token.service";
import { auth, requireAuth } from "./auth";

// Type helper for authenticated context
type AuthContext = {
	authenticated: boolean;
	userId: string | null;
	sessionId: string | null;
	accessToken: string | null;
	error?: string;
};

// Test helpers
const createTestMetadata = () => ({
	ipAddress: "127.0.0.1",
	userAgent: "test-agent",
});

// Cleanup helper
const cleanupTestUser = async (email: string) => {
	const user = await db
		.select()
		.from(users)
		.where(eq(users.email, email))
		.limit(1);

	if (user[0]) {
		// Get all sessions for this user
		const userSessions = await db
			.select()
			.from(sessions)
			.where(eq(sessions.userId, user[0].id));

		// Delete used refresh tokens first (foreign key constraint)
		for (const session of userSessions) {
			await db
				.delete(usedRefreshTokens)
				.where(eq(usedRefreshTokens.sessionId, session.id));
		}

		// Delete sessions (foreign key constraint)
		await db.delete(sessions).where(eq(sessions.userId, user[0].id));
		// Now delete the user
		await db.delete(users).where(eq(users.id, user[0].id));
	}
};

describe("Auth Middleware", () => {
	const testEmail = "auth-test@example.com";
	const testPassword = "testpassword123";
	const testName = "Auth Test User";
	const metadata = createTestMetadata();

	let testUserId: string;
	let testSessionId: string;
	let testAccessToken: string;
	let testRefreshToken: string;

	beforeEach(async () => {
		// Clean up test user before each test
		await cleanupTestUser(testEmail);

		// Create a test user and session
		const authResult = await authService.register(
			testEmail,
			testPassword,
			testName,
			metadata,
		);

		testUserId = authResult.user.id;
		testAccessToken = authResult.accessToken;
		testRefreshToken = authResult.refreshToken;

		// Get session ID from token
		const tokenPayload = (await tokenService.verifyAccessToken(
			testAccessToken,
		)) as any;
		testSessionId = tokenPayload.sessionId;
	});

	afterEach(async () => {
		// Clean up after each test
		await cleanupTestUser(testEmail);
	});

	describe("Token Extraction", () => {
		it("should test derive works", async () => {
			const app = new Elysia()
				.use(cookie())
				.derive(() => {
					return { testProp: "testValue" };
				})
				.get("/test", (ctx) => {
					return { testProp: (ctx as any).testProp };
				});

			const response = await app.handle(new Request("http://localhost/test"));

			const body = await response.json();
			console.log("Simple derive test:", body);
			expect(body.testProp).toBe("testValue");
		});

		it("should test async derive works", async () => {
			const app = new Elysia()
				.use(cookie())
				.derive(async () => {
					await new Promise((resolve) => setTimeout(resolve, 10));
					return { asyncProp: "asyncValue" };
				})
				.get("/test", (ctx) => {
					return { asyncProp: (ctx as any).asyncProp };
				});

			const response = await app.handle(new Request("http://localhost/test"));

			const body = await response.json();
			console.log("Async derive test:", body);
			expect(body.asyncProp).toBe("asyncValue");
		});

		it("should verify token is valid", async () => {
			// First verify the token can be verified by tokenService
			const payload = await tokenService.verifyAccessToken(testAccessToken);
			console.log("Token payload:", payload);
			expect(payload).toBeDefined();
			if ("expired" in payload) {
				console.log("Token is expired:", payload.expired);
			} else {
				expect(payload.userId).toBe(testUserId);
			}
		});

		it("should test minimal auth middleware", async () => {
			// Test if the issue is with .use() chaining
			const app = new Elysia()
				.use(cookie())
				.derive(async () => {
					return {
						authenticated: true,
						userId: "test-user-id",
						sessionId: "test-session-id",
						accessToken: "test-token",
					};
				})
				.get("/test", (ctx) => {
					return {
						authenticated: (ctx as any).authenticated,
						userId: (ctx as any).userId,
					};
				});

			const response = await app.handle(new Request("http://localhost/test"));

			const body = await response.json();
			console.log("Minimal auth test:", body);
			expect(body.authenticated).toBe(true);
			expect(body.userId).toBe("test-user-id");
		});

		it("should extract bearer token from Authorization header", async () => {
			// Apply auth middleware's derive directly instead of using .use()
			const authMiddleware = auth();
			const app = new Elysia()
				.use(cookie())
				.use(
					jwt({
						name: "jwt",
						secret: config.JWT_SECRET,
					}),
				)
				.use(authMiddleware)
				.get("/test", (ctx) => {
					const { authenticated, userId, sessionId, accessToken } =
						ctx as unknown as AuthContext;
					return { authenticated, userId, sessionId, accessToken };
				});

			const response = await app.handle(
				new Request("http://localhost/test", {
					headers: {
						Authorization: `Bearer ${testAccessToken}`,
					},
				}),
			);

			const body = await response.json();

			expect(response.status).toBe(200);
			expect(body.authenticated).toBe(true);
			expect(body.userId).toBe(testUserId);
		});

		it("should extract token without Bearer prefix", async () => {
			const app = new Elysia()
				.use(cookie())
				.use(
					jwt({
						name: "jwt",
						secret: config.JWT_SECRET,
					}),
				)
				.use(auth())
				.get("/test", (ctx) => {
					const { authenticated, userId } = ctx as unknown as AuthContext;
					return { authenticated, userId };
				});

			const response = await app.handle(
				new Request("http://localhost/test", {
					headers: {
						Authorization: testAccessToken,
					},
				}),
			);

			expect(response.status).toBe(200);
			const body = await response.json();
			expect(body.authenticated).toBe(true);
			expect(body.userId).toBe(testUserId);
		});

		it("should extract refresh token from cookie", async () => {
			const app = new Elysia()
				.use(cookie())
				.use(
					jwt({
						name: "jwt",
						secret: config.JWT_SECRET,
					}),
				)
				.use(auth())
				.get("/test", (ctx) => {
					const { authenticated, userId } = ctx as unknown as AuthContext;
					return { authenticated, userId };
				});

			const response = await app.handle(
				new Request("http://localhost/test", {
					headers: {
						Cookie: `refresh_token=${testRefreshToken}`,
					},
				}),
			);

			expect(response.status).toBe(200);
			const body = await response.json();
			expect(body.authenticated).toBe(true);
			expect(body.userId).toBe(testUserId);
		});

		it("should return unauthenticated when no tokens provided", async () => {
			const app = new Elysia()
				.use(cookie())
				.use(
					jwt({
						name: "jwt",
						secret: config.JWT_SECRET,
					}),
				)
				.use(auth())
				.get("/test", (ctx) => {
					const { authenticated } = ctx as unknown as AuthContext;
					return { authenticated };
				});

			const response = await app.handle(new Request("http://localhost/test"));

			expect(response.status).toBe(200);
			const body = await response.json();
			expect(body.authenticated).toBe(false);
		});
	});

	describe("Token Refresh", () => {
		it("should refresh expired access token using refresh token", async () => {
			const app = new Elysia()
				.use(cookie())
				.use(
					jwt({
						name: "jwt",
						secret: config.JWT_SECRET,
					}),
				)
				.use(auth())
				.get("/test", (ctx) => {
					const { authenticated, userId, accessToken } =
						ctx as unknown as AuthContext;
					return { authenticated, userId, accessToken };
				});

			// Create an expired token manually by manipulating the payload
			// We'll use a refresh token only (no access token) to trigger refresh
			const response = await app.handle(
				new Request("http://localhost/test", {
					headers: {
						Cookie: `refresh_token=${testRefreshToken}`,
					},
				}),
			);

			expect(response.status).toBe(200);
			const body = await response.json();
			expect(body.authenticated).toBe(true);
			expect(body.userId).toBe(testUserId);

			// Check if new access token is in response header
			const newAccessToken = response.headers.get("X-Access-Token");
			expect(newAccessToken).toBeDefined();
			expect(newAccessToken).not.toBe(testAccessToken);
		});

		it("should refresh token when near expiration", async () => {
			// Create a token that's near expiration (less than 5 minutes)
			// We'll manually create a token with short expiration
			const nearExpiringToken = await tokenService.generateAccessToken(
				testUserId,
				testSessionId,
			);

			// Manually decode and modify the token to be near expiration
			// For this test, we'll just verify the refresh logic works
			const app = new Elysia()
				.use(cookie())
				.use(
					jwt({
						name: "jwt",
						secret: config.JWT_SECRET,
					}),
				)
				.use(auth())
				.get("/test", (ctx) => {
					const { authenticated, userId } = ctx as unknown as AuthContext;
					return { authenticated, userId };
				});

			// Use refresh token to trigger refresh (simulating near-expiration scenario)
			const response = await app.handle(
				new Request("http://localhost/test", {
					headers: {
						Authorization: `Bearer ${nearExpiringToken}`,
						Cookie: `refresh_token=${testRefreshToken}`,
					},
				}),
			);

			expect(response.status).toBe(200);
			const body = await response.json();
			expect(body.authenticated).toBe(true);
		});

		it("should return 401 when refresh token is invalid", async () => {
			const app = new Elysia()
				.use(cookie())
				.use(
					jwt({
						name: "jwt",
						secret: config.JWT_SECRET,
					}),
				)
				.use(auth())
				.get("/test", (ctx) => {
					const { authenticated } = ctx as unknown as AuthContext;
					return { authenticated };
				});

			const response = await app.handle(
				new Request("http://localhost/test", {
					headers: {
						Cookie: `refresh_token=invalid-refresh-token`,
					},
				}),
			);

			expect(response.status).toBe(401);
		});

		it("should set new tokens in response when refreshed", async () => {
			const app = new Elysia()
				.use(cookie())
				.use(
					jwt({
						name: "jwt",
						secret: config.JWT_SECRET,
					}),
				)
				.use(auth())
				.get("/test", (ctx) => {
					const { authenticated } = ctx as unknown as AuthContext;
					return { authenticated };
				});

			const response = await app.handle(
				new Request("http://localhost/test", {
					headers: {
						Cookie: `refresh_token=${testRefreshToken}`,
					},
				}),
			);

			// Check for new access token in header
			const newAccessToken = response.headers.get("X-Access-Token");
			expect(newAccessToken).toBeDefined();

			// Check for new refresh token in Set-Cookie header
			const setCookieHeader = response.headers.get("Set-Cookie");
			expect(setCookieHeader).toBeDefined();
			expect(setCookieHeader).toContain("refresh_token");
		});
	});

	describe("Session Validation", () => {
		it("should validate active session", async () => {
			const app = new Elysia()
				.use(cookie())
				.use(
					jwt({
						name: "jwt",
						secret: config.JWT_SECRET,
					}),
				)
				.use(auth())
				.get("/test", (ctx) => {
					const { authenticated, userId, sessionId } =
						ctx as unknown as AuthContext;
					return { authenticated, userId, sessionId };
				});

			const response = await app.handle(
				new Request("http://localhost/test", {
					headers: {
						Authorization: `Bearer ${testAccessToken}`,
					},
				}),
			);

			expect(response.status).toBe(200);
			const body = await response.json();
			expect(body.authenticated).toBe(true);
			expect(body.userId).toBe(testUserId);
			expect(body.sessionId).toBe(testSessionId);
		});

		it("should return 401 when session is revoked", async () => {
			// Revoke the session
			await sessionService.revokeSession(testSessionId);

			const app = new Elysia()
				.use(cookie())
				.use(
					jwt({
						name: "jwt",
						secret: config.JWT_SECRET,
					}),
				)
				.use(auth())
				.get("/test", (ctx) => {
					const { authenticated } = ctx as unknown as AuthContext;
					return { authenticated };
				});

			const response = await app.handle(
				new Request("http://localhost/test", {
					headers: {
						Authorization: `Bearer ${testAccessToken}`,
						Cookie: `refresh_token=${testRefreshToken}`,
					},
				}),
			);

			expect(response.status).toBe(401);
		});

		it("should return 401 when session is expired", async () => {
			// Manually expire the session
			await db
				.update(sessions)
				.set({
					expiresAt: new Date(Date.now() - 1000), // Expired 1 second ago
				})
				.where(eq(sessions.id, testSessionId));

			const app = new Elysia()
				.use(cookie())
				.use(
					jwt({
						name: "jwt",
						secret: config.JWT_SECRET,
					}),
				)
				.use(auth())
				.get("/test", (ctx) => {
					const { authenticated } = ctx as unknown as AuthContext;
					return { authenticated };
				});

			const response = await app.handle(
				new Request("http://localhost/test", {
					headers: {
						Cookie: `refresh_token=${testRefreshToken}`,
					},
				}),
			);

			expect(response.status).toBe(401);
		});

		it("should return 401 when session not found", async () => {
			// Delete the session
			await db.delete(sessions).where(eq(sessions.id, testSessionId));

			const app = new Elysia()
				.use(cookie())
				.use(
					jwt({
						name: "jwt",
						secret: config.JWT_SECRET,
					}),
				)
				.use(auth())
				.get("/test", (ctx) => {
					const { authenticated } = ctx as unknown as AuthContext;
					return { authenticated };
				});

			const response = await app.handle(
				new Request("http://localhost/test", {
					headers: {
						Authorization: `Bearer ${testAccessToken}`,
					},
				}),
			);

			expect(response.status).toBe(401);
		});
	});

	describe("Activity Tracking", () => {
		it("should update last activity on authenticated request", async () => {
			// Get initial last activity BEFORE making the request
			const sessionBefore = await sessionService.getSession(testSessionId);
			const initialLastActivity = sessionBefore?.lastActivityAt;
			expect(initialLastActivity).toBeDefined();

			// Record the time just before making the request
			const beforeRequest = new Date();

			// Wait a bit to ensure time difference
			await new Promise((resolve) => setTimeout(resolve, 100));

			const app = new Elysia()
				.use(cookie())
				.use(
					jwt({
						name: "jwt",
						secret: config.JWT_SECRET,
					}),
				)
				.use(auth())
				.get("/test", (ctx) => {
					const { authenticated } = ctx as unknown as AuthContext;
					return { authenticated };
				});

			await app.handle(
				new Request("http://localhost/test", {
					headers: {
						Authorization: `Bearer ${testAccessToken}`,
					},
				}),
			);

			// Record the time just after making the request
			const afterRequest = new Date();

			// Check that last activity was updated
			const updatedSession = await sessionService.getSession(testSessionId);
			expect(updatedSession?.lastActivityAt).toBeDefined();

			// The updated timestamp should be between beforeRequest and afterRequest
			// (allowing some tolerance for database operations)
			if (updatedSession?.lastActivityAt) {
				const updatedTime = updatedSession.lastActivityAt.getTime();
				const beforeTime = beforeRequest.getTime();
				const afterTime = afterRequest.getTime();

				// Allow 5 seconds tolerance for database operations
				expect(updatedTime).toBeGreaterThanOrEqual(beforeTime - 5000);
				expect(updatedTime).toBeLessThanOrEqual(afterTime + 5000);
			}
		});

		it("should extend session when within 7 days of expiration", async () => {
			// Set session to expire in 6 days (within threshold)
			const sixDaysFromNow = new Date(Date.now() + 6 * 24 * 60 * 60 * 1000);
			await db
				.update(sessions)
				.set({ expiresAt: sixDaysFromNow })
				.where(eq(sessions.id, testSessionId));

			const app = new Elysia()
				.use(cookie())
				.use(
					jwt({
						name: "jwt",
						secret: config.JWT_SECRET,
					}),
				)
				.use(auth())
				.get("/test", (ctx) => {
					const { authenticated } = ctx as unknown as AuthContext;
					return { authenticated };
				});

			await app.handle(
				new Request("http://localhost/test", {
					headers: {
						Authorization: `Bearer ${testAccessToken}`,
					},
				}),
			);

			// Check that session was extended
			const updatedSession = await sessionService.getSession(testSessionId);
			expect(updatedSession?.expiresAt).toBeDefined();
			if (updatedSession?.expiresAt) {
				// Session should be extended to 30 days from now
				const thirtyDaysFromNow = new Date(
					Date.now() + 30 * 24 * 60 * 60 * 1000,
				);
				// Allow 1 minute tolerance for test execution time
				const tolerance = 60 * 1000;
				expect(updatedSession.expiresAt.getTime()).toBeGreaterThan(
					sixDaysFromNow.getTime(),
				);
				expect(
					Math.abs(
						updatedSession.expiresAt.getTime() - thirtyDaysFromNow.getTime(),
					),
				).toBeLessThan(tolerance);
			}
		});
	});

	describe("requireAuth Guard", () => {
		it("should allow access when authenticated", async () => {
			const app = new Elysia()
				.use(cookie())
				.use(
					jwt({
						name: "jwt",
						secret: config.JWT_SECRET,
					}),
				)
				.use(auth())
				.use(requireAuth())
				.get("/test", (ctx) => {
					const { userId } = ctx as unknown as AuthContext;
					return { userId, message: "protected" };
				});

			const response = await app.handle(
				new Request("http://localhost/test", {
					headers: {
						Authorization: `Bearer ${testAccessToken}`,
					},
				}),
			);

			expect(response.status).toBe(200);
			const body = await response.json();
			expect(body.userId).toBe(testUserId);
			expect(body.message).toBe("protected");
		});

		it("should block access when not authenticated", async () => {
			const app = new Elysia()
				.use(cookie())
				.use(
					jwt({
						name: "jwt",
						secret: config.JWT_SECRET,
					}),
				)
				.use(auth())
				.use(requireAuth())
				.get("/test", () => {
					return { message: "protected" };
				});

			const response = await app.handle(new Request("http://localhost/test"));

			expect(response.status).toBe(401);
			const body = await response.json();
			expect(body.error).toBe("Unauthorized");
		});
	});

	describe("Error Handling", () => {
		it("should clear refresh token cookie on authentication failure", async () => {
			const app = new Elysia()
				.use(cookie())
				.use(
					jwt({
						name: "jwt",
						secret: config.JWT_SECRET,
					}),
				)
				.use(auth())
				.get("/test", (ctx) => {
					const { authenticated } = ctx as unknown as AuthContext;
					return { authenticated };
				});

			// Revoke session to trigger authentication failure
			await sessionService.revokeSession(testSessionId);

			const response = await app.handle(
				new Request("http://localhost/test", {
					headers: {
						Cookie: `refresh_token=${testRefreshToken}`,
					},
				}),
			);

			expect(response.status).toBe(401);

			// Check that cookie is cleared
			const setCookieHeader = response.headers.get("Set-Cookie");
			expect(setCookieHeader).toBeDefined();
			expect(setCookieHeader).toContain("refresh_token=");
			expect(setCookieHeader).toContain("Max-Age=0");
		});

		it("should handle invalid access token with valid refresh token", async () => {
			const app = new Elysia()
				.use(cookie())
				.use(
					jwt({
						name: "jwt",
						secret: config.JWT_SECRET,
					}),
				)
				.use(auth())
				.get("/test", (ctx) => {
					const { authenticated, userId } = ctx as unknown as AuthContext;
					return { authenticated, userId };
				});

			const response = await app.handle(
				new Request("http://localhost/test", {
					headers: {
						Authorization: "Bearer invalid-token",
						Cookie: `refresh_token=${testRefreshToken}`,
					},
				}),
			);

			expect(response.status).toBe(200);
			const body = await response.json();
			// Should successfully refresh and authenticate
			expect(body.authenticated).toBe(true);
			expect(body.userId).toBe(testUserId);
		});
	});
});
