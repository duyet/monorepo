"use client";

import { useState } from "react";
import { Play, Pause, RotateCcw, RefreshCw } from "lucide-react";
import { cn } from "@duyet/libs/utils";

export interface WorkflowNode {
  id: string;
  title: string;
  description: string;
  position: { x: number; y: number };
  color?: string;
}

export interface WorkflowEdge {
  from: string;
  to: string;
  label?: string;
}

export interface WorkflowDiagramProps {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  className?: string;
}

export function WorkflowDiagram({ nodes, edges, className }: WorkflowDiagramProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [visitedNodes, setVisitedNodes] = useState<Set<string>>(new Set());

  const getNodeColor = (node: WorkflowNode) => {
    return node.color || "bg-blue-500";
  };

  const handleStep = () => {
    if (isAnimating) return;

    const nextNode = edges[currentStep]?.to;
    if (nextNode) {
      setVisitedNodes(prev => new Set(prev).add(nextNode));
      setCurrentStep((prev) => (prev + 1) % edges.length);
    }
  };

  const resetAnimation = () => {
    setIsAnimating(false);
    setCurrentStep(0);
    setVisitedNodes(new Set());
  };

  const startAnimation = () => {
    setIsAnimating(true);
    resetAnimation();
  };

  return (
    <div className={cn("w-full max-w-5xl mx-auto", className)}>
      <h2 className="text-2xl font-bold mb-6">Workflow Diagram</h2>

      {/* Controls */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={startAnimation}
          disabled={isAnimating}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
        >
          <Play className="w-4 h-4" />
          Start Animation
        </button>
        <button
          onClick={handleStep}
          disabled={!isAnimating && currentStep === 0}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Next Step
        </button>
        <button
          onClick={resetAnimation}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Reset
        </button>
      </div>

      {/* Diagram Container */}
      <div className="relative bg-white rounded-lg border border-gray-200 shadow-sm p-8 h-96 overflow-hidden">
        <svg className="w-full h-full">
          {/* Edges */}
          {edges.map((edge, index) => {
            const fromNode = nodes.find(n => n.id === edge.from);
            const toNode = nodes.find(n => n.id === edge.to);
            if (!fromNode || !toNode) return null;

            const isActive = isAnimating && index === currentStep;
            const isVisited = visitedNodes.has(edge.to);

            return (
              <g key={index}>
                {/* Edge line */}
                <line
                  x1={fromNode.position.x}
                  y1={fromNode.position.y}
                  x2={toNode.position.x}
                  y2={toNode.position.y}
                  stroke={isActive ? "#3b82f6" : (isVisited ? "#10b981" : "#d1d5db")}
                  strokeWidth={isActive ? 3 : 2}
                  strokeDasharray={isActive ? "5,5" : "0"}
                  className="transition-all duration-500"
                />
                {/* Arrow */}
                <path
                  d={`M ${toNode.position.x} ${toNode.position.y} L ${toNode.position.x - 10} ${toNode.position.y - 5} L ${toNode.position.x - 10} ${toNode.position.y + 5} Z`}
                  fill={isActive ? "#3b82f6" : (isVisited ? "#10b981" : "#9ca3af")}
                  className="transition-all duration-500"
                />
                {/* Edge label */}
                {edge.label && (
                  <text
                    x={(fromNode.position.x + toNode.position.x) / 2}
                    y={(fromNode.position.y + toNode.position.y) / 2 - 10}
                    textAnchor="middle"
                    className="text-sm fill-gray-600"
                  >
                    {edge.label}
                  </text>
                )}
              </g>
            );
          })}

          {/* Nodes */}
          {nodes.map((node) => {
            const isVisited = visitedNodes.has(node.id);
            const isActive = isAnimating && edges[currentStep]?.to === node.id;

            return (
              <g key={node.id}>
                {/* Node circle */}
                <circle
                  cx={node.position.x}
                  cy={node.position.y}
                  r={30}
                  className={cn(
                    "transition-all duration-500",
                    getNodeColor(node),
                    isActive ? "animate-pulse" : "",
                    isVisited ? "opacity-100" : "opacity-80"
                  )}
                />
                {/* Node border */}
                <circle
                  cx={node.position.x}
                  cy={node.position.y}
                  r={32}
                  stroke={isActive ? "#3b82f6" : (isVisited ? "#10b981" : "#d1d5db")}
                  strokeWidth={2}
                  fill="none"
                  className="transition-all duration-500"
                />
                {/* Node icon */}
                <text
                  x={node.position.x}
                  y={node.position.y + 5}
                  textAnchor="middle"
                  className="text-lg font-bold fill-white"
                >
                  {node.id.charAt(0).toUpperCase()}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Node Labels */}
        <div className="absolute inset-0 pointer-events-none">
          {nodes.map((node) => (
            <div
              key={node.id}
              className={cn(
                "absolute transition-all duration-500",
                visitedNodes.has(node.id) ? "text-green-800 font-medium" : "text-gray-600"
              )}
              style={{
                left: node.position.x + 40,
                top: node.position.y - 10,
              }}
            >
              <div className="text-sm font-medium">{node.title}</div>
              <div className="text-xs text-gray-500">{node.description}</div>
            </div>
          ))}
        </div>

        {/* Current Step Info */}
        {isAnimating && (
          <div className="absolute bottom-4 left-4 bg-gray-100 px-4 py-2 rounded-lg">
            <div className="text-sm font-medium">
              Step {currentStep + 1} of {edges.length}
            </div>
            <div className="text-xs text-gray-600">
              {edges[currentStep]?.from} → {edges[currentStep]?.to}
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
          <span>Processing</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded-full"></div>
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
          <span>Pending</span>
        </div>
      </div>
    </div>
  );
}