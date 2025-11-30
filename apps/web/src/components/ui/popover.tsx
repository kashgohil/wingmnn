import * as PopoverPrimitive from "@radix-ui/react-popover";
import * as React from "react";

import { useModuleColorStyles } from "@/lib/ModuleColorContext";
import { cn } from "@/lib/utils";

const Popover = PopoverPrimitive.Root;

const PopoverTrigger = PopoverPrimitive.Trigger;

const PopoverAnchor = PopoverPrimitive.Anchor;

const PopoverContent = React.forwardRef<
	React.ElementRef<typeof PopoverPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, style, ...props }, ref) => {
	const moduleColorStyles = useModuleColorStyles();

	return (
		<PopoverPrimitive.Portal>
			<PopoverPrimitive.Content
				ref={ref}
				align={align}
				sideOffset={sideOffset}
				className={cn(
					"z-50 w-72 rounded-none retro-border bg-popover p-4 text-popover-foreground shadow-md outline-none font-mono [animation:none!important] [transition:none!important]",
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
		</PopoverPrimitive.Portal>
	);
});
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

export { Popover, PopoverAnchor, PopoverContent, PopoverTrigger };
