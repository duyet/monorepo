"use client";

import type {
  FeatureMatrixProps,
  FeatureMatrixRating,
} from "./types";

/**
 * FeatureMatrix - Minimal table comparison
 * Uses semantic color palette from design system
 */
export function FeatureMatrix({
  tools,
  features,
  className = "",
  title,
  description,
}: FeatureMatrixProps) {
  if (!features.length || !tools.length) {
    return (
      <div className={`text-sm text-gray-500 dark:text-gray-400 ${className}`}>
        No comparison data
      </div>
    );
  }

  const getRatingColor = (score: FeatureMatrixRating | null) => {
    if (score === null) return "text-gray-400 dark:text-gray-500";
    if (score >= 4) return "text-green-700 dark:text-green-400 font-semibold";
    if (score === 3) return "text-blue-700 dark:text-blue-400 font-medium";
    if (score === 2) return "text-amber-700 dark:text-amber-400 font-medium";
    return "text-red-700 dark:text-red-400 font-medium";
  };

  const getRatingLabel = (score: FeatureMatrixRating | null): string => {
    if (score === null) return "—";
    if (score >= 4) return "★★★★";
    if (score === 3) return "★★★☆";
    if (score === 2) return "★★☆☆";
    return "★☆☆☆";
  };

  return (
    <div className={`space-y-5 ${className}`}>
      {title && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
            {title}
          </h2>
          {description && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
      )}

      {/* Comparison Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-slate-800">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-slate-800 bg-gradient-to-r from-gray-50 dark:from-slate-900 to-gray-50 dark:to-slate-950">
              <th className="text-left px-5 py-3 font-semibold text-gray-900 dark:text-white text-sm">
                Feature
              </th>
              {tools.map((tool) => (
                <th
                  key={tool}
                  className="text-center px-4 py-3 font-semibold text-gray-900 dark:text-white text-sm min-w-[140px]"
                >
                  {tool}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {features.map((feature, idx) => (
              <tr
                key={feature.featureName}
                className={`border-b border-gray-200 dark:border-slate-800 ${
                  idx % 2 === 0 ? "bg-gray-50/50 dark:bg-slate-900/30" : ""
                }`}
              >
                <td className="px-5 py-4 font-medium text-gray-900 dark:text-white text-sm">
                  {feature.featureName}
                </td>
                {feature.scores.map((score, idx) => (
                  <td key={idx} className="text-center px-4 py-4">
                    <div className={`text-sm ${getRatingColor(score.score)}`}>
                      {getRatingLabel(score.score)}
                    </div>
                    {score.explanation && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {score.explanation}
                      </div>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="bg-gray-50 dark:bg-slate-900/50 rounded-lg p-4 border border-gray-200 dark:border-slate-800">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-3">
          Rating Guide
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <div className="text-green-700 dark:text-green-400 font-semibold">★★★★</div>
            <div className="text-gray-600 dark:text-gray-400">Excellent</div>
          </div>
          <div>
            <div className="text-blue-700 dark:text-blue-400 font-medium">★★★☆</div>
            <div className="text-gray-600 dark:text-gray-400">Good</div>
          </div>
          <div>
            <div className="text-amber-700 dark:text-amber-400 font-medium">★★☆☆</div>
            <div className="text-gray-600 dark:text-gray-400">Fair</div>
          </div>
          <div>
            <div className="text-red-700 dark:text-red-400 font-medium">★☆☆☆</div>
            <div className="text-gray-600 dark:text-gray-400">Limited</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FeatureMatrix;
