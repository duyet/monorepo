"use client";

import { useState } from "react";
import { ArrowUpDown } from "lucide-react";

interface Feature {
  name: string;
  description: string;
}

interface Tool {
  name: string;
  features: Record<string, "good" | "fair" | "poor" | "excellent">;
}

interface FeatureMatrixProps {
  features: Feature[];
  tools: Tool[];
}

export function FeatureMatrix({ features, tools }: FeatureMatrixProps) {
  const [sortedBy, setSortedBy] = useState<keyof Tool | "features">("features");

  const getScoreColor = (score: "good" | "fair" | "poor" | "excellent") => {
    switch (score) {
      case "excellent":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "good":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "fair":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "poor":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    }
  };

  const getScoreIcon = (score: "good" | "fair" | "poor" | "excellent") => {
    switch (score) {
      case "excellent":
        return "⭐";
      case "good":
        return "✓";
      case "fair":
        return "△";
      case "poor":
        return "✗";
    }
  };

  const sortedTools = [...tools].sort((a, b) => {
    if (sortedBy === "features") {
      return a.name.localeCompare(b.name);
    }
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Feature Comparison Matrix</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Click headers to sort
          </span>
          <ArrowUpDown className="w-4 h-4 text-gray-400" />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800">
              <th className="p-3 text-left font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                Tool
              </th>
              {features.map((feature, index) => (
                <th
                  key={index}
                  className="p-3 text-center font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setSortedBy("features")}
                >
                  {feature.name}
                  <div className="text-xs text-gray-500 mt-1">{feature.description}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedTools.map((tool, toolIndex) => (
              <tr
                key={toolIndex}
                className={toolIndex % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50 dark:bg-gray-800"}
              >
                <td className="p-3 font-medium border-b border-gray-200 dark:border-gray-700">
                  {tool.name}
                </td>
                {features.map((feature, featureIndex) => {
                  const score = tool.features[feature.name];
                  return (
                    <td
                      key={featureIndex}
                      className="p-3 text-center border-b border-gray-200 dark:border-gray-700"
                    >
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${getScoreColor(
                          score
                        )}`}
                      >
                        {getScoreIcon(score)}
                        <span className="capitalize">{score}</span>
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap gap-4 justify-center mt-6">
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-green-100 dark:bg-green-900"></span>
          <span className="text-sm text-gray-600 dark:text-gray-400">Excellent</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-900"></span>
          <span className="text-sm text-gray-600 dark:text-gray-400">Good</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-yellow-100 dark:bg-yellow-900"></span>
          <span className="text-sm text-gray-600 dark:text-gray-400">Fair</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-red-100 dark:bg-red-900"></span>
          <span className="text-sm text-gray-600 dark:text-gray-400">Poor</span>
        </div>
      </div>
    </div>
  );
}