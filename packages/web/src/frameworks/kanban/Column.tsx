import { motion } from "motion/react";
import React from "react";
import { Card } from "./Card";
import { useVirtualization } from "./hooks/useVirtualization";
import type { DragState, KanbanColumn } from "./types";

interface ColumnProps {
	column: KanbanColumn;
	dragState: DragState;
	onPointerDown: (e: React.PointerEvent<HTMLDivElement>, cardId: string, columnId: string) => void;
	onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => void;
	onPointerUp: (e: React.PointerEvent<HTMLDivElement>) => void;
}

const ESTIMATED_ITEM_HEIGHT = 80; // Estimated card height
const COLUMN_HEIGHT = 600; // Fixed column height

export function Column({ column, dragState, onPointerDown, onPointerMove, onPointerUp }: ColumnProps) {
	const { containerRef, visibleItems, totalHeight, offsetY, handleScroll, measureItem } = useVirtualization({
		items: column.cards,
		estimatedItemHeight: ESTIMATED_ITEM_HEIGHT,
		containerHeight: COLUMN_HEIGHT,
		overscan: 3,
	});

	const isDragOver = dragState.targetColumnId === column.id;
	const isSourceColumn = dragState.sourceColumnId === column.id;
	const isDragging = dragState.isDragging;

	return (
		<motion.div
			data-column-id={column.id}
			className={`
        w-80 bg-card border border-border rounded-lg p-4
        ${isDragOver ? "bg-accent/20 border-accent" : ""}
        ${isSourceColumn && isDragging ? "opacity-75" : ""}
      `}
			onPointerMove={isDragging ? onPointerMove : undefined}
			onPointerUp={isDragging ? onPointerUp : undefined}
		>
			<h3 className="text-lg font-semibold text-card-foreground mb-4 text-center">{column.title}</h3>

			<div
				ref={containerRef}
				className="overflow-y-auto"
				style={{ height: COLUMN_HEIGHT }}
				onScroll={handleScroll}
			>
				<div style={{ height: totalHeight, position: "relative" }}>
					<div
						style={{
							transform: `translateY(${offsetY}px)`,
							position: "absolute",
							top: 0,
							left: 0,
							right: 0,
						}}
					>
						{visibleItems.map(({ item: card, index }) => {
							const actualIndex = index; // This is the actual index in the column
							return (
								<div
									key={card.id}
									className="w-full"
								>
									{/* Show drop indicator above this card if it's the drop target */}
									{isDragOver && dragState.dropIndex === actualIndex && (
										<motion.div
											initial={{ opacity: 0, scaleY: 0 }}
											animate={{ opacity: 1, scaleY: 1 }}
											className="h-0.5 bg-accent rounded-full mx-2 mb-2"
										/>
									)}

									<div
										ref={(el) => measureItem(actualIndex, el)}
										className="w-full"
									>
										<Card
											card={card}
											isDragging={dragState.draggedCardId === card.id}
											onPointerDown={onPointerDown}
											columnId={column.id}
										/>
									</div>
								</div>
							);
						})}

						{/* Show drop indicator at the end if dropping after the last card */}
						{isDragOver && dragState.dropIndex === column.cards.length && (
							<motion.div
								initial={{ opacity: 0, scaleY: 0 }}
								animate={{ opacity: 1, scaleY: 1 }}
								className="h-0.5 bg-accent rounded-full mx-2 mt-2"
							/>
						)}
					</div>
				</div>
			</div>
		</motion.div>
	);
}
