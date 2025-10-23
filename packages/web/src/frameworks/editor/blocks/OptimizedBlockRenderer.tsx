import { memo, useCallback } from "react";
import type { Block, BlockProps } from "../types";
import { BlockRenderer } from "./BlockRenderer";

interface OptimizedBlockRendererProps extends BlockProps {
	block: Block;
}

// Memoized block component to prevent unnecessary re-renders
export const OptimizedBlockRenderer = memo<OptimizedBlockRendererProps>(
	({ block, isSelected, isFocused, onUpdate, onDelete, onFocus, onBlur }) => {
		// Memoize callbacks to prevent child re-renders
		const handleUpdate = useCallback(
			(updates: Partial<Block>) => {
				onUpdate(updates);
			},
			[onUpdate],
		);

		const handleDelete = useCallback(() => {
			onDelete();
		}, [onDelete]);

		const handleFocus = useCallback(() => {
			onFocus();
		}, [onFocus]);

		const handleBlur = useCallback(() => {
			onBlur();
		}, [onBlur]);

		return (
			<BlockRenderer
				block={block}
				isSelected={isSelected}
				isFocused={isFocused}
				onUpdate={handleUpdate}
				onDelete={handleDelete}
				onFocus={handleFocus}
				onBlur={handleBlur}
			/>
		);
	},
	// Custom comparison function for better performance
	(prevProps, nextProps) => {
		// Only re-render if these specific props change
		return (
			prevProps.block.id === nextProps.block.id &&
			prevProps.block.content === nextProps.block.content &&
			prevProps.block.type === nextProps.block.type &&
			JSON.stringify(prevProps.block.metadata) ===
				JSON.stringify(nextProps.block.metadata) &&
			prevProps.isSelected === nextProps.isSelected &&
			prevProps.isFocused === nextProps.isFocused
		);
	},
);

OptimizedBlockRenderer.displayName = "OptimizedBlockRenderer";
