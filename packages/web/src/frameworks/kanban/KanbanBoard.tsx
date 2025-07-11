import React, { useState } from "react";
import { Column } from "./Column";
import { initialColumns } from "./data";
import type { ColumnData } from "./types";

export const KanbanBoard: React.FC = () => {
  const [columns, setColumns] = useState<ColumnData[]>(initialColumns);
  const [draggingCardId, setDraggingCardId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<{
    columnId: string;
    index: number;
  } | null>(null);
  const [sourceColumnId, setSourceColumnId] = useState<string | null>(null);

  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    cardId: string,
  ) => {
    setDraggingCardId(cardId);
    const sourceCol = columns.find((col) =>
      col.cards.some((card) => card.id === cardId),
    );
    if (sourceCol) {
      setSourceColumnId(sourceCol.id);
    }
  };

  const handleDragEnd = () => {
    setDraggingCardId(null);
    setSourceColumnId(null);
    setDropTarget(null);
  };

  const handleDragOver = (
    e: React.DragEvent<HTMLDivElement>,
    columnId: string,
    index: number,
  ) => {
    e.preventDefault();
    setDropTarget({ columnId, index });
  };

  const handleDrop = (
    e: React.DragEvent<HTMLDivElement>,
    targetColumnId: string,
  ) => {
    if (!draggingCardId) return;

    const sourceColumn = columns.find((col) =>
      col.cards.some((card) => card.id === draggingCardId),
    );
    if (!sourceColumn) return;

    const cardToMove = sourceColumn.cards.find(
      (card) => card.id === draggingCardId,
    );
    if (!cardToMove) return;

    if (sourceColumn.id === targetColumnId) {
      // Reorder within the same column
      const newCards = [...sourceColumn.cards];
      const cardIndex = newCards.findIndex(
        (card) => card.id === draggingCardId,
      );
      newCards.splice(cardIndex, 1);
      const dropIndex = dropTarget ? dropTarget.index : newCards.length;
      newCards.splice(dropIndex, 0, cardToMove);

      const newColumns = columns.map((col) => {
        if (col.id === sourceColumn.id) {
          return { ...col, cards: newCards };
        }
        return col;
      });
      setColumns(newColumns);
    } else {
      // Move to a different column
      const newSourceCards = sourceColumn.cards.filter(
        (card) => card.id !== draggingCardId,
      );

      const newColumns = columns.map((col) => {
        if (col.id === sourceColumn.id) {
          return { ...col, cards: newSourceCards };
        }
        return col;
      });

      const finalColumns = newColumns.map((col) => {
        if (col.id === targetColumnId) {
          const newCards = [...col.cards];
          const dropIndex = dropTarget ? dropTarget.index : newCards.length;
          newCards.splice(dropIndex, 0, cardToMove);
          return { ...col, cards: newCards };
        }
        return col;
      });
      setColumns(finalColumns);
    }

    setDraggingCardId(null);
    setDropTarget(null);
  };

  return (
    <div className="flex justify-center p-4 items-start gap-4 h-full">
      {columns.map((column) => (
        <Column
          key={column.id}
          column={column}
          draggingCardId={draggingCardId}
          dropTarget={dropTarget}
          sourceColumnId={sourceColumnId}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onDragEnd={handleDragEnd}
        />
      ))}
    </div>
  );
};
