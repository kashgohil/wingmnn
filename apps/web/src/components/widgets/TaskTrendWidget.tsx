/**
 * Task Trend Widget
 * Displays task completion trends (placeholder for future implementation)
 */

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { TrendingUp } from "lucide-react";

interface TaskTrendWidgetProps {
	trend?: "up" | "down" | "stable";
	percentage?: number;
}

export function TaskTrendWidget({
	trend = "stable",
	percentage = 0,
}: TaskTrendWidgetProps) {
	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="text-sm font-medium">Trend</CardTitle>
				<TrendingUp className="h-4 w-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<div className="text-2xl font-bold">
					{trend === "up" ? "+" : trend === "down" ? "-" : ""}
					{percentage}%
				</div>
				<p className="text-xs text-muted-foreground">
					Completion rate change
				</p>
			</CardContent>
		</Card>
	);
}

