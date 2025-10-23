import type { Block } from "../types";

export interface RichTextFormat {
	type:
		| "bold"
		| "italic"
		| "underline"
		| "strikethrough"
		| "code"
		| "link"
		| "textColor"
		| "backgroundColor";
	start: number;
	end: number;
	value?: string; // For links and colors
}

export interface RichTextBlock extends Block {
	formats?: RichTextFormat[];
}

export class RichTextFormatter {
	/**
	 * Apply formatting to a block's content
	 */
	static applyFormat(
		block: Block,
		format: RichTextFormat["type"],
		start: number,
		end: number,
		value?: string,
	): RichTextBlock {
		const richBlock = block as RichTextBlock;
		const formats = richBlock.formats || [];

		// Remove overlapping formats in the same range
		const filteredFormats = formats.filter(
			(f) => !(f.start < end && f.end > start),
		);

		// Add new format
		const newFormat: RichTextFormat = {
			type: format,
			start,
			end,
			value,
		};

		return {
			...richBlock,
			formats: [...filteredFormats, newFormat].sort(
				(a, b) => a.start - b.start,
			),
		};
	}

	/**
	 * Remove formatting from a block
	 */
	static removeFormat(
		block: RichTextBlock,
		format: RichTextFormat["type"],
		start: number,
		end: number,
	): RichTextBlock {
		const formats = block.formats || [];
		const filteredFormats = formats.filter(
			(f) => !(f.type === format && f.start === start && f.end === end),
		);

		return {
			...block,
			formats: filteredFormats,
		};
	}

	/**
	 * Get all formats at a specific position
	 */
	static getFormatsAtPosition(
		block: RichTextBlock,
		position: number,
	): RichTextFormat[] {
		const formats = block.formats || [];
		return formats.filter((f) => position >= f.start && position < f.end);
	}

	/**
	 * Check if a range has a specific format
	 */
	static hasFormat(
		block: RichTextBlock,
		format: RichTextFormat["type"],
		start: number,
		end: number,
	): boolean {
		const formats = block.formats || [];
		return formats.some(
			(f) => f.type === format && f.start <= start && f.end >= end,
		);
	}

	/**
	 * Render formatted content to HTML
	 */
	static renderToHTML(block: RichTextBlock): string {
		if (!block.formats || block.formats.length === 0) {
			return block.content;
		}

		let html = "";
		let lastIndex = 0;

		// Sort formats by start position
		const sortedFormats = [...block.formats].sort((a, b) => a.start - b.start);

		for (const format of sortedFormats) {
			// Add text before format
			if (format.start > lastIndex) {
				html += this.escapeHTML(block.content.slice(lastIndex, format.start));
			}

			// Add formatted text
			const formatText = block.content.slice(format.start, format.end);
			const escapedText = this.escapeHTML(formatText);

			switch (format.type) {
				case "bold":
					html += `<strong>${escapedText}</strong>`;
					break;
				case "italic":
					html += `<em>${escapedText}</em>`;
					break;
				case "underline":
					html += `<u>${escapedText}</u>`;
					break;
				case "strikethrough":
					html += `<s>${escapedText}</s>`;
					break;
				case "code":
					html += `<code>${escapedText}</code>`;
					break;
				case "link":
					html += `<a href="${format.value || "#"}">${escapedText}</a>`;
					break;
				case "textColor":
					html += `<span style="color: ${
						format.value || "#000000"
					}">${escapedText}</span>`;
					break;
				case "backgroundColor":
					html += `<span style="background-color: ${
						format.value || "#ffffff"
					}">${escapedText}</span>`;
					break;
			}

			lastIndex = format.end;
		}

		// Add remaining text
		if (lastIndex < block.content.length) {
			html += this.escapeHTML(block.content.slice(lastIndex));
		}

		return html;
	}

	/**
	 * Parse HTML to extract formats
	 */
	static parseFromHTML(html: string): {
		content: string;
		formats: RichTextFormat[];
	} {
		const tempDiv = document.createElement("div");
		tempDiv.innerHTML = html;

		const formats: RichTextFormat[] = [];
		let content = "";

		const processNode = (node: Node, offset: number): number => {
			if (node.nodeType === Node.TEXT_NODE) {
				const text = node.textContent || "";
				content += text;
				return offset + text.length;
			}

			if (node.nodeType === Node.ELEMENT_NODE) {
				const element = node as Element;
				const startOffset = offset;

				// Process child nodes
				let currentOffset = offset;
				for (const child of Array.from(node.childNodes)) {
					currentOffset = processNode(child, currentOffset);
				}

				// Add format based on tag
				const tagName = element.tagName.toLowerCase();
				let formatType: RichTextFormat["type"] | null = null;

				switch (tagName) {
					case "strong":
					case "b":
						formatType = "bold";
						break;
					case "em":
					case "i":
						formatType = "italic";
						break;
					case "u":
						formatType = "underline";
						break;
					case "s":
					case "strike":
						formatType = "strikethrough";
						break;
					case "code":
						formatType = "code";
						break;
					case "a":
						formatType = "link";
						break;
					case "span": {
						// Check for color styles
						const style = element.getAttribute("style");
						if (style) {
							if (style.includes("color:")) {
								formatType = "textColor";
							} else if (style.includes("background-color:")) {
								formatType = "backgroundColor";
							}
						}
						break;
					}
				}

				if (formatType) {
					formats.push({
						type: formatType,
						start: startOffset,
						end: currentOffset,
						value: element.getAttribute("href") || undefined,
					});
				}

				return currentOffset;
			}

			return offset;
		};

		processNode(tempDiv, 0);

		return { content, formats };
	}

	/**
	 * Escape HTML characters
	 */
	private static escapeHTML(text: string): string {
		const div = document.createElement("div");
		div.textContent = text;
		return div.innerHTML;
	}

	/**
	 * Merge overlapping formats
	 */
	static mergeFormats(formats: RichTextFormat[]): RichTextFormat[] {
		if (formats.length <= 1) return formats;

		const sorted = [...formats].sort((a, b) => a.start - b.start);
		const merged: RichTextFormat[] = [];

		for (const format of sorted) {
			const last = merged[merged.length - 1];

			if (!last || last.end < format.start) {
				merged.push(format);
			} else if (last.type === format.type && last.value === format.value) {
				// Merge overlapping formats of the same type
				last.end = Math.max(last.end, format.end);
			} else {
				// Handle overlapping formats of different types
				if (last.end > format.start) {
					// Split the last format
					const splitFormat = { ...last };
					last.end = format.start;
					merged.push(splitFormat);
				}
				merged.push(format);
			}
		}

		return merged;
	}
}
