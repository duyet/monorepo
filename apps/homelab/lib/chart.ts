import type { CSSProperties } from "react";

export const chartTooltipStyle: CSSProperties = {
  backgroundColor: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  color: "var(--card-foreground)",
  fontSize: 12,
};

export const chartTick = {
  fontSize: 11,
  fill: "var(--muted-foreground)",
};

export const NODE_CHART_KEYS = ["minipc-01", "minipc-02", "minipc-03"] as const;

export const NODE_CHART_COLORS: Record<(typeof NODE_CHART_KEYS)[number], string> = {
  "minipc-01": "#5c58c9",
  "minipc-02": "#2f9a66",
  "minipc-03": "#c48416",
};
