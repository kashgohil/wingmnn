import { RouterConfig } from "@frameworks/router/type";
import { Modules } from "@navigation/constants";
import { Mails } from "src/modules/mails/mails";
import { Projects } from "src/modules/projects/projects";

export const ROUTES_CONFIG: RouterConfig = [
  {
    id: Modules.MAILS,
    name: 'Mails',
    description: 'Manage your emails',
    path: '/mails',
    Component: Mails,
    childRoutes: [
      {
        id: Modules.MAILS,
        path: '/:id',
        Component: Mails,
      },
    ],
  },
  {
    id: Modules.PROJECTS,
    name: 'Projects',
    description: 'Manage your projects',
    path: '/projects',
    Component: Projects,
    childRoutes: [
      {
        id: Modules.PROJECTS,
        path: '/:id',
        Component: Projects,
      },
    ],
  },

]
