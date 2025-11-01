import { LONG_STALE } from "@frameworks/query/constants";
import type { QueryOptions, QueryParams } from "@frameworks/query/types";
import { USERS_PRIMARY_KEY } from "@queryKeys";
import { UserService } from "@services/userService";
import { useQuery } from "@tanstack/react-query";
import React from "react";

export function useUsers(userIds: Array<string>, options?: QueryOptions) {
  const key = React.useMemo(
    () => ({
      primaryKey: USERS_PRIMARY_KEY,
      params: userIds,
    }),
    [userIds],
  );

  const queryFn = React.useCallback((q: QueryParams<Array<string>>) => {
    const key = q.queryKey[0];
    return UserService.lookup(key.params!);
  }, []);

  return useQuery({
    queryKey: [key],
    queryFn,
    select: (res) => res.data,
    staleTime: LONG_STALE,
    ...options,
  });
}
