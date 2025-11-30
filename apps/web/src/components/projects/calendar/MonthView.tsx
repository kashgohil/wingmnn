import type { CalendarItem as CalendarItemType } from "@/lib/hooks/use-calendar-items";
import { cn } from "@/lib/utils";
import { useDroppable } from "@dnd-kit/core";
import dayjs from "dayjs";
import { useMemo } from "react";
import { CalendarItem } from "./CalendarItem";

interface MonthViewProps {
	items: CalendarItemType[];
	currentDate: Date;
	onItemClick?: (item: CalendarItemType) => void;
	onDateClick?: (date: Date) => void;
	statusMap?: Map<string, { name: string; colorCode: string }>;
}

interface DateCellProps {
	date: Date;
	dateItems: CalendarItemType[];
	currentDate: Date;
	onItemClick?: (item: CalendarItemType) => void;
	onDateClick?: (date: Date) => void;
	statusMap?: Map<string, { name: string; colorCode: string }>;
}

function DateCell({
	date,
	dateItems,
	currentDate,
	onItemClick,
	onDateClick,
	statusMap,
}: DateCellProps) {
	const dateKey = dayjs(date).format("YYYY-MM-DD");
	const isToday = dayjs(date).isSame(dayjs(), "day");
	const isCurrentMonth = dayjs(date).isSame(currentDate, "month");
	const { setNodeRef, isOver } = useDroppable({
		id: `date-${dateKey}`,
		data: {
			date,
		},
	});

	return (
		<div
			ref={setNodeRef}
			className={cn(
				"rounded-none border-2 border-border bg-card/50 p-3 backdrop-blur-sm min-h-[120px] transition-colors",
				isToday && "border-primary",
				!isCurrentMonth && "opacity-50",
				isOver && "bg-primary/10 border-primary",
			)}
			onClick={() => onDateClick?.(date)}
		>
			<div className="mb-2 flex items-center justify-between">
				<span
					className={cn(
						"text-sm font-bold font-mono",
						isToday && "text-primary",
					)}
				>
					{dayjs(date).format("D")}
				</span>
				<span className="text-sm text-muted-foreground">
					{dayjs(date).format("ddd")}
				</span>
			</div>
			<div className="space-y-1.5">
				{dateItems.slice(0, 3).map((item) => {
					const statusColor = statusMap?.get(item.statusId || "")?.colorCode;
					return (
						<CalendarItem
							key={item.id}
							item={item}
							onClick={onItemClick}
							statusColor={statusColor}
							compact
						/>
					);
				})}
				{dateItems.length > 3 && (
					<div className="text-xs text-muted-foreground">
						+{dateItems.length - 3} more
					</div>
				)}
			</div>
		</div>
	);
}

export function MonthView({
	items,
	currentDate,
	onItemClick,
	onDateClick,
	statusMap,
}: MonthViewProps) {
	// Group items by date
	const itemsByDate = useMemo(() => {
		const grouped = new Map<string, CalendarItemType[]>();
		items.forEach((item) => {
			const dateKey = dayjs(item.date).format("YYYY-MM-DD");
			if (!grouped.has(dateKey)) {
				grouped.set(dateKey, []);
			}
			grouped.get(dateKey)!.push(item);
		});
		return grouped;
	}, [items]);

	// Get all dates in the current month view
	const monthDates = useMemo(() => {
		const start = dayjs(currentDate).startOf("month").startOf("week");
		const end = dayjs(currentDate).endOf("month").endOf("week");
		const dates: Date[] = [];
		let current = start;
		while (current.isBefore(end) || current.isSame(end, "day")) {
			dates.push(current.toDate());
			current = current.add(1, "day");
		}
		return dates;
	}, [currentDate]);

	return (
		<div className="grid gap-4 md:grid-cols-7 p-4">
			{monthDates.map((date) => {
				const dateKey = dayjs(date).format("YYYY-MM-DD");
				const dateItems = itemsByDate.get(dateKey) || [];
				return (
					<DateCell
						key={dateKey}
						date={date}
						dateItems={dateItems}
						currentDate={currentDate}
						onItemClick={onItemClick}
						onDateClick={onDateClick}
						statusMap={statusMap}
					/>
				);
			})}
		</div>
	);
}
