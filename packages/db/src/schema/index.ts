import { mailsTable } from "./mails";
import {
  projectsRelations,
  projectsTable,
  workflowsRelations,
  workflowsTable,
  workflowStatusRelations,
  workflowStatusTable,
} from "./projects";
import {
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
  taskHistoryTable,
  projectsTable,
  workflowsTable,
  workflowStatusTable,
  mailsTable,
};

export const schemaRelations = {
  projectsRelations,
  workflowsRelations,
  workflowStatusRelations,
  tasksRelations,
  taskRelationsRelations,
  taskCommentsRelations,
  taskHistoryRelations,
};
