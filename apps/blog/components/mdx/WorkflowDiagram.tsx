"use client";

import { useState, useEffect } from "react";
import { Play, CheckCircle, Circle } from "lucide-react";

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  status: "pending" | "in-progress" | "completed";
  next?: string[];
}

interface WorkflowDiagramProps {
  steps: WorkflowStep[];
  title?: string;
}

export function WorkflowDiagram({ steps, title = "Workflow" }: WorkflowDiagramProps) {
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "in-progress":
        return "bg-blue-500";
      case "pending":
        return "bg-gray-400";
      default:
        return "bg-gray-400";
    }
  };

  const getStatusIcon = (step: WorkflowStep) => {
    if (completedSteps.has(step.id)) {
      return <CheckCircle className="w-6 h-6 text-green-500" />;
    } else if (currentStep === step.id) {
      return <Play className="w-6 h-6 text-blue-500" />;
    } else {
      return <Circle className="w-6 h-6 text-gray-400" />;
    }
  };

  const handleStepClick = (stepId: string) => {
    if (stepId === currentStep) {
      setCurrentStep(null);
    } else {
      setCurrentStep(stepId);
    }
  };

  const handleCompleteStep = (stepId: string) => {
    const newCompleted = new Set(completedSteps);
    if (completedSteps.has(stepId)) {
      newCompleted.delete(stepId);
    } else {
      newCompleted.add(stepId);
    }
    setCompletedSteps(newCompleted);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">{title}</h3>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-gray-600 dark:text-gray-400">Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-gray-600 dark:text-gray-400">In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-400"></div>
            <span className="text-gray-600 dark:text-gray-400">Pending</span>
          </div>
        </div>
      </div>

      <div className="relative">
        {/* Connecting lines */}
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700 transform -translate-x-1/2"></div>

        {/* Steps */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {steps.map((step, index) => {
            const isLeft = index % 2 === 0;
            const positionClass = isLeft ? "md:pr-1/2" : "md:pl-1/2 lg:pl-3/4";

            return (
              <div
                key={step.id}
                className={`relative ${positionClass} group`}
                style={{ zIndex: steps.length - index }}
              >
                {/* Line to next step */}
                {index < steps.length - 1 && (
                  <div className="absolute top-1/2 transform -translate-y-1/2 bg-gray-200 dark:bg-gray-700 group-hover:bg-gray-300 dark:group-hover:bg-gray-600 transition-colors"
                       style={{ width: "100%", left: isLeft ? "100%" : undefined, right: isLeft ? undefined : "100%" }}>
                  </div>
                )}

                <div
                  className={`rounded-lg border p-4 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all cursor-pointer transform hover:scale-105 ${
                    currentStep === step.id ? "ring-2 ring-blue-500" : ""
                  }`}
                  onClick={() => handleStepClick(step.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(step)}
                      <div>
                        <h4 className="font-semibold text-base">{step.title}</h4>
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                          Step {index + 1}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCompleteStep(step.id);
                      }}
                      className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                        completedSteps.has(step.id) ? "text-green-500" : "text-gray-400"
                      }`}
                    >
                      {completedSteps.has(step.id) ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {step.description}
                  </p>

                  {/* Dependencies */}
                  {step.next && step.next.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        Prerequisites:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {step.next.map((nextStepId) => {
                          const nextStep = steps.find(s => s.id === nextStepId);
                          return (
                            <span
                              key={nextStepId}
                              className={`text-xs px-2 py-1 rounded-full ${
                                completedSteps.has(nextStepId)
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                  : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                              }`}
                            >
                              {nextStep?.title || nextStepId}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {currentStep === step.id && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-blue-600 dark:text-blue-400">
                        Click step to mark as in-progress, or click checkmark to complete.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-8">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600 dark:text-gray-400">Progress</span>
          <span className="font-medium">
            {completedSteps.size} / {steps.length} steps
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(completedSteps.size / steps.length) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}