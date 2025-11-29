import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import type { Project } from "@/lib/api/projects.api";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import * as _ from "lodash-es";

interface ProjectStats {
	totalTasks: number;
	myTasks: number;
	completedTasks: number;
	completionRate: number;
}

interface ProjectCardProps {
	project: Project;
	stats: ProjectStats;
}

export function ProjectCard({ project, stats }: ProjectCardProps) {
	return (
		<Link
			to="/projects/$projectId"
			params={{ projectId: project.id }}
			className="block relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary rounded-none"
		>
			<Card
				variant="contained"
				padding="md"
				className="cursor-pointer border-2 border-border h-full flex flex-col"
			>
				<CardHeader>
					<CardTitle>{project.name}</CardTitle>
					{project.description && (
						<CardDescription>{project.description}</CardDescription>
					)}

					<div
						className={cn(
							"absolute top-0 right-0 px-2 text-center min-w-20 py-1 tracking-wider whitespace-nowrap",
							project.status === "active" ? "bg-primary" : "bg-secondary",
						)}
					>
						{_.capitalize(project.status)}
					</div>
				</CardHeader>
				<CardContent className="flex-1">
					<div className="mt-4 space-y-2">
						<div className="flex items-center justify-between text-xs">
							<span className="text-muted-foreground">Total Tasks:</span>
							<span className="font-medium">{stats.totalTasks}</span>
						</div>
						<div className="flex items-center justify-between text-xs">
							<span className="text-muted-foreground">Assigned to Me:</span>
							<span className="font-medium">{stats.myTasks}</span>
						</div>
						<div className="flex items-center justify-between text-xs">
							<span className="text-muted-foreground">Completion:</span>
							<span className="font-medium">{stats.completionRate}%</span>
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
						Created: {new Date(project.createdAt).toLocaleDateString()}
					</div>
				</CardFooter>
			</Card>
		</Link>
	);
}
