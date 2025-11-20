import { audits, auditTypeEnum } from "./audits";
import { projectMembers, projects, tags } from "./projects";
import { sessions, usedRefreshTokens } from "./sessions";
import { phaseEnum, priorityEnum, status, tasks, taskTags } from "./tasks";
import { oauthAccounts, userGroupMembers, userGroups, users } from "./users";

export const schema = {
  users,
  userGroups,
  userGroupMembers,
  oauthAccounts,

  sessions,
  usedRefreshTokens,

  audits,

  tags,
  projects,
  projectMembers,

  tasks,
  status,
  taskTags,
};

export const enums = {
  priorityEnum,
  phaseEnum,
  auditTypeEnum,
};
