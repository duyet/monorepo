import { Circle, Square, Triangle } from "lucide-react";
import type { ToolStatus } from "../blog/types";

const statusConfig = {
  active: {
    label: "Active",
    bgColor: "bg-green-100 dark:bg-green-900",
    textColor: "text-green-800 dark:text-green-200",
    shape: Circle,
    shapeAriaLabel: "circle",
  },
  testing: {
    label: "Testing",
    bgColor: "bg-blue-100 dark:bg-blue-900",
    textColor: "text-blue-800 dark:text-blue-200",
    shape: Square,
    shapeAriaLabel: "square",
  },
  deprecated: {
    label: "Deprecated",
    bgColor: "bg-gray-100 dark:bg-gray-700",
    textColor: "text-gray-800 dark:text-gray-200",
    shape: Triangle,
    shapeAriaLabel: "triangle",
  },
};

interface StatusBadgeProps {
  status: ToolStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
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
