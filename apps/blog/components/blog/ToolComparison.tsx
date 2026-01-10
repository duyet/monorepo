"use client";

import { useState } from "react";
import type { ToolComparisonProps } from "./types";

/**
 * ToolComparison - Interactive comparison with expandable details
 * Claude-style minimal design with left border accent
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
      <div className={`text-xs text-gray-500 dark:text-gray-400 ${className}`}>
        Missing required data
      </div>
    );
  }

  return (
    <div
      className={`border-l-2 border-gray-300 dark:border-slate-700 pl-4 py-4 space-y-3 ${className}`}
      role="region"
      aria-labelledby={`tool-${name}`}
    >
      {/* Title line with rating - clickable to expand */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full text-left hover:text-gray-900 dark:hover:text-white transition-colors group"
      >
        <div className="flex items-baseline gap-3">
          <h3 id={`tool-${name}`} className="font-medium text-base text-gray-900 dark:text-white">
            {name}
          </h3>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {rating.toFixed(1)}/5
          </span>
          {winner && (
            <span className="text-xs font-medium px-2 py-1 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded">
              Recommended
            </span>
          )}
        </div>
        <span className="text-gray-400 dark:text-gray-600 text-sm flex-shrink-0">
          {expanded ? "−" : "+"}
        </span>
      </button>

      {/* Expandable content */}
      {expanded && (
        <div className="space-y-3 pt-3 border-t border-gray-200 dark:border-slate-800">
          {/* Description if provided */}
          {description && (
            <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
              {description}
            </p>
          )}

          {/* Strengths and Limitations */}
          <div className="space-y-3">
            {pros.length > 0 && (
              <div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-2">Strengths</span>
                <ul className="space-y-1">
                  {pros.map((pro, idx) => (
                    <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex gap-2">
                      <span className="text-gray-500 dark:text-gray-500 flex-shrink-0">•</span>
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {cons.length > 0 && (
              <div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-2">Limitations</span>
                <ul className="space-y-1">
                  {cons.map((con, idx) => (
                    <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex gap-2">
                      <span className="text-gray-500 dark:text-gray-500 flex-shrink-0">•</span>
                      <span>{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
