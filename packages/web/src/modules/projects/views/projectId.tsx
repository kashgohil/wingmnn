import { KanbanBoard, type KanbanColumn } from "@frameworks/kanban";
import { Wingmnn } from "@icons/wingmnn";
import { BaseRoutes } from "@navigation/routes";
import { useProject, useWorkflowStatuses } from "@projects/hooks/useProjects";
import { Button, IconButton, Tabs, Typography } from "@wingmnn/components";
import {
  ChevronLeft,
  Kanban,
  PieChart,
  Plus,
  Search,
  Settings,
  Settings2,
} from "@wingmnn/components/icons";
import { Link, usePathParams } from "@wingmnn/router";
import React from "react";

type Tab = "kanban" | "analytics";

const TABS = [
  {
    id: "kanban",
    name: "",
    description: "Kanban",
    icon: Kanban,
  },
  {
    id: "analytics",
    name: "",
    description: "Analytics",
    icon: PieChart,
  },
];

export function ProjectId() {
  const { id } = usePathParams<{ id: string }>();

  const [activeTab, setActiveTab] = React.useState<Tab>("kanban");

  const {
    result: projectResult,
    error: projectError,
    isSuccess: projectSuccess,
  } = useProject(id);

  const {
    result: workflowStatusesResult,
    error: workflowStatusesError,
    isSuccess: workflowStatusesSuccess,
  } = useWorkflowStatuses([projectResult?.workflowId as string], {
    enabled: !!projectResult?.workflowId,
  });

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

  if (!projectSuccess || !workflowStatusesSuccess) {
    return (
      <div className="h-full flex flex-col gap-8 items-center justify-center">
        <div className="animate-pulse">
          <Wingmnn height={240} className="animate-slow-spin text-accent" />
        </div>
        <div className="flex flex-col">
          <Typography.H2 className="text-accent">
            Loading project...
          </Typography.H2>
          <Typography.Paragraph className="text-white-950 text-center">
            Good things take time.
          </Typography.Paragraph>
        </div>
      </div>
    );
  }

  const project = projectResult;
  const workflowStatuses = workflowStatusesResult[project.workflowId ?? ""];

  if (!workflowStatuses) {
    return (
      <div className="h-full flex flex-col gap-8 items-center justify-center">
        <div className="animate-pulse">
          <Wingmnn height={240} className="animate-slow-spin text-accent" />
        </div>
        <div className="flex flex-col">
          <Typography.H2 className="text-accent">
            No workflow statuses found.
          </Typography.H2>
          <Typography.Paragraph className="text-white-950">
            Please contact support.
          </Typography.Paragraph>
        </div>
      </div>
    );
  }

  function actions(column: KanbanColumn) {
    return (
      <div className="flex items-center gap-1">
        <IconButton
          icon={Plus}
          className="p-1 rounded-lg"
          iconProps={{ size: 24 }}
        />
        <IconButton
          icon={Search}
          className="p-2 rounded-lg"
          iconProps={{ size: 20 }}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col gap-1 text-center p-4 pb-0 relative">
        <Link to={BaseRoutes.PROJECTS} className="absolute left-4 top-5">
          <Button
            size="sm"
            variant="secondary"
            className="flex items-center group/back p-2 rounded-lg cursor-pointer"
          >
            <ChevronLeft className="text-accent" />
            <div className="w-0 max-w-[200px] whitespace-nowrap overflow-hidden group-hover/back:w-[65px] transition-all duration-200 text-left">
              <Typography.H4 className="font-spicy-rice text-accent">
                Go Back
              </Typography.H4>
            </div>
          </Button>
        </Link>
        <Typography.H1 className="text-accent font-spicy-rice">
          {project.name}
        </Typography.H1>
        <Typography.Paragraph>{project.description}</Typography.Paragraph>
      </div>
      <div className="p-4 flex items-center justify-between">
        <IconButton
          shape="square"
          icon={Settings2}
          iconProps={{ size: 20 }}
          className="p-2 rounded-lg"
        />
        <div className="flex items-center gap-2">
          <Tabs
            tabs={TABS}
            className="p-1"
            activeTab={activeTab}
            tabClassName="text-sm rounded-sm"
            onChange={(tab: Tab) => setActiveTab(tab)}
          />
          <IconButton
            shape="square"
            icon={Settings}
            iconProps={{ size: 20 }}
            className="p-2 rounded-lg"
          />
        </div>
      </div>
      <KanbanBoard
        actions={actions}
        columns={workflowStatuses.map((status) => ({
          id: status.id,
          title: status.name,
          cards: [],
          metadata: {
            color: status.color,
            description: status.description,
          },
        }))}
      />
    </div>
  );
}
