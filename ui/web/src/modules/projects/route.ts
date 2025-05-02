import { Modules } from "@navigation/constants";
import { Projects } from "./projects";
import { Home } from "./views/home";
import { ProjectId } from "./views/projectId";

export const ProjectsRoute = {
  id: Modules.PROJECTS,
  path: "/projects",
  Component: Projects,
  childRoutes: [
    {
      id: "PROJECTS_HOME",
      path: "/",
      Component: Home,
    },
    {
      id: "PROJECT_ID",
      path: "/:id",
      Component: ProjectId,
    },
  ],
};
