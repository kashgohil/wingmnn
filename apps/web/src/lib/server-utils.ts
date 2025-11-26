import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";

/**
 * Checks if the user is authenticated
 * @returns True if the user is authenticated, false otherwise
 */
export const isAuthenticated = createServerFn().handler(() => {
	const cookie = getRequestHeader("Cookie");
	return cookie && cookie.includes("refresh_token=");
});
