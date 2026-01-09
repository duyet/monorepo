"use client";

import { useState, useMemo } from "react";
import { Trophy, HelpCircle, ArrowUpDown } from "lucide-react";
import type {
  FeatureMatrixProps,
  FeatureMatrixRating,
  SortState,
} from "./types";

/**
 * Rating configuration type
 */
type RatingConfigValue = {
  bg: string;
  text: string;
  shape: string;
  label: string;
  darkBg: string;
};

/**
 * Rating configuration with color, shape, and accessibility info
 */
const ratingConfigMap: Record<FeatureMatrixRating, RatingConfigValue> = {
  5: {
    bg: "bg-emerald-100",
    darkBg: "dark:bg-emerald-900",
    text: "text-emerald-900 dark:text-emerald-100",
    shape: "●",
    label: "Excellent (5/5)",
  },
  4: {
    bg: "bg-green-100",
    darkBg: "dark:bg-green-900",
    text: "text-green-900 dark:text-green-100",
    shape: "◕",
    label: "Very Good (4/5)",
  },
  3: {
    bg: "bg-yellow-100",
    darkBg: "dark:bg-yellow-900",
    text: "text-yellow-900 dark:text-yellow-100",
    shape: "◑",
    label: "Good (3/5)",
  },
  2: {
    bg: "bg-orange-100",
    darkBg: "dark:bg-orange-900",
    text: "text-orange-900 dark:text-orange-100",
    shape: "◔",
    label: "Fair (2/5)",
  },
  1: {
    bg: "bg-red-100",
    darkBg: "dark:bg-red-900",
    text: "text-red-900 dark:text-red-100",
    shape: "○",
    label: "Poor (1/5)",
  },
  0: {
    bg: "bg-gray-100",
    darkBg: "dark:bg-gray-800",
    text: "text-gray-600 dark:text-gray-300",
    shape: "—",
    label: "Not Applicable",
  },
};

const nullRatingConfig: RatingConfigValue = {
  bg: "bg-gray-100",
  darkBg: "dark:bg-gray-800",
  text: "text-gray-600 dark:text-gray-300",
  shape: "—",
  label: "Not Available",
};

/**
 * Get rating config for a score (handles null)
 */
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
 * Rating cell component with color, shape, and accessibility
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
          px-3 py-2 rounded font-medium text-center transition-colors
          ${config.bg} ${config.darkBg} ${config.text}
          flex items-center justify-center gap-1 relative
          ${explanation ? "cursor-help" : ""}
        `}
        role="cell"
        aria-label={`${config.label}${explanation ? `. ${explanation}` : ""}`}
      >
        <span className="text-lg">{config.shape}</span>
        <span className="text-sm font-bold">{score ?? "-"}</span>
        {isWinner && (
          <Trophy
            className="w-4 h-4 absolute -top-2 -right-2 text-yellow-500 drop-shadow-lg"
            fill="currentColor"
            aria-label="Winner in this category"
          />
        )}
      </div>
    </Tooltip>
  );
}

/**
 * FeatureMatrix component - Responsive comparison table with sortable columns
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

  // Find winner for each row (highest score)
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
      // Cycle through sort directions: asc -> desc -> none
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
      <div className={`p-8 text-center ${className}`}>
        <p className="text-muted-foreground">No comparison data available</p>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      {title && (
        <h2 className="text-2xl font-bold mb-2 text-foreground">{title}</h2>
      )}
      {description && (
        <p className="text-muted-foreground mb-4">{description}</p>
      )}

      {/* Mobile scrollable container */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {/* Feature column header */}
              <th className="sticky left-0 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3 text-left font-semibold text-foreground min-w-[150px]">
                Feature
              </th>

              {/* Tool column headers */}
              {tools.map((tool, index) => (
                <th
                  key={tool}
                  onClick={() => handleHeaderClick(index)}
                  className={`
                    bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700
                    px-4 py-3 text-center font-semibold text-foreground
                    cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800
                    transition-colors min-w-[140px] select-none
                    ${sort.columnIndex === index ? "bg-blue-50 dark:bg-blue-900/20" : ""}
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
                  <div className="flex items-center justify-center gap-2">
                    <span>{tool}</span>
                    <ArrowUpDown
                      className={`
                        w-4 h-4 transition-all
                        ${
                          sort.columnIndex === index
                            ? "opacity-100 text-blue-600 dark:text-blue-400"
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
                    border-b border-gray-200 dark:border-gray-700
                    ${rowIndex % 2 === 0 ? "bg-white dark:bg-gray-950" : "bg-gray-50 dark:bg-gray-900"}
                    hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors
                  `}
                >
                  {/* Feature name cell */}
                  <td className="sticky left-0 bg-inherit px-4 py-3 font-medium text-foreground min-w-[150px]">
                    <div className="flex items-center gap-2">
                      <span>{feature.featureName}</span>
                      {feature.scores.some((s) => s.explanation) &&
                        showTooltips && (
                          <HelpCircle
                            className="w-4 h-4 text-gray-400"
                            aria-hidden="true"
                          />
                        )}
                    </div>
                  </td>

                  {/* Score cells */}
                  {feature.scores.map((toolScore, colIndex) => (
                    <td
                      key={`${feature.featureName}-${toolScore.toolName}`}
                      className="px-4 py-3 text-center"
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

      {/* Legend */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
        <p className="font-semibold text-sm mb-3 text-foreground">
          Rating Scale:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-xs">
          {[5, 4, 3, 2, 1, 0].map((rating) => {
            const config = ratingConfigMap[rating as FeatureMatrixRating];
            return (
              <div key={rating} className="flex items-center gap-2">
                <div
                  className={`
                    w-6 h-6 rounded flex items-center justify-center font-bold
                    ${config.bg} ${config.darkBg} ${config.text}
                  `}
                >
                  <span className="text-xs">{config.shape}</span>
                </div>
                <span className="text-muted-foreground">{config.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default FeatureMatrix;
