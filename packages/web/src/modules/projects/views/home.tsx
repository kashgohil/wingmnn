import fileImage from "@assets/doodle-projects.png";
import { useQuery } from "@frameworks/query/hook";
import { Wingmnn } from "@icons/wingmnn";
import { ProjectDialog } from "@projects/constants";
import { ProjectActions } from "@projects/hooks/useProjectDialogs";
import { ProjectsService } from "@projects/services/projectsService";
import { PROJECTS_KEY } from "@queryKeys";
import {
  Button,
  Card,
  CardTitle,
  Separator,
  Typography,
} from "@wingmnn/components";
import { Link } from "@wingmnn/router";
import { isEmpty, map } from "@wingmnn/utils";

export function Home() {
  const {
    result: projects = [],
    isLoading: projectsLoading,
    isError: projectsError,
  } = useQuery({
    key: PROJECTS_KEY,
    queryFn: ProjectsService.getProjects,
    selector: (res) => res.data,
  });

  if (projectsLoading) {
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
            <Link to={`/projects/${project.id}`}>
              <Card
                key={project.id}
                style={{ backgroundImage: `url(${fileImage})` }}
                className="h-40 flex items-center justify-center border border-accent/50 w-80 bg-cover bg-center backdrop-opacity-50 overflow-hidden"
              >
                <CardTitle className="text-center flex flex-col items-center">
                  <Typography.H2 className="text-accent bg-black-200 w-fit px-4 py-1 rounded-t-lg">
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
