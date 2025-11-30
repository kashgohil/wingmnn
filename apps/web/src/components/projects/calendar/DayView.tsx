import type { CalendarItem as CalendarItemType } from "@/lib/hooks/use-calendar-items";
import { cn } from "@/lib/utils";
import { useDroppable } from "@dnd-kit/core";
import dayjs from "dayjs";
import { useMemo } from "react";
import { CalendarItem } from "./CalendarItem";

interface DayViewProps {
	items: CalendarItemType[];
	currentDate: Date;
	onItemClick?: (item: CalendarItemType) => void;
	onTimeSlotClick?: (date: Date, hour: number) => void;
	statusMap?: Map<string, { name: string; colorCode: string }>;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);

interface HourSlotProps {
	hour: number;
	currentDate: Date;
	hourItems: CalendarItemType[];
	onItemClick?: (item: CalendarItemType) => void;
	onTimeSlotClick?: (date: Date, hour: number) => void;
	statusMap?: Map<string, { name: string; colorCode: string }>;
}

function HourSlot({
	hour,
	currentDate,
	hourItems,
	onItemClick,
	onTimeSlotClick,
	statusMap,
}: HourSlotProps) {
	const hourDate = dayjs(currentDate).hour(hour).toDate();
	const { setNodeRef, isOver } = useDroppable({
		id: `day-hour-${dayjs(currentDate).format("YYYY-MM-DD")}-${hour}`,
		data: { date: hourDate },
	});

	return (
		<div
			ref={setNodeRef}
			className={cn(
				"border-b border-border/50 p-2 transition-colors",
				isOver && "bg-primary/10",
			)}
			style={{ height: "80px", minHeight: "80px" }}
			onClick={() => onTimeSlotClick?.(hourDate, hour)}
		>
			<div className="space-y-1">
				{hourItems.map((item) => {
					const statusColor = statusMap?.get(item.statusId || "")?.colorCode;
					return (
						<CalendarItem
							key={item.id}
							item={item}
							onClick={onItemClick}
							statusColor={statusColor}
						/>
					);
				})}
			</div>
		</div>
	);
}

export function DayView({
	items,
	currentDate,
	onItemClick,
	onTimeSlotClick,
	statusMap,
}: DayViewProps) {
	// Filter items for the current date
	const dayItems = useMemo(() => {
		const dateKey = dayjs(currentDate).format("YYYY-MM-DD");
		return items.filter(
			(item) => dayjs(item.date).format("YYYY-MM-DD") === dateKey,
		);
	}, [items, currentDate]);

	// Group items by hour
	const itemsByHour = useMemo(() => {
		const grouped = new Map<number, CalendarItemType[]>();
		dayItems.forEach((item) => {
			const hour = dayjs(item.date).hour();
			if (!grouped.has(hour)) {
				grouped.set(hour, []);
			}
			grouped.get(hour)!.push(item);
		});
		return grouped;
	}, [dayItems]);

	const isToday = dayjs(currentDate).isSame(dayjs(), "day");

	return (
		<div className="flex h-full flex-col overflow-hidden">
			{/* Header */}
			<div
				className={cn(
					"border-b-2 border-border p-4 text-center",
					isToday && "bg-primary/10",
				)}
			>
				<div
					className={cn(
						"text-xs font-bold uppercase tracking-wider text-muted-foreground",
						isToday && "text-primary",
					)}
				>
					{dayjs(currentDate).format("dddd")}
				</div>
				<div
					className={cn(
						"text-2xl font-bold font-mono",
						isToday && "text-primary",
					)}
				>
					{dayjs(currentDate).format("MMMM D, YYYY")}
				</div>
			</div>

			{/* Scrollable content */}
			<div className="flex-1 overflow-y-auto">
				<div className="grid grid-cols-12 gap-2 p-4">
					{/* Time column */}
					<div className="col-span-1">
						{HOURS.map((hour) => (
							<div
								key={hour}
								className="border-b border-border/50 p-2 text-xs text-muted-foreground"
								style={{ height: "80px" }}
							>
								{hour.toString().padStart(2, "0")}:00
							</div>
						))}
					</div>

					{/* Items column */}
					<div className="col-span-11">
						{HOURS.map((hour) => {
							const hourItems = itemsByHour.get(hour) || [];
							return (
								<HourSlot
									key={hour}
									hour={hour}
									currentDate={currentDate}
									hourItems={hourItems}
									onItemClick={onItemClick}
									onTimeSlotClick={onTimeSlotClick}
									statusMap={statusMap}
								/>
							);
						})}
					</div>
				</div>
			</div>
		</div>
	);
}
