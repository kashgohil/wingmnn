export interface KanbanCard {
	id: string;
	content: string;
	// extensible for future properties
}

export interface KanbanColumn {
	id: string;
	title: string;
	cards: KanbanCard[];
}

export interface DragState {
	isDragging: boolean;
	draggedCardId: string | null;
	sourceColumnId: string | null;
	targetColumnId: string | null;
	dropIndex: number | null;
	pointerOffset: { x: number; y: number };
}

// Legacy types for backward compatibility
export type CardData = KanbanCard;
export type ColumnData = KanbanColumn;
