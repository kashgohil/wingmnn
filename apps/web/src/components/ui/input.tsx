import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground/80 selection:bg-primary selection:text-primary-foreground dark:bg-input/30 h-9 w-full min-w-0 rounded-none border-2 border-border bg-transparent px-3 py-1 text-base transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm font-medium text-foreground",
        "shadow-[inset_-1px_-1px_0_rgba(0,0,0,0.1),inset_1px_1px_0_rgba(255,255,255,0.8)]",
        "focus-visible:border-primary focus-visible:shadow-[inset_-2px_-2px_0_rgba(0,0,0,0.15),inset_2px_2px_0_rgba(255,255,255,0.9)] focus-visible:ring-0",
        "aria-invalid:border-destructive aria-invalid:shadow-[inset_-2px_-2px_0_rgba(0,0,0,0.15),inset_2px_2px_0_rgba(255,255,255,0.9)]",
        className
      )}
      {...props}
    />
  )
}

export { Input }
