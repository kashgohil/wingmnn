import { useQuery } from "@tanstack/react-query";
import { getUser } from "../api/users.api";

export function useUserProfile(id?: string | null) {
	return useQuery({
		queryKey: ["users", id],
		queryFn: () => {
			if (!id) {
				throw new Error("User ID is required");
			}
			return getUser(id);
		},
		enabled: !!id,
		staleTime: 5 * 60 * 1000,
	});
}
