import type {
	Block,
	BlockType,
	EditorState as EditorStateType,
	Selection,
} from "../types";

export class EditorStateManager {
	private state: EditorStateType;
	private listeners: Set<(state: EditorStateType) => void> = new Set();

	constructor(initialBlocks: Block[] = []) {
		this.state = {
			blocks: initialBlocks,
			selection: null,
			history: [],
			historyIndex: -1,
		};
	}

	getState(): EditorStateType {
		return { ...this.state };
	}

	setState(newState: EditorStateType): void {
		this.state = { ...newState };
		this.notifyListeners();
	}

	updateBlocks(blocks: Block[]): void {
		this.saveToHistory();
		this.state.blocks = [...blocks];
		this.notifyListeners();
	}

	addBlock(block: Block, index?: number): void {
		this.saveToHistory();
		const newBlocks = [...this.state.blocks];
		const insertIndex = index !== undefined ? index : newBlocks.length;
		newBlocks.splice(insertIndex, 0, block);
		this.state.blocks = newBlocks;
		this.notifyListeners();
	}

	updateBlock(blockId: string, updates: Partial<Block>): void {
		this.saveToHistory();
		this.state.blocks = this.state.blocks.map((block) =>
			block.id === blockId ? { ...block, ...updates } : block,
		);
		this.notifyListeners();
	}

	deleteBlock(blockId: string): void {
		this.saveToHistory();
		this.state.blocks = this.state.blocks.filter(
			(block) => block.id !== blockId,
		);
		this.notifyListeners();
	}

	moveBlock(blockId: string, newIndex: number): void {
		this.saveToHistory();
		const newBlocks = [...this.state.blocks];
		const blockIndex = newBlocks.findIndex((block) => block.id === blockId);

		if (blockIndex === -1) return;

		const [block] = newBlocks.splice(blockIndex, 1);
		newBlocks.splice(newIndex, 0, block);
		this.state.blocks = newBlocks;
		this.notifyListeners();
	}

	setSelection(selection: Selection | null): void {
		this.state.selection = selection;
		this.notifyListeners();
	}

	getSelection(): Selection | null {
		return this.state.selection;
	}

	saveToHistory(): void {
		// Remove any history after current index
		this.state.history = this.state.history.slice(
			0,
			this.state.historyIndex + 1,
		);

		// Add current state to history
		this.state.history.push({ ...this.state });
		this.state.historyIndex++;

		// Limit history size
		const maxHistorySize = 50;
		if (this.state.history.length > maxHistorySize) {
			this.state.history.shift();
			this.state.historyIndex--;
		}
	}

	undo(): boolean {
		if (this.state.historyIndex > 0) {
			this.state.historyIndex--;
			this.state = { ...this.state.history[this.state.historyIndex] };
			this.notifyListeners();
			return true;
		}
		return false;
	}

	redo(): boolean {
		if (this.state.historyIndex < this.state.history.length - 1) {
			this.state.historyIndex++;
			this.state = { ...this.state.history[this.state.historyIndex] };
			this.notifyListeners();
			return true;
		}
		return false;
	}

	canUndo(): boolean {
		return this.state.historyIndex > 0;
	}

	canRedo(): boolean {
		return this.state.historyIndex < this.state.history.length - 1;
	}

	subscribe(listener: (state: EditorStateType) => void): () => void {
		this.listeners.add(listener);
		return () => this.listeners.delete(listener);
	}

	private notifyListeners(): void {
		this.listeners.forEach((listener) => listener(this.getState()));
	}

	// Utility methods
	getBlockById(blockId: string): Block | undefined {
		return this.state.blocks.find((block) => block.id === blockId);
	}

	getBlockIndex(blockId: string): number {
		return this.state.blocks.findIndex((block) => block.id === blockId);
	}

	createBlock(
		type: BlockType,
		content: string = "",
		metadata?: Record<string, TSAny>,
	): Block {
		return {
			id: this.generateId(),
			type,
			content,
			metadata,
		};
	}

	private generateId(): string {
		return `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	}
}
