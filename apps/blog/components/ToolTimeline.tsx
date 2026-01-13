"use client";

import { useState } from "react";
import { CheckCircle, XCircle, Clock, Info } from "lucide-react";

interface TimelineItem {
  id: string;
  title: string;
  description: string;
  status: "completed" | "in-progress" | "planned" | "failed";
  date?: string;
  details?: string;
}

interface ToolTimelineProps {
  items: TimelineItem[];
  className?: string;
  orientation?: "horizontal" | "vertical";
  title?: string;
}

export function ToolTimeline({ items, className, orientation = "vertical", title }: ToolTimelineProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getStatusIcon = (status: TimelineItem["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "in-progress":
        return <Clock className="h-5 w-5 text-blue-500" />;
      case "planned":
        return <Info className="h-5 w-5 text-gray-400" />;
      case "failed":
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusColor = (status: TimelineItem["status"]) => {
    switch (status) {
      case "completed":
        return "border-green-500 bg-green-50";
      case "in-progress":
        return "border-blue-500 bg-blue-50";
      case "planned":
        return "border-gray-300 bg-gray-50";
      case "failed":
        return "border-red-500 bg-red-50";
    }
  };

  const getStatusText = (status: TimelineItem["status"]) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "in-progress":
        return "In Progress";
      case "planned":
        return "Planned";
      case "failed":
        return "Failed";
    }
  };

  if (orientation === "horizontal") {
    return (
      <div className={className}>
        {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
        <div className="flex overflow-x-auto pb-4 space-x-8">
          {items.map((item, index) => (
            <div key={item.id} className="flex-shrink-0 w-64">
              <div
                className={`relative p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                  expandedId === item.id ? "ring-2 ring-blue-500" : ""
                } ${getStatusColor(item.status)}`}
                onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    {getStatusIcon(item.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold truncate">{item.title}</h4>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {item.description}
                    </p>
                    {item.date && (
                      <p className="text-xs text-gray-500 mt-2">{item.date}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${
                          status === "completed"
                            ? "bg-green-100 text-green-700"
                            : status === "in-progress"
                            ? "bg-blue-100 text-blue-700"
                            : status === "planned"
                            ? "bg-gray-100 text-gray-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {getStatusText(item.status)}
                      </span>
                    </div>
                  </div>
                </div>
                {expandedId === item.id && item.details && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-gray-700">{item.details}</p>
                  </div>
                )}
              </div>
              {index < items.length - 1 && (
                <div className="flex-1 flex items-center justify-center text-gray-400">
                  <div className="h-0.5 w-full bg-gray-300" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex gap-4 cursor-pointer group"
            onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
          >
            <div className="flex-shrink-0">
              <div className={`p-3 rounded-full border ${getStatusColor(item.status)}`}>
                {getStatusIcon(item.status)}
              </div>
              {items.indexOf(item) < items.length - 1 && (
                <div className="h-full w-0.5 bg-gray-200 ml-1.5" />
              )}
            </div>
            <div className="flex-1 pb-4">
              <div className={`p-4 rounded-lg border transition-all ${
                expandedId === item.id ? "ring-2 ring-blue-500" : ""
              } ${getStatusColor(item.status)}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold">{item.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                    {item.date && (
                      <p className="text-xs text-gray-500 mt-2">{item.date}</p>
                    )}
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      status === "completed"
                        ? "bg-green-100 text-green-700"
                        : status === "in-progress"
                        ? "bg-blue-100 text-blue-700"
                        : status === "planned"
                        ? "bg-gray-100 text-gray-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {getStatusText(item.status)}
                  </span>
                </div>
                {expandedId === item.id && item.details && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-gray-700">{item.details}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}