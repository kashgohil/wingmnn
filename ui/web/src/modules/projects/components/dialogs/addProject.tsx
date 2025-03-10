import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
} from "@components/dialog/dialog";

interface AddProjectProps {
  open: boolean;
  onClose(): void;
}

export function AddProject(props: AddProjectProps) {
  const { open, onClose } = props;

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle onClose={onClose}>Add Project</DialogTitle>
      <DialogContent className="flex items-start h-full">
        <div className="flex flex-col">

        </div>
        <div className="flex-1"></div>
      </DialogContent>
      <DialogActions></DialogActions>
    </Dialog>
  );
}
