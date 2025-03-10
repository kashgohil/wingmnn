import axios from "axios";
import { Project } from "../type";

export const ProjectsService = (function () {
  async function getProjects(): Promise<Array<Project>> {
    return await axios.get("/api/projects");
  }
  async function createProject(project: Project) {
    return await axios.put("/api/projects", project);
  }
  async function deleteProject(projectId: string) {
    return await axios.delete(`/api/projects/${projectId}`);
  }
  async function updateProject(projectId: string, project: Partial<Project>) {
    return await axios.put(`/api/projects/${projectId}`, project);
  }

  return {
    getProjects,
    createProject,
    deleteProject,
    updateProject,
  };
})();
