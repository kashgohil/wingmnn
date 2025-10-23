import type { Block, Selection } from "../types";
import { EditorStateManager } from "./EditorState";

export class SelectionManager {
	private stateManager: EditorStateManager;
	private listeners: Set<(selection: Selection | null) => void> = new Set();

	constructor(stateManager: EditorStateManager) {
		this.stateManager = stateManager;
	}

	getSelection(): Selection | null {
		return this.stateManager.getSelection();
	}

	setSelection(selection: Selection | null): void {
		this.stateManager.setSelection(selection);
		this.notifyListeners(selection);
	}

	clearSelection(): void {
		this.setSelection(null);
	}

	isBlockSelected(blockId: string): boolean {
		const selection = this.getSelection();
		return selection?.blockId === blockId || false;
	}

	isTextSelected(): boolean {
		const selection = this.getSelection();
		return !!(selection && !selection.isCollapsed);
	}

	getSelectedText(): string {
		const selection = this.getSelection();
		if (!selection || selection.isCollapsed) return "";

		const block = this.stateManager.getBlockById(selection.blockId);
		if (!block) return "";

		return block.content.slice(selection.startOffset, selection.endOffset);
	}

	getSelectedBlock(): Block | null {
		const selection = this.getSelection();
		if (!selection) return null;

		return this.stateManager.getBlockById(selection.blockId) || null;
	}

	// Selection manipulation methods
	expandSelection(direction: "left" | "right", amount: number = 1): void {
		const selection = this.getSelection();
		if (!selection) return;

		const block = this.stateManager.getBlockById(selection.blockId);
		if (!block) return;

		const contentLength = block.content.length;
		let newStartOffset = selection.startOffset;
		let newEndOffset = selection.endOffset;

		if (direction === "left") {
			newStartOffset = Math.max(0, selection.startOffset - amount);
		} else {
			newEndOffset = Math.min(contentLength, selection.endOffset + amount);
		}

		this.setSelection({
			...selection,
			startOffset: newStartOffset,
			endOffset: newEndOffset,
			isCollapsed: newStartOffset === newEndOffset,
		});
	}

	moveSelection(direction: "left" | "right" | "up" | "down"): void {
		const selection = this.getSelection();
		if (!selection) return;

		const blocks = this.stateManager.getState().blocks;
		const currentBlockIndex = this.stateManager.getBlockIndex(
			selection.blockId,
		);

		if (currentBlockIndex === -1) return;

		let newBlockId = selection.blockId;
		let newOffset =
			direction === "left"
				? selection.startOffset - 1
				: selection.startOffset + 1;

		// Handle block navigation
		if (direction === "up" && currentBlockIndex > 0) {
			newBlockId = blocks[currentBlockIndex - 1].id;
			newOffset = Math.min(
				newOffset,
				blocks[currentBlockIndex - 1].content.length,
			);
		} else if (direction === "down" && currentBlockIndex < blocks.length - 1) {
			newBlockId = blocks[currentBlockIndex + 1].id;
			newOffset = Math.min(
				newOffset,
				blocks[currentBlockIndex + 1].content.length,
			);
		}

		// Handle offset bounds
		const targetBlock = this.stateManager.getBlockById(newBlockId);
		if (targetBlock) {
			newOffset = Math.max(0, Math.min(newOffset, targetBlock.content.length));
		}

		this.setSelection({
			blockId: newBlockId,
			startOffset: newOffset,
			endOffset: newOffset,
			isCollapsed: true,
		});
	}

	selectAll(): void {
		const blocks = this.stateManager.getState().blocks;
		if (blocks.length === 0) return;

		const firstBlock = blocks[0];
		const lastBlock = blocks[blocks.length - 1];

		this.setSelection({
			blockId: firstBlock.id,
			startOffset: 0,
			endOffset: lastBlock.content.length,
			isCollapsed: false,
		});
	}

	selectBlock(blockId: string): void {
		const block = this.stateManager.getBlockById(blockId);
		if (!block) return;

		this.setSelection({
			blockId,
			startOffset: 0,
			endOffset: block.content.length,
			isCollapsed: false,
		});
	}

	selectWord(blockId: string, offset: number): void {
		const block = this.stateManager.getBlockById(blockId);
		if (!block) return;

		const content = block.content;
		let startOffset = offset;
		let endOffset = offset;

		// Find word boundaries
		while (startOffset > 0 && /\w/.test(content[startOffset - 1])) {
			startOffset--;
		}

		while (endOffset < content.length && /\w/.test(content[endOffset])) {
			endOffset++;
		}

		this.setSelection({
			blockId,
			startOffset,
			endOffset,
			isCollapsed: startOffset === endOffset,
		});
	}

	selectLine(blockId: string, offset: number): void {
		const block = this.stateManager.getBlockById(blockId);
		if (!block) return;

		const content = block.content;
		const lineStart = content.lastIndexOf("\n", offset - 1) + 1;
		const lineEnd = content.indexOf("\n", offset);
		const actualLineEnd = lineEnd === -1 ? content.length : lineEnd;

		this.setSelection({
			blockId,
			startOffset: lineStart,
			endOffset: actualLineEnd,
			isCollapsed: false,
		});
	}

	subscribe(listener: (selection: Selection | null) => void): () => void {
		this.listeners.add(listener);
		return () => this.listeners.delete(listener);
	}

	private notifyListeners(selection: Selection | null): void {
		this.listeners.forEach((listener) => listener(selection));
	}
}
