import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Star, AlertTriangle } from "lucide-react";

interface Tool {
  name: string;
  description: string;
  pros: string[];
  cons: string[];
  rating: number; // 1-5
}

interface ToolComparisonProps {
  tools: Tool[];
}

export function ToolComparison({ tools }: ToolComparisonProps) {
  const [expandedTool, setExpandedTool] = useState<string | null>(null);

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return "text-green-600 dark:text-green-400";
    if (rating >= 3.5) return "text-yellow-600 dark:text-yellow-400";
    return "text-orange-600 dark:text-orange-400";
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={16}
        className={`${
          i < Math.round(rating)
            ? "fill-current text-yellow-400"
            : "text-gray-300 dark:text-gray-600"
        }`}
      />
    ));
  };

  return (
    <div className="space-y-4 my-6">
      {tools.map((tool, index) => (
        <motion.div
          key={tool.name}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900"
        >
          <button
            onClick={() =>
              setExpandedTool(expandedTool === tool.name ? null : tool.name)
            }
            className="w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">{tool.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {tool.description}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className={`font-bold ${getRatingColor(tool.rating)}`}>
                  {tool.rating.toFixed(1)}
                </div>
                <div className="flex">{getRatingStars(tool.rating)}</div>
              </div>
            </div>
          </button>

          <AnimatePresence>
            {expandedTool === tool.name && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-gray-200 dark:border-gray-700"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2 text-green-600 dark:text-green-400">
                      <Check size={16} /> Pros
                    </h4>
                    <ul className="space-y-1 text-sm">
                      {tool.pros.map((pro, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-green-500 mt-1">•</span>
                          <span>{pro}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2 text-red-600 dark:text-red-400">
                      <X size={16} /> Cons
                    </h4>
                    <ul className="space-y-1 text-sm">
                      {tool.cons.map((con, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-red-500 mt-1">•</span>
                          <span>{con}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
}