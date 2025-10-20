import { useCallback, useLayoutEffect, useRef, useState } from "react";
import type { DragState } from "../types";

interface UseDragAndDropProps {
  onCardMove: (
    cardId: string,
    sourceColumnId: string,
    targetColumnId: string,
    targetIndex: number,
  ) => void;
}

export function useDragAndDrop({ onCardMove }: UseDragAndDropProps) {
  const [dragState, setDragState] = useState<DragState>({
    dropIndex: null,
    isDragging: false,
    draggedCardId: null,
    sourceColumnId: null,
    targetColumnId: null,
    pointerOffset: { x: 0, y: 0 },
    draggedCardDimensions: { height: 0, width: 0 },
  });

  const dragRef = useRef<HTMLDivElement | null>(null);
  const ghostRef = useRef<HTMLDivElement | null>(null);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent, cardId: string, sourceColumnId: string) => {
      e.preventDefault();

      const rect = e.currentTarget.getBoundingClientRect();
      const pointerOffset = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };

      setDragState({
        isDragging: true,
        draggedCardId: cardId,
        sourceColumnId,
        targetColumnId: null,
        dropIndex: null,
        pointerOffset,
        draggedCardDimensions: {
          height: rect.height,
          width: rect.width,
        },
      });

      // Set initial ghost position immediately
      if (ghostRef.current) {
        ghostRef.current.style.left = `${e.clientX - pointerOffset.x}px`;
        ghostRef.current.style.top = `${e.clientY - pointerOffset.y}px`;
        ghostRef.current.style.height = `${rect.height}px`;
        ghostRef.current.style.width = `${rect.width}px`;
      }

      // Capture pointer to ensure we get pointermove/pointerup even outside the element
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    [],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragState.isDragging || !ghostRef.current) return;

      e.preventDefault();

      // Update ghost position synchronously to prevent visual lag
      const ghost = ghostRef.current;
      ghost.style.left = `${e.clientX - dragState.pointerOffset.x}px`;
      ghost.style.top = `${e.clientY - dragState.pointerOffset.y}px`;

      // Find the element under the pointer
      const elementUnderPointer = document.elementFromPoint(
        e.clientX,
        e.clientY,
      );
      if (!elementUnderPointer) return;

      // Find the closest column
      const columnElement = elementUnderPointer.closest("[data-column-id]");
      if (columnElement) {
        const targetColumnId = columnElement.getAttribute("data-column-id");
        if (targetColumnId) {
          // Find all cards in this column
          const cardElements = columnElement.querySelectorAll("[data-card-id]");
          let dropIndex = 0;

          // Calculate drop position based on pointer Y coordinate
          for (let i = 0; i < cardElements.length; i++) {
            const cardElement = cardElements[i] as HTMLElement;
            const cardRect = cardElement.getBoundingClientRect();
            const cardMiddle = cardRect.top + cardRect.height / 2;

            if (e.clientY < cardMiddle) {
              dropIndex = i;
            } else {
              dropIndex = i + 1;
            }
          }

          setDragState((prev) => ({
            ...prev,
            targetColumnId,
            dropIndex,
          }));
        }
      }
    },
    [dragState.isDragging, dragState.pointerOffset],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!dragState.isDragging) return;

      e.preventDefault();
      e.currentTarget.releasePointerCapture(e.pointerId);

      // Commit the move if we have valid targets
      if (
        dragState.draggedCardId &&
        dragState.sourceColumnId &&
        dragState.targetColumnId !== null
      ) {
        onCardMove(
          dragState.draggedCardId,
          dragState.sourceColumnId,
          dragState.targetColumnId,
          dragState.dropIndex ?? 0,
        );
      }

      // Reset drag state
      setDragState({
        isDragging: false,
        draggedCardId: null,
        sourceColumnId: null,
        targetColumnId: null,
        dropIndex: null,
        pointerOffset: { x: 0, y: 0 },
      });
    },
    [dragState, onCardMove],
  );

  const handlePointerCancel = useCallback(() => {
    setDragState({
      isDragging: false,
      draggedCardId: null,
      sourceColumnId: null,
      targetColumnId: null,
      dropIndex: null,
      pointerOffset: { x: 0, y: 0 },
    });
  }, []);

  // Ensure ghost is positioned correctly when drag state changes
  useLayoutEffect(() => {
    if (dragState.isDragging && ghostRef.current) {
      // This ensures the ghost is positioned correctly immediately
      // The actual position updates happen in handlePointerMove
    }
  }, [dragState.isDragging]);

  return {
    dragState,
    dragRef,
    ghostRef,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel,
  };
}
