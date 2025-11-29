/**
 * Status Distribution Widget
 * Displays tasks grouped by status
 */

import { useTaskStatusMap } from "@/lib/hooks/use-workflows";
import { BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface StatusDistributionWidgetProps {
	byStatus: Record<string, number>;
}

export function StatusDistributionWidget({
	byStatus,
}: StatusDistributionWidgetProps) {
	const { data: statusMap } = useTaskStatusMap();

	const total = Object.values(byStatus).reduce((sum, count) => sum + count, 0);
	const entries = Object.entries(byStatus).sort((a, b) => b[1] - a[1]);

	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 mb-4">
				<CardTitle className="font-medium">By Status</CardTitle>
				<BarChart3 className="h-4 w-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				{total === 0 ? (
					<p className="text-xs text-muted-foreground">No tasks</p>
				) : (
					<div className="space-y-2">
						{entries.slice(0, 4).map(([statusId, count]) => {
							const statusInfo = statusMap?.get(statusId);
							const statusName =
								statusInfo?.name ?? `Status ${statusId.slice(0, 6)}`;

							return (
								<div
									key={statusId}
									className="flex items-center justify-between gap-3"
								>
									<div className="flex items-center gap-2 min-w-0">
										{statusInfo && (
											<span
												className="inline-block h-2 w-2 rounded-full shrink-0"
												style={{ backgroundColor: statusInfo.colorCode }}
											/>
										)}
										<span className="text-xs text-muted-foreground truncate max-w-[160px]">
											{statusName}
										</span>
									</div>
									<span className="text-sm font-bold">{count}</span>
								</div>
							);
						})}
						{entries.length > 4 && (
							<p className="text-xs text-muted-foreground mt-2">
								+{entries.length - 4} more
							</p>
						)}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
