import { DIALOGS, useProjectsDialogState } from "../../logic/useProjectsDialog";
import { AddProject } from "./addProject";
import { AddTask } from "./addTask";

export function ProjectDialogs() {
  const dialogState = useProjectsDialogState("dialogState");
  const closeDialog = useProjectsDialogState("closeDialog");

  return (
    <>
      <AddProject
        open={dialogState[DIALOGS.CREATE_PROJECT].open}
        onClose={() => closeDialog(DIALOGS.CREATE_PROJECT)}
      />
      <AddTask
        open={dialogState[DIALOGS.ADD_TASK].open}
        onClose={() => closeDialog(DIALOGS.ADD_TASK)}
      />
    </>
  );
}
