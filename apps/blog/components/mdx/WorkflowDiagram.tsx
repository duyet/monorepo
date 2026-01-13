import React from "react";
import { motion } from "framer-motion";

interface WorkflowStep {
  label: string;
  icon?: string;
  description: string;
}

interface WorkflowDiagramProps {
  steps: WorkflowStep[];
  title?: string;
  orientation?: "horizontal" | "vertical";
}

/**
 * SVG-based workflow visualization with animations
 */
export const WorkflowDiagram: React.FC<WorkflowDiagramProps> = ({
  steps,
  title = "Workflow Diagram",
  orientation = "horizontal",
}) => {
  const isHorizontal = orientation === "horizontal";

  // Animation variants
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
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  // SVG dimensions based on orientation
  const width = isHorizontal ? 800 : 100;
  const height = isHorizontal ? 150 : 400;
  const stepWidth = isHorizontal ? 700 / steps.length : 60;
  const stepHeight = 60;

  return (
    <div className="my-8 p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        {title}
      </h3>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="overflow-x-auto"
      >
        <svg width={width} height={height} className="w-full h-auto">
          {/* Connection lines */}
          {steps.map((_, index) => {
            if (index === steps.length - 1) return null;
            const x1 = isHorizontal ? 70 + index * stepWidth : 50;
            const y1 = isHorizontal ? height / 2 : 50 + index * 60;
            const x2 = isHorizontal ? 70 + (index + 1) * stepWidth : 50;
            const y2 = isHorizontal ? height / 2 : 110 + index * 60;

            return (
              <motion.line
                key={`line-${index}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#3b82f6"
                strokeWidth="2"
                strokeDasharray="5,5"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              />
            );
          })}

          {/* Steps */}
          {steps.map((step, index) => {
            const x = isHorizontal
              ? 50 + index * stepWidth
              : 50;
            const y = isHorizontal
              ? height / 2 - stepHeight / 2
              : 30 + index * 60;

            return (
              <motion.g key={index} variants={itemVariants}>
                {/* Background rectangle */}
                <rect
                  x={x}
                  y={y}
                  width={stepWidth - 20}
                  height={stepHeight}
                  rx="8"
                  fill="#3b82f6"
                  opacity="0.1"
                />

                {/* Border */}
                <rect
                  x={x}
                  y={y}
                  width={stepWidth - 20}
                  height={stepHeight}
                  rx="8"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2"
                />

                {/* Icon */}
                {step.icon && (
                  <text
                    x={x + 15}
                    y={y + 25}
                    fontSize="16"
                    textAnchor="middle"
                    fill="#3b82f6"
                  >
                    {step.icon}
                  </text>
                )}

                {/* Label */}
                <text
                  x={x + (step.icon ? 35 : 15)}
                  y={y + 25}
                  fontSize="12"
                  fontWeight="bold"
                  fill="#1e293b"
                  className="dark:fill-gray-100"
                >
                  {step.label}
                </text>

                {/* Description */}
                <text
                  x={x + (step.icon ? 35 : 15)}
                  y={y + 45}
                  fontSize="9"
                  fill="#64748b"
                  className="dark:fill-gray-400"
                >
                  {step.description.substring(0, isHorizontal ? 18 : 12)}
                  {step.description.length > (isHorizontal ? 18 : 12) ? "..." : ""}
                </text>

                {/* Number badge */}
                <motion.circle
                  cx={x + (stepWidth - 20) - 10}
                  cy={y + 10}
                  r="8"
                  fill="#3b82f6"
                  whileHover={{ scale: 1.2 }}
                />
                <text
                  x={x + (stepWidth - 20) - 10}
                  y={y + 14}
                  fontSize="9"
                  textAnchor="middle"
                  fill="white"
                  fontWeight="bold"
                >
                  {index + 1}
                </text>
              </motion.g>
            );
          })}
        </svg>
      </motion.div>

      {/* Text description below for accessibility */}
      <div className="sr-only">
        <p>Workflow steps:</p>
        <ol>
          {steps.map((step, index) => (
            <li key={index}>
              {step.label}: {step.description}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};

// Example usage component
export const WorkflowDiagramExample: React.FC = () => {
  const exampleSteps: WorkflowStep[] = [
    {
      icon: "📝",
      label: "Input",
      description: "User provides data",
    },
    {
      icon: "⚙️",
      label: "Process",
      description: "System processes input",
    },
    {
      icon: "🔍",
      label: "Validate",
      description: "Check data quality",
    },
    {
      icon: "📤",
      label: "Output",
      description: "Generate result",
    },
  ];

  const exampleStepsVertical: WorkflowStep[] = [
    {
      icon: "🎯",
      label: "Start",
      description: "Initialize",
    },
    {
      icon: "⚙️",
      label: "Process",
      description: "Run algorithm",
    },
    {
      icon: "✅",
      label: "Complete",
      description: "Finish task",
    },
  ];

  return (
    <div className="space-y-6">
      <WorkflowDiagram
        steps={exampleSteps}
        title="Horizontal Workflow Example"
        orientation="horizontal"
      />
      <WorkflowDiagram
        steps={exampleStepsVertical}
        title="Vertical Workflow Example"
        orientation="vertical"
      />
    </div>
  );
};