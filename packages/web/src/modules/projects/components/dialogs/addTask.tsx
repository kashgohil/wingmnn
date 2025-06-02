import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@wingmnn/components";

interface AddTaskProps {
  open: boolean;
  onClose: () => void;
}

export function AddTask({ open, onClose }: AddTaskProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Add Task</DialogTitle>
      <DialogContent></DialogContent>
      <DialogActions></DialogActions>
    </Dialog>
  );
}
