import { MINUTE, SECOND } from "@constants";
import { QUICK_STALE } from "@frameworks/query/constants";
import { useQuery } from "@frameworks/query/hook";
import { HEARTBEAT_QUERY_KEY } from "@queryKeys";
import { AuthService } from "@services/authService";
import { useBoolean } from "@wingmnn/utils/hooks";
import React from "react";

export function useHeartbeat() {
  const {
    value: loading,
    unset: unsetLoading,
    set: setLoading,
  } = useBoolean(false);

  const { isLoading, isRefetching } = useQuery({
    key: HEARTBEAT_QUERY_KEY,
    queryFn: AuthService.heartbeat,
    staleTime: QUICK_STALE,
    polling: {
      enabled: true,
      interval: 4 * MINUTE,
    },
  });

  React.useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (isLoading && !isRefetching) {
      setLoading();
      timeoutId = setTimeout(() => {
        unsetLoading();
      }, 4 * SECOND);

      return () => timeoutId && clearTimeout(timeoutId);
    }

    // return () => timeoutId && clearTimeout(timeoutId);
  }, [unsetLoading, setLoading, isLoading, isRefetching]);

  return { isLoading: loading || (isLoading && !isRefetching) };
}
