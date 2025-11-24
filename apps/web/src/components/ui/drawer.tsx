import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

const Drawer = DialogPrimitive.Root;

const DrawerTrigger = DialogPrimitive.Trigger;

const DrawerPortal = DialogPrimitive.Portal;

const DrawerClose = DialogPrimitive.Close;

const DrawerOverlay = React.forwardRef<
	React.ElementRef<typeof DialogPrimitive.Overlay>,
	React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
	<DialogPrimitive.Overlay
		ref={ref}
		className={cn(
			"fixed inset-0 z-50 bg-black/50 backdrop-blur-sm",
			className
		)}
		{...props}
	/>
));
DrawerOverlay.displayName = DialogPrimitive.Overlay.displayName;

interface DrawerContentProps
	extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
	side?: "left" | "right" | "top" | "bottom";
}

const DrawerContent = React.forwardRef<
	React.ElementRef<typeof DialogPrimitive.Content>,
	DrawerContentProps
>(({ className, children, side = "right", ...props }, ref) => {
	const sideClasses = {
		right: "right-0 top-0 bottom-0 h-full w-full max-w-md translate-x-0 data-[state=closed]:translate-x-full",
		left: "left-0 top-0 bottom-0 h-full w-full max-w-md translate-x-0 data-[state=closed]:-translate-x-full",
		top: "top-0 left-0 right-0 w-full max-h-[80vh] translate-y-0 data-[state=closed]:-translate-y-full",
		bottom: "bottom-0 left-0 right-0 w-full max-h-[80vh] translate-y-0 data-[state=closed]:translate-y-full",
	};

	return (
		<DrawerPortal>
			<DrawerOverlay />
			<DialogPrimitive.Content
				ref={ref}
				className={cn(
					"fixed z-50 grid gap-4 retro-border bg-background p-6 shadow-lg rounded-none transition-transform duration-300",
					sideClasses[side],
					className
				)}
				{...props}
			>
				{children}
				<DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
					<X className="h-4 w-4" />
					<span className="sr-only">Close</span>
				</DialogPrimitive.Close>
			</DialogPrimitive.Content>
		</DrawerPortal>
	);
});
DrawerContent.displayName = DialogPrimitive.Content.displayName;

const DrawerHeader = ({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) => (
	<div
		className={cn(
			"flex flex-col space-y-1.5 text-center sm:text-left",
			className
		)}
		{...props}
	/>
);
DrawerHeader.displayName = "DrawerHeader";

const DrawerFooter = ({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) => (
	<div
		className={cn(
			"flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
			className
		)}
		{...props}
	/>
);
DrawerFooter.displayName = "DrawerFooter";

const DrawerTitle = React.forwardRef<
	React.ElementRef<typeof DialogPrimitive.Title>,
	React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
	<DialogPrimitive.Title
		ref={ref}
		className={cn(
			"text-lg font-bold leading-none tracking-tight text-foreground font-mono uppercase tracking-wider",
			className
		)}
		{...props}
	/>
));
DrawerTitle.displayName = DialogPrimitive.Title.displayName;

const DrawerDescription = React.forwardRef<
	React.ElementRef<typeof DialogPrimitive.Description>,
	React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
	<DialogPrimitive.Description
		ref={ref}
		className={cn("text-sm font-medium text-foreground/90", className)}
		{...props}
	/>
));
DrawerDescription.displayName = DialogPrimitive.Description.displayName;

export {
	Drawer,
	DrawerPortal,
	DrawerOverlay,
	DrawerClose,
	DrawerTrigger,
	DrawerContent,
	DrawerHeader,
	DrawerFooter,
	DrawerTitle,
	DrawerDescription,
};

