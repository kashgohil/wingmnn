const DEFAULT_REDIRECT_PATH = "/dashboard";
const REDIRECT_STORAGE_KEY = "wingmnn::redirect-destination";

type RedirectSource = "override" | "query" | "storage" | "fallback";

function sanitizeRedirect(
	value: string | null,
	fallback: string,
	origin: string,
): string {
	if (!value) {
		return fallback;
	}

	const trimmed = value.trim();
	if (!trimmed) {
		return fallback;
	}

	try {
		const parsed = new URL(trimmed, origin);

		// Prevent open redirects by ensuring same-origin and absolute paths
		if (parsed.origin !== origin || !parsed.pathname.startsWith("/")) {
			return fallback;
		}

		return `${parsed.pathname}${parsed.search}${parsed.hash}`;
	} catch {
		return trimmed.startsWith("/") ? trimmed : fallback;
	}
}

function getStoredRedirect(): string | null {
	if (typeof window === "undefined") {
		return null;
	}
	return window.sessionStorage.getItem(REDIRECT_STORAGE_KEY);
}

function clearStoredRedirect() {
	if (typeof window === "undefined") {
		return;
	}
	window.sessionStorage.removeItem(REDIRECT_STORAGE_KEY);
}

export function rememberRedirectHint(value: string | null) {
	if (typeof window === "undefined") {
		return;
	}

	if (!value) {
		clearStoredRedirect();
		return;
	}

	const sanitized = sanitizeRedirect(
		value,
		DEFAULT_REDIRECT_PATH,
		window.location.origin,
	);

	window.sessionStorage.setItem(REDIRECT_STORAGE_KEY, sanitized);
}

function removeRedirectQueryParam() {
	if (typeof window === "undefined") {
		return;
	}

	const currentUrl = new URL(window.location.href);
	if (!currentUrl.searchParams.has("redirect")) {
		return;
	}

	currentUrl.searchParams.delete("redirect");
	const nextUrl = `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`;
	window.history.replaceState(window.history.state, "", nextUrl);
}

function getRedirectCandidate(redirectOverride?: string | null): {
	value: string | null;
	source: RedirectSource;
} {
	if (redirectOverride) {
		return { value: redirectOverride, source: "override" };
	}

	if (typeof window === "undefined") {
		return { value: null, source: "fallback" };
	}

	const params = new URLSearchParams(window.location.search);
	const fromQuery = params.get("redirect");
	if (fromQuery) {
		return { value: fromQuery, source: "query" };
	}

	const stored = getStoredRedirect();
	if (stored) {
		return { value: stored, source: "storage" };
	}

	return { value: null, source: "fallback" };
}

export function resolveRedirectDestination(
	fallback = DEFAULT_REDIRECT_PATH,
	redirectOverride?: string | null,
): string {
	if (typeof window === "undefined") {
		return fallback;
	}

	const { value } = getRedirectCandidate(redirectOverride);
	return sanitizeRedirect(value, fallback, window.location.origin);
}

/**
 * Navigates to the redirect destination if present, otherwise falls back.
 * Uses router navigation for simple paths and full browser navigation when
 * query strings or hashes are involved to avoid losing context.
 */
export function navigateWithRedirect(
	navigate: (options: { to: any }) => void,
	options?: {
		fallback?: string;
		redirectOverride?: string | null;
	},
) {
	if (typeof window === "undefined") {
		return;
	}

	const fallback = options?.fallback ?? DEFAULT_REDIRECT_PATH;
	const candidate = getRedirectCandidate(options?.redirectOverride);
	const destination = sanitizeRedirect(
		candidate.value,
		fallback,
		window.location.origin,
	);
	const hasQueryOrHash = destination.includes("?") || destination.includes("#");

	if (candidate.source === "query") {
		removeRedirectQueryParam();
	}

	if (
		candidate.source === "query" ||
		candidate.source === "storage" ||
		candidate.source === "override"
	) {
		clearStoredRedirect();
	}

	if (hasQueryOrHash) {
		window.location.assign(destination);
		return;
	}

	navigate({ to: destination });
}
