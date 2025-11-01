import { LONG_STALE } from "@frameworks/query/constants";
import { SetupService } from "@services/setupService";
import { useQuery } from "@tanstack/react-query";
import { ME_QUERY_KEY } from "src/queryKeys";

export function useSetup() {
  return useQuery({
    queryFn: SetupService.me,
    queryKey: [ME_QUERY_KEY],
    staleTime: LONG_STALE,
    select: (res) => res.data,
  });
}
