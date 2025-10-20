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
  dropIndex: number | null;
  draggedCardId: string | null;
  sourceColumnId: string | null;
  targetColumnId: string | null;
  pointerOffset: { x: number; y: number };
  draggedCardDimensions: { height: number; width: number } | null;
}

// Legacy types for backward compatibility
export type CardData = KanbanCard;
export type ColumnData = KanbanColumn;
