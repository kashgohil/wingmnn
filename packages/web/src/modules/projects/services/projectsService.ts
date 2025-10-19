import { http } from "@frameworks/http/httpInstance";
import type {
  NewProject,
  Project,
  Workflow,
  WorkflowStatus,
} from "@wingmnn/db";
import type { ResponseWrapper } from "@wingmnn/types";

export const ProjectsService = (function () {
  async function getProject(projectId: string) {
    return await http.get<ResponseWrapper<Project>>(`/projects/${projectId}`);
  }

  async function getProjects() {
    return await http.get<ResponseWrapper<Array<Project>>>("/projects");
  }
  async function createProject(project: NewProject) {
    return await http.put<ResponseWrapper<Project>>("/projects", project);
  }
  async function deleteProject(projectId: string) {
    return await http.delete<ResponseWrapper<Project>>(
      `/projects/${projectId}`,
    );
  }
  async function updateProject(projectId: string, project: Partial<Project>) {
    return await http.put<ResponseWrapper<Project>>(
      `/projects/${projectId}`,
      project,
    );
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
    getProject,
    getProjects,
    createProject,
    deleteProject,
    updateProject,

    getWorkflows,
    getStatusForWorkflows,
  };
})();
