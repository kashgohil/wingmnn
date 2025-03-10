import { create } from "@frameworks/store/store";
import { Project, Task } from "../type";

export enum DIALOGS {
  CREATE_PROJECT = "CREATE_PROJECT",
  EDIT_PROJECT = "EDIT_PROJECT",
  DELETE_PROJECT = "DELETE_PROJECT",

  ADD_TASK = "ADD_TASK",
  EDIT_TASK = "EDIT_TASK",
}

type ProjectsDialogPayload = {
  [DIALOGS.CREATE_PROJECT]: never;
  [DIALOGS.EDIT_PROJECT]: { project: Project };
  [DIALOGS.DELETE_PROJECT]: { projectId: string };
  [DIALOGS.ADD_TASK]: { projectId: string };
  [DIALOGS.EDIT_TASK]: { task: Task };
};

interface ProjectsDialogState {
  dialogState: {
    [key in DIALOGS]: {
      open: boolean;
      payload?: ProjectsDialogPayload[key];
    };
  };
}

interface ProjectsDialogActions {
  openDialog: <T extends DIALOGS>(
    dialog: T,
    payload?: ProjectsDialogPayload[T],
  ) => void;
  closeDialog: (dialog: DIALOGS) => void;
}

export const useProjectsDialogState = create<
  ProjectsDialogState,
  ProjectsDialogActions
>((set, get) => ({
  dialogState: {
    [DIALOGS.CREATE_PROJECT]: { open: false },
    [DIALOGS.EDIT_PROJECT]: { open: false },
    [DIALOGS.DELETE_PROJECT]: { open: false },
    [DIALOGS.ADD_TASK]: { open: false },
    [DIALOGS.EDIT_TASK]: { open: false },
  },

  openDialog: (dialog, payload) => {
    set({
      dialogState: {
        ...get("dialogState"),
        [dialog]: { open: true, payload },
      },
    });
  },

  closeDialog: (dialog: DIALOGS) => {
    set({
      dialogState: {
        ...get("dialogState"),
        [dialog]: { open: false, payload: undefined },
      },
    });
  },
}));
