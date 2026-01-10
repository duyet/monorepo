"use client";

import { useState } from "react";
import * as LucideIcons from "lucide-react";
import { Circle } from "lucide-react";
import type { WorkflowDiagramProps } from "./types";

/**
 * WorkflowDiagram - Connected workflow steps
 * Semantic color system with consistent sizing
 */
const WorkflowDiagram = ({ nodes }: WorkflowDiagramProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getIconComponent = (iconName: string | undefined) => {
    if (!iconName) return Circle;
    return (
      (LucideIcons[iconName as keyof typeof LucideIcons] as React.ComponentType<{
        className?: string;
        size?: number;
      }>) || Circle
    );
  };

  if (nodes.length === 0) {
    return <div className="text-sm text-gray-500 dark:text-gray-400">No workflow</div>;
  }

  return (
    <div className="w-full">
      {/* Desktop: Horizontal flow */}
      <div className="hidden sm:flex items-center justify-between gap-4">
        {nodes.map((node, idx) => {
          const IconComponent = getIconComponent(node.icon);
          const isExpanded = expandedId === node.id;

          return (
            <div key={node.id} className="flex-1 flex flex-col items-center relative">
              {/* Step button */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : node.id)}
                className="flex flex-col items-center gap-3 w-full group focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-slate-950 focus:ring-blue-400 rounded-lg"
              >
                <div className="relative">
                  <div className={`w-16 h-16 rounded-full border-2 flex items-center justify-center transition-all ${
                    isExpanded
                      ? "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-950/30 shadow-md"
                      : "border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 group-hover:border-gray-400 dark:group-hover:border-slate-600"
                  }`}>
                    <IconComponent size={24} className="text-gray-700 dark:text-gray-300" />
                  </div>
                </div>
                <span className="text-center text-sm font-medium text-gray-900 dark:text-white px-2 line-clamp-2">
                  {node.title}
                </span>
              </button>

              {/* Connector arrow */}
              {idx < nodes.length - 1 && (
                <div className="absolute top-8 left-[60%] w-[calc(100%-80px)] h-0.5 bg-gradient-to-r from-gray-300 dark:from-slate-700 to-gray-300 dark:to-slate-700" />
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile: Vertical flow */}
      <div className="sm:hidden space-y-3">
        {nodes.map((node, idx) => {
          const IconComponent = getIconComponent(node.icon);
          const isExpanded = expandedId === node.id;

          return (
            <div key={node.id} className="relative pl-8">
              {/* Connector */}
              {idx < nodes.length - 1 && (
                <div className="absolute left-2.5 top-12 w-0.5 h-6 bg-gradient-to-b from-gray-300 dark:from-slate-700 to-transparent" />
              )}

              {/* Step dot */}
              <div className="absolute left-0 top-2 w-5 h-5 rounded-full border-2 border-white dark:border-slate-950 bg-gray-50 dark:bg-slate-900 ring-2 ring-gray-300 dark:ring-slate-700" />

              {/* Mobile button */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : node.id)}
                className="w-full text-left focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-slate-950 focus:ring-blue-400 rounded-lg"
              >
                <div className={`rounded-lg border p-3.5 transition-all ${
                  isExpanded
                    ? "border-blue-400 dark:border-blue-500 bg-blue-50 dark:bg-blue-950/20"
                    : "border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-gray-300 dark:hover:border-slate-700"
                }`}>
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-100 dark:bg-slate-900 flex items-center justify-center border border-gray-200 dark:border-slate-800">
                      <IconComponent size={20} className="text-gray-600 dark:text-gray-400" />
                    </div>
                    <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                      {node.title}
                    </h3>
                  </div>
                </div>
              </button>

              {/* Expanded content */}
              {isExpanded && (
                <div className="mt-2 ml-4 p-3.5 rounded-lg bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {node.description}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Desktop expanded details */}
      {expandedId && (
        <div className="hidden sm:block mt-8 p-6 rounded-lg bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800">
          {nodes.map((node) => {
            if (node.id !== expandedId) return null;
            return (
              <div key={node.id} className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white dark:bg-slate-950 flex items-center justify-center border-2 border-gray-200 dark:border-slate-800">
                    {(() => {
                      const IconComponent = getIconComponent(node.icon);
                      return <IconComponent size={20} className="text-gray-700 dark:text-gray-300" />;
                    })()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 dark:text-white text-base mb-1">
                      {node.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {node.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WorkflowDiagram;
