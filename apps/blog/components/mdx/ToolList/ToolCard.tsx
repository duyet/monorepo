// Single tool card display component
import { Star } from "lucide-react";
import type { Tool } from "../../blog/types";
import { toolStatusConfig } from "../../../config/status";

interface StarRatingProps {
  rating: number | string;
}

function StarRating({ rating }: StarRatingProps) {
  const ratingNum =
    typeof rating === "string" ? Number.parseFloat(rating) : rating;
  const filledStars = Math.floor(ratingNum);
  const hasHalfStar = ratingNum % 1 !== 0;

  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => {
        const isFilled = i < filledStars;
        const isHalf = i === filledStars && hasHalfStar;
        return (
          <Star
            key={i}
            size={14}
            className={`${
              isFilled || isHalf
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300 dark:text-gray-600"
            }`}
            aria-hidden="true"
          />
        );
      })}
      <span className="text-xs text-gray-600 dark:text-gray-400 ml-1">
        {ratingNum.toFixed(1)}
      </span>
    </div>
  );
}

interface StatusBadgeProps {
  status: Tool["status"];
}

function StatusBadge({ status }: StatusBadgeProps) {
  const config = toolStatusConfig[status];
  const ShapeIcon = config.shape;

  return (
    <div
      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${config.bgColor} ${config.textColor}`}
      role="status"
      aria-label={`Status: ${config.label}`}
    >
      <ShapeIcon size={12} aria-label={config.shapeAriaLabel} />
      <span>{config.label}</span>
    </div>
  );
}

interface ToolCardProps {
  tool: Tool;
}

export function ToolCard({ tool }: ToolCardProps) {
  return (
    <article
      className="flex flex-col gap-3 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg hover:shadow-md dark:hover:shadow-lg hover:shadow-gray-300 dark:hover:shadow-gray-950 transition-shadow duration-200"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm text-gray-900 dark:text-white truncate">
            {tool.name}
          </h3>
        </div>
        <StatusBadge status={tool.status} />
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className="inline-block px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded">
          {tool.category}
        </span>
      </div>

      <StarRating rating={tool.rating} />

      {tool.notes && (
        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
          {tool.notes}
        </p>
      )}

      {tool.dateAdded && (
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-auto">
          Added: {new Date(tool.dateAdded).toLocaleDateString()}
        </p>
      )}
    </article>
  );
}
