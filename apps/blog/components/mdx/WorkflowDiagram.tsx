"use client";

import { motion } from "framer-motion";
import { RefreshCw, CheckCircle2 } from "lucide-react";

interface Step {
  id: string;
  name: string;
  description: string;
  status?: "pending" | "in-progress" | "completed";
  time?: string;
}

interface WorkflowDiagramProps {
  steps: Step[];
  title?: string;
  description?: string;
  type?: "circular" | "linear";
  centerText?: string;
}

const getStatusColor = (status: Step["status"]) => {
  switch (status) {
    case "completed":
      return "bg-green-500";
    case "in-progress":
      return "bg-blue-500";
    case "pending":
      return "bg-gray-300";
    default:
      return "bg-gray-300";
  }
};

const getStatusIcon = (status: Step["status"]) => {
  switch (status) {
    case "completed":
      return <CheckCircle2 className="w-4 h-4 text-white" />;
    case "in-progress":
      return <RefreshCw className="w-4 h-4 text-white animate-spin" />;
    case "pending":
      return <div className="w-4 h-4 bg-white opacity-30 rounded-full"></div>;
    default:
      return null;
  }
};

export function WorkflowDiagram({
  steps,
  title,
  description,
  type = "circular",
  centerText,
}: WorkflowDiagramProps) {
  if (type === "circular") {
    return (
      <div className="space-y-6">
        {title && (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">{title}</h2>
            {description && <p className="text-gray-600">{description}</p>}
          </div>
        )}

        <div className="relative flex justify-center items-center">
          {/* Circular container */}
          <div className="w-full max-w-2xl aspect-square relative">
            {/* Circle path */}
            <svg className="w-full h-full" viewBox="0 0 400 400">
              <circle
                cx="200"
                cy="200"
                r="150"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="2"
                strokeDasharray="5,5"
              />
            </svg>

            {/* Center content */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center p-6 bg-white rounded-full shadow-lg border border-gray-200">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-3 mx-auto">
                  <RefreshCw className="w-8 h-8 text-white animate-spin" />
                </div>
                {centerText && (
                  <p className="font-semibold text-gray-800">{centerText}</p>
                )}
              </div>
            </div>

            {/* Steps around the circle */}
            {steps.map((step, index) => {
              const angle = (index / steps.length) * 2 * Math.PI - Math.PI / 2;
              const radius = 150;
              const x = 200 + radius * Math.cos(angle);
              const y = 200 + radius * Math.sin(angle);

              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="absolute"
                  style={{
                    left: x,
                    top: y,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <div
                    className={`relative group ${step.status === "completed" ? "z-10" : ""}`}
                  >
                    {/* Connection line */}
                    {index < steps.length - 1 && (
                      <div className="absolute -top-1/2 -right-full w-1/2 h-px bg-gray-300"></div>
                    )}

                    {/* Step circle */}
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md border-2 transition-all duration-300 ${
                        step.status === "completed"
                          ? `${getStatusColor(step.status)} border-green-300`
                          : step.status === "in-progress"
                            ? `${getStatusColor(step.status)} border-blue-300`
                            : "bg-gray-200 border-gray-300"
                      }`}
                    >
                      {getStatusIcon(step.status)}
                    </div>

                    {/* Step content */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                      <div className="bg-gray-800 text-white text-xs rounded-lg p-2 whitespace-nowrap">
                        <div className="font-semibold">{step.name}</div>
                        <div className="text-gray-300">{step.description}</div>
                        {step.time && (
                          <div className="text-gray-400 mt-1">{step.time}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Step labels at bottom */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          {steps.map((step, _index) => (
            <div
              key={step.id}
              className="text-center p-3 bg-gray-50 rounded-lg"
            >
              <div
                className={`w-3 h-3 rounded-full mx-auto mb-2 ${getStatusColor(step.status)}`}
              ></div>
              <div className="font-medium text-sm">{step.name}</div>
              <div className="text-xs text-gray-600 mt-1">{step.time}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Linear workflow
  return (
    <div className="space-y-6">
      {title && (
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">{title}</h2>
          {description && <p className="text-gray-600">{description}</p>}
        </div>
      )}

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-8 top-0 bottom-0 w-1 bg-gray-200"></div>

        <div className="space-y-6">
          {steps.map((step, index) => (
            <div key={step.id} className="relative flex items-start">
              {/* Step icon */}
              <div className="absolute left-4 w-8 h-8 rounded-full bg-white border-2 flex items-center justify-center z-10">
                {getStatusIcon(step.status)}
              </div>

              {/* Step content */}
              <div className="ml-16 flex-1">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-6 rounded-lg border ${
                    step.status === "completed"
                      ? "border-green-200 bg-green-50"
                      : step.status === "in-progress"
                        ? "border-blue-200 bg-blue-50"
                        : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold mb-1">
                        {step.name}
                      </h3>
                      <p className="text-gray-700 mb-2">{step.description}</p>
                      {step.time && (
                        <span className="text-sm text-gray-500">
                          {step.time}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Arrow */}
              {index < steps.length - 1 && (
                <div className="absolute left-8 top-16 w-1 h-6 bg-gray-300 transform rotate-45 origin-bottom"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
