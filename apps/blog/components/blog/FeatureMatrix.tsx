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

      {/* Features as inline metadata */}
      <div className="space-y-2">
        {features.map((feature) => (
          <div key={feature.featureName} className="text-base text-gray-700 dark:text-gray-300">
            <span className="text-gray-500 dark:text-gray-400 font-medium">{feature.featureName}:</span>{" "}
            {feature.scores.map((score, idx) => (
              <span key={idx}>
                {tools[idx]} {getRatingLabel(score.score)}
                {score.explanation && ` (${score.explanation})`}
                {idx < feature.scores.length - 1 && " • "}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default FeatureMatrix;
