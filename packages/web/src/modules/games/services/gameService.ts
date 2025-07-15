import { http } from "@frameworks/http/httpInstance";
import { Games } from "@games/constants";

export function GameService(game: Games) {
  const path = `/api/games/${game}`;

  return {
    get<T>(gameId: string) {
      return http.get<T>(`${path}/${gameId}`);
    },

    update<T>(gameId: string, payload: Partial<T>) {
      return http.patch<T>(`${path}/${gameId}`, payload);
    },

    delete<T>(gameId: string) {
      return http.delete<T>(`${path}/${gameId}`);
    },

    create<T>(payload: TSAny) {
      return http.post<T>(path, payload);
    },

    set<T>(gameId: string, payload: TSAny) {
      return http.put<T>(`${path}/${gameId}`, payload);
    },
  };
}
