import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import * as React from "react";

import { useModuleColorStyles } from "@/lib/ModuleColorContext";
import { cn } from "@/lib/utils";

const DropdownMenu = DropdownMenuPrimitive.Root;

const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

const DropdownMenuGroup = DropdownMenuPrimitive.Group;

const DropdownMenuPortal = DropdownMenuPrimitive.Portal;

const DropdownMenuSub = DropdownMenuPrimitive.Sub;

const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

const DropdownMenuSubTrigger = React.forwardRef<
	React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
	React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> & {
		inset?: boolean;
	}
>(({ className, inset, ...props }, ref) => (
	<DropdownMenuPrimitive.SubTrigger
		ref={ref}
		className={cn(
			"data-[state=open]:bg-accent/20 data-[state=open]:text-foreground flex cursor-default select-none items-center gap-2 rounded-none px-3 py-2 text-sm font-mono text-foreground/90 outline-none transition-[color,background-color] focus-visible:bg-accent/20 focus-visible:text-foreground",
			inset && "pl-8",
			className,
		)}
		{...props}
	/>
));
DropdownMenuSubTrigger.displayName =
	DropdownMenuPrimitive.SubTrigger.displayName;

const DropdownMenuSubContent = React.forwardRef<
	React.ElementRef<typeof DropdownMenuPrimitive.SubContent>,
	React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(({ className, style, ...props }, ref) => {
	const moduleColorStyles = useModuleColorStyles();

	return (
		<DropdownMenuPrimitive.SubContent
			ref={ref}
			className={cn(
				"z-50 min-w-40 rounded-none retro-border bg-popover/95 p-2 text-popover-foreground shadow-[inset_-1px_-1px_0_rgba(0,0,0,0.08),inset_1px_1px_0_rgba(255,255,255,0.35),0_8px_20px_rgba(0,0,0,0.25)] font-mono animate-[none!important] [transition:none!important]",
				className,
			)}
			style={
				moduleColorStyles
					? ({
							...moduleColorStyles,
							...style,
					  } as React.CSSProperties)
					: style
			}
			{...props}
		/>
	);
});
DropdownMenuSubContent.displayName =
	DropdownMenuPrimitive.SubContent.displayName;

const DropdownMenuContent = React.forwardRef<
	React.ElementRef<typeof DropdownMenuPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 4, style, ...props }, ref) => {
	const moduleColorStyles = useModuleColorStyles();

	return (
		<DropdownMenuPrimitive.Portal>
			<DropdownMenuPrimitive.Content
				ref={ref}
				sideOffset={sideOffset}
				className={cn(
					"z-50 min-w-40 rounded-none retro-border bg-popover/95 p-2 text-popover-foreground shadow-[inset_-1px_-1px_0_rgba(0,0,0,0.08),inset_1px_1px_0_rgba(255,255,255,0.35),0_8px_20px_rgba(0,0,0,0.25)] font-mono animate-[none!important] [transition:none!important] data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
					className,
				)}
				style={
					moduleColorStyles
						? ({
								...moduleColorStyles,
								...style,
						  } as React.CSSProperties)
						: style
				}
				{...props}
			/>
		</DropdownMenuPrimitive.Portal>
	);
});
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;

const DropdownMenuItem = React.forwardRef<
	React.ElementRef<typeof DropdownMenuPrimitive.Item>,
	React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
		inset?: boolean;
		selected?: boolean;
	}
>(({ className, inset, selected, ...props }, ref) => (
	<DropdownMenuPrimitive.Item
		ref={ref}
		data-state={selected ? "checked" : undefined}
		className={cn(
			"relative flex cursor-default select-none items-center gap-2 rounded-none px-3 py-2 text-sm font-mono text-foreground/90 outline-none transition-[background-color,color] data-highlighted:bg-accent data-highlighted:text-foreground data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-disabled:pointer-events-none data-disabled:opacity-50",
			inset && "pl-8",
			className,
		)}
		{...props}
	/>
));
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;

const DropdownMenuCheckboxItem = React.forwardRef<
	React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
	React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
	<DropdownMenuPrimitive.CheckboxItem
		ref={ref}
		className={cn(
			"relative flex cursor-default select-none items-center gap-2 rounded-none py-2 pl-8 pr-3 text-sm font-mono text-foreground/90 outline-none transition-[background-color,color] data-highlighted:bg-accent data-highlighted:text-foreground data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-disabled:pointer-events-none data-disabled:opacity-50",
			className,
		)}
		checked={checked}
		{...props}
	>
		<span className="absolute left-2 flex size-3.5 items-center justify-center">
			<DropdownMenuPrimitive.ItemIndicator>
				<svg
					className="size-4"
					viewBox="0 0 24 24"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M20 6 9 17l-5-5"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>
			</DropdownMenuPrimitive.ItemIndicator>
		</span>
		{children}
	</DropdownMenuPrimitive.CheckboxItem>
));
DropdownMenuCheckboxItem.displayName =
	DropdownMenuPrimitive.CheckboxItem.displayName;

const DropdownMenuRadioItem = React.forwardRef<
	React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
	React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
	<DropdownMenuPrimitive.RadioItem
		ref={ref}
		className={cn(
			"relative flex cursor-default select-none items-center gap-2 rounded-none py-2 pl-8 pr-3 text-sm font-mono text-foreground/90 outline-none transition-[background-color,color] data-highlighted:bg-accent data-highlighted:text-foreground data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-disabled:pointer-events-none data-disabled:opacity-50",
			className,
		)}
		{...props}
	>
		<span className="absolute left-2 flex size-3.5 items-center justify-center">
			<DropdownMenuPrimitive.ItemIndicator>
				<span className="size-2 rounded-full bg-current" />
			</DropdownMenuPrimitive.ItemIndicator>
		</span>
		{children}
	</DropdownMenuPrimitive.RadioItem>
));
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName;

const DropdownMenuLabel = React.forwardRef<
	React.ElementRef<typeof DropdownMenuPrimitive.Label>,
	React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & {
		inset?: boolean;
	}
>(({ className, inset, ...props }, ref) => (
	<DropdownMenuPrimitive.Label
		ref={ref}
		className={cn(
			"px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground",
			inset && "pl-8",
			className,
		)}
		{...props}
	/>
));
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName;

const DropdownMenuSeparator = React.forwardRef<
	React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
	React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
	<DropdownMenuPrimitive.Separator
		ref={ref}
		className={cn("bg-border/70 h-px", className)}
		{...props}
	/>
));
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName;

const DropdownMenuShortcut = ({
	className,
	...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
	return (
		<span
			className={cn(
				"ml-auto text-xs tracking-widest text-muted-foreground",
				className,
			)}
			{...props}
		/>
	);
};
DropdownMenuShortcut.displayName = "DropdownMenuShortcut";

export {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuPortal,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
};
