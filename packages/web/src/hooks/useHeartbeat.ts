import { MINUTE } from "@constants";
import { QUICK_STALE } from "@frameworks/query/constants";
import { useQuery } from "@frameworks/query/hook";
import { AuthService } from "@services/authService";

export function useHeartbeat() {
  useQuery({
    key: { primaryKey: "HEARTBEAT" },
    queryFn: AuthService.heartbeat,
    staleTime: QUICK_STALE,
    polling: {
      enabled: true,
      interval: 4 * MINUTE,
    },
  });
}
