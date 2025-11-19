import { audits, auditTypeEnum } from './audits';
import { projectMembers, projects, tags } from './projects';
import { sessions } from './sessions';
import { phaseEnum, priorityEnum, status, tasks, taskTags } from './tasks';
import { userGroupMembers, userGroups, users } from './users';

export const schema = {
  users,
  userGroups,
  userGroupMembers,

  sessions,

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
