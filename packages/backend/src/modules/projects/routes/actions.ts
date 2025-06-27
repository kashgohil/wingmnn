import { projects } from "@projects/router";
import { ProjectService } from "@projects/service/projectService";
import { ErrorWrapper, ResponseWrapper } from "@types";
import { tryCatchAsync } from "@wingmnn/utils";

const projectService = new ProjectService();

// Generic actions handler
projects.post("/actions", async (c) => {
  const { id: userId } = c.get("user");
  const body = await c.req.json();

  const { actionType, targetId, additionalData } = body;

  if (!actionType || !targetId) {
    return c.json<ErrorWrapper>(
      {
        message: "Action type and target ID are required",
        code: "MISSING_REQUIRED_FIELDS",
      },
      400,
    );
  }

  const { result, error } = await tryCatchAsync(
    projectService.actions(actionType, targetId, userId, additionalData),
  );

  if (error) {
    return c.json<ErrorWrapper>(
      {
        message: error.message,
        code: "ACTION_ERROR",
      },
      400,
    );
  }

  return c.json<ResponseWrapper<typeof result>>({
    data: result,
  });
});

// Bulk actions for multiple items
projects.post("/actions/bulk", async (c) => {
  const { id: userId } = c.get("user");
  const body = await c.req.json();

  const { actionType, targetIds, additionalData } = body;

  if (!actionType || !targetIds || !Array.isArray(targetIds)) {
    return c.json<ErrorWrapper>(
      {
        message: "Action type and target IDs array are required",
        code: "MISSING_REQUIRED_FIELDS",
      },
      400,
    );
  }

  const results = [];
  const errors = [];

  for (const targetId of targetIds) {
    const { result, error } = await tryCatchAsync(
      projectService.actions(actionType, targetId, userId, additionalData),
    );

    if (error) {
      errors.push({
        targetId,
        error: error.message,
      });
    } else {
      results.push({
        targetId,
        result,
      });
    }
  }

  return c.json<
    ResponseWrapper<{
      successful: typeof results;
      failed: typeof errors;
      summary: {
        total: number;
        successful: number;
        failed: number;
      };
    }>
  >({
    data: {
      successful: results,
      failed: errors,
      summary: {
        total: targetIds.length,
        successful: results.length,
        failed: errors.length,
      },
    },
  });
});

// Project-specific actions
projects.post("/actions/project/:projectId", async (c) => {
  const projectId = c.req.param("projectId");
  const { id: userId } = c.get("user");
  const body = await c.req.json();

  const { actionType, additionalData } = body;

  if (!actionType) {
    return c.json<ErrorWrapper>(
      {
        message: "Action type is required",
        code: "MISSING_ACTION_TYPE",
      },
      400,
    );
  }

  const { result, error } = await tryCatchAsync(
    projectService.actions(actionType, projectId, userId, additionalData),
  );

  if (error) {
    return c.json<ErrorWrapper>(
      {
        message: error.message,
        code: "PROJECT_ACTION_ERROR",
      },
      400,
    );
  }

  return c.json<ResponseWrapper<typeof result>>({
    data: result,
  });
});

// Task-specific actions
projects.post("/actions/task/:taskId", async (c) => {
  const taskId = c.req.param("taskId");
  const { id: userId } = c.get("user");
  const body = await c.req.json();

  const { actionType, additionalData } = body;

  if (!actionType) {
    return c.json<ErrorWrapper>(
      {
        message: "Action type is required",
        code: "MISSING_ACTION_TYPE",
      },
      400,
    );
  }

  const { result, error } = await tryCatchAsync(
    projectService.actions(actionType, taskId, userId, additionalData),
  );

  if (error) {
    return c.json<ErrorWrapper>(
      {
        message: error.message,
        code: "TASK_ACTION_ERROR",
      },
      400,
    );
  }

  return c.json<ResponseWrapper<typeof result>>({
    data: result,
  });
});

// Archive/unarchive projects in bulk
projects.post("/actions/archive-projects", async (c) => {
  const { id: userId } = c.get("user");
  const body = await c.req.json();

  const { projectIds, archive = true } = body;

  if (!projectIds || !Array.isArray(projectIds)) {
    return c.json<ErrorWrapper>(
      {
        message: "Project IDs array is required",
        code: "MISSING_PROJECT_IDS",
      },
      400,
    );
  }

  const actionType = archive ? "archive_project" : "unarchive_project";
  const results = [];
  const errors = [];

  for (const projectId of projectIds) {
    const { result, error } = await tryCatchAsync(
      projectService.actions(actionType, projectId, userId),
    );

    if (error) {
      errors.push({
        projectId,
        error: error.message,
      });
    } else {
      results.push({
        projectId,
        result,
      });
    }
  }

  return c.json<
    ResponseWrapper<{
      successful: typeof results;
      failed: typeof errors;
      summary: {
        total: number;
        successful: number;
        failed: number;
        action: string;
      };
    }>
  >({
    data: {
      successful: results,
      failed: errors,
      summary: {
        total: projectIds.length,
        successful: results.length,
        failed: errors.length,
        action: archive ? "archive" : "unarchive",
      },
    },
  });
});

// Bulk task assignments
projects.post("/actions/assign-tasks", async (c) => {
  const { id: userId } = c.get("user");
  const body = await c.req.json();

  const { taskIds, assigneeId } = body;

  if (!taskIds || !Array.isArray(taskIds) || !assigneeId) {
    return c.json<ErrorWrapper>(
      {
        message: "Task IDs array and assignee ID are required",
        code: "MISSING_REQUIRED_FIELDS",
      },
      400,
    );
  }

  const results = [];
  const errors = [];

  for (const taskId of taskIds) {
    const { result, error } = await tryCatchAsync(
      projectService.actions("assign_task", taskId, userId, { assigneeId }),
    );

    if (error) {
      errors.push({
        taskId,
        error: error.message,
      });
    } else {
      results.push({
        taskId,
        result,
      });
    }
  }

  return c.json<
    ResponseWrapper<{
      successful: typeof results;
      failed: typeof errors;
      summary: {
        total: number;
        successful: number;
        failed: number;
        assigneeId: string;
      };
    }>
  >({
    data: {
      successful: results,
      failed: errors,
      summary: {
        total: taskIds.length,
        successful: results.length,
        failed: errors.length,
        assigneeId,
      },
    },
  });
});

// Bulk task status updates
projects.post("/actions/update-task-statuses", async (c) => {
  const { id: userId } = c.get("user");
  const body = await c.req.json();

  const { taskIds, statusId } = body;

  if (!taskIds || !Array.isArray(taskIds) || !statusId) {
    return c.json<ErrorWrapper>(
      {
        message: "Task IDs array and status ID are required",
        code: "MISSING_REQUIRED_FIELDS",
      },
      400,
    );
  }

  const results = [];
  const errors = [];

  for (const taskId of taskIds) {
    const { result, error } = await tryCatchAsync(
      projectService.actions("update_task_status", taskId, userId, {
        statusId,
      }),
    );

    if (error) {
      errors.push({
        taskId,
        error: error.message,
      });
    } else {
      results.push({
        taskId,
        result,
      });
    }
  }

  return c.json<
    ResponseWrapper<{
      successful: typeof results;
      failed: typeof errors;
      summary: {
        total: number;
        successful: number;
        failed: number;
        statusId: string;
      };
    }>
  >({
    data: {
      successful: results,
      failed: errors,
      summary: {
        total: taskIds.length,
        successful: results.length,
        failed: errors.length,
        statusId,
      },
    },
  });
});

// Delete multiple tasks
projects.post("/actions/delete-tasks", async (c) => {
  const { id: userId } = c.get("user");
  const body = await c.req.json();

  const { taskIds } = body;

  if (!taskIds || !Array.isArray(taskIds)) {
    return c.json<ErrorWrapper>(
      {
        message: "Task IDs array is required",
        code: "MISSING_TASK_IDS",
      },
      400,
    );
  }

  const results = [];
  const errors = [];

  for (const taskId of taskIds) {
    const { result, error } = await tryCatchAsync(
      projectService.actions("delete_task", taskId, userId),
    );

    if (error) {
      errors.push({
        taskId,
        error: error.message,
      });
    } else {
      results.push({
        taskId,
        result,
      });
    }
  }

  return c.json<
    ResponseWrapper<{
      successful: typeof results;
      failed: typeof errors;
      summary: {
        total: number;
        successful: number;
        failed: number;
      };
    }>
  >({
    data: {
      successful: results,
      failed: errors,
      summary: {
        total: taskIds.length,
        successful: results.length,
        failed: errors.length,
      },
    },
  });
});
