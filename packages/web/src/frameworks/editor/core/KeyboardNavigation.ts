import type { Block, Selection } from "../types";

export class KeyboardNavigation {
	/**
	 * Handle arrow key navigation
	 */
	static handleArrowKeys(
		event: KeyboardEvent,
		blocks: Block[],
		currentSelection: Selection | null,
		onSelectionChange: (selection: Selection) => void,
	): boolean {
		if (!currentSelection) return false;

		const currentBlockIndex = blocks.findIndex(
			(block) => block.id === currentSelection.blockId,
		);
		if (currentBlockIndex === -1) return false;

		const currentBlock = blocks[currentBlockIndex];
		const contentLength = currentBlock.content.length;

		switch (event.key) {
			case "ArrowUp":
				event.preventDefault();
				if (currentBlockIndex > 0) {
					const prevBlock = blocks[currentBlockIndex - 1];
					const newOffset = Math.min(
						currentSelection.startOffset,
						prevBlock.content.length,
					);
					onSelectionChange({
						blockId: prevBlock.id,
						startOffset: newOffset,
						endOffset: newOffset,
						isCollapsed: true,
					});
				}
				return true;

			case "ArrowDown":
				event.preventDefault();
				if (currentBlockIndex < blocks.length - 1) {
					const nextBlock = blocks[currentBlockIndex + 1];
					const newOffset = Math.min(
						currentSelection.startOffset,
						nextBlock.content.length,
					);
					onSelectionChange({
						blockId: nextBlock.id,
						startOffset: newOffset,
						endOffset: newOffset,
						isCollapsed: true,
					});
				}
				return true;

			case "ArrowLeft":
				if (currentSelection.startOffset > 0) {
					onSelectionChange({
						...currentSelection,
						startOffset: currentSelection.startOffset - 1,
						endOffset: currentSelection.startOffset - 1,
						isCollapsed: true,
					});
				} else if (currentBlockIndex > 0) {
					// Move to end of previous block
					const prevBlock = blocks[currentBlockIndex - 1];
					onSelectionChange({
						blockId: prevBlock.id,
						startOffset: prevBlock.content.length,
						endOffset: prevBlock.content.length,
						isCollapsed: true,
					});
				}
				return true;

			case "ArrowRight":
				if (currentSelection.startOffset < contentLength) {
					onSelectionChange({
						...currentSelection,
						startOffset: currentSelection.startOffset + 1,
						endOffset: currentSelection.startOffset + 1,
						isCollapsed: true,
					});
				} else if (currentBlockIndex < blocks.length - 1) {
					// Move to start of next block
					const nextBlock = blocks[currentBlockIndex + 1];
					onSelectionChange({
						blockId: nextBlock.id,
						startOffset: 0,
						endOffset: 0,
						isCollapsed: true,
					});
				}
				return true;

			default:
				return false;
		}
	}

	/**
	 * Handle word navigation (Ctrl+Arrow)
	 */
	static handleWordNavigation(
		event: KeyboardEvent,
		currentSelection: Selection | null,
		onSelectionChange: (selection: Selection) => void,
	): boolean {
		if (!currentSelection || !event.ctrlKey) return false;

		const isLeft = event.key === "ArrowLeft";
		const isRight = event.key === "ArrowRight";

		if (!isLeft && !isRight) return false;

		event.preventDefault();

		// This would need access to the block content to find word boundaries
		// For now, we'll implement a simplified version
		const step = isLeft ? -1 : 1;
		const newOffset = Math.max(
			0,
			Math.min(
				currentSelection.startOffset + step * 5, // Move 5 characters at a time
				// This should be replaced with actual word boundary detection
			),
		);

		onSelectionChange({
			...currentSelection,
			startOffset: newOffset,
			endOffset: newOffset,
			isCollapsed: true,
		});

		return true;
	}

	/**
	 * Handle line navigation (Home/End)
	 */
	static handleLineNavigation(
		event: KeyboardEvent,
		currentSelection: Selection | null,
		onSelectionChange: (selection: Selection) => void,
	): boolean {
		if (!currentSelection) return false;

		switch (event.key) {
			case "Home":
				event.preventDefault();
				onSelectionChange({
					...currentSelection,
					startOffset: 0,
					endOffset: 0,
					isCollapsed: true,
				});
				return true;

			case "End":
				event.preventDefault();
				// This would need access to block content length
				// For now, we'll assume a reasonable length
				const lineEnd = 100; // eslint-disable-line no-case-declarations
				onSelectionChange({
					...currentSelection,
					startOffset: lineEnd,
					endOffset: lineEnd,
					isCollapsed: true,
				});
				return true;

			default:
				return false;
		}
	}

	/**
	 * Handle selection with Shift key
	 */
	static handleSelection(
		event: KeyboardEvent,
		currentSelection: Selection | null,
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		_onSelectionChange: (selection: Selection) => void,
	): boolean {
		if (!currentSelection || !event.shiftKey) return false;

		// This would extend the current selection
		// Implementation depends on the specific key pressed
		return false;
	}

	/**
	 * Handle page navigation (Page Up/Page Down)
	 */
	static handlePageNavigation(
		event: KeyboardEvent,
		blocks: Block[],
		currentSelection: Selection | null,
		onSelectionChange: (selection: Selection) => void,
	): boolean {
		if (!currentSelection) return false;

		const currentBlockIndex = blocks.findIndex(
			(block) => block.id === currentSelection.blockId,
		);

		if (currentBlockIndex === -1) return false;

		const pageSize = 10; // Number of blocks to jump

		switch (event.key) {
			case "PageUp":
				event.preventDefault();
				const prevIndex = Math.max(0, currentBlockIndex - pageSize); // eslint-disable-line no-case-declarations
				const prevBlock = blocks[prevIndex]; // eslint-disable-line no-case-declarations
				onSelectionChange({
					blockId: prevBlock.id,
					startOffset: 0,
					endOffset: 0,
					isCollapsed: true,
				});
				return true;

			case "PageDown":
				event.preventDefault();
				// eslint-disable-next-line no-case-declarations
				const nextIndex = Math.min(
					blocks.length - 1,
					currentBlockIndex + pageSize,
				);
				const nextBlock = blocks[nextIndex]; // eslint-disable-line no-case-declarations
				onSelectionChange({
					blockId: nextBlock.id,
					startOffset: 0,
					endOffset: 0,
					isCollapsed: true,
				});
				return true;

			default:
				return false;
		}
	}

	/**
	 * Handle document navigation (Ctrl+Home/End)
	 */
	static handleDocumentNavigation(
		event: KeyboardEvent,
		blocks: Block[],
		currentSelection: Selection | null,
		onSelectionChange: (selection: Selection) => void,
	): boolean {
		if (!currentSelection || !event.ctrlKey) return false;

		switch (event.key) {
			case "Home":
				event.preventDefault();
				if (blocks.length > 0) {
					onSelectionChange({
						blockId: blocks[0].id,
						startOffset: 0,
						endOffset: 0,
						isCollapsed: true,
					});
				}
				return true;

			case "End":
				event.preventDefault();
				if (blocks.length > 0) {
					const lastBlock = blocks[blocks.length - 1];
					onSelectionChange({
						blockId: lastBlock.id,
						startOffset: lastBlock.content.length,
						endOffset: lastBlock.content.length,
						isCollapsed: true,
					});
				}
				return true;

			default:
				return false;
		}
	}

	/**
	 * Handle all keyboard navigation
	 */
	static handleNavigation(
		event: KeyboardEvent,
		blocks: Block[],
		currentSelection: Selection | null,
		onSelectionChange: (selection: Selection) => void,
	): boolean {
		return (
			this.handleArrowKeys(
				event,
				blocks,
				currentSelection,
				onSelectionChange,
			) ||
			this.handleWordNavigation(event, currentSelection, onSelectionChange) ||
			this.handleLineNavigation(event, currentSelection, onSelectionChange) ||
			this.handleSelection(event, currentSelection, onSelectionChange) ||
			this.handlePageNavigation(
				event,
				blocks,
				currentSelection,
				onSelectionChange,
			) ||
			this.handleDocumentNavigation(
				event,
				blocks,
				currentSelection,
				onSelectionChange,
			)
		);
	}
}
