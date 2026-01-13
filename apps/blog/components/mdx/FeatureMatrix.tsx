import React, { useState, useMemo } from "react";

interface ToolScore {
  name: string;
  score: number;
  color: string;
  shape: "circle" | "square" | "triangle" | "star";
}

interface Feature {
  name: string;
  tools: ToolScore[];
}

interface FeatureMatrixProps {
  features: Feature[];
}

type SortBy = "name" | "score";
type SortOrder = "asc" | "desc";

const ShapeSVG: React.FC<{ shape: string; color: string; size?: number }> = ({
  shape,
  color,
  size = 20
}) => {
  const commonProps = { fill: color, stroke: color, strokeWidth: 1 };

  switch (shape) {
    case "circle":
      return <svg width={size} height={size}><circle cx={size/2} cy={size/2} r={size/2 - 2} {...commonProps} /></svg>;
    case "square":
      return <svg width={size} height={size}><rect x="2" y="2" width={size-4} height={size-4} {...commonProps} /></svg>;
    case "triangle":
      return (
        <svg width={size} height={size}>
          <polygon points={`${size/2},2 ${size-2},${size-2} 2,${size-2}`} {...commonProps} />
        </svg>
      );
    case "star":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill={color} />
        </svg>
      );
    default:
      return null;
  }
};

/**
 * FeatureMatrix Component
 * Displays a sortable table with color and shape coded scores
 */
export const FeatureMatrix: React.FC<FeatureMatrixProps> = ({ features }) => {
  const [sortBy, setSortBy] = useState<SortBy>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  // Get unique tool names
  const toolNames = useMemo(() => {
    const names = new Set<string>();
    features.forEach(f => f.tools.forEach(t => names.add(t.name)));
    return Array.from(names);
  }, [features]);

  // Sort features
  const sortedFeatures = useMemo(() => {
    return [...features].sort((a, b) => {
      if (sortBy === "name") {
        return sortOrder === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else if (sortBy === "score") {
        const maxScoreA = Math.max(...a.tools.map(t => t.score));
        const maxScoreB = Math.max(...b.tools.map(t => t.score));
        return sortOrder === "asc" ? maxScoreA - maxScoreB : maxScoreB - maxScoreA;
      }
      return 0;
    });
  }, [features, sortBy, sortOrder]);

  const toggleSort = (column: SortBy) => {
    if (sortBy === column) {
      setSortOrder(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 9) return "text-green-600 dark:text-green-400 font-bold";
    if (score >= 7) return "text-blue-600 dark:text-blue-400";
    if (score >= 5) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  return (
    <div className="w-full overflow-x-auto mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-bold">Feature Matrix</h3>
        <div className="flex gap-2 text-sm">
          <button
            onClick={() => toggleSort("name")}
            className={`px-3 py-1 rounded ${sortBy === "name" ? "bg-blue-100 dark:bg-blue-900" : "bg-gray-100 dark:bg-gray-800"}`}
          >
            Sort by Name {sortBy === "name" && (sortOrder === "asc" ? "↑" : "↓")}
          </button>
          <button
            onClick={() => toggleSort("score")}
            className={`px-3 py-1 rounded ${sortBy === "score" ? "bg-blue-100 dark:bg-blue-900" : "bg-gray-100 dark:bg-gray-800"}`}
          >
            Sort by Score {sortBy === "score" && (sortOrder === "asc" ? "↑" : "↓")}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-300 dark:border-gray-700">
              <th className="text-left p-3 font-semibold">Feature</th>
              {toolNames.map(name => (
                <th key={name} className="text-center p-3 font-semibold">{name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedFeatures.map((feature, idx) => (
              <tr
                key={idx}
                className={`border-b border-gray-200 dark:border-gray-800 ${
                  idx % 2 === 0 ? "bg-gray-50 dark:bg-gray-900/50" : ""
                }`}
              >
                <td className="p-3 font-medium">{feature.name}</td>
                {toolNames.map(toolName => {
                  const tool = feature.tools.find(t => t.name === toolName);
                  if (!tool) return <td key={toolName} className="p-3 text-center">-</td>;
                  return (
                    <td key={toolName} className="p-3 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <ShapeSVG shape={tool.shape} color={tool.color} size={16} />
                        <span className={`${getScoreColor(tool.score)} text-sm`}>
                          {tool.score}
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
    </div>
  );
};
