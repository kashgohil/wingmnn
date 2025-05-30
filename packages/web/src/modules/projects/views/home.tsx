import { Button } from "@components/button/button";
import { Card } from "@components/card/card";
import { ProjectDialog } from "@projects/constants";
import { ProjectActions, useProjects } from "@projects/logic/useProjects";
import { isEmpty, map } from "utils";

export function Home() {
  const projects = useProjects("projects");

  if (isEmpty(projects)) {
    return (
      <div className="h-full flex flex-col space-y-4 items-center justify-center">
        <div className="text-center text-white-850 text-xl">
          You don't have any projects yet.
        </div>
        <Button
          size="sm"
          variant="secondary"
          onClick={() =>
            ProjectActions.openDialog(ProjectDialog.CREATE_PROJECT)
          }
        >
          Let's create one
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex flex-col p-2">
        <div className="text-white-850 text-xl mb-8">All Projects</div>
        <div className="flex space-y-4">
          {map(projects, (project) => (
            <Card
              key={project.id}
              className="flex flex-col py-4 px-6 border border-gray-400 rounded-lg"
            >
              <div className="text-white-850 text-xl">{project.name}</div>
              <div className="text-white-600 text-sm">
                {project.description}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
