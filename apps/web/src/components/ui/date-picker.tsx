import { useModuleColorStyles } from "@/lib/ModuleColorContext";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon } from "lucide-react";
import * as React from "react";
import { Calendar } from "./calendar";
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
				"animate-[none!important] [transition:none!important]",
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

	// Convert string value (YYYY-MM-DD) to Date object
	const selectedDate = React.useMemo(() => {
		if (!value) return undefined;
		// Parse YYYY-MM-DD format and create date in local timezone
		const [year, month, day] = value.split("-").map(Number);
		if (isNaN(year) || isNaN(month) || isNaN(day)) return undefined;
		// Create date at noon to avoid timezone edge cases
		return new Date(year, month - 1, day, 12, 0, 0);
	}, [value]);

	// Convert min/max strings to Date objects
	const minDate = React.useMemo(() => {
		if (!min) return undefined;
		const [year, month, day] = min.split("-").map(Number);
		if (isNaN(year) || isNaN(month) || isNaN(day)) return undefined;
		return new Date(year, month - 1, day, 0, 0, 0);
	}, [min]);

	const maxDate = React.useMemo(() => {
		if (!max) return undefined;
		const [year, month, day] = max.split("-").map(Number);
		if (isNaN(year) || isNaN(month) || isNaN(day)) return undefined;
		return new Date(year, month - 1, day, 23, 59, 59);
	}, [max]);

	const handleDateSelect = (date: Date | undefined) => {
		if (disabled || !date) {
			if (!date) {
				onChange?.("");
			}
			return;
		}

		// Format date as YYYY-MM-DD
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const day = String(date.getDate()).padStart(2, "0");
		const dateString = `${year}-${month}-${day}`;

		onChange?.(dateString);
		setOpen(false);
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
					<CalendarIcon className="h-4 w-4 shrink-0" />
					<span className="flex-1 text-left">
						{formatDisplayValue() || <span>{placeholder}</span>}
					</span>
				</button>
			</PopoverTrigger>
			<DatePickerPopoverContent align="start">
				<Calendar
					mode="single"
					selected={selectedDate}
					onSelect={handleDateSelect}
					disabled={(date) => {
						if (minDate && date < minDate) return true;
						if (maxDate && date > maxDate) return true;
						return false;
					}}
					initialFocus
				/>
			</DatePickerPopoverContent>
		</Popover>
	);
}
