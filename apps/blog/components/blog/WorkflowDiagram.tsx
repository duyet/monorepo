"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import * as LucideIcons from "lucide-react";
import { ArrowDown, Circle } from "lucide-react";
import type { WorkflowDiagramProps, WorkflowNode } from "./types";

const WorkflowDiagram = ({ nodes, className = "" }: WorkflowDiagramProps) => {
  const [expandedNodeId, setExpandedNodeId] = useState<string | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check for prefers-reduced-motion on mount
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) =>
      setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

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

  const handleKeyPress = (
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

  // Desktop circular layout
  const DesktopLayout = () => (
    <div className="relative mx-auto w-full max-w-2xl py-12">
      {/* SVG for arrows */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 400 400"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        {/* Arrow 1: Top to Right */}
        <motion.path
          d="M 200 50 Q 280 150 280 250"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          className="text-gray-400 dark:text-gray-600"
          markerEnd="url(#arrowhead-1)"
          strokeLinecap="round"
          animate={{
            pathLength: prefersReducedMotion ? 1 : [0, 1],
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "loop" as const,
            ease: "easeInOut" as const,
          }}
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
              className="text-gray-400 dark:text-gray-600"
            />
          </marker>
        </defs>

        {/* Arrow 2: Right to Left */}
        <motion.path
          d="M 280 250 Q 200 300 120 250"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          className="text-gray-400 dark:text-gray-600"
          markerEnd="url(#arrowhead-2)"
          strokeLinecap="round"
          animate={{
            pathLength: prefersReducedMotion ? 1 : [0, 1],
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "loop" as const,
            ease: "easeInOut" as const,
          }}
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
              className="text-gray-400 dark:text-gray-600"
            />
          </marker>
        </defs>

        {/* Arrow 3: Left to Top */}
        <motion.path
          d="M 120 250 Q 100 150 200 50"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          className="text-gray-400 dark:text-gray-600"
          markerEnd="url(#arrowhead-3)"
          strokeLinecap="round"
          animate={{
            pathLength: prefersReducedMotion ? 1 : [0, 1],
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "loop" as const,
            ease: "easeInOut" as const,
          }}
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
              className="text-gray-400 dark:text-gray-600"
            />
          </marker>
        </defs>
      </svg>

      {/* Nodes container - triangular arrangement */}
      <div className="relative flex h-80 items-center justify-center">
        {/* Top node */}
        {nodes.length > 0 && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 transform">
            <WorkflowNodeCard
              node={nodes[0]}
              isExpanded={expandedNodeId === nodes[0].id}
              onToggle={() => toggleNode(nodes[0].id)}
              onKeyPress={(e) => handleKeyPress(e, nodes[0].id)}
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
              onKeyPress={(e) => handleKeyPress(e, nodes[1].id)}
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
              onKeyPress={(e) => handleKeyPress(e, nodes[2].id)}
              getIconComponent={getIconComponent}
            />
          </div>
        )}
      </div>
    </div>
  );

  // Mobile vertical layout
  const MobileLayout = () => (
    <div className="space-y-8 py-8">
      {nodes.map((node, index) => (
        <div key={node.id}>
          <WorkflowNodeCard
            node={node}
            isExpanded={expandedNodeId === node.id}
            onToggle={() => toggleNode(node.id)}
            onKeyPress={(e) => handleKeyPress(e, node.id)}
            getIconComponent={getIconComponent}
          />

          {/* Down arrow between nodes */}
          {index < nodes.length - 1 && (
            <motion.div
              className="flex justify-center py-4 text-gray-400 dark:text-gray-600"
              animate={{
                opacity: prefersReducedMotion ? 1 : [0.6, 1, 0.6],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "loop" as const,
                ease: "easeInOut" as const,
              }}
              aria-hidden="true"
            >
              <ArrowDown size={24} />
            </motion.div>
          )}

          {/* Loop arrow after last node */}
          {index === nodes.length - 1 && (
            <motion.div
              className="flex justify-center py-4 text-gray-400 dark:text-gray-600"
              animate={{
                opacity: prefersReducedMotion ? 1 : [0.6, 1, 0.6],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "loop" as const,
                ease: "easeInOut" as const,
              }}
              aria-hidden="true"
            >
              <div className="flex flex-col items-center gap-2">
                <ArrowDown size={24} />
                <span className="text-xs text-gray-500 dark:text-gray-500">
                  loops
                </span>
              </div>
            </motion.div>
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
  onKeyPress: (e: React.KeyboardEvent<HTMLButtonElement>) => void;
  getIconComponent: (
    iconName: string | undefined
  ) => React.ComponentType<{ className?: string; size?: number }>;
}

const WorkflowNodeCard = ({
  node,
  isExpanded,
  onToggle,
  onKeyPress,
  getIconComponent,
}: WorkflowNodeCardProps) => {
  const IconComponent = getIconComponent(node.icon);

  return (
    <motion.div
      variants={{
        initial: { scale: 1 },
        hover: { scale: 1.05 },
      }}
      whileHover="hover"
      whileTap={{ scale: 0.95 }}
      className="w-48"
    >
      <button
        onClick={onToggle}
        onKeyPress={onKeyPress}
        className="w-full rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 hover:border-blue-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-blue-600 dark:focus:ring-offset-gray-950"
        aria-expanded={isExpanded}
        aria-label={`${node.title}, press Enter to expand details`}
      >
        <motion.div
          className="mb-3 flex justify-center text-blue-600 dark:text-blue-400"
          variants={{
            initial: { scale: 1 },
            hover: { scale: 1.1 },
          }}
          whileHover="hover"
        >
          <IconComponent size={32} />
        </motion.div>

        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
          {node.title}
        </h3>

        {/* Expandable description */}
        <motion.div
          initial="collapsed"
          animate={isExpanded ? "expanded" : "collapsed"}
          variants={{
            collapsed: { opacity: 0, height: 0, marginTop: 0 },
            expanded: {
              opacity: 1,
              height: "auto",
              marginTop: 12,
              transition: {
                duration: 0.3,
                ease: "easeInOut",
              },
            },
          }}
          className="overflow-hidden"
        >
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {node.description}
          </p>
        </motion.div>

        {/* Expand indicator */}
        <motion.div
          className="mt-3 flex items-center justify-center text-gray-400 dark:text-gray-600"
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <svg
            className="h-4 w-4"
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
        </motion.div>
      </button>
    </motion.div>
  );
};

export default WorkflowDiagram;
