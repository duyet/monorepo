"use client";

import { useState } from "react";
import { CheckCircle, Circle, XCircle, Play, Pause, RotateCcw } from "lucide-react";

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  status: "pending" | "in-progress" | "completed" | "failed";
  dependencies?: string[];
  timeSpent?: number;
  estimatedTime?: number;
  notes?: string;
}

interface WorkflowDiagramProps {
  steps: WorkflowStep[];
  className?: string;
  title?: string;
  onStepClick?: (stepId: string) => void;
}

export function WorkflowDiagram({ steps, className, title, onStepClick }: WorkflowDiagramProps) {
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(0);

  const getStepIcon = (step: WorkflowStep, index: number) => {
    if (step.status === "completed") {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    } else if (step.status === "in-progress") {
      return <Play className="h-5 w-5 text-blue-500" />;
    } else if (step.status === "failed") {
      return <XCircle className="h-5 w-5 text-red-500" />;
    } else {
      return <Circle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStepColor = (step: WorkflowStep) => {
    switch (step.status) {
      case "completed":
        return "bg-green-50 border-green-500";
      case "in-progress":
        return "bg-blue-50 border-blue-500";
      case "failed":
        return "bg-red-50 border-red-500";
      default:
        return "bg-gray-50 border-gray-300";
    }
  };

  const getProgressPercentage = () => {
    const completed = steps.filter(s => s.status === "completed").length;
    return Math.round((completed / steps.length) * 100);
  };

  const handleStepClick = (step: WorkflowStep, index: number) => {
    if (onStepClick) {
      onStepClick(step.id);
    } else {
      setExpandedStep(expandedStep === step.id ? null : step.id);
    }
  };

  const handleNextStep = () => {
    for (let i = currentStep; i < steps.length; i++) {
      if (steps[i].status !== "completed") {
        setCurrentStep(i);
        break;
      }
    }
  };

  const handleRestart = () => {
    steps.forEach(step => {
      if (step.status === "in-progress") {
        step.status = "pending";
      }
    });
    setCurrentStep(0);
  };

  const formatTime = (minutes?: number) => {
    if (!minutes) return "N/A";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <div className={className}>
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Progress: {getProgressPercentage()}%</span>
          <span className="text-sm text-gray-500">
            {steps.filter(s => s.status === "completed").length} of {steps.length} steps
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${getProgressPercentage()}%` }}
          />
        </div>
      </div>

      {/* Workflow Steps */}
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={step.id} className="relative">
            {/* Connector line */}
            {index > 0 && (
              <div className="absolute left-6 top-8 bottom-0 w-0.5 bg-gray-200" />
            )}

            <div
              className={`flex gap-4 p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                expandedStep === step.id ? "ring-2 ring-blue-500" : ""
              } ${getStepColor(step)}`}
              onClick={() => handleStepClick(step, index)}
            >
              <div className="flex-shrink-0">
                {getStepIcon(step, index)}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold">
                      Step {index + 1}: {step.title}
                      {currentStep === index && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          Current
                        </span>
                      )}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                  </div>
                </div>

                {/* Time Information */}
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  {step.timeSpent && (
                    <span>⏱️ Spent: {formatTime(step.timeSpent)}</span>
                  )}
                  {step.estimatedTime && (
                    <span>⏱️ Estimated: {formatTime(step.estimatedTime)}</span>
                  )}
                </div>

                {/* Dependencies */}
                {step.dependencies && step.dependencies.length > 0 && (
                  <div className="mt-2">
                    <span className="text-xs text-gray-500">Depends on: </span>
                    {step.dependencies.map(depId => {
                      const dep = steps.find(s => s.id === depId);
                      return (
                        <span key={depId} className="text-xs bg-gray-100 px-2 py-1 rounded ml-1">
                          {dep ? dep.title : depId}
                        </span>
                      );
                    })}
                  </div>
                )}

                {expandedStep === step.id && step.notes && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-gray-700">{step.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Control Buttons */}
      <div className="flex gap-2 mt-6">
        <button
          onClick={handleNextStep}
          disabled={currentStep >= steps.length || steps[currentStep]?.status === "completed"}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next Step
        </button>
        <button
          onClick={handleRestart}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          <RotateCcw className="h-4 w-4 mr-1 inline" />
          Restart
        </button>
      </div>
    </div>
  );
}