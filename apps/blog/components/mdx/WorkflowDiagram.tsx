import React from "react";

interface WorkflowDiagramProps {
  steps: Array<{
    title: string;
    description: string;
    icon?: string;
  }>;
}

export const WorkflowDiagram: React.FC<WorkflowDiagramProps> = ({ steps }) => {
  const stepCount = steps.length;
  const radius = 120;
  const center = 150;

  return (
    <div className="w-full max-w-2xl mx-auto mb-8 relative">
      <h3 className="text-2xl font-bold mb-6 text-center">Workflow Diagram</h3>
      <div className="relative h-96">
        <svg
          className="w-full h-full"
          viewBox="0 0 300 300"
          xmlns="http://www.w3.org/2000/svg"
        >
          {steps.map((step, index) => {
            const angle = (index / stepCount) * Math.PI * 2 - Math.PI / 2;
            const x = center + Math.cos(angle) * radius;
            const y = center + Math.sin(angle) * radius;

            const nextIndex = (index + 1) % stepCount;
            const nextAngle = (nextIndex / stepCount) * Math.PI * 2 - Math.PI / 2;
            const nextX = center + Math.cos(nextAngle) * radius;
            const nextY = center + Math.sin(nextAngle) * radius;

            const arrowAngle = Math.atan2(nextY - y, nextX - x);
            const arrowX = nextX - Math.cos(arrowAngle) * 15;
            const arrowY = nextY - Math.sin(arrowAngle) * 15;

            return (
              <g key={index}>
                <circle
                  cx={x}
                  cy={y}
                  r="30"
                  fill="#3b82f6"
                  stroke="#2563eb"
                  strokeWidth="2"
                />
                <text
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize="12"
                  fontWeight="bold"
                >
                  {index + 1}
                </text>
                <path
                  d={`M${x},${y} L${arrowX},${arrowY}`}
                  stroke="#3b82f6"
                  strokeWidth="2"
                  fill="none"
                  markerEnd="url(#arrowhead)"
                />
              </g>
            );
          })}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
            </marker>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-blue-500 text-white rounded-full w-20 h-20 flex items-center justify-center font-bold text-lg">
            Workflow
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-8">
        {steps.map((step, index) => (
          <div key={index} className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
            <h4 className="font-semibold mb-1">{step.title}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};