import React, { useState } from "react";
import { cn } from "@duyet/libs/utils";

export interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  dependencies?: string[];
  estimatedTime?: string;
}

export interface WorkflowDiagramProps {
  steps: WorkflowStep[];
  showProgress?: boolean;
  className?: string;
}

export function WorkflowDiagram({
  steps,
  showProgress = true,
  className,
}: WorkflowDiagramProps) {
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const toggleStep = (stepId: string) => {
    setCompletedSteps((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(stepId)) {
        newSet.delete(stepId);
      } else {
        newSet.add(stepId);
      }
      return newSet;
    });
  };

  const progress = showProgress
    ? (completedSteps.size / steps.length) * 100
    : 0;

  // Check if all dependencies are completed
  const areDependenciesCompleted = (step: WorkflowStep): boolean => {
    if (!step.dependencies || step.dependencies.length === 0) return true;
    return step.dependencies.every((dep) => completedSteps.has(dep));
  };

  return (
    <div className={cn("w-full max-w-5xl mx-auto space-y-6", className)}>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-1">Workflow Diagram</h2>
          <p className="text-muted-foreground">
            Interactive workflow with progress tracking
          </p>
        </div>
        {showProgress && (
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">
              Progress: {completedSteps.size}/{steps.length}
            </span>
            <div className="w-32 bg-secondary rounded-full h-2 overflow-hidden">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.has(step.id);
          const depsCompleted = areDependenciesCompleted(step);
          const isClickable = depsCompleted || isCompleted;

          return (
            <div key={step.id} className="flex items-start gap-4">
              <div className="flex flex-col items-center gap-2">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all",
                    isCompleted
                      ? "bg-green-500 text-white shadow-lg"
                      : isClickable
                      ? "bg-primary text-white hover:bg-primary/80"
                      : "bg-gray-300 dark:bg-gray-700 text-gray-500",
                    isClickable && "cursor-pointer"
                  )}
                  onClick={() => isClickable && toggleStep(step.id)}
                >
                  {isCompleted ? "✓" : index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "w-0.5 h-12",
                      isCompleted ? "bg-green-500" : "bg-primary/20"
                    )}
                  />
                )}
              </div>

              <div className="flex-1">
                <div
                  className={cn(
                    "border rounded-lg p-4 transition-all",
                    isCompleted
                      ? "bg-green-50/50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                      : isClickable
                      ? "bg-white/50 dark:bg-slate-900/50 border-primary/30 hover:border-primary/60"
                      : "bg-gray-50/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
                  )}
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3
                          className={cn(
                            "font-semibold text-lg",
                            isCompleted && "line-through text-muted-foreground"
                          )}
                        >
                          {step.title}
                        </h3>
                        {step.estimatedTime && (
                          <span className="text-xs px-2 py-1 bg-muted rounded">
                            ⏱ {step.estimatedTime}
                          </span>
                        )}
                        {!isClickable && !isCompleted && (
                          <span className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded">
                            Requires: {step.dependencies?.join(", ")}
                          </span>
                        )}
                        {isClickable && !isCompleted && (
                          <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded">
                            Click to complete
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {step.description}
                      </p>
                      {step.dependencies && step.dependencies.length > 0 && (
                        <div className="text-xs text-muted-foreground mt-2">
                          <span className="font-medium">Dependencies:</span>{" "}
                          {step.dependencies.join(", ")}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        className={cn(
                          "px-3 py-1.5 rounded text-sm font-medium transition-all",
                          isCompleted
                            ? "bg-green-500 text-white hover:bg-green-600"
                            : isClickable
                            ? "bg-primary text-white hover:bg-primary/80"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        )}
                        onClick={() => isClickable && toggleStep(step.id)}
                        disabled={!isClickable}
                      >
                        {isCompleted ? "Completed" : "Mark as Done"}
                      </button>
                    </div>
                  </div>
                </div>

                {isCompleted && step.dependencies && step.dependencies.length > 0 && (
                  <div className="mt-2 text-xs text-green-600">
                    ✓ Dependencies satisfied: {step.dependencies.join(", ")}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-muted/50 rounded-lg p-4 text-sm">
        <div className="font-semibold mb-2">Status Legend:</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary rounded-full" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full" />
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-300 dark:bg-gray-700 rounded-full" />
            <span>Blocked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-100 dark:bg-red-900/30 rounded-full" />
            <span>Needs Dependencies</span>
          </div>
        </div>
      </div>
    </div>
  );
}