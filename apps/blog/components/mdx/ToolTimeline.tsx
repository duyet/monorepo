"use client";

import { useState } from "react";
import { ChevronRight, ChevronLeft, Calendar, ExternalLink } from "lucide-react";
import { cn } from "@duyet/libs/utils";

interface TimelineEvent {
  date: string;
  title: string;
  description: string;
  link?: string;
}

interface ToolTimelineProps {
  events: TimelineEvent[];
  orientation?: "horizontal" | "vertical";
}

export function ToolTimeline({ events, orientation = "vertical" }: ToolTimelineProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextEvent = () => {
    setCurrentIndex((prev) => (prev + 1) % events.length);
  };

  const prevEvent = () => {
    setCurrentIndex((prev) => (prev - 1 + events.length) % events.length);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (orientation === "horizontal") {
    return (
      <div className="my-8">
        <div className="relative">
          <div className="absolute inset-y-0 left-1/2 transform -translate-x-1/2 w-0.5 bg-gray-300"></div>

          {events.map((event, index) => (
            <div
              key={index}
              className={cn(
                "relative mb-8",
                index % 2 === 0 ? "pr-8 text-right" : "pl-8 text-left"
              )}
            >
              <div className="absolute inset-y-0 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-500 rounded-full border-4 border-white shadow-lg"></div>

              <div className={cn(
                "bg-white rounded-lg shadow-md p-6 max-w-md",
                index % 2 === 0 ? "mr-auto" : "ml-auto"
              )}>
                <div className="flex items-center justify-between mb-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <time className="text-sm text-gray-600">{formatDate(event.date)}</time>
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
                    <ExternalLink className="h-3 w-3" />
                    Learn more
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="my-8">
      <div className="max-w-2xl mx-auto">
        <div className="relative">
          <div className="space-y-8">
            {events.map((event, index) => (
              <div key={index} className="relative">
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-300"></div>

                <div className="flex gap-8">
                  <div className="flex-shrink-0 w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-lg">
                    {index + 1}
                  </div>

                  <div className="flex-1 bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between mb-2">
                      <time className="text-sm text-gray-600 flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(event.date)}
                      </time>
                      {event.link && (
                        <a
                          href={event.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{event.title}</h3>
                    <p className="text-gray-600">{event.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {events.length > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={prevEvent}
            disabled={currentIndex === 0}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg border",
              currentIndex === 0
                ? "text-gray-400 border-gray-300 cursor-not-allowed"
                : "text-gray-700 border-gray-300 hover:bg-gray-50"
            )}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>

          <div className="flex items-center gap-2">
            {events.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  "w-2 h-2 rounded-full",
                  index === currentIndex ? "bg-blue-500" : "bg-gray-300"
                )}
              />
            ))}
          </div>

          <button
            onClick={nextEvent}
            disabled={currentIndex === events.length - 1}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg border",
              currentIndex === events.length - 1
                ? "text-gray-400 border-gray-300 cursor-not-allowed"
                : "text-gray-700 border-gray-300 hover:bg-gray-50"
            )}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}