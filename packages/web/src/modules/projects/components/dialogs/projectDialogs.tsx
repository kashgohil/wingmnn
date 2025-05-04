import { ProjectActions, useProjects } from "@projects/logic/useProjects";
import { AddProject } from "./addProject";
import { AddTask } from "./addTask";
import { ProjectDialog } from "@projects/constants";

export function ProjectDialogs() {
  const dialogs = useProjects("dialogs");

  return (
    <>
      <AddProject
        open={dialogs[ProjectDialog.CREATE_PROJECT]}
        onClose={() => ProjectActions.closeDialog(ProjectDialog.CREATE_PROJECT)}
      />
      <AddTask
        open={dialogs[ProjectDialog.CREATE_TASK]}
        onClose={() => ProjectActions.closeDialog(ProjectDialog.CREATE_TASK)}
      />
    </>
  );
}
