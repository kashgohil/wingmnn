import { Games } from "@games/constants";
import { useGames } from "@games/store/useGames";
import { usePathParams } from "@wingmnn/router";
import { Analytics } from "./analytics";
import { History } from "./history";
import { Sudoku } from "./sudoku";

export function Game() {
  const view = useGames("tab");

  switch (view) {
    case "game":
      return <GamePlay />;
    case "analytics":
      return <Analytics />;
    case "history":
      return <History />;
  }
}

function GamePlay() {
  const { game, id } = usePathParams<{ game: Games; id: string }>();
  switch (game) {
    case Games.SUDOKU:
      return <Sudoku gameId={id} />;
    default:
      return <div>Game not found</div>;
  }
}
