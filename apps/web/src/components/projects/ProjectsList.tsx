/**
 * Projects List Component
 * Displays all projects the user is part of with stats
 */

import { useAuth } from "@/lib/auth/auth-context";
import { useProjects } from "@/lib/hooks/use-projects";
import { useMyTasks } from "@/lib/hooks/use-tasks";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ProjectCard } from "./ProjectCard";

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
		<Card className="px-5 pb-5">
			<CardHeader className="mb-4">
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
							<ProjectCard
								key={project.id}
								project={project}
								stats={stats}
							/>
						);
					})}
				</div>
			</CardContent>
		</Card>
	);
}
