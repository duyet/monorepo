/**
 * Static date filter component for display purposes
 * Shows current selection without interactive functionality
 * Compatible with static generation
 */

import type { StaticDateFilterProps } from "./types";

export function StaticDateFilter({
  currentPeriod = "30 days",
  className,
}: StaticDateFilterProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-sm text-muted-foreground">Time period:</span>
      <div className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white">
        {currentPeriod}
      </div>
    </div>
  );
}
