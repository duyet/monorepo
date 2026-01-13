"use client";

import { useState } from "react";
import { cn } from "@duyet/libs/utils";

export interface Feature {
  name: string;
  tools: {
    name: string;
    score: number;
    shape?: "circle" | "square" | "triangle";
    color?: string;
  }[];
}

export interface FeatureMatrixProps {
  features: Feature[];
  className?: string;
}

const getShapeClasses = (shape: string = "circle") => {
  switch (shape) {
    case "square":
      return "rounded-md";
    case "triangle":
      return "triangle";
    default:
      return "rounded-full";
  }
};

const getColorClasses = (color: string = "blue") => {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    red: "bg-red-500",
    yellow: "bg-yellow-500",
    purple: "bg-purple-500",
    indigo: "bg-indigo-500",
    pink: "bg-pink-500",
  };
  return colorMap[color] || "bg-gray-500";
};

const getScoreColor = (score: number) => {
  if (score >= 4) return "text-green-600";
  if (score >= 3) return "text-yellow-600";
  return "text-red-600";
};

export function FeatureMatrix({ features, className }: FeatureMatrixProps) {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);

  const sortedFeatures = [...features];
  if (sortConfig) {
    sortedFeatures.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  }

  const handleSort = (key: string) => {
    setSortConfig((current) => ({
      key,
      direction: current?.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  return (
    <div className={cn("w-full max-w-6xl mx-auto", className)}>
      <h2 className="text-2xl font-bold mb-6">Feature Matrix</h2>

      {/* Sort Controls */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => handleSort("name")}
          className="px-3 py-1 text-sm border rounded-lg hover:bg-gray-50"
        >
          Sort by {sortConfig?.key === "name" ? (sortConfig.direction === "asc" ? "↑" : "↓") : "Name"}
        </button>
      </div>

      {/* Matrix Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse bg-white rounded-lg shadow-sm border border-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-200 px-4 py-3 text-left font-semibold">
                Feature
              </th>
              {features[0]?.tools.map((tool, index) => (
                <th key={index} className="border border-gray-200 px-4 py-3 text-center font-semibold">
                  {tool.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedFeatures.map((feature, rowIndex) => (
              <tr key={rowIndex}>
                <td className="border border-gray-200 px-4 py-3 font-medium">
                  {feature.name}
                </td>
                {feature.tools.map((tool, toolIndex) => (
                  <td key={toolIndex} className="border border-gray-200 px-4 py-3 text-center">
                    <div className="flex flex-col items-center gap-2">
                      {/* Shape */}
                      <div
                        className={cn(
                          "w-10 h-10 flex items-center justify-center text-white font-bold text-sm",
                          getShapeClasses(tool.shape),
                          getColorClasses(tool.color)
                        )}
                        title={`${tool.name} - Score: ${tool.score}/5`}
                      >
                        {tool.shape === "triangle" ? "▲" : tool.score}
                      </div>
                      {/* Score */}
                      <span className={cn("text-sm font-medium", getScoreColor(tool.score))}>
                        {tool.score}/5
                      </span>
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
              5
            </div>
            <span className="text-sm">Excellent (5/5)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs">
              4
            </div>
            <span className="text-sm">Good (4/5)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center text-white text-xs">
              3
            </div>
            <span className="text-sm">Average (3/5)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white text-xs">
              2
            </div>
            <span className="text-sm">Poor (2/5)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gray-500 flex items-center justify-center text-white text-xs">
              1
            </div>
            <span className="text-sm">Very Poor (1/5)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gray-500 flex items-center justify-center text-white text-xs">
              ▲
            </div>
            <span className="text-sm">Triangle shape</span>
          </div>
        </div>
      </div>
    </div>
  );
}