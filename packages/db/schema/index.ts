import { audits, auditTypeEnum } from "./audits";
import { projectMembers, projects, projectStatusEnum, tags } from "./projects";
import { sessions, usedRefreshTokens } from "./sessions";
import {
  activityLogs,
  activityTypeEnum,
  attachments,
  comments,
  notifications,
  priorityEnum,
  relatedEntityTypeEnum,
  subtasks,
  taskLinks,
  taskLinkTypeEnum,
  tasks,
  taskTags,
  timeEntries,
} from "./tasks";
import { oauthAccounts, userGroupMembers, userGroups, users } from "./users";
import {
  phaseEnum,
  workflows,
  workflowStatuses,
  workflowTypeEnum,
} from "./workflows";

export const schema = {
  users,
  userGroups,
  userGroupMembers,
  oauthAccounts,

  sessions,
  usedRefreshTokens,

  audits,

  workflows,
  workflowStatuses,

  tags,
  projects,
  projectMembers,

  tasks,
  subtasks,
  taskLinks,
  taskTags,
  timeEntries,
  comments,
  attachments,
  activityLogs,
  notifications,
};

export const enums = {
  priorityEnum,
  phaseEnum,
  auditTypeEnum,
  workflowTypeEnum,
  projectStatusEnum,
  relatedEntityTypeEnum,
  taskLinkTypeEnum,
  activityTypeEnum,
};
