import * as React from "react";
import { cn } from "@duyet/libs/utils";
import { Check, X, Minus } from "lucide-react";

interface Tool {
  name: string;
  rating: number; // 1-5
  pros: string[];
  cons: string[];
}

interface ToolComparisonProps {
  tools: Tool[];
  title?: string;
}

export function ToolComparison({ tools, title = "Tool Comparison" }: ToolComparisonProps) {
  const getRatingStars = (rating: number) => {
    return "★".repeat(rating) + "☆".repeat(5 - rating);
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return "text-green-600";
    if (rating >= 3) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="my-6 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <h3 className="text-lg font-semibold m-0">{title}</h3>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tools.map((tool, index) => (
            <div
              key={index}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-base m-0">{tool.name}</h4>
                <span className={cn("font-mono text-sm font-bold", getRatingColor(tool.rating))}>
                  {getRatingStars(tool.rating)}
                </span>
              </div>

              <div className="space-y-2">
                <div>
                  <span className="text-xs font-semibold text-green-600 uppercase tracking-wider">Pros:</span>
                  <ul className="mt-1 space-y-1 text-sm">
                    {tool.pros.map((pro, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-600" />
                        <span>{pro}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <span className="text-xs font-semibold text-red-600 uppercase tracking-wider">Cons:</span>
                  <ul className="mt-1 space-y-1 text-sm">
                    {tool.cons.map((con, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <X className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-600" />
                        <span>{con}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}