"use client";

import { useState, useMemo } from "react";
import { HelpCircle, ArrowUpDown } from "lucide-react";
import type {
  FeatureMatrixProps,
  FeatureMatrixRating,
  SortState,
} from "./types";

/**
 * Rating configuration - minimal design
 */
type RatingConfigValue = {
  label: string;
};

const ratingConfigMap: Record<FeatureMatrixRating, RatingConfigValue> = {
  5: { label: "5/5" },
  4: { label: "4/5" },
  3: { label: "3/5" },
  2: { label: "2/5" },
  1: { label: "1/5" },
  0: { label: "N/A" },
};

const nullRatingConfig: RatingConfigValue = {
  label: "—",
};

function getRatingConfig(score: FeatureMatrixRating | null): RatingConfigValue {
  if (score === null) {
    return nullRatingConfig;
  }
  return ratingConfigMap[score];
}

/**
 * Tooltip component for explanations
 */
function Tooltip({
  explanation,
  children,
}: {
  explanation: string | undefined;
  children: React.ReactNode;
}) {
  if (!explanation) {
    return children;
  }

  return (
    <div className="relative inline-block group">
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto z-10">
        <div className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg">
          {explanation}
        </div>
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-100" />
      </div>
    </div>
  );
}

/**
 * Rating cell component - minimal design
 */
function RatingCell({
  score,
  explanation,
  isWinner,
}: {
  score: FeatureMatrixRating | null;
  explanation: string | undefined;
  isWinner: boolean;
}) {
  const config = getRatingConfig(score);

  return (
    <Tooltip explanation={explanation}>
      <div
        className={`
          px-3 py-2 text-center text-sm font-medium
          flex items-center justify-center gap-1
          ${explanation ? "cursor-help" : ""}
          ${isWinner ? "font-semibold text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300"}
        `}
        role="cell"
        aria-label={`${config.label}${explanation ? `. ${explanation}` : ""}`}
      >
        <span>{config.label}</span>
        {isWinner && (
          <span
            className="text-xs text-gray-500 dark:text-gray-400"
            aria-label="Best in category"
          >
            ★
          </span>
        )}
      </div>
    </Tooltip>
  );
}

/**
 * FeatureMatrix component - Minimal, compact design
 */
export function FeatureMatrix({
  tools,
  features,
  className = "",
  title,
  description,
  showTooltips = true,
}: FeatureMatrixProps) {
  const [sort, setSort] = useState<SortState>({
    columnIndex: null,
    direction: null,
  });

  // Sort features based on selected column
  const sortedFeatures = useMemo(() => {
    if (sort.columnIndex === null || sort.direction === null) {
      return features;
    }

    const colIndex = sort.columnIndex;
    const direction = sort.direction;

    const sorted = [...features].sort((a, b) => {
      const scoreA = a.scores[colIndex]?.score ?? -1;
      const scoreB = b.scores[colIndex]?.score ?? -1;

      if (direction === "asc") {
        return scoreA - scoreB;
      }
      return scoreB - scoreA;
    });

    return sorted;
  }, [features, sort]);

  // Find winner for each row
  const getWinnerIndex = (
    scores: (typeof features)[0]["scores"]
  ): number | null => {
    let maxScore = -1;
    let maxIndex = null;

    scores.forEach((score, index) => {
      if (score.score !== null && score.score > maxScore) {
        maxScore = score.score;
        maxIndex = index;
      }
    });

    return maxIndex;
  };

  const handleHeaderClick = (columnIndex: number) => {
    if (sort.columnIndex === columnIndex) {
      if (sort.direction === "asc") {
        setSort({ columnIndex, direction: "desc" });
      } else if (sort.direction === "desc") {
        setSort({ columnIndex: null, direction: null });
      } else {
        setSort({ columnIndex, direction: "asc" });
      }
    } else {
      setSort({ columnIndex, direction: "asc" });
    }
  };

  if (!features.length || !tools.length) {
    return (
      <div className={`p-4 text-center text-gray-600 dark:text-gray-400 ${className}`}>
        <p>No comparison data available</p>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      {title && (
        <h2 className="text-xl font-semibold mb-1 text-gray-900 dark:text-white">
          {title}
        </h2>
      )}
      {description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          {description}
        </p>
      )}

      {/* Minimal Table */}
      <div className="overflow-x-auto border border-gray-200 dark:border-gray-800 rounded">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
              <th className="sticky left-0 bg-gray-50 dark:bg-gray-900/50 px-3 py-2 text-left font-semibold text-gray-900 dark:text-white min-w-[140px]">
                Feature
              </th>
              {tools.map((tool, index) => (
                <th
                  key={tool}
                  onClick={() => handleHeaderClick(index)}
                  className={`
                    px-3 py-2 text-center font-semibold text-gray-900 dark:text-white
                    cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800
                    transition-colors min-w-[100px] select-none
                    ${
                      sort.columnIndex === index
                        ? "bg-gray-100 dark:bg-gray-800"
                        : ""
                    }
                  `}
                  role="columnheader"
                  aria-sort={
                    sort.columnIndex === index
                      ? sort.direction === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>{tool}</span>
                    <ArrowUpDown
                      className={`
                        w-3 h-3 transition-all
                        ${
                          sort.columnIndex === index
                            ? "opacity-100 text-gray-700 dark:text-gray-300"
                            : "opacity-0 text-gray-400"
                        }
                      `}
                      aria-hidden="true"
                    />
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {sortedFeatures.map((feature, rowIndex) => {
              const winnerIndex = getWinnerIndex(feature.scores);

              return (
                <tr
                  key={feature.featureName}
                  className={`
                    border-b border-gray-200 dark:border-gray-800
                    ${rowIndex % 2 === 0 ? "bg-white dark:bg-gray-950" : "bg-gray-50 dark:bg-gray-900/50"}
                    hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors
                  `}
                >
                  <td className="sticky left-0 bg-inherit px-3 py-2 font-medium text-gray-900 dark:text-white min-w-[140px]">
                    <div className="flex items-center gap-1.5">
                      <span>{feature.featureName}</span>
                      {feature.scores.some((s) => s.explanation) &&
                        showTooltips && (
                          <HelpCircle
                            className="w-3.5 h-3.5 text-gray-400 flex-shrink-0"
                            aria-hidden="true"
                          />
                        )}
                    </div>
                  </td>

                  {feature.scores.map((toolScore, colIndex) => (
                    <td
                      key={`${feature.featureName}-${toolScore.toolName}`}
                      className="px-3 py-2 text-center"
                    >
                      <RatingCell
                        score={toolScore.score}
                        explanation={
                          showTooltips ? toolScore.explanation : undefined
                        }
                        isWinner={colIndex === winnerIndex}
                      />
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend - Minimal */}
      <div className="mt-3 text-xs text-gray-600 dark:text-gray-400">
        <p className="font-medium mb-1">Rating: 5 = Excellent, 4 = Good, 3 = Fair, 2 = Poor, 1 = Very Poor</p>
      </div>
    </div>
  );
}

export default FeatureMatrix;
