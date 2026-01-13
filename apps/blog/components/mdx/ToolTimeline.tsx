import React from "react";
import { motion } from "framer-motion";

interface TimelineEvent {
  date: string;
  title: string;
  description: string;
  status?: "completed" | "current" | "upcoming";
  icon?: string;
}

interface ToolTimelineProps {
  events: TimelineEvent[];
  title?: string;
}

/**
 * Vertical timeline component for events
 */
export const ToolTimeline: React.FC<ToolTimelineProps> = ({
  events,
  title = "Timeline",
}) => {
  const getStatusColors = (status: string) => {
    switch (status) {
      case "completed":
        return "border-green-500 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300";
      case "current":
        return "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300";
      case "upcoming":
        return "border-gray-400 bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400";
      default:
        return "border-gray-300 bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300";
    }
  };

  const getStatusIcon = (status: string, defaultIcon: string) => {
    switch (status) {
      case "completed":
        return "✅";
      case "current":
        return "🚀";
      case "upcoming":
        return "📅";
      default:
        return defaultIcon || "📌";
    }
  };

  return (
    <div className="my-8">
      {title && (
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          {title}
        </h3>
      )}
      <div className="relative border-l-2 border-gray-300 dark:border-gray-700 ml-3 space-y-6">
        {events.map((event, index) => {
          const statusClass = getStatusColors(event.status || "current");
          const icon = getStatusIcon(event.status || "current", event.icon || "📌");

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="relative pl-6"
            >
              {/* Timeline dot */}
              <div
                className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 ${statusClass.split(' ')[0].replace('border-', 'bg-')}`}
                style={{ backgroundColor: "currentColor" }}
              ></div>

              {/* Event card */}
              <div
                className={`rounded-lg border-2 p-4 ${statusClass}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{icon}</span>
                      <h4 className="font-semibold text-sm sm:text-base">
                        {event.title}
                      </h4>
                    </div>
                    <p className="text-sm sm:text-base opacity-90">
                      {event.description}
                    </p>
                  </div>
                  <time className="text-xs font-mono opacity-75 ml-3 whitespace-nowrap">
                    {event.date}
                  </time>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

// Example usage component
export const ToolTimelineExample: React.FC = () => {
  const sampleEvents: TimelineEvent[] = [
    {
      date: "2020-03",
      title: "Project Started",
      description: "Initial development and research phase began",
      status: "completed",
    },
    {
      date: "2020-08",
      title: "MVP Release",
      description: "First version shipped to early users",
      status: "completed",
    },
    {
      date: "2021-02",
      title: "Public Launch",
      description: "Full public release with marketing campaign",
      status: "current",
    },
    {
      date: "2021-06",
      title: "Mobile App",
      description: "iOS and Android applications planned",
      status: "upcoming",
    },
    {
      date: "2021-12",
      title: "Enterprise Features",
      description: "Advanced features for enterprise customers",
      status: "upcoming",
    },
  ];

  return <ToolTimeline events={sampleEvents} title="Product Development Timeline" />;
};