// Unified status configurations for tools
// Extracted from ToolList.tsx and ToolTimeline.tsx

import type { LucideIcon } from "lucide-react";
import { Circle, Square, Triangle } from "lucide-react";

export type ToolStatus = "active" | "testing" | "deprecated";
export type TimelineStatus = "adopted" | "active" | "testing" | "deprecated";

export interface StatusConfig {
  label: string;
  bgColor: string;
  textColor: string;
  symbol: string;
  shape: LucideIcon;
  shapeAriaLabel: string;
}

/**
 * Status configuration for ToolList component
 */
export const toolStatusConfig: Record<ToolStatus, StatusConfig> = {
  active: {
    label: "Active",
    bgColor: "bg-green-100 dark:bg-green-900",
    textColor: "text-green-800 dark:text-green-200",
    symbol: "●",
    shape: Circle,
    shapeAriaLabel: "circle",
  },
  testing: {
    label: "Testing",
    bgColor: "bg-blue-100 dark:bg-blue-900",
    textColor: "text-blue-800 dark:text-blue-200",
    symbol: "■",
    shape: Square,
    shapeAriaLabel: "square",
  },
  deprecated: {
    label: "Deprecated",
    bgColor: "bg-gray-100 dark:bg-gray-700",
    textColor: "text-gray-800 dark:text-gray-200",
    symbol: "▲",
    shape: Triangle,
    shapeAriaLabel: "triangle",
  },
};

/**
 * Status configuration for ToolTimeline component
 */
export const timelineStatusConfig: Record<
  TimelineStatus,
  Omit<StatusConfig, "shape" | "shapeAriaLabel">
> = {
  adopted: {
    label: "Adopted",
    bgColor: "bg-purple-100 dark:bg-purple-900",
    textColor: "text-purple-800 dark:text-purple-200",
    symbol: "✓",
  },
  active: {
    label: "Active",
    bgColor: "bg-green-100 dark:bg-green-900",
    textColor: "text-green-800 dark:text-green-200",
    symbol: "●",
  },
  testing: {
    label: "Testing",
    bgColor: "bg-blue-100 dark:bg-blue-900",
    textColor: "text-blue-800 dark:text-blue-200",
    symbol: "■",
  },
  deprecated: {
    label: "Deprecated",
    bgColor: "bg-gray-100 dark:bg-gray-700",
    textColor: "text-gray-800 dark:text-gray-200",
    symbol: "▲",
  },
};
