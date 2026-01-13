"use client";

import React, { useState } from "react";
import { ArrowRight, CheckCircle, XCircle, Clock } from "lucide-react";

interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  status: "pending" | "in-progress" | "completed" | "failed";
  dependencies: string[];
  duration: string;
}

interface WorkflowDiagramProps {
  steps: WorkflowStep[];
  title?: string;
}

/**
 * WorkflowDiagram - Interactive workflow visualization
 * Features: Step selection, dependency visualization, status filtering
 */
export default function WorkflowDiagram({ steps, title = "Workflow Diagram" }: WorkflowDiagramProps) {
  const [selectedStep, setSelectedStep] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | WorkflowStep["status"]>("all");

  const statuses = ["all", "pending", "in-progress", "completed", "failed"] as const;

  const filteredSteps = steps.filter((step) =>
    statusFilter === "all" ? true : step.status === statusFilter
  );

  const getStepColor = (status: WorkflowStep["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700 text-green-800 dark:text-green-200";
      case "in-progress":
        return "bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-200";
      case "pending":
        return "bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200";
      case "failed":
        return "bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700 text-red-800 dark:text-red-200";
    }
  };

  const getStepIcon = (status: WorkflowStep["status"]) => {
    const size = 16;
    switch (status) {
      case "completed":
        return <CheckCircle size={size} className="text-green-600 dark:text-green-400" />;
      case "in-progress":
        return <Clock size={size} className="text-blue-600 dark:text-blue-400 animate-spin" />;
      case "pending":
        return <Clock size={size} className="text-gray-400" />;
      case "failed":
        return <XCircle size={size} className="text-red-600 dark:text-red-400" />;
    }
  };

  const isDependency = (stepId: string, targetId: string) => {
    const step = steps.find((s) => s.id === stepId);
    return step?.dependencies.includes(targetId);
  };

  return (
    <div className="my-8 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-900">
      <div className="p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{title}</h3>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-1 rounded text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Visual flow diagram */}
        <div className="relative mb-6">
          <div className="flex flex-col gap-4">
            {filteredSteps.map((step, index) => {
              const isSelected = selectedStep === step.id;
              const hasDependencies = step.dependencies.length > 0;

              return (
                <div key={step.id} className="flex items-start gap-4">
                  {/* Step number and arrow */}
                  <div className="flex flex-col items-center gap-1 min-w-[40px]">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        isSelected
                          ? "ring-4 ring-blue-400 ring-opacity-50"
                          : ""
                      } ${getStepColor(step.status)}`}
                    >
                      {index + 1}
                    </div>
                    {index < filteredSteps.length - 1 && (
                      <ArrowRight className="text-gray-400" size={16} />
                    )}
                  </div>

                  {/* Step card */}
                  <div
                    className={`flex-1 border rounded-lg p-4 cursor-pointer transition-all ${
                      getStepColor(step.status)
                    } ${isSelected ? "shadow-lg scale-[1.02]" : "hover:shadow-md"}`}
                    onClick={() => setSelectedStep(step.id === selectedStep ? null : step.id)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getStepIcon(step.status)}
                          <span className="font-semibold text-base">{step.name}</span>
                          <span className="text-xs bg-white/50 dark:bg-gray-900/50 px-2 py-0.5 rounded">
                            {step.duration}
                          </span>
                        </div>
                        <p className="text-sm opacity-80">{step.description}</p>

                        {hasDependencies && (
                          <div className="mt-2 text-xs">
                            <span className="font-medium">Depends on: </span>
                            {step.dependencies.map((dep, idx) => (
                              <span key={dep}>
                                <span className="font-mono bg-white/30 dark:bg-gray-900/30 px-1 rounded">
                                  {dep}
                                </span>
                                {idx < step.dependencies.length - 1 ? ", " : ""}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Dependency indicators */}
                      {selectedStep && isDependency(selectedStep, step.id) && (
                        <div className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 px-2 py-1 rounded">
                          Required for selected
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Details panel */}
        {selectedStep && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-4 animate-in fade-in slide-in-from-top-2">
            <h4 className="font-bold text-blue-900 dark:text-blue-100 mb-2">
              Selected Step: {steps.find((s) => s.id === selectedStep)?.name}
            </h4>
            <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
              {steps.find((s) => s.id === selectedStep)?.description}
            </p>
            <div className="text-xs text-blue-700 dark:text-blue-300">
              <div>Status: {steps.find((s) => s.id === selectedStep)?.status}</div>
              <div>Duration: {steps.find((s) => s.id === selectedStep)?.duration}</div>
              <div>
                Dependencies:{" "}
                {steps.find((s) => s.id === selectedStep)?.dependencies.length || 0}
              </div>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="mt-6 flex flex-wrap gap-3 items-center text-xs">
          <span className="font-semibold text-gray-700 dark:text-gray-300">Legend:</span>
          <span className="flex items-center gap-1">
            <CheckCircle size={12} className="text-green-600" /> Completed
          </span>
          <span className="flex items-center gap-1">
            <Clock size={12} className="text-blue-600" /> In Progress
          </span>
          <span className="flex items-center gap-1">
            <Clock size={12} className="text-gray-400" /> Pending
          </span>
          <span className="flex items-center gap-1">
            <XCircle size={12} className="text-red-600" /> Failed
          </span>
        </div>
      </div>

      <div className="p-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 text-center">
        Click on any step to see more details. Steps are displayed in dependency order.
      </div>
    </div>
  );
}