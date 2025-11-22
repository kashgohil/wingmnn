/**
 * Server-only utilities
 * These functions should only be called on the server side
 */

import { catchError, catchErrorSync } from "@wingmnn/utils/catch-error";

/**
 * Gets the request object on the server side
 * This function should only be called when typeof window === "undefined"
 * Uses dynamic import to avoid bundling server code for the client
 */
export async function getServerRequest(): Promise<Request | null> {
	// Only run on server
	if (typeof window !== "undefined") {
		return null;
	}

	// Dynamic import to avoid bundling server code for client
	// This import is only executed on the server, so it won't be included in client bundle
	const [module, importError] = await catchError(
		import("@tanstack/react-start/server"),
	);

	if (importError || !module) {
		// If import fails, return null
		// This can happen in certain contexts (e.g., during build, static generation, etc.)
		return null;
	}

	// Use catchErrorSync for the synchronous getRequest() call
	const [request, requestError] = catchErrorSync(() => module.getRequest());

	if (requestError || !request) {
		// If getRequest fails or returns null, return null
		return null;
	}

	return request;
}
