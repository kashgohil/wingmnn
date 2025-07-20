import { Games } from "@games/constants";
import { usePathParams } from "@wingmnn/router";
import { SudokuHistory } from "./sudoku/history";

export function History() {
  const { game } = usePathParams<{ game: Games; id: string }>();

  function content() {
    switch (game) {
      case Games.SUDOKU:
        return <SudokuHistory />;
    }
  }

  return (
    <div className="overflow-y-auto flex-1 p-4 text-center">{content()}</div>
  );
}
