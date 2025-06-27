import { mailsTable } from "./mails";
import {
  projectsRelations,
  projectsTable,
  workflowsRelations,
  workflowsTable,
  workflowStatusesRelations,
  workflowStatusesTable,
  workflowTransitionsRelations,
  workflowTransitionsTable,
} from "./projects";
import {
  taskAttachmentsRelations,
  taskAttachmentsTable,
  taskCommentsRelations,
  taskCommentsTable,
  taskHistoryRelations,
  taskHistoryTable,
  taskRelationsRelations,
  taskRelationsTable,
  tasksRelations,
  tasksTable,
} from "./tasks";
import { teamsTable } from "./teams";
import { tokensTable } from "./tokens";
import { usersTable } from "./users";

export const schema = {
  usersTable,
  tokensTable,
  teamsTable,
  tasksTable,
  taskRelationsTable,
  taskCommentsTable,
  taskAttachmentsTable,
  taskHistoryTable,
  projectsTable,
  workflowsTable,
  workflowStatusesTable,
  workflowTransitionsTable,
  mailsTable,
};

export const schemaRelations = {
  projectsRelations,
  workflowsRelations,
  workflowStatusesRelations,
  workflowTransitionsRelations,
  tasksRelations,
  taskRelationsRelations,
  taskCommentsRelations,
  taskAttachmentsRelations,
  taskHistoryRelations,
};
