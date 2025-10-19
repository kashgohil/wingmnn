import { useQuery } from "@frameworks/query/hook";
import type { QueryParams } from "@frameworks/query/query";
import { ProjectsService } from "@projects/services/projectsService";
import { PROJECT_PRIMARY_KEY } from "@queryKeys";
import { usePathParams } from "@wingmnn/router";
import React from "react";

export function ProjectId() {
  const { id } = usePathParams<{ id: string }>();

  const key = React.useMemo(
    () => ({ primaryKey: PROJECT_PRIMARY_KEY, secondaryKey: id }),
    [id],
  );

  const queryFn = React.useCallback(
    async (queryParams: QueryParams) => {
      const { secondaryKey } = queryParams;
      return ProjectsService.getProject(secondaryKey!);
    },
    [id],
  );

  const { result, isLoading, error } = useQuery({
    key,
    queryFn,
    selector: (res) => res.data,
  });

  return (
    <div>
      <h1>Project</h1>
    </div>
  );
}
