"use client";

import { useState } from "react";
import { CheckCircle, Circle, XCircle, Clock } from "lucide-react";

interface TimelineItem {
  date: string;
  title: string;
  description: string;
  status: "completed" | "in-progress" | "planned" | "cancelled";
  category?: string;
}

interface ToolTimelineProps {
  items: TimelineItem[];
  orientation?: "horizontal" | "vertical";
}

const statusConfig = {
  completed: {
    icon: CheckCircle,
    color: "text-green-500",
    bg: "bg-green-100 dark:bg-green-900/20",
    border: "border-green-500",
  },
  "in-progress": {
    icon: Clock,
    color: "text-blue-500",
    bg: "bg-blue-100 dark:bg-blue-900/20",
    border: "border-blue-500",
  },
  planned: {
    icon: Circle,
    color: "text-gray-500",
    bg: "bg-gray-100 dark:bg-gray-800/50",
    border: "border-gray-400",
  },
  cancelled: {
    icon: XCircle,
    color: "text-red-500",
    bg: "bg-red-100 dark:bg-red-900/20",
    border: "border-red-500",
  },
};

export function ToolTimeline({ items, orientation = "vertical" }: ToolTimelineProps) {
  const [filter, setFilter] = useState<string>("all");

  const categories = ["all", ...Array.from(new Set(items.map((item) => item.category || "uncategorized")))] as string[];

  const filteredItems =
    filter === "all"
      ? items
      : items.filter((item) => (item.category || "uncategorized") === filter);

  if (orientation === "horizontal") {
    return (
      <div className="my-6">
        <div className="flex gap-2 mb-4 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1 text-xs rounded-full border transition-all ${
                filter === cat
                  ? "bg-blue-500 text-white border-blue-600"
                  : "bg-transparent border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex overflow-x-auto gap-4 pb-4">
          {filteredItems.map((item, idx) => {
            const config = statusConfig[item.status];
            const Icon = config.icon;

            return (
              <div
                key={idx}
                className={`min-w-[200px] border-l-4 ${config.border} p-3 ${config.bg} flex flex-col gap-2`}
              >
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${config.color}`} />
                  <span className="text-xs font-mono text-gray-500">{item.date}</span>
                </div>
                <div>
                  <div className="font-semibold text-sm">{item.title}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">{item.description}</div>
                </div>
                {item.category && (
                  <span className="text-[10px] px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded self-start">
                    {item.category}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Vertical layout
  return (
    <div className="my-6">
      <div className="flex gap-2 mb-4 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1 text-xs rounded-full border transition-all ${
              filter === cat
                ? "bg-blue-500 text-white border-blue-600"
                : "bg-transparent border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="relative border-l-2 border-gray-300 dark:border-gray-700 ml-3 space-y-4">
        {filteredItems.map((item, idx) => {
          const config = statusConfig[item.status];
          const Icon = config.icon;

          return (
            <div key={idx} className="relative pl-6">
              <div
                className={`absolute -left-[9px] top-1 w-4 h-4 ${config.bg} rounded-full flex items-center justify-center border-2 ${config.border}`}
              >
                <Icon className={`w-2.5 h-2.5 ${config.color}`} />
              </div>

              <div className={`p-3 rounded-lg ${config.bg} border-l-2 ${config.border}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold">{item.title}</span>
                  <span className="text-xs font-mono text-gray-500">{item.date}</span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {item.description}
                </div>
                {item.category && (
                  <span className="text-[10px] px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">
                    {item.category}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}