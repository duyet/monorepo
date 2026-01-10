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

  const getRatingColor = (score: FeatureMatrixRating | null): string => {
    if (score === null) return "bg-white dark:bg-slate-900/30";
    if (score >= 4) return "bg-white dark:bg-slate-900/30";
    if (score === 3) return "bg-white dark:bg-slate-900/30";
    return "bg-white dark:bg-slate-900/30";
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {title && (
        <div className="space-y-2 border-l-2 border-gray-300 dark:border-slate-700 pl-4">
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

      {/* Features as cards grid */}
      <div className="space-y-4">
        {features.map((feature) => (
          <div key={feature.featureName} className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white border-l-2 border-gray-300 dark:border-slate-700 pl-4">
              {feature.featureName}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {feature.scores.map((score, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded border border-gray-200 dark:border-slate-800 transition-all hover:border-gray-300 dark:hover:border-slate-700 ${getRatingColor(score.score)}`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-gray-900 dark:text-white text-sm">
                        {tools[idx]}
                      </span>
                      {score.score && (
                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 whitespace-nowrap">
                          {score.score}/5
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {getRatingLabel(score.score)}
                    </p>
                    {score.explanation && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
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
