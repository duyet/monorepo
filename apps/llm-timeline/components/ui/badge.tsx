import { cn } from "@duyet/libs/utils";
import { type VariantProps, cva } from "class-variance-authority";
import type { HTMLAttributes } from "react";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide transition-colors",
  {
    variants: {
      variant: {
        default:
          "border-[var(--rd-border)] bg-[var(--rd-surface-2)] text-[var(--rd-text-2)]",
        open: "border-[color-mix(in_srgb,var(--rd-ok)_25%,var(--rd-border))] bg-[color-mix(in_srgb,var(--rd-ok)_12%,var(--rd-surface))] text-[var(--rd-ok)]",
        closed:
          "border-[color-mix(in_srgb,var(--rd-down)_25%,var(--rd-border))] bg-[color-mix(in_srgb,var(--rd-down)_12%,var(--rd-surface))] text-[var(--rd-down)]",
        partial:
          "border-[color-mix(in_srgb,var(--rd-accent)_25%,var(--rd-border))] bg-[var(--rd-accent-bg)] text-[var(--rd-accent-ink)]",
        milestone:
          "border-[color-mix(in_srgb,var(--rd-warn)_25%,var(--rd-border))] bg-[color-mix(in_srgb,var(--rd-warn)_12%,var(--rd-surface))] text-[var(--rd-warn)]",
        curated:
          "border-[var(--rd-border)] bg-[var(--rd-surface-2)] text-[var(--rd-text-2)]",
        epoch:
          "border-[var(--rd-border)] bg-[var(--rd-surface-2)] text-[var(--rd-text-3)]",
        outline:
          "border-[var(--rd-border)] text-[var(--rd-text)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
