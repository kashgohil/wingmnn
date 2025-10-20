import { cx, Typography } from "@wingmnn/components";
import { AnimatePresence, motion } from "motion/react";
import React from "react";
import { Card } from "./Card";
import type { DragState, KanbanColumn } from "./types";

interface ColumnProps {
  column: KanbanColumn;
  dragState: DragState;
  onPointerDown: (
    e: React.PointerEvent<HTMLDivElement>,
    cardId: string,
    columnId: string,
  ) => void;
  onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerUp: (e: React.PointerEvent<HTMLDivElement>) => void;
}

export function Column({
  column,
  dragState,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}: ColumnProps) {
  const isDragOver = dragState.targetColumnId === column.id;
  const isSourceColumn = dragState.sourceColumnId === column.id;
  const isDragging = dragState.isDragging;

  return (
    <motion.div
      data-column-id={column.id}
      className={cx(
        "w-80 rounded-lg p-2 h-full",
        isDragOver ? "bg-accent/20 border-accent" : "",
        isSourceColumn && isDragging ? "opacity-75" : "",
      )}
      onPointerMove={isDragging ? onPointerMove : undefined}
      onPointerUp={isDragging ? onPointerUp : undefined}
    >
      <Typography.H3 className="text-accent mb-4 text-center">
        {column.title}
      </Typography.H3>

      <div className="overflow-y-auto h-full">
        <motion.div
          className="space-y-2"
          transition={{ duration: 0.2, ease: "easeInOut" }}
        >
          <AnimatePresence mode="wait">
            {column.cards.map((card, index) => {
              const isDragging = dragState.draggedCardId === card.id;

              if (isDragging) return null;

              return (
                <motion.div
                  key={card.id}
                  className="w-full"
                  data-card-index={index}
                >
                  {/* Show drop indicator above this card if it's the drop target */}
                  {isDragOver && dragState.dropIndex === index && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-2 border-dashed border-accent/70 rounded-lg bg-accent/10 mb-2 p-3"
                      style={{
                        height: dragState.draggedCardDimensions?.height,
                      }}
                    ></motion.div>
                  )}

                  <div className="w-full">
                    <Card
                      card={card}
                      columnId={column.id}
                      isDragging={isDragging}
                      onPointerDown={onPointerDown}
                    />
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Show drop indicator at the end if dropping after the last card */}
          {isDragOver && dragState.dropIndex === column.cards.length && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="border-2 border-dashed border-accent/70 rounded-lg bg-accent/10 mt-2 p-3"
              style={{ height: dragState.draggedCardDimensions?.height }}
            ></motion.div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
