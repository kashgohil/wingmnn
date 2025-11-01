import fileImage from "@assets/doodle-projects.png";
import { Wingmnn } from "@icons/wingmnn";
import { ProjectDialog } from "@projects/constants";
import { ProjectActions } from "@projects/hooks/useProjectDialogs";
import { useProjects } from "@projects/hooks/useProjects";
import {
  Button,
  Card,
  CardTitle,
  Separator,
  Typography,
} from "@wingmnn/components";
import { Link } from "@wingmnn/router";
import { isEmpty, map } from "@wingmnn/utils";
import { playClickSound } from "@wingmnn/utils/interactivity";

export function Home() {
  const {
    data: projects = [],
    isError: projectsError,
    isSuccess,
  } = useProjects();

  if (projectsError) {
    return (
      <div className="h-full flex flex-col gap-8 items-center justify-center">
        <div className="animate-pulse">
          <Wingmnn height={240} className="animate-slow-spin text-accent" />
        </div>
        <div className="flex flex-col">
          <Typography.H2 className="text-accent">
            Error loading projects.
          </Typography.H2>
          <Typography.Paragraph className="text-white-950">
            Please try again later.
          </Typography.Paragraph>
        </div>
      </div>
    );
  }

  if (!isSuccess) {
    return (
      <div className="h-full flex flex-col gap-8 items-center justify-center">
        <div className="animate-pulse">
          <Wingmnn height={240} className="animate-slow-spin text-accent" />
        </div>
        <div className="flex flex-col">
          <Typography.H2 className="text-accent">
            Loading projects...
          </Typography.H2>
          <Typography.Paragraph className="text-white-950">
            Please wait while we fetch your projects.
          </Typography.Paragraph>
        </div>
      </div>
    );
  }

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
    <div className="flex flex-col h-full">
      <div className="flex flex-col p-4 py-6">
        <Typography.H1 className="text-accent text-center mb-8 font-spicy-rice">
          Your Projects
        </Typography.H1>
        <div className="flex space-y-4">
          {map(projects!, (project) => (
            <Link
              key={project.id}
              onClick={playClickSound}
              to={`/projects/${project.id}`}
            >
              <Card
                style={{
                  backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${fileImage})`,
                }}
                className="h-40 flex items-center justify-center  w-80 bg-cover bg-center backdrop-opacity-50 overflow-hidden"
              >
                <CardTitle className="text-center flex flex-col items-center">
                  <Typography.H2 className="text-accent bg-black-200 w-fit px-4 pt-1 tracking-wide rounded-t-lg font-spicy-rice">
                    {project.name}
                  </Typography.H2>
                  <Typography.Paragraph className="bg-black-200 px-4 py-1 rounded-lg">
                    {project.description}
                  </Typography.Paragraph>
                </CardTitle>
              </Card>
            </Link>
          ))}
        </div>
      </div>
      <Separator className="mx-4 border border-accent/20" />
      <div className="flex flex-col p-4 py-6">
        <Typography.H1 className="text-accent text-center mb-8 font-spicy-rice">
          Your Projects
        </Typography.H1>
      </div>
    </div>
  );
}
