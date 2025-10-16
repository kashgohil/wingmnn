import { zValidator } from "@hono/zod-validator";
import { projectService } from "@projects/service/projectService";
import { workflowService } from "@projects/service/workflowService";
import { AuthenticateEnv } from "@types";
import {
  NewWorkflow,
  NewWorkflowStatus,
  Workflow,
  WorkflowStatus,
} from "@wingmnn/db";
import { ErrorWrapper, ResponseWrapper } from "@wingmnn/types";
import { tryCatchAsync } from "@wingmnn/utils";
import { Hono } from "hono";
import { z } from "zod/v4";

export const workflows = new Hono<AuthenticateEnv>();

// Get workflows
workflows.get("/", async (c) => {
  const { id: userId } = c.get("user");
  const { limit = 10, offset = 0 } = c.req.query();

  const { result: workflows, error } = await tryCatchAsync(
    workflowService.getWorkflows(userId, Number(limit), Number(offset)),
  );

  if (error) {
    return c.json(
      {
        error: {
          message: error.message,
          code: "WORKFLOWS_ERROR",
        },
      },
      400,
    );
  }

  return c.json<ResponseWrapper<typeof workflows>>({ data: workflows });
});

// Create new workflow
workflows.post("/", async (c) => {
  const { id: userId } = c.get("user");
  const body = await c.req.json();

  const workflowData: Omit<NewWorkflow, "id" | "createdAt" | "updatedAt"> = {
    name: body.name,
    description: body.description,
    createdBy: userId,
    updatedBy: userId,
    deleted: false,
  };

  const { result: workflow, error } = await tryCatchAsync<Workflow>(
    workflowService.createWorkflow(workflowData),
  );

  if (error) {
    return c.json<ErrorWrapper>(
      {
        message: error.message,
        code: 400,
      },
      400,
    );
  }

  return c.json<ResponseWrapper<Workflow>>(
    {
      data: workflow,
    },
    201,
  );
});

// Get workflow by ID
workflows.get("/:workflowId", async (c) => {
  const workflowId = c.req.param("workflowId");
  const { id: userId } = c.get("user");

  const { result: workflow, error } = await tryCatchAsync<Workflow>(
    workflowService.getWorkflow(workflowId),
  );

  if (error) {
    return c.json<ErrorWrapper>(
      {
        message: error.message,
        code: 400,
      },
      400,
    );
  }

  return c.json<ResponseWrapper<Workflow>>({
    data: workflow,
  });
});

// Update workflow
workflows.put("/update/:workflowId", async (c) => {
  const workflowId = c.req.param("workflowId");
  const { id: userId } = c.get("user");
  const body = await c.req.json();

  const updateData: Partial<NewWorkflow> = {
    name: body.name,
    description: body.description,
  };

  // Remove undefined values
  Object.keys(updateData).forEach((key) => {
    if (updateData[key as keyof typeof updateData] === undefined) {
      delete updateData[key as keyof typeof updateData];
    }
  });

  const { result: workflow, error } = await tryCatchAsync<Workflow>(
    workflowService.updateWorkflow(workflowId, updateData, userId),
  );

  if (error) {
    return c.json<ErrorWrapper>(
      {
        message: error.message,
        code: 400,
      },
      400,
    );
  }

  return c.json<ResponseWrapper<Workflow>>({
    data: workflow,
  });
});

// Delete workflow
workflows.delete("/delete/:workflowId", async (c) => {
  const workflowId = c.req.param("workflowId");
  const { id: userId } = c.get("user");

  const { result, error } = await tryCatchAsync(
    workflowService.deleteWorkflow(workflowId, userId),
  );

  if (error) {
    return c.json<ErrorWrapper>(
      {
        message: error.message,
        code: 400,
      },
      400,
    );
  }

  return c.json<ResponseWrapper<typeof result>>({
    data: result,
  });
});

// Get workflow by project
workflows.get("/project/:projectId", async (c) => {
  const projectId = c.req.param("projectId");
  const { id: userId } = c.get("user");

  const { result: project, error: projectError } = await tryCatchAsync(
    projectService.get(projectId),
  );

  if (projectError) {
    return c.json<ErrorWrapper>(
      {
        message: projectError.message,
        code: 400,
      },
      400,
    );
  }

  if (!project?.workflowId) {
    return c.json<ErrorWrapper>(
      {
        message: "Project has no workflow assigned",
        code: 404,
      },
      404,
    );
  }

  const { result: workflow, error } = await tryCatchAsync<Workflow>(
    workflowService.getWorkflow(project.workflowId),
  );

  if (error) {
    return c.json<ErrorWrapper>(
      {
        message: error.message,
        code: 400,
      },
      400,
    );
  }

  return c.json<ResponseWrapper<Workflow>>({
    data: workflow,
  });
});

// Create workflow status
workflows.post("/statuses/create", async (c) => {
  const { id: userId } = c.get("user");
  const body = await c.req.json();

  const statusData: Omit<NewWorkflowStatus, "id" | "createdAt" | "updatedAt"> =
    {
      name: body.name,
      description: body.description,
      phase: body.phase,
      color: body.color || "#6b7280",
      workflowId: body.workflowId,
      createdBy: userId,
      updatedBy: userId,
      deleted: false,
    };

  const { result: status, error } = await tryCatchAsync<WorkflowStatus>(
    workflowService.createWorkflowStatus(statusData),
  );

  if (error) {
    return c.json<ErrorWrapper>(
      {
        message: error.message,
        code: 400,
      },
      400,
    );
  }

  return c.json<ResponseWrapper<WorkflowStatus>>(
    {
      data: status,
    },
    201,
  );
});

// Get workflow status by ID
workflows.get("/statuses/get/:statusId", async (c) => {
  const statusId = c.req.param("statusId");
  const { id: userId } = c.get("user");

  const { result: status, error } = await tryCatchAsync<WorkflowStatus>(
    workflowService.getWorkflowStatus(statusId),
  );

  if (error) {
    return c.json<ErrorWrapper>(
      {
        message: error.message,
        code: 400,
      },
      400,
    );
  }

  return c.json<ResponseWrapper<WorkflowStatus>>({
    data: status,
  });
});

// Update workflow status
workflows.put("/statuses/update/:statusId", async (c) => {
  const statusId = c.req.param("statusId");
  const { id: userId } = c.get("user");
  const body = await c.req.json();

  const updateData: Partial<NewWorkflowStatus> = {
    name: body.name,
    description: body.description,
    phase: body.phase,
    color: body.color,
  };

  // Remove undefined values
  Object.keys(updateData).forEach((key) => {
    if (updateData[key as keyof typeof updateData] === undefined) {
      delete updateData[key as keyof typeof updateData];
    }
  });

  const { result: status, error } = await tryCatchAsync<WorkflowStatus>(
    workflowService.updateWorkflowStatus(statusId, updateData, userId),
  );

  if (error) {
    return c.json<ErrorWrapper>(
      {
        message: error.message,
        code: 400,
      },
      400,
    );
  }

  return c.json<ResponseWrapper<WorkflowStatus>>({
    data: status,
  });
});

// Delete workflow status
workflows.delete("/statuses/delete/:statusId", async (c) => {
  const statusId = c.req.param("statusId");
  const { id: userId } = c.get("user");

  const { result, error } = await tryCatchAsync(
    workflowService.deleteWorkflowStatus(statusId, userId),
  );

  if (error) {
    return c.json<ErrorWrapper>(
      {
        message: error.message,
        code: 400,
      },
      400,
    );
  }

  return c.json<ResponseWrapper<typeof result>>({
    data: result,
  });
});

// Get statuses by workflow
workflows.get("/statuses/workflow/:workflowId", async (c) => {
  const workflowId = c.req.param("workflowId");

  const { result: statuses, error } = await tryCatchAsync<WorkflowStatus[]>(
    workflowService.getStatusesByWorkflow(workflowId),
  );

  if (error) {
    return c.json<ErrorWrapper>(
      {
        message: error.message,
        code: 400,
      },
      400,
    );
  }

  return c.json<ResponseWrapper<WorkflowStatus[]>>({
    data: statuses,
  });
});

// Get statuses by workflow
workflows.post(
  "/multiple-workflow-statuses",
  zValidator(
    "json",
    z.object({
      workflowIds: z.array(z.string()).min(1).max(100),
    }),
  ),
  async (c) => {
    const { workflowIds = [] } = c.req.valid("json");

    const results = await Promise.all(
      workflowIds.map((workflowId) =>
        tryCatchAsync<WorkflowStatus[]>(
          workflowService.getStatusesByWorkflow(workflowId),
        ),
      ),
    );

    const data = results.reduce(
      (acc, result, index) => {
        if (result.result && !result.error) {
          acc[workflowIds[index]] = result.result;
        }
        return acc;
      },
      {} as Record<string, WorkflowStatus[]>,
    );

    return c.json<ResponseWrapper<Record<string, WorkflowStatus[]>>>({
      data,
    });
  },
);
