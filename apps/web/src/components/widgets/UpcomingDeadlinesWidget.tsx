/**
 * Upcoming Deadlines Widget
 * Displays count of tasks due in the next 7 days
 */

import { Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface UpcomingDeadlinesWidgetProps {
	count: number;
}

export function UpcomingDeadlinesWidget({
	count,
}: UpcomingDeadlinesWidgetProps) {
	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 mb-4">
				<CardTitle className="font-medium">Upcoming</CardTitle>
				<Calendar className="h-4 w-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<div className="text-2xl font-bold">{count}</div>
				<p className="text-xs text-muted-foreground">Due in next 7 days</p>
			</CardContent>
		</Card>
	);
}
