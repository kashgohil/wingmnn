import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer inline-flex h-6 w-11 shrink-0 items-center rounded-none border-2 border-border bg-input transition-all outline-none disabled:cursor-not-allowed disabled:opacity-50",
        "shadow-[inset_-1px_-1px_0_rgba(0,0,0,0.1),inset_1px_1px_0_rgba(255,255,255,0.8)]",
        "data-[state=checked]:bg-primary data-[state=checked]:border-primary",
        "data-[state=checked]:shadow-[inset_-2px_-2px_0_rgba(0,0,0,0.15),inset_2px_2px_0_rgba(255,255,255,0.9)]",
        "focus-visible:border-primary focus-visible:ring-0 focus-visible:shadow-[inset_-2px_-2px_0_rgba(0,0,0,0.15),inset_2px_2px_0_rgba(255,255,255,0.9)]",
        "dark:data-[state=unchecked]:bg-input/80",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block h-4 w-4 rounded-none ring-0 transition-transform",
          "bg-background border-2 border-border",
          "shadow-[inset_-1px_-1px_0_rgba(0,0,0,0.15),inset_1px_1px_0_rgba(255,255,255,0.9)]",
          "dark:bg-foreground dark:data-[state=checked]:bg-primary-foreground",
          "data-[state=checked]:translate-x-[calc(100%+2px)] data-[state=unchecked]:translate-x-[2px]"
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
