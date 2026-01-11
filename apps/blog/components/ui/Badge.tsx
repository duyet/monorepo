// Reusable badge component with variants
import { cn } from "@duyet/libs/utils";

export type BadgeVariant =
  | "new"
  | "featured"
  | "active"
  | "testing"
  | "deprecated"
  | "default";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  new: "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200",
  featured:
    "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200",
  active: "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200",
  testing: "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200",
  deprecated: "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200",
  default: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300",
};

export function Badge({
  children,
  variant = "default",
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
