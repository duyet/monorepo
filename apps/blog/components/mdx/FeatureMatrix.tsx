"use client";

import { useState } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@duyet/libs/utils";

interface Feature {
  name: string;
  description?: string;
}

interface Tool {
  name: string;
  features: Record<string, number>; // feature name -> score
}

interface ScoreColors {
  [score: number]: string;
}

interface FeatureMatrixProps {
  features: Feature[];
  tools: Tool[];
  colors?: ScoreColors;
}

const defaultColors: ScoreColors = {
  1: "bg-red-100 text-red-800 border-red-300",
  2: "bg-orange-100 text-orange-800 border-orange-300",
  3: "bg-yellow-100 text-yellow-800 border-yellow-300",
  4: "bg-green-100 text-green-800 border-green-300",
  5: "bg-emerald-100 text-emerald-800 border-emerald-300",
};

const getScoreShape = (score: number) => {
  const shapes = {
    1: "○",
    2: "△",
    3: "◇",
    4: "□",
    5: "●",
  };
  return shapes[score as keyof typeof shapes] || "?";
};

const getFeatureScore = (tool: Tool, featureName: string): number => {
  return tool.features[featureName] || 0;
};

export function FeatureMatrix({ features, tools, colors = defaultColors }: FeatureMatrixProps) {
  const [sortConfig, setSortConfig] = useState<{
    key: "name" | string;
    direction: "asc" | "desc";
  }>({
    key: "name",
    direction: "asc",
  });

  const sortedTools = [...tools].sort((a, b) => {
    if (sortConfig.key === "name") {
      return sortConfig.direction === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    } else {
      const scoreA = getFeatureScore(a, sortConfig.key);
      const scoreB = getFeatureScore(b, sortConfig.key);
      return sortConfig.direction === "asc" ? scoreA - scoreB : scoreB - scoreA;
    }
  });

  const handleSort = (key: "name" | string) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: "name" | string) => {
    if (sortConfig.key !== key) return <ArrowUpDown className="h-4 w-4 opacity-50" />;
    return sortConfig.direction === "asc" ? (
      <ArrowUp className="h-4 w-4" />
    ) : (
      <ArrowDown className="h-4 w-4" />
    );
  };

  return (
    <div className="my-8 overflow-x-auto">
      <table className="w-full border-collapse rounded-lg overflow-hidden">
        <thead className="bg-gray-50">
          <tr>
            <th className="border border-gray-200 px-4 py-3 text-left">
              <button
                onClick={() => handleSort("name")}
                className="flex items-center gap-2 font-semibold hover:bg-gray-100 px-2 py-1 rounded"
              >
                Tool {getSortIcon("name")}
              </button>
            </th>
            {features.map((feature) => (
              <th
                key={feature.name}
                className="border border-gray-200 px-4 py-3 text-center min-w-[100px]"
              >
                <button
                  onClick={() => handleSort(feature.name)}
                  className="flex flex-col items-center gap-1 hover:bg-gray-100 px-2 py-1 rounded"
                >
                  <span className="font-semibold text-sm">{feature.name}</span>
                  <span className="text-xs text-gray-500">{getSortIcon(feature.name)}</span>
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedTools.map((tool, toolIndex) => (
            <tr key={toolIndex} className={toolIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}>
              <td className="border border-gray-200 px-4 py-3 font-medium">
                {tool.name}
              </td>
              {features.map((feature) => {
                const score = getFeatureScore(tool, feature.name);
                const colorClass = colors[score] || "bg-gray-100 text-gray-800 border-gray-300";
                return (
                  <td key={feature.name} className="border border-gray-200 px-4 py-3 text-center">
                    <div
                      className={cn(
                        "inline-flex flex-col items-center justify-center rounded border px-3 py-2 min-h-[60px]",
                        colorClass
                      )}
                    >
                      <span className="text-lg font-bold">{score}</span>
                      <span className="text-xs">{getScoreShape(score)}</span>
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
        <tfoot className="bg-gray-100">
          <tr>
            <td className="border border-gray-200 px-4 py-3 font-semibold">Score Guide</td>
            <td colSpan={features.length} className="border border-gray-200 px-4 py-3">
              <div className="flex flex-wrap gap-4 justify-center">
                {Object.entries(defaultColors).map(([score, colorClass]) => (
                  <div key={score} className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{score}</span>
                    <div className={cn("w-4 h-4 rounded border", colorClass)} />
                    <span className="text-xs text-gray-600">{getScoreShape(Number(score))}</span>
                  </div>
                ))}
              </div>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}