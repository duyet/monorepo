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
      className={`border-l-2 border-gray-300 dark:border-slate-700 pl-4 py-3 space-y-2 ${className}`}
      role="region"
      aria-labelledby={`tool-${name}`}
    >
      {/* Title line with rating - clickable to expand */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-baseline gap-2 flex-wrap hover:text-gray-900 dark:hover:text-white transition-colors w-full text-left text-base"
      >
        <h3 id={`tool-${name}`} className="font-medium text-gray-900 dark:text-white">
          {name}
        </h3>
        <span className="text-gray-500 dark:text-gray-400">—</span>
        <span className="text-gray-600 dark:text-gray-400 text-sm">
          {rating.toFixed(1)}/5
          {winner && " • Recommended"}
        </span>
        <span className="text-gray-400 dark:text-gray-600 text-sm ml-auto">
          {expanded ? "−" : "+"}
        </span>
      </button>

      {/* Expandable content */}
      {expanded && (
        <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-slate-800">
          {/* Description if provided */}
          {description && (
            <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed">
              {description}
            </p>
          )}

          {/* Strengths and Limitations */}
          <div className="space-y-1.5 text-gray-700 dark:text-gray-300 text-sm">
            {pros.length > 0 && (
              <div>
                <span className="text-gray-500 dark:text-gray-400 font-medium">Strengths:</span>{" "}
                {pros.map((pro, idx) => (
                  <span key={idx}>
                    {pro}
                    {idx < pros.length - 1 && " • "}
                  </span>
                ))}
              </div>
            )}
            {cons.length > 0 && (
              <div>
                <span className="text-gray-500 dark:text-gray-400 font-medium">Limitations:</span>{" "}
                {cons.map((con, idx) => (
                  <span key={idx}>
                    {con}
                    {idx < cons.length - 1 && " • "}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
