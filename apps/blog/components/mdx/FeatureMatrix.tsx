import React, { useState } from "react";

interface FeatureMatrixProps {
  features: Array<{
    name: string;
    tools: Array<{
      name: string;
      score: number;
      color: string;
      shape: string;
    }>;
  }>;
}

export const FeatureMatrix: React.FC<FeatureMatrixProps> = ({ features }) => {
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const sortedFeatures = [...features];
  if (sortBy) {
    sortedFeatures.sort((a, b) => {
      const aScore = a.tools.find(t => t.name === sortBy)?.score || 0;
      const bScore = b.tools.find(t => t.name === sortBy)?.score || 0;
      return sortDirection === "desc" ? bScore - aScore : aScore - bScore;
    });
  }

  const toolNames = features[0]?.tools.map(t => t.name) || [];

  const handleSort = (toolName: string) => {
    if (sortBy === toolName) {
      setSortDirection(sortDirection === "desc" ? "asc" : "desc");
    } else {
      setSortBy(toolName);
      setSortDirection("desc");
    }
  };

  return (
    <div className="w-full overflow-x-auto mb-8">
      <h3 className="text-2xl font-bold mb-6 text-center">Feature Matrix</h3>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800">
              <th className="p-3 border text-left font-semibold">Feature</th>
              {toolNames.map((toolName, index) => (
                <th
                  key={index}
                  className="p-3 border text-center font-semibold cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
                  onClick={() => handleSort(toolName)}
                >
                  {toolName}
                  {sortBy === toolName && (
                    <span className="ml-1">
                      {sortDirection === "desc" ? "↓" : "↑"}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedFeatures.map((feature, featureIndex) => (
              <tr key={featureIndex} className={featureIndex % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50 dark:bg-gray-800"}>
                <td className="p-3 border font-medium">{feature.name}</td>
                {feature.tools.map((tool, toolIndex) => (
                  <td key={toolIndex} className="p-3 border text-center">
                    <div
                      className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-white font-bold text-sm `
                      + `bg-${tool.color}-500`}
                    >
                      {tool.shape === "circle" && "●"}
                      {tool.shape === "square" && "■"}
                      {tool.shape === "triangle" && "▲"}
                      {tool.shape === "star" && "★"}
                      <span className="ml-1 text-xs">{tool.score}</span>
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};