import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
	return (
		<textarea
			data-slot="textarea"
			className={cn(
				"placeholder:text-muted-foreground/80 selection:bg-primary selection:text-primary-foreground dark:bg-input/30 field-sizing-content min-h-16 w-full rounded-none border-2 border-border bg-transparent px-3 py-2 text-base transition-[color,box-shadow] outline-none font-medium text-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
				"retro-border-shadow-sm",
				"focus-visible:border-primary focus-visible:retro-border-shadow focus-visible:ring-0",
				"aria-invalid:border-destructive aria-invalid:retro-border-shadow",
				className,
			)}
			{...props}
		/>
	);
}

export { Textarea };
