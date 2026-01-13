import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronUp, ChevronDown } from "lucide-react";

interface Feature {
  name: string;
  [key: string]: number | string;
}

interface Column {
  key: string;
  label: string;
  color: string; // Tailwind class for text color
  shape: "circle" | "square" | "star"; // Shape for visual coding
}

interface FeatureMatrixProps {
  columns: Column[];
  data: Feature[];
  title?: string;
}

export function FeatureMatrix({
  columns,
  data,
  title = "Feature Comparison Matrix",
}: FeatureMatrixProps) {
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);

  const handleSort = (columnKey: string) => {
    setSortConfig((current) => {
      if (!current || current.key !== columnKey) {
        return { key: columnKey, direction: "desc" };
      }
      if (current.direction === "desc") {
        return { key: columnKey, direction: "asc" };
      }
      return null;
    });
  };

  const getSortedData = () => {
    if (!sortConfig) return data;

    return [...data].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortConfig.direction === "desc" ? bVal - aVal : aVal - bVal;
      }

      return 0;
    });
  };

  const getScoreVisual = (value: number, shape: string, color: string) => {
    const size = 8 + (value * 2); // Scale from 8px to 18px
    const commonClasses = `inline-block mr-1 ${color}`;

    if (shape === "circle") {
      return (
        <span
          className={commonClasses}
          style={{
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: "50%",
            backgroundColor: "currentColor",
          }}
        />
      );
    } else if (shape === "square") {
      return (
        <span
          className={commonClasses}
          style={{
            width: `${size}px`,
            height: `${size}px`,
            backgroundColor: "currentColor",
          }}
        />
      );
    } else {
      // Star
      return (
        <span className={commonClasses} style={{ fontSize: `${size}px` }}>
          ★
        </span>
      );
    }
  };

  const sortedData = getSortedData();

  return (
    <div className="my-6 overflow-x-auto">
      <div className="inline-block min-w-full align-middle">
        <div className="overflow-hidden border border-gray-200 dark:border-gray-700 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Feature
                </th>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => handleSort(col.key)}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span className={col.color}>{col.label}</span>
                      {sortConfig?.key === col.key &&
                        (sortConfig.direction === "asc" ? (
                          <ChevronUp size={14} />
                        ) : (
                          <ChevronDown size={14} />
                        ))}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {sortedData.map((row, rowIndex) => (
                <motion.tr
                  key={rowIndex}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: rowIndex * 0.05 }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <td className="px-4 py-3 text-sm font-medium">{row.name}</td>
                  {columns.map((col) => {
                    const value = row[col.key];
                    return (
                      <td key={col.key} className="px-4 py-3 text-center">
                        {typeof value === "number" ? (
                          <div className="flex items-center justify-center">
                            {getScoreVisual(value, col.shape, col.color)}
                            <span className="text-xs ml-1 text-gray-600 dark:text-gray-400">
                              {value}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm">{value}</span>
                        )}
                      </td>
                    );
                  })}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
        <strong>Legend:</strong> {columns.map(col => (
          <span key={col.key} className="inline-block mr-3 ml-1">
            <span className={col.color}>{col.label}</span>: {col.shape} scaled by score
          </span>
        ))}
      </div>
    </div>
  );
}