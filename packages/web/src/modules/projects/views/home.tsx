import { ProjectDialog } from "@projects/constants";
import { ProjectActions, useProjects } from "@projects/logic/useProjects";
import { Button, Card, Typography } from "@wingmnn/components";
import { isEmpty, map } from "@wingmnn/utils";

export function Home() {
  const projects = useProjects("projects");

  if (isEmpty(projects)) {
    return (
      <div className="h-full flex flex-col gap-4 items-center justify-center">
        <Typography.H2 className="font-semibold text-accent">
          You don't have any projects yet.
        </Typography.H2>
        <Button
          size="sm"
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
