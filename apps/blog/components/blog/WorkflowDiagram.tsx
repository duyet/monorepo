"use client";

import type { WorkflowDiagramProps } from "./types";

/**
 * WorkflowDiagram - Connected workflow steps
 * Simple text-based flow with step descriptions
 */
const WorkflowDiagram = ({ nodes }: WorkflowDiagramProps) => {
  if (nodes.length === 0) {
    return <div className="text-xs text-gray-500 dark:text-gray-400">No workflow</div>;
  }

  return (
    <div className="space-y-1.5 text-xs">
      {/* Flow line with arrows */}
      <div className="flex items-center gap-1 text-gray-400 dark:text-gray-600 mb-2">
        {nodes.map((node, idx) => (
          <span key={node.id}>
            <span className="inline-block px-1 py-0.5 text-gray-900 dark:text-white font-medium">
              {node.title}
            </span>
            {idx < nodes.length - 1 && <span className="mx-1">→</span>}
          </span>
        ))}
      </div>

      {/* Step descriptions */}
      <div className="space-y-2 text-gray-700 dark:text-gray-300">
        {nodes.map((node, idx) => (
          <div key={node.id} className="flex gap-2">
            <span className="text-gray-500 dark:text-gray-400 flex-shrink-0">
              {idx + 1}.
            </span>
            <div>
              <span className="font-medium text-gray-900 dark:text-white">
                {node.title}
              </span>
              {node.description && (
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mt-0.5">
                  {node.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkflowDiagram;
