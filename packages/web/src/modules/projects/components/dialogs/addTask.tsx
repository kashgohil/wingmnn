import { Editor as LexicalEditor } from "@frameworks/lexical/editor";
import { ProjectDialog } from "@projects/constants";
import { ProjectActions } from "@projects/hooks/useProjectDialogs";
import { useProject } from "@projects/hooks/useProjects";
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	IconButton,
	Input,
	Switch,
	Typography,
} from "@wingmnn/components";
import {
	AtSign,
	BadgePlus,
	ChevronRight,
	Hourglass,
	Maximize,
	Minimize,
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

	const {
		value: expand,
		toggle: toggleExpand,
		unset: unsetExpand,
	} = useBoolean(false);
	const {
		value: keepCreating,
		toggle: toggleKeepCreating,
		unset: unsetKeepCreating,
	} = useBoolean(false);

	const [state, setState] = React.useState<NewTask>({} as NewTask);

	const update = React.useCallback((update: Partial<Task>) => {
		setState((prevState) => ({ ...prevState, ...update }));
	}, []);

	// Reset form when dialog opens/closes
	React.useEffect(() => {
		if (!open) {
			unsetExpand();
			unsetKeepCreating();
			setState({} as NewTask);
		}
	}, [open]);

	const accentStyles = { "--accent": status?.color } as React.CSSProperties;

	return (
		<Dialog
			open={open}
			onClose={onClose}
			style={accentStyles}
			className="flex flex-col"
			size={expand ? "lg" : "md"}
		>
			<DialogTitle
				onClose={onClose}
				className="flex items-center justify-between"
			>
				<div className="flex items-center gap-2 tracking-wide font-spicy-rice text-accent">
					{key} <ChevronRight size={16} />{" "}
					<span className="text-white-950 text-base">{status?.name}</span>
				</div>
				<IconButton
					size="sm"
					shape="circle"
					variant="secondary"
					onClick={toggleExpand}
					iconProps={{ size: 16 }}
					icon={expand ? Minimize : Maximize}
					className="p-2 text-accent ml-auto mr-2"
				/>
			</DialogTitle>
			<DialogContent className="gap-2 flex flex-col flex-1">
				<Input
					size="sm"
					autoFocus
					type="text"
					name="title"
					value={state.title}
					wrapperClassName="outline-none text-accent font-semi-bold text-lg"
					placeholder="What is it about?"
					onChange={(title: string) => update({ title })}
				/>
				<LexicalEditor
					className="flex-1"
					name="task-description"
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
			<DialogActions className="flex items-center justify-between gap-2">
				<div className="flex items-center gap-2">
					<Switch
						checked={keepCreating}
						onChange={toggleKeepCreating}
					/>
					<Typography.Caption className="text-accent/80">
						Keep creating tasks
					</Typography.Caption>
				</div>
				<div className="flex items-center gap-2">
					<Button
						size="sm"
						variant="secondary"
						onClick={() =>
							ProjectActions.closeDialog(ProjectDialog.CREATE_TASK)
						}
					>
						Cancel
					</Button>
					<Button size="sm">Create</Button>
				</div>
			</DialogActions>
		</Dialog>
	);
}
