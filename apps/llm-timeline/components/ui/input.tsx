import { cn } from "@duyet/libs/utils";
import { forwardRef, type InputHTMLAttributes } from "react";

const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-[var(--rd-r-sm)] border border-[var(--rd-border)] bg-[var(--rd-surface)] px-3 py-2 text-sm text-[var(--rd-text)] ring-offset-[var(--rd-bg)]",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium",
        "placeholder:text-[var(--rd-text-3)]",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--rd-ring)]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
