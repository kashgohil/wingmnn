import { Dialogs, useProjectDialog } from "@projects/logic/useProjectDialog";
import { AddProject } from "./addProject";
import { AddTask } from "./addTask";

export function ProjectDialogs() {
  const dialogState = useProjectDialog("dialogState");
  const closeDialog = useProjectDialog("closeDialog");

  return (
    <>
      <AddProject
        open={dialogState[Dialogs.CREATE_PROJECT].open}
        onClose={() => closeDialog(Dialogs.CREATE_PROJECT)}
      />
      <AddTask
        open={dialogState[Dialogs.ADD_TASK].open}
        onClose={() => closeDialog(Dialogs.ADD_TASK)}
      />
    </>
  );
}
