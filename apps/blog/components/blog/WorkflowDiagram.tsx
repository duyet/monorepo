"use client";

import { useState, useEffect } from "react";
import * as LucideIcons from "lucide-react";
import { Circle } from "lucide-react";
import type { WorkflowDiagramProps, WorkflowNode } from "./types";

const WorkflowDiagram = ({ nodes, className = "" }: WorkflowDiagramProps) => {
  const [expandedNodeId, setExpandedNodeId] = useState<string | null>(null);

  // Get icon component safely with fallback
  const getIconComponent = (iconName: string | undefined) => {
    if (!iconName) {
      return Circle;
    }
    const IconComponent =
      (LucideIcons[
        iconName as keyof typeof LucideIcons
      ] as React.ComponentType<{
        className?: string;
        size?: number;
      }>) || Circle;
    return IconComponent;
  };

  const toggleNode = (nodeId: string) => {
    setExpandedNodeId(expandedNodeId === nodeId ? null : nodeId);
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    nodeId: string
  ) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleNode(nodeId);
    }
  };

  // Check if we're on mobile
  const isMobile = () => {
    if (typeof window === "undefined") return false;
    return window.innerWidth < 768;
  };

  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    setMobile(isMobile());
    const handleResize = () => setMobile(isMobile());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Desktop compact layout
  const DesktopLayout = () => (
    <div className="relative mx-auto w-full max-w-2xl py-6">
      {/* SVG for arrows - minimal */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 400 400"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        {/* Arrow 1: Top to Right */}
        <path
          d="M 200 50 Q 280 150 280 250"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
          className="text-amber-200 dark:text-amber-800"
          markerEnd="url(#arrowhead-1)"
          strokeLinecap="round"
        />
        <defs>
          <marker
            id="arrowhead-1"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3, 0 6"
              fill="currentColor"
              className="text-amber-200 dark:text-amber-800"
            />
          </marker>
        </defs>

        {/* Arrow 2: Right to Left */}
        <path
          d="M 280 250 Q 200 300 120 250"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
          className="text-amber-200 dark:text-amber-800"
          markerEnd="url(#arrowhead-2)"
          strokeLinecap="round"
        />
        <defs>
          <marker
            id="arrowhead-2"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3, 0 6"
              fill="currentColor"
              className="text-amber-200 dark:text-amber-800"
            />
          </marker>
        </defs>

        {/* Arrow 3: Left to Top */}
        <path
          d="M 120 250 Q 100 150 200 50"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
          className="text-amber-200 dark:text-amber-800"
          markerEnd="url(#arrowhead-3)"
          strokeLinecap="round"
        />
        <defs>
          <marker
            id="arrowhead-3"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3, 0 6"
              fill="currentColor"
              className="text-amber-200 dark:text-amber-800"
            />
          </marker>
        </defs>
      </svg>

      {/* Nodes container */}
      <div className="relative flex h-72 items-center justify-center">
        {/* Top node */}
        {nodes.length > 0 && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 transform">
            <WorkflowNodeCard
              node={nodes[0]}
              isExpanded={expandedNodeId === nodes[0].id}
              onToggle={() => toggleNode(nodes[0].id)}
              onKeyDown={(e) => handleKeyDown(e, nodes[0].id)}
              getIconComponent={getIconComponent}
            />
          </div>
        )}

        {/* Right node */}
        {nodes.length > 1 && (
          <div className="absolute right-0 top-1/2 -translate-y-1/2 transform">
            <WorkflowNodeCard
              node={nodes[1]}
              isExpanded={expandedNodeId === nodes[1].id}
              onToggle={() => toggleNode(nodes[1].id)}
              onKeyDown={(e) => handleKeyDown(e, nodes[1].id)}
              getIconComponent={getIconComponent}
            />
          </div>
        )}

        {/* Left node */}
        {nodes.length > 2 && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 transform">
            <WorkflowNodeCard
              node={nodes[2]}
              isExpanded={expandedNodeId === nodes[2].id}
              onToggle={() => toggleNode(nodes[2].id)}
              onKeyDown={(e) => handleKeyDown(e, nodes[2].id)}
              getIconComponent={getIconComponent}
            />
          </div>
        )}
      </div>
    </div>
  );

  // Mobile vertical compact layout
  const MobileLayout = () => (
    <div className="space-y-4 py-4">
      {nodes.map((node, index) => (
        <div key={node.id}>
          <WorkflowNodeCard
            node={node}
            isExpanded={expandedNodeId === node.id}
            onToggle={() => toggleNode(node.id)}
            onKeyDown={(e) => handleKeyDown(e, node.id)}
            getIconComponent={getIconComponent}
          />

          {/* Down arrow between nodes */}
          {index < nodes.length - 1 && (
            <div className="flex justify-center py-2 text-amber-200 dark:text-amber-800" aria-hidden="true">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          )}

          {/* Loop arrow after last node */}
          {index === nodes.length - 1 && (
            <div className="flex justify-center py-2 text-amber-200 dark:text-amber-800" aria-hidden="true">
              <div className="flex flex-col items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
                <span className="text-xs text-amber-300 dark:text-amber-700">loops</span>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className={`w-full ${className}`}>
      {mobile ? <MobileLayout /> : <DesktopLayout />}
    </div>
  );
};

interface WorkflowNodeCardProps {
  node: WorkflowNode;
  isExpanded: boolean;
  onToggle: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLButtonElement>) => void;
  getIconComponent: (
    iconName: string | undefined
  ) => React.ComponentType<{ className?: string; size?: number }>;
}

const WorkflowNodeCard = ({
  node,
  isExpanded,
  onToggle,
  onKeyDown,
  getIconComponent,
}: WorkflowNodeCardProps) => {
  const IconComponent = getIconComponent(node.icon);

  return (
    <button
      onClick={onToggle}
      onKeyDown={onKeyDown}
      className="w-40 rounded-2xl border border-amber-100 bg-amber-50/80 p-3 transition-all duration-200 hover:border-amber-200 hover:bg-amber-50 dark:border-amber-900/30 dark:bg-amber-950/20 dark:hover:border-amber-800/50 focus:outline-none focus:ring-2 focus:ring-amber-300/50 dark:focus:ring-amber-700/50"
      aria-expanded={isExpanded}
      aria-label={`${node.title}, press Enter to expand details`}
    >
      <div className="mb-2 flex justify-center text-amber-700 dark:text-amber-600">
        <IconComponent size={24} />
      </div>

      <h3 className="text-sm font-semibold text-amber-950 dark:text-amber-100">
        {node.title}
      </h3>

      {/* Expandable description */}
      {isExpanded && (
        <p className="mt-2 text-xs text-amber-800 dark:text-amber-200">
          {node.description}
        </p>
      )}

      {/* Expand indicator */}
      <div className="mt-2 flex items-center justify-center text-amber-500 dark:text-amber-600">
        <svg
          className={`h-3 w-3 transition-transform ${isExpanded ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </div>
    </button>
  );
};

export default WorkflowDiagram;
