import { ProjectDialog } from "@projects/constants";
import { ProjectActions, useProjects } from "@projects/hooks/useProjectDialogs";
import { AddProject } from "./addProject";
import { AddTask } from "./addTask";

export function ProjectDialogs() {
  const {
    [ProjectDialog.CREATE_TASK]: createTask,
    [ProjectDialog.CREATE_PROJECT]: createProject,
  } = useProjects("dialogs");

  return (
    <>
      <AddProject
        open={createProject.open}
        onClose={() => ProjectActions.closeDialog(ProjectDialog.CREATE_PROJECT)}
      />
      <AddTask
        open={createTask.open}
        status={createTask.params}
        onClose={() => ProjectActions.closeDialog(ProjectDialog.CREATE_TASK)}
      />
    </>
  );
}
