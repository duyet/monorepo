"use client";

import { useState } from "react";
import { Calendar, ExternalLink, ArrowRight } from "lucide-react";
import { cn } from "@duyet/libs/utils";

export interface TimelineEvent {
  date: string;
  title: string;
  description: string;
  version?: string;
  link?: string;
  type?: "release" | "feature" | "bugfix" | "announcement";
}

export interface ToolTimelineProps {
  events: TimelineEvent[];
  orientation?: "horizontal" | "vertical";
  className?: string;
}

const getEventTypeColor = (type: string = "release") => {
  const colorMap: Record<string, string> = {
    release: "bg-blue-500 text-white",
    feature: "bg-green-500 text-white",
    bugfix: "bg-red-500 text-white",
    announcement: "bg-purple-500 text-white",
  };
  return colorMap[type] || "bg-gray-500 text-white";
};

const getEventTypeLabel = (type: string = "release") => {
  const labelMap: Record<string, string> = {
    release: "Release",
    feature: "Feature",
    bugfix: "Bug Fix",
    announcement: "Announcement",
  };
  return labelMap[type] || "Release";
};

export function ToolTimeline({ events, orientation = "vertical", className }: ToolTimelineProps) {
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(events[0]);

  return (
    <div className={cn("w-full max-w-5xl mx-auto", className)}>
      <h2 className="text-2xl font-bold mb-6">Tool Timeline</h2>

      {/* Event Selector */}
      <div className="mb-6 flex flex-wrap gap-2">
        {events.map((event, index) => (
          <button
            key={index}
            onClick={() => setSelectedEvent(event)}
            className={cn(
              "px-4 py-2 rounded-lg border transition-all duration-200 text-left",
              selectedEvent?.date === event.date
                ? "bg-blue-100 border-blue-500 text-blue-900"
                : "bg-white border-gray-200 hover:bg-gray-50"
            )}
          >
            <div className="font-medium">{event.title}</div>
            <div className="text-sm text-gray-500">{event.date}</div>
          </button>
        ))}
      </div>

      {/* Timeline */}
      {orientation === "vertical" ? (
        <div className="space-y-8">
          {events.map((event, index) => (
            <div
              key={index}
              className="relative flex items-start gap-4"
              onClick={() => setSelectedEvent(event)}
            >
              {/* Timeline dot */}
              <div className="flex-shrink-0">
                <div
                  className={cn(
                    "w-4 h-4 rounded-full border-4 border-white shadow-md",
                    getEventTypeColor(event.type)
                  )}
                />
                {index < events.length - 1 && (
                  <div className="absolute top-6 left-2 w-0.5 h-16 bg-gray-300" />
                )}
              </div>

              {/* Event card */}
              <div
                className={cn(
                  "flex-1 bg-white rounded-lg border shadow-sm p-6 cursor-pointer transition-all duration-200",
                  selectedEvent?.date === event.date
                    ? "border-blue-500 shadow-md"
                    : "border-gray-200 hover:border-blue-300"
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={cn("px-2 py-1 rounded text-xs font-medium", getEventTypeColor(event.type))}>
                      {getEventTypeLabel(event.type)}
                    </span>
                    {event.version && (
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">
                        v{event.version}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    {event.date}
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2">{event.title}</h3>
                <p className="text-gray-600 mb-3">{event.description}</p>
                {event.link && (
                  <a
                    href={event.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Learn more
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Horizontal Timeline */
        <div className="overflow-x-auto">
          <div className="flex gap-8 pb-8" style={{ minWidth: "max-content" }}>
            {events.map((event, index) => (
              <div key={index} className="flex-shrink-0 w-80">
                <div
                  className={cn(
                    "bg-white rounded-lg border shadow-sm p-6 cursor-pointer transition-all duration-200",
                    selectedEvent?.date === event.date
                      ? "border-blue-500 shadow-md"
                      : "border-gray-200 hover:border-blue-300"
                  )}
                  onClick={() => setSelectedEvent(event)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={cn("px-2 py-1 rounded text-xs font-medium", getEventTypeColor(event.type))}>
                      {getEventTypeLabel(event.type)}
                    </span>
                    {event.version && (
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">
                        v{event.version}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{event.title}</h3>
                  <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
                    <Calendar className="w-4 h-4" />
                    {event.date}
                  </div>
                  <p className="text-gray-600 mb-3">{event.description}</p>
                  {event.link && (
                    <a
                      href={event.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Learn more
                    </a>
                  )}
                </div>
                {index < events.length - 1 && (
                  <div className="flex items-center justify-center my-4">
                    <ArrowRight className="w-6 h-6 text-gray-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected Event Details */}
      {selectedEvent && (
        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <span className={cn("px-3 py-1 rounded text-sm font-medium", getEventTypeColor(selectedEvent.type))}>
                {getEventTypeLabel(selectedEvent.type)}
              </span>
              {selectedEvent.version && (
                <span className="ml-2 px-3 py-1 bg-gray-100 rounded text-sm font-medium">
                  v{selectedEvent.version}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              {selectedEvent.date}
            </div>
          </div>
          <h3 className="text-xl font-bold mb-3">{selectedEvent.title}</h3>
          <p className="text-gray-600 mb-4">{selectedEvent.description}</p>
          {selectedEvent.link && (
            <a
              href={selectedEvent.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Visit documentation
            </a>
          )}
        </div>
      )}
    </div>
  );
}