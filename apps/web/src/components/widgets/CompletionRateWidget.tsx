/**
 * Completion Rate Widget
 * Displays percentage of completed tasks
 */

import { CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface CompletionRateWidgetProps {
	completed: number;
	total: number;
}

export function CompletionRateWidget({
	completed,
	total,
}: CompletionRateWidgetProps) {
	const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="text-sm font-medium">Completion</CardTitle>
				<CheckCircle2 className="h-4 w-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<div className="text-2xl font-bold">{percentage}%</div>
				<p className="text-xs text-muted-foreground">
					{completed} of {total} tasks completed
				</p>
				<div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
					<div
						className="h-full bg-primary transition-all progress-bar-fill"
						style={{ width: `${percentage}%` }}
					/>
				</div>
			</CardContent>
		</Card>
	);
}
