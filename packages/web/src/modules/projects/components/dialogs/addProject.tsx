import fileImage from "@assets/doodle-projects.png";
import { templates } from "@projects/constants/templates";
import { type Project } from "@projects/type";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Input,
  TextArea,
  Typography,
  Upload,
} from "@wingmnn/components";
import { map, noop } from "@wingmnn/utils";
import { AnimatePresence, motion } from "motion/react";
import React from "react";

interface AddProjectProps {
  open: boolean;
  onClose(): void;
}

type AddProjectStep = "basic-details" | "template" | "configuration";

export function AddProject(props: AddProjectProps) {
  const { open, onClose } = props;

  const shorthandRef = React.useRef<HTMLInputElement>(null);

  const [dir, setDir] = React.useState<"left" | "right">("right");
  const [step, setStep] = React.useState<AddProjectStep>("basic-details");
  const [project, setProject] = React.useState({} as Project);

  const update = React.useCallback((updates: Partial<Project>) => {
    setProject((draft) => ({ ...draft, ...updates }));
  }, []);

  const next = React.useCallback(() => {
    setDir("right");
    // Use a small delay to ensure direction is set before step changes
    React.startTransition(() => {
      switch (step) {
        case "basic-details":
          setStep("template");
          break;
        case "template":
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
    // Use a small delay to ensure direction is set before step changes
    React.startTransition(() => {
      switch (step) {
        case "basic-details":
          onClose();
          break;
        case "template":
          setStep("basic-details");
          break;
        case "configuration":
          setStep("template");
          break;
      }
    });
  }, [onClose, step]);

  function title() {
    switch (step) {
      case "basic-details":
        return "Tell me about this Project..";
      case "template":
        return `What should ${project.name} look like`;
      case "configuration":
        return `Make ${project.name} your own`;
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
            <Input
              size="sm"
              autoFocus
              type="text"
              name="name"
              variant="outlined"
              value={project.name}
              placeholder="What is it called?"
              onChange={(name: string) => update({ name })}
            />
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
      case "template":
        return (
          <motion.div
            key="template"
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
            {map(templates, (template) => (
              <div
                key={template.id}
                tabIndex={0}
                className="flex focus-within:outline-offset-2 focus-within:outline-2 focus-within:outline-accent focus-within:border-transparent transition-all justify-between rounded-lg border border-accent/50 cursor-pointer"
              >
                <div className="flex-1 p-4">
                  <Typography.H3 className="text-accent">
                    {template.name}
                  </Typography.H3>
                  <Typography.Paragraph className="text-white-950">
                    {template.description}
                  </Typography.Paragraph>
                </div>
                <div
                  className="w-1/5 opacity-50 h-full bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${fileImage})`,
                  }}
                />
              </div>
            ))}
          </motion.div>
        );
      case "configuration":
        return (
          <motion.div
            key="configuration"
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
            <Input
              size="sm"
              type="text"
              name="key"
              delayedFocus={200}
              ref={shorthandRef}
              variant="outlined"
              value={project.key}
              placeholder="Shorthand"
              onChange={(key: string) => update({ key })}
            />
          </motion.div>
        );
    }
  }

  return (
    <Dialog
      size="lg"
      open={open}
      onClose={onClose}
      className="relative flex h-150"
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
