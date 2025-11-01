import {
  and,
  count,
  db,
  desc,
  eq,
  Key,
  like,
  or,
  projectsTable,
  ProjectsTableType,
  sql,
  taskCommentsTable,
  taskHistoryTable,
  taskRelationsTable,
  tasksTable,
  TasksTableType,
  Value,
  workflowsTable,
  WorkflowsTableType,
  WorkflowStatusesTableType,
  workflowStatusTable,
} from "@wingmnn/db";
import { tryCatchAsync } from "@wingmnn/utils";

// Projects Query Utilities
const projectQuery = db.query.projectsTable;

export const projectsQuery = {
  findFirst: projectQuery.findFirst.bind(projectQuery),
  findMany: projectQuery.findMany.bind(projectQuery),
  get: getProject,
  insert: db.insert(projectsTable),
  update: db.update(projectsTable),
  delete: db.delete(projectsTable),
  search: searchProjects,
  getWithTasks: getProjectWithTasks,
  getStats: getProjectStats,
};

async function getProject(
  key: Key<ProjectsTableType>,
  value: Value<ProjectsTableType, typeof key>,
) {
  const { result, error } = await tryCatchAsync(
    db.query.projectsTable.findFirst({
      where: and(
        eq(projectsTable[key], value),
        eq(projectsTable.deleted, false),
      ),
      with: {
        projectLead: true,
      },
    }),
  );

  if (error) throw error;
  return result;
}

async function getProjectWithTasks(projectId: string) {
  const { result, error } = await tryCatchAsync(
    db.query.projectsTable.findFirst({
      where: and(
        eq(projectsTable.id, projectId),
        eq(projectsTable.deleted, false),
      ),
      with: {
        projectLead: true,
        tasks: {
          with: {
            assignee: true,
            workflowStatus: true,
            subtasks: true,
          },
          orderBy: desc(tasksTable.createdAt),
        },
      },
    }),
  );

  if (error) throw error;
  return result;
}

async function searchProjects(filters: {
  search?: string;
  status?: string;
  createdBy?: string;
  projectLead?: string;
  isArchived?: boolean;
  limit?: number;
  offset?: number;
}) {
  const conditions = [];

  conditions.push(eq(projectsTable.deleted, false));

  if (filters.search) {
    conditions.push(
      or(
        like(projectsTable.name, `%${filters.search}%`),
        like(projectsTable.description, `%${filters.search}%`),
      ),
    );
  }

  if (filters.status) {
    conditions.push(eq(projectsTable.status, filters.status as any));
  }

  if (filters.createdBy) {
    conditions.push(eq(projectsTable.createdBy, filters.createdBy));
  }

  if (filters.projectLead) {
    conditions.push(eq(projectsTable.projectLead, filters.projectLead));
  }

  if (filters.isArchived !== undefined) {
    conditions.push(eq(projectsTable.status, "archived"));
  }

  const { result, error } = await tryCatchAsync(
    db.query.projectsTable.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      with: {
        projectLead: true,
      },
      limit: filters.limit || 50,
      offset: filters.offset || 0,
      orderBy: desc(projectsTable.createdAt),
    }),
  );

  if (error) throw error;
  return result;
}

async function getProjectStats(projectId: string) {
  const { result, error } = await tryCatchAsync(
    db
      .select({
        totalTasks: count(tasksTable.id),
        completedTasks: count(sql`CASE WHEN ${tasksTable.status} IN (
        SELECT ${workflowStatusTable.id}
        FROM ${workflowStatusTable}
      ) THEN 1 END`),
      })
      .from(tasksTable)
      .where(
        and(eq(tasksTable.projectId, projectId), eq(tasksTable.deleted, false)),
      ),
  );

  if (error) throw error;
  return result[0];
}

// Workflows Query Utilities
const workflowQuery = db.query.workflowsTable;

export const workflowsQuery = {
  findFirst: workflowQuery.findFirst.bind(workflowQuery),
  findMany: workflowQuery.findMany.bind(workflowQuery),
  get: getWorkflow,
  insert: db.insert(workflowsTable),
  update: db.update(workflowsTable),
  delete: db.delete(workflowsTable),
};

async function getWorkflow(
  key: Key<WorkflowsTableType>,
  value: Value<WorkflowsTableType, typeof key>,
) {
  const { result, error } = await tryCatchAsync(
    db.query.workflowsTable.findFirst({
      where: eq(workflowsTable[key], value),
    }),
  );

  if (error) throw error;
  return result;
}

// Workflow Statuses Query Utilities
const workflowStatusQuery = db.query.workflowStatusTable;

export const workflowStatusesQuery = {
  findFirst: workflowStatusQuery.findFirst.bind(workflowStatusQuery),
  findMany: workflowStatusQuery.findMany.bind(workflowStatusQuery),
  get: getWorkflowStatus,
  insert: db.insert(workflowStatusTable),
  update: db.update(workflowStatusTable),
  delete: db.delete(workflowStatusTable),
  getByWorkflow: getStatusesByWorkflow,
};

async function getWorkflowStatus(
  key: Key<WorkflowStatusesTableType>,
  value: Value<WorkflowStatusesTableType, typeof key>,
) {
  const { result, error } = await tryCatchAsync(
    db.query.workflowStatusTable.findFirst({
      where: eq(workflowStatusTable[key], value),
      with: {
        workflow: true,
      },
    }),
  );

  if (error) throw error;
  return result;
}

async function getStatusesByWorkflow(workflowId: string) {
  const { result, error } = await tryCatchAsync(
    db.query.workflowStatusTable.findMany({
      where: eq(workflowStatusTable.workflowId, workflowId),
    }),
  );

  if (error) throw error;
  return result;
}

// Tasks Query Utilities
const taskQuery = db.query.tasksTable;

export const tasksQuery = {
  findFirst: taskQuery.findFirst.bind(taskQuery),
  findMany: taskQuery.findMany.bind(taskQuery),
  get: getTask,
  insert: db.insert(tasksTable),
  update: db.update(tasksTable),
  delete: db.delete(tasksTable),
  search: searchTasks,
  getWithRelations: getTaskWithRelations,
  getSubtasks: getSubtasks,
  getTasksByProject: getTasksByProject,
};

async function getTask(
  key: Key<TasksTableType>,
  value: Value<TasksTableType, typeof key>,
) {
  const { result, error } = await tryCatchAsync(
    db.query.tasksTable.findFirst({
      where: eq(tasksTable[key], value),
      with: {
        project: true,
        assignee: true,
        reporter: true,
        workflowStatus: true,
        parentTask: true,
        subtasks: true,
        comments: {
          orderBy: desc(taskCommentsTable.createdAt),
        },
      },
    }),
  );

  if (error) throw error;
  return result;
}

async function getTaskWithRelations(taskId: string) {
  const { result, error } = await tryCatchAsync(
    db.query.tasksTable.findFirst({
      where: eq(tasksTable.id, taskId),
      with: {
        project: true,
        assignee: true,
        reporter: true,
        workflowStatus: true,
        parentTask: true,
        subtasks: true,
        sourceRelations: {
          with: {
            targetTask: true,
          },
        },
        targetRelations: {
          with: {
            sourceTask: true,
          },
        },
        comments: {
          orderBy: desc(taskCommentsTable.createdAt),
        },
        history: {
          orderBy: desc(taskHistoryTable.createdAt),
          limit: 50,
        },
      },
    }),
  );

  if (error) throw error;
  return result;
}

async function getSubtasks(parentTaskId: string) {
  const { result, error } = await tryCatchAsync(
    db.query.tasksTable.findMany({
      where: eq(tasksTable.parentTaskId, parentTaskId),
      with: {
        assignee: true,
        workflowStatus: true,
      },
      orderBy: desc(tasksTable.createdAt),
    }),
  );

  if (error) throw error;
  return result;
}

async function getTasksByProject(
  projectId: string,
  filters: {
    status?: string;
    assignee?: string;
    priority?: string;
    type?: string;
    search?: string;
    limit?: number;
    offset?: number;
  } = {},
) {
  const conditions = [];

  conditions.push(eq(tasksTable.projectId, projectId));

  if (filters.search) {
    const search = `%${filters.search}%`;
    conditions.push(
      or(
        like(tasksTable.title, search),
        like(tasksTable.description, search),
        like(tasksTable.key, search),
      ),
    );
  }

  if (filters.status) {
    conditions.push(eq(tasksTable.status, filters.status));
  }

  if (filters.assignee) {
    conditions.push(eq(tasksTable.assignedTo, filters.assignee));
  }

  if (filters.priority) {
    conditions.push(eq(tasksTable.priority, filters.priority as any));
  }

  if (filters.type) {
    conditions.push(eq(tasksTable.type, filters.type as any));
  }

  const { result, error } = await tryCatchAsync(
    db.query.tasksTable.findMany({
      where: and(...conditions),
      with: {
        assignee: true,
        workflowStatus: true,
        parentTask: true,
      },
      limit: filters.limit || 50,
      offset: filters.offset || 0,
      orderBy: desc(tasksTable.createdAt),
    }),
  );

  if (error) throw error;
  return result;
}

async function searchTasks(filters: {
  search?: string;
  projectId?: string;
  status?: string;
  assignee?: string;
  priority?: string;
  type?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
}) {
  const conditions = [];

  if (filters.projectId) {
    conditions.push(eq(tasksTable.projectId, filters.projectId));
  }

  if (filters.search) {
    conditions.push(
      or(
        like(tasksTable.title, `%${filters.search}%`),
        like(tasksTable.description, `%${filters.search}%`),
        like(tasksTable.key, `%${filters.search}%`),
      ),
    );
  }

  if (filters.status) {
    conditions.push(eq(tasksTable.status, filters.status));
  }

  if (filters.assignee) {
    conditions.push(eq(tasksTable.assignedTo, filters.assignee));
  }

  if (filters.priority) {
    conditions.push(eq(tasksTable.priority, filters.priority as any));
  }

  if (filters.type) {
    conditions.push(eq(tasksTable.type, filters.type as any));
  }

  if (filters.tags && filters.tags.length > 0) {
    conditions.push(sql`${tasksTable.tags} && ${JSON.stringify(filters.tags)}`);
  }

  const { result, error } = await tryCatchAsync(
    db.query.tasksTable.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      with: {
        project: true,
        assignee: true,
        workflowStatus: true,
        parentTask: true,
      },
      limit: filters.limit || 50,
      offset: filters.offset || 0,
      orderBy: desc(tasksTable.createdAt),
    }),
  );

  if (error) throw error;
  return result;
}

// Task Relations Query Utilities
export const taskRelationsQuery = {
  findFirst: db.query.taskRelationsTable.findFirst.bind(
    db.query.taskRelationsTable,
  ),
  findMany: db.query.taskRelationsTable.findMany.bind(
    db.query.taskRelationsTable,
  ),
  insert: db.insert(taskRelationsTable),
  update: db.update(taskRelationsTable),
  delete: db.delete(taskRelationsTable),
};

// Task Comments Query Utilities
export const taskCommentsQuery = {
  findFirst: db.query.taskCommentsTable.findFirst.bind(
    db.query.taskCommentsTable,
  ),
  findMany: db.query.taskCommentsTable.findMany.bind(
    db.query.taskCommentsTable,
  ),
  insert: db.insert(taskCommentsTable),
  update: db.update(taskCommentsTable),
  delete: db.delete(taskCommentsTable),
};

// Task History Query Utilities
export const taskHistoryQuery = {
  findFirst: db.query.taskHistoryTable.findFirst.bind(
    db.query.taskHistoryTable,
  ),
  findMany: db.query.taskHistoryTable.findMany.bind(db.query.taskHistoryTable),
  insert: db.insert(taskHistoryTable),
};
