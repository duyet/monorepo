import { cn } from "@duyet/libs/utils";
import { type VariantProps, cva } from "class-variance-authority";
import type { HTMLAttributes } from "react";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide transition-colors",
  {
    variants: {
      variant: {
        default: "border-border bg-muted text-muted-foreground",
        open: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
        closed:
          "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300",
        partial:
          "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-300",
        milestone:
          "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-300",
        curated:
          "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300",
        epoch:
          "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-300",
        outline: "border-border text-foreground",
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
