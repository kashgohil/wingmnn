import { motion } from "motion/react";
import React from "react";
import { Card } from "./Card";
import type { ColumnData } from "./types";

interface ColumnProps {
  column: ColumnData;
  draggingCardId: string | null;
  sourceColumnId: string | null;
  dropTarget: { columnId: string; index: number } | null;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, cardId: string) => void;
  onDragOver: (
    e: React.DragEvent<HTMLDivElement>,
    columnId: string,
    index: number,
  ) => void;
  onDragEnd: () => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, columnId: string) => void;
}

export function Column({
  column,
  draggingCardId,
  dropTarget,
  sourceColumnId,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDrop,
}: ColumnProps) {
  const handleDragOver = (
    e: React.DragEvent<HTMLDivElement>,
    index: number,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const middleY = rect.top + rect.height / 2;
    const newIndex = e.clientY < middleY ? index : index + 1;
    if (dropTarget?.columnId !== column.id || dropTarget?.index !== newIndex) {
      onDragOver(e, column.id, newIndex);
    }
  };

  return (
    <motion.div
      onDrop={(e) => onDrop(e, column.id)}
      onDragEnd={onDragEnd}
      className="p-2 rounded-lg border border-accent gap-2"
    >
      <h3 style={{ textAlign: "center" }}>{column.title}</h3>
      <div
        onDragOver={(e) => handleDragOver(e, column.cards.length)}
        style={{ minHeight: "50px" }}
      >
        {column.cards.map((card, index) => (
          <div key={card.id} onDragOver={(e) => handleDragOver(e, index)}>
            {dropTarget &&
              dropTarget.columnId === column.id &&
              dropTarget.index === index &&
              sourceColumnId !== column.id && (
                <div
                  style={{
                    height: "40px",
                    margin: "4px 0",
                    backgroundColor: "#e0e0e0",
                    borderRadius: "4px",
                  }}
                />
              )}
            <Card
              card={card}
              isDragging={draggingCardId === card.id}
              onDragStart={onDragStart}
            />
          </div>
        ))}
        {dropTarget &&
          dropTarget.columnId === column.id &&
          dropTarget.index === column.cards.length && (
            <div
              style={{
                height: "40px",
                margin: "4px 0",
                backgroundColor: "#e0e0e0",
                borderRadius: "4px",
              }}
            />
          )}
      </div>
    </motion.div>
  );
}
