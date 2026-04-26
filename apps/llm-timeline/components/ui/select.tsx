import * as React from "react"
import { cn } from "@duyet/libs/utils"

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  variant?: "default" | "filter"
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    return (
      <select
        className={cn(
          "h-9 rounded-lg px-2.5 text-sm transition-all",
          "focus:outline-none focus:ring-2 focus:ring-ring/50",
          "appearance-none cursor-pointer",
          "disabled:cursor-not-allowed disabled:opacity-50",
          variant === "filter"
            ? "border border-border bg-card text-foreground hover:border-foreground/20"
            : "border border-input bg-background",
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </select>
    )
  }
)
Select.displayName = "Select"

export { Select }
