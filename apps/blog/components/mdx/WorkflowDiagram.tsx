import { motion } from "framer-motion";
import { ArrowRight, Check, ArrowRightCircle } from "lucide-react";

interface WorkflowStep {
  title: string;
  description: string;
  icon?: string; // Optional emoji or text
}

interface WorkflowDiagramProps {
  steps: WorkflowStep[];
  title?: string;
  circular?: boolean;
}

export function WorkflowDiagram({
  steps,
  title = "Workflow Diagram",
  circular = false,
}: WorkflowDiagramProps) {
  if (circular) {
    return (
      <div className="my-6">
        {title && <h3 className="text-lg font-semibold mb-4 text-center">{title}</h3>}
        <div className="flex flex-col items-center gap-4">
          {steps.map((step, index) => (
            <div key={index} className="relative w-full max-w-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.15 }}
                className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-200 dark:border-blue-700 rounded-lg p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">
                    {step.icon || index + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-sm">{step.title}</h4>
                    <p className="text-xs opacity-80">{step.description}</p>
                  </div>
                  <Check size={16} className="text-green-500" />
                </div>
              </motion.div>

              {/* Animated arrows */}
              {index < steps.length - 1 && (
                <motion.div
                  className="flex justify-center py-2"
                  animate={{ y: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <ArrowRightCircle size={24} className="text-blue-400" />
                </motion.div>
              )}

              {/* Final connector for circular workflow */}
              {index === steps.length - 1 && (
                <motion.div
                  className="flex justify-center py-2"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="text-xs text-blue-500 font-semibold">
                    ⇩ Returns to Start ⇩
                  </div>
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Horizontal workflow
  return (
    <div className="my-6">
      {title && <h3 className="text-lg font-semibold mb-4 text-center">{title}</h3>}
      <div className="flex flex-wrap justify-center items-center gap-2 md:gap-4">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center gap-2 md:gap-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="relative group"
            >
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-lg p-3 w-24 md:w-32 text-center shadow-lg">
                <div className="text-2xl mb-1">{step.icon || "•"}</div>
                <div className="font-bold text-xs md:text-sm leading-tight">
                  {step.title}
                </div>
              </div>
              {/* Tooltip on hover */}
              <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs rounded p-2 w-40 hidden group-hover:block z-10">
                {step.description}
              </div>
            </motion.div>

            {index < steps.length - 1 && (
              <motion.div
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <ArrowRight size={20} className="text-gray-400" />
              </motion.div>
            )}
          </div>
        ))}
      </div>

      <div className="text-center mt-4 text-xs text-gray-500 dark:text-gray-400">
        Hover over steps for details
      </div>
    </div>
  );
}