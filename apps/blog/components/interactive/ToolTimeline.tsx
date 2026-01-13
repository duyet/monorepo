import { Calendar, Circle } from "lucide-react";

export interface TimelineEvent {
  date: string;
  title: string;
  description: string;
  icon?: string;
  status?: "completed" | "current" | "upcoming";
}

export interface ToolTimelineProps {
  title?: string;
  events: TimelineEvent[];
  orientation?: "horizontal" | "vertical";
}

/**
 * ToolTimeline - Horizontal/vertical timeline
 * Displays events in chronological order with visual indicators
 */
export function ToolTimeline({
  title = "Timeline",
  events,
  orientation = "vertical"
}: ToolTimelineProps) {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500 border-green-500";
      case "current":
        return "bg-blue-500 border-blue-500 animate-pulse";
      case "upcoming":
        return "bg-gray-300 border-gray-300 dark:bg-gray-600 dark:border-gray-600";
      default:
        return "bg-blue-500 border-blue-500";
    }
  };

  const getIcon = (event: TimelineEvent) => {
    if (event.icon === "calendar") return <Calendar className="w-4 h-4" />;
    if (event.icon === "circle") return <Circle className="w-4 h-4" />;
    return null;
  };

  if (orientation === "horizontal") {
    return (
      <div className="my-6">
        <h3 className="text-2xl font-bold mb-6">{title}</h3>
        <div className="relative">
          {/* Connection line */}
          <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700"></div>

          <div className="flex justify-between relative">
            {events.map((event, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center px-2">
                {/* Dot */}
                <div className="relative flex flex-col items-center">
                  <div className={`w-4 h-4 rounded-full border-2 ${getStatusColor(event.status)} mb-2 z-10 bg-white dark:bg-gray-900`}>
                    <div className="flex items-center justify-center w-full h-full">
                      {getIcon(event)}
                    </div>
                  </div>
                </div>
                {/* Content */}
                <div className="text-center mt-2 min-w-[100px]">
                  <div className="font-semibold text-sm">{event.title}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{event.date}</div>
                  <div className="text-xs mt-1 text-gray-600 dark:text-gray-300">{event.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Vertical layout
  return (
    <div className="my-6">
      <h3 className="text-2xl font-bold mb-4">{title}</h3>
      <div className="relative">
        {/* Connection line */}
        <div className="absolute left-4 top-4 bottom-4 w-1 bg-gray-200 dark:bg-gray-700"></div>

        <div className="space-y-0">
          {events.map((event, idx) => (
            <div key={idx} className="relative flex items-start py-4">
              {/* Dot */}
              <div className="relative flex items-center justify-center w-8 h-8">
                <div className={`absolute w-4 h-4 rounded-full border-2 ${getStatusColor(event.status)} bg-white dark:bg-gray-900`}></div>
              </div>

              {/* Content */}
              <div className="ml-6 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-lg">{event.title}</span>
                  {event.icon && (
                    <span className="inline-flex items-center justify-center w-5 h-5 bg-gray-100 dark:bg-gray-800 rounded-full text-xs">
                      {getIcon(event)}
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">{event.date}</div>
                <div className="text-gray-700 dark:text-gray-300">{event.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}