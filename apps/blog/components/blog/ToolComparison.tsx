"use client";

import { useState } from "react";
import { Star, Trophy, ChevronDown, ChevronUp, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { ToolComparisonProps } from "./types";

/**
 * ToolComparison Component
 *
 * Displays a tool comparison card with:
 * - Tool name and optional WINNER badge
 * - 5-star rating visualization
 * - Two-column layout for pros (green) and cons (red)
 * - Expandable description section
 * - Full dark mode and mobile responsiveness
 * - WCAG 2.1 AA accessibility compliance
 */
export function ToolComparison({
  name,
  rating,
  pros,
  cons,
  description,
  winner = false,
  className = "",
}: ToolComparisonProps) {
  const [expanded, setExpanded] = useState(false);

  // Validate props
  if (!name || !Array.isArray(pros) || !Array.isArray(cons)) {
    return (
      <div
        className={`rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950 ${className}`}
      >
        <p className="text-sm text-red-800 dark:text-red-200">
          Error: ToolComparison requires name (string), pros (array), and cons
          (array).
        </p>
      </div>
    );
  }

  // Render stars based on rating
  const renderStars = () => {
    return (
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={18}
            className={`transition-colors ${i < rating ? "fill-amber-400 text-amber-400" : "text-gray-300 dark:text-gray-600"}`}
            aria-hidden="true"
          />
        ))}
      </div>
    );
  };

  return (
    <div
      className={`rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-950 ${className}`}
      role="region"
      aria-labelledby={`tool-name-${name}`}
    >
      {/* Header */}
      <div className="space-y-3 border-b border-gray-100 p-4 dark:border-gray-800 sm:p-6">
        {/* Title with Winner Badge */}
        <div className="flex items-center justify-between gap-3">
          <h3
            id={`tool-name-${name}`}
            className="text-lg font-semibold text-gray-900 dark:text-white"
          >
            {name}
          </h3>
          {winner && (
            <div
              className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-900 dark:bg-amber-900/30 dark:text-amber-300"
              aria-label="Winner badge"
            >
              <Trophy size={14} />
              <span>WINNER</span>
            </div>
          )}
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2">
          {renderStars()}
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {rating}.0 / 5.0
          </span>
        </div>
      </div>

      {/* Pros and Cons Section */}
      <div className="space-y-4 p-4 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Pros Column */}
          <div className="space-y-2">
            <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <Check
                  size={14}
                  className="text-green-700 dark:text-green-400"
                />
              </div>
              Pros
            </h4>
            <ul className="space-y-2">
              {pros.map((pro, idx) => (
                <li
                  key={idx}
                  className="flex gap-3 text-sm text-gray-700 dark:text-gray-300"
                >
                  <div className="mt-1 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                    <Check
                      size={12}
                      className="text-green-700 dark:text-green-400"
                    />
                  </div>
                  <span>{pro}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Cons Column */}
          <div className="space-y-2">
            <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                <X size={14} className="text-red-700 dark:text-red-400" />
              </div>
              Cons
            </h4>
            <ul className="space-y-2">
              {cons.map((con, idx) => (
                <li
                  key={idx}
                  className="flex gap-3 text-sm text-gray-700 dark:text-gray-300"
                >
                  <div className="mt-1 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                    <X size={12} className="text-red-700 dark:text-red-400" />
                  </div>
                  <span>{con}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Expandable Description Section */}
      {description && (
        <div className="border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex w-full items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-900/50 sm:p-6"
            aria-expanded={expanded}
            aria-controls={`description-${name}`}
          >
            <span className="font-medium text-gray-900 dark:text-white">
              Read More
            </span>
            <div className="flex-shrink-0">
              {expanded ? (
                <ChevronUp
                  size={18}
                  className="text-gray-500 dark:text-gray-400"
                />
              ) : (
                <ChevronDown
                  size={18}
                  className="text-gray-500 dark:text-gray-400"
                />
              )}
            </div>
          </button>

          <AnimatePresence>
            {expanded && (
              <motion.div
                id={`description-${name}`}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="border-t border-gray-100 bg-gray-50/50 p-4 text-sm text-gray-600 dark:border-gray-800 dark:bg-gray-900/25 dark:text-gray-300 sm:p-6">
                  {description}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
