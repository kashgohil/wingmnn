import { createStore } from "@frameworks/store/create";
import { ProjectDialog } from "@projects/constants";
import type { Project } from "@wingmnn/db";

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
