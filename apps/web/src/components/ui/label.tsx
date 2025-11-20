"use client";

import * as LabelPrimitive from "@radix-ui/react-label";
import * as React from "react";

import { cn } from "@/lib/utils";

const Label = React.forwardRef<
	React.ComponentType<typeof LabelPrimitive.Root>,
	React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
	<LabelPrimitive.Root
		ref={ref}
		data-slot="label"
		className={cn(
			"flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
			className,
		)}
		{...(props as any)}
	/>
));
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
