import { useCallback, useEffect, useState } from "react";
import { EditorAPIImpl } from "./core/EditorAPI";
import { RichTextFormatter } from "./core/RichTextFormatter";
import type { Block, EditorAPI, EditorState, Selection } from "./types";

export function useEditor(initialValue: string = "") {
	const [editorAPI] = useState<EditorAPI>(() => {
		const initialBlocks: Block[] = initialValue
			? [{ id: "initial", type: "paragraph", content: initialValue }]
			: [];
		return new EditorAPIImpl(initialBlocks);
	});

	const [editorState, setEditorState] = useState<EditorState>(
		editorAPI.getState(),
	);
	const [currentSelection, setCurrentSelection] = useState<Selection | null>(
		null,
	);
	const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null);

	// Subscribe to state changes
	useEffect(() => {
		const unsubscribe = editorAPI.subscribeToState(setEditorState);
		return unsubscribe;
	}, [editorAPI]);

	// Subscribe to selection changes
	useEffect(() => {
		const unsubscribe = editorAPI.subscribeToSelection(setCurrentSelection);
		return unsubscribe;
	}, [editorAPI]);

	// Handle keyboard shortcuts
	const handleKeyDown = useCallback(
		(event: KeyboardEvent) => {
			const handled = editorAPI.handleKeyDown(event);
			if (handled) {
				event.preventDefault();
				event.stopPropagation();
			}
		},
		[editorAPI],
	);

	// Block operations
	const addBlock = useCallback(
		(type: Block["type"], content: string = "", index?: number) => {
			const block = editorAPI.createBlock(type, content);
			editorAPI.addBlock(block, index);
		},
		[editorAPI],
	);

	const updateBlock = useCallback(
		(blockId: string, updates: Partial<Block>) => {
			editorAPI.updateBlock(blockId, updates);
		},
		[editorAPI],
	);

	const deleteBlock = useCallback(
		(blockId: string) => {
			editorAPI.deleteBlock(blockId);
		},
		[editorAPI],
	);

	const moveBlock = useCallback(
		(blockId: string, newIndex: number) => {
			editorAPI.moveBlock(blockId, newIndex);
		},
		[editorAPI],
	);

	// Selection operations
	const setSelection = useCallback(
		(newSelection: Selection) => {
			editorAPI.setSelection(newSelection);
		},
		[editorAPI],
	);

	// Formatting operations
	const formatText = useCallback(
		(format: string, value?: unknown) => {
			const currentSelection = editorAPI.getSelection();
			if (currentSelection) {
				const block = editorAPI.getBlockById(currentSelection.blockId);
				if (!block) return;

				// Apply rich text formatting using RichTextFormatter
				const startOffset = currentSelection.startOffset;
				const endOffset = currentSelection.endOffset;

				// Apply rich text formatting
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
					startOffset,
					endOffset,
					value as string,
				);

				// Update the block with formatted content
				editorAPI.updateBlock(currentSelection.blockId, {
					content: richBlock.content,
					metadata: {
						...block.metadata,
						formats: richBlock.formats,
					},
				});
			} else {
				// If no selection, apply formatting to the entire block
				const blocks = editorState.blocks;
				if (blocks.length > 0) {
					const lastBlock = blocks[blocks.length - 1];
					const richBlock = RichTextFormatter.applyFormat(
						lastBlock,
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
						lastBlock.content.length,
						value as string,
					);

					editorAPI.updateBlock(lastBlock.id, {
						content: richBlock.content,
						metadata: {
							...lastBlock.metadata,
							formats: richBlock.formats,
						},
					});
				}
			}
		},
		[editorAPI, editorState.blocks],
	);

	const insertBlock = useCallback(
		(type: Block["type"]) => {
			const currentSelection = editorAPI.getSelection();
			if (currentSelection) {
				const currentIndex = editorAPI.getBlockIndex(currentSelection.blockId);
				addBlock(type, "", currentIndex + 1);
			}
		},
		[editorAPI, addBlock],
	);

	// Undo/Redo
	const undo = useCallback(() => {
		editorAPI.undo();
	}, [editorAPI]);

	const redo = useCallback(() => {
		editorAPI.redo();
	}, [editorAPI]);

	// Focus management
	const focusBlock = useCallback((blockId: string) => {
		setFocusedBlockId(blockId);
	}, []);

	const blurBlock = useCallback(() => {
		setFocusedBlockId(null);
	}, []);

	// Get current value as plain text
	const getValue = useCallback(() => {
		return editorState.blocks.map((block) => block.content).join("\n");
	}, [editorState.blocks]);

	// Set value from plain text
	const setValue = useCallback(
		(value: string) => {
			const lines = value.split("\n");
			const blocks = lines.map((line) =>
				editorAPI.createBlock("paragraph", line),
			);
			editorAPI.setState({
				...editorAPI.getState(),
				blocks,
			});
		},
		[editorAPI],
	);

	return {
		// State
		editorState,
		selection: currentSelection,
		focusedBlockId,

		// API
		editorAPI,

		// Block operations
		addBlock,
		updateBlock,
		deleteBlock,
		moveBlock,

		// Selection operations
		setSelection,

		// Formatting
		formatText,
		insertBlock,

		// History
		undo,
		redo,
		canUndo: editorAPI.canUndo(),
		canRedo: editorAPI.canRedo(),

		// Focus management
		focusBlock,
		blurBlock,

		// Value management
		getValue,
		setValue,

		// Event handlers
		handleKeyDown,
	};
}
