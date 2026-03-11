import { cn } from "@duyet/libs/utils";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";

import type { SeriesNavItem } from "@/lib/getSeriesNav";

interface SeriesNavProps {
  prev: SeriesNavItem | null;
  next: SeriesNavItem | null;
  className?: string;
}

export function SeriesNav({ prev, next, className }: SeriesNavProps) {
  // Don't render if there's no navigation
  if (!prev && !next) {
    return null;
  }

  return (
    <nav
      className={cn(
        "mt-12 pt-8",
        "border-t border-gray-200 dark:border-gray-800",
        className
      )}
      aria-label="Series navigation"
    >
      <div className="grid grid-cols-2 gap-4">
        {/* Previous post in series */}
        {prev ? (
          <Link
            href={`/${prev.year}/${prev.month}/${prev.slug}`}
            className={cn(
              "group flex flex-col items-start gap-2",
              "p-4 rounded-lg",
              "bg-gray-50 dark:bg-gray-900/30",
              "hover:bg-gray-100 dark:hover:bg-gray-900/50",
              "transition-colors duration-200"
            )}
          >
            <span
              className={cn(
                "text-xs font-medium uppercase tracking-wide",
                "text-gray-500 dark:text-gray-400"
              )}
            >
              Previous in series
            </span>
            <div className={cn("flex items-center gap-2 w-full")}>
              <ArrowLeft
                className={cn(
                  "h-4 w-4 flex-shrink-0",
                  "text-gray-400 dark:text-gray-600",
                  "group-hover:text-gray-600 dark:group-hover:text-gray-400",
                  "transition-colors duration-200"
                )}
              />
              <span
                className={cn(
                  "text-sm font-medium",
                  "text-gray-900 dark:text-gray-100",
                  "group-hover:text-blue-600 dark:group-hover:text-blue-400",
                  "transition-colors duration-200",
                  "line-clamp-2"
                )}
              >
                {prev.title}
              </span>
            </div>
          </Link>
        ) : (
          // Empty placeholder for layout balance
          <div />
        )}

        {/* Next post in series */}
        {next ? (
          <Link
            href={`/${next.year}/${next.month}/${next.slug}`}
            className={cn(
              "group flex flex-col items-end gap-2",
              "p-4 rounded-lg",
              "bg-gray-50 dark:bg-gray-900/30",
              "hover:bg-gray-100 dark:hover:bg-gray-900/50",
              "transition-colors duration-200",
              "text-right"
            )}
          >
            <span
              className={cn(
                "text-xs font-medium uppercase tracking-wide",
                "text-gray-500 dark:text-gray-400"
              )}
            >
              Next in series
            </span>
            <div className={cn("flex items-center gap-2 w-full justify-end")}>
              <span
                className={cn(
                  "text-sm font-medium",
                  "text-gray-900 dark:text-gray-100",
                  "group-hover:text-blue-600 dark:group-hover:text-blue-400",
                  "transition-colors duration-200",
                  "line-clamp-2"
                )}
              >
                {next.title}
              </span>
              <ArrowRight
                className={cn(
                  "h-4 w-4 flex-shrink-0",
                  "text-gray-400 dark:text-gray-600",
                  "group-hover:text-gray-600 dark:group-hover:text-gray-400",
                  "transition-colors duration-200"
                )}
              />
            </div>
          </Link>
        ) : (
          // Empty placeholder for layout balance
          <div />
        )}
      </div>
    </nav>
  );
}
