import { Modules } from "@navigation/constants";
import type { RouteConfig } from "@wingmnn/router";
import { Notes } from "./notes";
import { Editor } from "./views/editor";
import { Home } from "./views/home";

export const NotesRoute: RouteConfig = {
  id: Modules.NOTES,
  path: "/notes",
  Component: Notes,
  childRoutes: [
    {
      id: "NOTES_HOME",
      path: "/",
      Component: Home,
    },
    {
      id: "NOTES_CREATE",
      path: "/new-note",
      Component: Editor,
    },
    {
      id: "NOTES_EDIT",
      path: "/:id",
      Component: Editor,
    },
  ],
};
