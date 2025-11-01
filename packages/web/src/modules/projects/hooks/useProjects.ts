import { LONG_STALE, QUICK_STALE } from "@frameworks/query/constants";
import type { QueryOptions, QueryParams } from "@frameworks/query/types";
import { ProjectsService } from "@projects/services/projectsService";
import {
  PROJECT_PRIMARY_KEY,
  PROJECT_WORKFLOW_KEY,
  PROJECTS_KEY,
  WORKFLOW_STATUS_PRIMARY_KEY,
} from "@queryKeys";
import { useQuery } from "@tanstack/react-query";
import { isEmpty } from "@wingmnn/utils";
import React from "react";

export function useProjects(options?: QueryOptions) {
  return useQuery({
    staleTime: LONG_STALE,
    queryKey: [PROJECTS_KEY],
    select: (res) => res.data,
    queryFn: ProjectsService.getProjects,
    ...options,
  });
}

export function useProject(projectId: string, options?: QueryOptions) {
  const key = React.useMemo(
    () => ({
      primaryKey: PROJECT_PRIMARY_KEY,
      secondaryKey: projectId,
    }),
    [projectId],
  );

  const queryFn = React.useCallback((q: QueryParams<string>) => {
    const key = q.queryKey[0];
    return ProjectsService.getProject(key.secondaryKey || "");
  }, []);

  return useQuery({
    queryFn,
    queryKey: [key],
    staleTime: QUICK_STALE,
    select: (res) => res.data,
    ...options,
  });
}

export function useWorkflows(options?: QueryOptions) {
  return useQuery({
    staleTime: LONG_STALE,
    queryKey: [PROJECT_WORKFLOW_KEY],
    queryFn: ProjectsService.getWorkflows,
    select: (res) => res.data,
    ...options,
  });
}

export function useWorkflowStatuses(
  workflowIds: Array<string>,
  options?: QueryOptions,
) {
  const statusKey = React.useMemo(() => {
    return {
      primaryKey: WORKFLOW_STATUS_PRIMARY_KEY,
      params: workflowIds,
    };
  }, [workflowIds]);

  const statusQueryFn = React.useCallback((q: QueryParams<Array<string>>) => {
    const key = q.queryKey[0];
    return ProjectsService.getStatusForWorkflows(key.params!);
  }, []);

  return useQuery({
    queryKey: [statusKey],
    staleTime: LONG_STALE,
    queryFn: statusQueryFn,
    select: (res) => res.data,
    enabled: !isEmpty(workflowIds),
    ...options,
  });
}
