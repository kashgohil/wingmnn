import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
	"inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-bold transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none font-mono uppercase tracking-wider rounded-none",
	{
		variants: {
			variant: {
				default:
					"retro-button retro-button-primary text-primary-foreground relative active:top-[2px] active:left-[2px]",
				destructive:
					"retro-button retro-button-destructive text-white relative active:top-[2px] active:left-[2px]",
				outline:
					"retro-button retro-button-outline bg-background relative active:top-[2px] active:left-[2px]",
				secondary:
					"retro-button retro-button-secondary text-secondary-foreground relative active:top-[2px] active:left-[2px]",
				ghost:
					"retro-button retro-button-ghost hover:bg-accent hover:text-accent-foreground relative active:top-[2px] active:left-[2px]",
				link: "text-primary underline-offset-4 hover:underline retro-button-link",
				menu: "w-full flex items-center gap-3 px-3 py-2 rounded-none retro-border transition-all hover:bg-accent/50 group bg-transparent",
				"menu-item":
					"w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent rounded-none transition-colors text-left bg-transparent border-0 shadow-none font-normal normal-case",
			},
			size: {
				default: "h-10 px-6 py-2.5 has-[>svg]:px-5 text-sm",
				sm: "h-8 gap-1.5 px-4 has-[>svg]:px-3.5 text-xs",
				lg: "h-12 px-8 has-[>svg]:px-6 text-base",
				xl: "px-8 py-3 text-base",
				icon: "size-10",
				"icon-sm": "size-8",
				"icon-lg": "size-12",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

function Button({
	className,
	variant,
	size,
	asChild = false,
	...props
}: React.ComponentProps<"button"> &
	VariantProps<typeof buttonVariants> & {
		asChild?: boolean;
	}) {
	const Comp = asChild ? Slot : "button";

	return (
		<Comp
			data-slot="button"
			className={cn(buttonVariants({ variant, size, className }))}
			{...props}
		/>
	);
}

export { Button, buttonVariants };
