import { projects } from "@projects/router";
import { ProjectService } from "@projects/service/projectService";
import { ErrorWrapper, ResponseWrapper } from "@types";
import { Workflow, NewWorkflow, WorkflowStatus, NewWorkflowStatus } from "@wingmnn/db";
import { tryCatchAsync } from "@wingmnn/utils";

const projectService = new ProjectService();

// Create new workflow
projects.post("/workflows/create", async (c) => {
  const { id: userId } = c.get("user");
  const body = await c.req.json();

  const workflowData: Omit<NewWorkflow, "id" | "createdAt" | "updatedAt"> = {
    name: body.name,
    description: body.description,
    projectId: body.projectId,
    isDefault: body.isDefault || false,
    createdBy: userId,
    updatedBy: userId,
    deleted: false,
  };

  const { result: workflow, error } = await tryCatchAsync<Workflow>(
    projectService.createWorkflow(workflowData)
  );

  if (error) {
    return c.json<ErrorWrapper>({
      error: {
        message: error.message,
        code: "WORKFLOW_CREATE_ERROR",
      },
    }, 400);
  }

  return c.json<ResponseWrapper<Workflow>>({
    data: workflow,
  }, 201);
});

// Get workflow by ID
projects.get("/workflows/get/:workflowId", async (c) => {
  const workflowId = c.req.param("workflowId");
  const { id: userId } = c.get("user");

  const { result: workflow, error } = await tryCatchAsync<Workflow>(
    projectService.getWorkflow(workflowId)
  );

  if (error) {
    return c.json<ErrorWrapper>({
      error: {
        message: error.message,
        code: "WORKFLOW_GET_ERROR",
      },
    }, 400);
  }

  return c.json<ResponseWrapper<Workflow>>({
    data: workflow,
  });
});

// Update workflow
projects.put("/workflows/update/:workflowId", async (c) => {
  const workflowId = c.req.param("workflowId");
  const { id: userId } = c.get("user");
  const body = await c.req.json();

  const updateData: Partial<NewWorkflow> = {
    name: body.name,
    description: body.description,
    isDefault: body.isDefault,
  };

  // Remove undefined values
  Object.keys(updateData).forEach(key => {
    if (updateData[key as keyof typeof updateData] === undefined) {
      delete updateData[key as keyof typeof updateData];
    }
  });

  const { result: workflow, error } = await tryCatchAsync<Workflow>(
    projectService.updateWorkflow(workflowId, updateData, userId)
  );

  if (error) {
    return c.json<ErrorWrapper>({
      error: {
        message: error.message,
        code: "WORKFLOW_UPDATE_ERROR",
      },
    }, 400);
  }

  return c.json<ResponseWrapper<Workflow>>({
    data: workflow,
  });
});

// Delete workflow
projects.delete("/workflows/delete/:workflowId", async (c) => {
  const workflowId = c.req.param("workflowId");
  const { id: userId } = c.get("user");

  const { result, error } = await tryCatchAsync(
    projectService.deleteWorkflow(workflowId, userId)
  );

  if (error) {
    return c.json<ErrorWrapper>({
      error: {
        message: error.message,
        code: "WORKFLOW_DELETE_ERROR",
      },
    }, 400);
  }

  return c.json<ResponseWrapper<typeof result>>({
    data: result,
  });
});

// Get workflows by project
projects.get("/workflows/project/:projectId", async (c) => {
  const projectId = c.req.param("projectId");
  const { id: userId } = c.get("user");

  const { result: workflows, error } = await tryCatchAsync<Workflow[]>(
    projectService.getWorkflowsByProject(projectId)
  );

  if (error) {
    return c.json<ErrorWrapper>({
      error: {
        message: error.message,
        code: "WORKFLOWS_GET_BY_PROJECT_ERROR",
      },
    }, 400);
  }

  return c.json<ResponseWrapper<Workflow[]>>({
    data: workflows,
  });
});

// Create workflow status
projects.post("/workflows/statuses/create", async (c) => {
  const { id: userId } = c.get("user");
  const body = await c.req.json();

  const statusData: Omit<NewWorkflowStatus, "id" | "createdAt" | "updatedAt"> = {
    name: body.name,
    description: body.description,
    type: body.type,
    color: body.color || "#6b7280",
    order: body.order,
    workflowId: body.workflowId,
    isInitial: body.isInitial || false,
    isFinal: body.isFinal || false,
    createdBy: userId,
    updatedBy: userId,
    deleted: false,
  };

  const { result: status, error } = await tryCatchAsync<WorkflowStatus>(
    projectService.createWorkflowStatus(statusData)
  );

  if (error) {
    return c.json<ErrorWrapper>({
      error: {
        message: error.message,
        code: "WORKFLOW_STATUS_CREATE_ERROR",
      },
    }, 400);
  }

  return c.json<ResponseWrapper<WorkflowStatus>>({
    data: status,
  }, 201);
});

// Get workflow status by ID
projects.get("/workflows/statuses/get/:statusId", async (c) => {
  const statusId = c.req.param("statusId");
  const { id: userId } = c.get("user");

  const { result: status, error } = await tryCatchAsync<WorkflowStatus>(
    projectService.getWorkflowStatus(statusId)
  );

  if (error) {
    return c.json<ErrorWrapper>({
      error: {
        message: error.message,
        code: "WORKFLOW_STATUS_GET_ERROR",
      },
    }, 400);
  }

  return c.json<ResponseWrapper<WorkflowStatus>>({
    data: status,
  });
});

// Update workflow status
projects.put("/workflows/statuses/update/:statusId", async (c) => {
  const statusId = c.req.param("statusId");
  const { id: userId } = c.get("user");
  const body = await c.req.json();

  const updateData: Partial<NewWorkflowStatus> = {
    name: body.name,
    description: body.description,
    type: body.type,
    color: body.color,
    order: body.order,
    isInitial: body.isInitial,
    isFinal: body.isFinal,
  };

  // Remove undefined values
  Object.keys(updateData).forEach(key => {
    if (updateData[key as keyof typeof updateData] === undefined) {
      delete updateData[key as keyof typeof updateData];
    }
  });

  const { result: status, error } = await tryCatchAsync<WorkflowStatus>(
    projectService.updateWorkflowStatus(statusId, updateData, userId)
  );

  if (error) {
    return c.json<ErrorWrapper>({
      error: {
        message: error.message,
        code: "WORKFLOW_STATUS_UPDATE_ERROR",
      },
    }, 400);
  }

  return c.json<ResponseWrapper<WorkflowStatus>>({
    data: status,
  });
});

// Delete workflow status
projects.delete("/workflows/statuses/delete/:statusId", async (c) => {
  const statusId = c.req.param("statusId");
  const { id: userId } = c.get("user");

  const { result, error } = await tryCatchAsync(
    projectService.deleteWorkflowStatus(statusId, userId)
  );

  if (error) {
    return c.json<ErrorWrapper>({
      error: {
        message: error.message,
        code: "WORKFLOW_STATUS_DELETE_ERROR",
      },
    }, 400);
  }

  return c.json<ResponseWrapper<typeof result>>({
    data: result,
  });
});

// Get statuses by workflow
projects.get("/workflows/statuses/workflow/:workflowId", async (c) => {
  const workflowId = c.req.param("workflowId");
  const { id: userId } = c.get("user");

  const { result: statuses, error } = await tryCatchAsync<WorkflowStatus[]>(
    projectService.getStatusesByWorkflow(workflowId)
  );

  if (error) {
    return c.json<ErrorWrapper>({
      error: {
        message: error.message,
        code: "WORKFLOW_STATUSES_GET_BY_WORKFLOW_ERROR",
      },
    }, 400);
  }

  return c.json<ResponseWrapper<WorkflowStatus[]>>({
    data: statuses,
  });
});