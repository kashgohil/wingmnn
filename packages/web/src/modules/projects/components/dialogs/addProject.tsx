import { type Project } from "@projects/type";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Input,
  TextArea,
  Upload,
} from "@wingmnn/components";
import { noop } from "@wingmnn/utils";
import React from "react";

interface AddProjectProps {
  open: boolean;
  onClose(): void;
}

export function AddProject(props: AddProjectProps) {
  const { open, onClose } = props;

  const [project, setProject] = React.useState({} as Project);

  const update = React.useCallback((updates: Partial<Project>) => {
    setProject((draft) => ({ ...draft, ...updates }));
  }, []);

  const create = React.useCallback(() => {
    console.log(project);
    onClose();
  }, [project, onClose]);

  return (
    <Dialog size="sm" open={open} onClose={onClose}>
      <DialogTitle onClose={onClose}>Add Project</DialogTitle>
      <DialogContent className="flex items-start h-full">
        <div className="flex flex-col w-full space-y-3">
          <Input
            size="sm"
            autoFocus
            type="text"
            name="name"
            variant="outlined"
            className="w-full"
            placeholder="Project Name"
            onChange={(name: string) => update({ name })}
          />
          <TextArea
            size="sm"
            name="description"
            variant="outlined"
            className="w-full"
            placeholder="Project Description"
            onChange={(description: string) => update({ description })}
          />
          <Upload
            onUpload={noop}
            message="Project Image"
            onRemove={() => update({ image: undefined })}
          />
        </div>
      </DialogContent>
      <DialogActions className="justify-end space-x-2">
        <Button size="sm" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button size="sm" onClick={create}>
          Next
        </Button>
      </DialogActions>
    </Dialog>
  );
}
