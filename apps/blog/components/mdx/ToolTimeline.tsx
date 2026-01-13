"use client";

import { useState } from "react";
import { Calendar, ChevronDown, ChevronUp } from "lucide-react";

interface TimelineEvent {
  date: string;
  title: string;
  description: string;
  status?: "completed" | "in-progress" | "planned";
}

interface ToolTimelineProps {
  events: TimelineEvent[];
  orientation?: "horizontal" | "vertical";
}

export function ToolTimeline({ events, orientation = "vertical" }: ToolTimelineProps) {
  const [showAll, setShowAll] = useState(false);
  const displayCount = 5;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "in-progress":
        return "bg-blue-500";
      case "planned":
        return "bg-gray-400";
      default:
        return "bg-gray-400";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "in-progress":
        return "In Progress";
      case "planned":
        return "Planned";
      default:
        return "Upcoming";
    }
  };

  const sortedEvents = [...events].sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const displayedEvents = showAll ? sortedEvents : sortedEvents.slice(0, displayCount);

  if (orientation === "horizontal") {
    return (
      <div className="space-y-6">
        <h3 className="text-xl font-semibold">Timeline</h3>

        <div className="relative overflow-x-auto pb-4">
          <div className="flex space-x-4 min-w-max px-4">
            {displayedEvents.map((event, index) => (
              <div
                key={index}
                className="w-64 rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                    {new Date(event.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className={`w-2 h-2 rounded-full ${getStatusColor(
                      event.status || "planned"
                    )}`}
                  />
                  <span className="text-xs font-medium">
                    {getStatusText(event.status || "planned")}
                  </span>
                </div>
                <h4 className="font-semibold text-sm mb-1">{event.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {event.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {sortedEvents.length > displayCount && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            {showAll ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Show More ({sortedEvents.length - displayCount} more events)
              </>
            )}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Timeline</h3>

      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>

        <div className="space-y-4 ml-10">
          {displayedEvents.map((event, index) => (
            <div key={index} className="relative">
              <div
                className={`absolute -left-[41px] top-1 w-3 h-3 rounded-full ${getStatusColor(
                  event.status || "planned"
                )}`}
              ></div>

              <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                      {new Date(event.date).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      event.status === "completed"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : event.status === "in-progress"
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {getStatusText(event.status || "planned")}
                  </span>
                </div>

                <h4 className="font-semibold text-base">{event.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {event.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {sortedEvents.length > displayCount && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          {showAll ? (
            <>
              <ChevronUp className="w-4 h-4" />
              Show Less
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              Show More ({sortedEvents.length - displayCount} more events)
            </>
          )}
        </button>
      )}
    </div>
  );
}