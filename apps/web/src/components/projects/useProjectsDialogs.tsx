/**
 * Projects Dialogs Store
 * Provides utility functions to open/close project dialogs with payloads
 * Uses Zustand for state management
 */

import { create } from "zustand";

interface ProjectSettingsPayload {
	projectId: string;
}

interface ProjectsDialogsState {
	// Dialog states
	createProjectOpen: boolean;
	widgetSettingsOpen: boolean;
	workflowManagerOpen: boolean;
	projectSettingsOpen: boolean;
	projectSettingsPayload: ProjectSettingsPayload | null;

	// Actions
	openCreateProject: () => void;
	closeCreateProject: () => void;
	openWidgetSettings: () => void;
	closeWidgetSettings: () => void;
	openWorkflowManager: () => void;
	closeWorkflowManager: () => void;
	openProjectSettings: (payload: ProjectSettingsPayload) => void;
	closeProjectSettings: () => void;
}

export const useProjectsDialogs = create<ProjectsDialogsState>((set) => ({
	// Initial state
	createProjectOpen: false,
	widgetSettingsOpen: false,
	workflowManagerOpen: false,
	projectSettingsOpen: false,
	projectSettingsPayload: null,

	// Actions
	openCreateProject: () => set({ createProjectOpen: true }),
	closeCreateProject: () => set({ createProjectOpen: false }),

	openWidgetSettings: () => set({ widgetSettingsOpen: true }),
	closeWidgetSettings: () => set({ widgetSettingsOpen: false }),

	openWorkflowManager: () => set({ workflowManagerOpen: true }),
	closeWorkflowManager: () => set({ workflowManagerOpen: false }),

	openProjectSettings: (payload: ProjectSettingsPayload) =>
		set({
			projectSettingsOpen: true,
			projectSettingsPayload: payload,
		}),

	closeProjectSettings: () => {
		set({ projectSettingsOpen: false });
		// Clear payload after a short delay to allow dialog to close smoothly
		setTimeout(() => {
			set({ projectSettingsPayload: null });
		}, 200);
	},
}));
