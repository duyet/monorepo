"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeatureRow {
  name: string;
  scores: Record<string, number>;
  description?: string;
}

interface FeatureMatrixProps {
  features: string[];
  rows: FeatureRow[];
  title?: string;
  className?: string;
}

export function FeatureMatrix({ features, rows, title, className }: FeatureMatrixProps) {
  const [sortKey, setSortKey] = useState<string>(features[0]);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const getScoreColor = (score: number) => {
    if (score >= 8) return "bg-green-500 text-white";
    if (score >= 6) return "bg-yellow-500 text-white";
    if (score >= 4) return "bg-orange-500 text-white";
    return "bg-red-500 text-white";
  };

  const getScoreShape = (score: number) => {
    if (score >= 9) return "⭐⭐⭐";
    if (score >= 7) return "⭐⭐";
    if (score >= 5) return "⭐";
    return "◐";
  };

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("desc");
    }
  };

  const sortedRows = [...rows].sort((a, b) => {
    const aScore = a.scores[sortKey] || 0;
    const bScore = b.scores[sortKey] || 0;
    return sortOrder === "asc" ? aScore - bScore : bScore - aScore;
  });

  return (
    <div className={cn("space-y-4", className)}>
      {title && <h3 className="text-lg font-semibold">{title}</h3>}
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left font-semibold">Feature</th>
              {features.map((feature) => (
                <th
                  key={feature}
                  className="p-3 text-center font-semibold cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort(feature)}
                >
                  <div className="flex items-center justify-center gap-1">
                    {feature}
                    {sortKey === feature && (
                      sortOrder === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((row) => (
              <tr key={row.name} className="border-t hover:bg-gray-50">
                <td className="p-3 font-medium">
                  <div className="flex flex-col">
                    {row.name}
                    {row.description && (
                      <span className="text-xs text-gray-500 font-normal">
                        {row.description}
                      </span>
                    )}
                  </div>
                </td>
                {features.map((feature) => {
                  const score = row.scores[feature] || 0;
                  return (
                    <td key={feature} className="p-3 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className={cn(
                          "px-2 py-1 rounded font-bold text-xs",
                          getScoreColor(score)
                        )}>
                          {score}
                        </span>
                        <span className="text-[10px] opacity-75">
                          {getScoreShape(score)}
                        </span>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="text-xs text-gray-500 italic">
        <strong>Legend:</strong> ⭐⭐⭐ = Excellent (9-10), ⭐⭐ = Good (7-8), ⭐ = Average (5-6), ◐ = Poor (1-4)
      </div>
    </div>
  );
}