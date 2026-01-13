import React, { useState, useMemo } from "react";

interface FeatureRow {
  feature: string;
  score: number; // 0-10
  [key: string]: any;
}

interface FeatureMatrixProps {
  title: string;
  headers: string[];
  rows: FeatureRow[];
}

/**
 * FeatureMatrix - Sortable table with color and shape-coded scores
 */
export const FeatureMatrix: React.FC<FeatureMatrixProps> = ({ title, headers, rows }) => {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);

  const getScoreColor = (score: number) => {
    if (score >= 8) return "bg-green-500 text-white";
    if (score >= 5) return "bg-yellow-500 text-black";
    return "bg-red-500 text-white";
  };

  const getScoreShape = (score: number) => {
    if (score >= 8) return "●"; // Circle
    if (score >= 5) return "■"; // Square
    return "▲"; // Triangle
  };

  const sortedRows = useMemo(() => {
    if (!sortConfig) return rows;

    return [...rows].sort((a, b) => {
      const aVal = a[sortConfig.key as keyof FeatureRow];
      const bVal = b[sortConfig.key as keyof FeatureRow];

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
      }

      return sortConfig.direction === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }, [rows, sortConfig]);

  const handleSort = (key: string) => {
    setSortConfig((current) => {
      if (!current || current.key !== key) {
        return { key, direction: "asc" };
      }
      if (current.direction === "asc") {
        return { key, direction: "desc" };
      }
      return null;
    });
  };

  return (
    <div className="my-6">
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700">
              <th className="border p-2 text-left">
                <button
                  onClick={() => handleSort("feature")}
                  className="font-semibold hover:underline"
                >
                  Feature {sortConfig?.key === "feature" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                </button>
              </th>
              {headers.map((header) => (
                <th key={header} className="border p-2 text-left">
                  <button
                    onClick={() => handleSort(header)}
                    className="font-semibold hover:underline"
                  >
                    {header} {sortConfig?.key === header && (sortConfig.direction === "asc" ? "↑" : "↓")}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((row, idx) => (
              <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="border p-2 font-medium">{row.feature}</td>
                {headers.map((header) => {
                  const value = row[header];
                  const isNumeric = typeof value === "number";
                  return (
                    <td key={header} className="border p-2">
                      {isNumeric ? (
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-1 rounded font-bold text-center min-w-[2rem] ${getScoreColor(value)}`}
                            title={`Score: ${value}/10`}
                          >
                            {getScoreShape(value)}
                          </span>
                          <span className="font-mono text-sm">{value}</span>
                        </div>
                      ) : (
                        <span>{value}</span>
                      )}
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

export default FeatureMatrix;