import { useState } from "react";

export interface Feature {
  name: string;
  description: string;
  icon?: string;
}

export interface ToolFeatures {
  name: string;
  score: number; // 1-5
  color: string; // Tailwind color classes for background
  shape: "circle" | "square" | "triangle"; // Shape for the indicator
}

export interface FeatureMatrixProps {
  title?: string;
  features: Feature[];
  tools: ToolFeatures[];
  description?: string;
}

/**
 * FeatureMatrix - Sortable table with color+shape coded scores
 * Displays a matrix of features vs tools with visual indicators
 */
export function FeatureMatrix({
  title = "Feature Matrix",
  features,
  tools,
  description
}: FeatureMatrixProps) {
  const [sortBy, setSortBy] = useState<keyof ToolFeatures | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const sortedTools = [...tools];
  if (sortBy) {
    sortedTools.sort((a, b) => {
      if (sortOrder === "desc") {
        return b[sortBy] > a[sortBy] ? 1 : -1;
      }
      return a[sortBy] > b[sortBy] ? 1 : -1;
    });
  }

  const renderShape = (tool: ToolFeatures) => {
    const commonClasses = "w-6 h-6 flex items-center justify-center text-white text-xs font-bold";

    switch (tool.shape) {
      case "circle":
        return (
          <div className={`${commonClasses} ${tool.color} rounded-full`}>
            {tool.score}
          </div>
        );
      case "square":
        return (
          <div className={`${commonClasses} ${tool.color} rounded`}>
            {tool.score}
          </div>
        );
      case "triangle":
        return (
          <div className={`${commonClasses} ${tool.color} bg-transparent`} style={{ width: 24, height: 24 }}>
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M12 2l10 18H2z" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  const handleSort = (key: keyof ToolFeatures) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(key);
      setSortOrder("desc");
    }
  };

  return (
    <div className="my-6">
      <h3 className="text-2xl font-bold mb-2">{title}</h3>
      {description && (
        <p className="text-gray-600 dark:text-gray-300 mb-4">{description}</p>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left p-3 font-semibold">Features</th>
              {tools.map((tool) => (
                <th
                  key={tool.name}
                  className="text-center p-3 font-semibold cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => handleSort("score")}
                >
                  {tool.name}
                  <span className="text-xs ml-1">{sortBy === "score" ? (sortOrder === "asc" ? "↑" : "↓") : ""}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {features.map((feature, idx) => (
              <tr key={idx} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="p-3">
                  <div className="font-medium">{feature.name}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</div>
                </td>
                {tools.map((tool) => (
                  <td key={tool.name} className="p-3 text-center">
                    {renderShape(tool)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
          <span>Circle</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span>Square</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500" style={{ clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }}></div>
          <span>Triangle</span>
        </div>
      </div>
    </div>
  );
}