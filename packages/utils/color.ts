export function getTranslucentColor(hex: string, alpha = 0.35): string {
	if (!hex || typeof hex !== "string" || !hex.startsWith("#")) {
		return `rgba(128, 128, 128, ${alpha})`;
	}

	let normalized = hex.slice(1);

	// Expand shorthand hex (#abc -> #aabbcc)
	if (normalized.length === 3) {
		normalized = normalized
			.split("")
			.map((c) => c + c)
			.join("");
	}

	if (normalized.length !== 6) {
		return `rgba(128, 128, 128, ${alpha})`;
	}

	const r = parseInt(normalized.slice(0, 2), 16);
	const g = parseInt(normalized.slice(2, 4), 16);
	const b = parseInt(normalized.slice(4, 6), 16);

	if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
		return `rgba(128, 128, 128, ${alpha})`;
	}

	return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Calculates the relative luminance of a color using the WCAG formula.
 * Returns a value between 0 (darkest) and 1 (lightest).
 */
function getRelativeLuminance(r: number, g: number, b: number): number {
	const [rs, gs, bs] = [r, g, b].map((val) => {
		const normalized = val / 255;
		return normalized <= 0.03928
			? normalized / 12.92
			: Math.pow((normalized + 0.055) / 1.055, 2.4);
	});

	return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Parses a hex color string and returns RGB values.
 * Handles both 3-digit (#abc) and 6-digit (#aabbcc) hex formats.
 */
function parseHexColor(
	hex: string,
): { r: number; g: number; b: number } | null {
	if (!hex || typeof hex !== "string" || !hex.startsWith("#")) {
		return null;
	}

	let normalized = hex.slice(1);

	// Expand shorthand hex (#abc -> #aabbcc)
	if (normalized.length === 3) {
		normalized = normalized
			.split("")
			.map((c) => c + c)
			.join("");
	}

	if (normalized.length !== 6) {
		return null;
	}

	const r = parseInt(normalized.slice(0, 2), 16);
	const g = parseInt(normalized.slice(2, 4), 16);
	const b = parseInt(normalized.slice(4, 6), 16);

	if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
		return null;
	}

	return { r, g, b };
}

/**
 * Determines the best contrasting text color (black or white) for a given background color.
 * Uses WCAG relative luminance calculation to ensure proper contrast.
 *
 * @param backgroundColor - A hex color string (e.g., "#ff0000" or "#f00")
 * @param lightText - The color to use for dark backgrounds (default: "#ffffff")
 * @param darkText - The color to use for light backgrounds (default: "#000000")
 * @returns A hex color string that contrasts well with the background
 *
 * @example
 * ```ts
 * getContrastingTextColor("#ff0000") // Returns "#ffffff" (white text on red)
 * getContrastingTextColor("#ffff00") // Returns "#000000" (black text on yellow)
 * ```
 */
export function getContrastingTextColor(
	backgroundColor: string,
	lightText = "#ffffff",
	darkText = "#000000",
): string {
	const rgb = parseHexColor(backgroundColor);

	if (!rgb) {
		// Default to dark text if color parsing fails
		return darkText;
	}

	const luminance = getRelativeLuminance(rgb.r, rgb.g, rgb.b);

	// Use a threshold of 0.5 - if luminance is above 0.5, use dark text, otherwise use light text
	// This ensures good contrast for readability
	return luminance > 0.5 ? darkText : lightText;
}
