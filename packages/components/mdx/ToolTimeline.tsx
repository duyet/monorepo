import React, { useState } from "react";
import { cn } from "@duyet/libs/utils";

export interface TimelineEvent {
  name: string;
  date: string;
  description: string;
  status: "planned" | "in-progress" | "completed" | "delayed";
  icon?: string;
}

export interface ToolTimelineProps {
  events: TimelineEvent[];
  orientation?: "vertical" | "horizontal";
  className?: string;
}

const STATUS_STYLES = {
  planned: "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300",
  "in-progress": "bg-blue-200 dark:bg-blue-700 text-blue-700 dark:text-blue-300",
  completed: "bg-green-200 dark:bg-green-700 text-green-700 dark:text-green-300",
  delayed: "bg-orange-200 dark:bg-orange-700 text-orange-700 dark:text-orange-300",
};

const STATUS_LABELS = {
  planned: "Planned",
  "in-progress": "In Progress",
  completed: "Completed",
  delayed: "Delayed",
};

export function ToolTimeline({
  events,
  orientation = "vertical",
  className,
}: ToolTimelineProps) {
  const [filter, setFilter] = useState<string>("all");

  const filteredEvents = events.filter((event) => {
    if (filter === "all") return true;
    return event.status === filter;
  });

  const sortedEvents = [...filteredEvents].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateB.getTime() - dateA.getTime();
  });

  if (orientation === "horizontal") {
    return (
      <div className={cn("w-full max-w-6xl mx-auto space-y-6", className)}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">Timeline</h2>
            <p className="text-muted-foreground">Project milestones and timeline</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {["all", "planned", "in-progress", "completed", "delayed"].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={cn(
                  "px-3 py-1.5 text-sm rounded-full transition-colors",
                  filter === status
                    ? "bg-primary text-white"
                    : "bg-muted hover:bg-muted/80"
                )}
              >
                {status === "all" ? "All" : STATUS_LABELS[status as keyof typeof STATUS_LABELS]}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 md:gap-0 md:relative md:border-t-2 md:border-primary/20 md:pt-6">
          {sortedEvents.map((event, index) => (
            <div key={index} className="md:flex-1 md:px-4">
              <div className="flex md:flex-col items-start md:items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-xl bg-muted">
                  {event.icon || "📌"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold truncate">{event.name}</span>
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded text-xs font-medium",
                        STATUS_STYLES[event.status]
                      )}
                    >
                      {STATUS_LABELS[event.status]}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">{event.date}</div>
                  <div className="text-sm mt-1">{event.description}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Vertical layout
  return (
    <div className={cn("w-full max-w-4xl mx-auto space-y-6", className)}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-2">Timeline</h2>
          <p className="text-muted-foreground">Project milestones and timeline</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {["all", "planned", "in-progress", "completed", "delayed"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={cn(
                "px-3 py-1.5 text-sm rounded-full transition-colors",
                filter === status
                  ? "bg-primary text-white"
                  : "bg-muted hover:bg-muted/80"
              )}
            >
              {status === "all" ? "All" : STATUS_LABELS[status as keyof typeof STATUS_LABELS]}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6 relative before:absolute before:left-5 before:top-2 before:bottom-2 before:w-0.5 before:bg-primary/20">
        {sortedEvents.map((event, index) => (
          <div key={index} className="relative pl-12">
            <div className="absolute left-0 top-1 w-10 h-10 rounded-full flex items-center justify-center text-xl bg-white dark:bg-slate-900 border-2 border-primary shadow-md">
              {event.icon || "📌"}
            </div>
            <div className="bg-muted/50 rounded-lg p-4 hover:bg-muted/70 transition-colors">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="font-semibold text-lg">{event.name}</span>
                <span
                  className={cn(
                    "px-2 py-0.5 rounded text-xs font-medium",
                    STATUS_STYLES[event.status]
                  )}
                >
                  {STATUS_LABELS[event.status]}
                </span>
              </div>
              <div className="text-sm text-muted-foreground mb-2">{event.date}</div>
              <div className="text-sm">{event.description}</div>
            </div>
          </div>
        ))}
      </div>

      {sortedEvents.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No events found for the selected filter.
        </div>
      )}
    </div>
  );
}