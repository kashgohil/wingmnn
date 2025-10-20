import { motion } from "motion/react";
import React from "react";
import type { KanbanCard } from "./types";

interface CardProps {
	card: KanbanCard;
	isDragging: boolean;
	onPointerDown: (e: React.PointerEvent<HTMLDivElement>, cardId: string, columnId: string) => void;
	columnId: string;
}

export const Card: React.FC<CardProps> = ({ card, isDragging, onPointerDown, columnId }) => {
	const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
		onPointerDown(e, card.id, columnId);
	};

	return (
		<motion.div
			data-card-id={card.id}
			data-column-id={columnId}
			onPointerDown={handlePointerDown}
			className={`
        p-3 mb-2 bg-card border border-border rounded-lg cursor-grab
        hover:shadow-md transition-shadow duration-200
        ${isDragging ? "opacity-50 scale-95" : "opacity-100 scale-100"}
      `}
			whileTap={{ scale: 0.98 }}
			transition={{ duration: 0.1 }}
		>
			<div className="text-sm font-medium text-card-foreground break-words whitespace-pre-wrap">{card.content}</div>
		</motion.div>
	);
};
