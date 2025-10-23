import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BlockRenderer } from "../blocks/BlockRenderer";
import type { Block } from "../types";

interface VirtualScrollEditorProps {
	blocks: Block[];
	onBlockUpdate: (blockId: string, updates: Partial<Block>) => void;
	onBlockDelete: (blockId: string) => void;
	onBlockFocus: (blockId: string) => void;
	onBlockBlur: () => void;
	selection: TSAny;
	focusedBlockId: string | null;
	containerHeight?: number;
	itemHeight?: number;
	overscan?: number;
}

export function VirtualScrollEditor({
	blocks,
	onBlockUpdate,
	onBlockDelete,
	onBlockFocus,
	onBlockBlur,
	selection,
	focusedBlockId,
	containerHeight = 400,
	itemHeight = 60,
	overscan = 5,
}: VirtualScrollEditorProps) {
	const [scrollTop, setScrollTop] = useState(0);
	const containerRef = useRef<HTMLDivElement>(null);

	// Calculate visible range
	const visibleRange = useMemo(() => {
		const startIndex = Math.max(
			0,
			Math.floor(scrollTop / itemHeight) - overscan,
		);
		const endIndex = Math.min(
			blocks.length - 1,
			Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan,
		);
		return { startIndex, endIndex };
	}, [scrollTop, containerHeight, itemHeight, overscan, blocks.length]);

	// Get visible blocks
	const visibleBlocks = useMemo(() => {
		return blocks.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
	}, [blocks, visibleRange]);

	// Calculate total height
	const totalHeight = blocks.length * itemHeight;

	// Handle scroll
	const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
		setScrollTop(event.currentTarget.scrollTop);
	}, []);

	// Scroll to specific block
	const scrollToBlock = useCallback(
		(blockId: string) => {
			const blockIndex = blocks.findIndex((block) => block.id === blockId);
			if (blockIndex !== -1 && containerRef.current) {
				const targetScrollTop = blockIndex * itemHeight;
				containerRef.current.scrollTo({
					top: targetScrollTop,
					behavior: "smooth",
				});
			}
		},
		[blocks, itemHeight],
	);

	// Auto-scroll to focused block
	useEffect(() => {
		if (focusedBlockId) {
			scrollToBlock(focusedBlockId);
		}
	}, [focusedBlockId, scrollToBlock]);

	return (
		<div
			ref={containerRef}
			className="overflow-auto"
			style={{ height: containerHeight }}
			onScroll={handleScroll}
		>
			<div style={{ height: totalHeight, position: "relative" }}>
				{visibleBlocks.map((block, index) => {
					const actualIndex = visibleRange.startIndex + index;
					const top = actualIndex * itemHeight;

					return (
						<div
							key={block.id}
							style={{
								position: "absolute",
								top,
								left: 0,
								right: 0,
								height: itemHeight,
							}}
						>
							<BlockRenderer
								block={block}
								isSelected={selection?.blockId === block.id}
								isFocused={focusedBlockId === block.id}
								onUpdate={(updates) => onBlockUpdate(block.id, updates)}
								onDelete={() => onBlockDelete(block.id)}
								onFocus={() => onBlockFocus(block.id)}
								onBlur={onBlockBlur}
							/>
						</div>
					);
				})}
			</div>
		</div>
	);
}
