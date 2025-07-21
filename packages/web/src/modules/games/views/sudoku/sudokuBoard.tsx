import { useMutation } from "@frameworks/query/hook";
import { SudokuService } from "@games/services/sudokuService";
import { cx, Input, Timer } from "@wingmnn/components";
import type { Sudoku } from "@wingmnn/db";
import { inRange } from "@wingmnn/utils";
import React, { type KeyboardEvent } from "react";

export function SudokuBoard(props: { game: Sudoku }) {
  const { game } = props;
  const { puzzle, size } = game;

  const [selectedCell, setSelectedCell] = React.useState<
    [number, number] | null
  >(null);

  const refs = React.useMemo(() => {
    const refs = Array.from({ length: size }, () =>
      Array.from({ length: size }, () => React.createRef<HTMLInputElement>()),
    );
    return refs;
  }, [size]);

  const queryKey = React.useMemo(
    () => ({
      primaryKey: game.id,
    }),
    [game.id],
  );

  const { mutate: update } = useMutation({
    key: queryKey,
    mutationFn: (key, update: Partial<Sudoku>) =>
      SudokuService.update(key.primaryKey, update),
    onMutate: (_, update) => {
      console.log("ON_MUTATE: ", update);
      return { ...game, ...update };
    },
    selector: (data) => data.data,
    debounce: {
      enabled: true,
      debounceTime: 500,
    },
  });

  const select = React.useCallback(
    ([rowIndex, colIndex]: [number, number]) => {
      refs[rowIndex][colIndex].current?.focus();

      setTimeout(() => {
        refs[rowIndex][colIndex].current?.select();
      }, 0);

      setSelectedCell([rowIndex, colIndex]);
    },
    [refs],
  );

  const changeName = React.useCallback(
    (name: string) => {
      update({ name });
    },
    [update],
  );

  const selectionClass = React.useCallback(
    ([rowIndex, colIndex]: [number, number]) => {
      let classes = "";

      if (rowIndex % 3 === 0 && inRange(rowIndex, [0, 8]))
        classes += " border-t-1 border-t-accent";
      if (colIndex % 3 === 0 && inRange(colIndex, [0, 8]))
        classes += " border-l-1 border-l-accent";
      if (rowIndex % 3 === 2 && inRange(rowIndex, [0, 8]))
        classes += " border-b-1 border-b-accent";
      if (colIndex % 3 === 2 && inRange(colIndex, [0, 8]))
        classes += " border-r-1 border-r-accent";

      if (rowIndex === 0 && colIndex === 0) classes += " rounded-tl-lg";
      if (rowIndex === 0 && colIndex === 8) classes += " rounded-tr-lg";
      if (rowIndex === 8 && colIndex === 0) classes += " rounded-bl-lg";
      if (rowIndex === 8 && colIndex === 8) classes += " rounded-br-lg";

      if (!selectedCell) return classes;

      const [x, y] = [
        Math.floor(selectedCell[0] / 3) * 3,
        Math.floor(selectedCell[1] / 3) * 3,
      ];

      const inBlock =
        x <= rowIndex && rowIndex < x + 3 && y <= colIndex && colIndex < y + 3;

      if (
        selectedCell[0] === rowIndex ||
        selectedCell[1] === colIndex ||
        inBlock
      ) {
        classes += " bg-accent/20";
      } else {
        classes += " bg-black-100";
      }

      if (selectedCell[0] === rowIndex && selectedCell[1] === colIndex) {
        classes = "bg-accent/50";
      }

      return classes;
    },
    [selectedCell],
  );

  const transport = React.useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (!selectedCell) return;

      switch (e.key) {
        case "ArrowUp":
          select([Math.max(selectedCell[0] - 1, 0), selectedCell[1]]);
          break;
        case "ArrowDown":
          select([Math.min(selectedCell[0] + 1, 8), selectedCell[1]]);
          break;
        case "ArrowLeft":
          select([selectedCell[0], Math.max(selectedCell[1] - 1, 0)]);
          break;
        case "ArrowRight":
          select([selectedCell[0], Math.min(selectedCell[1] + 1, 8)]);
          break;
        default:
          break;
      }
    },
    [selectedCell, select],
  );

  return (
    <div
      className="flex flex-col flex-1 items-center justify-center gap-4"
      onKeyDown={transport}
    >
      <Input
        value={game.name}
        onChange={changeName}
        placeholder="Name the game"
        className="text-center text-3xl font-spicy-rice text-accent"
      />
      <div className="flex flex-col rounded-lg overflow-clip">
        {puzzle.map((row, rowIndex) => (
          <div key={rowIndex} className="flex">
            {row.map((cell, colIndex) => (
              <div
                key={colIndex}
                className={cx(
                  "w-14 h-14 border border-accent/50 flex items-center justify-center",
                  selectionClass([rowIndex, colIndex]),
                )}
              >
                <Input
                  min={1}
                  max={9}
                  type="number"
                  onChange={() => {}}
                  ref={refs[rowIndex][colIndex]}
                  value={cell === 0 ? "" : cell}
                  id={`cell-${rowIndex}-${colIndex}`}
                  wrapperClassName="focus-within:outline-none"
                  onFocus={() => select([rowIndex, colIndex])}
                  className="w-full text-center text-4xl selection:bg-transparent font-spicy-rice"
                />
              </div>
            ))}
          </div>
        ))}
      </div>
      <Timer format="mm:ss" className="text-4xl font-spicy-rice w-16" />
    </div>
  );
}
