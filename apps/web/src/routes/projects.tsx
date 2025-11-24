import { generateMetadata } from "@/lib/metadata";
import { getModuleBySlug } from "@/lib/modules";
import { createFileRoute } from "@tanstack/react-router";
import { Settings, Workflow } from "lucide-react";
import { lazy, Suspense, useState } from "react";
import { ProjectsList } from "../components/projects/ProjectsList";
import { SpotlightStats } from "../components/projects/SpotlightStats";
import { TasksList } from "../components/projects/TasksList";
import { WidgetSettings } from "../components/projects/WidgetSettings";
import { WorkflowManager } from "../components/projects/WorkflowManager";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "../components/ui/tabs";

// Lazy load AnalyticsTab to reduce initial bundle size
const AnalyticsTab = lazy(() =>
	import("../components/projects/AnalyticsTab").then((module) => ({
		default: module.AnalyticsTab,
	})),
);

export const Route = createFileRoute("/projects")({
	component: ProjectsModule,
	head: () =>
		generateMetadata({
			title: "Projects",
			description: "Roadmaps, tasks, and rituals tied to outcomes.",
			noindex: true,
		}),
});

function ProjectsModule() {
	const module = getModuleBySlug("projects");
	const Icon = module?.icon;
	const [activeTab, setActiveTab] = useState("overview");
	const [widgetSettingsOpen, setWidgetSettingsOpen] = useState(false);
	const [workflowManagerOpen, setWorkflowManagerOpen] = useState(false);

	return (
		<ProtectedRoute>
			<div className="min-h-screen text-foreground p-8">
				<div className="max-w-7xl mx-auto">
					<div className="space-y-8">
						{/* Header */}
						<div className="flex items-center justify-between gap-4">
							<div className="flex items-center gap-4">
								{Icon && (
									<div
										className="p-6 retro-border rounded-none"
										style={{
											backgroundColor: `var(${module?.colorVar})`,
										}}
									>
										<Icon className="h-12 w-12 text-primary-foreground" />
									</div>
								)}
								<div>
									<h1 className="text-4xl font-bold font-mono uppercase tracking-wider">
										{module?.name}
									</h1>
									<p className="text-muted-foreground mt-2">
										{module?.description}
									</p>
								</div>
							</div>
							<div className="flex items-center gap-2">
								<Button
									variant="outline"
									size="icon"
									onClick={() => setWorkflowManagerOpen(true)}
									title="Manage Workflows"
								>
									<Workflow className="h-4 w-4" />
								</Button>
								<Button
									variant="outline"
									size="icon"
									onClick={() => setWidgetSettingsOpen(true)}
									title="Widget Settings"
								>
									<Settings className="h-4 w-4" />
								</Button>
							</div>
						</div>

						{/* Tabs */}
						<Tabs
							value={activeTab}
							onValueChange={setActiveTab}
						>
							<TabsList>
								<TabsTrigger value="overview">Overview</TabsTrigger>
								<TabsTrigger value="analytics">Analytics</TabsTrigger>
							</TabsList>

							<TabsContent
								value="overview"
								className="space-y-6"
							>
								{/* Spotlight Stats */}
								<SpotlightStats />

								{/* Projects List */}
								<ProjectsList />

								{/* Tasks List */}
								<TasksList />
							</TabsContent>

							<TabsContent value="analytics">
								<Suspense
									fallback={
										<Card>
											<CardContent className="py-8">
												<div className="text-center text-muted-foreground">
													Loading analytics...
												</div>
											</CardContent>
										</Card>
									}
								>
									<AnalyticsTab />
								</Suspense>
							</TabsContent>
						</Tabs>
					</div>
				</div>

				{/* Widget Settings Dialog */}
				<WidgetSettings
					open={widgetSettingsOpen}
					onOpenChange={setWidgetSettingsOpen}
				/>

				{/* Workflow Manager Dialog */}
				<WorkflowManager
					open={workflowManagerOpen}
					onOpenChange={setWorkflowManagerOpen}
				/>
			</div>
		</ProtectedRoute>
	);
}
