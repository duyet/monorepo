"use client";

import { cn } from "@duyet/libs/utils";

export interface TimelineItem {
  date: string;
  title: string;
  description?: string;
  status?: "completed" | "in-progress" | "planned" | "cancelled";
}

interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

/**
 * Timeline - Vertical timeline for project roadmaps, history, changelogs
 * Inspired by HTML effectiveness pattern for reports and status updates
 */
export function Timeline({ items, className = "" }: TimelineProps) {
  const statusStyles = {
    completed: "bg-[var(--primary)] border-[var(--primary)]",
    "in-progress": "bg-[var(--background-primary)] border-[var(--primary)] border-2",
    planned: "bg-[var(--surface-card)] border-[var(--border-subtle)]",
    cancelled: "bg-[var(--background-secondary)] border-[var(--border-faint)] opacity-50",
  };

  return (
    <div className={cn("my-8", className)}>
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[15px] top-2 bottom-2 w-px bg-[var(--hairline)]" />

        {items.map((item, index) => (
          <div key={index} className="relative pl-12 pb-8 last:pb-0">
            {/* Dot */}
            <div
              className={cn(
                "absolute left-0 top-1 h-8 w-8 rounded-full border-2 z-10 flex items-center justify-center",
                statusStyles[item.status || "planned"]
              )}
            >
              {item.status === "completed" && (
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              {item.status === "in-progress" && (
                <div className="w-2 h-2 bg-[var(--primary)] rounded-full animate-pulse" />
              )}
            </div>

            {/* Content */}
            <div>
              <div className="font-mono text-xs text-[var(--muted)] mb-1">
                {item.date}
              </div>
              <h4
                className={cn(
                  "font-medium text-[var(--ink)] dark:text-[var(--on-dark)]",
                  item.status === "cancelled" && "line-through"
                )}
              >
                {item.title}
              </h4>
              {item.description && (
                <p className="mt-1 text-sm text-[var(--body)] leading-relaxed">
                  {item.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface StatusBadgeProps {
  status: "completed" | "in-progress" | "planned" | "cancelled";
  children: React.ReactNode;
  className?: string;
}

/**
 * StatusBadge - Compact status indicator
 */
export function StatusBadge({
  status,
  children,
  className = "",
}: StatusBadgeProps) {
  const statusStyles = {
    completed: "bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/20",
    "in-progress": "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
    planned: "bg-[var(--surface-card)] text-[var(--muted)] border-[var(--border-subtle)]",
    cancelled: "bg-[var(--background-secondary)] text-[var(--muted)] border-[var(--border-faint)] line-through",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border",
        statusStyles[status],
        className
      )}
    >
      {children}
    </span>
  );
}

export default Timeline;
