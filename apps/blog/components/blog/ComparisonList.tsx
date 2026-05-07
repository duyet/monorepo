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
      <div
        className={`text-base text-[#1a1a1a]/55 dark:text-[#f8f8f2]/55 ${className}`}
      >
        No items to compare
      </div>
    );
  }

  return (
    <div
      className={`space-y-4 border-l-2 border-[#1a1a1a]/10 dark:border-white/10 pl-4 py-3 ${className}`}
    >
      {title && (
        <div className="space-y-1">
          <h2 className="text-lg font-medium text-[#1a1a1a] dark:text-[#f8f8f2]">
            {title}
          </h2>
          {description && (
            <p className="text-base text-[#1a1a1a]/70 dark:text-[#f8f8f2]/55">
              {description}
            </p>
          )}
        </div>
      )}

      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className={`flex gap-4 ${item.highlight ? "bg-[#f7f7f7] dark:bg-[#1a1a1a]/50 p-2" : ""}`}
          >
            <span className="text-[#1a1a1a]/55 dark:text-[#f8f8f2]/55 font-medium flex-shrink-0 text-sm">
              {item.label}:
            </span>
            <span
              className={`text-base ${
                item.highlight
                  ? "font-medium text-[#1a1a1a] dark:text-[#f8f8f2]"
                  : "text-[#1a1a1a]/70 dark:text-[#f8f8f2]/70"
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
