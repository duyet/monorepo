"use client";

import { useState } from "react";
import { Star, Check, X } from "lucide-react";
import { cn } from "@duyet/libs/utils";

export interface Tool {
  name: string;
  pros: string[];
  cons: string[];
  rating: number;
}

export interface ToolComparisonProps {
  tools: Tool[];
  className?: string;
}

export function ToolComparison({ tools, className }: ToolComparisonProps) {
  const [selectedTool, setSelectedTool] = useState<Tool | null>(tools[0]);

  return (
    <div className={cn("w-full max-w-4xl mx-auto", className)}>
      <h2 className="text-2xl font-bold mb-6">Tool Comparison</h2>

      {/* Tool Selector */}
      <div className="flex flex-wrap gap-2 mb-8">
        {tools.map((tool) => (
          <button
            key={tool.name}
            onClick={() => setSelectedTool(tool)}
            className={cn(
              "px-4 py-2 rounded-lg border transition-all duration-200",
              selectedTool?.name === tool.name
                ? "bg-blue-100 border-blue-500 text-blue-900"
                : "bg-white border-gray-200 hover:bg-gray-50"
            )}
          >
            <span className="font-medium">{tool.name}</span>
            <div className="flex items-center gap-1 mt-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "w-4 h-4",
                    i < tool.rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  )}
                />
              ))}
            </div>
          </button>
        ))}
      </div>

      {/* Selected Tool Details */}
      {selectedTool && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4 mb-6">
            <h3 className="text-xl font-bold">{selectedTool.name}</h3>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "w-5 h-5",
                    i < selectedTool.rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  )}
                />
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Pros */}
            <div>
              <h4 className="text-lg font-semibold text-green-700 mb-3 flex items-center gap-2">
                <Check className="w-5 h-5" />
                Pros
              </h4>
              <ul className="space-y-2">
                {selectedTool.pros.map((pro, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{pro}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Cons */}
            <div>
              <h4 className="text-lg font-semibold text-red-700 mb-3 flex items-center gap-2">
                <X className="w-5 h-5" />
                Cons
              </h4>
              <ul className="space-y-2">
                {selectedTool.cons.map((con, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <X className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <span>{con}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Summary Table */}
      <div className="mt-8 overflow-x-auto">
        <table className="w-full border-collapse bg-white rounded-lg shadow-sm border border-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-200 px-4 py-3 text-left">Tool</th>
              <th className="border border-gray-200 px-4 py-3 text-center">Rating</th>
              <th className="border border-gray-200 px-4 py-3 text-center">Pros</th>
              <th className="border border-gray-200 px-4 py-3 text-center">Cons</th>
            </tr>
          </thead>
          <tbody>
            {tools.map((tool, index) => (
              <tr key={index} className={selectedTool?.name === tool.name ? "bg-blue-50" : ""}>
                <td className="border border-gray-200 px-4 py-3 font-medium">
                  {tool.name}
                </td>
                <td className="border border-gray-200 px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "w-4 h-4",
                          i < tool.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        )}
                      />
                    ))}
                  </div>
                </td>
                <td className="border border-gray-200 px-4 py-3 text-center">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                    {tool.pros.length}
                  </span>
                </td>
                <td className="border border-gray-200 px-4 py-3 text-center">
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm">
                    {tool.cons.length}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}