"use client";

import {
  useState,
  useRef,
  useCallback,
  useEffect,
  type KeyboardEvent,
} from "react";
import { cn } from "@duyet/libs/utils";
import type { ToolTimelineProps, TimelineEvent } from "./types";

// Warm color status indicators
const STATUS_COLORS = {
  adopted: { bg: "bg-amber-600", text: "text-amber-700" },
  active: { bg: "bg-amber-500", text: "text-amber-600" },
  testing: { bg: "bg-amber-400", text: "text-amber-500" },
  deprecated: { bg: "bg-amber-300", text: "text-amber-400" },
} as const;

export function ToolTimeline({
  events,
  className,
  onEventExpand,
  onEventCollapse,
}: ToolTimelineProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Detect mobile breakpoint
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Sort events by date
  const sortedEvents = [...events].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateA - dateB;
  });

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
      const event = sortedEvents[index];
      if (!event) return;

      switch (e.key) {
        case "ArrowLeft":
        case "ArrowUp":
          e.preventDefault();
          if (index > 0) {
            setFocusedIndex(index - 1);
            document
              .querySelector<HTMLButtonElement>(
                `[data-timeline-index="${index - 1}"]`
              )
              ?.focus();
          }
          break;

        case "ArrowRight":
        case "ArrowDown":
          e.preventDefault();
          if (index < sortedEvents.length - 1) {
            setFocusedIndex(index + 1);
            document
              .querySelector<HTMLButtonElement>(
                `[data-timeline-index="${index + 1}"]`
              )
              ?.focus();
          }
          break;

        case "Enter":
        case " ":
          e.preventDefault();
          if (expandedId === event.id) {
            setExpandedId(null);
            onEventCollapse?.(event);
          } else {
            setExpandedId(event.id);
            onEventExpand?.(event);
          }
          break;

        case "Escape":
          e.preventDefault();
          if (expandedId) {
            const expanded = sortedEvents.find((ev) => ev.id === expandedId);
            if (expanded) {
              onEventCollapse?.(expanded);
            }
            setExpandedId(null);
          }
          break;

        default:
          break;
      }
    },
    [sortedEvents, expandedId, onEventExpand, onEventCollapse]
  );

  // Toggle expanded state
  const toggleExpanded = (eventId: string) => {
    const event = sortedEvents.find((e) => e.id === eventId);
    if (!event) return;

    if (expandedId === eventId) {
      setExpandedId(null);
      onEventCollapse?.(event);
    } else {
      setExpandedId(eventId);
      onEventExpand?.(event);
    }
  };

  if (sortedEvents.length === 0) {
    return (
      <div className={cn("py-4 text-center", className)}>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          No events to display
        </p>
      </div>
    );
  }

  const formatDate = (dateInput: string | Date) => {
    const date = new Date(dateInput);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });
  };

  // Desktop horizontal timeline layout
  if (!isMobile) {
    return (
      <div className={cn("w-full overflow-hidden", className)}>
        <div
          ref={timelineRef}
          className="relative overflow-x-auto pb-6 pt-4 px-2"
          role="region"
          aria-label="Tool adoption timeline"
        >
          {/* Timeline Track */}
          <div className="relative min-w-max">
            {/* Horizontal Line */}
            <div
              className="absolute top-5 left-0 right-0 h-px bg-amber-200 dark:bg-amber-800"
              aria-hidden="true"
            />

            {/* Events */}
            <div className="relative flex gap-3 pb-4">
              {sortedEvents.map((event, index) => {
                const isExpanded = expandedId === event.id;
                const colors = STATUS_COLORS[event.status];

                return (
                  <div key={event.id} className="flex flex-col items-center">
                    {/* Dot Button - Compact */}
                    <button
                      ref={(el) => {
                        if (focusedIndex === index) {
                          el?.focus();
                        }
                      }}
                      data-timeline-index={index}
                      onClick={() => toggleExpanded(event.id)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      className={cn(
                        "relative z-10 mb-3 flex h-6 w-6 items-center justify-center rounded-full",
                        "transition-all duration-200 outline-none",
                        "ring-1 ring-gray-300 dark:ring-gray-700",
                        "hover:ring-2 focus:ring-2",
                        colors.bg
                      )}
                      aria-expanded={isExpanded}
                      aria-label={`${event.name} - ${formatDate(event.date)} - ${event.status}`}
                      title={`${event.name} (${event.status})`}
                    >
                      <div className={cn("h-2 w-2 rounded-full", colors.bg)} />
                    </button>

                    {/* Event Info Below Timeline */}
                    <div className="text-center min-w-max">
                      <p className="font-medium text-xs text-gray-900 dark:text-white">
                        {event.name}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {formatDate(event.date)}
                      </p>

                      {/* Status Badge - Minimal */}
                      <span
                        className={cn(
                          "mt-0.5 inline-block px-1.5 py-0.5 rounded text-xs",
                          colors.text
                        )}
                      >
                        {event.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Expanded Details */}
        {expandedId && (
          <ExpandedEventDetails
            event={sortedEvents.find((e) => e.id === expandedId)!}
            onClose={() => setExpandedId(null)}
          />
        )}
      </div>
    );
  }

  // Mobile vertical timeline layout - compact
  return (
    <div
      className={cn("w-full", className)}
      role="region"
      aria-label="Tool adoption timeline"
    >
      <div className="relative px-3 py-4">
        {/* Vertical Line */}
        <div
          className="absolute left-5 top-0 bottom-0 w-px bg-amber-200 dark:bg-amber-800"
          aria-hidden="true"
        />

        {/* Events */}
        <div className="space-y-4">
          {sortedEvents.map((event, index) => {
            const isExpanded = expandedId === event.id;
            const colors = STATUS_COLORS[event.status];

            return (
              <div key={event.id} className="relative pl-12">
                {/* Dot - Compact */}
                <button
                  data-timeline-index={index}
                  onClick={() => toggleExpanded(event.id)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className={cn(
                    "absolute -left-2 top-1 z-10 flex h-5 w-5 items-center justify-center rounded-full",
                    "transition-all duration-200 outline-none",
                    "ring-1 ring-gray-300 dark:ring-gray-700",
                    "active:ring-2 focus:ring-2",
                    colors.bg
                  )}
                  aria-expanded={isExpanded}
                  aria-label={`${event.name} - ${formatDate(event.date)} - ${event.status}`}
                  title={`${event.name} (${event.status})`}
                >
                  <div className={cn("h-1.5 w-1.5 rounded-full", colors.bg)} />
                </button>

                {/* Event Card - Compact */}
                <div
                  className={cn(
                    "rounded border transition-all duration-200",
                    "border-amber-200 dark:border-amber-900/30",
                    isExpanded
                      ? "bg-white dark:bg-gray-950 shadow-sm"
                      : "bg-amber-50/30 dark:bg-amber-950/10"
                  )}
                >
                  <button
                    onClick={() => toggleExpanded(event.id)}
                    className="w-full p-2 text-left hover:bg-amber-100/30 dark:hover:bg-amber-900/20 transition-colors rounded"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm text-gray-900 dark:text-white">
                          {event.name}
                        </h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {formatDate(event.date)}
                        </p>
                      </div>

                      {/* Status Badge */}
                      <span className={cn("px-1.5 py-0.5 rounded text-xs font-medium whitespace-nowrap", colors.text)}>
                        {event.status}
                      </span>
                    </div>
                  </button>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="border-t border-amber-200 dark:border-amber-900/30 px-2 py-2 space-y-2">
                      <p className="text-xs text-gray-700 dark:text-gray-300">
                        {event.details}
                      </p>

                      {event.reason && (
                        <div className="bg-amber-100/30 dark:bg-amber-900/20 rounded p-2">
                          <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-0.5">
                            Key Moment
                          </p>
                          <p className="text-xs text-gray-700 dark:text-gray-300">
                            {event.reason}
                          </p>
                        </div>
                      )}

                      <button
                        onClick={() => setExpandedId(null)}
                        className="w-full mt-1 px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-amber-100/30 dark:hover:bg-amber-900/20 rounded transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

interface ExpandedEventDetailsProps {
  event: TimelineEvent;
  onClose: () => void;
}

function ExpandedEventDetails({ event, onClose }: ExpandedEventDetailsProps) {
  const colors = STATUS_COLORS[event.status];

  return (
    <div className="bg-amber-50/30 dark:bg-amber-950/10 border-t border-amber-200 dark:border-amber-900/30 px-3 py-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {event.name}
              </h2>
              <span className={cn("px-2 py-0.5 rounded text-xs font-semibold", colors.text)}>
                {event.status}
              </span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {new Date(event.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-amber-600 hover:text-amber-700 dark:hover:text-amber-400 transition-colors p-1"
            aria-label="Close details"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-2">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
              Details
            </h3>
            <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
              {event.details}
            </p>
          </div>

          {event.reason && (
            <div className="bg-white dark:bg-gray-800 rounded p-2 border-l-2 border-amber-400 dark:border-amber-600">
              <h3 className="font-semibold text-xs text-gray-900 dark:text-white mb-0.5">
                Key Moment
              </h3>
              <p className="text-xs text-gray-700 dark:text-gray-300">
                {event.reason}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
