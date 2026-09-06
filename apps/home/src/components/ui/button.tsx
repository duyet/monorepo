import * as React from "react";
import { cn } from "../../lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      asChild: _asChild,
      ...props
    },
    ref
  ) => {
    const variants: Record<string, string> = {
      default:
        "bg-[var(--rd-text)] text-[var(--rd-bg)] hover:opacity-90 border-transparent",
      destructive:
        "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      outline:
        "border border-[var(--rd-border-2)] bg-transparent hover:bg-[var(--rd-surface-2)] text-[var(--rd-text)]",
      secondary:
        "bg-[var(--rd-surface-2)] text-[var(--rd-text)] hover:bg-[var(--rd-border)] border-transparent",
      ghost:
        "hover:bg-[var(--rd-surface-2)] text-[var(--rd-text)] border-transparent",
      link: "text-[var(--rd-text)] underline-offset-4 hover:underline border-transparent",
    };

    const sizes: Record<string, string> = {
      default: "h-10 px-5 py-2",
      sm: "h-9 px-4",
      lg: "h-11 px-7",
      icon: "h-10 w-10",
    };

    return (
      <button
        className={cn(
          "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--rd-ring)] disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
