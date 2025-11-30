import { CalendarItem } from "./CalendarItem";
import type { CalendarItem as CalendarItemType } from "@/lib/hooks/use-calendar-items";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import { useMemo } from "react";
import { useDroppable } from "@dnd-kit/core";

interface WeekViewProps {
	items: CalendarItemType[];
	currentDate: Date;
	onItemClick?: (item: CalendarItemType) => void;
	onDateClick?: (date: Date) => void;
	statusMap?: Map<string, { name: string; colorCode: string }>;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);

interface WeekDayColumnProps {
	date: Date;
	dateItems: CalendarItemType[];
	onItemClick?: (item: CalendarItemType) => void;
	onDateClick?: (date: Date) => void;
	statusMap?: Map<string, { name: string; colorCode: string }>;
}

function WeekDayColumn({
	date,
	dateItems,
	onItemClick,
	onDateClick,
	statusMap,
}: WeekDayColumnProps) {
	const dateKey = dayjs(date).format("YYYY-MM-DD");
	const isToday = dayjs(date).isSame(dayjs(), "day");
	const { setNodeRef, isOver } = useDroppable({
		id: `week-date-${dateKey}`,
		data: { date },
	});

	return (
		<div
			ref={setNodeRef}
			className={cn(
				"border-r-2 border-border last:border-r-0 transition-colors",
				isToday && "bg-primary/5",
				isOver && "bg-primary/10",
			)}
			onClick={() => onDateClick?.(date)}
		>
			{HOURS.map((hour) => {
				// Filter items for this hour (simplified - just show all items in the day)
				const hourItems = dateItems.filter((item) => {
					const itemHour = dayjs(item.date).hour();
					return itemHour === hour || (hour === 0 && itemHour < 1);
				});

				return (
					<div
						key={hour}
						className="border-b border-border/50 p-1"
						style={{ height: "60px", minHeight: "60px" }}
					>
						{hourItems.map((item) => {
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
					</div>
				);
			})}
		</div>
	);
}

export function WeekView({
	items,
	currentDate,
	onItemClick,
	onDateClick,
	statusMap,
}: WeekViewProps) {
	// Get week dates
	const weekDates = useMemo(() => {
		const start = dayjs(currentDate).startOf("week");
		return Array.from({ length: 7 }, (_, i) => start.add(i, "day").toDate());
	}, [currentDate]);

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

	return (
		<div className="flex h-full flex-col overflow-hidden">
			{/* Header with day names */}
			<div className="grid grid-cols-8 border-b-2 border-border">
				<div className="border-r-2 border-border p-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
					Time
				</div>
				{weekDates.map((date) => {
					const isToday = dayjs(date).isSame(dayjs(), "day");
					return (
						<div
							key={date.toISOString()}
							className={cn(
								"border-r-2 border-border p-2 text-center last:border-r-0",
								isToday && "bg-primary/10",
							)}
						>
							<div
								className={cn(
									"text-xs font-bold uppercase tracking-wider",
									isToday && "text-primary",
								)}
							>
								{dayjs(date).format("ddd")}
							</div>
							<div
								className={cn(
									"text-lg font-bold font-mono",
									isToday && "text-primary",
								)}
							>
								{dayjs(date).format("D")}
							</div>
						</div>
					);
				})}
			</div>

			{/* Scrollable content */}
			<div className="flex-1 overflow-y-auto">
				<div className="grid grid-cols-8">
					{/* Time column */}
					<div className="border-r-2 border-border">
						{HOURS.map((hour) => (
							<div
								key={hour}
								className="border-b border-border/50 p-1 text-xs text-muted-foreground"
								style={{ height: "60px" }}
							>
								{hour.toString().padStart(2, "0")}:00
							</div>
						))}
					</div>

					{/* Day columns */}
					{weekDates.map((date) => {
						const dateKey = dayjs(date).format("YYYY-MM-DD");
						const dateItems = itemsByDate.get(dateKey) || [];
						return (
							<WeekDayColumn
								key={date.toISOString()}
								date={date}
								dateItems={dateItems}
								onItemClick={onItemClick}
								onDateClick={onDateClick}
								statusMap={statusMap}
							/>
						);
					})}
				</div>
			</div>
		</div>
	);
}

