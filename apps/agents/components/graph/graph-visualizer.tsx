"use client";

/**
 * Graph Visualization Component (Unit 16)
 *
 * Displays node-edge graph for conversation execution using React Flow.
 * Shows execution path with active nodes and outcomes.
 */

import { useCallback } from "react";
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  type Edge,
  type Node,
  type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/style.css";
import type { VisualGraphData, NodeTrace } from "@/lib/graph";
import { cn } from "@duyet/libs";

// Custom node component for graph nodes
function GraphNode({ data }: { data: GraphNodeData }) {
  const { label, description, nodeType, status, duration } = data;

  const statusColors = {
    pending: "bg-gray-100 border-gray-300 text-gray-600",
    running: "bg-blue-50 border-blue-300 text-blue-600",
    success: "bg-green-50 border-green-300 text-green-600",
    error: "bg-red-50 border-red-300 text-red-600",
  };

  const statusIcons = {
    pending: "○",
    running: "⟳",
    success: "✓",
    error: "✕",
  };

  return (
    <div
      className={cn(
        "px-3 py-2 rounded-lg border-2 shadow-sm min-w-[140px] max-w-[200px]",
        statusColors[status || "pending"]
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold">{statusIcons[status || "pending"]}</span>
        <span className="text-sm font-medium truncate">{label}</span>
      </div>
      {description && (
        <p className="text-xs mt-1 text-current opacity-75 line-clamp-2">
          {description}
        </p>
      )}
      {duration !== undefined && (
        <p className="text-xs mt-1 font-mono opacity-75">{duration}ms</p>
      )}
    </div>
  );
}

interface GraphNodeData {
  label: string;
  description?: string;
  nodeType: string;
  status?: "pending" | "running" | "success" | "error";
  duration?: number;
}

interface GraphVisualizerProps {
  /** Graph structure data from GraphRouter.getVisualGraph() */
  graphData: VisualGraphData;
  /** Node execution traces for status display */
  traces?: NodeTrace[];
  /** Currently active node ID */
  activeNodeId?: string;
  /** Read-only mode (no interaction) */
  readOnly?: boolean;
  /** Additional CSS class name */
  className?: string;
}

const nodeTypes: NodeTypes = {
  custom: GraphNode,
};

/**
 * Graph Visualization Component
 *
 * Displays the agent execution graph with nodes and edges.
 * Shows execution status based on traces and highlights active nodes.
 */
export function GraphVisualizer({
  graphData,
  traces = [],
  activeNodeId,
  readOnly = true,
  className,
}: GraphVisualizerProps) {
  // Create a map of node status from traces
  const nodeStatusMap = useCallback(() => {
    const map = new Map<
      string,
      { status: "pending" | "running" | "success" | "error"; duration?: number }
    >();

    // Get the most recent trace for each node
    for (const trace of traces) {
      const existing = map.get(trace.nodeId);
      // Use the most recent trace (later traces override earlier ones)
      map.set(trace.nodeId, {
        status: trace.outcome === "running" ? "running" : trace.outcome === "success" ? "success" : trace.outcome === "error" ? "error" : "pending",
        duration: trace.duration,
      });
    }

    // Mark active node as running if not already set
    if (activeNodeId && !map.has(activeNodeId)) {
      map.set(activeNodeId, { status: "running" });
    }

    return map;
  }, [traces, activeNodeId]);

  const statusMap = nodeStatusMap();

  // Convert visual graph data to React Flow format
  const nodes: Node<GraphNodeData>[] = graphData.nodes.map((node) => {
    const statusInfo = statusMap.get(node.id);
    const isActive = node.id === activeNodeId;

    return {
      id: node.id,
      type: "custom",
      position: node.position,
      data: {
        label: node.data.label,
        description: node.data.description,
        nodeType: node.data.nodeType,
        status: statusInfo?.status || (isActive ? "running" : "pending"),
        duration: statusInfo?.duration,
      },
      // Highlight active nodes
      className: isActive ? "ring-2 ring-blue-500 ring-offset-2" : "",
    };
  });

  const edges: Edge[] = graphData.edges.map((edge) => {
    const isEdgeActive =
      activeNodeId && edge.source === activeNodeId;

    return {
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: "smoothstep",
      animated: isEdgeActive || edge.animated,
      label: edge.label,
      // Style active edges differently
      className: isEdgeActive
        ? "stroke-blue-500 stroke-2"
        : "stroke-gray-400",
      labelStyle: {
        fontSize: "10px",
        fontWeight: 500,
      },
    };
  });

  return (
    <div className={cn("w-full h-full bg-background", className)}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        preventScrolling={!readOnly}
        panOnScroll={!readOnly}
        zoomOnScroll={!readOnly}
        panOnDrag={!readOnly}
        zoomOnPinch={!readOnly}
        selectNodesOnDrag={!readOnly}
        nodesDraggable={!readOnly}
        nodesConnectable={false}
        elementsSelectable={false}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#cbd5e1" gap={16} />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            const data = node.data as GraphNodeData;
            switch (data.status) {
              case "running":
                return "#3b82f6"; // blue
              case "success":
                return "#22c55e"; // green
              case "error":
                return "#ef4444"; // red
              default:
                return "#d1d5db"; // gray
            }
          }}
          maskColor="rgba(0, 0, 0, 0.05)"
        />
      </ReactFlow>
    </div>
  );
}

/**
 * Empty state component when no graph data is available
 */
export function GraphVisualizerEmpty({
  message = "No graph data available",
  className,
}: {
  message?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center h-full bg-muted/20 rounded-lg border border-dashed border-muted-foreground/25",
        className
      )}
    >
      <div className="text-center p-6">
        <svg
          className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        <p className="text-sm font-medium text-muted-foreground">{message}</p>
        <p className="text-xs mt-1 text-muted-foreground/75">
          Graph data will appear here when a conversation is active.
        </p>
      </div>
    </div>
  );
}
