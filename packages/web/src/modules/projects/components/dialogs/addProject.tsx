import fileImage from "@assets/doodle-projects.png";
import { LONG_STALE } from "@frameworks/query/constants";
import { useQuery } from "@frameworks/query/hook";
import type { QueryParams } from "@frameworks/query/query";
import { ProjectsService } from "@projects/services/projectsService";
import { type Project } from "@projects/type";
import { PROJECT_WORKFLOW_KEY, WORKFLOW_STATUS_PRIMARY_KEY } from "@queryKeys";
import {
  Button,
  cx,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Input,
  TextArea,
  Typography,
  Upload,
} from "@wingmnn/components";
import { Check } from "@wingmnn/components/icons";
import { Colors, isEmpty, map, noop } from "@wingmnn/utils";
import { AnimatePresence, motion } from "motion/react";
import React from "react";

interface AddProjectProps {
  open: boolean;
  onClose(): void;
}

type AddProjectStep = "basic-details" | "configuration";

export function AddProject(props: AddProjectProps) {
  const { open, onClose } = props;

  const [dir, setDir] = React.useState<"left" | "right">("right");
  const [step, setStep] = React.useState<AddProjectStep>("basic-details");
  const [project, setProject] = React.useState({} as Project);
  const [selectedWorkflow, setSelectedWorkflow] =
    React.useState<string>("basic");

  const {
    result: workflows,
    isLoading: workflowsLoading,
    isError: workflowsError,
  } = useQuery({
    key: PROJECT_WORKFLOW_KEY,
    staleTime: LONG_STALE,
    queryFn: ProjectsService.getWorkflows,
    selector: (res) => res.data,
  });

  const statusKey = React.useMemo(() => {
    return {
      primaryKey: WORKFLOW_STATUS_PRIMARY_KEY,
      params: map(workflows || [], (workflow) => workflow.id),
    };
  }, [workflows]);

  const statusQueryFn = React.useCallback(
    (queryParams: QueryParams<Array<string>>) => {
      const { params } = queryParams;
      return ProjectsService.getStatusForWorkflows(params!);
    },
    [],
  );

  const {
    result: statuses,
    isLoading: statusesLoading,
    isError: statusesError,
  } = useQuery({
    key: statusKey,
    staleTime: LONG_STALE,
    queryFn: statusQueryFn,
    selector: (res) => res.data,
    enabled: !isEmpty(workflows),
  });

  const update = React.useCallback((updates: Partial<Project>) => {
    setProject((draft) => ({ ...draft, ...updates }));
  }, []);

  const next = React.useCallback(() => {
    setDir("right");
    React.startTransition(() => {
      switch (step) {
        case "basic-details":
          setStep("configuration");
          break;
        case "configuration":
          console.log(project);
          onClose();
          break;
      }
    });
  }, [project, onClose, step]);

  const back = React.useCallback(() => {
    setDir("left");
    React.startTransition(() => {
      switch (step) {
        case "basic-details":
          onClose();
          break;
        case "configuration":
          setStep("basic-details");
          break;
      }
    });
  }, [onClose, step]);

  function title() {
    switch (step) {
      case "basic-details":
        return (
          <div className="flex flex-col gap-1">
            What do you want to call this Project?
            <Typography.Caption className="text-white-950">
              Give me details about the project.
            </Typography.Caption>
          </div>
        );
      case "configuration":
        return (
          <div className="flex flex-col gap-1">
            How do you want to manage this Project?
            <Typography.Caption className="text-white-950">
              Choose wisely. You cannot change your mind later.
            </Typography.Caption>
          </div>
        );
    }
  }

  function stepContent() {
    const variants = {
      enter: {
        translateX: dir === "right" ? "100%" : "-100%",
      },
      center: {
        translateX: 0,
      },
      exit: {
        translateX: dir === "right" ? "-100%" : "100%",
      },
    };

    switch (step) {
      case "basic-details":
        return (
          <motion.div
            key="basic-details"
            className="flex flex-col gap-4 absolute inset-0 w-full p-4"
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
              mass: 0.8,
            }}
          >
            <div className="flex items-center w-full gap-2">
              <Input
                size="sm"
                autoFocus
                type="text"
                name="name"
                variant="outlined"
                value={project.name}
                wrapperClassName="flex-1"
                placeholder="What is it called?"
                onChange={(name: string) => update({ name })}
              />
              <Input
                size="sm"
                type="text"
                name="key"
                variant="outlined"
                value={project.key}
                placeholder={
                  project.name
                    ? `Project Key - ${project.name?.slice(0, 4)?.toUpperCase()}`
                    : "Project Key"
                }
                onChange={(key: string) => update({ key })}
              />
            </div>
            <TextArea
              size="sm"
              name="description"
              variant="outlined"
              className="w-full"
              value={project.description}
              placeholder="Tell me about it"
              onChange={(description: string) => update({ description })}
            />
            <Upload
              onUpload={noop}
              message="Give it a face"
              onRemove={() => update({ image: undefined })}
            />
          </motion.div>
        );
      case "configuration":
        if (workflowsLoading || statusesLoading) {
          return <div></div>;
        }
        if (workflowsError || statusesError) {
          return <div></div>;
        }
        return (
          <motion.div
            key="configuration"
            className="flex gap-4 absolute inset-0 w-full p-4 overflow-x-auto"
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
              mass: 0.8,
            }}
          >
            {map(workflows || [], ({ id, name, description }) => (
              <Button
                onClick={() => {
                  setSelectedWorkflow(id!);
                  update({ workflow: id! });
                }}
                data-selected={selectedWorkflow === id}
                variant="stripped"
                className="focus-within:outline-accent border focus:border-transparent border-accent/50 data-[selected=true]:bg-accent/10"
              >
                <div
                  key={id}
                  onClick={() => {
                    setSelectedWorkflow(id!);
                    update({ workflow: id! });
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedWorkflow(id!);
                      update({ workflow: id! });
                    }
                  }}
                  aria-pressed={selectedWorkflow === id}
                  aria-label={`Select ${name} workflow`}
                  aria-describedby={`workflow-${id}-description`}
                  className="h-full flex flex-col text-left transition-all justify-between rounded-lg cursor-pointer overflow-hidden min-w-64 relative"
                >
                  <div className="flex-1 flex flex-col justify-center gap-2 p-4">
                    {map(
                      statuses![id!],
                      ({ id: statusId, name: statusName, color }) => (
                        <div
                          key={statusId}
                          style={{
                            background: color!,
                          }}
                          className="gap-2 p-1.5 px-4 rounded text-center"
                        >
                          <Typography.Paragraph
                            className={cx(
                              Colors.getOptimalTextClass(color!),
                              "font-semibold text-sm",
                            )}
                          >
                            {statusName}
                          </Typography.Paragraph>
                        </div>
                      ),
                    )}
                  </div>
                  <div className="p-4 bg-accent/20">
                    <Typography.Paragraph className="text-accent font-semibold">
                      {name}
                    </Typography.Paragraph>
                    <Typography.Caption
                      id={`workflow-${id}-description`}
                      className="text-white-950 leading-0"
                    >
                      {description}
                    </Typography.Caption>
                  </div>
                  {selectedWorkflow === id && (
                    <div className="rounded-full p-0.5 h-4 w-4 bg-accent flex items-center justify-center absolute top-2 right-2">
                      <Check size={16} className="text-primary" />
                    </div>
                  )}
                </div>
              </Button>
            ))}
          </motion.div>
        );
    }
  }

  return (
    <Dialog
      size="lg"
      open={open}
      onClose={onClose}
      className="relative flex h-150 overflow-hidden"
    >
      <div
        className="w-1/4 opacity-50 h-full bg-cover bg-center"
        style={{
          backgroundImage: `url(${fileImage})`,
        }}
      />
      <div className="flex-1 h-full flex flex-col">
        <DialogTitle onClose={onClose} className="text-accent">
          {title()}
        </DialogTitle>
        <DialogContent className="flex-1 flex overflow-hidden relative">
          <AnimatePresence>{stepContent()}</AnimatePresence>
        </DialogContent>
        <DialogActions className="flex justify-between">
          {step !== "basic-details" && (
            <Button size="sm" variant="secondary" onClick={back}>
              Back
            </Button>
          )}
          <div className="flex flex-1 justify-end items-center gap-2">
            <Button size="sm" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button size="sm" onClick={next}>
              {step === "configuration" ? "Create" : "Next"}
            </Button>
          </div>
        </DialogActions>
      </div>
    </Dialog>
  );
}
