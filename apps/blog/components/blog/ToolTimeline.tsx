"use client";

import { useState } from "react";
import type { ToolTimelineProps } from "./types";

/**
 * ToolTimeline - Vertical timeline with status
 * Uses Claude warm palette and consistent spacing
 */
export function ToolTimeline({ events, className }: ToolTimelineProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

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

  const statusConfig: Record<string, { bg: string; ring: string; label: string }> = {
    adopted: {
      bg: "bg-green-100 dark:bg-green-950/40",
      ring: "ring-green-400 dark:ring-green-600",
      label: "Adopted",
    },
    active: {
      bg: "bg-blue-100 dark:bg-blue-950/40",
      ring: "ring-blue-400 dark:ring-blue-600",
      label: "Active",
    },
    testing: {
      bg: "bg-claude-yellow dark:bg-claude-coral/20",
      ring: "ring-claude-yellow dark:ring-claude-coral",
      label: "Testing",
    },
    deprecated: {
      bg: "bg-gray-100 dark:bg-gray-800/30",
      ring: "ring-gray-400 dark:ring-gray-600",
      label: "Deprecated",
    },
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {sortedEvents.map((event, idx) => {
        const config = statusConfig[event.status] || statusConfig.testing;
        const isExpanded = expanded === event.id;

        return (
          <div key={event.id} className="relative pl-8">
            {/* Connector line */}
            {idx < sortedEvents.length - 1 && (
              <div className="absolute left-2.5 top-12 w-0.5 h-8 bg-gradient-to-b from-gray-300 dark:from-slate-700 to-transparent" />
            )}

            {/* Timeline dot */}
            <div className={`absolute left-0 top-1.5 w-5 h-5 rounded-full ring-4 ${config.bg} ${config.ring} border-2 border-white dark:border-slate-950`} />

            {/* Content card */}
            <button
              onClick={() => setExpanded(isExpanded ? null : event.id)}
              className="w-full text-left focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-slate-950 focus:ring-blue-400 rounded"
            >
              <div className={`rounded-lg border transition-all ${
                isExpanded
                  ? "border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50 shadow-sm"
                  : "border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-gray-300 dark:hover:border-slate-700"
              } p-4`}>
                <div className="flex items-start justify-between gap-3 mb-1">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-tight">
                      {event.name}
                    </h3>
                  </div>
                  <span className={`px-2.5 py-1 rounded text-xs font-semibold flex-shrink-0 whitespace-nowrap ${config.bg} text-gray-700 dark:text-gray-200`}>
                    {config.label}
                  </span>
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(event.date)}
                </p>
              </div>
            </button>

            {/* Expanded details */}
            {isExpanded && (
              <div className="mt-2 ml-4 p-3.5 rounded-lg bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800 space-y-2.5 text-sm">
                <p className="text-gray-700 dark:text-gray-300">
                  {event.details}
                </p>
                {event.reason && (
                  <div className="pt-2.5 border-t border-gray-200 dark:border-slate-800 space-y-1.5">
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Highlight
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 text-xs leading-relaxed">
                      {event.reason}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default ToolTimeline;
