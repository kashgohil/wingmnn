import { useCallback, useEffect, useMemo } from "react";
import { OptimizedBlockRenderer } from "../blocks/OptimizedBlockRenderer";
import { KeyboardNavigation } from "../core/KeyboardNavigation";
import { FloatingToolbar } from "../toolbar/FloatingToolbar";
import type { Block } from "../types";
import { useEditor } from "../useEditor";
import { VirtualScrollEditor } from "./VirtualScrollEditor";

export interface OptimizedEditorProps {
	value: string;
	onChange(value: string): void;
	placeholder?: string;
	className?: string;
	enableVirtualScrolling?: boolean;
	virtualScrollHeight?: number;
}

export function OptimizedEditor({
	value,
	onChange,
	placeholder = "Start writing...",
	className = "",
	enableVirtualScrolling = false,
	virtualScrollHeight = 400,
}: OptimizedEditorProps) {
	const {
		editorState,
		selection,
		focusedBlockId,
		addBlock,
		updateBlock,
		deleteBlock,
		focusBlock,
		blurBlock,
		formatText,
		insertBlock,
		handleKeyDown,
		setSelection,
	} = useEditor(value);

	// Performance optimization: Memoize block operations
	const handleBlockUpdate = useCallback(
		(blockId: string, updates: Partial<Block>) => {
			updateBlock(blockId, updates);
		},
		[updateBlock],
	);

	const handleBlockDelete = useCallback(
		(blockId: string) => {
			deleteBlock(blockId);
		},
		[deleteBlock],
	);

	const handleBlockFocus = useCallback(
		(blockId: string) => {
			focusBlock(blockId);
		},
		[focusBlock],
	);

	const handleBlockBlur = useCallback(() => {
		blurBlock();
	}, [blurBlock]);

	const handleFormat = useCallback(
		(format: string, value?: unknown) => {
			formatText(format, value);
		},
		[formatText],
	);

	const handleInsertBlock = useCallback(
		(type: Block["type"]) => {
			insertBlock(type);
		},
		[insertBlock],
	);

	// Enhanced keyboard navigation
	const handleEnhancedKeyDown = useCallback(
		(event: KeyboardEvent) => {
			// Handle navigation first
			if (
				KeyboardNavigation.handleNavigation(
					event,
					editorState.blocks,
					selection,
					setSelection,
				)
			) {
				event.preventDefault();
				return;
			}

			// Handle other keyboard shortcuts
			handleKeyDown(event);
		},
		[editorState.blocks, selection, setSelection, handleKeyDown],
	);

	// Handle global keyboard events
	useEffect(() => {
		const handleGlobalKeyDown = (event: KeyboardEvent) => {
			handleEnhancedKeyDown(event);
		};

		document.addEventListener("keydown", handleGlobalKeyDown);
		return () => document.removeEventListener("keydown", handleGlobalKeyDown);
	}, [handleEnhancedKeyDown]);

	// Notify parent of value changes
	useEffect(() => {
		const currentValue = editorState.blocks
			.map((block) => block.content)
			.join("\n");
		if (currentValue !== value) {
			onChange(currentValue);
		}
	}, [editorState.blocks, value, onChange]);

	// Performance optimization: Memoize block list
	const blockList = useMemo(() => {
		return editorState.blocks.map((block) => (
			<div
				key={block.id}
				className="mb-2 last:mb-0"
			>
				<OptimizedBlockRenderer
					block={block}
					isSelected={selection?.blockId === block.id}
					isFocused={focusedBlockId === block.id}
					onUpdate={(updates) => handleBlockUpdate(block.id, updates)}
					onDelete={() => handleBlockDelete(block.id)}
					onFocus={() => handleBlockFocus(block.id)}
					onBlur={handleBlockBlur}
				/>
			</div>
		));
	}, [
		editorState.blocks,
		selection,
		focusedBlockId,
		handleBlockUpdate,
		handleBlockDelete,
		handleBlockFocus,
		handleBlockBlur,
	]);

	// If no blocks exist, create an initial paragraph
	if (editorState.blocks.length === 0) {
		return (
			<div className={`editor-container ${className}`}>
				<div
					className="min-h-[200px] p-4 border border-gray-200 rounded-lg focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500"
					onClick={() => {
						if (editorState.blocks.length === 0) {
							addBlock("paragraph", "");
						}
					}}
				>
					<div className="text-gray-400 text-sm">{placeholder}</div>
				</div>
			</div>
		);
	}

	return (
		<div className={`editor-container ${className}`}>
			{enableVirtualScrolling ? (
				<VirtualScrollEditor
					blocks={editorState.blocks}
					onBlockUpdate={handleBlockUpdate}
					onBlockDelete={handleBlockDelete}
					onBlockFocus={handleBlockFocus}
					onBlockBlur={handleBlockBlur}
					selection={selection}
					focusedBlockId={focusedBlockId}
					containerHeight={virtualScrollHeight}
				/>
			) : (
				<div className="min-h-[200px] p-4 border border-gray-200 rounded-lg focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
					{blockList}
				</div>
			)}

			<FloatingToolbar
				selection={selection}
				onFormat={handleFormat}
				onInsertBlock={handleInsertBlock}
			/>
		</div>
	);
}
