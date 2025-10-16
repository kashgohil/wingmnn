import { http } from "@frameworks/http/httpInstance";
import type { Workflow, WorkflowStatus } from "@wingmnn/db";
import type { ResponseWrapper } from "@wingmnn/types";
import { type Project } from "../type";

export const ProjectsService = (function () {
  async function getProjects() {
    return await http.get<Array<Project>>("/projects");
  }
  async function createProject(project: Project) {
    return await http.put<Project>("/projects", project);
  }
  async function deleteProject(projectId: string) {
    return await http.delete<Project>(`/projects/${projectId}`);
  }
  async function updateProject(projectId: string, project: Partial<Project>) {
    return await http.put<Project>(`/projects/${projectId}`, project);
  }

  async function getWorkflows() {
    return await http.get<ResponseWrapper<Array<Workflow>>>(
      "/projects/workflows",
    );
  }

  async function getStatusForWorkflows(workflowIds: Array<string>) {
    return await http.post<
      ResponseWrapper<Record<string, Array<WorkflowStatus>>>
    >("/projects/workflows/multiple-workflow-statuses", { workflowIds });
  }

  return {
    getProjects,
    createProject,
    deleteProject,
    updateProject,

    getWorkflows,
    getStatusForWorkflows,
  };
})();
