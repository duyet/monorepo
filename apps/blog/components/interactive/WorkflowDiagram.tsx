import React, { useState, useEffect } from "react";

interface WorkflowStep {
  name: string;
  description?: string;
}

interface WorkflowDiagramProps {
  title: string;
  steps: WorkflowStep[];
}

/**
 * WorkflowDiagram - Interactive workflow with progress tracking
 */
export const WorkflowDiagram: React.FC<WorkflowDiagramProps> = ({ title, steps }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isAnimating) {
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isAnimating]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setIsAnimating(true);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setIsAnimating(true);
    }
  };

  const handleStepClick = (index: number) => {
    setCurrentStep(index);
    setIsAnimating(true);
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="my-6">
      <h3 className="text-xl font-bold mb-4">{title}</h3>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className={`bg-blue-500 h-2 rounded-full transition-all duration-500 ${isAnimating ? "scale-105" : ""}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Circular workflow visualization */}
      <div className="flex justify-center mb-6">
        <div className="relative">
          <svg width="240" height="240" viewBox="0 0 240 240">
            {/* Connecting circles */}
            {steps.map((_, idx) => {
              if (idx === steps.length - 1) return null;
              const angle1 = (idx * 2 * Math.PI) / steps.length - Math.PI / 2;
              const angle2 = ((idx + 1) * 2 * Math.PI) / steps.length - Math.PI / 2;
              const x1 = 120 + 80 * Math.cos(angle1);
              const y1 = 120 + 80 * Math.sin(angle1);
              const x2 = 120 + 80 * Math.cos(angle2);
              const y2 = 120 + 80 * Math.sin(angle2);
              return (
                <line
                  key={`line-${idx}`}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#d1d5db"
                  strokeWidth="2"
                />
              );
            })}

            {/* Step circles */}
            {steps.map((step, idx) => {
              const angle = (idx * 2 * Math.PI) / steps.length - Math.PI / 2;
              const x = 120 + 80 * Math.cos(angle);
              const y = 120 + 80 * Math.sin(angle);
              const isActive = idx === currentStep;
              const isCompleted = idx < currentStep;

              return (
                <g key={idx} onClick={() => handleStepClick(idx)} style={{ cursor: "pointer" }}>
                  <circle
                    cx={x}
                    cy={y}
                    r={isActive ? 18 : 14}
                    fill={
                      isCompleted
                        ? "#22c55e"
                        : isActive
                        ? "#3b82f6"
                        : "#e5e7eb"
                    }
                    className={`transition-all duration-300 ${isActive ? "opacity-100" : "opacity-90"}`}
                    stroke={isActive ? "#1e40af" : "none"}
                    strokeWidth={isActive ? 2 : 0}
                  />
                  <text
                    x={x}
                    y={y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={isActive || isCompleted ? "white" : "#374151"}
                    fontSize="10"
                    fontWeight="bold"
                    pointerEvents="none"
                  >
                    {idx + 1}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Current step details */}
      <div className={`bg-blue-50 dark:bg-blue-950 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-4 transition-all duration-300 ${isAnimating ? "scale-100" : "scale-98"}`}>
        <div className="flex items-start gap-3">
          <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold shrink-0">
            {currentStep + 1}
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-lg mb-1">{steps[currentStep].name}</h4>
            {steps[currentStep].description && (
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                {steps[currentStep].description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Navigation controls */}
      <div className="flex justify-center gap-4 mt-4">
        <button
          onClick={handlePrevious}
          disabled={currentStep === 0}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          ← Previous
        </button>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <span className="font-mono">
            {currentStep + 1} / {steps.length}
          </span>
        </div>
        <button
          onClick={handleNext}
          disabled={currentStep === steps.length - 1}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
        >
          Next →
        </button>
      </div>
    </div>
  );
};

export default WorkflowDiagram;