/**
 * Spotlight Stats Component
 * Displays key metrics widgets for tasks assigned to the user
 */

import { useTaskStats } from "@/lib/hooks/use-tasks";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { TaskCountWidget } from "../widgets/TaskCountWidget";
import { PriorityDistributionWidget } from "../widgets/PriorityDistributionWidget";
import { StatusDistributionWidget } from "../widgets/StatusDistributionWidget";
import { CompletionRateWidget } from "../widgets/CompletionRateWidget";
import { OverdueTasksWidget } from "../widgets/OverdueTasksWidget";
import { UpcomingDeadlinesWidget } from "../widgets/UpcomingDeadlinesWidget";
import { TimeSpentWidget } from "../widgets/TimeSpentWidget";
import { TaskTrendWidget } from "../widgets/TaskTrendWidget";
import { useWidgetVisibility } from "@/lib/widgets/widget-registry";

export function SpotlightStats() {
	const { data: stats, isLoading } = useTaskStats();
	const { isWidgetVisible } = useWidgetVisibility();

	if (isLoading) {
		return (
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				{Array.from({ length: 4 }).map((_, i) => (
					<Card key={i}>
						<CardHeader>
							<CardTitle className="text-sm">Loading...</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="h-20" />
						</CardContent>
					</Card>
				))}
			</div>
		);
	}

	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
			{isWidgetVisible("task-count") && (
				<TaskCountWidget total={stats?.total || 0} />
			)}
			{isWidgetVisible("priority-distribution") && (
				<PriorityDistributionWidget
					byPriority={stats?.byPriority || {
						critical: 0,
						high: 0,
						medium: 0,
						low: 0,
					}}
				/>
			)}
			{isWidgetVisible("status-distribution") && (
				<StatusDistributionWidget
					byStatus={stats?.byStatus || {}}
				/>
			)}
			{isWidgetVisible("completion-rate") && (
				<CompletionRateWidget
					completed={stats?.completed || 0}
					total={stats?.total || 0}
				/>
			)}
			{isWidgetVisible("overdue-tasks") && (
				<OverdueTasksWidget count={stats?.overdue || 0} />
			)}
			{isWidgetVisible("upcoming-deadlines") && (
				<UpcomingDeadlinesWidget count={stats?.upcoming || 0} />
			)}
			{isWidgetVisible("time-spent") && (
				<TimeSpentWidget totalHours={0} />
			)}
			{isWidgetVisible("task-trend") && (
				<TaskTrendWidget trend="stable" percentage={0} />
			)}
		</div>
	);
}

