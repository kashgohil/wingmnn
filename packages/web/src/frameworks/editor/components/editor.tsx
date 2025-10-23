import { useCallback, useEffect, useMemo } from "react";
import { BlockRenderer } from "../blocks/BlockRenderer";
import { AutoSaveManager } from "../core/AutoSaveManager";
import { PerformanceOptimizer } from "../core/PerformanceOptimizer";
import { FloatingToolbar } from "../toolbar/FloatingToolbar";
import type { Block } from "../types";
import { useEditor } from "../useEditor";

export interface EditorProps {
	value: string;
	onChange(value: string): void;
	placeholder?: string;
	className?: string;
	enableAutoSave?: boolean;
	enableDragDrop?: boolean;
	enablePerformanceOptimization?: boolean;
}

export function Editor({
	value,
	onChange,
	placeholder = "Start writing...",
	className = "",
	enableAutoSave = false,
	enableDragDrop = false,
	enablePerformanceOptimization = true,
}: EditorProps) {
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
	} = useEditor(value);

	// Handle global keyboard events
	useEffect(() => {
		const handleGlobalKeyDown = (event: KeyboardEvent) => {
			handleKeyDown(event);
		};

		document.addEventListener("keydown", handleGlobalKeyDown);
		return () => document.removeEventListener("keydown", handleGlobalKeyDown);
	}, [handleKeyDown]);

	// Performance optimization: Debounced onChange
	const debouncedOnChange = useMemo(
		() => PerformanceOptimizer.debounce(onChange, 300),
		[onChange],
	);

	// Notify parent of value changes
	useEffect(() => {
		const currentValue = editorState.blocks
			.map((block) => block.content)
			.join("\n");
		if (currentValue !== value) {
			if (enablePerformanceOptimization) {
				debouncedOnChange(currentValue);
			} else {
				onChange(currentValue);
			}
		}
	}, [
		editorState.blocks,
		value,
		onChange,
		debouncedOnChange,
		enablePerformanceOptimization,
	]);

	// Auto-save functionality
	useEffect(() => {
		if (!enableAutoSave) return;

		const autoSaveManager = new AutoSaveManager({
			enabled: true,
			interval: 5000,
			maxRetries: 3,
			storageKey: "editor-autosave",
			onSave: AutoSaveManager.createLocalStorageSave("editor-autosave"),
			onLoad: AutoSaveManager.createLocalStorageLoad("editor-autosave"),
			onError: (error) => console.error("Auto-save error:", error),
		});

		autoSaveManager.start();

		return () => {
			autoSaveManager.stop();
		};
	}, [enableAutoSave]);

	// Drag and drop functionality
	useEffect(() => {
		if (!enableDragDrop) return;

		// Setup drag and drop for blocks
		// This would be implemented based on the specific requirements
		// const dragDropManager = new DragDropManager();

		return () => {
			// Cleanup drag and drop
		};
	}, [enableDragDrop]);

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
		(format: string, value?: TSAny) => {
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
			<div className="min-h-[200px] p-4 border border-gray-200 rounded-lg focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
				{editorState.blocks.map((block) => (
					<div
						key={block.id}
						className="mb-2 last:mb-0"
					>
						<BlockRenderer
							block={block}
							isSelected={selection?.blockId === block.id}
							isFocused={focusedBlockId === block.id}
							onUpdate={(updates) => handleBlockUpdate(block.id, updates)}
							onDelete={() => handleBlockDelete(block.id)}
							onFocus={() => handleBlockFocus(block.id)}
							onBlur={handleBlockBlur}
						/>
					</div>
				))}
			</div>

			<FloatingToolbar
				selection={selection}
				onFormat={handleFormat}
				onInsertBlock={handleInsertBlock}
			/>
		</div>
	);
}
