import { LONG_STALE } from "@frameworks/query/constants";
import { useQuery, type CustomQueryParams } from "@frameworks/query/hook";
import type { QueryParams } from "@frameworks/query/query";
import { ProjectsService } from "@projects/services/projectsService";
import {
  PROJECT_PRIMARY_KEY,
  PROJECT_WORKFLOW_KEY,
  PROJECTS_KEY,
  WORKFLOW_STATUS_PRIMARY_KEY,
} from "@queryKeys";
import { isEmpty } from "@wingmnn/utils";
import React from "react";

export function useProjects(params?: CustomQueryParams) {
  return useQuery({
    key: PROJECTS_KEY,
    staleTime: LONG_STALE,
    queryFn: ProjectsService.getProjects,
    selector: (res) => res.data,
    ...params,
  });
}

export function useProject(projectId: string, params?: CustomQueryParams) {
  const key = React.useMemo<QueryParams>(
    () => ({
      primaryKey: PROJECT_PRIMARY_KEY,
      secondaryKey: projectId,
    }),
    [projectId],
  );

  const queryFn = React.useCallback(
    (queryParams: QueryParams) =>
      ProjectsService.getProject(queryParams.secondaryKey!),
    [],
  );

  return useQuery({
    key,
    queryFn,
    selector: (res) => res.data,
    ...params,
  });
}

export function useWorkflows(params?: CustomQueryParams) {
  return useQuery({
    staleTime: LONG_STALE,
    key: PROJECT_WORKFLOW_KEY,
    queryFn: ProjectsService.getWorkflows,
    selector: (res) => res.data,
    ...params,
  });
}

export function useWorkflowStatuses(
  workflowIds: Array<string>,
  params?: CustomQueryParams,
) {
  const statusKey = React.useMemo(() => {
    return {
      primaryKey: WORKFLOW_STATUS_PRIMARY_KEY,
      params: workflowIds,
    };
  }, [workflowIds]);

  const statusQueryFn = React.useCallback(
    (queryParams: QueryParams<Array<string>>) => {
      const { params } = queryParams;
      return ProjectsService.getStatusForWorkflows(params!);
    },
    [],
  );

  return useQuery({
    key: statusKey,
    staleTime: LONG_STALE,
    queryFn: statusQueryFn,
    selector: (res) => res.data,
    enabled: !isEmpty(workflowIds),
    ...params,
  });
}
