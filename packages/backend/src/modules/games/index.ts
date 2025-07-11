import { games } from "@games/router";
import { sudoku } from "@games/sudoku";

games.route("/", sudoku);

export { games };
