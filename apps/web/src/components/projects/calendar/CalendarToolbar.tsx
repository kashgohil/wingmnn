import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { CalendarItemType } from "@/lib/hooks/use-calendar-items";
import dayjs from "dayjs";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type CalendarView = "month" | "week" | "day";

interface CalendarToolbarProps {
	view: CalendarView;
	onViewChange: (view: CalendarView) => void;
	currentDate: Date;
	onDateChange: (date: Date) => void;
	onToday: () => void;
	onCreateItem?: (date?: Date) => void;
	filters?: {
		assignee?: string;
		priority?: "low" | "medium" | "high" | "critical";
		statusId?: string;
		itemTypes?: CalendarItemType[];
	};
	onFilterChange?: (filters: CalendarToolbarProps["filters"]) => void;
	assignees?: Array<{ id: string; name: string }>;
	statuses?: Array<{ id: string; name: string }>;
}

export function CalendarToolbar({
	view,
	onViewChange,
	currentDate,
	onDateChange,
	onToday,
	filters,
	onFilterChange,
	assignees = [],
}: CalendarToolbarProps) {
	const handlePrev = () => {
		const newDate = dayjs(currentDate);
		if (view === "month") {
			onDateChange(newDate.subtract(1, "month").toDate());
		} else if (view === "week") {
			onDateChange(newDate.subtract(1, "week").toDate());
		} else {
			onDateChange(newDate.subtract(1, "day").toDate());
		}
	};

	const handleNext = () => {
		const newDate = dayjs(currentDate);
		if (view === "month") {
			onDateChange(newDate.add(1, "month").toDate());
		} else if (view === "week") {
			onDateChange(newDate.add(1, "week").toDate());
		} else {
			onDateChange(newDate.add(1, "day").toDate());
		}
	};

	const formatDateRange = () => {
		if (view === "month") {
			return dayjs(currentDate).format("MMMM YYYY");
		} else if (view === "week") {
			const start = dayjs(currentDate).startOf("week");
			const end = dayjs(currentDate).endOf("week");
			return `${start.format("MMM D")} - ${end.format("MMM D, YYYY")}`;
		} else {
			return dayjs(currentDate).format("MMMM D, YYYY");
		}
	};

	return (
		<div className="flex flex-wrap items-center justify-between gap-4 rounded-none border-b-2 border-border bg-card/70 p-4">
			<div className="flex items-center gap-2">
				<Button
					variant="outline"
					size="icon"
					onClick={handlePrev}
					className="h-9 w-9"
				>
					<ChevronLeft className="h-4 w-4" />
				</Button>
				<Button
					variant="outline"
					size="icon"
					onClick={handleNext}
					className="h-9 w-9"
				>
					<ChevronRight className="h-4 w-4" />
				</Button>
				<Button
					variant="outline"
					onClick={onToday}
					className="h-9"
				>
					Today
				</Button>
				<h2 className="ml-2 text-lg font-bold font-mono uppercase tracking-wider">
					{formatDateRange()}
				</h2>
			</div>

			<div className="flex items-center gap-2">
				<div className="flex items-center gap-2">
					<Select
						value={view}
						onValueChange={onViewChange}
					>
						<SelectTrigger className="w-32 h-9">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="month">Month</SelectItem>
							<SelectItem value="week">Week</SelectItem>
							<SelectItem value="day">Day</SelectItem>
						</SelectContent>
					</Select>

					{onFilterChange && (
						<>
							<Select
								value={filters?.assignee || "all"}
								onValueChange={(value) =>
									onFilterChange({
										...filters,
										assignee: value === "all" ? undefined : value,
									})
								}
							>
								<SelectTrigger className="w-40 h-9">
									<SelectValue placeholder="Assignee" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Assignees</SelectItem>
									{assignees.map((assignee) => (
										<SelectItem
											key={assignee.id}
											value={assignee.id}
										>
											{assignee.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>

							<Select
								value={filters?.priority || "all"}
								onValueChange={(value) =>
									onFilterChange({
										...filters,
										priority:
											value === "all"
												? undefined
												: (value as "low" | "medium" | "high" | "critical"),
									})
								}
							>
								<SelectTrigger className="w-40 h-9">
									<SelectValue placeholder="Priority" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Priorities</SelectItem>
									<SelectItem value="critical">Critical</SelectItem>
									<SelectItem value="high">High</SelectItem>
									<SelectItem value="medium">Medium</SelectItem>
									<SelectItem value="low">Low</SelectItem>
								</SelectContent>
							</Select>
						</>
					)}
				</div>
			</div>
		</div>
	);
}
