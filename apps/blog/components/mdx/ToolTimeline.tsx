import * as React from "react";
import { Circle, CheckCircle } from "lucide-react";

interface TimelineEvent {
  date: string;
  title: string;
  description: string;
  completed?: boolean;
}

interface ToolTimelineProps {
  events: TimelineEvent[];
  title?: string;
  orientation?: "horizontal" | "vertical";
}

export function ToolTimeline({ events, title = "Timeline", orientation = "vertical" }: ToolTimelineProps) {
  if (orientation === "horizontal") {
    return (
      <div className="my-6">
        {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
        <div className="flex flex-col md:flex-row gap-4">
          {events.map((event, index) => (
            <div
              key={index}
              className="flex-1 relative border-l-2 md:border-l-0 md:border-t-2 border-gray-300 dark:border-gray-600 pl-4 md:pl-0 md:pt-4"
            >
              <div className="absolute -left-[9px] md:-top-[9px] md:left-1/2 md:-translate-x-1/2">
                {event.completed ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-400" />
                )}
              </div>
              <div className="mt-2 md:mt-0 md:text-center">
                <div className="font-mono text-xs text-gray-500">{event.date}</div>
                <div className="font-semibold">{event.title}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {event.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="my-6 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <h3 className="text-lg font-semibold m-0">{title}</h3>
      </div>
      <div className="p-4">
        <div className="space-y-0">
          {events.map((event, index) => (
            <div
              key={index}
              className="relative pl-8 pb-6 last:pb-0"
            >
              {/* Vertical line */}
              {index !== events.length - 1 && (
                <div className="absolute left-[10px] top-6 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-600" />
              )}

              {/* Event marker */}
              <div className="absolute left-0 top-1">
                {event.completed ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <Circle className="w-6 h-6 text-gray-400" />
                )}
              </div>

              {/* Event content */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
                <div className="font-mono text-xs text-gray-500 dark:text-gray-400">
                  {event.date}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-base">{event.title}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {event.description}
                  </div>
                </div>
                {event.completed && (
                  <div className="text-xs font-semibold text-green-600 uppercase tracking-wider">
                    Completed
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}