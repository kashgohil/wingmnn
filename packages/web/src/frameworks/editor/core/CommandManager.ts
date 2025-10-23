import type { Block, EditorCommand, Selection } from "../types";
import { EditorStateManager } from "./EditorState";

export class CommandManager {
	private stateManager: EditorStateManager;

	constructor(stateManager: EditorStateManager) {
		this.stateManager = stateManager;
	}

	executeCommand(command: EditorCommand): boolean {
		if (command.canExecute()) {
			command.execute();
			return true;
		}
		return false;
	}

	// Block Commands
	createAddBlockCommand(block: Block, index?: number): EditorCommand {
		return {
			type: "ADD_BLOCK",
			execute: () => {
				this.stateManager.addBlock(block, index);
			},
			undo: () => {
				this.stateManager.deleteBlock(block.id);
			},
			canExecute: () => true,
		};
	}

	createUpdateBlockCommand(
		blockId: string,
		updates: Partial<Block>,
		previousBlock: Block,
	): EditorCommand {
		return {
			type: "UPDATE_BLOCK",
			execute: () => {
				this.stateManager.updateBlock(blockId, updates);
			},
			undo: () => {
				this.stateManager.updateBlock(blockId, previousBlock);
			},
			canExecute: () => !!this.stateManager.getBlockById(blockId),
		};
	}

	createDeleteBlockCommand(
		blockId: string,
		block: Block,
		index: number,
	): EditorCommand {
		return {
			type: "DELETE_BLOCK",
			execute: () => {
				this.stateManager.deleteBlock(blockId);
			},
			undo: () => {
				this.stateManager.addBlock(block, index);
			},
			canExecute: () => !!this.stateManager.getBlockById(blockId),
		};
	}

	createMoveBlockCommand(
		blockId: string,
		fromIndex: number,
		toIndex: number,
	): EditorCommand {
		return {
			type: "MOVE_BLOCK",
			execute: () => {
				this.stateManager.moveBlock(blockId, toIndex);
			},
			undo: () => {
				this.stateManager.moveBlock(blockId, fromIndex);
			},
			canExecute: () => {
				const block = this.stateManager.getBlockById(blockId);
				return !!block && fromIndex !== toIndex;
			},
		};
	}

	// Selection Commands
	createSetSelectionCommand(selection: Selection | null): EditorCommand {
		return {
			type: "SET_SELECTION",
			execute: () => {
				this.stateManager.setSelection(selection);
			},
			undo: () => {
				// Selection changes don't need undo
			},
			canExecute: () => true,
		};
	}

	// Text Formatting Commands
	createFormatTextCommand(
		blockId: string,
		format: string,
		value?: TSAny,
	): EditorCommand {
		const block = this.stateManager.getBlockById(blockId);
		if (!block) {
			return this.createNoOpCommand();
		}

		const previousBlock = { ...block };
		const previousMetadata = { ...block.metadata };

		return {
			type: "FORMAT_TEXT",
			execute: () => {
				// Import RichTextFormatter dynamically
				import("./RichTextFormatter").then(({ RichTextFormatter }) => {
					// This would need the selection range, but for now we'll apply to the whole block
					const richBlock = RichTextFormatter.applyFormat(
						block,
						format as
							| "bold"
							| "italic"
							| "underline"
							| "strikethrough"
							| "code"
							| "link"
							| "textColor"
							| "backgroundColor",
						0,
						block.content.length,
						value as string,
					);

					this.stateManager.updateBlock(blockId, {
						content: richBlock.content,
						metadata: {
							...block.metadata,
							formats: richBlock.formats,
						},
					});
				});
			},
			undo: () => {
				this.stateManager.updateBlock(blockId, {
					content: previousBlock.content,
					metadata: previousMetadata,
				});
			},
			canExecute: () => !!block,
		};
	}

	// Batch Commands
	createBatchCommand(commands: EditorCommand[]): EditorCommand {
		return {
			type: "BATCH",
			execute: () => {
				commands.forEach((command) => command.execute());
			},
			undo: () => {
				commands.reverse().forEach((command) => command.undo());
			},
			canExecute: () => commands.every((command) => command.canExecute()),
		};
	}

	private createNoOpCommand(): EditorCommand {
		return {
			type: "NO_OP",
			execute: () => {},
			undo: () => {},
			canExecute: () => false,
		};
	}
}
