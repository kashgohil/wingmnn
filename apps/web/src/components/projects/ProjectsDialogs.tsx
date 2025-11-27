/**
 * Projects Dialogs Component
 * Centralized component that contains all project-related dialogs
 * Use the useProjectsDialogs hook to open/close dialogs with payloads
 */

import { useAuth } from "@/lib/auth/auth-context";
import { useProject } from "@/lib/hooks/use-projects";
import { ProjectCreationDialog } from "./ProjectCreationDialog";
import { ProjectSettingsDialog } from "./ProjectSettingsDialog";
import { TaskCreationDialog } from "./TaskCreationDialog";
import { WidgetSettings } from "./WidgetSettings";
import { WorkflowManager } from "./WorkflowManager";
import { useProjectsDialogs } from "./useProjectsDialogs";

export function ProjectsDialogs() {
	const {
		createProjectOpen,
		closeCreateProject,
		widgetSettingsOpen,
		closeWidgetSettings,
		workflowManagerOpen,
		closeWorkflowManager,
		projectSettingsOpen,
		closeProjectSettings,
		projectSettingsPayload,
		taskCreationOpen,
		closeTaskCreation,
		taskCreationPayload,
	} = useProjectsDialogs();

	const { data: project, isLoading: projectLoading } = useProject(
		projectSettingsPayload?.projectId || null,
	);
	const { user } = useAuth();
	const isOwner = !!(project && user?.id && user.id === project.ownerId);
	const isProjectLoaded = !projectLoading && !!project;

	return (
		<>
			{/* Project Creation Dialog */}
			<ProjectCreationDialog
				open={createProjectOpen}
				onOpenChange={(open) => {
					if (!open) closeCreateProject();
				}}
			/>

			{/* Widget Settings Dialog */}
			<WidgetSettings
				open={widgetSettingsOpen}
				onOpenChange={(open) => {
					if (!open) closeWidgetSettings();
				}}
			/>

			{/* Workflow Manager Dialog */}
			<WorkflowManager
				open={workflowManagerOpen}
				onOpenChange={(open) => {
					if (!open) closeWorkflowManager();
				}}
			/>

			{/* Project Settings Dialog */}
			<ProjectSettingsDialog
				open={projectSettingsOpen}
				onOpenChange={(open) => {
					if (!open) closeProjectSettings();
				}}
				project={project}
				loading={!isProjectLoaded}
				isOwner={isOwner}
			/>

			{/* Task Creation Dialog */}
			<TaskCreationDialog
				open={taskCreationOpen}
				onOpenChange={(open) => {
					if (!open) closeTaskCreation();
				}}
				projectId={taskCreationPayload?.projectId ?? null}
				projectName={taskCreationPayload?.projectName}
				workflowId={taskCreationPayload?.workflowId}
			/>
		</>
	);
}
