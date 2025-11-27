import { describe, expect, it } from "vitest";
import { isRichTextEmpty } from "./rich-text";

describe("isRichTextEmpty", () => {
	it("treats empty strings as empty", () => {
		expect(isRichTextEmpty("")).toBe(true);
		expect(isRichTextEmpty("   ")).toBe(true);
	});

	it("ignores HTML tags and whitespace", () => {
		expect(isRichTextEmpty("<p><br /></p>")).toBe(true);
		expect(isRichTextEmpty("<strong>&nbsp;</strong>")).toBe(true);
	});

	it("detects when meaningful text exists", () => {
		expect(isRichTextEmpty("<p>Task details</p>")).toBe(false);
		expect(isRichTextEmpty("Hello world")).toBe(false);
	});
});

