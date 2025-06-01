import { INFINITE } from "@frameworks/query/constants";
import { useQuery } from "@frameworks/query/hook";
import { SetupService } from "@services/setupService";
import { ME_QUERY_KEY } from "src/queryKeys";

export function useSetup() {
  useQuery({
    queryFn: SetupService.me,
    key: ME_QUERY_KEY,
    staleTime: INFINITE,
  });
}
