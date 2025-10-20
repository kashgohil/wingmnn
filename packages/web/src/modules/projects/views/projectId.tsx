import { Wingmnn } from "@icons/wingmnn";
import { useProject, useWorkflowStatuses } from "@projects/hooks/useProjects";
import { Typography } from "@wingmnn/components";
import { usePathParams } from "@wingmnn/router";

export function ProjectId() {
  const { id } = usePathParams<{ id: string }>();

  const {
    result: projectResult,
    isLoading: projectLoading,
    error: projectError,
  } = useProject(id);

  const {
    result: workflowStatusesResult,
    error: workflowStatusesError,
    isLoading: workflowStatusesLoading,
  } = useWorkflowStatuses([projectResult?.workflowId as string], {
    enabled: !!projectResult?.workflowId,
  });

  if (projectLoading || workflowStatusesLoading) {
    return (
      <div className="h-full flex flex-col gap-8 items-center justify-center">
        <div className="animate-pulse">
          <Wingmnn height={240} className="animate-slow-spin text-accent" />
        </div>
        <div className="flex flex-col">
          <Typography.H2 className="text-accent">
            Loading project...
          </Typography.H2>
          <Typography.Paragraph className="text-white-950">
            Good things take time.
          </Typography.Paragraph>
        </div>
      </div>
    );
  }

  if (projectError || workflowStatusesError) {
    return (
      <div className="h-full flex flex-col gap-8 items-center justify-center">
        <div className="animate-pulse">
          <Wingmnn height={240} className="animate-slow-spin text-accent" />
        </div>
        <div className="flex flex-col">
          <Typography.H2 className="text-accent">
            Error loading your project.
          </Typography.H2>
          <Typography.Paragraph className="text-white-950">
            This is weird! Please try again later.
          </Typography.Paragraph>
        </div>
      </div>
    );
  }

  const project = projectResult!;
  const workflowStatus = workflowStatusesResult![project.workflowId!];

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col gap-1 mx-auto text-center p-4">
        <Typography.H1 className="text-accent font-spicy-rice">
          {project.name}
        </Typography.H1>
        <Typography.Paragraph>{project.description}</Typography.Paragraph>
      </div>
      <div className="p-4"></div>
      <div className="p-4 flex-1 overflow-hidden flex flex-col items-center justify-center"></div>
    </div>
  );
}
