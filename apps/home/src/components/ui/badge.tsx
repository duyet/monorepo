import type * as React from "react";
import { cn } from "../../lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "soft";
  tone?: "plum" | "pine" | "slate";
}

function Badge({
  className,
  variant = "default",
  tone,
  ...props
}: BadgeProps) {
  const variants: Record<string, string> = {
    default:
      "border-transparent bg-[var(--rd-text)] text-[var(--rd-bg)]",
    secondary:
      "border-transparent bg-[var(--rd-surface-2)] text-[var(--rd-text-2)]",
    destructive:
      "border-transparent bg-destructive text-destructive-foreground",
    outline: "border-[var(--rd-border)] text-[var(--rd-text-2)] bg-transparent",
    soft: "border-transparent",
  };

  const tones: Record<string, string> = {
    plum: "border-transparent bg-[var(--rd-label-plum)] text-[var(--rd-label-plum-fg)]",
    pine: "border-transparent bg-[var(--rd-label-pine)] text-[var(--rd-label-pine-fg)]",
    slate: "border-transparent bg-[var(--rd-label-slate)] text-[var(--rd-label-slate-fg)]",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
        tone ? tones[tone] : variants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
