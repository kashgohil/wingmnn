import { http } from "@frameworks/http/httpInstance";
import { Games } from "@games/constants";
import type { Sudoku } from "@wingmnn/db";
import type { ResponseWrapper } from "@wingmnn/types";

export function GameService(game: Games) {
  const path = `/games/${game}`;

  return {
    get(gameId: string) {
      return http.get<ResponseWrapper<Sudoku>>(`${path}/${gameId}`);
    },

    update<P = Partial<Sudoku>>(gameId: string, payload: P) {
      return http.patch<ResponseWrapper<Sudoku>>(`${path}/${gameId}`, payload);
    },

    delete(gameId: string) {
      return http.delete<ResponseWrapper<Sudoku>>(`${path}/${gameId}`);
    },

    create<P = Partial<Sudoku>>(payload: P) {
      return http.post<ResponseWrapper<Sudoku>>(path, payload);
    },
  };
}
