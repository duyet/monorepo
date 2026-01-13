import React, { useState } from "react";

interface TimelineEvent {
  date: string;
  title: string;
  description: string;
  status: "completed" | "in-progress" | "planned";
  icon?: string;
}

interface ToolTimelineProps {
  events: TimelineEvent[];
  orientation?: "horizontal" | "vertical";
}

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const styles = {
    completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    "in-progress": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    planned: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
  };

  const labels = {
    completed: "Completed",
    "in-progress": "In Progress",
    planned: "Planned",
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
};

/**
 * ToolTimeline Component
 * Displays events in a horizontal or vertical timeline with status indicators
 */
export const ToolTimeline: React.FC<ToolTimelineProps> = ({
  events,
  orientation = "vertical",
}) => {
  const [isVertical, setIsVertical] = useState(orientation === "vertical");

  if (isVertical) {
    return (
      <div className="w-full mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold">Tool Timeline</h3>
          <button
            onClick={() => setIsVertical(false)}
            className="text-sm px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            Switch to Horizontal
          </button>
        </div>
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-gray-300 dark:from-blue-400 dark:via-purple-400 dark:to-gray-600"></div>

          <div className="space-y-6 ml-12">
            {events.map((event, index) => (
              <div key={index} className="relative">
                {/* Dot */}
                <div className={`absolute -left-11 top-2 w-4 h-4 rounded-full ${
                  event.status === "completed" ? "bg-green-500" :
                  event.status === "in-progress" ? "bg-blue-500" :
                  "bg-gray-400"
                }`}></div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-lg">{event.title}</h4>
                    <StatusBadge status={event.status} />
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {event.date}
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {event.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Horizontal layout
  return (
    <div className="w-full mb-8 overflow-x-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-bold">Tool Timeline</h3>
        <button
          onClick={() => setIsVertical(true)}
          className="text-sm px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          Switch to Vertical
        </button>
      </div>

      <div className="flex items-start gap-4 min-w-max pb-4">
        {events.map((event, index) => (
          <div key={index} className="w-64">
            <div className="flex flex-col items-center mb-2">
              <div className={`w-6 h-6 rounded-full mb-2 ${
                event.status === "completed" ? "bg-green-500" :
                event.status === "in-progress" ? "bg-blue-500" :
                "bg-gray-400"
              }`}></div>
              <div className="w-0.5 h-8 bg-gradient-to-b from-blue-500 to-gray-300 dark:from-blue-400 dark:to-gray-600"></div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-sm truncate">{event.title}</h4>
                <StatusBadge status={event.status} />
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                {event.date}
              </div>
              <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-3">
                {event.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
