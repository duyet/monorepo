"use client";

import { useState } from "react";

export interface Step {
  id: string;
  title: string;
  description: string;
  details?: React.ReactNode;
}

export interface StepsListProps {
  steps: Step[];
  title?: string;
  expandable?: boolean;
  className?: string;
}

/**
 * StepsList - Numbered steps with expandable details
 * Claude-style minimal design with left border
 */
export function StepsList({
  steps,
  title,
  expandable = true,
  className = "",
}: StepsListProps) {
  const [expandedStep, setExpandedStep] = useState<string | null>(null);

  if (!steps || steps.length === 0) {
    return (
      <div
        className={`text-base text-[#1a1a1a]/55 dark:text-[#f8f8f2]/55 ${className}`}
      >
        No steps available
      </div>
    );
  }

  return (
    <div
      className={`space-y-4 border-l-2 border-[#1a1a1a]/10 dark:border-white/10 pl-4 py-3 ${className}`}
    >
      {title && (
        <h2 className="text-lg font-medium text-[#1a1a1a] dark:text-[#f8f8f2]">
          {title}
        </h2>
      )}

      <div className="space-y-3">
        {steps.map((step, idx) => (
          <div key={step.id}>
            <button
              onClick={() =>
                expandable &&
                setExpandedStep(expandedStep === step.id ? null : step.id)
              }
              className="w-full text-left flex gap-3 hover:text-[#1a1a1a] dark:hover:text-[#f8f8f2] transition-colors"
            >
              <span className="font-medium text-[#1a1a1a]/55 dark:text-[#f8f8f2]/55 flex-shrink-0 w-6">
                {idx + 1}.
              </span>
              <div className="flex-1">
                <h3 className="font-medium text-[#1a1a1a] dark:text-[#f8f8f2] text-base">
                  {step.title}
                </h3>
                <p className="text-[#1a1a1a]/70 dark:text-[#f8f8f2]/70 text-sm mt-0.5">
                  {step.description}
                </p>
              </div>
              {expandable && step.details && (
                <span className="text-[#1a1a1a]/55 dark:text-[#f8f8f2]/55 text-sm flex-shrink-0">
                  {expandedStep === step.id ? "−" : "+"}
                </span>
              )}
            </button>

            {expandable && expandedStep === step.id && step.details && (
              <div className="mt-2 ml-9 p-3 border-t border-[#1a1a1a]/10 dark:border-white/10">
                <div className="text-sm text-[#1a1a1a]/70 dark:text-[#f8f8f2]/55">
                  {step.details}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default StepsList;
