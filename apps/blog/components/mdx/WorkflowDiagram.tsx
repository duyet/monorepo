"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { RotateCcw, GitBranch, FileText, CheckCircle, ArrowRight, ArrowLeft } from "lucide-react";

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  status: "active" | "completed" | "pending";
}

interface WorkflowDiagramProps {
  steps: WorkflowStep[];
  orientation?: "circular" | "linear";
}

const stepVariants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 }
};

const arrowVariants = {
  initial: { opacity: 0, x: 0 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0 }
};

export function WorkflowDiagram({ steps, orientation = "circular" }: WorkflowDiagramProps) {
  const [activeStep, setActiveStep] = useState(0);

  if (orientation === "circular") {
    const centerRadius = 100;
    const angleStep = (2 * Math.PI) / steps.length;

    return (
      <div className="my-6 flex justify-center">
        <div className="relative w-[400px] h-[400px]">
          {/* Center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5 }}
              className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm text-center p-3 shadow-lg"
            >
              <div className="flex flex-col items-center gap-1">
                <RotateCcw className="w-6 h-6" />
                <span className="text-xs">Workflow</span>
              </div>
            </motion.div>
          </div>

          {/* Steps around the circle */}
          {steps.map((step, index) => {
            const angle = index * angleStep - Math.PI / 2;
            const x = centerRadius + Math.cos(angle) * 150;
            const y = centerRadius + Math.sin(angle) * 150;

            return (
              <motion.div
                key={step.id}
                className="absolute"
                style={{ left: x, top: y, transform: "translate(-50%, -50%)" }}
                initial="initial"
                animate="animate"
                variants={stepVariants}
                transition={{ delay: 0.1 * index }}
              >
                <div
                  className={`relative cursor-pointer group ${
                    step.status === "active" ? "ring-2 ring-blue-500 ring-offset-2" : ""
                  }`}
                  onClick={() => setActiveStep(index)}
                >
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-xs font-bold text-center p-2 shadow-lg transition-all ${
                      step.status === "active"
                        ? "bg-blue-500 scale-110"
                        : step.status === "completed"
                        ? "bg-green-500"
                        : "bg-gray-400"
                    }`}
                  >
                    {step.status === "completed" ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <span className="text-[10px]">{index + 1}</span>
                    )}
                  </div>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    <div className="bg-gray-900 text-white text-xs rounded px-2 py-1">
                      {step.title}
                    </div>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-gray-900 border-transparent"></div>
                  </div>
                </div>

                {/* Arrows between steps */}
                {index < steps.length - 1 && (
                  <motion.div
                    className="absolute"
                    style={{
                      left: x + Math.cos(angle + angleStep / 2) * 80,
                      top: y + Math.sin(angle + angleStep / 2) * 80,
                      transform: "translate(-50%, -50%) rotate(45deg)",
                    }}
                    variants={arrowVariants}
                    transition={{ delay: 0.1 * index + 0.05 }}
                  >
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  }

  // Linear workflow
  return (
    <div className="my-6">
      <div className="flex items-center justify-center gap-4 flex-wrap">
        {steps.map((step, index) => (
          <motion.div
            key={step.id}
            className="flex items-center gap-2"
            initial="initial"
            animate="animate"
            variants={stepVariants}
            transition={{ delay: 0.1 * index }}
          >
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-center p-2 shadow-lg transition-all ${
                step.status === "active"
                  ? "bg-blue-500 scale-110 ring-2 ring-blue-500 ring-offset-2"
                  : step.status === "completed"
                  ? "bg-green-500"
                  : "bg-gray-400"
              }`}
            >
              {step.status === "completed" ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <span className="text-[10px]">{index + 1}</span>
              )}
            </div>
            <div className="max-w-[200px]">
              <div className="font-semibold">{step.title}</div>
              <div className="text-xs text-gray-500">{step.description}</div>
            </div>
            {index < steps.length - 1 && (
              <motion.div variants={arrowVariants} transition={{ delay: 0.1 * index + 0.05 }}>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}