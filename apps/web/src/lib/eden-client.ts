/**
 * Elysia Eden Client
 *
 * Type-safe API client configured with authentication interceptors.
 * Automatically handles:
 * - Adding Authorization headers to requests
 * - Extracting and storing new access tokens from responses
 * - Including credentials for cookie-based refresh tokens
 */

import { treaty } from "@elysiajs/eden";
import type { App } from "@wingmnn/types";
import { getApiBaseUrl } from "./api/base-url";
import { tokenManager } from "./auth/token-manager";

type EdenClient = ReturnType<typeof treaty<App>>;
type ClientApi = EdenClient["api"];

/**
 * Creates a configured Eden client with authentication interceptors
 * @param baseURL The base URL of the API server
 * @returns Configured Eden client with type-safe API methods
 */
const createEdenClient = (baseURL: string) => {
	return treaty<App>(baseURL, {
		fetch: {
			credentials: "include", // Send cookies with requests
		},
		onRequest: (_path, options) => {
			// Add Authorization header if token exists
			const token = tokenManager.getAccessToken();

			if (!token) return options;

			options.headers = {
				...options.headers,
				Authorization: `Bearer ${token}`,
			};
		},
		onResponse: (response) => {
			// Check for new access token in response headers
			const newAccessToken = response.headers.get("X-Access-Token");
			if (newAccessToken) {
				tokenManager.setAccessToken(newAccessToken);
			}

			// Handle rate limiting errors
			if (response.status === 429) {
				console.warn("[API] Rate limit exceeded");
			}

			// Handle authentication errors
			if (response.status === 401) {
				console.warn("[API] Authentication failed - token may be invalid");
			}
		},
	}) as unknown as ClientApi; // Treaty nests prefixed routes under `.api` in its type definition
	// even though the runtime client exposes them at the top level. Casting keeps our
	// `api.auth.*` usage valid without switching to `client.api` (which would double-prefix
	// requests as `/api/api/...`). Remove this shim once treaty’s generated types match runtime.
};

// Export configured client instance
export const api = createEdenClient(getApiBaseUrl());
