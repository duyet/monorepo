import { useState } from "react";
import { ArrowRight, ArrowLeft } from "lucide-react";

export interface WorkflowStep {
  id: string;
  label: string;
  description: string;
}

export interface WorkflowDiagramProps {
  title?: string;
  steps: WorkflowStep[];
  circular?: boolean;
}

/**
 * WorkflowDiagram - Circular flow with animated arrows
 * Displays workflow steps in a circular diagram with smooth transitions
 */
export function WorkflowDiagram({
  title = "Workflow Diagram",
  steps,
  circular = true
}: WorkflowDiagramProps) {
  const [activeStep, setActiveStep] = useState<number>(0);

  if (steps.length < 2) {
    return <p>Workflow requires at least 2 steps</p>;
  }

  const handleNext = () => {
    setActiveStep((prev) => (prev + 1) % steps.length);
  };

  const handlePrev = () => {
    setActiveStep((prev) => (prev - 1 + steps.length) % steps.length);
  };

  // Circular layout
  if (circular) {
    return (
      <div className="my-6">
        <h3 className="text-2xl font-bold mb-6">{title}</h3>
        <div className="relative w-full max-w-2xl mx-auto h-[300px]">
          {/* Central Active Step */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white p-6 rounded-lg shadow-2xl min-w-[200px] text-center transform scale-110 z-20">
              <div className="text-2xl font-bold mb-2">{steps[activeStep].label}</div>
              <div className="text-sm opacity-90">{steps[activeStep].description}</div>
              <div className="mt-3 text-xs font-mono bg-white/20 inline-block px-2 py-1 rounded">
                {steps[activeStep].id}
              </div>
            </div>
          </div>

          {/* Circular Arrangement of Other Steps */}
          {steps.map((step, idx) => {
            if (idx === activeStep) return null;

            const angle = ((idx - activeStep) / steps.length) * 2 * Math.PI;
            const radius = 100;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;

            return (
              <div
                key={step.id}
                className="absolute top-1/2 left-1/2 transition-all duration-500 ease-in-out"
                style={{
                  transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
                }}
              >
                <div
                  className={`p-3 rounded-lg shadow-lg min-w-[140px] text-center border-2 transition-all duration-300 ${
                    idx === (activeStep + 1) % steps.length
                      ? "border-green-500 bg-green-50 dark:bg-green-900/30"
                      : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                  }`}
                >
                  <div className="font-semibold text-sm">{step.label}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{step.id}</div>
                </div>
              </div>
            );
          })}

          {/* Animated Connecting Arrows */}
          <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
            {steps.map((_, idx) => {
              if (idx === activeStep) return null;
              const nextIdx = (idx + 1) % steps.length;
              if (nextIdx === activeStep) return null;

              const angle = ((idx - activeStep) * 2 * Math.PI) / steps.length;
              const nextAngle = ((nextIdx - activeStep) * 2 * Math.PI) / steps.length;
              const radius = 100;
              const centerX = 400; // Adjust based on container width
              const centerY = 150;

              const x1 = centerX + Math.cos(angle) * radius;
              const y1 = centerY + Math.sin(angle) * radius;
              const x2 = centerX + Math.cos(nextAngle) * radius;
              const y2 = centerY + Math.sin(nextAngle) * radius;

              return (
                <defs key={idx}>
                  <marker id={`arrowhead-${idx}`} markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#9ca3af" />
                  </marker>
                </defs>
              );
            })}

            {steps.map((_, idx) => {
              if (idx === activeStep) return null;
              const nextIdx = (idx + 1) % steps.length;
              if (nextIdx === activeStep) return null;

              const angle = ((idx - activeStep) * 2 * Math.PI) / steps.length;
              const nextAngle = ((nextIdx - activeStep) * 2 * Math.PI) / steps.length;
              const radius = 100;

              const x1 = 50 + 50 + Math.cos(angle) * radius;
              const y1 = 50 + 50 + Math.sin(angle) * radius;
              const x2 = 50 + 50 + Math.cos(nextAngle) * radius;
              const y2 = 50 + 50 + Math.sin(nextAngle) * radius;

              return (
                <path
                  key={idx}
                  d={`M ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2}`}
                  fill="none"
                  stroke="#9ca3af"
                  strokeWidth="2"
                  markerEnd={`url(#arrowhead-${idx})`}
                  className="opacity-50"
                />
              );
            })}
          </svg>

          {/* Navigation Controls */}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
            <button
              onClick={handlePrev}
              className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 text-xs text-gray-500 dark:text-gray-400">
            Click arrows to advance workflow
          </div>
        </div>
      </div>
    );
  }

  // Linear layout
  return (
    <div className="my-6">
      <h3 className="text-2xl font-bold mb-6">{title}</h3>
      <div className="space-y-4">
        {steps.map((step, idx) => (
          <div key={step.id} className="relative pl-8">
            <div className="absolute left-0 top-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
              {idx + 1}
            </div>
            {idx < steps.length - 1 && (
              <div className="absolute left-3 top-8 w-0.5 h-full bg-gray-300 dark:bg-gray-600"></div>
            )}
            <div className={`p-4 rounded-lg border-2 ${idx === activeStep ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"}`}>
              <div className="font-semibold text-lg">{step.label}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">{step.description}</div>
              <div className="text-xs font-mono text-gray-500 dark:text-gray-400 mt-2">{step.id}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}