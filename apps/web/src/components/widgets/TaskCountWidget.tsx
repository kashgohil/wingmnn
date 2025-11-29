/**
 * Task Count Widget
 * Displays total number of tasks assigned to the user
 */

import { CheckSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface TaskCountWidgetProps {
	total: number;
}

export function TaskCountWidget({ total }: TaskCountWidgetProps) {
	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 mb-4">
				<CardTitle className="font-medium">Total Tasks</CardTitle>
				<CheckSquare className="h-4 w-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<div className="text-2xl font-bold">{total}</div>
				<p className="text-xs text-muted-foreground">Assigned to you</p>
			</CardContent>
		</Card>
	);
}
