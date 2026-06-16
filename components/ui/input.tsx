import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-input w-full min-w-0 rounded-ridy-md border border-border-input bg-surface px-3 py-2 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-text-secondary focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-text-secondary disabled:opacity-100 aria-invalid:border-danger aria-invalid:ring-3 aria-invalid:ring-danger/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}

export { Input }
