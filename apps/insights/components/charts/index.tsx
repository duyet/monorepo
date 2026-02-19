import { cn } from "@duyet/libs";

// Export lazy-loaded chart components for better performance
// These lazy versions automatically include loading states
export {
  AreaChart,
  BarChart,
  DonutChart,
  CompactAreaChart,
  CompactBarChart,
  CompactPieChart,
  CompactLineChart,
  MiniSparkline,
} from "./LazyCharts";

// Export non-lazy versions for components that need direct access
export { AreaChart as AreaChartDirect } from "./AreaChart";
export { BarChart as BarChartDirect } from "./BarChart";
export { DonutChart as DonutChartDirect } from "./DonutChart";

// Export other chart components (not lazy-loaded yet)
export { BarList } from "./BarList";
export { LanguageBarChart } from "./LanguageBarChart";
export { TokenBarChart } from "./TokenBarChart";
export { Legend } from "./legend";

// Export CompactChart components for direct access (not lazy)
export {
  CompactAreaChart as CompactAreaChartDirect,
  CompactBarChart as CompactBarChartDirect,
  CompactLineChart as CompactLineChartDirect,
  CompactPieChart as CompactPieChartDirect,
  MiniSparkline as MiniSparklineDirect,
} from "./CompactChart";

interface MetricProps {
  children: React.ReactNode;
  className?: string;
}
interface FlexProps {
  children: React.ReactNode;
  className?: string;
  alignItems?: "center" | "start" | "end" | "baseline";
  justifyContent?: "start" | "center" | "end" | "between";
}

export const Metric = ({ children, className }: MetricProps) => (
  <div className={cn("text-3xl font-bold tracking-tight", className)}>
    {children}
  </div>
);

export const Text = ({ children, className }: MetricProps) => (
  <p className={cn("text-sm text-muted-foreground", className)}>{children}</p>
);

export const Flex = ({
  children,
  className,
  alignItems = "center",
  justifyContent = "start",
}: FlexProps) => {
  const alignMap = {
    center: "items-center",
    start: "items-start",
    end: "items-end",
    baseline: "items-baseline",
  };
  const justifyMap = {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end",
    between: "justify-between",
  };

  return (
    <div
      className={cn(
        "flex",
        alignMap[alignItems],
        justifyMap[justifyContent],
        className
      )}
    >
      {children}
    </div>
  );
};
