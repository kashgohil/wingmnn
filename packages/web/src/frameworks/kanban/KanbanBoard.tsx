import React, { useCallback, useState } from "react";
import { Column } from "./Column";
import { DragGhost } from "./DragGhost";
import { useDragAndDrop } from "./hooks/useDragAndDrop";
import type { KanbanColumn } from "./types";

interface Props {
	columns: Array<KanbanColumn>;
}

export function KanbanBoard(props: Props) {
	const [columns, setColumns] = useState<KanbanColumn[]>(props.columns);

	const handleCardMove = useCallback(
		(cardId: string, sourceColumnId: string, targetColumnId: string, targetIndex: number) => {
			setColumns((prevColumns) => {
				const newColumns = [...prevColumns];

				// Find source and target columns
				const sourceColumnIndex = newColumns.findIndex((col) => col.id === sourceColumnId);
				const targetColumnIndex = newColumns.findIndex((col) => col.id === targetColumnId);

				if (sourceColumnIndex === -1 || targetColumnIndex === -1) return prevColumns;

				const sourceColumn = newColumns[sourceColumnIndex];
				const targetColumn = newColumns[targetColumnIndex];

				// Find the card to move
				const cardToMove = sourceColumn.cards.find((card) => card.id === cardId);
				if (!cardToMove) return prevColumns;

				// If moving within the same column, handle reordering
				if (sourceColumnId === targetColumnId) {
					const newCards = [...sourceColumn.cards];
					const currentIndex = newCards.findIndex((card) => card.id === cardId);
					if (currentIndex === -1) return prevColumns;

					// Remove the card from its current position
					newCards.splice(currentIndex, 1);

					// Insert at the new position (adjust index if needed)
					const insertIndex = currentIndex < targetIndex ? targetIndex - 1 : targetIndex;
					newCards.splice(insertIndex, 0, cardToMove);

					newColumns[sourceColumnIndex] = { ...sourceColumn, cards: newCards };
				} else {
					// Moving between different columns
					// Remove card from source column
					const newSourceCards = sourceColumn.cards.filter((card) => card.id !== cardId);
					newColumns[sourceColumnIndex] = {
						...sourceColumn,
						cards: newSourceCards,
					};

					// Add card to target column at the specified index
					const newTargetCards = [...targetColumn.cards];
					newTargetCards.splice(targetIndex, 0, cardToMove);
					newColumns[targetColumnIndex] = {
						...targetColumn,
						cards: newTargetCards,
					};
				}

				return newColumns;
			});
		},
		[]
	);

	const { dragState, ghostRef, handlePointerDown, handlePointerMove, handlePointerUp } = useDragAndDrop({
		onCardMove: handleCardMove,
	});

	// Find the dragged card for the ghost
	const draggedCard = dragState.draggedCardId
		? columns.flatMap((col) => col.cards).find((card) => card.id === dragState.draggedCardId) || null
		: null;

	return (
		<div className="flex px-4 pb-4 items-start gap-6 h-full overflow-x-auto">
			{columns.map((column) => (
				<Column
					key={column.id}
					column={column}
					dragState={dragState}
					onPointerUp={handlePointerUp}
					onPointerDown={handlePointerDown}
					onPointerMove={handlePointerMove}
				/>
			))}

			<DragGhost
				card={draggedCard}
				dragState={dragState}
				ghostRef={ghostRef as React.RefObject<HTMLDivElement>}
			/>
		</div>
	);
}
