import { ReactNode } from "react";
import { Circle, CheckCircle2, XCircle, Clock } from "lucide-react";

type TimelineStatus = "completed" | "in-progress" | "pending" | "failed";
type TimelineDirection = "vertical" | "horizontal";

interface TimelineItem {
  title: string;
  date?: string;
  description?: string;
  status: TimelineStatus;
  icon?: ReactNode;
}

interface ToolTimelineProps {
  items: TimelineItem[];
  direction?: TimelineDirection;
}

const StatusIcon = ({ status }: { status: TimelineStatus }) => {
  switch (status) {
    case "completed":
      return <CheckCircle2 className="text-green-500" size={20} />;
    case "in-progress":
      return <Clock className="text-blue-500" size={20} />;
    case "pending":
      return <Circle className="text-gray-400" size={20} />;
    case "failed":
      return <XCircle className="text-red-500" size={20} />;
  }
};

const getBorderColor = (status: TimelineStatus) => {
  switch (status) {
    case "completed":
      return "border-green-500";
    case "in-progress":
      return "border-blue-500";
    case "pending":
      return "border-gray-400";
    case "failed":
      return "border-red-500";
  }
};

export function ToolTimeline({ items, direction = "vertical" }: ToolTimelineProps) {
  if (direction === "horizontal") {
    return (
      <div className="my-6 overflow-x-auto">
        <div className="flex items-center space-x-4 min-w-max pb-4">
          {items.map((item, index) => (
            <div key={index} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center ${getBorderColor(item.status)}`}>
                  <StatusIcon status={item.status} />
                </div>
                <div className="mt-2 text-center">
                  <div className="font-semibold text-sm">{item.title}</div>
                  {item.date && <div className="text-xs text-gray-500">{item.date}</div>}
                </div>
              </div>
              {index < items.length - 1 && (
                <div className={`w-16 h-0.5 ${getBorderColor(items[index + 1].status)}`}></div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Vertical timeline
  return (
    <div className="my-6">
      <div className="relative border-l-2 border-gray-300 dark:border-gray-700 ml-4 space-y-8">
        {items.map((item, index) => (
          <div key={index} className="relative pl-8">
            {/* Timeline dot */}
            <div className={`absolute -left-[9px] top-0 flex items-center justify-center w-6 h-6 rounded-full border-2 bg-white dark:bg-gray-900 ${getBorderColor(item.status)}`}>
              <StatusIcon status={item.status} />
            </div>

            {/* Content */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="font-semibold text-lg">{item.title}</div>
                  {item.date && (
                    <div className="text-sm text-gray-500 mt-1">{item.date}</div>
                  )}
                  {item.description && (
                    <div className="text-sm mt-2 text-gray-700 dark:text-gray-300">
                      {item.description}
                    </div>
                  )}
                </div>
                <div className="ml-4">
                  <span className={`px-2 py-1 text-xs rounded ${getBadgeClass(item.status)}`}>
                    {item.status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function getBadgeClass(status: TimelineStatus) {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "in-progress":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case "pending":
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    case "failed":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
  }
}