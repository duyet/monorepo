"use client";

import { useState } from "react";

interface Feature {
  name: string;
  scores: Record<string, number>; // feature: score (1-10)
}

interface FeatureMatrixProps {
  features: Feature[];
  categories: string[];
}

// Score to color and shape mapping
const getScoreStyle = (score: number) => {
  if (score >= 9) return "bg-green-500 text-white";
  if (score >= 7) return "bg-blue-500 text-white";
  if (score >= 5) return "bg-yellow-500 text-black";
  if (score >= 3) return "bg-orange-500 text-white";
  return "bg-red-500 text-white";
};

const getScoreShape = (score: number) => {
  if (score >= 9) return "■"; // Square
  if (score >= 7) return "●"; // Circle
  if (score >= 5) return "▲"; // Triangle
  if (score >= 3) return "○"; // Hollow circle
  return "×"; // X
};

export function FeatureMatrix({ features, categories }: FeatureMatrixProps) {
  const [sortCategory, setSortCategory] = useState<string>(categories[0]);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const sortedFeatures = [...features].sort((a, b) => {
    const aScore = a.scores[sortCategory] || 0;
    const bScore = b.scores[sortCategory] || 0;
    return sortDirection === "desc" ? bScore - aScore : aScore - bScore;
  });

  const handleSort = (category: string) => {
    if (sortCategory === category) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortCategory(category);
      setSortDirection("desc");
    }
  };

  return (
    <div className="my-6 overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-gray-300 dark:border-gray-700">
            <th className="p-2 text-left font-semibold">Tool</th>
            {categories.map((cat) => (
              <th
                key={cat}
                className="p-2 text-center font-semibold cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={() => handleSort(cat)}
              >
                {cat}{" "}
                {sortCategory === cat && (
                  <span className="text-xs ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedFeatures.map((feature, idx) => (
            <tr
              key={idx}
              className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50"
            >
              <td className="p-2 font-medium">{feature.name}</td>
              {categories.map((cat) => {
                const score = feature.scores[cat] || 0;
                return (
                  <td key={cat} className="p-2">
                    <div
                      className={`flex items-center justify-center gap-1 rounded px-2 py-1 ${getScoreStyle(
                        score
                      )}`}
                      title={`Score: ${score}/10`}
                    >
                      <span>{getScoreShape(score)}</span>
                      <span className="font-mono font-bold">{score}</span>
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 italic">
        Click any category header to sort • Click again to toggle direction
      </div>
    </div>
  );
}