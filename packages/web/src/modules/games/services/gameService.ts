import { http } from "@frameworks/http/httpInstance";
import { Games } from "@games/constants";
import type { ResponseWrapper } from "@wingmnn/types";

export function GameService(game: Games) {
  const path = `/games/${game}`;

  return {
    get<T>(gameId: string) {
      return http.get<ResponseWrapper<T>>(`${path}/${gameId}`);
    },

    update<T>(gameId: string, payload: Partial<T>) {
      return http.patch<ResponseWrapper<T>>(`${path}/${gameId}`, payload);
    },

    delete<T>(gameId: string) {
      return http.delete<ResponseWrapper<T>>(`${path}/${gameId}`);
    },

    create<T, P = TSAny>(payload: P) {
      return http.post<ResponseWrapper<T>>(path, payload);
    },
  };
}
