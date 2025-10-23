import type { Block, Selection } from "../types";

export interface SearchResult {
	blockId: string;
	blockIndex: number;
	startOffset: number;
	endOffset: number;
	text: string;
	context: string; // Surrounding text for context
}

export interface SearchOptions {
	caseSensitive: boolean;
	wholeWord: boolean;
	useRegex: boolean;
	wrapAround: boolean;
}

export class SearchReplaceManager {
	private searchResults: SearchResult[] = [];
	private currentResultIndex = -1;
	private searchQuery = "";
	// private _replaceText = "";
	private options: SearchOptions = {
		caseSensitive: false,
		wholeWord: false,
		useRegex: false,
		wrapAround: true,
	};

	/**
	 * Search for text in blocks
	 */
	search(
		query: string,
		blocks: Block[],
		options: Partial<SearchOptions> = {},
	): SearchResult[] {
		this.searchQuery = query;
		this.options = { ...this.options, ...options };
		this.searchResults = [];

		if (!query.trim()) return this.searchResults;

		blocks.forEach((block, blockIndex) => {
			const results = this.searchInBlock(block, blockIndex);
			this.searchResults.push(...results);
		});

		return this.searchResults;
	}

	/**
	 * Search in a single block
	 */
	private searchInBlock(block: Block, blockIndex: number): SearchResult[] {
		const results: SearchResult[] = [];
		const content = block.content;

		if (!content) return results;

		let searchText = content;
		let query = this.searchQuery;

		// Apply case sensitivity
		if (!this.options.caseSensitive) {
			searchText = searchText.toLowerCase();
			query = query.toLowerCase();
		}

		// Apply regex or simple search
		if (this.options.useRegex) {
			try {
				const flags = this.options.caseSensitive ? "g" : "gi";
				const regex = new RegExp(query, flags);
				let match;

				while ((match = regex.exec(searchText)) !== null) {
					results.push({
						blockId: block.id,
						blockIndex,
						startOffset: match.index,
						endOffset: match.index + match[0].length,
						text: match[0],
						context: this.getContext(content, match.index, match[0].length),
					});
				}
			} catch (error) {
				console.error("Invalid regex pattern:", error);
			}
		} else {
			// Simple text search
			let index = 0;
			while ((index = searchText.indexOf(query, index)) !== -1) {
				// Check whole word if required
				if (this.options.wholeWord) {
					const before = index > 0 ? searchText[index - 1] : " ";
					const after =
						index + query.length < searchText.length
							? searchText[index + query.length]
							: " ";

					if (!/\w/.test(before) && !/\w/.test(after)) {
						// It's a whole word
						results.push({
							blockId: block.id,
							blockIndex,
							startOffset: index,
							endOffset: index + query.length,
							text: content.slice(index, index + query.length),
							context: this.getContext(content, index, query.length),
						});
					}
				} else {
					results.push({
						blockId: block.id,
						blockIndex,
						startOffset: index,
						endOffset: index + query.length,
						text: content.slice(index, index + query.length),
						context: this.getContext(content, index, query.length),
					});
				}

				index += query.length;
			}
		}

		return results;
	}

	/**
	 * Get context around a match
	 */
	private getContext(content: string, start: number, length: number): string {
		const contextLength = 50;
		const contextStart = Math.max(0, start - contextLength);
		const contextEnd = Math.min(content.length, start + length + contextLength);

		let context = content.slice(contextStart, contextEnd);
		if (contextStart > 0) context = "..." + context;
		if (contextEnd < content.length) context = context + "...";

		return context;
	}

	/**
	 * Navigate to next search result
	 */
	nextResult(): SearchResult | null {
		if (this.searchResults.length === 0) return null;

		this.currentResultIndex =
			(this.currentResultIndex + 1) % this.searchResults.length;
		return this.searchResults[this.currentResultIndex];
	}

	/**
	 * Navigate to previous search result
	 */
	previousResult(): SearchResult | null {
		if (this.searchResults.length === 0) return null;

		this.currentResultIndex =
			this.currentResultIndex <= 0
				? this.searchResults.length - 1
				: this.currentResultIndex - 1;

		return this.searchResults[this.currentResultIndex];
	}

	/**
	 * Get current search result
	 */
	getCurrentResult(): SearchResult | null {
		if (
			this.currentResultIndex < 0 ||
			this.currentResultIndex >= this.searchResults.length
		) {
			return null;
		}
		return this.searchResults[this.currentResultIndex];
	}

	/**
	 * Replace current match
	 */
	replaceCurrent(
		blocks: Block[],
		replaceText: string,
		onBlockUpdate: (blockId: string, updates: Partial<Block>) => void,
	): boolean {
		const current = this.getCurrentResult();
		if (!current) return false;

		const block = blocks.find((b) => b.id === current.blockId);
		if (!block) return false;

		const newContent =
			block.content.slice(0, current.startOffset) +
			replaceText +
			block.content.slice(current.endOffset);

		onBlockUpdate(current.blockId, { content: newContent });

		// Update search results after replacement
		this.updateResultsAfterReplace(current, replaceText);

		return true;
	}

	/**
	 * Replace all matches
	 */
	replaceAll(
		blocks: Block[],
		replaceText: string,
		onBlockUpdate: (blockId: string, updates: Partial<Block>) => void,
	): number {
		let replaceCount = 0;

		// Group results by block
		const blockResults = new Map<string, SearchResult[]>();
		this.searchResults.forEach((result) => {
			if (!blockResults.has(result.blockId)) {
				blockResults.set(result.blockId, []);
			}
			blockResults.get(result.blockId)!.push(result);
		});

		// Replace in each block (process in reverse order to maintain offsets)
		blockResults.forEach((results, blockId) => {
			const block = blocks.find((b) => b.id === blockId);
			if (!block) return;

			// Sort by start offset in descending order
			const sortedResults = results.sort(
				(a, b) => b.startOffset - a.startOffset,
			);

			let newContent = block.content;
			sortedResults.forEach((result) => {
				newContent =
					newContent.slice(0, result.startOffset) +
					replaceText +
					newContent.slice(result.endOffset);
				replaceCount++;
			});

			onBlockUpdate(blockId, { content: newContent });
		});

		return replaceCount;
	}

	/**
	 * Update search results after replacement
	 */
	private updateResultsAfterReplace(
		replacedResult: SearchResult,
		replaceText: string,
	): void {
		const lengthDiff = replaceText.length - replacedResult.text.length;

		// Update offsets for results in the same block that come after the replaced text
		this.searchResults.forEach((result) => {
			if (
				result.blockId === replacedResult.blockId &&
				result.startOffset > replacedResult.startOffset
			) {
				result.startOffset += lengthDiff;
				result.endOffset += lengthDiff;
			}
		});

		// Remove the replaced result from the list
		this.searchResults = this.searchResults.filter(
			(result) => result !== replacedResult,
		);

		// Adjust current index if necessary
		if (this.currentResultIndex >= this.searchResults.length) {
			this.currentResultIndex = this.searchResults.length - 1;
		}
	}

	/**
	 * Clear search results
	 */
	clearSearch(): void {
		this.searchResults = [];
		this.currentResultIndex = -1;
		this.searchQuery = "";
	}

	/**
	 * Get search statistics
	 */
	getSearchStats(): {
		totalResults: number;
		currentIndex: number;
		query: string;
	} {
		return {
			totalResults: this.searchResults.length,
			currentIndex: this.currentResultIndex + 1,
			query: this.searchQuery,
		};
	}

	/**
	 * Create selection from search result
	 */
	createSelectionFromResult(result: SearchResult): Selection {
		return {
			blockId: result.blockId,
			startOffset: result.startOffset,
			endOffset: result.endOffset,
			isCollapsed: false,
		};
	}

	/**
	 * Highlight search results in DOM
	 */
	highlightResults(container: HTMLElement): void {
		// Remove existing highlights
		const existingHighlights = container.querySelectorAll(".search-highlight");
		existingHighlights.forEach((highlight) => {
			const parent = highlight.parentNode;
			if (parent) {
				parent.replaceChild(
					document.createTextNode(highlight.textContent || ""),
					highlight,
				);
				parent.normalize();
			}
		});

		// Add new highlights
		this.searchResults.forEach((result, index) => {
			const blockElement = container.querySelector(
				`[data-block-id="${result.blockId}"]`,
			);
			if (!blockElement) return;

			this.highlightInElement(
				blockElement,
				result,
				index === this.currentResultIndex,
			);
		});
	}

	/**
	 * Highlight text in a specific element
	 */
	private highlightInElement(
		element: Element,
		result: SearchResult,
		isCurrent: boolean,
	): void {
		const textNode = this.findTextNode(element, result.startOffset);
		if (!textNode) return;

		const range = document.createRange();
		range.setStart(textNode, result.startOffset);
		range.setEnd(textNode, result.endOffset);

		const highlight = document.createElement("span");
		highlight.className = `search-highlight ${isCurrent ? "current" : ""}`;
		highlight.style.backgroundColor = isCurrent ? "#fbbf24" : "#fef3c7";
		highlight.style.padding = "1px 2px";
		highlight.style.borderRadius = "2px";

		try {
			range.surroundContents(highlight);
		} catch {
			// If surroundContents fails, try a different approach
			const contents = range.extractContents();
			highlight.appendChild(contents);
			range.insertNode(highlight);
		}
	}

	/**
	 * Find text node at specific offset
	 */
	private findTextNode(element: Element, offset: number): Text | null {
		const walker = document.createTreeWalker(
			element,
			NodeFilter.SHOW_TEXT,
			null,
		);

		let currentOffset = 0;
		let node: Node | null;

		while ((node = walker.nextNode())) {
			const textLength = node.textContent?.length || 0;
			if (currentOffset + textLength > offset) {
				return node as Text;
			}
			currentOffset += textLength;
		}

		return null;
	}
}
