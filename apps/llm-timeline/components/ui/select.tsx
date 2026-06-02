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
          "h-9 rounded-[var(--rd-r-sm)] px-2.5 text-sm transition-all",
          "focus:outline-none focus:ring-2 focus:ring-[var(--rd-ring)]",
          "appearance-none cursor-pointer",
          "disabled:cursor-not-allowed disabled:opacity-50",
          variant === "filter"
            ? "border border-[var(--rd-border)] bg-[var(--rd-surface)] text-[var(--rd-text)] hover:border-[var(--rd-border-2)]"
            : "border border-[var(--rd-border)] bg-[var(--rd-bg)]",
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
