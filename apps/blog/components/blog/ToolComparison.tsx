"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { ToolComparisonProps } from "./types";

/**
 * ToolComparison Component - Minimal Design
 *
 * Displays a tool comparison card with:
 * - Tool name and optional winner indicator
 * - 5-star rating
 * - Compact pros/cons lists
 * - Expandable description
 * - Minimal, clean styling matching blog aesthetic
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
      <div className={`rounded border border-gray-300 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900 ${className}`}>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          Error: ToolComparison requires name (string), pros (array), and cons (array).
        </p>
      </div>
    );
  }

  return (
    <div
      className={`rounded border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950 ${className}`}
      role="region"
      aria-labelledby={`tool-name-${name}`}
    >
      {/* Header - Compact */}
      <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-800">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h3
              id={`tool-name-${name}`}
              className="font-semibold text-gray-900 dark:text-white"
            >
              {name}
            </h3>
            {winner && (
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                ★
              </span>
            )}
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {rating}/5
          </span>
        </div>
      </div>

      {/* Pros and Cons - Minimal */}
      <div className="grid grid-cols-2 divide-x divide-gray-200 dark:divide-gray-800">
        {/* Pros */}
        <div className="px-4 py-3">
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
            Pros
          </h4>
          <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
            {pros.map((pro, idx) => (
              <li key={idx} className="flex gap-2">
                <span className="flex-shrink-0 text-gray-400">+</span>
                <span>{pro}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Cons */}
        <div className="px-4 py-3">
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
            Cons
          </h4>
          <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
            {cons.map((con, idx) => (
              <li key={idx} className="flex gap-2">
                <span className="flex-shrink-0 text-gray-400">−</span>
                <span>{con}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Expandable Description */}
      {description && (
        <>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex w-full items-center justify-between border-t border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-900/50"
            aria-expanded={expanded}
            aria-controls={`description-${name}`}
          >
            <span>Details</span>
            {expanded ? (
              <ChevronUp size={16} className="text-gray-500" />
            ) : (
              <ChevronDown size={16} className="text-gray-500" />
            )}
          </button>

          {expanded && (
            <div
              id={`description-${name}`}
              className="border-t border-gray-200 px-4 py-3 text-sm text-gray-600 dark:border-gray-800 dark:text-gray-400"
            >
              {description}
            </div>
          )}
        </>
      )}
    </div>
  );
}
