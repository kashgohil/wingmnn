import { useModuleColorStyles } from "@/lib/ModuleColorContext";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
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
	const moduleColorStyles = useModuleColorStyles();

	// Convert string value (YYYY-MM-DD) to Date object
	const selectedDate = React.useMemo(() => {
		if (!value) return undefined;
		const date = dayjs(value, "YYYY-MM-DD");
		if (!date.isValid()) return undefined;
		// Return Date object at noon to avoid timezone edge cases
		return date.hour(12).minute(0).second(0).millisecond(0).toDate();
	}, [value]);

	// Convert min/max strings to Date objects
	const minDate = React.useMemo(() => {
		if (!min) return undefined;
		const date = dayjs(min, "YYYY-MM-DD");
		if (!date.isValid()) return undefined;
		return date.startOf("day").toDate();
	}, [min]);

	const maxDate = React.useMemo(() => {
		if (!max) return undefined;
		const date = dayjs(max, "YYYY-MM-DD");
		if (!date.isValid()) return undefined;
		return date.endOf("day").toDate();
	}, [max]);

	const handleDateSelect = (date: Date | undefined) => {
		if (disabled || !date) {
			if (!date) {
				onChange?.("");
			}
			return;
		}

		// Format date as YYYY-MM-DD using dayjs
		const dateString = dayjs(date).format("YYYY-MM-DD");
		onChange?.(dateString);
		setOpen(false);
	};

	const formatDisplayValue = () => {
		if (!value) return "";
		const date = dayjs(value, "YYYY-MM-DD");
		if (!date.isValid()) return "";
		return date.format("MMM D, YYYY");
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
						"retro-border-shadow-sm",
						"focus-visible:border-primary focus-visible:retro-border-shadow focus-visible:ring-0",
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
			<PopoverContent
				className={cn(
					"w-auto p-0 rounded-none border-2 border-border bg-popover",
					"retro-border-shadow-sm shadow-[0_2px_4px_rgba(0,0,0,0.15)]",
					"animate-[none!important] [transition:none!important]",
					"opacity-100 scale-100 translate-x-0 translate-y-0",
				)}
				align="start"
				style={
					moduleColorStyles
						? ({
								// Apply module color to popover content (works even in portal)
								...moduleColorStyles,
						  } as React.CSSProperties)
						: {}
				}
			>
				<Calendar
					mode="single"
					selected={selectedDate}
					onSelect={handleDateSelect}
					disabled={(date) => {
						if (minDate && date < minDate) return true;
						if (maxDate && date > maxDate) return true;
						return false;
					}}
				/>
			</PopoverContent>
		</Popover>
	);
}
