import { Wingmnn } from "@icons/wingmnn";
import { ProjectDialog } from "@projects/constants";
import { ProjectActions, useProjects } from "@projects/logic/useProjects";
import { Button, Card, Typography } from "@wingmnn/components";
import { isEmpty, map } from "@wingmnn/utils";

export function Home() {
  const projects = useProjects("projects");

  if (isEmpty(projects)) {
    return (
      <div className="h-full flex flex-col gap-8 items-center justify-center">
        <div className="animate-pulse">
          <Wingmnn height={240} className="animate-slow-spin text-accent" />
        </div>
        <div className="flex flex-col">
          <Typography.H2 className="text-accent">
            Nothing here yet.
          </Typography.H2>
          <Typography.Paragraph className="text-white-950">
            Let's do some epic sh*t!
          </Typography.Paragraph>
        </div>
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
