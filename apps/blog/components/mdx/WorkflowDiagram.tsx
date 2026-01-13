import React from "react";
import { motion } from "framer-motion";

interface WorkflowStep {
  id: string;
  label: string;
  description: string;
}

interface WorkflowDiagramProps {
  steps: WorkflowStep[];
  /**
   * Direction of the workflow flow
   * @default "clockwise"
   */
  direction?: "clockwise" | "counterclockwise";
}

/**
 * WorkflowDiagram Component
 * Displays a circular workflow with animated arrows
 */
export const WorkflowDiagram: React.FC<WorkflowDiagramProps> = ({
  steps,
  direction = "clockwise",
}) => {
  if (steps.length === 0) return null;

  // Limit to reasonable number for circular display
  const displaySteps = steps.slice(0, 8);

  return (
    <div className="w-full mb-8 flex flex-col items-center">
      <h3 className="text-2xl font-bold mb-6">Workflow Diagram</h3>

      <div className="relative w-96 h-96">
        {/* Central Animated Arrow (Circle) */}
        <motion.svg
          width="100%"
          height="100%"
          viewBox="0 0 200 200"
          className="absolute inset-0"
          animate={{ rotate: direction === "clockwise" ? 360 : -360 }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <motion.circle
            cx="100"
            cy="100"
            r="60"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="4 4"
            className="text-blue-500/30 dark:text-blue-400/30"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
            }}
          />
          {/* Animated Arrow Head */}
          <motion.polygon
            points="100,35 105,45 95,45"
            fill="currentColor"
            className="text-blue-500"
            style={{ transformOrigin: "100px 100px" }}
            animate={{ rotate: direction === "clockwise" ? 360 : -360 }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </motion.svg>

        {/* Workflow Steps positioned in circle */}
        <div className="absolute inset-0">
          {displaySteps.map((step, index) => {
            const angle = (360 / displaySteps.length) * index - 90;
            const radius = 75;
            const x = 100 + radius * Math.cos((angle * Math.PI) / 180);
            const y = 100 + radius * Math.sin((angle * Math.PI) / 180);

            return (
              <motion.div
                key={step.id}
                className="absolute flex flex-col items-center"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  transform: "translate(-50%, -50%)",
                }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.1 }}
              >
                {/* Step Number Circle */}
                <motion.div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white bg-blue-600 shadow-lg cursor-pointer"
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {index + 1}
                </motion.div>

                {/* Tooltip on hover */}
                <motion.div
                  className="mt-2 w-32 p-2 bg-white dark:bg-gray-800 rounded shadow-lg border border-gray-200 dark:border-gray-700 text-xs text-center pointer-events-none"
                  initial={{ opacity: 0, y: 5 }}
                  whileHover={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="font-semibold">{step.label}</div>
                  <div className="text-gray-600 dark:text-gray-400 mt-1">
                    {step.description}
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Legend/List View */}
      <div className="mt-8 w-full max-w-2xl">
        <h4 className="font-semibold mb-3 text-lg">Workflow Steps</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {displaySteps.map((step, index) => (
            <motion.div
              key={step.id}
              className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
              whileHover={{ x: 4, borderColor: "rgba(59, 130, 246, 0.5)" }}
            >
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">
                {index + 1}
              </div>
              <div>
                <div className="font-medium">{step.label}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {step.description}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
