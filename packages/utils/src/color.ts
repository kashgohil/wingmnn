export const Colors = (function () {
  /**
   * Convert hex color to RGB values
   */
  function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    // Remove # if present
    hex = hex.replace("#", "");

    // Handle 3-digit hex colors
    if (hex.length === 3) {
      hex = hex
        .split("")
        .map((char) => char + char)
        .join("");
    }

    // Validate hex format
    if (hex.length !== 6) {
      return null;
    }

    const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  }
  /**
   * Convert RGB color string to RGB values
   */
  function rgbStringToRgb(
    rgb: string,
  ): { r: number; g: number; b: number } | null {
    const match = rgb.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
    if (!match) return null;

    return {
      r: parseInt(match[1], 10),
      g: parseInt(match[2], 10),
      b: parseInt(match[3], 10),
    };
  }

  /**
   * Calculate the relative luminance of a color
   * Based on WCAG 2.1 specification
   */
  function getLuminance(r: number, g: number, b: number): number {
    // Convert RGB to sRGB
    const [rs, gs, bs] = [r, g, b].map((c) => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });

    // Calculate relative luminance
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  /**
   * Calculate contrast ratio between two colors
   * Returns a value between 1 and 21
   */
  function getContrastRatio(luminance1: number, luminance2: number): number {
    const lighter = Math.max(luminance1, luminance2);
    const darker = Math.min(luminance1, luminance2);
    return (lighter + 0.05) / (darker + 0.05);
  }

  /**
   * Parse color string and return RGB values
   * Supports hex (#ffffff, #fff) and rgb/rgba formats
   */
  function parseColor(
    color: string,
  ): { r: number; g: number; b: number } | null {
    // Try hex format first
    if (color.startsWith("#")) {
      return hexToRgb(color);
    }

    // Try rgb format
    if (color.startsWith("rgb")) {
      return rgbStringToRgb(color);
    }

    // Handle named colors (basic set)
    const namedColors: Record<string, string> = {
      white: "#ffffff",
      black: "#000000",
      red: "#ff0000",
      green: "#008000",
      blue: "#0000ff",
      yellow: "#ffff00",
      cyan: "#00ffff",
      magenta: "#ff00ff",
      gray: "#808080",
      grey: "#808080",
    };

    const namedColor = namedColors[color.toLowerCase()];
    if (namedColor) {
      return hexToRgb(namedColor);
    }

    return null;
  }

  /**
   * Get the optimal text color (black or white) for a given background color
   * Returns 'white' or 'black' based on WCAG contrast guidelines
   */
  function getOptimalTextColor(backgroundColor: string): "white" | "black" {
    const bgColor = parseColor(backgroundColor);

    if (!bgColor) {
      // Fallback to white for unknown colors
      return "white";
    }

    const bgLuminance = getLuminance(bgColor.r, bgColor.g, bgColor.b);
    const whiteLuminance = 1; // White has luminance of 1
    const blackLuminance = 0; // Black has luminance of 0

    const contrastWithWhite = getContrastRatio(bgLuminance, whiteLuminance);
    const contrastWithBlack = getContrastRatio(bgLuminance, blackLuminance);

    // Return the color with better contrast ratio
    // WCAG AA requires at least 4.5:1 for normal text
    return contrastWithWhite > contrastWithBlack ? "white" : "black";
  }

  /**
   * Get CSS class name for optimal text color
   * Returns Tailwind CSS classes for text color
   */
  function getOptimalTextClass(backgroundColor: string): string {
    const textColor = getOptimalTextColor(backgroundColor);
    return textColor === "white" ? "text-white" : "text-black";
  }

  /**
   * Check if a color combination meets WCAG accessibility standards
   */
  function isAccessible(
    foregroundColor: string,
    backgroundColor: string,
    level: "AA" | "AAA" = "AA",
  ): boolean {
    const fgColor = parseColor(foregroundColor);
    const bgColor = parseColor(backgroundColor);

    if (!fgColor || !bgColor) {
      return false;
    }

    const fgLuminance = getLuminance(fgColor.r, fgColor.g, fgColor.b);
    const bgLuminance = getLuminance(bgColor.r, bgColor.g, bgColor.b);
    const contrastRatio = getContrastRatio(fgLuminance, bgLuminance);

    // WCAG standards: AA = 4.5:1, AAA = 7:1
    const requiredRatio = level === "AAA" ? 7 : 4.5;
    return contrastRatio >= requiredRatio;
  }

  return {
    hexToRgb,
    parseColor,
    isAccessible,
    getLuminance,
    rgbStringToRgb,
    getContrastRatio,
    getOptimalTextColor,
    getOptimalTextClass,
  };
})();
