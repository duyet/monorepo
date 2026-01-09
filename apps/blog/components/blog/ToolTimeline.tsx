"use client";

import {
  useState,
  useRef,
  useCallback,
  useEffect,
  type KeyboardEvent,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@duyet/libs/utils";
import type { ToolTimelineProps, TimelineEvent } from "./types";

const STATUS_COLORS = {
  adopted: {
    bg: "bg-amber-500",
    ring: "ring-amber-500",
    text: "text-amber-600",
  },
  active: {
    bg: "bg-green-500",
    ring: "ring-green-500",
    text: "text-green-600",
  },
  testing: { bg: "bg-blue-500", ring: "ring-blue-500", text: "text-blue-600" },
  deprecated: {
    bg: "bg-gray-400",
    ring: "ring-gray-400",
    text: "text-gray-500",
  },
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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Detect mobile breakpoint (640px = sm in Tailwind)
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
      <div className={cn("py-12 text-center", className)}>
        <p className="text-gray-500 dark:text-gray-400">No events to display</p>
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
        {/* Horizontal Timeline Container */}
        <div
          ref={timelineRef}
          className="relative overflow-x-auto pb-12 pt-8 px-4 sm:px-6 lg:px-8"
          role="region"
          aria-label="Tool adoption timeline"
        >
          {/* Timeline Track */}
          <div className="relative min-w-max">
            {/* Horizontal Line */}
            <div
              className="absolute top-12 left-0 right-0 h-0.5 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700"
              aria-hidden="true"
            />

            {/* Events */}
            <div className="relative flex gap-4 sm:gap-8 pb-8">
              {sortedEvents.map((event, index) => {
                const isExpanded = expandedId === event.id;
                const colors = STATUS_COLORS[event.status];

                return (
                  <div key={event.id} className="flex flex-col items-center">
                    {/* Dot Button */}
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
                        "relative z-10 mb-6 flex h-10 w-10 items-center justify-center rounded-full",
                        "transition-all duration-200 outline-none",
                        "ring-2 ring-offset-2 dark:ring-offset-gray-950",
                        "hover:scale-125 focus:scale-125 focus-visible:ring-2 focus-visible:ring-offset-2",
                        colors.bg,
                        "ring-offset-white dark:ring-offset-gray-950",
                        colors.ring,
                        isExpanded
                          ? "scale-125 ring-2 ring-offset-2"
                          : "ring-2 ring-offset-2"
                      )}
                      aria-expanded={isExpanded}
                      aria-label={`${event.name} - ${formatDate(event.date)} - ${event.status}`}
                      title={`${event.name} (${event.status})`}
                    >
                      <div className={cn("h-3 w-3 rounded-full", colors.bg)} />
                    </button>

                    {/* Event Info Below Timeline */}
                    <motion.div
                      layout
                      className="text-center min-w-max"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <p className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">
                        {event.name}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(event.date)}
                      </p>

                      {/* Status Badge */}
                      <span
                        className={cn(
                          "mt-1 inline-block px-2 py-1 rounded-full text-xs font-medium",
                          "bg-opacity-20",
                          colors.bg.replace("bg-", "bg-") + " bg-opacity-20",
                          colors.text
                        )}
                      >
                        {event.status}
                      </span>
                    </motion.div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Expanded Details */}
        <AnimatePresence mode="wait">
          {expandedId && (
            <motion.div
              key={expandedId}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <ExpandedEventDetails
                event={sortedEvents.find((e) => e.id === expandedId)!}
                onClose={() => setExpandedId(null)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Mobile vertical timeline layout
  return (
    <div
      className={cn("w-full", className)}
      role="region"
      aria-label="Tool adoption timeline"
    >
      <div className="relative px-4 py-8">
        {/* Vertical Line */}
        <div
          className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700"
          aria-hidden="true"
        />

        {/* Events */}
        <div className="space-y-6">
          {sortedEvents.map((event, index) => {
            const isExpanded = expandedId === event.id;
            const colors = STATUS_COLORS[event.status];

            return (
              <div key={event.id} className="relative pl-20">
                {/* Dot */}
                <button
                  data-timeline-index={index}
                  onClick={() => toggleExpanded(event.id)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className={cn(
                    "absolute -left-3.5 top-1 z-10 flex h-8 w-8 items-center justify-center rounded-full",
                    "transition-all duration-200 outline-none",
                    "ring-2 ring-offset-2 dark:ring-offset-gray-950",
                    "active:scale-110 focus-visible:ring-2 focus-visible:ring-offset-2",
                    colors.bg,
                    "ring-offset-white dark:ring-offset-gray-950",
                    colors.ring
                  )}
                  aria-expanded={isExpanded}
                  aria-label={`${event.name} - ${formatDate(event.date)} - ${event.status}`}
                  title={`${event.name} (${event.status})`}
                >
                  <div className={cn("h-2.5 w-2.5 rounded-full", colors.bg)} />
                </button>

                {/* Event Card */}
                <motion.div
                  layout
                  className={cn(
                    "rounded-lg border transition-all duration-200",
                    "border-gray-200 dark:border-gray-700",
                    isExpanded
                      ? "bg-white dark:bg-gray-900 shadow-lg"
                      : "bg-gray-50 dark:bg-gray-800"
                  )}
                >
                  <button
                    onClick={() => toggleExpanded(event.id)}
                    className="w-full p-4 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded-lg"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {event.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(event.date)}
                        </p>
                      </div>

                      {/* Status Badge */}
                      <span
                        className={cn(
                          "px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap",
                          "bg-opacity-20",
                          colors.text
                        )}
                        style={{
                          backgroundColor:
                            event.status === "adopted"
                              ? "rgba(245, 158, 11, 0.2)"
                              : event.status === "active"
                                ? "rgba(34, 197, 94, 0.2)"
                                : event.status === "testing"
                                  ? "rgba(59, 130, 246, 0.2)"
                                  : "rgba(107, 114, 128, 0.2)",
                        }}
                      >
                        {event.status}
                      </span>
                    </div>
                  </button>

                  {/* Expanded Content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 space-y-3">
                          <div>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              {event.details}
                            </p>
                          </div>

                          {event.reason && (
                            <div className="bg-gray-100 dark:bg-gray-800 rounded p-3">
                              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                                Key Moment
                              </p>
                              <p className="text-sm text-gray-700 dark:text-gray-300">
                                {event.reason}
                              </p>
                            </div>
                          )}

                          <button
                            onClick={() => setExpandedId(null)}
                            className="w-full mt-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                          >
                            Close
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
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
    <div className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {event.name}
              </h2>
              <span
                className={cn(
                  "px-3 py-1 rounded-full text-sm font-semibold",
                  "bg-opacity-20",
                  colors.text
                )}
                style={{
                  backgroundColor:
                    event.status === "adopted"
                      ? "rgba(245, 158, 11, 0.2)"
                      : event.status === "active"
                        ? "rgba(34, 197, 94, 0.2)"
                        : event.status === "testing"
                          ? "rgba(59, 130, 246, 0.2)"
                          : "rgba(107, 114, 128, 0.2)",
                }}
              >
                {event.status}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {new Date(event.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors p-2"
            aria-label="Close details"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Details
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {event.details}
            </p>
          </div>

          {event.reason && (
            <div
              className="bg-white dark:bg-gray-800 rounded-lg p-4 border-l-4"
              style={{
                borderLeftColor:
                  event.status === "adopted"
                    ? "#f59e0b"
                    : event.status === "active"
                      ? "#22c55e"
                      : event.status === "testing"
                        ? "#3b82f6"
                        : "#6b7280",
              }}
            >
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                Key Moment
              </h3>
              <p className="text-gray-700 dark:text-gray-300">{event.reason}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
