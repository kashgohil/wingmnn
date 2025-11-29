/**
 * Priority Distribution Widget
 * Displays tasks grouped by priority
 */

import { AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface PriorityDistributionWidgetProps {
	byPriority: {
		critical: number;
		high: number;
		medium: number;
		low: number;
	};
}

export function PriorityDistributionWidget({
	byPriority,
}: PriorityDistributionWidgetProps) {
	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 mb-4">
				<CardTitle className="font-medium">Priority</CardTitle>
				<AlertTriangle className="h-4 w-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-2 gap-x-4 gap-y-4">
					<div className="flex items-center justify-between">
						<span className="text-xs text-muted-foreground">Critical</span>
						<span className="text-sm font-bold text-red-500">
							{byPriority.critical}
						</span>
					</div>
					<div className="flex items-center justify-between">
						<span className="text-xs text-muted-foreground">High</span>
						<span className="text-sm font-bold text-orange-500">
							{byPriority.high}
						</span>
					</div>
					<div className="flex items-center justify-between">
						<span className="text-xs text-muted-foreground">Medium</span>
						<span className="text-sm font-bold text-yellow-500">
							{byPriority.medium}
						</span>
					</div>
					<div className="flex items-center justify-between">
						<span className="text-xs text-muted-foreground">Low</span>
						<span className="text-sm font-bold text-blue-500">
							{byPriority.low}
						</span>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
