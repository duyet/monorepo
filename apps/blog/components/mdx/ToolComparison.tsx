"use client";

import { useState } from "react";
import { Star, Check, X } from "lucide-react";

interface Tool {
  name: string;
  description: string;
  pros: string[];
  cons: string[];
  rating: number;
}

interface ToolComparisonProps {
  tools: Tool[];
}

export function ToolComparison({ tools }: ToolComparisonProps) {
  const [sortBy, setSortBy] = useState<"rating" | "name">("rating");

  const sortedTools = [...tools].sort((a, b) => {
    if (sortBy === "rating") {
      return b.rating - a.rating;
    }
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Tool Comparison</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setSortBy("rating")}
            className={`px-3 py-1 rounded-md text-sm ${
              sortBy === "rating"
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
            }`}
          >
            Sort by Rating
          </button>
          <button
            onClick={() => setSortBy("name")}
            className={`px-3 py-1 rounded-md text-sm ${
              sortBy === "name"
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
            }`}
          >
            Sort by Name
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sortedTools.map((tool) => (
          <div
            key={tool.name}
            className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-lg">{tool.name}</h4>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < tool.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {tool.description}
            </p>

            <div className="space-y-2">
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium text-green-700 dark:text-green-400">
                    Pros
                  </span>
                </div>
                <ul className="text-sm text-gray-600 dark:text-gray-400 ml-5 space-y-1">
                  {tool.pros.map((pro, index) => (
                    <li key={index} className="list-disc">{pro}</li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="flex items-center gap-1 mb-1">
                  <X className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-medium text-red-700 dark:text-red-400">
                    Cons
                  </span>
                </div>
                <ul className="text-sm text-gray-600 dark:text-gray-400 ml-5 space-y-1">
                  {tool.cons.map((con, index) => (
                    <li key={index} className="list-disc">{con}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}