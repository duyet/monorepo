import { useState } from "react";
import { ArrowRight, CheckCircle, Circle, AlertCircle } from "lucide-react";

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  status: "completed" | "in-progress" | "pending" | "blocked";
  dependencies?: string[];
}

interface WorkflowDiagramProps {
  steps: WorkflowStep[];
  title?: string;
  onStepClick?: (step: WorkflowStep) => void;
}

export function WorkflowDiagram({ steps, title = "Workflow Diagram", onStepClick }: WorkflowDiagramProps) {
  const [selectedStep, setSelectedStep] = useState<WorkflowStep | null>(null);

  const getStatusColor = (status: WorkflowStep["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-100 border-green-300 text-green-800 hover:bg-green-200";
      case "in-progress":
        return "bg-blue-100 border-blue-300 text-blue-800 hover:bg-blue-200";
      case "pending":
        return "bg-gray-100 border-gray-300 text-gray-800 hover:bg-gray-200";
      case "blocked":
        return "bg-red-100 border-red-300 text-red-800 hover:bg-red-200";
    }
  };

  const getStatusIcon = (status: WorkflowStep["status"]) => {
    const className = "w-4 h-4";
    switch (status) {
      case "completed":
        return <CheckCircle className={`${className} text-green-500`} />;
      case "in-progress":
        return <Circle className={`${className} text-blue-500 animate-pulse`} />;
      case "pending":
        return <Circle className={`${className} text-gray-400`} />;
      case "blocked":
        return <AlertCircle className={`${className} text-red-500`} />;
    }
  };

  const getStepPosition = (index: number, total: number) => {
    if (total <= 3) {
      return index * 33.33;
    } else if (total <= 5) {
      return index * 25;
    } else {
      return (index * 100) / (total - 1);
    }
  };

  return (
    <div className="my-6">
      {title && <h3 className="text-2xl font-bold mb-4">{title}</h3>}
      <div className="relative">
        {/* Progress line */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 transform -translate-y-1/2"></div>

        <div className="relative">
          {steps.map((step, index) => {
            const position = getStepPosition(index, steps.length);
            const isLast = index === steps.length - 1;

            return (
              <div
                key={step.id}
                className={`absolute transform -translate-x-1/2 cursor-pointer transition-all ${
                  selectedStep?.id === step.id ? 'scale-110 z-10' : ''
                }`}
                style={{ left: `${position}%`, top: '50%' }}
                onClick={() => {
                  setSelectedStep(step);
                  onStepClick?.(step);
                }}
              >
                {/* Step connector */}
                {!isLast && (
                  <div className="absolute top-1/2 left-1/2 w-8 h-1 bg-gray-300 transform -translate-x-1/2 -translate-y-1/2"></div>
                )}

                {/* Step circle */}
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${getStatusColor(step.status)}`}>
                  {getStatusIcon(step.status)}
                </div>

                {/* Step content */}
                <div
                  className={`mt-2 px-3 py-2 rounded-lg border min-w-[150px] text-center ${
                    selectedStep?.id === step.id ? 'ring-2 ring-primary' : ''
                  } ${getStatusColor(step.status)}`}
                >
                  <h4 className="font-semibold text-sm">{step.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {step.status}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Details panel */}
      {selectedStep && (
        <div className="mt-8 p-4 bg-muted rounded-lg">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            {selectedStep.title}
            {getStatusIcon(selectedStep.status)}
          </h4>
          <p className="text-sm text-muted-foreground mb-3">{selectedStep.description}</p>
          {selectedStep.dependencies && selectedStep.dependencies.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Dependencies:</p>
              <div className="flex flex-wrap gap-2">
                {selectedStep.dependencies.map((dep, idx) => (
                  <span key={idx} className="text-xs bg-background px-2 py-1 rounded">
                    {dep}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-6 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span>In Progress</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gray-400"></div>
          <span>Pending</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span>Blocked</span>
        </div>
      </div>
    </div>
  );
}