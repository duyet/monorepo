import React, { useState } from 'react';

export interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  dependencies: string[];
}

export interface WorkflowDiagramProps {
  steps: WorkflowStep[];
  title?: string;
}

/**
 * WorkflowDiagram - Interactive workflow with progress tracking
 */
export const WorkflowDiagram: React.FC<WorkflowDiagramProps> = ({
  steps,
  title = 'Workflow Diagram'
}) => {
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const toggleStep = (stepId: string) => {
    setCompletedSteps((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(stepId)) {
        newSet.delete(stepId);
      } else {
        // Check if dependencies are met
        const step = steps.find(s => s.id === stepId);
        if (step && step.dependencies.every(dep => newSet.has(dep))) {
          newSet.add(stepId);
        }
      }
      return newSet;
    });
  };

  const getStepStatus = (stepId: string) => {
    if (completedSteps.has(stepId)) return 'completed';

    const step = steps.find(s => s.id === stepId);
    if (step && step.dependencies.some(dep => !completedSteps.has(dep))) {
      return 'blocked';
    }

    return 'pending';
  };

  const progress = (completedSteps.size / steps.length) * 100;

  return (
    <div className="my-6">
      <h3 className="text-2xl font-bold mb-4">{title}</h3>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
        <div
          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-sm text-gray-600 mb-4">Progress: {Math.round(progress)}% ({completedSteps.size}/{steps.length} steps)</p>

      {/* Workflow steps */}
      <div className="space-y-3">
        {steps.map((step, index) => {
          const status = getStepStatus(step.id);
          const isCompleted = completedSteps.has(step.id);
          const isBlocked = status === 'blocked';

          return (
            <div
              key={step.id}
              className={`rounded-lg border-2 p-4 cursor-pointer transition-all ${
                isCompleted
                  ? 'border-green-500 bg-green-50'
                  : isBlocked
                  ? 'border-gray-300 bg-gray-50 opacity-60'
                  : 'border-blue-300 bg-white hover:border-blue-500'
              }`}
              onClick={() => toggleStep(step.id)}
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                    isCompleted
                      ? 'bg-green-500 text-white'
                      : isBlocked
                      ? 'bg-gray-300 text-gray-600'
                      : 'bg-blue-500 text-white'
                  }`}
                >
                  {isCompleted ? '✓' : step.icon}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-lg">{index + 1}. {step.title}</span>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        isCompleted
                          ? 'bg-green-100 text-green-800'
                          : isBlocked
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {isCompleted ? 'Completed' : isBlocked ? 'Blocked' : 'Pending'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mt-1">{step.description}</p>

                  {step.dependencies.length > 0 && (
                    <div className="text-xs text-gray-500 mt-2">
                      <span className="font-semibold">Dependencies: </span>
                      {step.dependencies.join(', ')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-gray-500 mt-3">
        Click steps to mark as complete. Steps with unmet dependencies will be blocked.
      </p>
    </div>
  );
};