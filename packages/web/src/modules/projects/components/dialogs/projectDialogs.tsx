import { ProjectDialog } from "@projects/constants";
import { ProjectActions, useProjects } from "@projects/hooks/useProjectDialogs";
import { AddProject } from "./addProject";
import { AddTask } from "./addTask";

export function ProjectDialogs() {
	const dialogs = useProjects("dialogs");

	return (
		<>
			<AddProject
				open={dialogs[ProjectDialog.CREATE_PROJECT].open}
				onClose={() => ProjectActions.closeDialog(ProjectDialog.CREATE_PROJECT)}
			/>
			<AddTask
				open={dialogs[ProjectDialog.CREATE_TASK].open}
				status={dialogs[ProjectDialog.CREATE_TASK].params}
				onClose={() => ProjectActions.closeDialog(ProjectDialog.CREATE_TASK)}
			/>
		</>
	);
}
