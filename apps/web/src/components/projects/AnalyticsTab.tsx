/**
 * Analytics Tab Component
 * Displays analytics widgets for tasks and subtasks
 */

import { useMyTasks } from "@/lib/hooks/use-tasks";
import { useMemo } from "react";
import { AreaChart } from "../charts/AreaChart";
import { BarChart } from "../charts/BarChart";
import { LineChart } from "../charts/LineChart";
import { PieChart } from "../charts/PieChart";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export function AnalyticsTab() {
	const { data: tasks = [], isLoading } = useMyTasks();

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

			// Check if task is completed (progress = 100 or status indicates closed)
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

	// Priority breakdown
	const priorityBreakdown = useMemo(() => {
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

	// Status distribution over time (simplified - using status IDs)
	const statusDistribution = useMemo(() => {
		const statusMap: Record<string, number> = {};
		tasks.forEach((task) => {
			statusMap[task.statusId] = (statusMap[task.statusId] || 0) + 1;
		});

		return Object.entries(statusMap).map(([statusId, count]) => ({
			status: `Status ${statusId.slice(0, 8)}`,
			count,
		}));
	}, [tasks]);

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

	if (isLoading) {
		return (
			<div className="space-y-4">
				<Card>
					<CardHeader>
						<CardTitle>Analytics</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-muted-foreground">Loading analytics...</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Task Completion Trend */}
			<Card>
				<CardHeader>
					<CardTitle>Task Completion Trend</CardTitle>
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

			{/* Priority Breakdown */}
			<Card>
				<CardHeader>
					<CardTitle>Priority Breakdown</CardTitle>
				</CardHeader>
				<CardContent className="overflow-x-auto">
					{priorityBreakdown.length > 0 ? (
						<PieChart
							data={priorityBreakdown}
							height={300}
						/>
					) : (
						<div className="text-muted-foreground text-center py-8">
							No tasks to display
						</div>
					)}
				</CardContent>
			</Card>

			{/* Status Distribution */}
			<Card>
				<CardHeader>
					<CardTitle>Status Distribution</CardTitle>
				</CardHeader>
				<CardContent className="overflow-x-auto">
					{statusDistribution.length > 0 ? (
						<BarChart
							data={statusDistribution}
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
		</div>
	);
}
