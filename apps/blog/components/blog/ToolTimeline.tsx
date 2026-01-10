"use client";

import type { ToolTimelineProps } from "./types";

/**
 * ToolTimeline - Vertical timeline with status
 * Uses Claude warm palette and consistent spacing
 */
export function ToolTimeline({ events, className }: ToolTimelineProps) {

  const sortedEvents = [...events].sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  const formatDate = (dateInput: string | Date) => {
    const date = new Date(dateInput);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (sortedEvents.length === 0) {
    return <div className="text-sm text-gray-500 dark:text-gray-400">No events</div>;
  }

  const statusConfig: Record<string, { label: string; symbol: string }> = {
    adopted: { label: "Adopted", symbol: "✓" },
    active: { label: "Active", symbol: "◉" },
    testing: { label: "Testing", symbol: "◐" },
    deprecated: { label: "Deprecated", symbol: "✗" },
  };

  return (
    <div className={`space-y-3 border-l-2 border-gray-300 dark:border-slate-700 pl-4 py-3 ${className}`}>
      {sortedEvents.map((event) => {
        const config = statusConfig[event.status] || statusConfig.testing;

        return (
          <div key={event.id} className="text-gray-700 dark:text-gray-300">
            <div className="flex items-baseline gap-2 flex-wrap text-base">
              <span className="text-gray-500 dark:text-gray-400">{config.symbol}</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {event.name}
              </span>
              <span className="text-gray-500 dark:text-gray-400">—</span>
              <span className="text-gray-600 dark:text-gray-400 text-sm">
                {formatDate(event.date)}
              </span>
              <span className="text-gray-500 dark:text-gray-400">•</span>
              <span className="text-gray-500 dark:text-gray-400 text-sm">
                {config.label}
              </span>
            </div>
            {event.details && (
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mt-1 ml-6 text-sm">
                {event.details}
              </p>
            )}
            {event.reason && (
              <p className="text-gray-500 dark:text-gray-500 leading-relaxed mt-1 ml-6 text-sm">
                Reason: {event.reason}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default ToolTimeline;
