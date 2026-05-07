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
      <h4 className="step-title font-semibold text-[#1a1a1a] dark:text-[#f8f8f2] mb-2">
        {title}
      </h4>
      <div className="text-[#1a1a1a]/70 dark:text-[#f8f8f2]/70">{children}</div>
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
                <div className="absolute left-[13px] top-7 bottom-0 w-px bg-[#1a1a1a]/10 dark:bg-white/10" />
              )}

              {/* Header row: number + title perfectly aligned on same line */}
              <button
                onClick={() => toggleStep(index)}
                className="inline-flex items-center gap-3 text-left group"
              >
                {/* Step number circle */}
                <span className="relative z-10 flex-shrink-0 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#f7f7f7] dark:bg-[#1a1a1a] text-sm font-medium text-[#1a1a1a]/70 dark:text-[#f8f8f2]/70 border border-[#1a1a1a]/10 dark:border-white/10 group-hover:bg-[#e5e5e5] dark:group-hover:bg-white/10 transition-colors">
                  {index + 1}
                </span>

                {/* Title inline with number */}
                <span className="step-title text-base font-semibold text-[#1a1a1a] dark:text-[#f8f8f2] leading-7">
                  {(child.props as StepProps).title}
                </span>

                {/* Chevron - only visible on hover */}
                <svg
                  className={`w-3.5 h-3.5 text-[#1a1a1a]/55 dark:text-[#f8f8f2]/55 opacity-0 group-hover:opacity-100 transition-all duration-200 ${isExpanded ? "" : "-rotate-90"}`}
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
                <div className="ml-10 mt-3 text-[#1a1a1a]/70 dark:text-[#f8f8f2]/55 text-[15px] leading-relaxed [&>p]:mb-3 [&>p:last-child]:mb-0">
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
