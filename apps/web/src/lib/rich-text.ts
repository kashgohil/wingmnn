import DOMPurify from "dompurify";

let purifier: typeof DOMPurify | null = null;

function getPurifier(): typeof DOMPurify | null {
	if (purifier) {
		return purifier;
	}

	if (typeof window === "undefined") {
		return null;
	}

	purifier = DOMPurify;
	return purifier;
}

const STRIP_TAGS_REGEX = /<[^>]*>/g;
const NBSP_REGEX = /&nbsp;/g;

export function isRichTextEmpty(value?: string | null): boolean {
	if (!value) {
		return true;
	}

	const stripped = value
		.replace(STRIP_TAGS_REGEX, " ")
		.replace(NBSP_REGEX, " ")
		.trim();

	return stripped.length === 0;
}

export function sanitizeRichText(value?: string | null): string {
	if (!value) {
		return "";
	}

	const trimmed = value.trim();
	if (!trimmed) {
		return "";
	}

	const purifierInstance = getPurifier();
	if (!purifierInstance) {
		return trimmed;
	}

	return purifierInstance.sanitize(trimmed, { USE_PROFILES: { html: true } });
}

