import { motion } from "motion/react";
import React, { useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import type { DragState, KanbanCard } from "./types";

interface DragGhostProps {
	dragState: DragState;
	card: KanbanCard | null;
	ghostRef: React.RefObject<HTMLDivElement>;
}

export function DragGhost({ dragState, card, ghostRef }: DragGhostProps) {
	const containerRef = useRef<HTMLDivElement | null>(null);

	useLayoutEffect(() => {
		// Create a container for the portal if it doesn't exist
		if (!containerRef.current) {
			const container = document.createElement("div");
			container.style.position = "fixed";
			container.style.top = "0";
			container.style.left = "0";
			container.style.width = "100%";
			container.style.height = "100%";
			container.style.pointerEvents = "none";
			container.style.zIndex = "9999";
			document.body.appendChild(container);
			containerRef.current = container;
		}

		return () => {
			// Cleanup on unmount
			if (containerRef.current) {
				document.body.removeChild(containerRef.current);
				containerRef.current = null;
			}
		};
	}, []);

	if (!dragState.isDragging || !card || !containerRef.current) {
		return null;
	}

	const ghostElement = (
		<motion.div
			ref={ghostRef}
			initial={{ scale: 1, opacity: 0.8 }}
			animate={{ scale: 1.05, opacity: 0.9 }}
			transition={{ duration: 0.1 }}
			className="fixed pointer-events-none z-50 bg-card border border-border rounded-lg shadow-lg p-3 max-w-xs"
			style={{
				left: 0,
				top: 0,
				transform: "translate(-50%, -50%)",
			}}
		>
			<div className="text-sm font-medium text-card-foreground">{card.content}</div>
		</motion.div>
	);

	return createPortal(ghostElement, containerRef.current);
}
