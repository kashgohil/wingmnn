import { MINUTE } from "@constants";
import { QUICK_STALE } from "@frameworks/query/constants";
import { useQuery } from "@frameworks/query/hook";
import { HEARTBEAT_QUERY_KEY } from "@queryKeys";
import { AuthService } from "@services/authService";

export function useHeartbeat() {
  useQuery({
    key: HEARTBEAT_QUERY_KEY,
    queryFn: AuthService.heartbeat,
    staleTime: QUICK_STALE,
    polling: {
      enabled: true,
      interval: 4 * MINUTE,
    },
  });
}
