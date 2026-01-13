import * as React from "react";
import { useState } from "react";
import { ArrowUpDown, Check, X } from "lucide-react";

interface Feature {
  name: string;
  scores: Record<string, number>; // toolName -> score 0-10
}

interface FeatureMatrixProps {
  features: Feature[];
  tools: string[];
  title?: string;
}

type SortDirection = "asc" | "desc" | null;

export function FeatureMatrix({ features, tools, title = "Feature Matrix" }: FeatureMatrixProps) {
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const getScoreColor = (score: number) => {
    if (score >= 8) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
    if (score >= 5) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100";
    return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100";
  };

  const getScoreSymbol = (score: number) => {
    if (score >= 8) return "●"; // Circle
    if (score >= 5) return "■"; // Square
    return "▲"; // Triangle
  };

  const handleSort = (toolName: string) => {
    if (sortField === toolName) {
      setSortDirection(prev => prev === "asc" ? "desc" : prev === "desc" ? null : "asc");
      if (sortDirection === "desc") {
        setSortField(null);
      }
    } else {
      setSortField(toolName);
      setSortDirection("asc");
    }
  };

  const getSortedFeatures = () => {
    if (!sortField || !sortDirection) return features;

    return [...features].sort((a, b) => {
      const aScore = a.scores[sortField] || 0;
      const bScore = b.scores[sortField] || 0;
      return sortDirection === "asc" ? aScore - bScore : bScore - aScore;
    });
  };

  const sortedFeatures = getSortedFeatures();

  return (
    <div className="my-6 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex items-center justify-between">
        <h3 className="text-lg font-semibold m-0">{title}</h3>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Click tool name to sort
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="p-3 text-left font-semibold">Feature</th>
              {tools.map((tool) => (
                <th
                  key={tool}
                  className="p-3 text-center font-semibold cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => handleSort(tool)}
                >
                  <div className="flex items-center justify-center gap-1">
                    {tool}
                    {sortField === tool && (
                      <ArrowUpDown className="w-3 h-3" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedFeatures.map((feature, idx) => (
              <tr
                key={idx}
                className={
                  idx % 2 === 0
                    ? "bg-white dark:bg-gray-900"
                    : "bg-gray-50 dark:bg-gray-800/50"
                }
              >
                <td className="p-3 font-medium">{feature.name}</td>
                {tools.map((tool) => {
                  const score = feature.scores[tool] || 0;
                  return (
                    <td key={tool} className="p-3 text-center">
                      <span
                        className={`inline-flex items-center justify-center gap-1 px-2 py-1 rounded font-mono ${getScoreColor(
                          score
                        )}`}
                        title={`Score: ${score}/10`}
                      >
                        {getScoreSymbol(score)} {score}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-400">
        <div className="flex gap-4 items-center flex-wrap">
          <span><strong>Symbols:</strong></span>
          <span>● = Excellent (8-10)</span>
          <span>■ = Good (5-7)</span>
          <span>▲ = Fair (0-4)</span>
        </div>
      </div>
    </div>
  );
}