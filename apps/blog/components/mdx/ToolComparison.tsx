"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface Tool {
  name: string;
  description: string;
  pros: string[];
  cons: string[];
  category: string;
  stars: number;
}

interface ToolComparisonProps {
  tools: Tool[];
  title?: string;
}

/**
 * ToolComparison - Interactive comparison table for tools
 * Features: Sort by stars, category filter, expandable details
 */
export default function ToolComparison({ tools, title = "Tool Comparison" }: ToolComparisonProps) {
  const [sortBy, setSortBy] = useState<"stars" | "name">("stars");
  const [expandedTool, setExpandedTool] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = ["all", ...Array.from(new Set(tools.map((t) => t.category)))];

  const filteredTools = tools.filter((tool) =>
    selectedCategory === "all" ? true : tool.category === selectedCategory
  );

  const sortedTools = [...filteredTools].sort((a, b) => {
    if (sortBy === "stars") {
      return b.stars - a.stars;
    }
    return a.name.localeCompare(b.name);
  });

  const toggleExpand = (name: string) => {
    setExpandedTool(expandedTool === name ? null : name);
  };

  return (
    <div className="my-8 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-900">
      <div className="p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">{title}</h3>

        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Sort:</span>
            <button
              onClick={() => setSortBy("stars")}
              className={`px-3 py-1 rounded text-sm transition ${
                sortBy === "stars"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              }`}
            >
              Stars
            </button>
            <button
              onClick={() => setSortBy("name")}
              className={`px-3 py-1 rounded text-sm transition ${
                sortBy === "name"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              }`}
            >
              Name
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1 rounded text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {sortedTools.map((tool) => (
          <div key={tool.name} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">{tool.name}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{tool.description}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded">
                  ⭐ {tool.stars}k
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                  {tool.category}
                </span>
                <button
                  onClick={() => toggleExpand(tool.name)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  {expandedTool === tool.name ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
              </div>
            </div>

            {expandedTool === tool.name && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h5 className="font-semibold text-green-600 dark:text-green-400 mb-2">Pros:</h5>
                  <ul className="list-disc list-inside space-y-1">
                    {tool.pros.map((pro, idx) => (
                      <li key={idx} className="text-gray-700 dark:text-gray-300">
                        {pro}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h5 className="font-semibold text-red-600 dark:text-red-400 mb-2">Cons:</h5>
                  <ul className="list-disc list-inside space-y-1">
                    {tool.cons.map((con, idx) => (
                      <li key={idx} className="text-gray-700 dark:text-gray-300">
                        {con}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="p-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 text-center">
        Showing {sortedTools.length} of {tools.length} tools
      </div>
    </div>
  );
}