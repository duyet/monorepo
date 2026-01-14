"use client";

import React, { useState } from "react";

interface StepProps {
  title: string;
  children: React.ReactNode;
}

interface StepsProps {
  children: React.ReactNode;
}

export function Step({ title, children }: StepProps) {
  return (
    <div className="step-item">
      <h4 className="step-title font-semibold text-gray-900 dark:text-gray-100 mb-2">
        {title}
      </h4>
      <div className="text-gray-700 dark:text-gray-300">{children}</div>
    </div>
  );
}

export function Steps({ children }: StepsProps) {
  const childArray = React.Children.toArray(children);
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(
    new Set(childArray.map((_, i) => i)) // All expanded by default
  );

  const toggleStep = (index: number) => {
    setExpandedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  return (
    <div className="steps-container my-8">
      {childArray.map((child, index) => {
        if (React.isValidElement(child)) {
          const isLast = index === childArray.length - 1;
          const isExpanded = expandedSteps.has(index);
          return (
            <div key={index} className="step-item relative pb-8 last:pb-0">
              {/* Vertical line - connecting steps */}
              {!isLast && (
                <div className="absolute left-[13px] top-7 bottom-0 w-px bg-gray-200 dark:bg-gray-700" />
              )}

              {/* Header row: number + title perfectly aligned on same line */}
              <button
                onClick={() => toggleStep(index)}
                className="inline-flex items-center gap-3 text-left group"
              >
                {/* Step number circle */}
                <span className="relative z-10 flex-shrink-0 inline-flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-sm font-medium text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 group-hover:bg-gray-200 dark:group-hover:bg-gray-700 transition-colors">
                  {index + 1}
                </span>

                {/* Title inline with number */}
                <span className="step-title text-base font-semibold text-gray-900 dark:text-gray-100 leading-7">
                  {(child.props as StepProps).title}
                </span>

                {/* Chevron - only visible on hover */}
                <svg
                  className={`w-3.5 h-3.5 text-gray-300 dark:text-gray-600 opacity-0 group-hover:opacity-100 transition-all duration-200 ${isExpanded ? "" : "-rotate-90"}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Content - collapsible, indented to align with title */}
              {isExpanded && (
                <div className="ml-10 mt-3 text-gray-600 dark:text-gray-400 text-[15px] leading-relaxed [&>p]:mb-3 [&>p:last-child]:mb-0">
                  {(child.props as StepProps).children}
                </div>
              )}
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}
