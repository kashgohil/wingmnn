import { create } from "@frameworks/store/store";
import { Project } from "@projects/type";
import { upsert } from "@utility/upsert";

interface ProjectsState {
  projects: Array<Project>;
}

interface ProjectsActions {
  deleteProject: (id: string) => void;
  addProject: (project: Project) => void;
  updateProject: (project: Project) => void;
}

export const useProjects = create<ProjectsState, ProjectsActions>((set) => ({
  projects: [],

  deleteProject: (id: string) => {
    set((state) => ({
      projects: state.projects.filter((project) => project.id !== id),
    }));
  },

  addProject: (project: Project) => {
    set((state) => ({
      projects: [...state.projects, project],
    }));
  },

  updateProject: (project: Project) => {
    set((state) => ({
      projects: upsert(state.projects, project),
    }));
  },
}));
