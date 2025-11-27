import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker, type DayPickerProps } from "react-day-picker";

import { cn } from "@/lib/utils";

export type CalendarProps = DayPickerProps;

function Calendar({
	className,
	classNames,
	showOutsideDays = true,
	...props
}: CalendarProps) {
	return (
		<DayPicker
			showOutsideDays={showOutsideDays}
			className={cn("p-3", className)}
			classNames={{
				...classNames,
				months: "flex flex-col space-y-2",
				month: "space-y-2 -mt-9.5",
				caption: "flex justify-center pt-1 relative items-center mb-4",
				caption_label: "text-sm font-bold uppercase tracking-wider font-mono",
				nav: "space-x-1 flex items-center justify-between",
				nav_button: cn(
					"h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
					"retro-button retro-button-ghost",
				),
				nav_button_previous: "absolute left-1",
				nav_button_next: "absolute right-1",
				month_caption: "text-center",
				table: "w-full border-collapse space-y-1",
				head_row: "flex",
				head_cell:
					"text-muted-foreground rounded-none w-9 font-bold text-xs uppercase tracking-wider font-mono",
				row: "flex w-full mt-2",
				cell: "h-9 w-9 text-center text-sm p-0 relative rounded-none focus-within:relative focus-within:z-20",
				day: cn(
					"h-9 w-9 p-0 font-medium text-sm rounded-none font-mono",
					"retro-button retro-button-ghost",
					"relative active:top-[2px] active:left-[2px]",
				),
				day_range_end: "day-range-end",
				day_selected: "calendar-day-selected",
				day_disabled: "text-muted-foreground opacity-50 cursor-not-allowed",
				day_range_middle:
					"aria-selected:bg-accent aria-selected:text-accent-foreground",
				day_hidden: "invisible",
				day_outside: "text-muted-foreground opacity-10",
				day_today: "calendar-day-today",
			}}
			components={{
				PreviousMonthButton: ({ ...props }) => (
					<button
						type="button"
						{...props}
					>
						<ChevronLeft className="h-4 w-4" />
					</button>
				),
				NextMonthButton: ({ ...props }) => (
					<button
						type="button"
						{...props}
					>
						<ChevronRight className="h-4 w-4" />
					</button>
				),
			}}
			{...props}
		/>
	);
}
Calendar.displayName = "Calendar";

export { Calendar };
