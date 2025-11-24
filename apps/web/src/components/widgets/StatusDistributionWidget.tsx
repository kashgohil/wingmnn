/**
 * Status Distribution Widget
 * Displays tasks grouped by status
 */

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { BarChart3 } from "lucide-react";

interface StatusDistributionWidgetProps {
	byStatus: Record<string, number>;
}

export function StatusDistributionWidget({
	byStatus,
}: StatusDistributionWidgetProps) {
	const total = Object.values(byStatus).reduce((sum, count) => sum + count, 0);
	const entries = Object.entries(byStatus).sort((a, b) => b[1] - a[1]);

	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="text-sm font-medium">By Status</CardTitle>
				<BarChart3 className="h-4 w-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				{total === 0 ? (
					<p className="text-xs text-muted-foreground">No tasks</p>
				) : (
					<div className="space-y-2">
						{entries.slice(0, 4).map(([statusId, count]) => (
							<div key={statusId} className="flex items-center justify-between">
								<span className="text-xs text-muted-foreground truncate max-w-[120px]">
									Status {statusId.slice(0, 8)}
								</span>
								<span className="text-sm font-bold">{count}</span>
							</div>
						))}
						{entries.length > 4 && (
							<p className="text-xs text-muted-foreground mt-2">
								+{entries.length - 4} more
							</p>
						)}
					</div>
				)}
				{total > 0 && (
					<p className="text-xs text-muted-foreground mt-4">
						Total: {total} tasks
					</p>
				)}
			</CardContent>
		</Card>
	);
}

