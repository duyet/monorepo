import React from "react";

interface TimelineEvent {
  date: string;
  title: string;
  description?: string;
  status?: "completed" | "in-progress" | "pending" | "failed";
}

interface ToolTimelineProps {
  title: string;
  events: TimelineEvent[];
  orientation?: "vertical" | "horizontal";
}

/**
 * ToolTimeline - Horizontal/vertical timeline with status tracking
 */
export const ToolTimeline: React.FC<ToolTimelineProps> = ({
  title,
  events,
  orientation = "vertical",
}) => {
  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case "completed":
        return "bg-green-500 border-green-500";
      case "in-progress":
        return "bg-blue-500 border-blue-500";
      case "pending":
        return "bg-yellow-500 border-yellow-500";
      case "failed":
        return "bg-red-500 border-red-500";
      default:
        return "bg-gray-400 border-gray-400";
    }
  };

  const getStatusText = (status: string | undefined) => {
    switch (status) {
      case "completed":
        return "✓ Completed";
      case "in-progress":
        return "↻ In Progress";
      case "pending":
        return "⧗ Pending";
      case "failed":
        return "✗ Failed";
      default:
        return "Unknown";
    }
  };

  if (orientation === "horizontal") {
    return (
      <div className="my-6">
        <h3 className="text-xl font-bold mb-4">{title}</h3>
        <div className="flex flex-wrap items-center gap-4">
          {events.map((event, idx) => (
            <div key={idx} className="flex items-center flex-1 min-w-[200px]">
              <div className={`w-4 h-4 rounded-full ${getStatusColor(event.status)} border-2`}></div>
              {idx < events.length - 1 && (
                <div className={`flex-1 h-1 ${event.status === "completed" ? "bg-green-500" : "bg-gray-300"}`}></div>
              )}
              <div className="ml-2 flex-1">
                <div className="font-semibold text-sm">{event.title}</div>
                <div className="text-xs text-gray-500">{event.date}</div>
                {event.status && (
                  <div className={`text-xs font-medium mt-1 ${
                    event.status === "completed" ? "text-green-600" :
                    event.status === "in-progress" ? "text-blue-600" :
                    event.status === "pending" ? "text-yellow-600" :
                    "text-red-600"
                  }`}>
                    {getStatusText(event.status)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Vertical orientation
  return (
    <div className="my-6">
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      <div className="space-y-0">
        {events.map((event, idx) => (
          <div key={idx} className="flex gap-4 relative">
            {/* Timeline line */}
            {idx < events.length - 1 && (
              <div className="absolute left-[11px] top-8 w-0.5 h-full bg-gray-300 dark:bg-gray-600"></div>
            )}

            {/* Icon */}
            <div className="relative z-10">
              <div className={`w-8 h-8 rounded-full border-4 ${getStatusColor(event.status)} flex items-center justify-center text-white font-bold text-sm`}>
                {idx + 1}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 pb-8">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold text-base">{event.title}</div>
                  {event.description && (
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {event.description}
                    </div>
                  )}
                </div>
                <div className="text-xs text-gray-500 ml-4">{event.date}</div>
              </div>

              {event.status && (
                <div className={`text-xs font-medium mt-1 inline-block px-2 py-1 rounded-full ${
                  event.status === "completed" ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" :
                  event.status === "in-progress" ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" :
                  event.status === "pending" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300" :
                  "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                }`}>
                  {getStatusText(event.status)}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ToolTimeline;