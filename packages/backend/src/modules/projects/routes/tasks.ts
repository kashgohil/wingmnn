import { projects } from "@projects/router";
import { ProjectService } from "@projects/service/projectService";
import { ErrorWrapper, ResponseWrapper } from "@types";
import { Task, NewTask, TaskComment, NewTaskComment, TaskAttachment, NewTaskAttachment, TaskRelation, NewTaskRelation } from "@wingmnn/db";
import { tryCatchAsync } from "@wingmnn/utils";

const projectService = new ProjectService();

// Create new task
projects.post("/tasks/create", async (c) => {
  const { id: userId } = c.get("user");
  const body = await c.req.json();

  const taskData: Omit<NewTask, "id" | "createdAt" | "updatedAt" | "key"> = {
    title: body.title,
    description: body.description,
    content: body.content,
    type: body.type || "task",
    priority: body.priority || "medium",
    projectId: body.projectId,
    workflowStatusId: body.workflowStatusId,
    assignedTo: body.assignedTo,
    parentTaskId: body.parentTaskId,
    originalEstimate: body.originalEstimate,
    remainingEstimate: body.remainingEstimate,
    startDate: body.startDate,
    dueDate: body.dueDate,
    storyPoints: body.storyPoints,
    tags: body.tags || [],
    customFields: body.customFields || {},
    createdBy: userId,
    updatedBy: userId,
    deleted: false,
  };

  const { result: task, error } = await tryCatchAsync<Task>(
    projectService.createTask(taskData)
  );

  if (error) {
    return c.json<ErrorWrapper>({
      error: {
        message: error.message,
        code: "TASK_CREATE_ERROR",
      },
    }, 400);
  }

  return c.json<ResponseWrapper<Task>>({
    data: task,
  }, 201);
});

// Get task by ID
projects.get("/tasks/get/:taskId", async (c) => {
  const taskId = c.req.param("taskId");
  const { id: userId } = c.get("user");

  const { result: task, error } = await tryCatchAsync<Task>(
    projectService.getTask(taskId)
  );

  if (error) {
    return c.json<ErrorWrapper>({
      error: {
        message: error.message,
        code: "TASK_GET_ERROR",
      },
    }, 400);
  }

  return c.json<ResponseWrapper<Task>>({
    data: task,
  });
});

// Get task with all relations
projects.get("/tasks/get/:taskId/with-relations", async (c) => {
  const taskId = c.req.param("taskId");
  const { id: userId } = c.get("user");

  const { result: task, error } = await tryCatchAsync(
    projectService.getTaskWithRelations(taskId)
  );

  if (error) {
    return c.json<ErrorWrapper>({
      error: {
        message: error.message,
        code: "TASK_GET_WITH_RELATIONS_ERROR",
      },
    }, 400);
  }

  return c.json<ResponseWrapper<typeof task>>({
    data: task,
  });
});

// Update task
projects.put("/tasks/update/:taskId", async (c) => {
  const taskId = c.req.param("taskId");
  const { id: userId } = c.get("user");
  const body = await c.req.json();

  const updateData: Partial<NewTask> = {
    title: body.title,
    description: body.description,
    content: body.content,
    type: body.type,
    priority: body.priority,
    workflowStatusId: body.workflowStatusId,
    assignedTo: body.assignedTo,
    parentTaskId: body.parentTaskId,
    originalEstimate: body.originalEstimate,
    remainingEstimate: body.remainingEstimate,
    timeSpent: body.timeSpent,
    startDate: body.startDate,
    dueDate: body.dueDate,
    storyPoints: body.storyPoints,
    tags: body.tags,
    customFields: body.customFields,
    isArchived: body.isArchived,
  };

  // Remove undefined values
  Object.keys(updateData).forEach(key => {
    if (updateData[key as keyof typeof updateData] === undefined) {
      delete updateData[key as keyof typeof updateData];
    }
  });

  const { result: task, error } = await tryCatchAsync<Task>(
    projectService.updateTask(taskId, updateData, userId)
  );

  if (error) {
    return c.json<ErrorWrapper>({
      error: {
        message: error.message,
        code: "TASK_UPDATE_ERROR",
      },
    }, 400);
  }

  return c.json<ResponseWrapper<Task>>({
    data: task,
  });
});

// Delete task
projects.delete("/tasks/delete/:taskId", async (c) => {
  const taskId = c.req.param("taskId");
  const { id: userId } = c.get("user");

  const { result, error } = await tryCatchAsync(
    projectService.deleteTask(taskId, userId)
  );

  if (error) {
    return c.json<ErrorWrapper>({
      error: {
        message: error.message,
        code: "TASK_DELETE_ERROR",
      },
    }, 400);
  }

  return c.json<ResponseWrapper<typeof result>>({
    data: result,
  });
});

// Get tasks by project (paginated)
projects.post("/tasks/project/:projectId", async (c) => {
  const projectId = c.req.param("projectId");
  const { id: userId } = c.get("user");
  const body = await c.req.json();

  const filters = {
    projectId,
    status: body.status,
    assignee: body.assignee,
    priority: body.priority,
    type: body.type,
    search: body.search,
    limit: body.limit || 50,
    offset: body.offset || 0,
  };

  const { result: tasks, error } = await tryCatchAsync<Task[]>(
    projectService.getTasksPaginated(filters)
  );

  if (error) {
    return c.json<ErrorWrapper>({
      error: {
        message: error.message,
        code: "TASKS_GET_BY_PROJECT_ERROR",
      },
    }, 400);
  }

  return c.json<ResponseWrapper<Task[]>>({
    data: tasks,
  });
});

// Search tasks
projects.post("/tasks/search", async (c) => {
  const { id: userId } = c.get("user");
  const body = await c.req.json();

  const filters = {
    search: body.search,
    projectId: body.projectId,
    status: body.status,
    assignee: body.assignee,
    priority: body.priority,
    type: body.type,
    tags: body.tags,
    limit: body.limit || 50,
    offset: body.offset || 0,
  };

  const { result: tasks, error } = await tryCatchAsync<Task[]>(
    projectService.getTasksPaginated(filters)
  );

  if (error) {
    return c.json<ErrorWrapper>({
      error: {
        message: error.message,
        code: "TASKS_SEARCH_ERROR",
      },
    }, 400);
  }

  return c.json<ResponseWrapper<Task[]>>({
    data: tasks,
  });
});

// Get subtasks
projects.get("/tasks/subtasks/:parentTaskId", async (c) => {
  const parentTaskId = c.req.param("parentTaskId");
  const { id: userId } = c.get("user");

  const { result: subtasks, error } = await tryCatchAsync<Task[]>(
    projectService.getSubtasks(parentTaskId)
  );

  if (error) {
    return c.json<ErrorWrapper>({
      error: {
        message: error.message,
        code: "SUBTASKS_GET_ERROR",
      },
    }, 400);
  }

  return c.json<ResponseWrapper<Task[]>>({
    data: subtasks,
  });
});

// Assign task
projects.patch("/tasks/assign/:taskId", async (c) => {
  const taskId = c.req.param("taskId");
  const { id: userId } = c.get("user");
  const body = await c.req.json();

  if (!body.assigneeId) {
    return c.json<ErrorWrapper>({
      error: {
        message: "Assignee ID is required",
        code: "ASSIGNEE_ID_REQUIRED",
      },
    }, 400);
  }

  const { result: task, error } = await tryCatchAsync<Task>(
    projectService.assignTask(taskId, body.assigneeId, userId)
  );

  if (error) {
    return c.json<ErrorWrapper>({
      error: {
        message: error.message,
        code: "TASK_ASSIGN_ERROR",
      },
    }, 400);
  }

  return c.json<ResponseWrapper<Task>>({
    data: task,
  });
});

// Update task status
projects.patch("/tasks/status/:taskId", async (c) => {
  const taskId = c.req.param("taskId");
  const { id: userId } = c.get("user");
  const body = await c.req.json();

  if (!body.statusId) {
    return c.json<ErrorWrapper>({
      error: {
        message: "Status ID is required",
        code: "STATUS_ID_REQUIRED",
      },
    }, 400);
  }

  const { result: task, error } = await tryCatchAsync<Task>(
    projectService.updateTaskStatus(taskId, body.statusId, userId)
  );

  if (error) {
    return c.json<ErrorWrapper>({
      error: {
        message: error.message,
        code: "TASK_STATUS_UPDATE_ERROR",
      },
    }, 400);
  }

  return c.json<ResponseWrapper<Task>>({
    data: task,
  });
});

// Create task relation
projects.post("/tasks/relations/create", async (c) => {
  const { id: userId } = c.get("user");
  const body = await c.req.json();

  const relationData: Omit<NewTaskRelation, "id" | "createdAt" | "updatedAt"> = {
    sourceTaskId: body.sourceTaskId,
    targetTaskId: body.targetTaskId,
    relationType: body.relationType,
    description: body.description,
    createdBy: userId,
    updatedBy: userId,
    deleted: false,
  };

  const { result: relation, error } = await tryCatchAsync<TaskRelation>(
    projectService.createTaskRelation(relationData)
  );

  if (error) {
    return c.json<ErrorWrapper>({
      error: {
        message: error.message,
        code: "TASK_RELATION_CREATE_ERROR",
      },
    }, 400);
  }

  return c.json<ResponseWrapper<TaskRelation>>({
    data: relation,
  }, 201);
});

// Delete task relation
projects.delete("/tasks/relations/delete/:relationId", async (c) => {
  const relationId = c.req.param("relationId");
  const { id: userId } = c.get("user");

  const { result, error } = await tryCatchAsync(
    projectService.deleteTaskRelation(relationId, userId)
  );

  if (error) {
    return c.json<ErrorWrapper>({
      error: {
        message: error.message,
        code: "TASK_RELATION_DELETE_ERROR",
      },
    }, 400);
  }

  return c.json<ResponseWrapper<typeof result>>({
    data: result,
  });
});

// Add task comment
projects.post("/tasks/comments/create", async (c) => {
  const { id: userId } = c.get("user");
  const body = await c.req.json();

  const commentData: Omit<NewTaskComment, "id" | "createdAt" | "updatedAt"> = {
    taskId: body.taskId,
    content: body.content,
    isInternal: body.isInternal || false,
    createdBy: userId,
    updatedBy: userId,
    deleted: false,
  };

  const { result: comment, error } = await tryCatchAsync<TaskComment>(
    projectService.addTaskComment(commentData)
  );

  if (error) {
    return c.json<ErrorWrapper>({
      error: {
        message: error.message,
        code: "TASK_COMMENT_CREATE_ERROR",
      },
    }, 400);
  }

  return c.json<ResponseWrapper<TaskComment>>({
    data: comment,
  }, 201);
});

// Update task comment
projects.put("/tasks/comments/update/:commentId", async (c) => {
  const commentId = c.req.param("commentId");
  const { id: userId } = c.get("user");
  const body = await c.req.json();

  if (!body.content) {
    return c.json<ErrorWrapper>({
      error: {
        message: "Comment content is required",
        code: "COMMENT_CONTENT_REQUIRED",
      },
    }, 400);
  }

  const { result: comment, error } = await tryCatchAsync<TaskComment>(
    projectService.updateTaskComment(commentId, body.content, userId)
  );

  if (error) {
    return c.json<ErrorWrapper>({
      error: {
        message: error.message,
        code: "TASK_COMMENT_UPDATE_ERROR",
      },
    }, 400);
  }

  return c.json<ResponseWrapper<TaskComment>>({
    data: comment,
  });
});

// Delete task comment
projects.delete("/tasks/comments/delete/:commentId", async (c) => {
  const commentId = c.req.param("commentId");
  const { id: userId } = c.get("user");

  const { result, error } = await tryCatchAsync(
    projectService.deleteTaskComment(commentId, userId)
  );

  if (error) {
    return c.json<ErrorWrapper>({
      error: {
        message: error.message,
        code: "TASK_COMMENT_DELETE_ERROR",
      },
    }, 400);
  }

  return c.json<ResponseWrapper<typeof result>>({
    data: result,
  });
});

// Add task attachment
projects.post("/tasks/attachments/create", async (c) => {
  const { id: userId } = c.get("user");
  const body = await c.req.json();

  const attachmentData: Omit<NewTaskAttachment, "id" | "createdAt" | "updatedAt"> = {
    taskId: body.taskId,
    fileName: body.fileName,
    fileUrl: body.fileUrl,
    fileSize: body.fileSize,
    mimeType: body.mimeType,
    createdBy: userId,
    updatedBy: userId,
    deleted: false,
  };

  const { result: attachment, error } = await tryCatchAsync<TaskAttachment>(
    projectService.addTaskAttachment(attachmentData)
  );

  if (error) {
    return c.json<ErrorWrapper>({
      error: {
        message: error.message,
        code: "TASK_ATTACHMENT_CREATE_ERROR",
      },
    }, 400);
  }

  return c.json<ResponseWrapper<TaskAttachment>>({
    data: attachment,
  }, 201);
});

// Delete task attachment
projects.delete("/tasks/attachments/delete/:attachmentId", async (c) => {
  const attachmentId = c.req.param("attachmentId");
  const { id: userId } = c.get("user");

  const { result, error } = await tryCatchAsync(
    projectService.deleteTaskAttachment(attachmentId, userId)
  );

  if (error) {
    return c.json<ErrorWrapper>({
      error: {
        message: error.message,
        code: "TASK_ATTACHMENT_DELETE_ERROR",
      },
    }, 400);
  }

  return c.json<ResponseWrapper<typeof result>>({
    data: result,
  });
});