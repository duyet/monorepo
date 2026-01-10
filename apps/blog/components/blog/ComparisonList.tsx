"use client";

export interface ComparisonItem {
  id: string;
  label: string;
  value: string;
  highlight?: boolean;
}

export interface ComparisonListProps {
  title?: string;
  description?: string;
  items: ComparisonItem[];
  className?: string;
}

/**
 * ComparisonList - Side-by-side item comparison
 * Claude-style minimal design with left border
 */
export function ComparisonList({
  title,
  description,
  items,
  className = "",
}: ComparisonListProps) {
  if (!items || items.length === 0) {
    return (
      <div className={`text-base text-gray-500 dark:text-gray-400 ${className}`}>
        No items to compare
      </div>
    );
  }

  return (
    <div className={`space-y-4 border-l-2 border-gray-300 dark:border-slate-700 pl-4 py-3 ${className}`}>
      {title && (
        <div className="space-y-1">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            {title}
          </h2>
          {description && (
            <p className="text-base text-gray-600 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
      )}

      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className={`flex gap-4 ${item.highlight ? "bg-gray-50 dark:bg-slate-900/50 p-2" : ""}`}
          >
            <span className="text-gray-500 dark:text-gray-400 font-medium flex-shrink-0 text-sm">
              {item.label}:
            </span>
            <span
              className={`text-base ${
                item.highlight
                  ? "font-medium text-gray-900 dark:text-white"
                  : "text-gray-700 dark:text-gray-300"
              }`}
            >
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ComparisonList;
