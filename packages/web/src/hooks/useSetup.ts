import { INFINITE } from "@frameworks/query/constants";
import { useQuery } from "@frameworks/query/hook";
import { SetupService } from "@services/setupService";

export function useSetup() {
  useQuery({
    queryFn: SetupService.me,
    key: { primaryKey: "ME" },
    staleTime: INFINITE,
  });
}
