import { Editor as LexicalEditor } from "@frameworks/lexical/editor";
import { useUsers } from "@hooks/useUsers";
import { ProjectDialog } from "@projects/constants";
import { ProjectActions } from "@projects/hooks/useProjectDialogs";
import { useProject } from "@projects/hooks/useProjects";
import {
  Button,
  Calendar as CalendarComponent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  IconButton,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Switch,
  Typography,
} from "@wingmnn/components";
import {
  AtSign,
  BadgePlus,
  Calendar,
  CalendarCheck,
  ChevronRight,
  ChevronsDown,
  ChevronsUp,
  ChevronUp,
  Maximize,
  Minimize,
  ShieldAlert,
  Tag,
  type LucideIcon,
} from "@wingmnn/components/icons";
import type { NewTask, Task, WorkflowStatus } from "@wingmnn/db";
import { usePathParams } from "@wingmnn/router";
import { find, isEmpty, noop } from "@wingmnn/utils";
import { useBoolean } from "@wingmnn/utils/hooks";
import { withStopPropagation } from "@wingmnn/utils/interactivity";
import React from "react";

interface AddTaskProps {
  open: boolean;
  onClose: () => void;
  status: WorkflowStatus;
}

interface PriorityOption
  extends CoreOption<"low" | "medium" | "high" | "critical"> {
  color: string;
  icon: LucideIcon;
}

const PRIORITY_OPTIONS: Record<string, PriorityOption> = {
  low: {
    name: "Low",
    id: "low",
    description: "",
    icon: ChevronsDown,
    color: "var(--color-aqua-500)",
  },
  medium: {
    name: "Medium",
    id: "medium",
    description: "",
    icon: ChevronUp,
    color: "var(--color-gold-500)",
  },
  high: {
    id: "high",
    name: "High",
    description: "",
    icon: ChevronsUp,
    color: "var(--color-amber-500)",
  },
  critical: {
    name: "Critical",
    id: "critical",
    description: "",
    icon: ShieldAlert,
    color: "var(--color-rose-500)",
  },
};

const OPTIONS = [
  PRIORITY_OPTIONS["low"],
  PRIORITY_OPTIONS["medium"],
  PRIORITY_OPTIONS["high"],
  PRIORITY_OPTIONS["critical"],
];

export function AddTask({ open, onClose, status }: AddTaskProps) {
  const { id } = usePathParams<{ id: string }>();
  const { data: project } = useProject(id, { enabled: open });

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
    <Dialog open={open}>
      <DialogContent
        size={expand ? "lg" : "md"}
        style={accentStyles}
        className="flex flex-col gap-4"
      >
        <DialogHeader>
          <DialogTitle
            onClose={onClose}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-2 tracking-wide font-spicy-rice text-accent">
              {key} <ChevronRight size={16} /> {status?.name}
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
        </DialogHeader>
        <div className="flex-1 flex flex-col gap-2">
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
          <div className="flex items-end justify-between self-sto">
            <div className="flex flex-col items-start gap-1">
              <StartDate
                update={update}
                startDate={state.startDate}
                accentStyles={accentStyles}
              />
              <DueDate
                update={update}
                dueDate={state.dueDate}
                accentStyles={accentStyles}
              />
            </div>
            <div className="flex flex-col items-end gap-1">
              <Assignee
                update={update}
                assignee={state.assignedTo}
                accentStyles={accentStyles}
              />
              <Priority
                update={update}
                priority={state.priority}
                accentStyles={accentStyles}
              />
            </div>
          </div>
          <div className="py-4">
            <SubTasks accentStyles={accentStyles} update={update} />
          </div>
        </div>
        <DialogActions className="flex items-center justify-between gap-2 w-full">
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
      </DialogContent>
    </Dialog>
  );
}

function Tags(props: {
  update: (update: Partial<Task>) => void;
  tags?: Task["tags"];
  accentStyles: React.CSSProperties;
}) {
  const popoverRef = React.useRef<HTMLButtonElement>(null);

  const [tag, setTag] = React.useState<string>("");

  const {
    value: popover,
    unset: unsetPopover,
    toggle: togglePopover,
  } = useBoolean(false);

  return (
    <>
      <Button
        variant="icon"
        ref={popoverRef}
        onClick={togglePopover}
        className="p-2 flex items-center gap-1 text-base"
      >
        <Tag size={18} /> Tags
      </Button>
      <Popover
        open={popover}
        anchor={popoverRef}
        placement="bottom"
        style={props.accentStyles}
        onClose={unsetPopover}
        exit={{ scale: 1 }}
        animate={{ scale: 1 }}
        initial={{ scale: 1 }}
        onClick={withStopPropagation(noop)}
        className="border border-accent/40"
      >
        <Input
          size="sm"
          autoFocus
          value={tag}
          className="p-1"
          onChange={setTag}
          wrapperClassName="p-1"
        />
      </Popover>
    </>
  );
}

function Assignee(props: {
  update: (update: Partial<Task>) => void;
  assignee?: string | null;
  accentStyles: React.CSSProperties;
}) {
  const { id } = usePathParams<{ id: string }>();
  const { accentStyles, assignee, update } = props;

  const {
    value: popover,
    unset: unsetPopover,
    toggle: togglePopover,
  } = useBoolean(false);

  const { data: projectResult } = useProject(id, {
    enabled: !!id,
  });

  const userIds = React.useMemo(() => {
    if (!projectResult) return [];
    return [projectResult.createdBy, ...projectResult.members];
  }, [projectResult]);

  const {
    data: users,
    isError: usersError,
    isLoading: usersLoading,
  } = useUsers(userIds, { enabled: !isEmpty(userIds) });

  const options = React.useMemo(() => {
    if (!users) return [];
    return users.map((user) => ({
      id: user.id,
      name: user.name,
      description: user.bio,
    }));
  }, [users]);

  const value = React.useMemo(() => {
    return find(options, (option) => option.id === props.assignee);
  }, [options, props.assignee]);

  return (
    <>
      <DropdownMenu open={popover} onOpenChange={togglePopover}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="icon"
            disabled={usersLoading || usersError}
            style={
              value ? ({ "--accent": "var(--color-emerald-500)" } as TSAny) : {}
            }
            className="p-2 flex items-center gap-1 text-base"
          >
            <AtSign size={18} />
            {value ? <span className="mr-1">{value.name}</span> : "Assignee"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent style={accentStyles} side="bottom" align="end">
          <DropdownMenuRadioGroup
            value={assignee}
            className="gap-0.5 flex flex-col p-1"
          >
            {options.map((option) => {
              const { id, name } = option;
              return (
                <DropdownMenuRadioItem
                  key={id}
                  value={id}
                  onSelect={() => update({ assignedTo: id })}
                  className="group text-sm gap-2 flex items-center"
                >
                  {name}
                </DropdownMenuRadioItem>
              );
            })}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

function Priority(props: {
  priority?: string;
  accentStyles: React.CSSProperties;
  update: (update: Partial<Task>) => void;
}) {
  const { accentStyles, update } = props;
  const {
    name,
    color,
    icon: Icon,
  } = props.priority ? PRIORITY_OPTIONS[props.priority] : {};

  const { value: popover, toggle: togglePopover } = useBoolean(false);

  return (
    <>
      <DropdownMenu open={popover} onOpenChange={togglePopover}>
        <DropdownMenuTrigger>
          <Button
            variant="icon"
            onClick={togglePopover}
            style={{ "--accent": color } as TSAny}
            className="p-2 flex items-center gap-1 text-base"
          >
            {!Icon ? <ChevronsUp size={18} /> : <Icon size={18} />}
            {name ? <span className="mr-1">{name}</span> : "Priority"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent style={accentStyles} side="bottom" align="end">
          <DropdownMenuRadioGroup
            value={props.priority}
            className="gap-0.5 flex flex-col p-1"
          >
            {OPTIONS.map((option) => {
              const { id, name, color, icon: Icon } = option;
              return (
                <DropdownMenuRadioItem
                  key={id}
                  value={id}
                  style={{ "--accent": color } as TSAny}
                  onSelect={() => update({ priority: id })}
                  className="group text-sm gap-2 flex items-center text-accent"
                >
                  <Icon size={20} className="text-accent" />
                  {name}
                </DropdownMenuRadioItem>
              );
            })}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

function StartDate(props: {
  startDate?: Date;
  accentStyles: React.CSSProperties;
  update: (update: Partial<Task>) => void;
}) {
  const { startDate, update, accentStyles } = props;

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="icon"
            className="p-2 flex items-center gap-1 text-base"
          >
            <Calendar size={18} />
            Start Date
          </Button>
        </PopoverTrigger>

        <PopoverContent style={accentStyles} className="w-auto p-0">
          <CalendarComponent
            mode="single"
            selected={startDate}
            onSelect={(startDate) => update({ startDate })}
            buttonVariant="icon"
          />
        </PopoverContent>
      </Popover>
    </>
  );
}

function DueDate(props: {
  dueDate?: Date | null;
  accentStyles: React.CSSProperties;
  update: (update: Partial<Task>) => void;
}) {
  const { dueDate, update, accentStyles } = props;

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="icon"
            className="p-2 flex items-center gap-1 text-base"
          >
            <CalendarCheck size={18} />
            Due Date
          </Button>
        </PopoverTrigger>

        <PopoverContent style={accentStyles} className="w-auto p-0">
          <CalendarComponent
            mode="single"
            selected={dueDate}
            onSelect={(dueDate) => update({ dueDate })}
          />
        </PopoverContent>
      </Popover>
    </>
  );
}

function SubTasks(props: {
  accentStyles: React.CSSProperties;
  update: (update: Partial<Task>) => void;
}) {
  const popoverRef = React.useRef<HTMLButtonElement>(null);
  const {
    value: popover,
    unset: unsetPopover,
    toggle: togglePopover,
  } = useBoolean(false);

  return (
    <>
      <Button
        variant="icon"
        ref={popoverRef}
        onClick={togglePopover}
        className="p-2 flex items-center gap-1 text-base w-full border border-accent/20 text-accent/20 hover:border-accent/80 hover:text-accent/80 border-dashed"
      >
        <BadgePlus size={18} />
        Sub Tasks
      </Button>
      {/*<Menu
        options={OPTIONS}
        anchor={popoverRef}
        open={popover}
        placement="bottom"
        value={""}
        style={props.accentStyles}
        onSelect={({ id }) => {
          props.update({ priority: id as TSAny });
          unsetPopover();
        }}
        onClose={unsetPopover}
        className="border border-accent/40"
      />*/}
    </>
  );
}
