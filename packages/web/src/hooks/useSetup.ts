import { LONG_STALE } from "@frameworks/query/constants";
import { useQuery } from "@frameworks/query/hook";
import { SetupService } from "@services/setupService";
import type { User } from "@wingmnn/db";
import { ME_QUERY_KEY } from "src/queryKeys";

export function useSetup() {
  return useQuery<TSAny, TSAny, User>({
    queryFn: SetupService.me,
    key: ME_QUERY_KEY,
    staleTime: LONG_STALE,
    selector: (response) => response.data,
  });
}
