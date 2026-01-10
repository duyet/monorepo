"use client";

import { useState } from "react";
import type { ToolComparisonProps } from "./types";

/**
 * ToolComparison - Premium card layout
 * Uses warm Claude palette with semantic spacing
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

  if (!name || !Array.isArray(pros) || !Array.isArray(cons)) {
    return (
      <div className={`rounded-lg bg-gray-50 dark:bg-slate-900 p-4 text-sm text-gray-600 dark:text-gray-400 ${className}`}>
        Missing required data
      </div>
    );
  }

  return (
    <div
      className={`rounded-lg border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden transition-all hover:shadow-md ${className}`}
      role="region"
      aria-labelledby={`tool-${name}`}
    >
      {/* Header with rating */}
      <div className="px-5 py-4 border-b border-gray-200 dark:border-slate-800 bg-gradient-to-r from-claude-peach/5 to-transparent dark:from-slate-900 dark:to-slate-950">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-baseline gap-2 mb-1">
              <h3 id={`tool-${name}`} className="text-lg font-semibold text-gray-900 dark:text-white">
                {name}
              </h3>
              {winner && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-claude-peach/20 text-claude-brown dark:bg-claude-coral/20 dark:text-claude-coral">
                  Recommended
                </span>
              )}
            </div>
            {description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {description}
              </p>
            )}
          </div>
          <div className="flex-shrink-0 text-center">
            <div className="text-2xl font-bold text-claude-brown dark:text-claude-peach">
              {rating.toFixed(1)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              / 5
            </div>
          </div>
        </div>
      </div>

      {/* Pros and Cons Grid */}
      <div className="grid grid-cols-2 divide-x divide-gray-200 dark:divide-slate-800">
        {/* Pros */}
        <div className="px-5 py-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-3">
            Strengths
          </h4>
          <ul className="space-y-2">
            {pros.map((pro, idx) => (
              <li key={idx} className="flex gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                <span className="text-claude-peach dark:text-claude-coral mt-1 text-lg leading-none">+</span>
                <span className="flex-1">{pro}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Cons */}
        <div className="px-5 py-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-3">
            Limitations
          </h4>
          <ul className="space-y-2">
            {cons.map((con, idx) => (
              <li key={idx} className="flex gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                <span className="text-gray-400 dark:text-gray-500 mt-1 text-lg leading-none">−</span>
                <span className="flex-1">{con}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Expandable Footer */}
      {description && (
        <>
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full px-5 py-2.5 text-left text-sm font-medium text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-900/50 transition-colors"
          >
            <span className="inline-flex items-center gap-2">
              <span>{expanded ? "Hide" : "Show"} details</span>
              <span className={`text-xs transform transition-transform ${expanded ? "rotate-180" : ""}`}>
                ⌄
              </span>
            </span>
          </button>
          {expanded && (
            <div className="px-5 py-4 bg-gray-50 dark:bg-slate-900/50 text-sm text-gray-700 dark:text-gray-300 border-t border-gray-200 dark:border-slate-800">
              {description}
            </div>
          )}
        </>
      )}
    </div>
  );
}
