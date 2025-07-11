import React from "react";
import type { CardData } from "./types";

interface CardProps {
  card: CardData;
  isDragging: boolean;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, cardId: string) => void;
}

export const Card: React.FC<CardProps> = ({
  card,
  isDragging,
  onDragStart,
}) => {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    // Set data to be transferred
    e.dataTransfer.setData("text/plain", card.id);
    e.dataTransfer.effectAllowed = "move";

    // Defer the state update to allow the browser to capture the drag image
    setTimeout(() => {
      onDragStart(e, card.id);
    }, 0);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      style={{
        padding: "8px",
        margin: "4px 0",
        backgroundColor: "white",
        border: "1px solid #ccc",
        borderRadius: "4px",
        cursor: "grab",
        // Hide the original card completely when dragging
        opacity: isDragging ? 0 : 1,
        height: isDragging ? 0 : "auto",
        paddingTop: isDragging ? 0 : "8px",
        paddingBottom: isDragging ? 0 : "8px",
        marginTop: isDragging ? 0 : "4px",
        marginBottom: isDragging ? 0 : "4px",
        borderWidth: isDragging ? 0 : "1px",
        overflow: "hidden",
      }}
    >
      {card.content}
    </div>
  );
};
