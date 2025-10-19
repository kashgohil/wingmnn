import { sudokuRelations, sudokuTable } from "./games/sudoku";
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

export const schemaRelations = {
  projectsRelations,
  workflowsRelations,
  workflowStatusRelations,
  tasksRelations,
  taskRelationsRelations,
  taskCommentsRelations,
  taskHistoryRelations,
  sudokuRelations,
};

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
  sudokuTable,
  ...schemaRelations,
};
