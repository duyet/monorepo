import type { ChartConfig } from "@/components/dither-kit/chart-context";

export const NODE_CHART_KEYS = ["minipc-01", "minipc-02", "minipc-03"] as const;

export const NODE_CHART_CONFIG: ChartConfig = {
  "minipc-01": { label: "minipc-01", color: "purple" },
  "minipc-02": { label: "minipc-02", color: "green" },
  "minipc-03": { label: "minipc-03", color: "orange" },
};

export const TRAFFIC_CHART_CONFIG: ChartConfig = {
  in: { label: "In", color: "orange" },
  out: { label: "Out", color: "grey" },
};
