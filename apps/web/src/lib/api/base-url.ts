const API_PREFIX = "/api";

export function getApiBaseUrl(): string {
	const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
	return `${baseUrl.replace(/\/$/, "")}${API_PREFIX}`;
}

