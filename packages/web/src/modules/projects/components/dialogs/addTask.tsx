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
  Menu,
  Switch,
  Typography,
} from "@wingmnn/components";
import {
  AtSign,
  BadgePlus,
  Calendar,
  ChevronRight,
  ChevronsUp,
  Maximize,
  Minimize,
  Tag,
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

const PRIORITY_OPTIONS = [
  { name: "Low", id: "low", description: "", value: "low" },
  { name: "Medium", id: "medium", description: "", value: "medium" },
  { name: "High", id: "high", description: "", value: "high" },
  { name: "Critical", id: "critical", description: "", value: "critical" },
];

export function AddTask({ open, onClose, status }: AddTaskProps) {
  const { id } = usePathParams<{ id: string }>();
  const { result: project } = useProject(id, { enabled: open });

  const { key } = project || {};

  const priorityRef = React.useRef<HTMLButtonElement>(null);

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
  const {
    value: priorityPopover,
    toggle: togglePriorityPopover,
    unset: unsetPriorityPopover,
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
      unsetPriorityPopover();
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
          <span className="text-white-500 text-base">{status?.name}</span>
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
          placeholder="What is it about?"
          onChange={(title: string) => update({ title })}
          wrapperClassName="outline-none text-accent font-bold text-xl"
        />
        <LexicalEditor
          className="flex-1 text-white-500"
          name="task-description"
          placeholder="Elaborate on the task..."
          onChange={(description: string) => update({ description })}
        />
        <div className="flex items-end justify-between">
          <div className="flex items-center gap-2">
            <IconButton
              variant="icon"
              icon={Calendar}
              iconProps={{ size: 20 }}
              className="p-2 flex items-center gap-2"
            />

            <IconButton
              variant="icon"
              icon={BadgePlus}
              iconProps={{ size: 20 }}
              className="p-2 flex items-center gap-2"
            />
          </div>
          <div className="flex items-center gap-2">
            <IconButton
              icon={Tag}
              variant="icon"
              iconProps={{ size: 20 }}
              className="p-2 flex items-center gap-2"
            />
            <IconButton
              icon={AtSign}
              variant="icon"
              iconProps={{ size: 20 }}
              className="p-2 flex items-center gap-2"
            />
            <IconButton
              variant="icon"
              ref={priorityRef}
              icon={ChevronsUp}
              iconProps={{ size: 20 }}
              onClick={togglePriorityPopover}
              className="p-2 flex items-center gap-2"
            />
          </div>
        </div>
        <>
          <Menu
            style={accentStyles}
            anchor={priorityRef}
            open={priorityPopover}
            placement="bottom-left"
            options={PRIORITY_OPTIONS}
            value={[state.priority!].filter(Boolean)}
            onSelect={({ value }) => {
              update({ priority: value as TSAny });
              unsetPriorityPopover();
            }}
            onClose={unsetPriorityPopover}
            className="bg-black-200 border border-accent/40"
          />
        </>
      </DialogContent>
      <DialogActions className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Switch checked={keepCreating} onChange={toggleKeepCreating} />
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
