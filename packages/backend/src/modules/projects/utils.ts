import {
  db,
  Key,
  projectsTable,
  ProjectsTableType,
  taskAttachmentsTable,
  taskCommentsTable,
  taskHistoryTable,
  taskRelationsTable,
  tasksTable,
  TasksTableType,
  Value,
  workflowsTable,
  WorkflowsTableType,
  workflowStatusesTable,
  WorkflowStatusesTableType,
} from "@wingmnn/db";
import { tryCatchAsync } from "@wingmnn/utils";
import { and, asc, count, desc, eq, like, or, sql } from "drizzle-orm";

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
      where: eq(projectsTable[key], value),
      with: {
        projectLead: true,
        workflows: {
          with: {
            statuses: {
              orderBy: asc(workflowStatusesTable.order),
            },
          },
        },
      },
    }),
  );

  if (error) throw error;
  return result;
}

async function getProjectWithTasks(projectId: string) {
  const { result, error } = await tryCatchAsync(
    db.query.projectsTable.findFirst({
      where: eq(projectsTable.id, projectId),
      with: {
        projectLead: true,
        workflows: {
          with: {
            statuses: {
              orderBy: asc(workflowStatusesTable.order),
            },
          },
        },
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
  priority?: number;
  createdBy?: string;
  projectLead?: string;
  tags?: string[];
  isArchived?: boolean;
  limit?: number;
  offset?: number;
}) {
  const conditions = [];

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

  if (filters.priority) {
    conditions.push(eq(projectsTable.priority, filters.priority));
  }

  if (filters.createdBy) {
    conditions.push(eq(projectsTable.createdBy, filters.createdBy));
  }

  if (filters.projectLead) {
    conditions.push(eq(projectsTable.projectLead, filters.projectLead));
  }

  if (filters.isArchived !== undefined) {
    conditions.push(eq(projectsTable.isArchived, filters.isArchived));
  }

  if (filters.tags && filters.tags.length > 0) {
    conditions.push(
      sql`${projectsTable.tags} && ${JSON.stringify(filters.tags)}`,
    );
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
        completedTasks: count(sql`CASE WHEN ${tasksTable.workflowStatusId} IN (
        SELECT ${workflowStatusesTable.id}
        FROM ${workflowStatusesTable}
        WHERE ${workflowStatusesTable.isFinal} = true
      ) THEN 1 END`),
      })
      .from(tasksTable)
      .where(eq(tasksTable.projectId, projectId)),
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
  getByProject: getWorkflowsByProject,
};

async function getWorkflow(
  key: Key<WorkflowsTableType>,
  value: Value<WorkflowsTableType, typeof key>,
) {
  const { result, error } = await tryCatchAsync(
    db.query.workflowsTable.findFirst({
      where: eq(workflowsTable[key], value),
      with: {
        project: true,
        statuses: {
          orderBy: asc(workflowStatusesTable.order),
        },
        transitions: {
          with: {
            fromStatus: true,
            toStatus: true,
          },
        },
      },
    }),
  );

  if (error) throw error;
  return result;
}

async function getWorkflowsByProject(projectId: string) {
  const { result, error } = await tryCatchAsync(
    db.query.workflowsTable.findMany({
      where: eq(workflowsTable.projectId, projectId),
      with: {
        statuses: {
          orderBy: asc(workflowStatusesTable.order),
        },
      },
    }),
  );

  if (error) throw error;
  return result;
}

// Workflow Statuses Query Utilities
const workflowStatusQuery = db.query.workflowStatusesTable;

export const workflowStatusesQuery = {
  findFirst: workflowStatusQuery.findFirst.bind(workflowStatusQuery),
  findMany: workflowStatusQuery.findMany.bind(workflowStatusQuery),
  get: getWorkflowStatus,
  insert: db.insert(workflowStatusesTable),
  update: db.update(workflowStatusesTable),
  delete: db.delete(workflowStatusesTable),
  getByWorkflow: getStatusesByWorkflow,
};

async function getWorkflowStatus(
  key: Key<WorkflowStatusesTableType>,
  value: Value<WorkflowStatusesTableType, typeof key>,
) {
  const { result, error } = await tryCatchAsync(
    db.query.workflowStatusesTable.findFirst({
      where: eq(workflowStatusesTable[key], value),
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
    db.query.workflowStatusesTable.findMany({
      where: eq(workflowStatusesTable.workflowId, workflowId),
      orderBy: asc(workflowStatusesTable.order),
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
        attachments: true,
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
        attachments: true,
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
    conditions.push(eq(tasksTable.workflowStatusId, filters.status));
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
    conditions.push(eq(tasksTable.workflowStatusId, filters.status));
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

// Task Attachments Query Utilities
export const taskAttachmentsQuery = {
  findFirst: db.query.taskAttachmentsTable.findFirst.bind(
    db.query.taskAttachmentsTable,
  ),
  findMany: db.query.taskAttachmentsTable.findMany.bind(
    db.query.taskAttachmentsTable,
  ),
  insert: db.insert(taskAttachmentsTable),
  update: db.update(taskAttachmentsTable),
  delete: db.delete(taskAttachmentsTable),
};

// Task History Query Utilities
export const taskHistoryQuery = {
  findFirst: db.query.taskHistoryTable.findFirst.bind(
    db.query.taskHistoryTable,
  ),
  findMany: db.query.taskHistoryTable.findMany.bind(db.query.taskHistoryTable),
  insert: db.insert(taskHistoryTable),
};
