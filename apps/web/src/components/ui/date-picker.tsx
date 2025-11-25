import { useModuleColorStyles } from "@/lib/ModuleColorContext";
import { cn } from "@/lib/utils";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import * as React from "react";
import { Button } from "./button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

interface DatePickerProps {
	value?: string;
	onChange?: (date: string) => void;
	placeholder?: string;
	min?: string;
	max?: string;
	disabled?: boolean;
	className?: string;
}

const MONTHS = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
];

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// PopoverContent wrapper with module color support
function DatePickerPopoverContent({
	align = "start",
	...props
}: React.ComponentProps<typeof PopoverContent>) {
	const moduleColorStyles = useModuleColorStyles();

	return (
		<PopoverContent
			className={cn(
				"w-auto p-0 rounded-none border-2 border-border bg-popover",
				"shadow-[inset_-1px_-1px_0_rgba(0,0,0,0.1),inset_1px_1px_0_rgba(255,255,255,0.8),0_2px_4px_rgba(0,0,0,0.15)]",
				"[animation:none!important] [transition:none!important]",
				"opacity-100 scale-100 translate-x-0 translate-y-0",
			)}
			align={align}
			style={
				moduleColorStyles
					? ({
							// Apply module color to popover content (works even in portal)
							...moduleColorStyles,
							...props.style,
					  } as React.CSSProperties)
					: props.style
			}
			{...props}
		>
			{props.children}
		</PopoverContent>
	);
}

export function DatePicker({
	value,
	onChange,
	placeholder = "Select date",
	min,
	max,
	disabled,
	className,
}: DatePickerProps) {
	const [open, setOpen] = React.useState(false);
	const [currentDate, setCurrentDate] = React.useState(() => {
		if (value) {
			return new Date(value);
		}
		return new Date();
	});

	// Normalize selected date to avoid timezone issues
	const selectedDate = React.useMemo(() => {
		if (!value) return null;
		// Parse YYYY-MM-DD format and create date in local timezone
		const [year, month, day] = value.split("-").map(Number);
		if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
		// Create date at noon to match calendar day creation (month is 0-indexed)
		return new Date(year, month - 1, day, 12, 0, 0);
	}, [value]);

	// Update current date when value changes externally or when opening
	React.useEffect(() => {
		if (value) {
			const [year, month, day] = value.split("-").map(Number);
			if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
				setCurrentDate(new Date(year, month - 1, day));
			}
		}
	}, [value]);

	// When popover opens, navigate to selected date's month if available
	React.useEffect(() => {
		if (open && selectedDate) {
			setCurrentDate(
				new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1),
			);
		}
	}, [open, selectedDate]);

	const year = currentDate.getFullYear();
	const month = currentDate.getMonth();

	// Get first day of month and number of days
	const firstDayOfMonth = new Date(year, month, 1);
	const lastDayOfMonth = new Date(year, month + 1, 0);
	const daysInMonth = lastDayOfMonth.getDate();
	const startingDayOfWeek = firstDayOfMonth.getDay();

	// Generate calendar days
	const days: (Date | null)[] = [];

	// Add empty cells for days before the first day of the month
	for (let i = 0; i < startingDayOfWeek; i++) {
		days.push(null);
	}

	// Add all days of the month
	// Create dates at noon to avoid timezone edge cases
	for (let day = 1; day <= daysInMonth; day++) {
		const date = new Date(year, month, day, 12, 0, 0);
		days.push(date);
	}

	const handleDateSelect = (date: Date) => {
		if (disabled) return;

		// Check min/max constraints
		if (min) {
			const minDate = new Date(min);
			minDate.setHours(0, 0, 0, 0);
			if (date < minDate) return;
		}
		if (max) {
			const maxDate = new Date(max);
			maxDate.setHours(23, 59, 59, 999);
			if (date > maxDate) return;
		}

		// Format date as YYYY-MM-DD
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const day = String(date.getDate()).padStart(2, "0");
		const dateString = `${year}-${month}-${day}`;

		onChange?.(dateString);
		setOpen(false);
	};

	const handlePreviousMonth = () => {
		setCurrentDate(new Date(year, month - 1, 1));
	};

	const handleNextMonth = () => {
		setCurrentDate(new Date(year, month + 1, 1));
	};

	const handlePreviousYear = () => {
		setCurrentDate(new Date(year - 1, month, 1));
	};

	const handleNextYear = () => {
		setCurrentDate(new Date(year + 1, month, 1));
	};

	const isDateDisabled = (date: Date) => {
		if (min) {
			const minDate = new Date(min);
			minDate.setHours(0, 0, 0, 0);
			if (date < minDate) return true;
		}
		if (max) {
			const maxDate = new Date(max);
			maxDate.setHours(23, 59, 59, 999);
			if (date > maxDate) return true;
		}
		return false;
	};

	const isDateSelected = (date: Date) => {
		if (!value || !selectedDate) {
			return false;
		}
		// Format both dates as YYYY-MM-DD strings for comparison
		const dateStr = `${date.getFullYear()}-${String(
			date.getMonth() + 1,
		).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
		return dateStr === value;
	};

	const isToday = (date: Date) => {
		const today = new Date();
		return (
			date.getFullYear() === today.getFullYear() &&
			date.getMonth() === today.getMonth() &&
			date.getDate() === today.getDate()
		);
	};

	const formatDisplayValue = () => {
		if (!value) return "";
		const date = new Date(value);
		if (isNaN(date.getTime())) return "";
		return date.toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	return (
		<Popover
			open={open}
			onOpenChange={setOpen}
		>
			<PopoverTrigger asChild>
				<button
					type="button"
					className={cn(
						"file:text-foreground placeholder:text-muted-foreground/80 selection:bg-primary selection:text-primary-foreground dark:bg-input/30 flex h-9 w-full items-center justify-start gap-2 rounded-none border-2 border-border bg-transparent px-3 py-2 text-sm whitespace-nowrap transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50 font-medium text-foreground",
						"shadow-[inset_-1px_-1px_0_rgba(0,0,0,0.1),inset_1px_1px_0_rgba(255,255,255,0.8)]",
						"focus-visible:border-primary focus-visible:shadow-[inset_-2px_-2px_0_rgba(0,0,0,0.15),inset_2px_2px_0_rgba(255,255,255,0.9)] focus-visible:ring-0",
						!value && "text-muted-foreground",
						className,
					)}
					disabled={disabled}
				>
					<Calendar className="h-4 w-4 shrink-0" />
					<span className="flex-1 text-left">
						{formatDisplayValue() || <span>{placeholder}</span>}
					</span>
				</button>
			</PopoverTrigger>
			<DatePickerPopoverContent align="start">
				<div className="p-4 bg-background">
					{/* Header with month/year navigation */}
					<div className="flex items-center justify-between mb-4">
						<div className="flex items-center gap-2">
							<Button
								variant="ghost"
								size="icon-sm"
								onClick={handlePreviousYear}
								className="h-7 w-7"
							>
								<ChevronLeft className="h-4 w-4" />
							</Button>
							<Button
								variant="ghost"
								size="icon-sm"
								onClick={handlePreviousMonth}
								className="h-7 w-7"
							>
								<ChevronLeft className="h-3 w-3" />
							</Button>
						</div>
						<div className="text-sm font-bold uppercase tracking-wider">
							{MONTHS[month]} {year}
						</div>
						<div className="flex items-center gap-2">
							<Button
								variant="ghost"
								size="icon-sm"
								onClick={handleNextMonth}
								className="h-7 w-7"
							>
								<ChevronRight className="h-3 w-3" />
							</Button>
							<Button
								variant="ghost"
								size="icon-sm"
								onClick={handleNextYear}
								className="h-7 w-7"
							>
								<ChevronRight className="h-4 w-4" />
							</Button>
						</div>
					</div>

					{/* Weekday headers */}
					<div className="grid grid-cols-7 gap-1 mb-2">
						{WEEKDAYS.map((day) => (
							<div
								key={day}
								className="text-xs font-bold text-center text-muted-foreground uppercase tracking-wider py-1"
							>
								{day}
							</div>
						))}
					</div>

					{/* Calendar grid */}
					<div className="grid grid-cols-7 gap-1">
						{days.map((date, index) => {
							if (!date) {
								return (
									<div
										key={`empty-${index}`}
										className="h-9 w-9"
									/>
								);
							}

							const disabled = isDateDisabled(date);
							const selected = isDateSelected(date);
							const today = isToday(date);

							return (
								<Button
									key={date.toISOString()}
									variant={selected ? "default" : "ghost"}
									className={cn(
										"h-9 w-9 p-0 font-medium text-sm rounded-none",
										!selected &&
											!disabled &&
											"hover:bg-accent hover:text-accent-foreground",
										disabled && "opacity-50 cursor-not-allowed",
										today && !selected && "border-2 border-border",
									)}
									disabled={disabled}
									onClick={() => handleDateSelect(date)}
								>
									{date.getDate()}
								</Button>
							);
						})}
					</div>
				</div>
			</DatePickerPopoverContent>
		</Popover>
	);
}
