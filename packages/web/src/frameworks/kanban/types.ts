import type { LucideProps } from "@wingmnn/components/icons";

export interface KanbanCard {
  id: string;
  content: React.ReactNode;
  // extensible for future properties
}

interface Metadata {
  color?: string | null;
  description?: string | null;
  icon?: React.FC<LucideProps> | null;
}

export interface KanbanColumn {
  id: string;
  title: string;
  cards: KanbanCard[];
  metadata?: Metadata;
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
