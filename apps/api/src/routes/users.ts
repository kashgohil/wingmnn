import { Elysia, t } from "elysia";
import { config } from "../config";
import { auth } from "../middleware/auth";
import { rateLimit } from "../middleware/rate-limit";
import {
	AuthError,
	AuthErrorCode,
	authService,
} from "../services/auth.service";

/**
 * User routes
 * Provides lightweight profile lookups for referencing users by ID.
 */
export const userRoutes = new Elysia({ prefix: "/users" })
	.use(auth())
	.onBeforeHandle(
		rateLimit({
			max: config.API_RATE_LIMIT,
			window: config.API_RATE_WINDOW,
			endpoint: "users",
		}),
	)
	.get(
		"/:id",
		async ({ params, authenticated, userId }) => {
			if (!authenticated || !userId) {
				throw new AuthError(
					AuthErrorCode.INVALID_TOKEN,
					"Authentication required",
					401,
				);
			}

			const user = await authService.getUserById(params.id);

			if (!user) {
				throw new AuthError(
					AuthErrorCode.USER_NOT_FOUND,
					"User not found",
					404,
				);
			}

			return { user };
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			detail: {
				tags: ["Users"],
				summary: "Get a user profile by ID",
				description: `
Fetch a user's profile details (name, email, bio, timestamps) for display purposes.

**Authentication Required:**
- Must include a valid access token in the Authorization header.

**Authorization:**
- Any authenticated user can look up another user's public profile information.
        `,
				security: [{ bearerAuth: [] }],
				responses: {
					200: {
						description: "User profile returned successfully",
						content: {
							"application/json": {
								schema: {
									type: "object",
									properties: {
										user: {
											type: "object",
											properties: {
												id: { type: "string", example: "user_123" },
												email: {
													type: "string",
													nullable: true,
													example: "user@example.com",
												},
												name: { type: "string", example: "Riley Chen" },
												bio: {
													type: "string",
													example: "Ops lead for GTM launches",
												},
												createdAt: {
													type: "string",
													format: "date-time",
												},
												updatedAt: {
													type: "string",
													format: "date-time",
												},
											},
										},
									},
								},
							},
						},
					},
					401: {
						description: "Authentication required",
					},
					404: {
						description: "User not found",
					},
				},
			},
		},
	);
