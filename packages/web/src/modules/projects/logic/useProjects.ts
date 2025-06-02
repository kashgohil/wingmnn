import { createStore } from "@frameworks/store/create";
import { ProjectDialog } from "@projects/constants";
import { type Project } from "@projects/type";
import { upsert } from "@wingmnn/utils";

interface ProjectsState {
  projects: Array<Project>;
  dialogs: Record<ProjectDialog, boolean>;
}

const { useState: useProjects, store } = createStore<ProjectsState>({
  projects: [],

  dialogs: {
    [ProjectDialog.CREATE_PROJECT]: false,
    [ProjectDialog.EDIT_PROJECT]: false,
    [ProjectDialog.CREATE_TASK]: false,
    [ProjectDialog.EDIT_TASK]: false,
  },
});

const ProjectActions = (function () {
  return {
    addProject: (project: Project) => {
      store.set("projects", upsert(store.get("projects"), project));
    },
    removeProject: (id: string) => {
      store.set(
        "projects",
        store.get("projects").filter((project) => project.id !== id),
      );
    },
    updateProject: (id: string, project: Project) => {
      store.set(
        "projects",
        store.get("projects").map((p) => (p.id === id ? project : p)),
      );
    },

    openDialog: (dialog: ProjectDialog) => {
      store.set("dialogs", { ...store.get("dialogs"), [dialog]: true });
    },

    closeDialog: (dialog: ProjectDialog) => {
      store.set("dialogs", { ...store.get("dialogs"), [dialog]: false });
    },

    toggleDialog: (dialog: ProjectDialog) => {
      store.set("dialogs", {
        ...store.get("dialogs"),
        [dialog]: !store.get("dialogs")[dialog],
      });
    },
  };
})();

export { ProjectActions, useProjects };
