/**
 * Project Analytics Component
 * Displays analytics for a specific project's tasks
 */

import { AreaChart } from "@/components/charts/AreaChart";
import { BarChart } from "@/components/charts/BarChart";
import { LineChart } from "@/components/charts/LineChart";
import { PieChart } from "@/components/charts/PieChart";
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
			averageProgress: 0,
			completionRate: 0,
		};

		if (!tasks.length) {
			return stats;
		}

		const now = Date.now();
		let totalProgress = 0;

		tasks.forEach((task) => {
			const progress = task.progress ?? 0;
			totalProgress += progress;

			if (progress === 100) {
				stats.completed += 1;
			} else {
				stats.inProgress += 1;
			}

			if (task.dueDate) {
				const due = new Date(task.dueDate).getTime();
				if (due < now) {
					stats.overdue += 1;
				} else {
					stats.upcoming += 1;
				}
			}
		});

		stats.averageProgress = Math.round(totalProgress / tasks.length);
		stats.completionRate = Math.round((stats.completed / tasks.length) * 100);

		return stats;
	}, [tasks]);

	// Calculate task completion trends over time
	const completionTrend = useMemo(() => {
		const now = new Date();
		const last30Days = Array.from({ length: 30 }, (_, i) => {
			const date = new Date(now);
			date.setDate(date.getDate() - (29 - i));
			return {
				date: date.toLocaleDateString("en-US", {
					month: "short",
					day: "numeric",
				}),
				completed: 0,
				created: 0,
			};
		});

		tasks.forEach((task) => {
			const createdDate = new Date(task.createdAt);
			const daysAgo = Math.floor(
				(now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24),
			);

			if (daysAgo >= 0 && daysAgo < 30) {
				last30Days[29 - daysAgo].created++;
			}

			if (task.progress === 100) {
				const updatedDate = new Date(task.updatedAt);
				const completedDaysAgo = Math.floor(
					(now.getTime() - updatedDate.getTime()) / (1000 * 60 * 60 * 24),
				);
				if (completedDaysAgo >= 0 && completedDaysAgo < 30) {
					last30Days[29 - completedDaysAgo].completed++;
				}
			}
		});

		return last30Days;
	}, [tasks]);

	// Priority breakdown for pie chart
	const priorityBreakdownChart = useMemo(() => {
		const breakdown = {
			critical: 0,
			high: 0,
			medium: 0,
			low: 0,
		};

		tasks.forEach((task) => {
			breakdown[task.priority]++;
		});

		return [
			{ name: "Critical", value: breakdown.critical, color: "#ef4444" },
			{ name: "High", value: breakdown.high, color: "#f97316" },
			{ name: "Medium", value: breakdown.medium, color: "#eab308" },
			{ name: "Low", value: breakdown.low, color: "#3b82f6" },
		].filter((item) => item.value > 0);
	}, [tasks]);

	// Status distribution for bar chart
	const statusDistributionChart = useMemo(() => {
		const distribution: Array<{ status: string; count: number }> = [];
		const statusCounts = new Map<string, number>();

		tasks.forEach((task) => {
			const key = task.statusId ?? "unassigned";
			statusCounts.set(key, (statusCounts.get(key) || 0) + 1);
		});

		statusCounts.forEach((count, statusId) => {
			const statusInfo = statusMap.get(statusId);
			const statusName =
				statusId === "unassigned"
					? "Unassigned"
					: statusInfo?.name ?? `Status ${statusId.slice(0, 8)}`;
			distribution.push({ status: statusName, count });
		});

		return distribution;
	}, [tasks, statusMap]);

	// Task velocity (completed per week)
	const taskVelocity = useMemo(() => {
		const now = new Date();
		const last4Weeks: Array<{ week: string; completed: number }> = Array.from(
			{ length: 4 },
			(_, i) => {
				const weekStart = new Date(now);
				weekStart.setDate(
					weekStart.getDate() - (7 * (3 - i) + weekStart.getDay()),
				);
				weekStart.setHours(0, 0, 0, 0);
				return {
					week: `Week ${4 - i}`,
					completed: 0,
				};
			},
		);

		tasks.forEach((task) => {
			if (task.progress === 100) {
				const updatedDate = new Date(task.updatedAt);
				const weeksAgo = Math.floor(
					(now.getTime() - updatedDate.getTime()) / (1000 * 60 * 60 * 24 * 7),
				);
				if (weeksAgo >= 0 && weeksAgo < 4) {
					last4Weeks[3 - weeksAgo].completed++;
				}
			}
		});

		return last4Weeks;
	}, [tasks]);

	// Progress distribution
	const progressDistribution = useMemo(() => {
		const ranges = [
			{ range: "0-25%", min: 0, max: 25, count: 0 },
			{ range: "26-50%", min: 26, max: 50, count: 0 },
			{ range: "51-75%", min: 51, max: 75, count: 0 },
			{ range: "76-99%", min: 76, max: 99, count: 0 },
			{ range: "100%", min: 100, max: 100, count: 0 },
		];

		tasks.forEach((task) => {
			const progress = task.progress ?? 0;
			for (const range of ranges) {
				if (progress >= range.min && progress <= range.max) {
					range.count++;
					break;
				}
			}
		});

		return ranges.filter((r) => r.count > 0);
	}, [tasks]);

	if (loading) {
		return <LoadingState label="Loading analytics..." />;
	}

	if (!tasks.length) {
		return <EmptyState message="Add tasks to unlock analytics." />;
	}

	return (
		<div className="space-y-6">
			{/* Summary Stats */}
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

			{/* Additional Metrics */}
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<MetricCard
					label="Completion Rate"
					value={`${taskStats.completionRate}%`}
					description={`${taskStats.completed} of ${taskStats.total} tasks`}
				/>
				<MetricCard
					label="Average Progress"
					value={`${taskStats.averageProgress}%`}
					description="Across all tasks"
				/>
				<MetricCard
					label="Upcoming"
					value={taskStats.upcoming}
					description="Tasks with future due dates"
				/>
				<MetricCard
					label="Tasks with Due Dates"
					value={tasks.filter((t) => t.dueDate).length}
					description="Tasks scheduled"
				/>
			</div>

			{/* Task Completion Trend */}
			<Card>
				<CardHeader>
					<CardTitle>Task Completion Trend (Last 30 Days)</CardTitle>
				</CardHeader>
				<CardContent className="overflow-x-auto">
					<LineChart
						data={completionTrend}
						dataKey="date"
						lines={[
							{ key: "created", name: "Created", color: "#3b82f6" },
							{ key: "completed", name: "Completed", color: "#10b981" },
						]}
						height={300}
					/>
				</CardContent>
			</Card>

			{/* Charts Grid */}
			<div className="grid gap-4 lg:grid-cols-2">
				{/* Priority Breakdown Chart */}
				<Card>
					<CardHeader>
						<CardTitle>Priority Breakdown</CardTitle>
					</CardHeader>
					<CardContent className="overflow-x-auto">
						{priorityBreakdownChart.length > 0 ? (
							<PieChart
								data={priorityBreakdownChart}
								height={300}
							/>
						) : (
							<div className="text-muted-foreground text-center py-8">
								No tasks to display
							</div>
						)}
					</CardContent>
				</Card>

				{/* Status Distribution Chart */}
				<Card>
					<CardHeader>
						<CardTitle>Status Distribution</CardTitle>
					</CardHeader>
					<CardContent className="overflow-x-auto">
						{statusDistributionChart.length > 0 ? (
							<BarChart
								data={statusDistributionChart}
								dataKey="status"
								bars={[{ key: "count", name: "Tasks", color: "#3b82f6" }]}
								height={300}
							/>
						) : (
							<div className="text-muted-foreground text-center py-8">
								No tasks to display
							</div>
						)}
					</CardContent>
				</Card>
			</div>

			{/* Task Velocity */}
			<Card>
				<CardHeader>
					<CardTitle>Task Velocity (Last 4 Weeks)</CardTitle>
				</CardHeader>
				<CardContent className="overflow-x-auto">
					<AreaChart
						data={taskVelocity}
						dataKey="week"
						areas={[
							{ key: "completed", name: "Completed Tasks", color: "#10b981" },
						]}
						height={300}
					/>
				</CardContent>
			</Card>

			{/* Progress Distribution */}
			<Card>
				<CardHeader>
					<CardTitle>Progress Distribution</CardTitle>
				</CardHeader>
				<CardContent className="overflow-x-auto">
					{progressDistribution.length > 0 ? (
						<BarChart
							data={progressDistribution}
							dataKey="range"
							bars={[{ key: "count", name: "Tasks", color: "#8b5cf6" }]}
							height={300}
						/>
					) : (
						<div className="text-muted-foreground text-center py-8">
							No tasks to display
						</div>
					)}
				</CardContent>
			</Card>

			{/* Detailed Breakdowns */}
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

function MetricCard({
	label,
	value,
	description,
}: {
	label: string;
	value: string | number;
	description?: string;
}) {
	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="font-bold">{label}</CardTitle>
			</CardHeader>
			<CardContent>
				<p className="text-2xl font-bold">{value}</p>
				{description && (
					<p className="text-xs text-muted-foreground mt-1">{description}</p>
				)}
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
