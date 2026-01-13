import { useState } from "react";
import { ArrowUpDown } from "lucide-react";

interface Feature {
  name: string;
  category: string;
}

interface Row {
  feature: Feature;
  tool1Value: string;
  tool2Value: string;
  tool3Value: string;
}

interface ToolMatrixProps {
  tools: string[];
  rows: Row[];
}

const getColor = (value: string) => {
  const colors: Record<string, string> = {
    "Excellent": "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200",
    "Good": "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200",
    "Fair": "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200",
    "Poor": "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200",
    "N/A": "bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200",
  };
  return colors[value] || "bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200";
};

const getShape = (value: string) => {
  const shapes: Record<string, string> = {
    "Excellent": "●",
    "Good": "◼",
    "Fair": "◆",
    "Poor": "▲",
    "N/A": "■",
  };
  return shapes[value] || "□";
};

export function FeatureMatrix({ tools, rows }: ToolMatrixProps) {
  const [sortConfig, setSortConfig] = useState<{ key: keyof Row; direction: "asc" | "desc" } | null>(null);

  const sortedRows = [...rows];
  if (sortConfig !== null) {
    sortedRows.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  }

  const requestSort = (key: keyof Row) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  return (
    <div className="overflow-x-auto my-6">
      <div className="w-full">
        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-4 text-sm">
          {Object.entries(getColor("")).map(([value, className]) => (
            <div key={value} className="flex items-center gap-2">
              <span className={`inline-block w-4 h-4 rounded ${className}`}>
                {getShape(value)}
              </span>
              <span>{value}</span>
            </div>
          ))}
        </div>

        {/* Table */}
        <table className="w-full border-collapse border border-gray-300 dark:border-gray-700">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800">
              <th className="border border-gray-300 dark:border-gray-700 p-3 text-left font-semibold">
                Feature
              </th>
              {tools.map((tool, index) => (
                <th
                  key={index}
                  className="border border-gray-300 dark:border-gray-700 p-3 text-left font-semibold"
                >
                  {tool}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="border border-gray-300 dark:border-gray-700 p-3">
                  <div>
                    <div className="font-medium">{row.feature.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{row.feature.category}</div>
                  </div>
                </td>
                {tools.map((tool, toolIndex) => {
                  const values = [row.tool1Value, row.tool2Value, row.tool3Value];
                  const value = values[toolIndex] || "N/A";
                  return (
                    <td
                      key={toolIndex}
                      className="border border-gray-300 dark:border-gray-700 p-3 text-center"
                    >
                      <span
                        className={`inline-block px-2 py-1 rounded ${getColor(value)}`}
                      >
                        {getShape(value)} {value}
                      </span>
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
}

// Helper function for MDX
export const ToolComparisonMatrix = FeatureMatrix;