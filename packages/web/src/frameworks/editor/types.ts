export type BlockType =
	| "paragraph"
	| "heading1"
	| "heading2"
	| "heading3"
	| "heading4"
	| "heading5"
	| "heading6"
	| "bulletList"
	| "numberedList"
	| "checklist"
	| "codeBlock"
	| "quote"
	| "divider";

export interface Block {
	id: string;
	type: BlockType;
	content: string;
	children?: Block[];
	parentId?: string;
	metadata?: Record<string, TSAny>;
}

export interface Selection {
	blockId: string;
	startOffset: number;
	endOffset: number;
	isCollapsed: boolean;
}

export interface EditorState {
	blocks: Block[];
	selection: Selection | null;
	history: EditorState[];
	historyIndex: number;
}

export interface EditorCommand {
	type: string;
	execute(): void;
	undo(): void;
	canExecute(): boolean;
}

export interface Plugin {
	name: string;
	version: string;
	initialize(editor: EditorAPI): void;
	destroy(): void;
	onBlockCreate?(block: Block): void;
	onBlockUpdate?(block: Block): void;
	onBlockDelete?(blockId: string): void;
	onSelectionChange?(selection: Selection | null): void;
}

export interface EditorAPI {
	getState(): EditorState;
	setState(state: EditorState): void;
	executeCommand(command: EditorCommand): void;
	addBlock(block: Block, index?: number): void;
	updateBlock(blockId: string, updates: Partial<Block>): void;
	deleteBlock(blockId: string): void;
	moveBlock(blockId: string, newIndex: number): void;
	setSelection(selection: Selection): void;
	getSelection(): Selection | null;
	undo(): void;
	redo(): void;
	canUndo(): boolean;
	canRedo(): boolean;
	registerPlugin(plugin: Plugin): void;
	unregisterPlugin(pluginName: string): void;

	// Additional methods
	createBlock(
		type: Block["type"],
		content?: string,
		metadata?: Record<string, unknown>,
	): Block;
	getBlockById(blockId: string): Block | undefined;
	getBlockIndex(blockId: string): number;
	subscribeToState(callback: (state: EditorState) => void): () => void;
	subscribeToSelection(
		callback: (selection: Selection | null) => void,
	): () => void;
	handleKeyDown(event: KeyboardEvent): boolean;
}

export interface FloatingToolbarProps {
	selection: Selection | null;
	onFormat: (format: string, value?: TSAny) => void;
	onInsertBlock: (type: BlockType) => void;
}

export interface BlockProps {
	block: Block;
	isSelected: boolean;
	isFocused: boolean;
	onUpdate: (updates: Partial<Block>) => void;
	onDelete: () => void;
	onFocus: () => void;
	onBlur: () => void;
}
