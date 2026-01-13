import { Circle, CheckCircle, Clock, AlertCircle } from "lucide-react";

interface TimelineItem {
  time: string;
  title: string;
  description: string;
  status: "completed" | "in-progress" | "pending" | "blocked";
}

interface ToolTimelineProps {
  items: TimelineItem[];
  orientation?: "horizontal" | "vertical";
  title?: string;
}

export function ToolTimeline({ items, orientation = "vertical", title = "Timeline" }: ToolTimelineProps) {
  const getStatusIcon = (status: TimelineItem["status"]) => {
    const className = "w-4 h-4";
    switch (status) {
      case "completed":
        return <CheckCircle className={`${className} text-green-500`} />;
      case "in-progress":
        return <Clock className={`${className} text-blue-500 animate-pulse`} />;
      case "pending":
        return <Circle className={`${className} text-gray-400`} />;
      case "blocked":
        return <AlertCircle className={`${className} text-red-500`} />;
    }
  };

  const getStatusColor = (status: TimelineItem["status"]) => {
    switch (status) {
      case "completed":
        return "border-l-2 border-l-green-500";
      case "in-progress":
        return "border-l-2 border-l-blue-500";
      case "pending":
        return "border-l-2 border-l-gray-400";
      case "blocked":
        return "border-l-2 border-l-red-500";
    }
  };

  if (orientation === "horizontal") {
    return (
      <div className="my-6">
        {title && <h3 className="text-2xl font-bold mb-4">{title}</h3>}
        <div className="flex flex-wrap gap-4">
          {items.map((item, idx) => (
            <div
              key={idx}
              className={`flex-1 min-w-[200px] p-4 border rounded-lg ${getStatusColor(item.status)} bg-muted/20`}
            >
              <div className="flex items-center gap-2 mb-2">
                {getStatusIcon(item.status)}
                <span className="text-sm font-medium text-muted-foreground">{item.time}</span>
              </div>
              <h4 className="font-semibold mb-1">{item.title}</h4>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="my-6">
      {title && <h3 className="text-2xl font-bold mb-4">{title}</h3>}
      <div className="space-y-4">
        {items.map((item, idx) => (
          <div key={idx} className={`flex items-start gap-4 p-4 bg-muted/20 rounded-lg ${getStatusColor(item.status)}`}>
            <div className="flex flex-col items-center mt-1">
              {getStatusIcon(item.status)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold">{item.time}</span>
                <span className={`text-xs px-2 py-0.5 rounded ${
                  item.status === "completed" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" :
                  item.status === "in-progress" ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100" :
                  item.status === "pending" ? "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100" :
                  "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                }`}>
                  {item.status.toUpperCase()}
                </span>
              </div>
              <h4 className="font-semibold">{item.title}</h4>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}