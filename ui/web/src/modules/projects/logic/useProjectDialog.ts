import { create } from "@frameworks/store/store";
import { Project, Task } from "../type";

export enum Dialogs {
  EDIT_PROJECT = "EDIT_PROJECT",
  CREATE_PROJECT = "CREATE_PROJECT",
  DELETE_PROJECT = "DELETE_PROJECT",

  ADD_TASK = "ADD_TASK",
  EDIT_TASK = "EDIT_TASK",
}

type ProjectsDialogPayload = {
  [Dialogs.CREATE_PROJECT]: never;
  [Dialogs.EDIT_PROJECT]: { project: Project };
  [Dialogs.DELETE_PROJECT]: { projectId: string };
  [Dialogs.ADD_TASK]: { projectId: string };
  [Dialogs.EDIT_TASK]: { task: Task };
};

interface ProjectsDialogState {
  dialogState: {
    [key in Dialogs]: {
      open: boolean;
      payload?: ProjectsDialogPayload[key];
    };
  };
}

interface ProjectsDialogActions {
  openDialog: <T extends Dialogs>(
    dialog: T,
    payload?: ProjectsDialogPayload[T],
  ) => void;
  closeDialog: (dialog: Dialogs) => void;
}

export const useProjectDialog = create<
  ProjectsDialogState,
  ProjectsDialogActions
>((set, get) => ({
  dialogState: {
    [Dialogs.CREATE_PROJECT]: { open: false },
    [Dialogs.EDIT_PROJECT]: { open: false },
    [Dialogs.DELETE_PROJECT]: { open: false },
    [Dialogs.ADD_TASK]: { open: false },
    [Dialogs.EDIT_TASK]: { open: false },
  },

  openDialog: (dialog, payload) => {
    set({
      dialogState: {
        ...get("dialogState"),
        [dialog]: { open: true, payload },
      },
    });
  },

  closeDialog: (dialog: Dialogs) => {
    set({
      dialogState: {
        ...get("dialogState"),
        [dialog]: { open: false, payload: undefined },
      },
    });
  },
}));
