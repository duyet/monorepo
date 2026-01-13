import * as React from "react";
import { ArrowRight, CheckCircle2, CircleDot } from "lucide-react";

interface WorkflowStep {
  label: string;
  description: string;
  status?: "completed" | "current" | "pending";
}

interface WorkflowDiagramProps {
  steps: WorkflowStep[];
  title?: string;
  circular?: boolean;
}

export function WorkflowDiagram({ steps, title = "Workflow", circular = false }: WorkflowDiagramProps) {
  const getStepIcon = (status: WorkflowStep["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-6 h-6 text-green-600" />;
      case "current":
        return <CircleDot className="w-6 h-6 text-blue-600 animate-pulse" />;
      default:
        return <CircleDot className="w-6 h-6 text-gray-400" />;
    }
  };

  if (circular) {
    return (
      <div className="my-6 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <h3 className="text-lg font-semibold m-0">{title}</h3>
        </div>
        <div className="p-6">
          <div className="flex flex-col items-center">
            {/* Circular layout with animated arrows */}
            <div className="relative flex items-center justify-center">
              {/* Connecting lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 300 300">
                <defs>
                  <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" className="fill-gray-400" />
                  </marker>
                </defs>
                <circle
                  cx="150"
                  cy="150"
                  r="100"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-gray-300 dark:text-gray-600 stroke-dasharray-4"
                  strokeDasharray="4,4"
                />
                {/* Animated flow indicators */}
                <circle
                  cx="150"
                  cy="50"
                  r="3"
                  className="fill-blue-500 animate-[bounce_2s_infinite]"
                />
              </svg>

              {/* Step nodes arranged in circle */}
              <div className="relative z-10 grid grid-cols-2 gap-6 items-center">
                {steps.map((step, index) => (
                  <div
                    key={index}
                    className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 min-w-[120px] ${
                      step.status === "completed"
                        ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                        : step.status === "current"
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                  >
                    <div className="mb-2">{getStepIcon(step.status)}</div>
                    <div className="text-sm font-semibold text-center">{step.label}</div>
                    <div className="text-xs text-center text-gray-500 dark:text-gray-400 mt-1">
                      {step.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="mt-6 flex gap-4 text-xs text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-green-600" /> Completed
              </span>
              <span className="flex items-center gap-1">
                <CircleDot className="w-4 h-4 text-blue-600" /> Current
              </span>
              <span className="flex items-center gap-1">
                <CircleDot className="w-4 h-4 text-gray-400" /> Pending
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Linear workflow
  return (
    <div className="my-6 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <h3 className="text-lg font-semibold m-0">{title}</h3>
      </div>
      <div className="p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {steps.map((step, index) => (
            <React.Fragment key={index}>
              <div className="flex flex-col items-center flex-1 w-full">
                <div className={`flex flex-col items-center p-4 rounded-lg border-2 min-w-[140px] ${
                  step.status === "completed"
                    ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                    : step.status === "current"
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-300 dark:border-gray-600"
                }`}>
                  <div className="mb-2">{getStepIcon(step.status)}</div>
                  <div className="text-sm font-semibold text-center">{step.label}</div>
                  <div className="text-xs text-center text-gray-500 dark:text-gray-400 mt-1">
                    {step.description}
                  </div>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden md:block">
                  <ArrowRight className="w-8 h-8 text-gray-400" />
                </div>
              )}
              {index < steps.length - 1 && (
                <div className="md:hidden w-full flex justify-center">
                  <ArrowRight className="w-8 h-8 text-gray-400 rotate-90" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Mobile legend */}
        <div className="mt-6 flex flex-wrap gap-4 text-xs text-gray-600 dark:text-gray-400 justify-center md:hidden">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4 text-green-600" /> Completed
          </span>
          <span className="flex items-center gap-1">
            <CircleDot className="w-4 h-4 text-blue-600" /> Current
          </span>
          <span className="flex items-center gap-1">
            <CircleDot className="w-4 h-4 text-gray-400" /> Pending
          </span>
        </div>
      </div>
    </div>
  );
}