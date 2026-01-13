"use client";

import React, { useState } from "react";

interface Feature {
  name: string;
  description: string;
}

interface ToolFeatures {
  tool: string;
  category: string;
  features: Record<string, boolean | string>;
}

interface FeatureMatrixProps {
  tools: ToolFeatures[];
  title?: string;
}

/**
 * FeatureMatrix - Interactive feature comparison matrix
 * Features: Toggle columns, highlight unique features, search
 */
export default function FeatureMatrix({ tools, title = "Feature Matrix" }: FeatureMatrixProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [visibleTools, setVisibleTools] = useState<number[]>(tools.map((_, i) => i));

  const categories = ["all", ...Array.from(new Set(tools.map((t) => t.category)))];

  const filteredTools = tools.filter((tool) => {
    const matchesCategory = selectedCategory === "all" || tool.category === selectedCategory;
    const matchesSearch = searchTerm === "" || tool.tool.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Get all features
  const allFeatures = Array.from(
    new Set(tools.flatMap((tool) => Object.keys(tool.features)))
  ).sort();

  const toggleToolVisibility = (index: number) => {
    setVisibleTools((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  // Find unique features for highlighting
  const uniqueFeatures = allFeatures.filter((feature) => {
    const values = tools.map((tool) => tool.features[feature]);
    return new Set(values).size > 1;
  });

  return (
    <div className="my-8 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-900">
      <div className="p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">{title}</h3>

        <div className="flex flex-wrap gap-3 items-center">
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

          <div className="flex-1 max-w-xs">
            <input
              type="text"
              placeholder="Search tools..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-1 rounded text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700">
                Tool
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700">
                Category
              </th>
              {allFeatures.map((feature, idx) => (
                <th
                  key={idx}
                  className={`px-4 py-3 text-center text-xs font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 ${
                    uniqueFeatures.includes(feature) ? "bg-yellow-50 dark:bg-yellow-900/20" : ""
                  }`}
                  title={feature}
                >
                  {feature.length > 15 ? feature.slice(0, 12) + "..." : feature}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredTools.map((tool, toolIndex) => (
              <tr
                key={toolIndex}
                className={`hover:bg-gray-50 dark:hover:bg-gray-800 ${
                  !visibleTools.includes(toolIndex) ? "opacity-50" : ""
                }`}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900 dark:text-gray-100">{tool.tool}</span>
                    <button
                      onClick={() => toggleToolVisibility(toolIndex)}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                    >
                      {visibleTools.includes(toolIndex) ? "Hide" : "Show"}
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">
                    {tool.category}
                  </span>
                </td>
                {allFeatures.map((feature, featureIndex) => {
                  const value = tool.features[feature];
                  const isTrue = value === true || value === "Yes" || value === "yes";
                  const isFalse = value === false || value === "No" || value === "no";
                  const isPartial = value === "Partial" || value === "partial";

                  return (
                    <td
                      key={featureIndex}
                      className={`px-4 py-3 text-center text-sm border-b border-gray-200 dark:border-gray-700 ${
                        uniqueFeatures.includes(feature) ? "bg-yellow-50 dark:bg-yellow-900/10" : ""
                      }`}
                    >
                      {isTrue && (
                        <span className="text-green-600 dark:text-green-400 font-medium">✓</span>
                      )}
                      {isFalse && (
                        <span className="text-red-600 dark:text-red-400 font-medium">✗</span>
                      )}
                      {isPartial && (
                        <span className="text-yellow-600 dark:text-yellow-400 font-medium">~</span>
                      )}
                      {!isTrue && !isFalse && !isPartial && (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 flex justify-between items-center px-4">
        <span>Showing {filteredTools.length} tools</span>
        <span>
          ✓ Supported | ✗ Not Supported | ~ Partially Supported
        </span>
      </div>
    </div>
  );
}