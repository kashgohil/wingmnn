import type { UserProfile } from "@wingmnn/types";
import { catchError } from "@wingmnn/utils/catch-error";
import { api } from "../eden-client";

/**
 * Fetch a single user profile by ID
 */
export async function getUser(id: string): Promise<UserProfile> {
	const [response, error] = await catchError(api.users({ id }).get());

	if (error) {
		throw new Error(
			error instanceof Error ? error.message : "Failed to fetch user profile",
		);
	}

	if (response?.error || !response?.data?.user) {
		throw new Error("User not found");
	}

	return response.data.user as UserProfile;
}
