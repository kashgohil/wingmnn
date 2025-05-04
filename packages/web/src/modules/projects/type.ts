import { Status } from "./constants";

export interface Project extends BaseDetails, Metadata {
  image: string;
}

export interface Task extends BaseDetails, Metadata {
  status: Status;
  projectId: string;
  attachments: Array<Attachment>;
}
