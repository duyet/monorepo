import React from "react";

interface ToolFeature {
  name: string;
  features: Record<string, string | boolean>;
}

interface FeatureMatrixProps {
  tools: ToolFeature[];
  features: string[];
  title?: string;
}

/**
 * Tabular comparison matrix for multiple tools
 */
export const FeatureMatrix: React.FC<FeatureMatrixProps> = ({
  tools,
  features,
  title = "Feature Comparison",
}) => {
  const getFeatureClass = (value: string | boolean) => {
    if (typeof value === "boolean") {
      return value
        ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
        : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200";
    }
    return value
      ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400";
  };

  const getFeatureIcon = (value: string | boolean) => {
    if (typeof value === "boolean") {
      return value ? "✅" : "❌";
    }
    return value ? "✅" : "➖";
  };

  return (
    <div className="my-8 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <h3 className="bg-gray-50 dark:bg-gray-800 px-6 py-3 text-lg font-semibold border-b border-gray-200 dark:border-gray-700">
        {title}
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Feature
              </th>
              {tools.map((tool) => (
                <th
                  key={tool.name}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  {tool.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {features.map((feature, featureIndex) => (
              <tr
                key={feature}
                className={featureIndex % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50 dark:bg-gray-800"}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                  {feature}
                </td>
                {tools.map((tool) => (
                  <td
                    key={tool.name}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400"
                  >
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getFeatureClass(
                        tool.features[feature] || ""
                      )}`}
                    >
                      {getFeatureIcon(tool.features[feature] || "")}
                      {tool.features[feature]?.toString() || "N/A"}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};