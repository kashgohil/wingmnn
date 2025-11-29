/**
 * Overdue Tasks Widget
 * Displays count of tasks past their due date
 */

import { AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface OverdueTasksWidgetProps {
	count: number;
}

export function OverdueTasksWidget({ count }: OverdueTasksWidgetProps) {
	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 mb-4">
				<CardTitle className="font-medium">Overdue</CardTitle>
				<AlertCircle className="h-4 w-4 text-destructive" />
			</CardHeader>
			<CardContent>
				<div className="text-2xl font-bold text-destructive">{count}</div>
				<p className="text-xs text-muted-foreground">Tasks past due date</p>
			</CardContent>
		</Card>
	);
}
