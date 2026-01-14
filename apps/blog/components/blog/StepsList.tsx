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
        className={`text-base text-gray-500 dark:text-gray-400 ${className}`}
      >
        No steps available
      </div>
    );
  }

  return (
    <div
      className={`space-y-4 border-l-2 border-gray-300 dark:border-slate-700 pl-4 py-3 ${className}`}
    >
      {title && (
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">
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
              className="w-full text-left flex gap-3 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <span className="font-medium text-gray-500 dark:text-gray-400 flex-shrink-0 w-6">
                {idx + 1}.
              </span>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 dark:text-white text-base">
                  {step.title}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm mt-0.5">
                  {step.description}
                </p>
              </div>
              {expandable && step.details && (
                <span className="text-gray-400 dark:text-gray-600 text-sm flex-shrink-0">
                  {expandedStep === step.id ? "−" : "+"}
                </span>
              )}
            </button>

            {expandable && expandedStep === step.id && step.details && (
              <div className="mt-2 ml-9 p-3 border-t border-gray-200 dark:border-slate-800">
                <div className="text-sm text-gray-600 dark:text-gray-400">
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
