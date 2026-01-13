import { ReactNode } from "react";

interface WorkflowNode {
  id: string;
  label: string;
  icon?: ReactNode;
  color?: string;
}

interface WorkflowDiagramProps {
  nodes: WorkflowNode[];
  circular?: boolean;
  animated?: boolean;
}

export function WorkflowDiagram({ nodes, circular = true, animated = true }: WorkflowDiagramProps) {
  const defaultColors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

  // Use circular layout for nodes
  const layoutNodes = nodes.map((node, index) => {
    const angle = (360 / nodes.length) * index - 90; // Start from top
    const radius = 150;
    const x = Math.cos((angle * Math.PI) / 180) * radius;
    const y = Math.sin((angle * Math.PI) / 180) * radius;

    return {
      ...node,
      color: node.color || defaultColors[index % defaultColors.length],
      x,
      y,
    };
  });

  return (
    <div className="my-8 flex flex-col items-center">
      {/* Central circle container */}
      <div className="relative w-[400px] h-[400px] mx-auto">
        {/* Animated arrows in a circular pattern */}
        {animated && (
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 400">
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="10"
                refX="9"
                refY="3"
                orient="auto"
                className="fill-gray-400"
              >
                <polygon points="0 0, 10 3, 0 6" />
              </marker>
            </defs>
            {/* Create circular path with arrows */}
            <circle
              cx="200"
              cy="200"
              r="150"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeDasharray="5,5"
              className="text-gray-300 dark:text-gray-700"
            />
          </svg>
        )}

        {/* Central node */}
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold shadow-lg animate-pulse">
            Start
          </div>
        </div>

        {/* Workflow nodes */}
        {layoutNodes.map((node, index) => (
          <div
            key={node.id}
            className={`absolute transform transition-all duration-500 ${
              animated ? "hover:scale-110" : ""
            }`}
            style={{
              left: `calc(50% + ${node.x}px - 40px)`,
              top: `calc(50% + ${node.y}px - 20px)`,
            }}
          >
            <div
              className="w-20 h-20 rounded-lg shadow-lg p-2 flex flex-col items-center justify-center text-center"
              style={{
                backgroundColor: node.color,
                color: "white",
              }}
            >
              <div className="text-2xl mb-1">{node.icon || "⚙️"}</div>
              <div className="text-xs font-semibold leading-tight">{node.label}</div>
            </div>
            {/* Connecting arrow */}
            <svg
              className="absolute inset-0 pointer-events-none"
              width="80"
              height="80"
              style={{ left: "0", top: "0" }}
            >
              <line
                x1="40"
                y1="40"
                x2="200"
                y2="200"
                stroke="rgba(0,0,0,0.2)"
                strokeWidth="1"
                opacity="0"
              />
            </svg>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        {layoutNodes.map((node, index) => (
          <div key={node.id} className="flex items-center gap-2 text-sm">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: node.color }}
            ></div>
            <span>{node.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Alternative: Vertical workflow with connections
export function VerticalWorkflow({ nodes, animated = true }: WorkflowDiagramProps) {
  const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

  return (
    <div className="my-8 max-w-2xl mx-auto">
      <div className="flex flex-col items-center space-y-6">
        {nodes.map((node, index) => (
          <div key={node.id} className="relative w-full">
            {/* Node */}
            <div
              className="mx-auto w-48 p-4 rounded-lg shadow-lg flex items-center justify-center gap-2"
              style={{
                backgroundColor: node.color || colors[index % colors.length],
                color: "white",
              }}
            >
              {node.icon && <span className="text-xl">{node.icon}</span>}
              <span className="font-semibold text-center">{node.label}</span>
            </div>

            {/* Connecting arrow */}
            {index < nodes.length - 1 && (
              <div className="flex justify-center py-2">
                <svg width="24" height="24" viewBox="0 0 24 24" className="text-gray-400">
                  <path
                    d="M12 4v12m0 0l-4-4m4 4l4-4"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                    className={animated ? "animate-bounce" : ""}
                  />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}