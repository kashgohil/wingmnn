import { http } from "@frameworks/http/httpInstance";
import { Project } from "../type";

export const ProjectsService = (function () {
  async function getProjects() {
    return await http.get<Array<Project>>("/api/projects");
  }
  async function createProject(project: Project) {
    return await http.put<Project>("/api/projects", project);
  }
  async function deleteProject(projectId: string) {
    return await http.delete<Project>(`/api/projects/${projectId}`);
  }
  async function updateProject(projectId: string, project: Partial<Project>) {
    return await http.put<Project>(`/api/projects/${projectId}`, project);
  }

  return {
    getProjects,
    createProject,
    deleteProject,
    updateProject,
  };
})();
