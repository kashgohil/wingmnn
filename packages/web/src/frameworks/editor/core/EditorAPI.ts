import type {
	Block,
	EditorAPI,
	EditorCommand,
	EditorState,
	Plugin,
	Selection,
} from "../types";
import { CommandManager } from "./CommandManager";
import { EditorStateManager } from "./EditorState";
import { SelectionManager } from "./SelectionManager";

export class EditorAPIImpl implements EditorAPI {
	private stateManager: EditorStateManager;
	private commandManager: CommandManager;
	private selectionManager: SelectionManager;
	private plugins: Map<string, Plugin> = new Map();

	constructor(initialBlocks: Block[] = []) {
		this.stateManager = new EditorStateManager(initialBlocks);
		this.commandManager = new CommandManager(this.stateManager);
		this.selectionManager = new SelectionManager(this.stateManager);
	}

	getState(): EditorState {
		return this.stateManager.getState();
	}

	setState(state: EditorState): void {
		this.stateManager.setState(state);
	}

	executeCommand(command: EditorCommand): void {
		this.commandManager.executeCommand(command);
	}

	addBlock(block: Block, index?: number): void {
		const command = this.commandManager.createAddBlockCommand(block, index);
		this.executeCommand(command);
	}

	updateBlock(blockId: string, updates: Partial<Block>): void {
		const block = this.stateManager.getBlockById(blockId);
		if (!block) return;

		const command = this.commandManager.createUpdateBlockCommand(
			blockId,
			updates,
			block,
		);
		this.executeCommand(command);
	}

	deleteBlock(blockId: string): void {
		const block = this.stateManager.getBlockById(blockId);
		if (!block) return;

		const index = this.stateManager.getBlockIndex(blockId);
		const command = this.commandManager.createDeleteBlockCommand(
			blockId,
			block,
			index,
		);
		this.executeCommand(command);
	}

	moveBlock(blockId: string, newIndex: number): void {
		const currentIndex = this.stateManager.getBlockIndex(blockId);
		if (currentIndex === -1) return;

		const command = this.commandManager.createMoveBlockCommand(
			blockId,
			currentIndex,
			newIndex,
		);
		this.executeCommand(command);
	}

	setSelection(selection: Selection): void {
		const command = this.commandManager.createSetSelectionCommand(selection);
		this.executeCommand(command);
	}

	getSelection(): Selection | null {
		return this.selectionManager.getSelection();
	}

	undo(): void {
		if (this.stateManager.undo()) {
			this.notifyPlugins("onSelectionChange", this.getSelection());
		}
	}

	redo(): void {
		if (this.stateManager.redo()) {
			this.notifyPlugins("onSelectionChange", this.getSelection());
		}
	}

	canUndo(): boolean {
		return this.stateManager.canUndo();
	}

	canRedo(): boolean {
		return this.stateManager.canRedo();
	}

	registerPlugin(plugin: Plugin): void {
		this.plugins.set(plugin.name, plugin);
		plugin.initialize(this);
	}

	unregisterPlugin(pluginName: string): void {
		const plugin = this.plugins.get(pluginName);
		if (plugin) {
			plugin.destroy();
			this.plugins.delete(pluginName);
		}
	}

	// Additional utility methods
	createBlock(
		type: Block["type"],
		content: string = "",
		metadata?: Record<string, unknown>,
	): Block {
		return this.stateManager.createBlock(type, content, metadata);
	}

	getBlockById(blockId: string): Block | undefined {
		return this.stateManager.getBlockById(blockId);
	}

	getBlockIndex(blockId: string): number {
		return this.stateManager.getBlockIndex(blockId);
	}

	subscribeToState(callback: (state: EditorState) => void): () => void {
		return this.stateManager.subscribe(callback);
	}

	subscribeToSelection(
		callback: (selection: Selection | null) => void,
	): () => void {
		return this.selectionManager.subscribe(callback);
	}

	// Plugin notification system
	private notifyPlugins(event: string, ...args: TSAny[]): void {
		this.plugins.forEach((plugin) => {
			switch (event) {
				case "onBlockCreate":
					plugin.onBlockCreate?.(args[0]);
					break;
				case "onBlockUpdate":
					plugin.onBlockUpdate?.(args[0]);
					break;
				case "onBlockDelete":
					plugin.onBlockDelete?.(args[0]);
					break;
				case "onSelectionChange":
					plugin.onSelectionChange?.(args[0]);
					break;
			}
		});
	}

	// Keyboard shortcut handling
	handleKeyDown(event: KeyboardEvent): boolean {
		// Handle common shortcuts
		if (event.ctrlKey || event.metaKey) {
			switch (event.key) {
				case "z":
					if (event.shiftKey) {
						this.redo();
					} else {
						this.undo();
					}
					return true;
				case "y":
					this.redo();
					return true;
				case "a":
					this.selectAll();
					return true;
			}
		}

		// Handle Enter key for new blocks
		if (event.key === "Enter") {
			this.handleEnterKey();
			return true;
		}

		// Handle Backspace for block deletion
		if (event.key === "Backspace") {
			return this.handleBackspaceKey();
		}

		return false;
	}

	private handleEnterKey(): void {
		const selection = this.getSelection();
		if (!selection) return;

		const currentBlock = this.getBlockById(selection.blockId);
		if (!currentBlock) return;

		// Create new paragraph block
		const newBlock = this.createBlock("paragraph");
		const currentIndex = this.getBlockIndex(selection.blockId);

		this.addBlock(newBlock, currentIndex + 1);
		this.setSelection({
			blockId: newBlock.id,
			startOffset: 0,
			endOffset: 0,
			isCollapsed: true,
		});
	}

	private handleBackspaceKey(): boolean {
		const selection = this.getSelection();
		if (!selection) return false;

		const currentBlock = this.getBlockById(selection.blockId);
		if (!currentBlock) return false;

		// If at start of block and not first block, merge with previous
		if (selection.startOffset === 0 && selection.isCollapsed) {
			const currentIndex = this.getBlockIndex(selection.blockId);
			if (currentIndex > 0) {
				const previousBlock = this.getBlockById(
					this.stateManager.getState().blocks[currentIndex - 1].id,
				);
				if (previousBlock) {
					// Merge blocks
					this.updateBlock(previousBlock.id, {
						content: previousBlock.content + currentBlock.content,
					});
					this.deleteBlock(currentBlock.id);
					this.setSelection({
						blockId: previousBlock.id,
						startOffset: previousBlock.content.length,
						endOffset: previousBlock.content.length,
						isCollapsed: true,
					});
					return true;
				}
			}
		}

		return false;
	}

	private selectAll(): void {
		this.selectionManager.selectAll();
	}
}
