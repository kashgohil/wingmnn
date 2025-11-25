/**
 * Projects List Component
 * Displays all projects the user is part of with stats
 */

import { useAuth } from "@/lib/auth/auth-context";
import { useProjects } from "@/lib/hooks/use-projects";
import { useMyTasks } from "@/lib/hooks/use-tasks";
import { Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { Badge } from "../ui/badge";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "../ui/card";

export function ProjectsList() {
	const { data: projects = [], isLoading, error } = useProjects();
	const { data: allTasks = [] } = useMyTasks();
	const { user } = useAuth();

	// Calculate stats per project
	const projectStats = useMemo(() => {
		const stats: Record<
			string,
			{
				totalTasks: number;
				myTasks: number;
				completedTasks: number;
				completionRate: number;
			}
		> = {};

		projects.forEach((project) => {
			const projectTasks = allTasks.filter(
				(task) => task.projectId === project.id,
			);
			const myProjectTasks = projectTasks.filter(
				(task) => task.assignedTo === user?.id,
			);
			const completed = projectTasks.filter(
				(task) => task.progress === 100,
			).length;

			stats[project.id] = {
				totalTasks: projectTasks.length,
				myTasks: myProjectTasks.length,
				completedTasks: completed,
				completionRate:
					projectTasks.length > 0
						? Math.round((completed / projectTasks.length) * 100)
						: 0,
			};
		});

		return stats;
	}, [projects, allTasks, user?.id]);

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>My Projects</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-muted-foreground">Loading projects...</div>
				</CardContent>
			</Card>
		);
	}

	if (error) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>My Projects</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-destructive">
						Error loading projects:{" "}
						{error instanceof Error ? error.message : "Unknown error"}
					</div>
				</CardContent>
			</Card>
		);
	}

	if (projects.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>My Projects</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-muted-foreground">No projects found.</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader className="mb-4 p-0">
				<CardTitle>My Projects</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{projects.map((project) => {
						const stats = projectStats[project.id] || {
							totalTasks: 0,
							myTasks: 0,
							completedTasks: 0,
							completionRate: 0,
						};

						return (
							<Link
								key={project.id}
								to="/projects/$projectId"
								params={{ projectId: project.id }}
								className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary rounded-none"
							>
								<Card
									variant="outlined"
									padding="md"
									className="cursor-pointer hover:shadow-md transition-shadow h-full flex flex-col"
								>
									<CardHeader>
										<div className="flex items-start justify-between">
											<CardTitle className="text-lg">{project.name}</CardTitle>
											<Badge
												variant={
													project.status === "active" ? "default" : "secondary"
												}
											>
												{project.status}
											</Badge>
										</div>
									</CardHeader>
									<CardContent className="flex-1">
										{project.description && (
											<p className="text-sm text-muted-foreground line-clamp-2">
												{project.description}
											</p>
										)}
										<div className="mt-4 space-y-2">
											<div className="flex items-center justify-between text-xs">
												<span className="text-muted-foreground">
													Total Tasks:
												</span>
												<span className="font-medium">{stats.totalTasks}</span>
											</div>
											<div className="flex items-center justify-between text-xs">
												<span className="text-muted-foreground">
													Assigned to Me:
												</span>
												<span className="font-medium">{stats.myTasks}</span>
											</div>
											<div className="flex items-center justify-between text-xs">
												<span className="text-muted-foreground">
													Completion:
												</span>
												<span className="font-medium">
													{stats.completionRate}%
												</span>
											</div>
											<div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
												<div
													className="h-full bg-primary transition-all progress-bar-fill"
													style={{ width: `${stats.completionRate}%` }}
												/>
											</div>
										</div>
									</CardContent>
									<CardFooter>
										<div className="mt-4 text-xs text-muted-foreground">
											Created:{" "}
											{new Date(project.createdAt).toLocaleDateString()}
										</div>
									</CardFooter>
								</Card>
							</Link>
						);
					})}
				</div>
			</CardContent>
		</Card>
	);
}
