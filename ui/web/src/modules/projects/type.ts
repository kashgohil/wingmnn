import { Status } from "./constants";

export interface Project extends BaseDetails, Metadata {}

export interface Task extends BaseDetails, Metadata {
  status: Status;
  projectId: string;
  attachments: Attachment[];
}
