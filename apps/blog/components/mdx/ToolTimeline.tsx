import { motion } from "framer-motion";
import { Circle, CheckCircle2, Clock, AlertCircle } from "lucide-react";

interface TimelineItem {
  title: string;
  description: string;
  date?: string;
  status: "completed" | "in-progress" | "planned" | "delayed";
}

interface ToolTimelineProps {
  items: TimelineItem[];
  orientation?: "horizontal" | "vertical";
  title?: string;
}

export function ToolTimeline({
  items,
  orientation = "vertical",
  title = "Tool Timeline",
}: ToolTimelineProps) {
  const getStatusConfig = (status: string) => {
    const configs = {
      "completed": { color: "text-green-500", icon: <CheckCircle2 size={20} />, bg: "bg-green-100 dark:bg-green-900/30" },
      "in-progress": { color: "text-blue-500", icon: <Clock size={20} />, bg: "bg-blue-100 dark:bg-blue-900/30" },
      "planned": { color: "text-gray-500", icon: <Circle size={20} />, bg: "bg-gray-100 dark:bg-gray-800" },
      "delayed": { color: "text-orange-500", icon: <AlertCircle size={20} />, bg: "bg-orange-100 dark:bg-orange-900/30" },
    };
    return configs[status as keyof typeof configs] || configs.planned;
  };

  if (orientation === "horizontal") {
    return (
      <div className="my-6">
        {title && <h3 className="text-lg font-semibold mb-4 text-center">{title}</h3>}
        <div className="flex flex-col md:flex-row gap-4">
          {items.map((item, index) => {
            const config = getStatusConfig(item.status);
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`flex-1 p-4 rounded-lg border-2 ${config.bg} ${config.color} border-current/20`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {config.icon}
                  <span className="font-semibold uppercase text-sm">
                    {item.status.replace("-", " ")}
                  </span>
                </div>
                <h4 className="font-bold text-lg mb-1">{item.title}</h4>
                <p className="text-sm opacity-80 mb-2">{item.description}</p>
                {item.date && (
                  <span className="text-xs opacity-60">{item.date}</span>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  }

  // Vertical orientation
  return (
    <div className="my-6">
      {title && <h3 className="text-lg font-semibold mb-4 text-center">{title}</h3>}
      <div className="relative pl-8">
        {/* Vertical line */}
        <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gradient-to-b from-gray-300 to-gray-200 dark:from-gray-700 dark:to-gray-600" />

        {items.map((item, index) => {
          const config = getStatusConfig(item.status);
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative mb-6"
            >
              {/* Timeline dot */}
              <div className={`absolute -left-10 w-6 h-6 rounded-full ${config.bg} flex items-center justify-center ${config.color}`}>
                {config.icon}
              </div>

              {/* Content */}
              <div className={`p-4 rounded-lg border ${config.bg} border-current/20`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-lg">{item.title}</h4>
                  <span className="text-xs opacity-70">{item.date}</span>
                </div>
                <p className="text-sm opacity-90">{item.description}</p>
                <span className="inline-block mt-2 text-xs font-semibold uppercase opacity-70">
                  {item.status.replace("-", " ")}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}