import { SimpleRichTextEditor } from "@frameworks/editor";
import { ProjectDialog } from "@projects/constants";
import { ProjectActions } from "@projects/hooks/useProjectDialogs";
import { useProject } from "@projects/hooks/useProjects";
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Input,
	Switch,
	Typography,
} from "@wingmnn/components";
import {
	AtSign,
	BadgePlus,
	ChevronRight,
	Hourglass,
	Paperclip,
	Tag,
	Timer,
} from "@wingmnn/components/icons";
import type { NewTask, Task, WorkflowStatus } from "@wingmnn/db";
import { usePathParams } from "@wingmnn/router";
import { useBoolean } from "@wingmnn/utils/hooks";
import React from "react";

interface AddTaskProps {
	open: boolean;
	onClose: () => void;
	status: WorkflowStatus;
}

export function AddTask({ open, onClose, status }: AddTaskProps) {
	const { id } = usePathParams<{ id: string }>();
	const { result: project } = useProject(id, { enabled: open });

	const { key } = project || {};

	const { value: keepCreating, toggle: toggleKeepCreating } = useBoolean(false);

	const [state, setState] = React.useState<NewTask>({} as NewTask);

	const update = React.useCallback((update: Partial<Task>) => {
		setState((prevState) => ({ ...prevState, ...update }));
	}, []);

	// Reset form when dialog opens/closes
	React.useEffect(() => {
		if (open) {
			setState({} as NewTask);
		}
	}, [open]);

	const accentStyles = { "--accent": status?.color } as React.CSSProperties;

	return (
		<Dialog
			open={open}
			onClose={onClose}
			style={accentStyles}
		>
			<DialogTitle onClose={onClose}>
				<div className="flex items-center gap-2 tracking-wide font-spicy-rice text-accent">
					{key} <ChevronRight size={16} />{" "}
					<span className="text-white-950 text-base">{status?.name}</span>
				</div>
			</DialogTitle>
			<DialogContent className="gap-2 flex flex-col">
				<Input
					size="sm"
					autoFocus
					type="text"
					name="title"
					value={state.title}
					wrapperClassName="flex-1"
					placeholder="What is it about?"
					onChange={(title: string) => update({ title })}
				/>
				<SimpleRichTextEditor
					className="h-full"
					enableAutoSave={false}
					enableKeyboardShortcuts={true}
					value={state.description || ""}
					placeholder="Elaborate on the task..."
					onChange={(description: string) => update({ description })}
				/>
				<div className="flex items-end justify-between">
					<div className="flex flex-col items-start gap-2">
						<Button
							className="text-sm flex items-center gap-1"
							variant="secondary"
						>
							<Paperclip size={16} /> Attachments
						</Button>

						<Button
							className="text-sm flex items-center gap-1"
							variant="secondary"
						>
							<BadgePlus size={16} /> Subtask
						</Button>
					</div>
					<div className="flex flex-col items-end gap-2">
						<div className="flex items-center gap-2">
							<Button
								className="text-sm flex items-center gap-2"
								variant="secondary"
							>
								<Tag size={16} /> Tags
							</Button>
							<Button
								className="text-sm flex items-center gap-1"
								variant="secondary"
							>
								<AtSign size={16} /> Assignee
							</Button>
						</div>
						<div className="flex items-center gap-2">
							<Button
								className="text-sm flex items-center gap-1"
								variant="secondary"
							>
								<Timer size={16} /> Track Time
							</Button>
							<Button
								className="text-sm flex items-center gap-1"
								variant="secondary"
							>
								<Hourglass size={16} /> Due Date
							</Button>
						</div>
					</div>
				</div>
			</DialogContent>
			<DialogActions className="flex items-center justify-end gap-2">
				<Typography.Caption className="text-accent/80">
					Keep creating tasks
				</Typography.Caption>
				<Switch
					checked={keepCreating}
					onChange={toggleKeepCreating}
				/>
				<Button
					size="sm"
					variant="secondary"
					onClick={() => ProjectActions.closeDialog(ProjectDialog.CREATE_TASK)}
				>
					Cancel
				</Button>
				<Button size="sm">Create</Button>
			</DialogActions>
		</Dialog>
	);
}
