"use client";

import type {
  FeatureMatrixProps,
  FeatureMatrixRating,
} from "./types";

/**
 * FeatureMatrix - Text-based comparison
 * Simple prose format, no tables
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

  const getRatingLabel = (score: FeatureMatrixRating | null): string => {
    if (score === null) return "N/A";
    if (score >= 4) return "Excellent";
    if (score === 3) return "Good";
    if (score === 2) return "Fair";
    return "Limited";
  };

  return (
    <div className={`space-y-4 border-l-2 border-gray-300 dark:border-slate-700 pl-4 py-3 ${className}`}>
      {title && (
        <div className="space-y-1">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            {title}
          </h2>
          {description && (
            <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">
              {description}
            </p>
          )}
        </div>
      )}

      {/* Features as grid */}
      <div className="space-y-4">
        {features.map((feature) => (
          <div key={feature.featureName} className="space-y-2">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {feature.featureName}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {feature.scores.map((score, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400 p-2 border border-gray-200 dark:border-slate-800 rounded"
                >
                  <div className="flex-shrink-0 w-2 h-2 rounded-full mt-1.5 bg-gray-400 dark:bg-gray-600" />
                  <div className="flex-1">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {tools[idx]}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {" — "}
                      {getRatingLabel(score.score)}
                    </span>
                    {score.explanation && (
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {score.explanation}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FeatureMatrix;
