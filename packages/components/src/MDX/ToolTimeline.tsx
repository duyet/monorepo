"use client";

import React, { useState } from "react";
import { Calendar, ChevronRight, ChevronDown } from "lucide-react";

interface TimelineEvent {
  date: string;
  title: string;
  description: string;
  type: "release" | "update" | "deprecation" | "milestone";
  version?: string;
  tags?: string[];
}

interface ToolTimelineProps {
  events: TimelineEvent[];
  title?: string;
}

/**
 * ToolTimeline - Interactive timeline of events
 * Features: Filter by event type, expandable cards, time range selection
 */
export default function ToolTimeline({ events, title = "Development Timeline" }: ToolTimelineProps) {
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<"all" | TimelineEvent["type"]>("all");

  const types = ["all", "release", "update", "deprecation", "milestone"] as const;

  const filteredEvents = events.filter((event) =>
    selectedType === "all" ? true : event.type === selectedType
  );

  // Sort by date (most recent first)
  const sortedEvents = [...filteredEvents].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const toggleExpand = (dateTitle: string) => {
    setExpandedEvent(expandedEvent === dateTitle ? null : dateTitle);
  };

  const getTypeColor = (type: TimelineEvent["type"]) => {
    switch (type) {
      case "release":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "update":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "deprecation":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "milestone":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
    }
  };

  return (
    <div className="my-8 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-900">
      <div className="p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{title}</h3>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Filter:</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as any)}
              className="px-3 py-1 rounded text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
            >
              {types.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-96 overflow-y-auto">
        {sortedEvents.map((event, index) => {
          const key = `${event.date}-${event.title}-${index}`;
          const isExpanded = expandedEvent === key;

          return (
            <div key={key} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  <Calendar className="text-gray-400 dark:text-gray-500" size={16} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                          {event.date}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getTypeColor(event.type)}`}>
                          {event.type}
                        </span>
                        {event.version && (
                          <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded">
                            v{event.version}
                          </span>
                        )}
                      </div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mt-1 text-base">
                        {event.title}
                      </h4>
                    </div>
                    <button
                      onClick={() => toggleExpand(key)}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="mt-3 space-y-3">
                      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                        {event.description}
                      </p>

                      {event.tags && event.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {event.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-1 rounded"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 text-center">
        {sortedEvents.length} events shown
      </div>
    </div>
  );
}