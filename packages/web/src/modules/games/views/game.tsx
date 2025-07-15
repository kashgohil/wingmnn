import { Games } from "@games/constants";
import { usePathParams } from "@wingmnn/router";
import { Sudoku } from "./sudoku";

export function Game() {
  const { game, id } = usePathParams<{ game: Games; id: string }>();

  switch (game) {
    case Games.SUDOKU:
      return <Sudoku gameId={id} />;
    default:
      return <div>Game not found</div>;
  }
}
