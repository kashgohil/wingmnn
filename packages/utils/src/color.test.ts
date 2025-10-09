import { describe, expect, it } from "bun:test";
import {
  getContrastRatio,
  getLuminance,
  getOptimalTextClass,
  getOptimalTextColor,
  hexToRgb,
  isAccessible,
  parseColor,
  rgbStringToRgb,
} from "./color";

describe("Color Utilities", () => {
  describe("hexToRgb", () => {
    it("should convert 6-digit hex to RGB", () => {
      expect(hexToRgb("#ffffff")).toEqual({ r: 255, g: 255, b: 255 });
      expect(hexToRgb("#000000")).toEqual({ r: 0, g: 0, b: 0 });
      expect(hexToRgb("#ff0000")).toEqual({ r: 255, g: 0, b: 0 });
      expect(hexToRgb("ffffff")).toEqual({ r: 255, g: 255, b: 255 });
    });

    it("should convert 3-digit hex to RGB", () => {
      expect(hexToRgb("#fff")).toEqual({ r: 255, g: 255, b: 255 });
      expect(hexToRgb("#000")).toEqual({ r: 0, g: 0, b: 0 });
      expect(hexToRgb("#f00")).toEqual({ r: 255, g: 0, b: 0 });
      expect(hexToRgb("fff")).toEqual({ r: 255, g: 255, b: 255 });
    });

    it("should return null for invalid hex", () => {
      expect(hexToRgb("#gg0000")).toBeNull();
      expect(hexToRgb("#12345")).toBeNull();
      expect(hexToRgb("invalid")).toBeNull();
      expect(hexToRgb("")).toBeNull();
    });
  });

  describe("rgbStringToRgb", () => {
    it("should convert rgb string to RGB object", () => {
      expect(rgbStringToRgb("rgb(255, 255, 255)")).toEqual({
        r: 255,
        g: 255,
        b: 255,
      });
      expect(rgbStringToRgb("rgb(0, 0, 0)")).toEqual({ r: 0, g: 0, b: 0 });
      expect(rgbStringToRgb("rgb(255, 0, 0)")).toEqual({ r: 255, g: 0, b: 0 });
    });

    it("should convert rgba string to RGB object", () => {
      expect(rgbStringToRgb("rgba(255, 255, 255, 0.5)")).toEqual({
        r: 255,
        g: 255,
        b: 255,
      });
      expect(rgbStringToRgb("rgba(128, 64, 32, 1)")).toEqual({
        r: 128,
        g: 64,
        b: 32,
      });
    });

    it("should handle spaces in rgb string", () => {
      expect(rgbStringToRgb("rgb(255,255,255)")).toEqual({
        r: 255,
        g: 255,
        b: 255,
      });
      expect(rgbStringToRgb("rgb( 255 , 255 , 255 )")).toEqual({
        r: 255,
        g: 255,
        b: 255,
      });
    });

    it("should return null for invalid rgb string", () => {
      expect(rgbStringToRgb("invalid")).toBeNull();
      expect(rgbStringToRgb("rgb(255, 255)")).toBeNull();
      expect(rgbStringToRgb("")).toBeNull();
    });
  });

  describe("getLuminance", () => {
    it("should calculate correct luminance for white", () => {
      const luminance = getLuminance(255, 255, 255);
      expect(luminance).toBeCloseTo(1, 3);
    });

    it("should calculate correct luminance for black", () => {
      const luminance = getLuminance(0, 0, 0);
      expect(luminance).toBeCloseTo(0, 3);
    });

    it("should calculate correct luminance for red", () => {
      const luminance = getLuminance(255, 0, 0);
      expect(luminance).toBeCloseTo(0.2126, 3);
    });
  });

  describe("getContrastRatio", () => {
    it("should calculate contrast ratio between white and black", () => {
      const whiteLuminance = 1;
      const blackLuminance = 0;
      const ratio = getContrastRatio(whiteLuminance, blackLuminance);
      expect(ratio).toBeCloseTo(21, 1);
    });

    it("should calculate contrast ratio between same colors", () => {
      const luminance = 0.5;
      const ratio = getContrastRatio(luminance, luminance);
      expect(ratio).toBeCloseTo(1, 3);
    });

    it("should handle luminance values in any order", () => {
      const luminance1 = 0.8;
      const luminance2 = 0.2;
      const ratio1 = getContrastRatio(luminance1, luminance2);
      const ratio2 = getContrastRatio(luminance2, luminance1);
      expect(ratio1).toBe(ratio2);
    });
  });

  describe("parseColor", () => {
    it("should parse hex colors", () => {
      expect(parseColor("#ffffff")).toEqual({ r: 255, g: 255, b: 255 });
      expect(parseColor("#fff")).toEqual({ r: 255, g: 255, b: 255 });
      expect(parseColor("#000000")).toEqual({ r: 0, g: 0, b: 0 });
    });

    it("should parse rgb colors", () => {
      expect(parseColor("rgb(255, 255, 255)")).toEqual({
        r: 255,
        g: 255,
        b: 255,
      });
      expect(parseColor("rgba(128, 64, 32, 0.5)")).toEqual({
        r: 128,
        g: 64,
        b: 32,
      });
    });

    it("should parse named colors", () => {
      expect(parseColor("white")).toEqual({ r: 255, g: 255, b: 255 });
      expect(parseColor("black")).toEqual({ r: 0, g: 0, b: 0 });
      expect(parseColor("red")).toEqual({ r: 255, g: 0, b: 0 });
      expect(parseColor("green")).toEqual({ r: 0, g: 128, b: 0 });
    });

    it("should return null for unknown colors", () => {
      expect(parseColor("unknowncolor")).toBeNull();
      expect(parseColor("invalid-hex")).toBeNull();
      expect(parseColor("")).toBeNull();
    });
  });

  describe("getOptimalTextColor", () => {
    it("should return white for dark backgrounds", () => {
      expect(getOptimalTextColor("#000000")).toBe("white");
      expect(getOptimalTextColor("#333333")).toBe("white");
      expect(getOptimalTextColor("#0066cc")).toBe("white");
      expect(getOptimalTextColor("black")).toBe("white");
    });

    it("should return black for light backgrounds", () => {
      expect(getOptimalTextColor("#ffffff")).toBe("black");
      expect(getOptimalTextColor("#f0f0f0")).toBe("black");
      expect(getOptimalTextColor("#ffff00")).toBe("black");
      expect(getOptimalTextColor("white")).toBe("black");
    });

    it("should handle medium brightness colors", () => {
      expect(getOptimalTextColor("#808080")).toBe("black");
      expect(getOptimalTextColor("#606060")).toBe("white");
    });

    it("should fallback to white for invalid colors", () => {
      expect(getOptimalTextColor("invalid-color")).toBe("white");
    });
  });

  describe("getOptimalTextClass", () => {
    it("should return correct Tailwind classes", () => {
      expect(getOptimalTextClass("#000000")).toBe("text-white");
      expect(getOptimalTextClass("#ffffff")).toBe("text-black");
      expect(getOptimalTextClass("#0066cc")).toBe("text-white");
      expect(getOptimalTextClass("#ffff00")).toBe("text-black");
    });
  });

  describe("isAccessible", () => {
    it("should check WCAG AA compliance", () => {
      // White on black should be accessible
      expect(isAccessible("white", "black", "AA")).toBe(true);
      expect(isAccessible("#ffffff", "#000000", "AA")).toBe(true);

      // Light gray on white should not be accessible
      expect(isAccessible("#cccccc", "#ffffff", "AA")).toBe(false);

      // Dark blue on white should be accessible
      expect(isAccessible("#0066cc", "#ffffff", "AA")).toBe(true);
    });

    it("should check WCAG AAA compliance", () => {
      // White on black should be accessible for AAA
      expect(isAccessible("white", "black", "AAA")).toBe(true);

      // Some combinations that pass AA might fail AAA
      expect(isAccessible("#666666", "#ffffff", "AA")).toBe(true);
      expect(isAccessible("#666666", "#ffffff", "AAA")).toBe(false);
    });

    it("should default to AA level", () => {
      const resultAA = isAccessible("#666666", "#ffffff", "AA");
      const resultDefault = isAccessible("#666666", "#ffffff");
      expect(resultAA).toBe(resultDefault);
    });

    it("should return false for invalid colors", () => {
      expect(isAccessible("invalid", "#ffffff")).toBe(false);
      expect(isAccessible("#ffffff", "invalid")).toBe(false);
    });
  });
});
