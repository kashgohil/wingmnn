import { createStore } from "@frameworks/store/create";
import { ProjectDialog } from "@projects/constants";

interface ProjectsState {
	dialogs: Record<ProjectDialog, { open: boolean; params?: TSAny }>;
}

const { useState: useProjects, store } = createStore<ProjectsState>({
	dialogs: {
		[ProjectDialog.CREATE_PROJECT]: { open: false },
		[ProjectDialog.EDIT_PROJECT]: { open: false },
		[ProjectDialog.CREATE_TASK]: { open: false },
		[ProjectDialog.EDIT_TASK]: { open: false },
	},
});

const ProjectActions = (function () {
	return {
		openDialog: <T>(dialog: ProjectDialog, params?: T) => {
			store.set("dialogs", {
				...store.get("dialogs"),
				[dialog]: { open: true, params },
			});
		},

		closeDialog: (dialog: ProjectDialog) => {
			store.set("dialogs", {
				...store.get("dialogs"),
				[dialog]: { open: false },
			});
		},

		toggleDialog: (dialog: ProjectDialog) => {
			store.set("dialogs", {
				...store.get("dialogs"),
				[dialog]: {
					open: !store.get("dialogs")[dialog].open,
					params: store.get("dialogs")[dialog].params,
				},
			});
		},
	};
})();

export { ProjectActions, useProjects };
