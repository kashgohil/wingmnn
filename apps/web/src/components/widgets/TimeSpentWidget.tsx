/**
 * Time Spent Widget
 * Displays time tracking analytics (placeholder for future implementation)
 */

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Clock } from "lucide-react";

interface TimeSpentWidgetProps {
	totalHours?: number;
}

export function TimeSpentWidget({ totalHours = 0 }: TimeSpentWidgetProps) {
	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="text-sm font-medium">Time Spent</CardTitle>
				<Clock className="h-4 w-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<div className="text-2xl font-bold">{totalHours}h</div>
				<p className="text-xs text-muted-foreground">
					Total time tracked this month
				</p>
			</CardContent>
		</Card>
	);
}

