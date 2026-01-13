"use client";

import { motion } from "framer-motion";
import { Circle, ArrowRight } from "lucide-react";
import { cn } from "@duyet/libs/utils";

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  position: { x: number; y: number };
}

interface WorkflowDiagramProps {
  steps: WorkflowStep[];
  title?: string;
  className?: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 260,
      damping: 20,
    },
  },
};

const arrowVariants = {
  hidden: { pathLength: 0 },
  visible: {
    pathLength: 1,
    transition: {
      duration: 1.5,
      ease: "easeInOut" as const,
    },
  },
};

export function WorkflowDiagram({ steps, title, className }: WorkflowDiagramProps) {
  // Create SVG paths between steps
  const createPath = (from: { x: number; y: number }, to: { x: number; y: number }) => {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const dr = Math.sqrt(dx * dx + dy * dy);
    return `M ${from.x} ${from.y} A ${dr/2} ${dr/2} 0 0 1 ${to.x} ${to.y}`;
  };

  return (
    <div className={cn("my-8", className)}>
      {title && <h3 className="text-lg font-semibold mb-6 text-center">{title}</h3>}

      <div className="relative" style={{ width: "100%", height: "500px" }}>
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 800 500"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Draw arrows between steps */}
          {steps.map((step, index) => {
            if (index < steps.length - 1) {
              const nextStep = steps[index + 1];
              const path = createPath(step.position, nextStep.position);
              return (
                <motion.path
                  key={`arrow-${index}`}
                  d={path}
                  stroke="#94a3b8"
                  strokeWidth="2"
                  fill="none"
                  markerEnd="url(#arrowhead)"
                  variants={arrowVariants}
                  initial="hidden"
                  animate="visible"
                />
              );
            }
            return null;
          })}

          {/* Arrow marker definition */}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon
                points="0 0, 10 3.5, 0 7"
                fill="#94a3b8"
              />
            </marker>
          </defs>
        </svg>

        <motion.div
          className="absolute inset-0"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              className="absolute"
              style={{
                left: `${step.position.x}px`,
                top: `${step.position.y}px`,
                transform: "translate(-50%, -50%)",
              }}
              variants={itemVariants}
            >
              <div className="relative">
                <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                  <Circle className="h-12 w-12 text-white" />
                </div>
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-center">
                  <h4 className="font-semibold text-sm">{step.title}</h4>
                  <p className="text-xs text-gray-600 max-w-32">{step.description}</p>
                </div>
                <div className="absolute top-1/2 -right-8 transform -translate-y-1/2">
                  <ArrowRight className="h-6 w-6 text-gray-400" />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}