/**
 * Project Analytics Component
 * Displays analytics for a specific project's tasks
 */

import { PriorityLabel } from "@/components/projects/PriorityLabel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Task } from "@/lib/api/tasks.api";
import { type PriorityValue } from "@/lib/priority";
import { useMemo } from "react";

interface ProjectAnalyticsProps {
	tasks: Task[];
	loading: boolean;
	statusMap: Map<string, { name: string; colorCode: string }>;
}

export function ProjectAnalytics({
	tasks,
	loading,
	statusMap,
}: ProjectAnalyticsProps) {
	const taskStats = useMemo(() => {
		const stats = {
			total: tasks.length,
			completed: 0,
			inProgress: 0,
			overdue: 0,
			upcoming: 0,
		};

		if (!tasks.length) {
			return stats;
		}

		const now = Date.now();

		tasks.forEach((task) => {
			if (task.progress === 100) {
				stats.completed += 1;
				return;
			}
			stats.inProgress += 1;
			if (task.dueDate) {
				const due = new Date(task.dueDate).getTime();
				if (due < now) {
					stats.overdue += 1;
				} else {
					stats.upcoming += 1;
				}
			}
		});

		return stats;
	}, [tasks]);

	if (loading) {
		return <LoadingState label="Loading analytics..." />;
	}

	return (
		<div className="space-y-6">
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<SummaryStat
					label="Total tasks"
					value={taskStats.total}
				/>
				<SummaryStat
					label="Completed"
					value={taskStats.completed}
					trend="positive"
				/>
				<SummaryStat
					label="In progress"
					value={taskStats.inProgress}
				/>
				<SummaryStat
					label="Overdue"
					value={taskStats.overdue}
					trend={taskStats.overdue ? "negative" : undefined}
				/>
			</div>

			<ProjectAnalyticsPanel
				tasks={tasks}
				loading={false}
				statusMap={statusMap}
			/>
		</div>
	);
}

function SummaryStat({
	label,
	value,
	trend,
}: {
	label: string;
	value: number;
	trend?: "positive" | "negative";
}) {
	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="font-bold">{label}</CardTitle>
				{trend === "positive" && (
					<span className="text-[11px] font-semibold text-emerald-500">
						On track
					</span>
				)}
				{trend === "negative" && (
					<span className="text-[11px] font-semibold text-destructive">
						Needs attention
					</span>
				)}
			</CardHeader>
			<CardContent>
				<p className="text-3xl font-bold">{value}</p>
				<p className="text-xs text-muted-foreground mt-1">
					vs. previous period
				</p>
			</CardContent>
		</Card>
	);
}

function LoadingState({ label }: { label: string }) {
	return (
		<div className="rounded-none border border-dashed border-border/70 bg-muted/20 p-6 text-center text-sm text-muted-foreground">
			{label}
		</div>
	);
}

function ProjectAnalyticsPanel({
	tasks,
	loading,
	statusMap,
}: {
	tasks: Task[];
	loading: boolean;
	statusMap: Map<string, { name: string; colorCode: string }>;
}) {
	if (loading) {
		return <LoadingState label="Loading analytics..." />;
	}

	if (!tasks.length) {
		return <EmptyState message="Add tasks to unlock analytics." />;
	}

	const priorityBreakdown = tasks.reduce<Record<string, number>>(
		(acc, task) => {
			acc[task.priority] = (acc[task.priority] || 0) + 1;
			return acc;
		},
		{},
	);

	const statusBreakdown = tasks.reduce<Record<string, number>>((acc, task) => {
		const key = task.statusId ?? "unassigned";
		acc[key] = (acc[key] || 0) + 1;
		return acc;
	}, {});

	return (
		<div className="grid gap-4 lg:grid-cols-2">
			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">Priority</CardTitle>
					<span className="text-xs text-muted-foreground">Breakdown</span>
				</CardHeader>
				<CardContent className="space-y-2">
					{Object.entries(priorityBreakdown).map(([priority, count]) => {
						const typedPriority = priority as PriorityValue;
						return (
							<div
								key={priority}
								className="flex items-center justify-between text-sm"
							>
								<PriorityLabel
									priority={typedPriority}
									className="text-sm text-muted-foreground"
									iconClassName="size-3.5"
								/>
								<span className="font-semibold">{count}</span>
							</div>
						);
					})}
				</CardContent>
			</Card>
			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">Status</CardTitle>
					<span className="text-xs text-muted-foreground">Snapshot</span>
				</CardHeader>
				<CardContent className="space-y-2">
					{Object.entries(statusBreakdown).map(([statusId, count]) => {
						const statusInfo = statusMap.get(statusId);
						return (
							<div
								key={statusId}
								className="flex items-center justify-between text-sm"
							>
								<span className="inline-flex items-center gap-1.5 text-muted-foreground">
									{statusId === "unassigned" ? (
										"Unassigned"
									) : (
										<>
											<div
												className="w-2 h-2 rounded-full"
												style={{
													backgroundColor: statusInfo?.colorCode ?? "#808080",
												}}
											/>
											{statusInfo?.name ?? `Status ${statusId.slice(0, 6)}`}
										</>
									)}
								</span>
								<span className="font-semibold">{count}</span>
							</div>
						);
					})}
				</CardContent>
			</Card>
		</div>
	);
}

function EmptyState({ message }: { message: string }) {
	return (
		<div className="rounded-none border border-dashed border-border/70 bg-muted/20 p-8 text-center text-muted-foreground">
			{message}
		</div>
	);
}

