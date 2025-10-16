import { projects } from "@projects/router";
import { projectService } from "@projects/service/projectService";
import { ErrorWrapper, ResponseWrapper } from "@wingmnn/types";
import { tryCatchAsync } from "@wingmnn/utils";
import { workflows } from "./workflows";

projects.route("/workflows", workflows);

// Get all projects
projects.get("/", async (c) => {
  const { id: userId } = c.get("user");

  const { result: projects, error } = await tryCatchAsync(
    projectService.getAll(userId),
  );

  if (error) {
    return c.json(
      {
        error: {
          message: error.message,
          code: "GET_PROJECTS_ERROR",
        },
      },
      400,
    );
  }

  return c.json<ResponseWrapper<typeof projects>>({ data: projects });
});

// Create project
projects.put("/", async (c) => {
  const { id: userId } = c.get("user");
  const body = await c.req.json();

  const { result: project, error } = await tryCatchAsync(
    projectService.create({
      ...body,
      createdBy: userId,
    }),
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

  return c.json<ResponseWrapper<typeof project>>({ data: project });
});

// Get project by ID
projects.get("/:projectId", async (c) => {
  const projectId = c.req.param("projectId");

  const { result: project, error } = await tryCatchAsync(
    projectService.get(projectId),
  );

  if (error) {
    return c.json(
      {
        error: {
          message: error.message,
          code: "GET_PROJECT_ERROR",
        },
      },
      400,
    );
  }

  return c.json<ResponseWrapper<typeof project>>({ data: project });
});

// Update project
projects.put("/:projectId", async (c) => {
  const projectId = c.req.param("projectId");
  const { id: userId } = c.get("user");
  const body = await c.req.json();

  const { result: project, error } = await tryCatchAsync(
    projectService.update(projectId, body, userId),
  );

  if (error) {
    return c.json(
      {
        error: {
          message: error.message,
          code: "UPDATE_PROJECT_ERROR",
        },
      },
      400,
    );
  }

  return c.json<ResponseWrapper<typeof project>>({ data: project });
});

// Delete project
projects.delete("/:projectId", async (c) => {
  const projectId = c.req.param("projectId");
  const { id: userId } = c.get("user");

  const { result: project, error } = await tryCatchAsync(
    projectService.delete(projectId, userId),
  );

  if (error) {
    return c.json(
      {
        error: {
          message: error.message,
          code: "DELETE_PROJECT_ERROR",
        },
      },
      400,
    );
  }

  return c.json<ResponseWrapper<typeof project>>({ data: project });
});
