import React, { useState } from "react";
import { cn } from "@duyet/libs/utils";

export interface Feature {
  name: string;
  description: string;
}

export interface ToolScore {
  name: string;
  scores: Record<string, number>;
  color?: string;
}

export interface FeatureMatrixProps {
  features: Feature[];
  tools: ToolScore[];
  sortBy?: "name" | "avgScore";
  className?: string;
}

const COLOR_PALETTE = [
  "bg-blue-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-orange-500",
  "bg-pink-500",
  "bg-red-500",
  "bg-indigo-500",
  "bg-yellow-500",
];

const SHAPE_PALETTE = ["rounded-full", "rounded-md", "rounded-lg", "rounded-none"];

export function FeatureMatrix({ features, tools, sortBy = "avgScore", className }: FeatureMatrixProps) {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({
    key: sortBy,
    direction: "desc",
  });

  // Calculate average scores for each tool
  const toolsWithAvg = tools.map((tool) => ({
    ...tool,
    avgScore: Object.values(tool.scores).reduce((sum, score) => sum + score, 0) / Object.keys(tool.scores).length,
  }));

  // Sort tools
  const sortedTools = [...toolsWithAvg].sort((a, b) => {
    if (sortConfig.key === "name") {
      return sortConfig.direction === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    } else {
      return sortConfig.direction === "asc"
        ? a.avgScore - b.avgScore
        : b.avgScore - a.avgScore;
    }
  });

  const toggleSort = (key: string) => {
    if (sortConfig.key === key) {
      setSortConfig({
        key,
        direction: sortConfig.direction === "asc" ? "desc" : "asc",
      });
    } else {
      setSortConfig({ key, direction: "desc" });
    }
  };

  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    if (percentage >= 40) return "text-orange-600";
    return "text-red-600";
  };

  const getScoreShape = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return "rounded-full";
    if (percentage >= 60) return "rounded-md";
    if (percentage >= 40) return "rounded-lg";
    return "rounded-none";
  };

  const maxScore = Math.max(...tools.map(tool => Math.max(...Object.values(tool.scores))));

  return (
    <div className={cn("w-full max-w-6xl mx-auto space-y-6", className)}>
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Feature Matrix</h2>
        <p className="text-muted-foreground">
          Compare tools across different features. Click headers to sort.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left p-3 font-semibold">
                Tool
              </th>
              {features.map((feature, index) => (
                <th
                  key={feature.name}
                  className="text-left p-3 font-semibold cursor-pointer hover:bg-muted/50"
                  onClick={() => toggleSort(feature.name)}
                >
                  <div className="flex items-center">
                    {feature.name}
                    <span className="ml-2 text-xs opacity-60">
                      {sortConfig.key === feature.name ?
                        (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {feature.description}
                  </div>
                </th>
              ))}
              <th
                className="text-left p-3 font-semibold cursor-pointer hover:bg-muted/50"
                onClick={() => toggleSort("avgScore")}
              >
                <div className="flex items-center">
                  Average
                  <span className="ml-2 text-xs opacity-60">
                    {sortConfig.key === "avgScore" ?
                      (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
                  </div>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedTools.map((tool, toolIndex) => (
              <tr key={tool.name} className="border-b hover:bg-muted/50">
                <td className="p-3 font-medium">
                  <div className="flex items-center">
                    <div
                      className={cn(
                        "w-3 h-3 mr-2",
                        COLOR_PALETTE[toolIndex % COLOR_PALETTE.length]
                      )}
                    />
                    {tool.name}
                  </div>
                </td>
                {features.map((feature) => {
                  const score = tool.scores[feature.name] || 0;
                  const shape = getScoreShape(score, maxScore);
                  const color = getScoreColor(score, maxScore);

                  return (
                    <td key={feature.name} className="p-3">
                      <div
                        className={cn(
                          "w-8 h-8 flex items-center justify-center text-white font-bold text-sm",
                          tool.color || COLOR_PALETTE[toolIndex % COLOR_PALETTE.length],
                          shape
                        )}
                        title={`${tool.name}: ${score}/${maxScore} - ${feature.description}`}
                      >
                        {score}
                      </div>
                    </td>
                  );
                })}
                <td className="p-3">
                  <div className="flex items-center space-x-2">
                    <div
                      className={cn(
                        "text-lg font-bold",
                        getScoreColor(tool.avgScore, maxScore)
                      )}
                    >
                      {tool.avgScore.toFixed(1)}
                    </div>
                    <div
                      className={cn(
                        "w-20 h-2 bg-secondary rounded-full overflow-hidden",
                        getScoreShape(tool.avgScore, maxScore)
                      )}
                    >
                      <div
                        className={cn(
                          "h-full transition-all",
                          tool.color || COLOR_PALETTE[toolIndex % COLOR_PALETTE.length]
                        )}
                        style={{ width: `${(tool.avgScore / maxScore) * 100}%` }}
                      />
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center space-x-2">
          <span className="text-muted-foreground">Score Legend:</span>
          {[5, 4, 3, 2, 1].map((score) => (
            <div key={score} className="flex items-center space-x-1">
              <div
                className={cn(
                  "w-6 h-6 flex items-center justify-center text-xs text-white",
                  COLOR_PALETTE[0],
                  getScoreShape(score, maxScore)
                )}
              >
                {score}
              </div>
              <span className="text-muted-foreground">
                {score >= 4 ? "Excellent" : score >= 3 ? "Good" : score >= 2 ? "Fair" : "Poor"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}